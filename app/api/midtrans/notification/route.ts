import { NextRequest, NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../src/firebaseConfig';

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json();
    
    // Verify notification authenticity
    const core = new midtransClient.CoreApi({
      isProduction: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
    });

    const statusResponse = await core.transaction.notification(notification);
    
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);

    // Update payment status based on transaction status
    // NOTE: Booking status remains 'pending' until penjaga confirms
    let bookingStatus: 'confirmed' | 'cancelled' | 'pending' = 'pending';
    let paymentStatus: 'paid' | 'pending' | 'refunded' = 'pending';

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        // Payment success - keep booking pending for penjaga approval
        paymentStatus = 'paid';
      }
    } else if (transactionStatus === 'settlement') {
      // Payment success - keep booking pending for penjaga approval
      paymentStatus = 'paid';
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      bookingStatus = 'cancelled';
      paymentStatus = 'refunded';
    } else if (transactionStatus === 'pending') {
      bookingStatus = 'pending';
      paymentStatus = 'pending';
    }

    // Update booking in Firestore
    const bookingRef = doc(db, 'bookings', orderId);
    await updateDoc(bookingRef, {
      status: bookingStatus,
      paymentStatus: paymentStatus,
      transactionId: statusResponse.transaction_id,
      paymentType: statusResponse.payment_type,
      updatedAt: new Date().toISOString(),
    });

    console.log(`Booking ${orderId} updated: status=${bookingStatus}, payment=${paymentStatus}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Notification processed successfully' 
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process notification', details: error.message },
      { status: 500 }
    );
  }
}
