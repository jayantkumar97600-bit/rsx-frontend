import React, { useState } from "react";

export default function BetAmountModal({
  isOpen,
  onClose,
  onConfirm,
  balance = 0,
  betLabel = "Select bet",
  gameLabel = "RSX WINGOD",
  minBet = 1,
  maxBet = 1000000,
}) {
  // Simple hooks only
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) {
    return null;
  }

  const numericAmount = Number(amount || 0);

  const handleQuick = (val) => {
    setError("");
    setAmount(String(val));
  };

  const handleChange = (e) => {
    const clean = e.target.value.replace(/[^\d]/g, "");
    setAmount(clean);
    setError("");
  };

  const handleConfirm = () => {
    setError("");

    if (!numericAmount || numericAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (numericAmount < minBet) {
      setError(`Minimum stake is ₹${minBet}.`);
      return;
    }
    if (numericAmount > maxBet) {
      setError(
        `Maximum stake is ₹${maxBet.toLocaleString("en-IN")}.`
      );
      return;
    }
    if (numericAmount > balance) {
      setError("Insufficient balance for this stake.");
      return;
    }

    onConfirm(numericAmount);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm">
      <div className="w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl bg-slate-950/95 border border-slate-800 shadow-[0_-24px_60px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* HEADER */}
        <div className="px-4 pt-3 pb-2 bg-gradient-to-r from-sky-500/20 via-emerald-500/10 to-purple-500/20 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-sky-300">
                {gameLabel}
              </p>
              <p className="text-sm text-slate-50 font-semibold">
                {betLabel}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[11px] text-slate-300 px-2 py-1 rounded-full bg-slate-900/80 border border-slate-700 hover:border-rose-400 hover:text-rose-300 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="px-4 py-3 space-y-3">
          {/* BALANCE */}
          <div className="flex items-center justify-between text-[11px]">
            <p className="text-slate-400">Available balance</p>
            <p className="text-emerald-300 font-semibold">
              ₹ {Number(balance).toLocaleString("en-IN")}
            </p>
          </div>

          {/* QUICK BUTTONS */}
          <div className="space-y-1">
            <p className="text-[11px] text-slate-300 font-semibold">
              Quick amounts
            </p>
            <div className="flex gap-2">
              {[10, 50, 100, 500, 1000, 5000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuick(val)}
                  className={`flex-1 py-1.5 rounded-2xl text-[11px] font-semibold border ${
                    numericAmount === val
                      ? "bg-sky-500 text-slate-950 border-sky-300 shadow"
                      : "bg-slate-900 text-slate-200 border-slate-700"
                  }`}
                >
                  ₹ {val.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          </div>

          {/* INPUT */}
          <div className="space-y-1">
            <p className="text-[11px] text-slate-300 font-semibold">
              Enter custom amount
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">₹</span>
              <input
                type="text"
                value={amount}
                onChange={handleChange}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-sm outline-none text-slate-100"
                placeholder="Type any amount"
              />
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount("")}
                  className="text-[10px] text-slate-400 px-2 py-1 rounded-full border border-slate-700"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-500">
              Min ₹{minBet} · Max ₹{maxBet.toLocaleString("en-IN")}
            </p>
          </div>

          {/* ERROR / INFO */}
          {error ? (
            <p className="text-[11px] text-rose-300 bg-rose-500/10 border border-rose-500/60 rounded-xl px-3 py-2">
              {error}
            </p>
          ) : (
            <p className="text-[11px] text-emerald-300">
              Total stake: ₹{numericAmount.toLocaleString("en-IN")}
            </p>
          )}
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-sm font-semibold text-slate-200 bg-slate-900/90 border-r border-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 text-sm font-semibold bg-gradient-to-r from-emerald-400 via-yellow-300 to-rose-400 text-slate-950 shadow-lg"
          >
            Confirm trade
          </button>
        </div>
      </div>
    </div>
  );
}
