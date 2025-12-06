// src/components/BetAmountModal.jsx
import React, { useState, useMemo, useEffect } from "react";

export default function BetAmountModal({
  isOpen,
  onClose,
  onConfirm,      // (totalAmount) => void
  balance = 0,
  betLabel = "", // "Green", "Red 3", "Small" etc
  gameLabel = "WinGo 30sec",
  minBet = 10,
  maxBet = 100000,
}) {
  const [unitAmount, setUnitAmount] = useState(10);  // Balance chips se
  const [quantity, setQuantity] = useState(1);       // X1, X5, etc
  const [error, setError] = useState("");

  const balanceChips = [1, 10, 100, 1000];          // upar wale buttons
  const quantityMultipliers = [1, 5, 10, 20, 50, 100];

  const totalAmount = useMemo(
    () => unitAmount * quantity,
    [unitAmount, quantity]
  );

  useEffect(() => {
    // Jab bhi modal open ho, reset state
    if (isOpen) {
      setUnitAmount(10);
      setQuantity(1);
      setError("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!totalAmount) {
      setError("");
      return;
    }
    if (totalAmount < minBet) {
      setError(`Min bet ₹${minBet}`);
    } else if (totalAmount > maxBet) {
      setError(`Max bet ₹${maxBet}`);
    } else if (totalAmount > balance) {
      setError("Insufficient balance");
    } else {
      setError("");
    }
  }, [totalAmount, minBet, maxBet, balance]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (error || totalAmount <= 0) return;
    onConfirm(totalAmount);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 sm:items-center">
      {/* Card */}
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-slate-900 overflow-hidden shadow-xl border border-slate-700">
        {/* Header gradient */}
        <div className="bg-gradient-to-b from-sky-500 to-sky-400 px-4 py-3 text-center">
          <p className="text-xs text-slate-100 opacity-80">{gameLabel}</p>
          <p className="mt-1 rounded-xl bg-slate-50/90 text-slate-900 text-sm font-semibold py-1">
            {betLabel || "Select"}
          </p>
        </div>

        {/* Body */}
        <div className="px-4 py-4 space-y-4 bg-slate-900">
          {/* Balance row */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-200">Balance</span>
              <span className="text-xs text-slate-400">
                ₹{balance?.toLocaleString?.() ?? balance}
              </span>
            </div>
            <div className="flex gap-2">
              {balanceChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setUnitAmount(chip)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border 
                  ${
                    unitAmount === chip
                      ? "bg-sky-500 text-white border-sky-400"
                      : "bg-slate-800 text-slate-200 border-slate-600"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity row */}
          <div>
            <p className="text-sm text-slate-200 mb-2">Quantity</p>
            <div className="flex items-center justify-center gap-3 mb-3">
              <button
                type="button"
                onClick={() =>
                  setQuantity((q) => (q > 1 ? q - 1 : 1))
                }
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-xl text-slate-100 border border-slate-600"
              >
                -
              </button>
              <div className="min-w-[64px] h-10 flex items-center justify-center rounded-xl bg-slate-950 text-slate-50 text-base font-semibold border border-sky-500">
                {quantity}
              </div>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-xl text-slate-100 border border-slate-600"
              >
                +
              </button>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {quantityMultipliers.map((mul) => (
                <button
                  key={mul}
                  type="button"
                  onClick={() => setQuantity(mul)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border 
                  ${
                    quantity === mul
                      ? "bg-sky-500 text-white border-sky-400"
                      : "bg-slate-800 text-slate-200 border-slate-600"
                  }`}
                >
                  X{mul}
                </button>
              ))}
            </div>
          </div>

          {/* Error + info */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Min ₹{minBet} • Max ₹{maxBet}
            </span>
            {error ? (
              <span className="text-red-400 font-medium">{error}</span>
            ) : (
              <span className="text-emerald-400">
                Total ₹{totalAmount || 0}
              </span>
            )}
          </div>

          {/* "I agree" row (optional) */}
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <button
              type="button"
              className="w-4 h-4 rounded-full border border-sky-400 bg-sky-500 flex items-center justify-center"
            >
              <div className="w-2 h-2 rounded-full bg-white" />
            </button>
            <span>
              I agree{" "}
              <span className="text-red-400 font-semibold">
                《Pre-sale rules》
              </span>
            </span>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-sm font-semibold text-slate-200 bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!!error || totalAmount <= 0}
            onClick={handleConfirm}
            className={`flex-1 py-3 text-sm font-semibold ${
              error || totalAmount <= 0
                ? "bg-slate-600 text-slate-300"
                : "bg-sky-500 text-white"
            }`}
          >
            Total amount ₹{totalAmount || 0}
          </button>
        </div>
      </div>
    </div>
  );
}
