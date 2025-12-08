import { useEffect, useState, useRef } from "react";
import BetAmountModal from "./components/BetAmountModal"; // path adjust karo agar alag ho

export const API_BASE = "https://stormy-roz-rsxbackend-9574b2c9.koyeb.app";


const MERCHANT_UPI = "843973600@ybl"; // yahan apni UPI ID daal
const MERCHANT_NAME = "RSX WINGOD";     // naam jo UPI me dikhe




const COLORS = [
  {
    id: "G",
    name: "Green",
    multiplier: 2.0,
    className:
      "bg-emerald-500/90 shadow-emerald-500/40 hover:shadow-emerald-500/70",
  },
  {
    id: "V",
    name: "Violet",
    multiplier: 2.0,
    className:
      "bg-indigo-500/90 shadow-indigo-500/40 hover:shadow-indigo-500/70",
  },
  {
    id: "R",
    name: "Red",
    multiplier: 2.0,
    className: "bg-rose-500/90 shadow-rose-500/40 hover:shadow-rose-500/70",
  },
];

const BET_AMOUNTS = [10, 50, 100, 500];

const GAME_TYPES = [
  { id: "30s", label: "30 sec", seconds: 30 },
  { id: "60s", label: "1 min", seconds: 60 },
  { id: "180s", label: "3 min", seconds: 180 },
  { id: "300s", label: "5 min", seconds: 300 },
];

const SIZE_OPTIONS = [
  { id: "SMALL", label: "Small (0–4)" },
  { id: "BIG", label: "Big (5–9)" },
];

const NUMBER_OPTIONS = Array.from({ length: 10 }).map((_, i) => i);

/* ======================================================================
   AUTH SCREEN
====================================================================== */

/* ======================================================================
   AUTH SCREEN (Mobile + Password)
====================================================================== */

