import React, { useMemo, useState } from "react";

const QUICK_AMOUNTS = [1, 10, 100, 1000, 5000];
const MULTIPLIERS = [1, 5, 10, 20, 50, 100];

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
  const [unitAmount, setUnitAmount] = useState(10);
  const [quantity, setQuantity] = useState(1);
  const [customAmount, setCustomAmount] = useState("");
  const [agree, setAgree] = useState(true);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const totalAmount = useMemo(() => {
    const custom = Number(customAmount);
    if (!Number.isNaN(custom) && custom > 0) {
      return Math.floor(custom);
    }
    return unitAmount * quantity;
  }, [unitAmount, quantity, customAmount]);

  const handleConfirm = () => {
    setError("");

    if (!agree) {
      setError("Please accept the rules before placing a trade.");
      return;
    }

    if (!totalAmount || totalAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    if (totalAmount < minBet) {
      setError(`Minimum stake is ₹${minBet}.`);
      return;
    }

    if (totalAmount > maxBet) {
      setError(`Maximum stake is ₹${maxBet.toLocaleString("en-IN")}.`);
      return;
    }

    if (totalAmount > balance) {
      setError("Insufficient balance for this stake.");
      return;
    }

    onConfirm(totalAmount);
  };

  const handleCustomChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setCustomAmount(value);
  };

  const activeChip = useMemo(() => {
    if (customAmount) return null;
    return unitAmount;
  }, [unitAmount, customAmount]);

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
              ₹ {balance.toLocaleString("en-IN")}
            </p>
          </div>

          {/* QUICK CHIPS */}
          <div className="space-y-1">
            <p className="text-[11px] text-slate-300 font-semibold">
              Quick chips
            </p>
            <div className="flex gap-2">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setUnitAmount(amt);
                    if (!customAmount) {
                      setQuantity(1);
                    }
                    setCustomAmount("");
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-medium border ${
                    activeChip === amt
                      ? "bg-sky-500 text-slate-950 border-sky-300 shadow"
                      : "bg-slate-900 border-slate-700 text-slate-200"
                  }`}
                >
                  ₹ {amt.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          </div>

          {/* QUANTITY */}
          <div className="space-y-1">
            <p className="text-[11px] text-slate-300 font-semibold">
              Quantity / multiplier
            </p>
            <div className="flex gap-2">
              {MULTIPLIERS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setQuantity(m);
                    setCustomAmount("");
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-medium border ${
                    !customAmount && quantity === m
                      ? "bg-emerald-500 text-slate-950 border-emerald-300 shadow"
                      : "bg-slate-900 border-slate-700 text-slate-200"
                  }`}
                >
                  x{m}
                </button>
              ))}
            </div>
          </div>

          {/* CUSTOM AMOUNT */}
          <div className="space-y-1">
            <p className="text-[11px] text-slate-300 font-semibold">
              Or enter custom amount
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-1 rounded-2xl bg-slate-900 border border-slate-700 px-3 py-2">
                <span className="text-[11px] text-slate-400">₹</span>
                <input
                  value={customAmount}
                  onChange={handleCustomChange}
                  inputMode="numeric"
                  placeholder="Any amount"
                  className="flex-1 bg-transparent outline-none text-[13px] text-slate-50 placeholder:text-slate-500"
                />
              </div>
              <button
                type="button"
                onClick={() => setCustomAmount("")}
                className="text-[10px] px-2 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300"
              >
                Clear
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              Min ₹{minBet} · Max ₹{maxBet.toLocaleString("en-IN")}
            </p>
          </div>

          {/* SUMMARY */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-700 px-3 py-2 flex items-center justify-between text-[11px]">
            <div>
              <p className="text-slate-400">Total stake</p>
              <p className="text-sm text-emerald-300 font-semibold">
                ₹ {totalAmount.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="text-right text-[10px] text-slate-500">
              <p>
                Chips: ₹{unitAmount} × {quantity}
              </p>
              {customAmount && <p>Custom overrides chips</p>}
            </div>
          </div>

          {/* AGREEMENT */}
          <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
            <button
              type="button"
              onClick={() => setAgree((a) => !a)}
              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                agree
                  ? "border-sky-400 bg-sky-500"
                  : "border-slate-600 bg-slate-900"
              }`}
            >
              {agree && <span className="text-[10px] text-slate-950">✓</span>}
            </button>
            <span>
              I understand this is a{" "}
              <span className="text-sky-300">virtual prediction game</span>.
            </span>
          </label>

          {error && (
            <p className="text-[11px] text-rose-300 bg-rose-500/10 border border-rose-500/60 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-[13px] font-medium bg-slate-900/90 text-slate-200 border-t border-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 text-[13px] font-semibold bg-gradient-to-r from-emerald-400 via-sky-400 to-amber-300 text-slate-950 border-t border-emerald-400 shadow-[0_-6px_25px_rgba(34,197,94,0.7)]"
          >
            Confirm trade
          </button>
        </div>
      </div>
    </div>
  );
}
