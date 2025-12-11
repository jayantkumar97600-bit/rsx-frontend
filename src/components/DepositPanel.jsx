import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

/**
 * DepositPanel (Premium RSX style)
 * Props:
 *  - token (optional)
 *  - onDepositSuccess(data) (callback)
 */

const UPI_ID = "843973600@ybl"; // <-- REPLACE with your UPI
const UPI_NAME = "RSX WINGOD";
const [reference, setReference] = useState("");


function makeUpiUrl(pa, pn, am) {
  const paEnc = encodeURIComponent(pa);
  const pnEnc = encodeURIComponent(pn);
  const amEnc = encodeURIComponent(String(am));
  return `upi://pay?pa=${paEnc}&pn=${pnEnc}&am=${amEnc}&cu=INR`;
}

export default function DepositPanel({ token, onDepositSuccess }) {
  const [amount, setAmount] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [utr, setUtr] = useState("");
  const [showCheck, setShowCheck] = useState(false);
  const toastRef = useRef(null);

  useEffect(() => {
    if (!amount || Number(amount) <= 0) {
      setQrDataUrl("");
      return;
    }
    const upi = makeUpiUrl(UPI_ID, UPI_NAME, amount);
    QRCode.toDataURL(upi, { margin: 2, width: 520 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [amount]);

  useEffect(() => {
    if (!proofFile) {
      setProofPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setProofPreview(e.target.result);
    reader.readAsDataURL(proofFile);
  }, [proofFile]);

  const showToast = (t) => {
    setMessage(t);
    setShowCheck(true);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => {
      setShowCheck(false);
      setMessage("");
    }, 2200);
  };

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      showToast("UPI copied to clipboard");
    } catch (e) {
      showToast("Copy failed — long press to copy");
    }
  };

  const handleIntentPay = () => {
    if (!amount || Number(amount) <= 0) {
      showToast("Enter a valid amount");
      return;
    }
    const upiUrl = makeUpiUrl(UPI_ID, UPI_NAME, amount);
    // opens installed UPI apps
    window.location.href = upiUrl;
  };

  const handleSubmitProof = async () => {
    if (!amount || Number(amount) <= 0) {
      showToast("Enter the deposit amount first");
      return;
    }
    if (!utr && !proofFile) {
      showToast("Provide UTR or upload screenshot");
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("amount", amount);
      form.append("reference", reference || "");

      if (proofFile) form.append("proof", proofFile);

      const res = await fetch("/api/deposit/initiate", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Deposit recorded — pending verification");
        setAmount("");
        setUtr("");
        setProofFile(null);
        setProofPreview(null);
        onDepositSuccess && onDepositSuccess(data);
      } else {
        showToast(data?.message || "Failed to record deposit");
      }
    } catch (e) {
      showToast("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="deposit-hero p-4 rounded-3xl bg-gradient-to-br from-slate-900/80 to-slate-950/90 border border-slate-800 shadow-[0_20px_60px_rgba(2,6,23,0.8)]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-amber-300 font-semibold uppercase">Deposit</p>
          <h3 className="text-lg font-extrabold text-white">Instant UPI — Scan or Pay</h3>
        </div>
        <div className="text-sm text-slate-300">Secure · Manual verify</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* LEFT: amount + quick presets */}
        <div className="col-span-1 bg-slate-900/70 rounded-2xl p-3 border border-slate-800">
          <label className="text-xs text-slate-400">Amount (₹)</label>
          <input
            type="number"
            className="mt-2 w-full rounded-xl px-3 py-2 bg-slate-800 border border-slate-700 text-white"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div className="mt-3 flex gap-2 flex-wrap">
            {[10,50,100,200,500,1000].map(a => (
              <button
                key={a}
                onClick={() => setAmount(String(a))}
                className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-sm"
              >
                ₹{a}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <div className="text-[11px] text-slate-400">UPI</div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white select-all">
                {UPI_ID}
              </div>
              <button onClick={handleCopyUPI} className="px-3 py-1 rounded-lg bg-emerald-400 text-slate-900 font-semibold">Copy</button>
            </div>

            <button
              onClick={handleIntentPay}
              className="mt-3 w-full px-3 py-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 font-semibold text-slate-950 shadow hover:scale-[1.01] transition"
            >
              Pay via UPI
            </button>
          </div>
        </div>

        {/* MID: QR */}
        <div className="col-span-1 md:col-span-1 bg-gradient-to-br from-slate-900/70 to-slate-950/60 rounded-2xl p-3 border border-slate-800 flex flex-col items-center justify-center">
          <div className="rounded-lg overflow-hidden border border-slate-700 bg-black">
            {qrDataUrl ? (
              <img src={qrDataUrl} className="w-64 h-64 object-cover" alt="UPI QR" />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-slate-500">Enter amount</div>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">Scan QR with UPI app or use Pay via UPI</p>
        </div>

        {/* RIGHT: proof and submit */}
        <div className="col-span-1 bg-slate-900/70 rounded-2xl p-3 border border-slate-800">
          <label className="text-xs text-slate-400">Upload proof / UTR</label>
          <input
            type="text"
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
            placeholder="Transaction UTR (optional)"
            className="mt-2 w-full rounded-xl px-3 py-2 bg-slate-800 border border-slate-700 text-white"
          />

          <div className="mt-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              className="text-sm text-slate-300"
            />
            {proofPreview && (
              <img src={proofPreview} alt="proof preview" className="mt-3 w-full rounded-xl border border-slate-700" />
            )}
          </div>

          <button
            onClick={handleSubmitProof}
            disabled={loading}
            className="mt-4 w-full px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-rose-400 text-slate-900 font-semibold shadow"
          >
            {loading ? "Submitting..." : "Submit proof"}
          </button>

          <p className="text-xs text-slate-400 mt-3">After payment, paste UTR or upload screenshot. Admin will verify and credit balance.</p>
        </div>
      </div>

      {/* toast */}
      {showCheck && (
        <div className="mt-3 text-sm text-white px-3 py-2 rounded-lg bg-slate-800 border border-slate-700">
          {message}
        </div>
      )}
    </div>
  );
}