function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [loginId, setLoginId] = useState(""); // mobile ya username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!loginId || !password) {
      setError("Mobile number and password required");
      return;
    }

    if (mode === "register" && loginId.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setLoading(true);
      const body =
        mode === "login"
          ? {
              mobile: loginId,
              username: loginId,
              password,
            }
          : {
              username: loginId,
              mobile: loginId,
              password,
              referralCode: referralCode || undefined,
            };

      const res = await fetch(`${API_BASE}/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      localStorage.setItem("gw_token", data.token);
      onAuthSuccess(data.user, data.token);
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-root-bg">
      <div className="app-card-glass">
        {/* TOP BRAND STRIP */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-800/60 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900/80 border border-sky-500/60 flex items-center justify-center overflow-hidden shadow-[0_0_25px_rgba(56,189,248,0.4)]">
              <img
                src="/images/rsx-logo.jpg"
                alt="RSX"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/rsx-logo.png";
                }}
              />
            </div>
            <div>
              <p className="rsx-section-title">RSX WINGOD</p>
              <h1 className="text-[20px] font-semibold tracking-wide">
                Online Trading & Color Engine
              </h1>
            </div>
          </div>
          <div className="text-right text-[10px] text-slate-400">
            <p>Secured by Razorpay</p>
            <p className="text-emerald-300 font-semibold">Instant Wallet</p>
          </div>
        </div>

        {/* BODY */}
        <div className="px-5 pb-5 pt-4 space-y-4">
          {/* Mode toggle */}
          <div className="flex bg-slate-900 rounded-full p-1 text-[11px] border border-slate-700/80">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-1.5 rounded-full transition ${
                mode === "login"
                  ? "bg-gradient-to-r from-sky-500 to-emerald-400 text-slate-950 font-semibold shadow-[0_0_18px_rgba(56,189,248,0.6)]"
                  : "text-slate-400"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 py-1.5 rounded-full transition ${
                mode === "register"
                  ? "bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-semibold shadow-[0_0_18px_rgba(248,250,252,0.5)]"
                  : "text-slate-400"
              }`}
            >
              Create account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 text-[13px]">
            <div className="space-y-1">
              <p className="text-[11px] text-slate-300">
                Mobile number / Username
              </p>
              <input
                placeholder={
                  mode === "login"
                    ? "Enter registered mobile or username"
                    : "Enter 10-digit mobile (one account per number)"
                }
                className="w-full bg-slate-950/80 px-3 py-2.5 rounded-xl border border-slate-700 outline-none text-[13px] placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/60"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                autoComplete="off"
                inputMode="tel"
              />
            </div>

            <div className="space-y-1">
              <p className="text-[11px] text-slate-300">Password</p>
              <input
                type="password"
                placeholder="Set a strong password"
                className="w-full bg-slate-950/80 px-3 py-2.5 rounded-xl border border-slate-700 outline-none text-[13px] placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/60"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {mode === "register" && (
              <div className="space-y-1">
                <p className="text-[11px] text-slate-300">
                  Referral code{" "}
                  <span className="text-slate-500">(optional)</span>
                </p>
                <input
                  placeholder="Enter code if someone invited you"
                  className="w-full bg-slate-950/80 px-3 py-2.5 rounded-xl border border-slate-700 outline-none text-[13px] placeholder:text-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.trim())}
                />
              </div>
            )}

            {error && (
              <p className="text-[11px] text-rose-300 bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/60">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-1 rounded-2xl font-semibold text-[13px] bg-gradient-to-r from-emerald-400 via-sky-400 to-amber-300 text-slate-950 shadow-[0_10px_35px_rgba(34,197,94,0.6)] disabled:opacity-60 disabled:shadow-none"
            >
              {loading
                ? "Authorising..."
                : mode === "login"
                ? "Login securely"
                : "Register & login"}
            </button>
          </form>

          {/* Trust row */}
          <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-300">
            <div className="rsx-chip border-emerald-400/60 text-emerald-300 bg-emerald-500/10">
              <span>🛡️</span>
              <span>Secure wallet</span>
            </div>
            <div className="rsx-chip border-sky-400/60 text-sky-300 bg-sky-500/10">
              <span>⚡</span>
              <span>Fast rounds</span>
            </div>
            <div className="rsx-chip border-amber-400/60 text-amber-300 bg-amber-500/10">
              <span>🎁</span>
              <span>Referral bonus</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 text-center">
            RSX WINGOD is a <span className="text-slate-200">virtual game</span>{" "}
            platform. Play responsibly. No guaranteed returns.
          </p>
        </div>
      </div>
    </div>
  );
}



/* ======================================================================
   ADMIN PANEL
====================================================================== */

/* ======================================================================
   ADMIN PANEL (Users + Deposits + Withdrawals)
====================================================================== */

/* ======================================================================
   ADMIN PANEL (Users + Deposits + Withdrawals + Game Control)
====================================================================== */

function AdminPanel({ token, onClose }) {
  const [activeTab, setActiveTab] = useState("users"); // 'users' | 'deposits' | 'withdrawals' | 'game'

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersErr, setUsersErr] = useState("");
  const [adjustingId, setAdjustingId] = useState(null);
  const [blockingId, setBlockingId] = useState(null);

  const [deposits, setDeposits] = useState([]);
  const [depositsLoading, setDepositsLoading] = useState(true);
  const [depositsErr, setDepositsErr] = useState("");
  const [updatingDepositId, setUpdatingDepositId] = useState(null);

  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);
  const [withdrawalsErr, setWithdrawalsErr] = useState("");
  const [updatingWithdrawalId, setUpdatingWithdrawalId] = useState(null);

  // GAME CONTROL
  const [gameType, setGameType] = useState("30s");
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [customPeriod, setCustomPeriod] = useState("");
  const [periodStats, setPeriodStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsErr, setStatsErr] = useState("");
  const [resultNumberInput, setResultNumberInput] = useState("");


  const [riskConfig, setRiskConfig] = useState({
    profitMode: true,
    newUserBoost: true,
    withdrawalRisk: true,
    bigBetRisk: true,
  });
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskSaving, setRiskSaving] = useState(false);

  const [settingResult, setSettingResult] = useState(false);

  const [resultColorInput, setResultColorInput] = useState("AUTO");
  const [resultSizeInput, setResultSizeInput] = useState("AUTO");


  useEffect(() => {
    loadUsers();
    loadDeposits();
    loadWithdrawals();
    loadRiskConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- USERS ---------------- */

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersErr("");
      const res = await fetch(`${API_BASE}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setUsersErr(data.message || "Failed to load users");
        setUsersLoading(false);
        return;
      }

      setUsers(data);
    } catch (e) {
      console.error(e);
      setUsersErr("Network error");
    } finally {
      setUsersLoading(false);
    }
  };

  const adjustBalance = async (userId, amount) => {
    try {
      setAdjustingId(userId);
      const res = await fetch(`${API_BASE}/api/auth/admin/adjust-balance`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          amount: Math.abs(amount),
          type: amount > 0 ? "credit" : "debit",
        }),
      });

      const data = await res.json();
      setAdjustingId(null);

      if (!res.ok) {
        alert(data.message || "Failed to adjust balance");
        return;
      }

      loadUsers();
    } catch (e) {
      console.error(e);
      alert("Network error");
      setAdjustingId(null);
    }
  };

  const toggleBlock = async (userId, block) => {
    try {
      setBlockingId(userId);
      const res = await fetch(`${API_BASE}/api/auth/admin/toggle-block`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, block }),
      });

      const data = await res.json();
      setBlockingId(null);

      if (!res.ok) {
        alert(data.message || "Failed to update status");
        return;
      }

      loadUsers();
    } catch (e) {
      console.error(e);
      alert("Network error");
      setBlockingId(null);
    }
  };



  const loadRiskConfig = async () => {
    try {
      setRiskLoading(true);
      const res = await fetch(`${API_BASE}/api/game/admin/config`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Risk config load error", data);
        return;
      }
      setRiskConfig({
        profitMode: !!data.profitMode,
        newUserBoost: !!data.newUserBoost,
        withdrawalRisk: !!data.withdrawalRisk,
        bigBetRisk: !!data.bigBetRisk,
      });
    } catch (e) {
      console.error("Risk config load error", e);
    } finally {
      setRiskLoading(false);
    }
  };

  const saveRiskConfig = async () => {
    try {
      setRiskSaving(true);
      const res = await fetch(`${API_BASE}/api/game/admin/config`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(riskConfig),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to update risk engine config");
        return;
      }
      alert("Risk engine switches updated.");
    } catch (e) {
      console.error("Risk config save error", e);
      alert("Network error while saving risk config.");
    } finally {
      setRiskSaving(false);
    }
  };



  /* ---------------- DEPOSITS ---------------- */

  const loadDeposits = async () => {
    try {
      setDepositsLoading(true);
      setDepositsErr("");
      const res = await fetch(`${API_BASE}/api/wallet/admin/deposit`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setDepositsErr(data.message || "Failed to load deposits");
        setDepositsLoading(false);
        return;
      }

      setDeposits(data);
    } catch (e) {
      console.error("Admin deposit list error", e);
      setDepositsErr("Network error");
    } finally {
      setDepositsLoading(false);
    }
  };

  const updateDepositStatus = async (id, status) => {
    if (!window.confirm(`Set deposit #${id} as ${status}?`)) return;

    try {
      setUpdatingDepositId(id);
      const res = await fetch(
        `${API_BASE}/api/wallet/admin/deposit/${id}/status`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();
      setUpdatingDepositId(null);

      if (!res.ok) {
        alert(data.message || "Failed to update deposit status");
        return;
      }

      loadDeposits();
      loadUsers(); // balance change ho sakta hai
    } catch (e) {
      console.error("Admin deposit status error", e);
      alert("Network error updating deposit status");
      setUpdatingDepositId(null);
    }
  };

  /* ---------------- WITHDRAWALS ---------------- */

  const loadWithdrawals = async () => {
    try {
      setWithdrawalsLoading(true);
      setWithdrawalsErr("");
      const res = await fetch(`${API_BASE}/api/wallet/admin/withdraw`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setWithdrawalsErr(data.message || "Failed to load withdrawals");
        setWithdrawalsLoading(false);
        return;
      }

      setWithdrawals(data);
    } catch (e) {
      console.error("Admin withdraw list error", e);
      setWithdrawalsErr("Network error");
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  const updateWithdrawalStatus = async (id, status) => {
    if (!window.confirm(`Set withdrawal #${id} as ${status}?`)) return;

    try {
      setUpdatingWithdrawalId(id);
      const res = await fetch(
        `${API_BASE}/api/wallet/admin/withdraw/${id}/status`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();
      setUpdatingWithdrawalId(null);

      if (!res.ok) {
        alert(data.message || "Failed to update withdrawal status");
        return;
      }

      loadWithdrawals();
      loadUsers(); // refund par balance change
    } catch (e) {
      console.error("Admin withdraw status error", e);
      alert("Network error updating withdrawal status");
      setUpdatingWithdrawalId(null);
    }
  };

  /* ---------------- GAME CONTROL ---------------- */

  const fetchCurrentPeriod = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/game/current?gameType=${encodeURIComponent(gameType)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to load current period");
        return;
      }
      setCurrentPeriod(data.period);
      setCustomPeriod(data.period);
    } catch (e) {
      console.error("Current period error", e);
      alert("Network error while fetching period");
    }
  };

  const loadPeriodStats = async () => {
    const period = customPeriod || currentPeriod;
    if (!period) {
      alert("Set a period first.");
      return;
    }

    try {
      setStatsLoading(true);
      setStatsErr("");
      setPeriodStats([]);

      const url = `${API_BASE}/api/game/admin/period-stats?gameType=${encodeURIComponent(
        gameType
      )}&period=${encodeURIComponent(period)}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        setStatsErr(data.message || "Failed to load stats");
        return;
      }

      setPeriodStats(data);
    } catch (e) {
      console.error("Period stats error", e);
      setStatsErr("Network error while loading stats");
    } finally {
      setStatsLoading(false);
    }
  };

  const setManualResult = async () => {
    const period = customPeriod || currentPeriod;
    if (!period) {
      alert("Set a period first.");
      return;
    }

    const num = Number(resultNumberInput);
    if (Number.isNaN(num) || num < 0 || num > 9) {
      alert("Result number must be between 0 and 9.");
      return;
    }

    if (
      !window.confirm(
        `Set result for ${gameType} – ${period} as number ${num}?`
      )
    ) {
      return;
    }

    // 🔧 payload bana rahe – optional color/size only if not AUTO
    const payload = {
      gameType,
      period,
      resultNumber: num,
    };

    if (resultColorInput !== "AUTO") {
      payload.resultColor = resultColorInput; // "G", "R", "V"
    }

    if (resultSizeInput !== "AUTO") {
      payload.resultSize = resultSizeInput; // "SMALL" / "BIG"
    }

    try {
      setSettingResult(true);
      const res = await fetch(`${API_BASE}/api/game/admin/set-result`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to set result");
        setSettingResult(false);
        return;
      }

      alert(
        `Result set: period ${data.period} → number ${data.resultNumber}, color ${data.resultColor}, size ${data.resultSize}`
      );
    } catch (e) {
      console.error("Set result error", e);
      alert("Network error while setting result");
    } finally {
      setSettingResult(false);
    }
  };


  const renderBetValueLabel = (kind, value) => {
    if (kind === "color") {
      if (value === "G") return "Green";
      if (value === "R") return "Red";
      if (value === "V") return "Violet";
      return value;
    }
    if (kind === "size") {
      if (value === "SMALL") return "Small (0–4)";
      if (value === "BIG") return "Big (5–9)";
      return value;
    }
    if (kind === "number") {
      return `Number ${value}`;
    }
    return value;
  };

  /* ---------------- UI HELPERS ---------------- */

  const renderStatusPill = (status) => {
    const base =
      "px-2 py-[2px] rounded-full text-[10px] border inline-flex items-center justify-center";
    if (status === "PENDING")
      return (
        <span
          className={`${base} bg-yellow-500/10 text-yellow-300 border-yellow-400/70`}
        >
          Pending
        </span>
      );
    if (status === "APPROVED" || status === "PAID")
      return (
        <span
          className={`${base} bg-emerald-500/10 text-emerald-300 border-emerald-400/70`}
        >
          {status === "PAID" ? "Paid" : "Approved"}
        </span>
      );
    if (status === "REJECTED")
      return (
        <span
          className={`${base} bg-rose-500/10 text-rose-300 border-rose-400/70`}
        >
          Rejected
        </span>
      );
    return (
      <span className={`${base} bg-slate-700/60 text-slate-200 border-slate-500`}>
        {status}
      </span>
    );
  };

  const formatDateTime = (iso) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return iso;
    }
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-3 z-50">
      <div className="w-full max-w-2xl bg-slate-900 rounded-2xl p-4 border border-slate-700 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-white text-sm font-semibold">
              Admin Control Center
            </h2>
            <p className="text-[11px] text-slate-400">
              Manage users, deposits, withdrawals & live game
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[11px] px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600"
          >
            Close
          </button>
        </div>

        {/* Tabs */}
        <div className="flex text-[11px] mb-3 bg-slate-800 rounded-full p-1">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 py-1.5 rounded-full ${
              activeTab === "users"
                ? "bg-slate-900 text-slate-50"
                : "text-slate-400"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("deposits")}
            className={`flex-1 py-1.5 rounded-full ${
              activeTab === "deposits"
                ? "bg-slate-900 text-slate-50"
                : "text-slate-400"
            }`}
          >
            Deposits
          </button>
          <button
            onClick={() => setActiveTab("withdrawals")}
            className={`flex-1 py-1.5 rounded-full ${
              activeTab === "withdrawals"
                ? "bg-slate-900 text-slate-50"
                : "text-slate-400"
            }`}
          >
            Withdrawals
          </button>
          <button
            onClick={() => setActiveTab("game")}
            className={`flex-1 py-1.5 rounded-full ${
              activeTab === "game"
                ? "bg-slate-900 text-slate-50"
                : "text-slate-400"
            }`}
          >
            Game Control
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* USERS TAB */}
          {activeTab === "users" && (
            <div className="flex flex-col h-full">
              {usersLoading ? (
                <p className="text-slate-400 text-xs">Loading users</p>
              ) : usersErr ? (
                <p className="text-red-400 text-xs">{usersErr}</p>
              ) : users.length === 0 ? (
                <p className="text-slate-400 text-xs">No users found.</p>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-auto pr-1 text-[11px]">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="bg-slate-800 p-3 rounded-xl border border-slate-700"
                    >
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="text-sm text-white">{u.username}</p>
                          <p className="text-[11px] text-slate-400">
                            Role:{" "}
                            <span
                              className={
                                u.role === "admin"
                                  ? "text-emerald-300"
                                  : "text-slate-200"
                              }
                            >
                              {u.role}
                            </span>
                          </p>
                          {u.id !== "999" ? (
                            <>
                              <p className="text-[11px] text-slate-400">
                                Status:{" "}
                                <span
                                  className={
                                    u.isBlocked
                                      ? "text-rose-400 font-semibold"
                                      : "text-emerald-300"
                                  }
                                >
                                  {u.isBlocked ? "Blocked" : "Active"}
                                </span>
                              </p>
                              {u.customerId && (
                                <p className="text-[11px] text-slate-400">
                                  ID:{" "}
                                  <span className="text-sky-300">
                                    {u.customerId}
                                  </span>
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-[11px] text-slate-500">
                              Dev superadmin (virtual only)
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-[11px] text-slate-400">Balance</p>
                          <p className="text-[13px] text-emerald-300 font-semibold">
                            ₹ {u.balance}
                          </p>
                        </div>
                      </div>

                      {u.id !== "999" && (
                        <>
                          <div className="flex items-center justify-between mt-2 text-[10px] text-slate-300">
                            <span>Quick adjust:</span>
                            <div className="flex gap-1">
                              <button
                                disabled={adjustingId === u.id}
                                onClick={() => adjustBalance(u.id, -100)}
                                className="px-2 py-1 rounded-full bg-slate-900 border border-rose-400 text-rose-300 disabled:opacity-50"
                              >
                                -100
                              </button>
                              <button
                                disabled={adjustingId === u.id}
                                onClick={() => adjustBalance(u.id, -500)}
                                className="px-2 py-1 rounded-full bg-slate-900 border border-rose-400 text-rose-300 disabled:opacity-50"
                              >
                                -500
                              </button>
                              <button
                                disabled={adjustingId === u.id}
                                onClick={() => adjustBalance(u.id, 100)}
                                className="px-2 py-1 rounded-full bg-slate-900 border border-emerald-400 text-emerald-300 disabled:opacity-50"
                              >
                                +100
                              </button>
                              <button
                                disabled={adjustingId === u.id}
                                onClick={() => adjustBalance(u.id, 500)}
                                className="px-2 py-1 rounded-full bg-slate-900 border border-emerald-400 text-emerald-300 disabled:opacity-50"
                              >
                                +500
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-2 text-[10px] text-slate-300">
                            <span>Account status:</span>
                            <button
                              disabled={blockingId === u.id}
                              onClick={() => toggleBlock(u.id, !u.isBlocked)}
                              className={`px-3 py-1 rounded-full border text-[10px] disabled:opacity-50 ${
                                u.isBlocked
                                  ? "bg-emerald-500/10 border-emerald-400 text-emerald-300"
                                  : "bg-rose-500/10 border-rose-400 text-rose-300"
                              }`}
                            >
                              {u.isBlocked ? "Unblock" : "Block"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-3 text-[10px] text-slate-500">
                Blocking a user stops them from logging in. Balances and
                status are stored in MongoDB.
              </p>
            </div>
          )}

          {/* DEPOSITS TAB */}
          {activeTab === "deposits" && (
            <div className="flex flex-col h-full text-[11px]">
              {depositsLoading ? (
                <p className="text-slate-400 text-xs">Loading deposits</p>
              ) : depositsErr ? (
                <p className="text-red-400 text-xs">{depositsErr}</p>
              ) : deposits.length === 0 ? (
                <p className="text-slate-400 text-xs">No deposit requests.</p>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
                  {deposits.map((d) => (
                    <div
                      key={d.id}
                      className="bg-slate-800 p-3 rounded-xl border border-slate-700"
                    >
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="text-slate-100">
                            {d.user?.username || "Unknown user"}
                          </p>
                          <p className="text-slate-400">
                            ID:{" "}
                            <span className="text-sky-300">
                              {d.user?.customerId || "-"}
                            </span>
                          </p>
                          <p className="text-slate-400 mt-1">
                            Amount:{" "}
                            <span className="text-emerald-300 font-semibold">
                              ₹{d.amount}
                            </span>
                          </p>
                          <p className="text-slate-400">
                            Method:{" "}
                            <span className="text-slate-200">{d.method}</span>
                          </p>
                          {d.upiId && (
                            <p className="text-slate-400">
                              UPI:{" "}
                              <span className="text-sky-300">{d.upiId}</span>
                            </p>
                          )}
                          {d.reference && (
                            <p className="text-slate-400">
                              Ref:{" "}
                              <span className="text-slate-200">
                                {d.reference}
                              </span>
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {renderStatusPill(d.status)}
                          <p className="text-slate-500 mt-1">
                            {formatDateTime(d.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 mt-2 text-[10px]">
                        <button
                          disabled={
                            updatingDepositId === d.id ||
                            d.status !== "PENDING"
                          }
                          onClick={() => updateDepositStatus(d.id, "APPROVED")}
                          className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400 text-emerald-300 disabled:opacity-40"
                        >
                          Approve
                        </button>
                        <button
                          disabled={
                            updatingDepositId === d.id ||
                            d.status !== "PENDING"
                          }
                          onClick={() => updateDepositStatus(d.id, "REJECTED")}
                          className="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-400 text-rose-300 disabled:opacity-40"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-3 text-[10px] text-slate-500">
                Approving a deposit credits the user's wallet. Verify actual
                payments in your UPI/bank app before approving.
              </p>
            </div>
          )}

          {/* WITHDRAWALS TAB */}
          {activeTab === "withdrawals" && (
            <div className="flex flex-col h-full text-[11px]">
              {withdrawalsLoading ? (
                <p className="text-slate-400 text-xs">Loading withdrawals</p>
              ) : withdrawalsErr ? (
                <p className="text-red-400 text-xs">{withdrawalsErr}</p>
              ) : withdrawals.length === 0 ? (
                <p className="text-slate-400 text-xs">
                  No withdrawal requests.
                </p>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
                  {withdrawals.map((w) => (
                    <div
                      key={w.id}
                      className="bg-slate-800 p-3 rounded-xl border border-slate-700"
                    >
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="text-slate-100">
                            {w.user?.username || "Unknown user"}
                          </p>
                          <p className="text-slate-400">
                            ID:{" "}
                            <span className="text-sky-300">
                              {w.user?.customerId || "-"}
                            </span>
                          </p>
                          <p className="text-slate-400 mt-1">
                            Amount:{" "}
                            <span className="text-emerald-300 font-semibold">
                              ₹{w.amount}
                            </span>
                          </p>
                          <p className="text-slate-400">
  Method: <span className="text-slate-200">{w.method}</span>
</p>

{w.method === "UPI" && w.upiId && (
  <p className="text-slate-400">
    UPI: <span className="text-sky-300">{w.upiId}</span>
  </p>
)}

{w.method === "Bank" && (
  <>
    {w.bankName && (
      <p className="text-slate-400">
        Bank: <span className="text-sky-300">{w.bankName}</span>
      </p>
    )}
    {w.bankAccount && (
      <p className="text-slate-400">
        A/c no.:{" "}
        <span className="text-slate-200">
          {w.bankAccount}
        </span>
      </p>
    )}
    {w.ifsc && (
      <p className="text-slate-400">
        IFSC: <span className="text-sky-300">{w.ifsc}</span>
      </p>
    )}
  </>
)}

                        </div>
                        <div className="text-right">
                          {renderStatusPill(w.status)}
                          <p className="text-slate-500 mt-1">
                            {formatDateTime(w.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 mt-2 text-[10px]">
                        <button
                          disabled={
                            updatingWithdrawalId === w.id ||
                            w.status !== "PENDING"
                          }
                          onClick={() => updateWithdrawalStatus(w.id, "PAID")}
                          className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400 text-emerald-300 disabled:opacity-40"
                        >
                          Mark as Paid
                        </button>
                        <button
                          disabled={
                            updatingWithdrawalId === w.id ||
                            w.status !== "PENDING"
                          }
                          onClick={() =>
                            updateWithdrawalStatus(w.id, "REJECTED")
                          }
                          className="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-400 text-rose-300 disabled:opacity-40"
                        >
                          Reject & Refund
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-3 text-[10px] text-slate-500">
                Use "Mark as Paid" after sending funds manually. Rejecting a
                pending withdrawal automatically refunds the amount to the
                user's wallet.
              </p>
            </div>
          )}

          {/* GAME CONTROL TAB */}
          {activeTab === "game" && (
            <div className="flex flex-col h-full text-[11px]">

              {/* 🔶 RISK ENGINE SWITCHES CARD */}
              <div className="bg-slate-800 rounded-xl border border-amber-500/60 p-3 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] text-amber-200 font-semibold">
                    Risk Engine · Global switches
                  </p>
                  {riskLoading && (
                    <p className="text-[10px] text-slate-400">Loading</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() =>
                      setRiskConfig((prev) => ({
                        ...prev,
                        profitMode: !prev.profitMode,
                      }))
                    }
                    className={`px-2 py-1.5 rounded-lg border text-[10px] text-left ${
                      riskConfig.profitMode
                        ? "bg-emerald-500/10 border-emerald-400 text-emerald-300"
                        : "bg-slate-900 border-slate-600 text-slate-300"
                    }`}
                  >
                    <span className="block font-semibold">
                      Profit mode (smart RNG)
                    </span>
                    <span className="block text-[9px]">
                      On = liability-based result engine
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setRiskConfig((prev) => ({
                        ...prev,
                        newUserBoost: !prev.newUserBoost,
                      }))
                    }
                    className={`px-2 py-1.5 rounded-lg border text-[10px] text-left ${
                      riskConfig.newUserBoost
                        ? "bg-emerald-500/10 border-emerald-400 text-emerald-300"
                        : "bg-slate-900 border-slate-600 text-slate-300"
                    }`}
                  >
                    <span className="block font-semibold">New user boost</span>
                    <span className="block text-[9px]">
                      New IDs get softer rounds
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setRiskConfig((prev) => ({
                        ...prev,
                        withdrawalRisk: !prev.withdrawalRisk,
                      }))
                    }
                    className={`px-2 py-1.5 rounded-lg border text-[10px] text-left ${
                      riskConfig.withdrawalRisk
                        ? "bg-amber-500/10 border-amber-400 text-amber-200"
                        : "bg-slate-900 border-slate-600 text-slate-300"
                    }`}
                  >
                    <span className="block font-semibold">
                      Withdrawal stage control
                    </span>
                    <span className="block text-[9px]">
                      Turnover pending → slightly tougher
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setRiskConfig((prev) => ({
                        ...prev,
                        bigBetRisk: !prev.bigBetRisk,
                      }))
                    }
                    className={`px-2 py-1.5 rounded-lg border text-[10px] text-left ${
                      riskConfig.bigBetRisk
                        ? "bg-rose-500/10 border-rose-400 text-rose-300"
                        : "bg-slate-900 border-slate-600 text-slate-300"
                    }`}
                  >
                    <span className="block font-semibold">Big bet risk</span>
                    <span className="block text-[9px]">
                      Higher stake → higher risk
                    </span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={saveRiskConfig}
                  disabled={riskSaving}
                  className="w-full mt-1 py-1.5 rounded-lg bg-amber-500 text-slate-900 font-semibold text-[11px] disabled:opacity-60"
                >
                  {riskSaving ? "Saving" : "Save risk engine switches"}
                </button>

                <p className="text-[9px] text-slate-400 mt-1">
                  Ye sirf result engine ke bias ko control karta hai. UI aur
                  multipliers same rehte hain.
                </p>
              </div>

              {/* TOP CONTROLS (tumhara purana card) */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-3 mb-2">
  <div className="flex flex-wrap gap-3 items-center mb-2">
    {/* Game type */}
    <div>
      <p className="text-slate-300 mb-1">Game type</p>
      <select
        value={gameType}
        onChange={(e) => setGameType(e.target.value)}
        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs"
      >
        <option value="30s">30s</option>
        <option value="60s">60s</option>
        <option value="180s">3 min</option>
        <option value="300s">5 min</option>
      </select>
    </div>

    {/* Period */}
    <div className="flex-1 min-w-[160px]">
      <p className="text-slate-300 mb-1">Period</p>
      <div className="flex gap-2">
        <input
          value={customPeriod}
          onChange={(e) => setCustomPeriod(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs"
          placeholder={`${gameType}-xxxxx`}
        />
        <button
          type="button"
          onClick={fetchCurrentPeriod}
          className="px-2 py-1.5 rounded-lg bg-sky-500/20 border border-sky-400 text-sky-200 text-[10px]"
        >
          Use current
        </button>
      </div>
      {currentPeriod && (
        <p className="text-[10px] text-slate-500 mt-1">
          Current server period:{" "}
          <span className="text-sky-300">{currentPeriod}</span>
        </p>
      )}
    </div>

    {/* Result number */}
    <div>
      <p className="text-slate-300 mb-1">Result number</p>
      <input
        value={resultNumberInput}
        onChange={(e) => setResultNumberInput(e.target.value)}
        className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center"
        placeholder="0-9"
      />
      <p className="text-[9px] text-slate-500 mt-1">
        Sirf number set karoge to color/size auto engine se niklega.
      </p>
    </div>

    {/* Color select */}
    <div>
      <p className="text-slate-300 mb-1">Color</p>
      <select
        value={resultColorInput}
        onChange={(e) => setResultColorInput(e.target.value)}
        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs"
      >
        <option value="AUTO">AUTO (number se)</option>
        <option value="G">Green</option>
        <option value="R">Red</option>
        <option value="V">Violet</option>
      </select>
      <p className="text-[9px] text-slate-500 mt-1">
        AUTO = number ke rule se color niklega.
      </p>
    </div>

    {/* Size select */}
    <div>
      <p className="text-slate-300 mb-1">Size</p>
      <select
        value={resultSizeInput}
        onChange={(e) => setResultSizeInput(e.target.value)}
        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs"
      >
        <option value="AUTO">AUTO (0–4 = SMALL, 5–9 = BIG)</option>
        <option value="SMALL">SMALL (0–4)</option>
        <option value="BIG">BIG (5–9)</option>
      </select>
      <p className="text-[9px] text-slate-500 mt-1">
        AUTO = number ke base par size decide hoga.
      </p>
    </div>

    {/* Actions */}
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={loadPeriodStats}
        className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-100 border border-slate-500 text-[10px]"
      >
        Load bets for period
      </button>
      <button
        type="button"
        disabled={settingResult}
        onClick={setManualResult}
        className="px-3 py-1.5 rounded-lg bg-emerald-500/80 text-slate-900 border border-emerald-400 text-[10px] disabled:opacity-60"
      >
        {settingResult ? "Setting..." : "Set result manually"}
      </button>
    </div>
  </div>
</div>

              {/* STATS AREA (tumhara purana stats section) */}
              <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 p-3 overflow-auto">
                {statsLoading ? (
                  <p className="text-slate-400 text-xs">
                    Loading period stats
                  </p>
                ) : statsErr ? (
                  <p className="text-red-400 text-xs">{statsErr}</p>
                ) : periodStats.length === 0 ? (
                  <p className="text-slate-400 text-xs">
                    No bets found for this period yet.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {periodStats.map((s, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-slate-900/80 px-2 py-2 rounded-lg border border-slate-700"
                      >
                        <div>
                          <p className="text-slate-100">
                            {renderBetValueLabel(s.betKind, s.betValue)}
                          </p>
                          <p className="text-slate-500">
                            Kind:{" "}
                            <span className="text-slate-300">
                              {s.betKind}
                            </span>{" "}
                            · Bets:{" "}
                            <span className="text-slate-300">{s.count}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] text-slate-400">
                            Total amount
                          </p>
                          <p className="text-emerald-300 font-semibold">
                            ₹{s.totalAmount}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p className="mt-2 text-[10px] text-slate-500">
                Ye view sirf operational control aur risk monitoring ke liye
                hai. Legal guidelines aur fair-play ka dhyan rakhna tumhari
                responsibility hai.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}


/* ======================================================================
   GAME LOBBY
====================================================================== */

/* ======================================================================
   GAME LOBBY + AVIATOR DEMO POPUP
====================================================================== */

function GameLobby({
  user,
  onLogout,
  onOpenGame,
  onOpenWallet,
  onOpenAccount,
  onOpenPromotions,
}) {
  const balance = user.balance ?? 2500;

  const categories = [
    { id: "live", label: "Live" },
    { id: "original", label: "Original" },
    { id: "crash", label: "Crash" },
    { id: "promo", label: "Offers" },
  ];

  const games = [
    {
      id: "godwin",
      title: "RSX WINGOD",
      subtitle: "Color & number prediction",
      tag: "HOT",
      status: "Live now",
      gradient: "from-sky-400 to-emerald-400",
      onClick: () => onOpenGame("godwin"),
    },
    {
      id: "aviator",
      title: "Aviator Demo",
      subtitle: "Crash multiplier (UI only)",
      tag: "NEW",
      status: "Demo",
      gradient: "from-rose-500 to-orange-500",
      onClick: () =>
        onOpenPromotions
          ? onOpenPromotions()
          : alert("Aviator demo linked from Promotions."),
    },
    {
      id: "promos",
      title: "Promotions",
      subtitle: "Referral, daily bonus, lucky spin",
      tag: "BONUS",
      status: "Active",
      gradient: "from-amber-400 to-rose-500",
      onClick: () => onOpenPromotions && onOpenPromotions(),
    },
  ];

  return (
    <div className="app-root-bg">
      <div className="app-card-glass flex flex-col max-h-[680px]">
        {/* TOP BAR */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-800/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-slate-900/80 border border-sky-500/70 flex items-center justify-center overflow-hidden">
              <img
                src="/images/rsx-logo.jpg"
                alt="RSX"
                className="w-7 h-7 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/rsx-logo.png";
                }}
              />
            </div>
            <div>
              <p className="rsx-section-title">GOD WIN · RSX</p>
              <p className="text-xs text-slate-300">
                Live engine · Multi-period rounds · Wallet sync
              </p>
            </div>
          </div>

          <div className="text-right text-[11px]">
            <p className="text-slate-400">Available balance</p>
            <p className="money-glow relative text-emerald-300 text-lg font-semibold leading-tight">
              ₹ {balance.toLocaleString("en-IN")}
            </p>
            <p className="text-slate-500">
              {user.username}{" "}
              {user.role === "admin" && (
                <span className="text-amber-300 font-semibold">· Admin</span>
              )}
            </p>
            <button
              onClick={onLogout}
              className="mt-1 text-[10px] px-2 py-1 rounded-full border border-rose-400/70 text-rose-300 bg-rose-500/10"
            >
              Logout
            </button>
          </div>
        </div>

        {/* HERO BANNER */}
        <div className="px-5 pt-3 pb-3">
          <div className="relative overflow-hidden rounded-2xl border border-sky-500/50 bg-gradient-to-r from-sky-500/25 via-emerald-500/25 to-slate-900 shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
            <div className="absolute inset-0 opacity-40 bg-[url('/images/chart-bg.png')] bg-cover bg-center" />
            <div className="relative flex justify-between items-center px-4 py-3">
              <div className="max-w-[60%]">
                <p className="text-[10px] uppercase tracking-[0.18em] text-sky-100">
                  LIVE MARKET STYLE
                </p>
                <p className="text-xs mt-1 text-slate-50">
                  Predict colors & numbers in real-time rounds with instant
                  wallet updates.
                </p>
                <p className="text-[10px] mt-2 text-emerald-200">
                  30s · 1m · 3m · 5m periods · Multi-bet support
                </p>
              </div>
              <div className="text-right text-[11px] text-sky-50">
                <p className="font-semibold">RSX Engine</p>
                <p className="text-[10px] text-emerald-200">
                  UPI / Razorpay deposits
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CATEGORY CHIPS */}
        <div className="px-5 pb-2 flex gap-2 overflow-x-auto custom-scroll">
          {categories.map((c) => (
            <button
              key={c.id}
              className="px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-[11px] text-slate-300 hover:border-sky-500/90 hover:text-sky-300 transition shrink-0"
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* GAMES LIST */}
        <div className="px-5 pb-3 flex-1 overflow-y-auto custom-scroll space-y-3">
          {games.map((g) => (
            <button
              key={g.id}
              onClick={g.onClick}
              className="w-full text-left rounded-2xl bg-slate-900/80 border border-slate-700 overflow-hidden hover:border-sky-400/80 hover:shadow-[0_16px_40px_rgba(56,189,248,0.45)] transition"
            >
              <div
                className={`h-16 bg-gradient-to-r ${g.gradient} opacity-70`}
              />
              <div className="px-4 py-3 flex items-center justify-between -mt-8 relative">
                <div>
                  <p className="text-xs text-slate-200 font-semibold">
                    {g.title}
                  </p>
                  <p className="text-[11px] text-slate-400">{g.subtitle}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px]">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/60 text-emerald-300">
                      {g.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/60 text-amber-300">
                      {g.tag}
                    </span>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  <p>Tap to open</p>
                  <p className="text-sky-300 font-semibold">ENTER ▶</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between text-[11px]">
          <button
            onClick={onOpenWallet}
            className="flex flex-col items-start gap-0.5"
          >
            <span className="text-slate-300">Wallet</span>
            <span className="text-[10px] text-emerald-300">
              Manage deposit & withdraw
            </span>
          </button>
          <button
            onClick={onOpenPromotions}
            className="flex flex-col items-center gap-0.5"
          >
            <span className="text-slate-300">Promotions</span>
            <span className="text-[10px] text-amber-300">
              Bonus, referral, spin
            </span>
          </button>
          <button
            onClick={onOpenAccount}
            className="flex flex-col items-end gap-0.5"
          >
            <span className="text-slate-300">Account</span>
            <span className="text-[10px] text-slate-400">
              Profile & history
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}







/* ======================================================================
   WALLET SCREEN
====================================================================== */

function WalletScreen({ user, token, onBackToLobby, onLogout, onUserUpdate }) {
  const [balance, setBalance] = useState(user.balance ?? 2500);

  // Deposit
  const [depositAmount, setDepositAmount] = useState("");
  const [upiId, setUpiId] = useState(""); // user UPI for deposit
  const [showUTRPopup, setShowUTRPopup] = useState(false);
  const [utrValue, setUtrValue] = useState("");

  // Withdraw
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [method, setMethod] = useState("UPI");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ifsc, setIfsc] = useState("");

  // UI state
  const [info, setInfo] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [depositing, setDepositing] = useState(false);

  const MERCHANT_UPI = "yourupiid@upi"; // 🔁 yahan apna UPI ID daal
  const MERCHANT_NAME = "RSX WINGOD";

  const syncBalance = async (b) => {
    try {
      await fetch(`${API_BASE}/api/auth/balance`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ balance: b }),
      });
    } catch (e) {
      console.error("Failed to sync balance", e);
    }
  };

  const computeDepositBonusPercent = (amt) => {
    const a = Number(amt) || 0;
    if (a < 300) return 0;
    if (a < 1000) return 3;
    if (a < 5000) return 5;
    return 8;
  };

  const computeDepositBonusAmount = (amt) => {
    const p = computeDepositBonusPercent(amt);
    const a = Number(amt) || 0;
    return Math.round((a * p) / 100);
  };

  // ---------------- UPI APP OPEN (generic – system khud app choose kare) --------------
  const openUpiApp = () => {
    setInfo("");

    const amt = Number(depositAmount);
    if (!amt || amt <= 0) {
      setInfo("Enter a valid deposit amount.");
      return;
    }

    if (amt < 300) {
      setInfo("Amount less than ₹300 is not allowed.");
      alert("Minimum deposit is ₹300.");
      return;
    }

    const baseParams = `pa=${encodeURIComponent(
      MERCHANT_UPI
    )}&pn=${encodeURIComponent(
      MERCHANT_NAME
    )}&am=${encodeURIComponent(String(amt))}&cu=INR&tn=${encodeURIComponent(
      "RSX WINGOD Deposit"
    )}`;

    const upiUrl = `upi://pay?${baseParams}`;

    try {
      window.location.href = upiUrl;
      setInfo(
        "UPI app opening... complete the payment and then enter UTR / Transaction ID."
      );
      // payment ke baad user wapas aaye → UTR popup khol
      setTimeout(() => {
        setShowUTRPopup(true);
      }, 500);
    } catch (e) {
      console.error("UPI open error", e);
      setInfo(
        "UPI app could not open automatically. You can pay manually to the merchant UPI and then submit UTR."
      );
      setShowUTRPopup(true);
    }
  };

  // ---------------- DEPOSIT: UTR SUBMIT (actual API call) ----------------
  const submitUTR = async () => {
    setInfo("");

    const amt = Number(depositAmount);
    if (!amt || amt <= 0) {
      setInfo("Amount missing. Please enter deposit amount again.");
      return;
    }
    if (amt < 300) {
      setInfo("Minimum deposit is ₹300.");
      return;
    }
    if (!upiId) {
      setInfo("Please enter your UPI ID (from which you paid).");
      return;
    }
    if (!utrValue) {
      setInfo("Please enter UTR / Transaction ID.");
      return;
    }

    try {
      setDepositing(true);

      const res = await fetch(`${API_BASE}/api/wallet/deposit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amt,
          method: "UPI",
          upiId,
          reference: utrValue,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setInfo(data.message || "Failed to create deposit request.");
        return;
      }

      setInfo(
        `Deposit request of ₹${amt} created. Status: ${
          data.deposit?.status || "PENDING"
        }.`
      );

      setDepositAmount("");
      setUtrValue("");
      setUpiId("");
      setShowUTRPopup(false);
    } catch (e) {
      console.error("UTR submit error", e);
      setInfo("Network error. Please try again.");
    } finally {
      setDepositing(false);
    }
  };

  // ---------------- WITHDRAW ----------------
  const handleWithdraw = async (e) => {
    e.preventDefault();
    setInfo("");

    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) {
      setInfo("Enter a valid withdrawal amount.");
      return;
    }
    if (amt < 500) {
      setInfo("Minimum withdrawal is ₹500.");
      return;
    }
    if (amt > balance) {
      setInfo("Insufficient wallet balance.");
      return;
    }

    if (method === "UPI") {
      if (!upiId) {
        setInfo("Enter UPI ID for withdrawal.");
        return;
      }
    } else if (method === "Bank") {
      if (!bankName || !bankAccount || !ifsc) {
        setInfo(
          "Enter bank name, account number and IFSC for withdrawal."
        );
        return;
      }
      if (bankAccount.length < 6) {
        setInfo("Enter a valid bank account number.");
        return;
      }
      if (ifsc.length < 8) {
        setInfo("Enter a valid IFSC code.");
        return;
      }
    }

    try {
      setWithdrawing(true);
      const res = await fetch(`${API_BASE}/api/wallet/withdraw`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amt,
          method,
          upiId: method === "UPI" ? upiId : undefined,
          bankName: method === "Bank" ? bankName : undefined,
          bankAccount: method === "Bank" ? bankAccount : undefined,
          ifsc: method === "Bank" ? ifsc : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setInfo(data.message || "Failed to create withdrawal request.");
        return;
      }

      const newBal = typeof data.balance === "number" ? data.balance : balance;
      setBalance(newBal);
      onUserUpdate({ ...user, balance: newBal });
      syncBalance(newBal);

      setInfo(
        `Withdrawal request of ₹${amt} submitted. Status: ${
          data.withdrawal?.status || "PENDING"
        }.`
      );
      setWithdrawAmount("");
    } catch (err) {
      console.error("Withdraw error", err);
      setInfo("Network error while creating withdrawal request.");
    } finally {
      setWithdrawing(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-3">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToLobby}
              className="text-[11px] px-2 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-600"
            >
              ← Lobby
            </button>
            <div>
              <h2 className="text-lg font-bold">Wallet</h2>
              <p className="text-xs text-slate-400">
                Manage deposits, withdrawals & game funds.
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-[10px] text-rose-400 underline"
          >
            Logout
          </button>
        </div>

        {/* Balance Card */}
        <div className="rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 p-4 shadow-lg">
          <p className="text-[11px] text-sky-100">Available Balance</p>
          <p className="text-2xl font-bold mt-1">
            ₹ {balance.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-sky-100/80 mt-1">
            User: {user.username}{" "}
            {user.role === "admin" && <span>· Admin</span>}
          </p>
          <p className="text-[10px] text-sky-100/70 mt-2">
            Add funds by creating a deposit request. Payouts are processed on
            verified withdrawal requests.
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <div className="bg-slate-800 rounded-xl p-2 text-center border border-slate-700">
            <p className="text-slate-300">Total Games</p>
            <p className="text-lg font-semibold mt-1 text-sky-300">1</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-2 text-center border border-slate-700">
            <p className="text-slate-300">Status</p>
            <p className="text-xs mt-1 text-emerald-300">Active</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-2 text-center border border-slate-700">
            <p className="text-slate-300">Mode</p>
            <p className="text-xs mt-1 text-yellow-300">Live Panel</p>
          </div>
        </div>

        {/* Deposit & Withdraw */}
        <div className="grid grid-cols-1 gap-3 text-xs">
          {/* Deposit */}
          <div className="bg-slate-800 rounded-2xl p-3 border border-emerald-500/40">
            <div className="flex justify-between items-center mb-2">
              <p className="text-slate-100 font-semibold">Deposit</p>
              <span className="text-[10px] text-emerald-300 bg-emerald-500/10 px-2 py-[2px] rounded-full border border-emerald-400/60">
                UPI · Manual approval
              </span>
            </div>

            <p className="text-[10px] text-emerald-300 mb-1">
              ₹300–₹999: ~3% bonus · ₹1000–₹4999: ~5% bonus · ₹5000+: ~8% bonus
            </p>

            <div className="mb-2">
              <p className="text-[11px] text-slate-300 mb-1">Amount (₹)</p>
              <input
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-700 outline-none text-xs"
                placeholder="Enter amount (min ₹300)"
                type="number"
              />
            </div>

            {Number(depositAmount) >= 300 && (
              <p className="text-[10px] text-emerald-400 mb-2">
                Estimated bonus: ~{computeDepositBonusPercent(depositAmount)}% (
                approx ₹{computeDepositBonusAmount(depositAmount)})
              </p>
            )}

            <div className="mb-2">
              <p className="text-[11px] text-slate-300 mb-1">Your UPI ID</p>
              <input
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-700 outline-none text-xs"
                placeholder="your-upi@bank"
              />
            </div>

            <button
              type="button"
              onClick={openUpiApp}
              disabled={depositing}
              className="w-full mt-2 py-1.5 rounded-lg bg-emerald-500 text-slate-900 font-semibold text-xs disabled:opacity-60"
            >
              {depositing ? "Processing..." : "Deposit via UPI"}
            </button>

            <p className="text-[10px] text-slate-500 mt-1">
              Tap deposit to open your UPI app. After completing the payment,
              enter the UTR / Transaction ID to submit your deposit request.
            </p>
          </div>

          {/* Withdraw */}
          <form
            onSubmit={handleWithdraw}
            className="bg-slate-800 rounded-2xl p-3 border border-rose-500/40"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-slate-100 font-semibold">Withdraw</p>
              <span className="text-[10px] text-rose-300 bg-rose-500/10 px-2 py-[2px] rounded-full border border-rose-400/60">
                Manual review & payout
              </span>
            </div>

            <div className="mb-2">
              <p className="text-[11px] text-slate-300 mb-1">Amount (₹)</p>
              <input
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-700 outline-none text-xs"
                placeholder="Enter amount (min ₹500)"
                type="number"
              />
            </div>

            <div className="mb-2">
              <p className="text-[11px] text-slate-300 mb-1">Method</p>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-700 outline-none text-xs"
              >
                <option value="UPI">UPI</option>
                <option value="Bank">Bank transfer</option>
              </select>
            </div>

            {method === "UPI" && (
              <div className="mb-2">
                <p className="text-[11px] text-slate-300 mb-1">UPI ID</p>
                <input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-700 outline-none text-xs"
                  placeholder="your-upi@bank"
                />
              </div>
            )}

            {method === "Bank" && (
              <>
                <div className="mb-2">
                  <p className="text-[11px] text-slate-300 mb-1">
                    Bank Name
                  </p>
                  <input
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-700 outline-none text-xs"
                    placeholder="e.g. State Bank of India"
                  />
                </div>

                <div className="mb-2">
                  <p className="text-[11px] text-slate-300 mb-1">
                    Account Number
                  </p>
                  <input
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-700 outline-none text-xs"
                    placeholder="Enter account number"
                    type="number"
                  />
                </div>

                <div className="mb-2">
                  <p className="text-[11px] text-slate-300 mb-1">
                    IFSC Code
                  </p>
                  <input
                    value={ifsc}
                    onChange={(e) =>
                      setIfsc(e.target.value.toUpperCase())
                    }
                    className="w-full bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-700 outline-none text-xs"
                    placeholder="e.g. SBIN0012345"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={withdrawing}
              className="w-full mt-2 py-1.5 rounded-lg bg-rose-500 text-slate-900 font-semibold text-xs disabled:opacity-60"
            >
              {withdrawing ? "Submitting..." : "Withdraw request"}
            </button>
          </form>
        </div>

        {info && (
          <p className="text-[11px] text-slate-300 bg-slate-800 px-3 py-2 rounded-2xl border border-slate-700">
            {info}
          </p>
        )}

        <p className="text-[10px] text-slate-500 text-center mt-1">
          Always double-check UPI and bank details before confirming any
          transaction.
        </p>

        {showUTRPopup && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-700 p-5 rounded-2xl w-full max-w-sm">
              <h3 className="text-lg font-bold mb-2">
                Enter UTR / Transaction ID
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">
                Payment complete karne ke baad UPI app me dikhne wali UTR /
                reference ID yahaan daalein.
              </p>

              <input
                value={utrValue}
                onChange={(e) => setUtrValue(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 mb-3 text-xs"
                placeholder="Enter UPI UTR / reference"
              />

              <button
                onClick={submitUTR}
                disabled={depositing}
                className="w-full py-2 bg-emerald-500 text-slate-900 rounded-lg font-semibold text-xs disabled:opacity-60"
              >
                {depositing ? "Submitting..." : "Submit Deposit Request"}
              </button>

              <button
                onClick={() => setShowUTRPopup(false)}
                className="mt-2 w-full text-center text-[11px] text-slate-400 underline"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}






/* ======================================================================
   AVIATOR SCREEN (UI DEMO – NO REAL MONEY ENGINE)
====================================================================== */

function AviatorScreen({ user, token, onBackToLobby, onLogout }) {
  const [multiplier, setMultiplier] = React.useState(1.00);
  const [running, setRunning] = React.useState(false);
  const [crashed, setCrashed] = React.useState(false);
  const [betAmount, setBetAmount] = React.useState("100");
  const [info, setInfo] = React.useState("");

  // simple demo animation: multiplier grows until random crash
  React.useEffect(() => {
    if (!running) return;

    // crash point random (1.2x – 5x)
    const crashAt = 1.2 + Math.random() * 3.8;

    const id = setInterval(() => {
      setMultiplier((prev) => {
        const next = +(prev + 0.03).toFixed(2);
        if (next >= crashAt) {
          clearInterval(id);
          setCrashed(true);
          setRunning(false);
          return +crashAt.toFixed(2);
        }
        return next;
      });
    }, 80);

    return () => clearInterval(id);
  }, [running]);

  const handleStart = () => {
    setInfo("");
    setMultiplier(1.0);
    setCrashed(false);
    setRunning(true);
  };

  const handleCashout = () => {
    if (!running || crashed) return;
    setRunning(false);
    setInfo(
      `Demo cashout at ${multiplier.toFixed(2)}x on bet ₹${betAmount || 0}. (UI only)`
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-3">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToLobby}
              className="text-[11px] px-2 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-600"
            >
              ← Lobby
            </button>
            <div>
              <p className="text-[11px] text-rose-400 font-semibold">
                Aviator
              </p>
              <p className="text-[10px] text-slate-400">
                Crash-multiplier demo · Virtual mode
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-400">Balance</p>
            <p className="text-emerald-400 font-bold text-sm">
              ₹ {Number(user.balance ?? 0).toLocaleString("en-IN")}
            </p>
            <button
              onClick={onLogout}
              className="mt-1 text-[10px] text-rose-400 underline"
            >
              Logout
            </button>
          </div>
        </div>

        {/* MAIN PANEL */}
        <div className="flex-1 bg-slate-950 px-4 pb-4 pt-2 flex flex-col gap-3">
          {/* MULTIPLIER AREA */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border border-slate-700 shadow-inner overflow-hidden">
            <div className="px-3 pt-2 pb-1 flex justify-between items-center">
              <p className="text-[10px] text-slate-300">Live multiplier (demo)</p>
              <p className="text-[10px] text-emerald-300">
                User: <span className="font-semibold">{user.username}</span>
              </p>
            </div>
            <div className="h-32 flex items-center justify-center relative">
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_bottom,_#22d3ee_0,_transparent_60%)]" />
              <p
                className={`text-4xl font-extrabold tracking-wide ${
                  crashed ? "text-rose-400" : "text-amber-300"
                }`}
              >
                {multiplier.toFixed(2)}x
              </p>
            </div>
            <div className="px-3 pb-2 flex justify-between text-[10px] text-slate-400">
              <p>
                Mode: <span className="text-sky-300">Fun / UI test only</span>
              </p>
              {crashed ? (
                <p className="text-rose-400 font-semibold">Crashed</p>
              ) : running ? (
                <p className="text-emerald-300 font-semibold">Flying…</p>
              ) : (
                <p className="text-slate-400">Waiting for round</p>
              )}
            </div>
          </div>

          {/* BET CONTROLS */}
          <div className="rounded-2xl bg-slate-900 border border-slate-700 p-3 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <p className="text-[11px] text-slate-200 font-semibold">Bet panel</p>
              <p className="text-[10px] text-slate-400">
                Demo calculation – no real wagers
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="text-[11px] text-slate-300 mb-1">Bet amount</p>
                <input
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="w-full bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-700 outline-none text-xs"
                  placeholder="100"
                  type="number"
                  min="1"
                />
              </div>
              <div className="text-right text-[11px]">
                <p className="text-slate-400 mb-1">Potential (demo)</p>
                <p className="text-emerald-300 font-semibold">
                  ₹{" "}
                  {(
                    (Number(betAmount || 0) || 0) * multiplier
                  ).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={handleStart}
                disabled={running}
                className="py-2 rounded-xl bg-amber-400 text-slate-900 font-semibold text-xs disabled:opacity-60"
              >
                {running ? "Round running…" : "Start round"}
              </button>
              <button
                type="button"
                onClick={handleCashout}
                disabled={!running || crashed}
                className="py-2 rounded-xl bg-emerald-500 text-slate-900 font-semibold text-xs disabled:opacity-40"
              >
                Cash out (demo)
              </button>
            </div>
          </div>

          {/* HISTORY ROW (STATIC DEMO) */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3">
            <p className="text-[11px] text-slate-300 mb-2">
              Recent demo multipliers
            </p>
            <div className="flex gap-1 overflow-x-auto text-[11px]">
              {[1.16, 1.02, 1.74, 2.35, 3.12, 4.80, 1.47].map((m, i) => (
                <span
                  key={i}
                  className={`px-2 py-1 rounded-full border ${
                    m < 1.2
                      ? "bg-rose-500/10 border-rose-400/60 text-rose-300"
                      : m < 2
                      ? "bg-amber-500/10 border-amber-400/60 text-amber-300"
                      : "bg-emerald-500/10 border-emerald-400/60 text-emerald-300"
                  }`}
                >
                  {m.toFixed(2)}x
                </span>
              ))}
            </div>
          </div>

          {info && (
            <p className="text-[11px] text-slate-200 bg-slate-800 px-3 py-2 rounded-2xl border border-slate-700">
              {info}
            </p>
          )}

          <p className="text-[10px] text-slate-500 text-center">
            This Aviator screen is a visual demo. Any amounts shown are virtual
            and for interface testing only.
          </p>
        </div>
      </div>
    </div>
  );
}






/* ======================================================================
   PROMOTION SCREEN (Referral + Daily Bonus + Lucky Spin + Banners)
====================================================================== */

function PromotionScreen({
  user,
  token,
  onBackToLobby,
  onLogout,
  onUserUpdate,
}) {
  const [balance, setBalance] = useState(user.balance ?? 0);
  const [info, setInfo] = useState("");

  const [checkinLoading, setCheckinLoading] = useState(false);
  const [spinLoading, setSpinLoading] = useState(false);
  const [spinResult, setSpinResult] = useState(null);

  const todayKey = new Date().toISOString().slice(0, 10); // "2025-12-02"

  // LocalStorage keys per user
  const checkinKey = `gw_checkin_${user.id}`;
  const spinKey = `gw_spin_${user.id}`;

  const referralCode =
    user.referralCode ||
    user.customerId ||
    `GW${(user.id || "").slice(-6).toUpperCase()}`;

  const syncBalance = async (b) => {
    try {
      await fetch(`${API_BASE}/api/auth/balance`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ balance: b }),
      });
    } catch (e) {
      console.error("Failed to sync balance (promotion)", e);
    }
  };

  const getCheckinState = () => {
    try {
      const raw = localStorage.getItem(checkinKey);
      if (!raw) return { last: null, day: 0 };
      return JSON.parse(raw);
    } catch {
      return { last: null, day: 0 };
    }
  };

  const setCheckinState = (state) => {
    localStorage.setItem(checkinKey, JSON.stringify(state));
  };

  const hasCheckedInToday = () => {
    const st = getCheckinState();
    return st.last === todayKey;
  };

  const handleDailyCheckin = async () => {
    setInfo("");
    setSpinResult(null);

    const st = getCheckinState();
    if (st.last === todayKey) {
      setInfo("You have already claimed today's check-in bonus.");
      return;
    }

    const nextDay = (st.day || 0) + 1;
    const dayIndex = (nextDay - 1) % 7; // 0..6
    const rewards = [5, 7, 10, 12, 15, 18, 25];
    const reward = rewards[dayIndex];

    try {
      setCheckinLoading(true);
      const newBal = balance + reward;
      setBalance(newBal);
      onUserUpdate({ user, balance: newBal });
      await syncBalance(newBal);

      setCheckinState({ last: todayKey, day: nextDay });

      setInfo(
        `Daily check-in successful. Day ${nextDay} streak — bonus ₹${reward} added to your wallet.`
      );
    } catch (e) {
      console.error("Daily check-in error", e);
      setInfo("Network error while applying check-in bonus.");
    } finally {
      setCheckinLoading(false);
    }
  };

  const hasSpunToday = () => {
    try {
      const raw = localStorage.getItem(spinKey);
      if (!raw) return false;
      return raw === todayKey;
    } catch {
      return false;
    }
  };

  const handleSpin = async () => {
    setInfo("");
    setSpinResult(null);

    if (hasSpunToday()) {
      setInfo("You have already used today's lucky spin.");
      return;
    }

    // Simple random reward (can weight later)
    const options = [0, 0, 5, 10, 20];
    const reward = options[Math.floor(Math.random() * options.length)];

    try {
      setSpinLoading(true);
      localStorage.setItem(spinKey, todayKey);

      if (reward > 0) {
        const newBal = balance + reward;
        setBalance(newBal);
        onUserUpdate({ user, balance: newBal });
        await syncBalance(newBal);

        setSpinResult({
          type: "win",
          amount: reward,
          msg: `You won ₹${reward} from Lucky Spin!`,
        });
      } else {
        setSpinResult({
          type: "loss",
          amount: 0,
          msg: "No reward this time. Try again tomorrow!",
        });
      }
    } catch (e) {
      console.error("Spin error", e);
      setInfo("Network error while applying spin reward.");
    } finally {
      setSpinLoading(false);
    }
  };

  const handleCopyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setInfo("Referral code copied to clipboard.");
    } catch (e) {
      console.error("Copy failed", e);
      setInfo("Unable to copy referral code.");
    }
  };

  const handleShareReferral = async () => {
    const text = `Join RSX WINGOD with my code ${referralCode} and explore prediction gameplay.`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "RSX WINGOD Invite",
          text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        setInfo("Referral message copied. Paste it in WhatsApp / Telegram.");
      }
    } catch (e) {
      console.error("Share failed", e);
    }
  };

  const checkinState = getCheckinState();
  const streakDay = checkinState.day || 0;
  const alreadyCheckedToday = hasCheckedInToday();
  const alreadySpunToday = hasSpunToday();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-3">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToLobby}
              className="text-[11px] px-2 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-600"
            >
              ← Lobby
            </button>
            <div>
              <h2 className="text-lg font-bold">Promotions</h2>
              <p className="text-xs text-slate-400">
                Referral rewards, daily bonus & lucky spin.
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-[10px] text-rose-400 underline"
          >
            Logout
          </button>
        </div>

        {/* Mini balance card */}
        <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-3 flex items-center justify-between text-xs">
          <div>
            <p className="text-slate-300">Wallet balance</p>
            <p className="text-lg font-bold text-emerald-300 mt-1">
              ₹ {balance.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-400">User</p>
            <p className="text-xs font-semibold text-slate-100">
              {user.username}
            </p>
            {user.customerId && (
              <p className="text-[10px] text-slate-500">
                ID: {user.customerId}
              </p>
            )}
          </div>
        </div>

        {/* Referral card */}
        <div className="bg-slate-800 rounded-2xl p-3 border border-sky-500/40 text-xs">
          <div className="flex justify-between items-center mb-2">
            <p className="text-slate-100 font-semibold">Referral program</p>
            <span className="text-[10px] px-2 py-[2px] rounded-full bg-sky-500/10 text-sky-300 border border-sky-400/60">
              Beta
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mb-2">
            Share your code. Earn a small bonus when invited users play and
            deposit, as per platform rules.
          </p>

          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-700 text-[11px] truncate">
              {referralCode}
            </div>
            <button
              type="button"
              onClick={handleCopyReferral}
              className="text-[11px] px-2 py-1 rounded-lg bg-slate-700 text-slate-100"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={handleShareReferral}
              className="text-[11px] px-2 py-1 rounded-lg bg-sky-500 text-slate-900 font-semibold"
            >
              Share
            </button>
          </div>

          <p className="text-[10px] text-slate-500">
            Referral benefits are subject to fair-use and anti-fraud checks.
          </p>
        </div>

        {/* Daily check-in & Lucky spin */}
        <div className="grid grid-cols-1 gap-3 text-xs">
          {/* Daily check-in */}
          <div className="bg-slate-800 rounded-2xl p-3 border border-emerald-500/40">
            <div className="flex justify-between items-center mb-2">
              <p className="text-slate-100 font-semibold">Daily check-in</p>
              <span className="text-[10px] text-emerald-300">
                Streak: {streakDay} day(s)
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mb-2">
              Login once a day and claim a small fixed bonus. 7-day streaks give
              slightly higher rewards.
            </p>
            <button
              type="button"
              disabled={checkinLoading || alreadyCheckedToday}
              onClick={handleDailyCheckin}
              className="w-full mt-1 py-1.5 rounded-lg bg-emerald-500 text-slate-900 font-semibold text-xs disabled:opacity-60"
            >
              {alreadyCheckedToday
                ? "Today's bonus claimed"
                : checkinLoading
                ? "Claiming"
                : "Claim daily bonus"}
            </button>
          </div>

          {/* Lucky spin */}
          <div className="bg-slate-800 rounded-2xl p-3 border border-yellow-500/40">
            <div className="flex justify-between items-center mb-2">
              <p className="text-slate-100 font-semibold">Lucky Spin</p>
              <span className="text-[10px] text-yellow-300">
                1 spin / day
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mb-2">
              Try your luck for a small bonus. Rewards are limited and designed
              not to impact platform risk.
            </p>
            <button
              type="button"
              disabled={spinLoading || alreadySpunToday}
              onClick={handleSpin}
              className="w-full mt-1 py-1.5 rounded-lg bg-yellow-400 text-slate-900 font-semibold text-xs disabled:opacity-60"
            >
              {alreadySpunToday
                ? "Spin used for today"
                : spinLoading
                ? "Spinning"
                : "Spin now"}
            </button>
            {spinResult && (
              <p
                className={`mt-2 text-[11px] ${
                  spinResult.type === "win"
                    ? "text-emerald-300"
                    : "text-slate-300"
                }`}
              >
                {spinResult.msg}
              </p>
            )}
          </div>
        </div>

        {/* Info message */}
        {info && (
          <p className="text-[11px] text-slate-300 bg-slate-800 px-3 py-2 rounded-2xl border border-slate-700">
            {info}
          </p>
        )}

        <p className="text-[10px] text-slate-500 text-center mt-1">
          Promotional benefits are supportive only. Core game outcomes remain
          independent and risk-controlled on the platform side.
        </p>
      </div>
    </div>
  );
}

/* ======================================================================
   ACCOUNT SCREEN (with Deposit & Withdrawal history)
====================================================================== */

/* ======================================================================
   ACCOUNT SCREEN
====================================================================== */

function AccountScreen({ user, token, onBackToLobby, onLogout }) {
  const [copied, setCopied] = useState(false);

  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // TEAM STATES
  const [showTeam, setShowTeam] = useState(false);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState("");
  const [teamStats, setTeamStats] = useState(null);

  const customerId = user.customerId || "Not assigned";
  const joined =
    user.createdAt &&
    new Date(user.createdAt).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const handleCopy = async () => {
    if (!user.customerId) return;
    try {
      await navigator.clipboard.writeText(user.customerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const initial = user.username?.[0]?.toUpperCase() || "U";

  const renderStatusPill = (status) => {
    const base =
      "px-2 py-[2px] rounded-full text-[9px] border inline-flex items-center justify-center";
    if (status === "PENDING")
      return (
        <span
          className={`${base} bg-yellow-500/10 text-yellow-300 border-yellow-400/70`}
        >
          Pending
        </span>
      );
    if (status === "APPROVED" || status === "PAID")
      return (
        <span
          className={`${base} bg-emerald-500/10 text-emerald-300 border-emerald-400/70`}
        >
          {status === "PAID" ? "Paid" : "Approved"}
        </span>
      );
    if (status === "REJECTED")
      return (
        <span
          className={`${base} bg-rose-500/10 text-rose-300 border-rose-400/70`}
        >
          Rejected
        </span>
      );
    return (
      <span
        className={`${base} bg-slate-700/60 text-slate-200 border-slate-500`}
      >
        {status}
      </span>
    );
  };

  const formatDateTime = (iso) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return iso;
    }
  };

  const totalDeposit = deposits.reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalWithdraw = withdrawals.reduce(
    (sum, w) => sum + (w.amount || 0),
    0
  );

  // history load
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const [depRes, wdRes] = await Promise.all([
          fetch(`${API_BASE}/api/wallet/deposit/my`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/wallet/withdraw/my`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const depData = await depRes.json();
        const wdData = await wdRes.json();

        if (!depRes.ok) {
          setError(depData.message || "Failed to load deposit history.");
        } else {
          setDeposits(Array.isArray(depData) ? depData : []);
        }

        if (!wdRes.ok) {
          setError(
            (prev) =>
              prev ||
              wdData.message || "Failed to load withdrawal history."
          );
        } else {
          setWithdrawals(Array.isArray(wdData) ? wdData : []);
        }
      } catch (e) {
        console.error("History load error", e);
        setError("Network error while loading transaction history.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [token]);

  const openTeam = async () => {
    setShowTeam(true);
    setTeamLoading(true);
    setTeamError("");
    setTeamStats(null);

    try {
      const res = await fetch(`${API_BASE}/api/referral/team-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setTeamError(data.message || "Failed to load team stats.");
        return;
      }

      setTeamStats(data);
    } catch (e) {
      console.error("Team stats error", e);
      setTeamError("Network error while loading team stats.");
    } finally {
      setTeamLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-3">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 p-5 flex flex-col gap-4 relative">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToLobby}
              className="text-[11px] px-2 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-600"
            >
              ← Lobby
            </button>
            <div>
              <h2 className="text-lg font-bold">Account</h2>
              <p className="text-xs text-slate-400">Profile & activity</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-[10px] text-rose-400 underline"
          >
            Logout
          </button>
        </div>

        {/* Profile card */}
        <div className="rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 p-4 shadow-lg flex gap-3 items-center">
          <div className="w-12 h-12 rounded-full bg-slate-950/20 flex items-center justify-center text-lg font-bold">
            {initial}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{user.username}</p>
            <p className="text-[11px] text-sky-100/90">
              {user.role === "admin" ? "Admin Account" : "Standard User"}
            </p>
            {joined && (
              <p className="text-[10px] text-sky-100/80 mt-1">
                Joined: {joined}
              </p>
            )}
          </div>
        </div>

        {/* Unique ID */}
        <div className="bg-slate-800 rounded-2xl p-3 border border-slate-700">
          <p className="text-[11px] text-slate-400 mb-1">Account ID</p>
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm font-mono text-sky-300 break-all">
                {customerId}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Use this ID for support and internal tracking.
              </p>
            </div>
            <button
              onClick={handleCopy}
              disabled={!user.customerId}
              className="text-[11px] px-3 py-1.5 rounded-full bg-slate-900 border border-sky-400 text-sky-300 disabled:opacity-40"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Account summary */}
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <div className="bg-slate-800 rounded-xl p-2 text-center border border-slate-700">
            <p className="text-slate-300">Role</p>
            <p className="text-xs mt-1 text-emerald-300 capitalize">
              {user.role}
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-2 text-center border border-slate-700">
            <p className="text-slate-300">Balance</p>
            <p className="text-xs mt-1 text-sky-300">
              ₹ {Number(user.balance ?? 0).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-2 text-center border border-slate-700">
            <p className="text-slate-300">Mode</p>
            <p className="text-xs mt-1 text-yellow-300">Simulation</p>
          </div>
        </div>

        {/* Your team button (wallet overview ki jagah) */}
        <button
          type="button"
          onClick={openTeam}
          className="w-full mt-1 py-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-sky-400 to-purple-400 text-slate-950 text-xs font-semibold shadow"
        >
          Your team & levels
        </button>

        {/* History section (same like before) */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-3 text-[11px] max-h-64 overflow-hidden flex flex-col gap-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-slate-200 font-semibold">
              Deposit & withdraw history
            </p>
            {loading && (
              <span className="text-[10px] text-slate-400">Loading</span>
            )}
          </div>

          {error && (
            <p className="text-[10px] text-rose-300 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-400/50">
              {error}
            </p>
          )}

          {!loading &&
            !error &&
            deposits.length === 0 &&
            withdrawals.length === 0 && (
              <p className="text-[11px] text-slate-400">
                No deposit or withdrawal activity yet.
              </p>
            )}

          <div className="flex-1 grid grid-cols-2 gap-2 overflow-hidden">
            {/* Deposits */}
            <div className="flex flex-col min-w-0">
              <p className="text-[10px] text-slate-400 mb-1">
                Deposits (latest)
              </p>
              <div className="space-y-1.5 max-h-40 overflow-auto pr-1">
                {deposits.map((d) => (
                  <div
                    key={d.id}
                    className="bg-slate-900/90 rounded-xl px-2 py-1.5 border border-slate-700"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-[11px] text-emerald-300 font-semibold">
                        ₹{d.amount}
                      </p>
                      {renderStatusPill(d.status)}
                    </div>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      {formatDateTime(d.createdAt)}
                    </p>
                    {d.method && (
                      <p className="text-[9px] text-slate-500">
                        Method: {d.method}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Withdrawals */}
            <div className="flex flex-col min-w-0">
              <p className="text-[10px] text-slate-400 mb-1">
                Withdrawals (latest)
              </p>
              <div className="space-y-1.5 max-h-40 overflow-auto pr-1">
                {withdrawals.map((w) => (
                  <div
                    key={w.id}
                    className="bg-slate-900/90 rounded-xl px-2 py-1.5 border border-slate-700"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-[11px] text-rose-300 font-semibold">
                        ₹{w.amount}
                      </p>
                      {renderStatusPill(w.status)}
                    </div>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      {formatDateTime(w.createdAt)}
                    </p>
                    {w.method && (
                      <p className="text-[9px] text-slate-500">
                        Method: {w.method}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-slate-500 text-center mt-1">
          Status values are updated after manual review by the operator.
        </p>

        {/* TEAM MODAL */}
        {showTeam && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-4 text-[11px]">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm font-semibold text-slate-50">
                    Your team
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Levels & estimated earnings
                  </p>
                </div>
                <button
                  onClick={() => setShowTeam(false)}
                  className="text-[10px] px-2 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-600"
                >
                  Close
                </button>
              </div>

              {teamLoading && (
                <p className="text-[11px] text-slate-300">
                  Loading team stats
                </p>
              )}

              {!teamLoading && teamError && (
                <p className="text-[10px] text-rose-300 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-400/50">
                  {teamError}
                </p>
              )}

              {!teamLoading && !teamError && teamStats && (
                <>
                  <div className="bg-slate-800 rounded-xl p-2 mb-2 border border-slate-700">
                    <p className="text-[10px] text-slate-300">
                      Total team size
                    </p>
                    <p className="text-lg font-semibold text-sky-300">
                      {teamStats.totalTeamSize}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Includes Level 1, 2, and 3 referrals.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {teamStats.levels.map((lvl) => (
                      <div
                        key={lvl.level}
                        className="bg-slate-800 rounded-xl p-2 border border-slate-700"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-slate-100 font-semibold">
                            Level {lvl.level}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Rate: {lvl.ratePercent}% on deposits
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-300">
                          Members:{" "}
                          <span className="text-sky-300">
                            {lvl.members}
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-300">
                          Approved volume:{" "}
                          <span className="text-emerald-300">
                            ₹{lvl.volume.toLocaleString("en-IN")}
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-300">
                          Estimated commission:{" "}
                          <span className="text-yellow-300 font-semibold">
                            ₹{lvl.commission.toLocaleString("en-IN")}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 bg-slate-800 rounded-xl p-2 border border-slate-700">
                    <p className="text-[10px] text-slate-300">
                      Total estimated earnings
                    </p>
                    <p className="text-lg font-semibold text-emerald-300">
                      ₹{teamStats.totalCommission.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[9px] text-slate-500 mt-1">
                      Actual credited rewards depend on your final payout
                      rules.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}





/* ======================================================================
   GAME SCREEN (RSX WINGOD)
====================================================================== */

function GameScreen({ user, token, onLogout, onUserUpdate, onBack }) {
  const [balance, setBalance] = useState(user.balance ?? 2500);
  const [gameType, setGameType] = useState("30s"); // 30s, 60s, 180s, 300s
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [roundSeconds, setRoundSeconds] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);

  const [resultColorInput, setResultColorInput] = useState("AUTO");
  const [resultSizeInput, setResultSizeInput] = useState("AUTO");

  const [selectedBetKind, setSelectedBetKind] = useState(null); // "color" | "number" | "size"
  const [selectedBetValue, setSelectedBetValue] = useState(null); // "G","R","V","0"-"9","SMALL","BIG"
  const [selectedAmount, setSelectedAmount] = useState(null); // ab mainly reset ke liye

  const [message, setMessage] = useState(
    "Choose color / number / big-small and stake amount."
  );
  const [messageType, setMessageType] = useState("info"); // "info" | "win" | "loss"
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [isSettling, setIsSettling] = useState(false);

  const [showAdmin, setShowAdmin] = useState(false);
  const [resultsHistory, setResultsHistory] = useState([]); // last 50 periods
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultModalData, setResultModalData] = useState(null);
  const [showLockModal, setShowLockModal] = useState(false);

  const beepAudioRef = useRef(null);

  // 🔹 NEW: Tiranga-style modal states + limits
  const [betModalOpen, setBetModalOpen] = useState(false);
  const [activeBet, setActiveBet] = useState(null); // { betKind, betValue, label }
  const MIN_BET = 10;
  const MAX_BET = 100000;

  const COLOR_OPTIONS = [
    { id: "G", label: "Green", multiplier: 2 },
    { id: "V", label: "Violet", multiplier: 2 },
    { id: "R", label: "Red", multiplier: 2 },
  ];

  const GAME_TYPES = [
    { id: "30s", label: "30 sec" },
    { id: "60s", label: "1 min" },
    { id: "180s", label: "3 min" },
    { id: "300s", label: "5 min" },
  ];

  const getGameSeconds = (type) => {
    switch (type) {
      case "30s":
        return 30;
      case "60s":
        return 60;
      case "180s":
        return 180;
      case "300s":
        return 300;
      default:
        return 30;
    }
  };

  const syncBalance = async (b) => {
    try {
      await fetch(`${API_BASE}/api/auth/balance`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ balance: b }),
      });
    } catch (e) {
      console.error("Failed to sync balance", e);
    }
  };

  // Clock based period/time – sab users same period dekhenge
  const computePeriodAndTime = (type) => {
    const secs = getGameSeconds(type);
    const nowSec = Math.floor(Date.now() / 1000);
    const index = Math.floor(nowSec / secs);
    const period = `${type}-${index}`;
    const elapsed = nowSec % secs;
    const remaining = secs - elapsed;
    return { secs, period, remaining };
  };

  const resetPeriodForGameType = (type) => {
    const { secs, period, remaining } = computePeriodAndTime(type);
    setCurrentPeriod(period);
    setRoundSeconds(secs);
    setTimeLeft(remaining);
    setMessage(
      `Live round • ${type} · Period ${period}. Place bet before last 10 seconds.`
    );
    setMessageType("info");
  };

  const loadResultsHistory = async (type) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/game/results?gameType=${type}&limit=50`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
        ? data.results
        : [];

      setResultsHistory(
        list.map((r) => ({
          period: r.period,
          number: r.number ?? r.resultNumber,
          color: r.color ?? r.resultColor, // "G","R","V"
          size: r.size,
        }))
      );
    } catch (e) {
      console.error("results history error", e);
      setResultsHistory([]);
    }
  };

  useEffect(() => {
    resetPeriodForGameType(gameType);
    loadResultsHistory(gameType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameType]);

  async function handleRoundEnd() {
  if (!currentPeriod) {
    resetPeriodForGameType(gameType);
    return;
  }

  try {
    setIsSettling(true);
    setMessage(`Settling bets for period ${currentPeriod}`);
    setMessageType("info");

    const res = await fetch(`${API_BASE}/api/game/settle`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gameType, period: currentPeriod }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Error while settling bets.");
      setMessageType("info");
      return;
    }

    // 🔧 yahan change
    const hadBets =
      data.hadBets === false
        ? false
        : true;

    if (!hadBets) {
      setMessage("No bets placed in this round from your account.");
      setMessageType("info");
      return;
    }

    if (data.resultNumber === undefined) {
      setMessage("Result not available from server.");
      setMessageType("info");
      return;
    }

    const newBal =
      typeof data.balance === "number" ? data.balance : balance;

    setBalance(newBal);
    onUserUpdate({ user, balance: newBal });
    syncBalance(newBal);

    const result = {
      period: currentPeriod,
      number: data.resultNumber,
      color: data.resultColor,
      size: data.size,
    };

    setResultsHistory((prev) => [result, ...prev].slice(0, 50));

    const isWinRound = (data.totalProfit || 0) > 0;

    if (isWinRound) {
      setMessage(
        `WIN • Result ${data.resultNumber} (${data.resultColor}, ${data.size}). Net return ₹${data.totalProfit}.`
      );
      setMessageType("win");
    } else {
      setMessage(
        `Better luck next time • Result ${data.resultNumber} (${data.resultColor}, ${data.size}).`
      );
      setMessageType("loss");
    }

    setResultModalData({
      status: isWinRound ? "win" : "loss",
      amount: data.totalProfit || 0,
      resultNumber: data.resultNumber,
      resultColor: data.resultColor,
      size: data.size,
      period: currentPeriod,
    });
    setShowResultModal(true);
    setTimeout(() => setShowResultModal(false), 3000);
  } catch (e) {
    console.error("Settle error", e);
    setMessage("Network error while settling bets.");
    setMessageType("info");
  } finally {
    setSelectedBetKind(null);
    setSelectedBetValue(null);
    setSelectedAmount(null);
    resetPeriodForGameType(gameType);
    setIsSettling(false);
  }
}


  // TIMER
  useEffect(() => {
    if (!currentPeriod || roundSeconds <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleRoundEnd();
          return 0;
        }
        const next = prev - 1;

        if (
          next <= 10 &&
          next > 0 &&
          beepAudioRef.current &&
          typeof beepAudioRef.current.play === "function"
        ) {
          beepAudioRef.current.play().catch(() => {});
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPeriod, roundSeconds]);

  const placingDisabled =
    timeLeft <= 10 || isPlacingBet || isSettling || !currentPeriod;
  
    const placeBet = async () => {
    if (placingDisabled) {
      if (timeLeft <= 10) {
        setMessage("Bet window closed. Wait for next round.");
        setMessageType("info");
      }
      return;
    }

    if (!selectedBetKind || !selectedBetValue) {
      setMessage("Choose bet type and value.");
      setMessageType("info");
      return;
    }

    if (!selectedAmount) {
      setMessage("Choose an amount to stake.");
      setMessageType("info");
      return;
    }

    if (selectedAmount > balance) {
      setMessage("Not enough balance for this bet.");
      setMessageType("info");
      return;
    }

    try {
      setIsPlacingBet(true);
      const res = await fetch(`${API_BASE}/api/game/bet`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameType,
          betKind: selectedBetKind,
          betValue: selectedBetValue,
          amount: selectedAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to place bet.");
        setMessageType("info");
        return;
      }

      setBalance(data.bet.currentBalance);
      onUserUpdate({ user, balance: data.bet.currentBalance });
      syncBalance(data.bet.currentBalance);

      setMessage(
        `Bet placed on ${selectedBetKind.toUpperCase()} ${selectedBetValue} • ₹${selectedAmount} (Period ${data.bet.period}).`
      );
      setMessageType("info");
    } catch (e) {
      console.error("Bet place error", e);
      setMessage("Network error while placing bet.");
      setMessageType("info");
    } finally {
      setIsPlacingBet(false);
    }
  };


  // 🔹 NEW: server pe bet place karne ka generic function
  const placeBetOnServer = async (amount, betKind, betValue) => {
    if (placingDisabled) {
      // ⏳ Trade lock wali condition – last 10 seconds me
      if (timeLeft <= 10) {
        setShowLockModal(true);
        // auto close after ~1.8 sec
        setTimeout(() => setShowLockModal(false), 1800);
      }
      return;
    }

    if (!betKind || !betValue) {
      setMessage("Choose bet type and value.");
      setMessageType("info");
      return;
    }

    if (!amount) {
      setMessage("Choose an amount to stake.");
      setMessageType("info");
      return;
    }

    if (amount > balance) {
      setMessage("Not enough balance for this bet.");
      setMessageType("info");
      return;
    }

    try {
      setIsPlacingBet(true);
      const res = await fetch(`${API_BASE}/api/game/bet`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameType,
          betKind,
          betValue,
          amount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to place bet.");
        setMessageType("info");
        return;
      }

      setBalance(data.bet.currentBalance);
      onUserUpdate({ user, balance: data.bet.currentBalance });
      syncBalance(data.bet.currentBalance);

      setMessage(
        `Bet placed on ${betKind.toUpperCase()} ${betValue} • ₹${amount} (Period ${data.bet.period}).`
      );
      setMessageType("info");
    } catch (e) {
      console.error("Bet place error", e);
      setMessage("Network error while placing bet.");
      setMessageType("info");
    } finally {
      setIsPlacingBet(false);
    }
  };

  // 🔹 NEW: jab user kisi option pe tap kare
  const openBetModal = (betKind, betValue, label) => {
    if (placingDisabled) {
      if (timeLeft <= 10) {
        setMessage("Bet window closed. Wait for next round.");
        setMessageType("info");
      }
      return;
    }
    setSelectedBetKind(betKind);
    setSelectedBetValue(betValue);
    setActiveBet({ betKind, betValue, label });
    setBetModalOpen(true);
  };

  // 🔹 NEW: modal se amount confirm hua
  const handleConfirmBet = async (totalAmount) => {
    if (!activeBet) return;
    await placeBetOnServer(
      totalAmount,
      activeBet.betKind,
      activeBet.betValue
    );
    setBetModalOpen(false);
  };

  const progress =
    roundSeconds > 0 ? Math.max(0, (timeLeft / roundSeconds) * 100) : 0;

  const formatTime = (sec) => {
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const messageBg =
    messageType === "win"
      ? "bg-emerald-500/10 border-emerald-400 text-emerald-300"
      : messageType === "loss"
      ? "bg-rose-500/10 border-rose-400 text-rose-300"
      : "bg-slate-800/90 border-slate-700 text-slate-100";

    return (
    <div className="min-h-screen bg-[#020617] text-white flex items-stretch justify-center">
      {/* GLOBAL BG GLOW */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(249,115,22,0.18),_transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950 to-slate-950" />
      </div>

      {showAdmin && (
        <AdminPanel token={token} onClose={() => setShowAdmin(false)} />
      )}

      {/* MAIN SHELL */}
      <div className="w-full max-w-5xl px-3 py-4 md:py-6 flex flex-col md:flex-row gap-4">
        {/* LEFT: GAME CARD */}
        <div className="flex-1 flex items-stretch">
          <div className="w-full rounded-[28px] border border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 relative overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.9)]">
            {/* top glow stripe */}
            <div className="absolute inset-x-0 -top-16 h-32 bg-[radial-gradient(circle,_rgba(56,189,248,0.5),_transparent_60%)] opacity-40" />

            <audio ref={beepAudioRef} src="/beep.mp3" />

            {/* HEADER BAR */}
            <div className="relative px-4 pt-3 pb-2 border-b border-slate-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-slate-900/80 border border-sky-500/60 flex items-center justify-center overflow-hidden">
                  <img
                    src="/images/rsx-logo.png"
                    alt="RSX"
                    className="w-7 h-7 object-contain"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-sky-400">
                    RSX WINGOD
                  </p>
                  <h1 className="text-[18px] font-bold tracking-wide">
                    Live Color · Number
                  </h1>
                  <p className="text-[10px] text-slate-400">
                    Real-time rounds · Multi-period engine · Auto wallet sync
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-slate-500">Available balance</p>
                <p className="text-emerald-400 text-xl font-semibold leading-tight">
                  ₹ {balance.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-slate-500">
                  {user.username}{" "}
                  {user.role === "admin" && (
                    <span className="text-amber-400">· Admin</span>
                  )}
                </p>
                <div className="flex gap-2 justify-end mt-1">
                  {user.role === "admin" && (
                    <button
                      onClick={() => setShowAdmin(true)}
                      className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-400 text-emerald-300"
                    >
                      Control Center
                    </button>
                  )}
                  <button
                    onClick={onLogout}
                    className="text-[10px] px-2 py-1 rounded-full border border-rose-400/70 text-rose-300 bg-rose-500/5"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* HIGHLIGHT BANNER */}
            <div className="relative px-4 pt-3 flex gap-3">
              <div className="flex-1 rounded-3xl bg-gradient-to-r from-sky-500/15 via-emerald-500/10 to-purple-500/10 border border-sky-500/25 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] text-sky-300/80">
                      Current period · {gameType}
                    </p>
                    <p className="text-[11px] font-mono text-sky-50">
                      {currentPeriod || "Syncing..."}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-300">
                      Place bets before{" "}
                      <span className="text-amber-300 font-semibold">
                        last 10 seconds
                      </span>{" "}
                      of the round.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-sky-300/80">
                      Time remaining
                    </p>
                    <p
                      className={`font-semibold ${
                        timeLeft <= 10
                          ? "text-amber-300 text-lg"
                          : "text-sky-50 text-[15px]"
                      }`}
                    >
                      {formatTime(timeLeft)}
                    </p>
                    <div className="mt-1 w-28 h-1.5 rounded-full bg-slate-900/70 overflow-hidden ml-auto">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 via-yellow-300 to-rose-400"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[9px] text-slate-400">
                      Auto settle at 0 sec
                    </p>
                  </div>
                </div>
              </div>

              {/* MONEY IMAGE CARD */}
              <div className="hidden sm:block w-28 relative">
                <div className="w-full h-full rounded-3xl bg-slate-900/90 border border-amber-400/40 flex items-center justify-center overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.9)]">
                  <img
                    src="/images/money-glow.png"
                    alt="Trading capital"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
              </div>
            </div>

            {/* GAME TYPE TABS + INFO STRIP */}
            <div className="relative px-4 mt-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 bg-slate-900/80 rounded-2xl p-1 flex gap-1 border border-slate-800">
                  {GAME_TYPES.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGameType(g.id)}
                      className={`flex-1 py-1.5 rounded-xl text-[11px] ${
                        gameType === g.id
                          ? "bg-sky-500 text-slate-950 font-semibold shadow"
                          : "text-slate-300"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
                <div className="hidden sm:block text-[10px] text-right text-slate-400 w-32">
                  Live demo engine ·{" "}
                  <span className="text-emerald-300">No lag</span> ·{" "}
                  <span className="text-amber-300">Auto result</span>
                </div>
              </div>
            </div>

            {/* MESSAGE BAR */}
            <div className="relative px-4 mt-3">
              <div
                className={`text-[11px] px-3 py-2 rounded-2xl border ${messageBg} backdrop-blur-sm`}
              >
                {message}
              </div>
            </div>

            {/* MAIN CONTENT: LEFT bet grid + RIGHT history */}
            <div className="relative px-4 mt-3 pb-3 flex flex-col lg:flex-row gap-3">
              {/* BETTING PANEL */}
              <div className="flex-1 rounded-3xl bg-slate-900/90 border border-slate-800 px-3 py-3 space-y-3">
                {/* COLOR ROW */}
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-slate-200 font-semibold">
                    Color selection
                  </p>
                  <p className="text-[10px] text-slate-500">
                    All colors return{" "}
                    <span className="text-emerald-300 font-semibold">
                      x2.0
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      disabled={placingDisabled}
                      onClick={() => {
                        setSelectedBetKind("color");
                        setSelectedBetValue(c.id);
                      }}
                      className={`flex-1 py-2 rounded-2xl border text-[11px] font-medium shadow-sm ${
                        selectedBetKind === "color" &&
                        selectedBetValue === c.id
                          ? "border-emerald-400 text-emerald-300 bg-emerald-500/10"
                          : "border-slate-700 text-slate-100 bg-slate-800"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* NUMBER GRID */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] text-slate-200 font-semibold">
                      Number (0–9)
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Exact hit{" "}
                      <span className="text-amber-300 font-semibold">
                        x10.0
                      </span>
                    </p>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <button
                        key={i}
                        disabled={placingDisabled}
                        onClick={() => {
                          setSelectedBetKind("number");
                          setSelectedBetValue(String(i));
                        }}
                        className={`h-8 rounded-full text-[11px] font-semibold border flex items-center justify-center ${
                          selectedBetKind === "number" &&
                          selectedBetValue === String(i)
                            ? "bg-amber-400 text-slate-950 border-amber-300 shadow"
                            : "bg-slate-800 border-slate-700 text-slate-100"
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SIZE (BIG/SMALL) */}
                <div>
                  <p className="text-[11px] text-slate-200 font-semibold mb-1">
                    Size (Big / Small)
                  </p>
                  <div className="flex items-center justify-between">
                    <button
                      disabled={placingDisabled}
                      onClick={() => {
                        setSelectedBetKind("size");
                        setSelectedBetValue("BIG");
                      }}
                      className={`flex-1 mr-1 py-2 rounded-2xl border text-[11px] font-semibold ${
                        selectedBetKind === "size" &&
                        selectedBetValue === "BIG"
                          ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow"
                          : "bg-slate-800 border-slate-700 text-slate-100"
                      }`}
                    >
                      BIG (5–9) · x2.0
                    </button>
                    <button
                      disabled={placingDisabled}
                      onClick={() => {
                        setSelectedBetKind("size");
                        setSelectedBetValue("SMALL");
                      }}
                      className={`flex-1 ml-1 py-2 rounded-2xl border text-[11px] font-semibold ${
                        selectedBetKind === "size" &&
                        selectedBetValue === "SMALL"
                          ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow"
                          : "bg-slate-800 border-slate-700 text-slate-100"
                      }`}
                    >
                      SMALL (0–4) · x2.0
                    </button>
                  </div>
                </div>

                {/* AMOUNT + CTA */}
                <div className="mt-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] text-slate-200 font-semibold">
                      Stake amount
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Balance:{" "}
                      <span className="text-emerald-300">
                        ₹ {balance.toLocaleString("en-IN")}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {BET_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        disabled={placingDisabled}
                        onClick={() => setSelectedAmount(amt)}
                        className={`flex-1 py-1.5 rounded-full border text-[11px] ${
                          selectedAmount === amt
                            ? "border-emerald-400 text-emerald-300 bg-emerald-500/10"
                            : "border-slate-700 text-slate-100 bg-slate-800"
                        }`}
                      >
                        ₹ {amt}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={placeBet}
                    disabled={placingDisabled}
                    className="w-full mt-3 py-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-yellow-300 to-rose-400 text-slate-900 text-sm font-semibold shadow disabled:opacity-60"
                  >
                    {timeLeft <= 10
                      ? "Trade window locked"
                      : isPlacingBet
                      ? "Placing bet..."
                      : "Place trade"}
                  </button>
                  <p className="mt-1 text-[9px] text-slate-500">
                    Trading is risky. Play responsibly. This is a demo-style
                    game UI.
                  </p>
                </div>
              </div>

              {/* RIGHT: HISTORY PANEL */}
              <div className="w-full lg:w-64 rounded-3xl bg-slate-900/90 border border-slate-800 px-3 py-3 flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-slate-200 font-semibold">
                    Recent results · {gameType}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Last {resultsHistory.length || 0}
                  </p>
                </div>

                {resultsHistory.length === 0 ? (
                  <p className="text-[11px] text-slate-500">
                    No result history yet for this game.
                  </p>
                ) : (
                  <div className="max-h-40 overflow-auto custom-scroll space-y-1 pr-1">
                    {resultsHistory.map((r, idx) => {
                      const col = r.color || "G";
                      const colorClass =
                        col === "G"
                          ? "bg-emerald-500"
                          : col === "R"
                          ? "bg-rose-500"
                          : "bg-indigo-500";
                      return (
                        <div
                          key={r.period + "-" + idx}
                          className="flex items-center justify-between bg-slate-900/80 px-2 py-1.5 rounded-2xl text-[11px] border border-slate-800"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white ${colorClass}`}
                            >
                              {r.number}
                            </div>
                            <div>
                              <p className="text-slate-100 font-mono">
                                {r.period}
                              </p>
                              <p className="text-slate-400 text-[10px]">
                                Color: {col} · Size: {r.size}
                              </p>
                            </div>
                          </div>
                          <div className="text-right text-[10px] text-slate-400">
                            {r.size === "BIG" ? "High" : "Low"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RESULT MODAL (same as pehle) */}
            {showResultModal && resultModalData && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                <div className="bg-slate-900 border border-slate-700 rounded-3xl px-4 py-4 w-72 text-center shadow-xl">
                  <p
                    className={`text-sm font-semibold ${
                      resultModalData.status === "win"
                        ? "text-emerald-300"
                        : "text-rose-300"
                    }`}
                  >
                    {resultModalData.status === "win"
                      ? "Congratulations"
                      : "Better luck next time"}
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Period {resultModalData.period}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Result {resultModalData.resultNumber} (
                    {resultModalData.resultColor}, {resultModalData.size})
                  </p>
                  {resultModalData.status === "win" && (
                    <p className="text-lg text-emerald-300 mt-2 font-bold">
                      ₹ {resultModalData.amount}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500 mt-2">
                    Auto close in a few seconds
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: QUICK STATS SIDEBAR (future: wallet, deposits etc) */}
        <div className="hidden md:flex w-64 flex-col gap-3">
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 px-3 py-3">
            <p className="text-[11px] text-slate-400 uppercase tracking-[0.2em]">
              Session stats
            </p>
            <p className="mt-1 text-sm text-slate-100">
              Demo trading environment active.
            </p>
            <div className="mt-2 text-[11px] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Current game</span>
                <span className="text-sky-300 font-medium">{gameType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rounds auto-settle</span>
                <span className="text-emerald-300 font-medium">Yes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Wallet sync</span>
                <span className="text-amber-300 font-medium">Live</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-b from-emerald-500/15 via-sky-500/10 to-slate-950 border border-emerald-400/40 px-3 py-3">
            <p className="text-[11px] text-emerald-300 uppercase tracking-[0.2em]">
              Tip
            </p>
            <p className="mt-1 text-[11px] text-slate-100">
              Start with small trades. Use bonus & small stakes to test your
              strategy before going heavy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

}




function AviatorModal({ user, token, onClose, onUserUpdate }) {
  const [aviState, setAviState] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [bettingOpen, setBettingOpen] = useState(false);

  const [aviAmount, setAviAmount] = useState("");
  const [aviAutoX, setAviAutoX] = useState("2.00");

  const [displayX, setDisplayX] = useState(1.0);
  const [aviInfo, setAviInfo] = useState("");
  const [placingBet, setPlacingBet] = useState(false);
  const [settling, setSettling] = useState(false);

  const loadAviatorState = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/aviator/state`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setAviInfo(data.message || "Failed to load Aviator state.");
        return;
      }
      setAviState(data);
      setRemaining(data.remainingSec);
      setBettingOpen(data.bettingOpen);
      setDisplayX(1.0);
    } catch (e) {
      console.error("Aviator state error", e);
      setAviInfo("Network error while loading Aviator state.");
    }
  };

  // Modal open -> state load
  useEffect(() => {
    loadAviatorState();
  }, []);

  // Timer + last 5 sec lock
  useEffect(() => {
    if (remaining == null) return;
    if (remaining <= 0) return;

    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev == null) return prev;
        const next = prev - 1;
        if (next <= 5) setBettingOpen(false);
        if (next <= 0) return 0;
        return next;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [remaining]);

  // Simple multiplier animation jab round chal raha hai
  useEffect(() => {
    if (!aviState) return;
    if (remaining == null || remaining <= 0) return;

    const id = setInterval(() => {
      setDisplayX((prev) => +(prev + 0.05).toFixed(2));
    }, 100);

    return () => clearInterval(id);
  }, [aviState, remaining]);

  const handlePlaceBet = async () => {
    setAviInfo("");

    const amt = Number(aviAmount);
    if (!amt || amt <= 0) {
      setAviInfo("Enter valid bet amount.");
      return;
    }
    if (!bettingOpen) {
      setAviInfo("Betting is closed for this round.");
      return;
    }

    try {
      setPlacingBet(true);
      const res = await fetch(`${API_BASE}/api/aviator/bet`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amt,
          autoCashoutX: Number(aviAutoX) || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAviInfo(data.message || "Failed to place Aviator bet.");
        setPlacingBet(false);
        return;
      }

      if (typeof data.balance === "number") {
        onUserUpdate({ ...user, balance: data.balance });
      }

      setAviInfo(
        `Bet placed for round ${data.period} at amount ₹${amt} (auto cashout ${aviAutoX}x).`
      );
      setAviAmount("");
    } catch (e) {
      console.error("Aviator bet error", e);
      setAviInfo("Network error while placing Aviator bet.");
    } finally {
      setPlacingBet(false);
    }
  };

  const handleSettle = async () => {
    if (!aviState?.period) {
      setAviInfo("Round info missing. Wait for next round.");
      return;
    }

    try {
      setSettling(true);
      setAviInfo("");

      const res = await fetch(`${API_BASE}/api/aviator/settle`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ period: aviState.period }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAviInfo(data.message || "Failed to settle Aviator bets.");
        setSettling(false);
        return;
      }

      setDisplayX(data.crashMultiplier);

      if (typeof data.balance === "number") {
        onUserUpdate({ ...user, balance: data.balance });
      }

      if (data.totalProfit > 0) {
        setAviInfo(
          `Round ${data.period} crashed at ${data.crashMultiplier.toFixed(
            2
          )}x. You won ₹${data.totalProfit}.`
        );
      } else {
        setAviInfo(
          `Round ${data.period} crashed at ${data.crashMultiplier.toFixed(
            2
          )}x. No winning bets this round.`
        );
      }
    } catch (e) {
      console.error("Aviator settle error", e);
      setAviInfo("Network error while fetching Aviator result.");
    } finally {
      setSettling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-40">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-700 p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center mb-1">
          <div>
            <p className="text-[11px] text-sky-400 font-semibold">Aviator</p>
            <p className="text-xs text-slate-400">
              Time-based crash game · virtual panel
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[11px] px-2 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-600"
          >
            ✕ Close
          </button>
        </div>

        {/* Crash area */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-4 border border-slate-700">
          <p className="text-[11px] text-slate-400">
            Period:{" "}
            <span className="text-sky-300">
              {aviState?.period || "loading..."}
            </span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Time left:{" "}
            <span className="text-emerald-300">
              {remaining != null ? `${remaining}s` : "--"}
            </span>{" "}
            {bettingOpen ? "(Betting open)" : "(Betting closed)"}
          </p>

          <div className="mt-4 flex flex-col items-center">
            <p className="text-[11px] text-slate-400 mb-1">Current multiplier</p>
            <p className="text-4xl font-bold text-emerald-400">
              {displayX.toFixed(2)}x
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-slate-800 rounded-2xl p-3 border border-slate-700 text-xs flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <p className="text-[11px] text-slate-300 mb-1">Amount</p>
              <input
                value={aviAmount}
                onChange={(e) => setAviAmount(e.target.value)}
                className="w-full bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-700 outline-none text-xs"
                placeholder="Enter bet amount"
              />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-slate-300 mb-1">
                Auto cashout (x)
              </p>
              <input
                value={aviAutoX}
                onChange={(e) => setAviAutoX(e.target.value)}
                className="w-full bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-700 outline-none text-xs"
                placeholder="e.g. 2.00"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={handlePlaceBet}
              disabled={!bettingOpen || placingBet}
              className="flex-1 py-1.5 rounded-lg bg-emerald-500 text-slate-900 font-semibold disabled:opacity-60"
            >
              {bettingOpen
                ? placingBet
                  ? "Placing..."
                  : "Place bet"
                : "Betting closed"}
            </button>
            <button
              type="button"
              onClick={handleSettle}
              disabled={settling}
              className="flex-1 py-1.5 rounded-lg bg-sky-500 text-slate-900 font-semibold disabled:opacity-60"
            >
              {settling ? "Checking..." : "Check result"}
            </button>
          </div>
        </div>

        {aviInfo && (
          <p className="text-[11px] text-slate-300 bg-slate-800 px-3 py-2 rounded-2xl border border-slate-700">
            {aviInfo}
          </p>
        )}
      </div>
    </div>
  );
}




/* ======================================================================
   ROOT APP
====================================================================== */

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [checking, setChecking] = useState(true);
  const [screen, setScreen] = useState("lobby"); // 'lobby' | 'godwin' | 'wallet' | 'account'

  useEffect(() => {
    const saved = localStorage.getItem("gw_token");
    if (!saved) {
      setChecking(false);
      return;
    }

    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${saved}` },
        });
        const data = await res.json();
        if (!res.ok || !data.id) {
          localStorage.removeItem("gw_token");
          setChecking(false);
          return;
        }
        setUser(data);
        setToken(saved);
      } catch (e) {
        console.error(e);
        localStorage.removeItem("gw_token");
      } finally {
        setChecking(false);
      }
    };

    check();
  }, []);

  const handleAuthSuccess = (u, t) => {
    setUser(u);
    setToken(t);
    setScreen("lobby");
  };

  const handleLogout = () => {
    localStorage.removeItem("gw_token");
    setUser(null);
    setToken(null);
    setScreen("lobby");
  };

  const handleUserUpdate = (u) => {
    setUser(u);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Checking session
      </div>
    );
  }

  if (!user || !token) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  if (screen === "godwin") {
    return (
      <GameScreen
        user={user}
        token={token}
        onLogout={handleLogout}
        onUserUpdate={handleUserUpdate}
        onBack={() => setScreen("lobby")}
      />
    );
  }

    if (screen === "promotions") {
    return (
      <PromotionScreen
        user={user}
        token={token}
        onBackToLobby={() => setScreen("lobby")}
        onLogout={handleLogout}
        onUserUpdate={handleUserUpdate}
      />
    );
  }


  if (screen === "wallet") {
    return (
      <WalletScreen
        user={user}
        token={token}
        onBackToLobby={() => setScreen("lobby")}
        onLogout={handleLogout}
        onUserUpdate={handleUserUpdate}
      />
    );
  }




if (screen === "account") {
  return (
    <AccountScreen
      user={user}
      token={token}
      onBackToLobby={() => setScreen("lobby")}
      onLogout={handleLogout}
    />
  );
}


  // default = lobby
  // default = lobby
  return (
    <GameLobby
      user={user}
      onLogout={handleLogout}
      onOpenGame={(id) => {
        if (id === "godwin") setScreen("godwin");
      }}
      onOpenWallet={() => setScreen("wallet")}
      onOpenAccount={() => setScreen("account")}
      onOpenPromotions={() => setScreen("promotions")} // 🆕 yaha
      
    />
  );

}
