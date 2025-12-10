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
              ₹ {Number(balance).toLocaleString("en-IN")}
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
                  }}
                  className={`flex-1 py-1.5 rounded-2xl text-[11px] font-semibold border ${
                    activeChip === amt
                      ? "bg-sky-500 text-slate-950 border-sky-300 shadow"
                      : "bg-slate-900 text-slate-200 border-slate-700"
                  }`}
                >
                  ₹ {amt.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          </div>

          {/* MULTIPLIER / QUANTITY */}
          <div className="space-y-1">
            <p className="text-[11px] text-slate-300 font-semibold">
              Quantity (×)
            </p>
            <div className="flex gap-2">
              {MULTIPLIERS.map((mul) => (
                <button
                  key={mul}
                  type="button"
                  onClick={() => setQuantity(mul)}
                  className={`flex-1 py-1.5 rounded-2xl text-[11px] font-semibold border ${
                    !customAmount && quantity === mul
                      ? "bg-emerald-500 text-slate-950 border-emerald-300 shadow"
                      : "bg-slate-900 text-slate-200 border-slate-700"
                  }`}
                >
                  ×{mul}
                </button>
              ))}
            </div>
          </div>

          {/* CUSTOM AMOUNT */}
          <div className="space-y-1">
            <p className="text-[11px] text-slate-300 font-semibold">
              Or enter custom stake
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">₹</span>
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomChange}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-sm outline-none text-slate-100"
                placeholder="Custom amount"
              />
              {customAmount && (
                <button
                  type="button"
                  onClick={() => setCustomAmount("")}
                  className="text-[10px] text-slate-400 px-2 py-1 rounded-full border border-slate-700"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-500">
              If custom filled, quick chips & quantity will auto-adjust.
            </p>
          </div>

          {/* ERROR + INFO */}
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-500">
              Min ₹{minBet} · Max ₹{maxBet.toLocaleString("en-IN")}
            </span>
            {error ? (
              <span className="text-rose-400 font-medium">{error}</span>
            ) : (
              <span className="text-emerald-400 font-semibold">
                Total ₹{(totalAmount || 0).toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* I AGREE */}
          <label className="flex items-center gap-2 text-[10px] text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="w-3 h-3 rounded border border-sky-400 bg-slate-900"
            />
            <span>
              I agree{" "}
              <span className="text-rose-400 font-semibold">
                《Pre-sale rules》
              </span>
            </span>
          </label>
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
            disabled={!!error || totalAmount <= 0}
            onClick={handleConfirm}
            className={`flex-1 py-3 text-sm font-semibold ${
              error || totalAmount <= 0
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-400 via-yellow-300 to-rose-400 text-slate-950 shadow-lg"
            }`}
          >
            Confirm trade
          </button>
        </div>
      </div>
    </div>
  );
}
