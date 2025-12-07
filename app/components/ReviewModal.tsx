"use client";

import React, { useState } from "react";
import { createReview } from "../lib/firestore";
import { useAuth } from "../lib/AuthContext";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  courtId: string;
  bookingId: string;
  courtName: string;
  onSuccess: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  courtId,
  bookingId,
  courtName,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError("Anda harus login untuk memberikan review");
      return;
    }

    if (rating === 0) {
      setError("Silakan pilih rating bintang");
      return;
    }

    if (comment.trim().length < 10) {
      setError("Komentar minimal 10 karakter");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createReview(user.uid, {
        courtId,
        bookingId,
        rating,
        comment: comment.trim(),
      });

      onSuccess();
      onClose();
      
      // Reset form
      setRating(0);
      setComment("");
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("Gagal mengirim review. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl transform transition-all animate-slideUp">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Beri Review
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        <p className="text-gray-600 mb-8">
          Bagaimana pengalaman Anda bermain di <span className="font-bold text-gray-900">{courtName}</span>?
        </p>

        <form onSubmit={handleSubmit}>
          {/* Rating Stars */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Rating *
            </label>
            <div className="flex gap-3 justify-center mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-5xl transition-all duration-200 hover:scale-125 active:scale-110"
                >
                  {star <= (hoveredRating || rating) ? (
                    <span className="text-yellow-400 drop-shadow-lg">★</span>
                  ) : (
                    <span className="text-gray-300">☆</span>
                  )}
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center font-semibold text-gray-700">
                {rating === 1 && "😞 Sangat Buruk"}
                {rating === 2 && "😕 Buruk"}
                {rating === 3 && "😐 Cukup"}
                {rating === 4 && "😊 Bagus"}
                {rating === 5 && "🤩 Sangat Bagus"}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Komentar * (min. 10 karakter)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 transition-all resize-none"
              placeholder="Ceritakan pengalaman Anda bermain di lapangan ini..."
              required
            />
            <p className="text-xs text-gray-500 mt-2 text-right">
              {comment.length} / 500 karakter
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "⏳ Mengirim..." : "✓ Kirim Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
