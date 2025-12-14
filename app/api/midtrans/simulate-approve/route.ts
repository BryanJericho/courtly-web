import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../src/firebaseConfig';

// Endpoint untuk simulasi auto-approve payment di sandbox mode
export async function POST(request: NextRequest) {
  try {
    // Only allow in development/sandbox mode
    if (process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true') {
      return NextResponse.json(
        { error: 'This endpoint is only available in sandbox mode' },
        { status: 403 }
      );
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    console.log(`[SANDBOX] Auto-approving payment for order: ${orderId}`);

    // Update payment status to paid, but keep booking status as pending (waiting for penjaga approval)
    const bookingRef = doc(db, 'bookings', orderId);
    await updateDoc(bookingRef, {
      paymentStatus: 'paid',
      transactionId: `SANDBOX-${Date.now()}`,
      paymentType: 'qris',
      updatedAt: new Date().toISOString(),
    });

    console.log(`[SANDBOX] Successfully approved payment for order: ${orderId} - Waiting for penjaga confirmation`);

    return NextResponse.json({
      success: true,
      message: 'Payment auto-approved in sandbox mode',
      orderId,
    });
  } catch (error: any) {
    console.error('[SANDBOX] Auto-approve error:', error);
    return NextResponse.json(
      { error: 'Failed to auto-approve payment', details: error.message },
      { status: 500 }
    );
  }
}
