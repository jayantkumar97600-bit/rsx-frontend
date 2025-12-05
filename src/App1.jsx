import { useEffect, useState, useRef } from "react";

const API_BASE = `http://${window.location.hostname}:5000`;

const MERCHANT_UPI = "8439736001-2@ybl"; // yahan apni UPI ID daal
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!loginId || !password) {
      setError(
        mode === "login"
          ? "Mobile number and password required"
          : "Mobile number and password required"
      );
      return;
    }

    // register ke time simple mobile length check
    if (mode === "register" && loginId.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setLoading(true);
      const body =
        mode === "login"
          ? {
              // login: mobile ya username dono accept
              mobile: loginId,
              username: loginId,
              password,
            }
          : {
              // register: is field ko mobile treat karo
              mobile: loginId,
              password,
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white px-3">
      <div className="w-full max-w-sm bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <h1 className="text-2xl font-bold text-center">GOD WIN</h1>
        <p className="text-xs text-slate-400 text-center mt-1">
          RSX WINGOD · Color & Number Engine
        </p>

        <div className="flex bg-slate-800 rounded-full p-1 mt-4 text-xs">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-1 rounded-full ${
              mode === "login" ? "bg-slate-900" : "text-slate-400"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-1 rounded-full ${
              mode === "register" ? "bg-slate-900" : "text-slate-400"
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-sm">
          <input
            placeholder={
              mode === "login"
                ? "Mobile number or username"
                : "Mobile number (one account per number)"
            }
            className="w-full bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 outline-none"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            autoComplete="off"
            inputMode="tel"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-slate-800 px-3 py-2 rounded-lg border border-slate-700 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 px-3 py-2 rounded">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-gradient-to-r from-emerald-400 via-yellow-300 to-rose-400 text-slate-900 rounded-xl font-semibold disabled:opacity-60"
          >
            {loading
              ? "Please wait"
              : mode === "login"
              ? "Login"
              : "Register & Login"}
          </button>
        </form>

        <p className="text-[10px] text-slate-500 text-center mt-3">
          Welcome to GOD WIN platform.:{" "}
          <span className="font-mono">PLAY AND WIN</span> (type in the
          mobile field).
        </p>
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
                        prev,
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
                        prev,
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
                        prev,
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
                        prev,
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
                <div className="flex flex-wrap gap-2 items-center mb-2">
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

                  <div>
                    <p className="text-slate-300 mb-1">Result number</p>
                    <input
                      value={resultNumberInput}
                      onChange={(e) => setResultNumberInput(e.target.value)}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-center"
                      placeholder="0-9"
                    />
                  </div>

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
                      {settingResult ? "Setting" : "Set result manually"}
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500">
                  Bets normal game screen se aayenge. Yahan se tum period ke
                  liye total exposure dekh sakte ho aur zarurat pade to result
                  manually set kar sakte ho.
                </p>
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

function GameLobby({
  user,
  onLogout,
  onOpenGame,
  onOpenWallet,
  onOpenAccount,
  onOpenPromotions, // ✅ new prop
}) {
  const balance = user.balance ?? 2500;

  const categories = [
    { id: "lottery", label: "Lottery" },
    { id: "original", label: "Original" },
    { id: "slots", label: "Slots" },
    { id: "fishing", label: "Fishing" },
    { id: "more", label: "More" },
  ];

  const games = [
    {
      id: "godwin",
      title: "RSX WINGOD",
      subtitle: "Color & number prediction",
      tag: "HOT",
      status: "Live",
      gradient: "from-sky-400 to-indigo-500",
      onClick: () => onOpenGame("godwin"),
    },
    {
      id: "aviator",
      title: "Aviator",
      subtitle: "Crash game (coming soon)",
      tag: "SOON",
      status: "Coming",
      gradient: "from-rose-500 to-red-600",
      onClick: () => alert("Aviator UI coming soon."),
    },
    {
      id: "boom",
      title: "Boom",
      subtitle: "Wheel spin (coming soon)",
      tag: "SOON",
      status: "Coming",
      gradient: "from-emerald-400 to-lime-500",
      onClick: () => alert("Boom UI coming soon."),
    },
    {
      id: "k3",
      title: "K3 Dice",
      subtitle: "Dice concept",
      tag: "SOON",
      status: "Coming",
      gradient: "from-purple-400 to-fuchsia-500",
      onClick: () => alert("K3 UI coming soon."),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-3">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden flex flex-col">
        {/* TOP BAR */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-sky-300 font-semibold">GOD WIN</p>
            <p className="text-xs text-slate-400">
              Game platform · Virtual mode
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-400">Balance</p>
            <p className="text-emerald-400 font-bold text-sm">
              ₹ {balance.toLocaleString("en-IN")}
            </p>
            <button
              onClick={onLogout}
              className="mt-1 text-[10px] text-rose-400 underline"
            >
              Logout
            </button>
          </div>
        </div>

        {/* HERO BANNER */}
        <div className="mx-4 mb-3 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 p-3 flex items-center justify-between shadow-lg">
          <div className="max-w-[60%]">
            <p className="text-[10px] uppercase tracking-wide text-sky-100">
              LIVE ROUND ENGINE
            </p>
            <p className="text-xs mt-1 text-sky-50">
              Color & number prediction experience with secure wallet system.
            </p>
          </div>
          <div className="text-right text-[11px] text-sky-50">
            <p>Welcome,</p>
            <p className="font-semibold">{user.username}</p>
          </div>
        </div>

        {/* CATEGORY ICONS */}
        <div className="px-4 flex gap-3 overflow-x-auto pb-2">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex flex-col items-center shrink-0 text-[11px]"
            >
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <span className="text-[11px]">{c.label[0]}</span>
              </div>
              <p className="mt-1 text-slate-300">{c.label}</p>
            </div>
          ))}
        </div>

        {/* SECTION: Lottery */}
        <div className="px-4 mt-2">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs font-semibold text-slate-100">Lottery</p>
            <p className="text-[10px] text-sky-400">More &gt;</p>
          </div>
          <p className="text-[10px] text-slate-400 mb-2">
            Fair, time-based prediction-style games with clear rounds.
          </p>
        </div>

        {/* GAME CARDS GRID */}
        <div className="px-4 pb-3 grid grid-cols-2 gap-3">
          {games.map((g) => (
            <button
              key={g.id}
              onClick={g.onClick}
              className="rounded-2xl bg-slate-800 overflow-hidden border border-slate-700 text-left shadow-sm hover:shadow-md hover:border-sky-400 transition"
            >
              <div
                className={`h-20 bg-gradient-to-br ${g.gradient} flex items-center justify-center`}
              >
                <p className="text-xs font-semibold">{g.title}</p>
              </div>
              <div className="px-3 py-2">
                <p className="text-[11px] text-slate-100">{g.subtitle}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span
                    className={`text-[10px] px-2 py-[2px] rounded-full ${
                      g.status === "Live"
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/70"
                        : "bg-slate-700/70 text-slate-200 border border-slate-600"
                    }`}
                  >
                    {g.status}
                  </span>
                  <span className="text-[9px] px-2 py-[2px] rounded-full bg-sky-500/15 text-sky-300 border border-sky-400/70">
                    {g.tag}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* BOTTOM NAV */}
        <div className="h-12 border-t border-slate-800 flex text-[11px] bg-slate-900/95">
          <button
            type="button"
            className="flex-1 flex flex-col items-center justify-center text-sky-300 font-semibold"
            onClick={onOpenPromotions}
          >
            <span>Promotion</span>
          </button>
          <button className="flex-1 flex flex-col items-center justify-center text-slate-300">
            <span>Games</span>
          </button>
          <button
            type="button"
            className="flex-1 flex flex-col items-center justify-center text-slate-300 hover:text-sky-300"
            onClick={onOpenWallet}
          >
            <span>Wallet</span>
          </button>
          <button
            type="button"
            className="flex-1 flex flex-col items-center justify-center text-slate-300 hover:text-sky-300"
            onClick={onOpenAccount}
          >
            <span>Account</span>
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
  const [depositReference, setDepositReference] = useState(""); // UPI txn id / remark

  // Withdraw
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Common for both
  const [method, setMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("");

  // Bank fields (withdraw)
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ifsc, setIfsc] = useState("");

  // UI state
  const [info, setInfo] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [depositing, setDepositing] = useState(false);

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

  /* ---------------- DEPOSIT ---------------- */

  const handleDeposit = async (e) => {
    e.preventDefault();
    setInfo("");

    const amt = Number(depositAmount);
    if (!amt || amt <= 0) {
      setInfo("Enter a valid deposit amount.");
      return;
    }
    if (amt < 100) {
      setInfo("Minimum deposit is ₹100.");
      return;
    }
    if (method === "UPI" && !upiId) {
      setInfo("Enter your UPI ID for deposit.");
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
          method,
          upiId: method === "UPI" ? upiId : undefined,
          reference: depositReference,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setInfo(data.message || "Failed to create deposit request.");
        setDepositing(false);
        return;
      }

      setInfo(
        `Deposit request of ₹${amt} submitted. Status: ${data.deposit?.status || "PENDING"}.`
      );
      setDepositAmount("");
      setDepositReference("");
    } catch (err) {
      console.error("Deposit error", err);
      setInfo("Network error while creating deposit request.");
    } finally {
      setDepositing(false);
    }
  };

  /* ---------------- WITHDRAW ---------------- */

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setInfo("");

    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) {
      setInfo("Enter a valid withdrawal amount.");
      return;
    }
    if (amt < 100) {
      setInfo("Minimum withdrawal is ₹100.");
      return;
    }
    if (amt > balance) {
      setInfo("Not enough balance to withdraw.");
      return;
    }

    // Method-specific validation
    if (method === "UPI") {
      if (!upiId) {
        setInfo("Enter UPI ID for withdrawal.");
        return;
      }
    } else if (method === "Bank") {
      if (!bankName || !bankAccount || !ifsc) {
        setInfo("Enter bank name, account number and IFSC for withdrawal.");
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
        setWithdrawing(false);
        return;
      }

      const newBal = typeof data.balance === "number" ? data.balance : balance;
      setBalance(newBal);
      onUserUpdate({ user, balance: newBal });
      syncBalance(newBal);

      setInfo(
        `Withdrawal request of ₹${amt} submitted. Status: ${data.withdrawal?.status || "PENDING"}.`
      );
      setWithdrawAmount("");
      // Bank details ko har baar clear nahi kara, taaki user bar-bar na daale
    } catch (err) {
      console.error("Withdraw error", err);
      setInfo("Network error while creating withdrawal request.");
    } finally {
      setWithdrawing(false);
    }
  };

  /* ---------------- UI ---------------- */

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
          <form
            onSubmit={handleDeposit}
            className="bg-slate-800 rounded-2xl p-3 border border-emerald-500/40"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-slate-100 font-semibold">Deposit</p>
              <span className="text-[10px] text-emerald-300 bg-emerald-500/10 px-2 py-[2px] rounded-full border border-emerald-400/60">
                Request & manual credit
              </span>
            </div>

            <div className="mb-2">
              <p className="text-[11px] text-slate-300 mb-1">Amount</p>
              <input
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-700 outline-none text-xs"
                placeholder="Enter amount"
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
                <option value="Bank">Bank (manual)</option>
              </select>
            </div>

            {method === "UPI" && (
              <div className="mb-2">
                <p className="text-[11px] text-slate-300 mb-1">Your UPI ID</p>
                <input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-700 outline-none text-xs"
                  placeholder="your-upi@bank"
                />
              </div>
            )}

            <div className="mb-2">
              <p className="text-[11px] text-slate-300 mb-1">
                Payment reference (optional)
              </p>
              <input
                value={depositReference}
                onChange={(e) => setDepositReference(e.target.value)}
                className="w-full bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-700 outline-none text-xs"
                placeholder="UPI txn id / remark"
              />
            </div>

            <button
              type="submit"
              disabled={depositing}
              className="w-full mt-2 py-1.5 rounded-lg bg-emerald-500 text-slate-900 font-semibold text-xs disabled:opacity-60"
            >
              {depositing ? "Submitting" : "Create deposit request"}
            </button>
          </form>

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
              <p className="text-[11px] text-slate-300 mb-1">Amount</p>
              <input
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-700 outline-none text-xs"
                placeholder="Enter amount"
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
                  <p className="text-[11px] text-slate-300 mb-1">Bank Name</p>
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
                  <p className="text-[11px] text-slate-300 mb-1">IFSC Code</p>
                  <input
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value.toUpperCase())}
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
              {withdrawing ? "Submitting" : "Withdraw request"}
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
  const [selectedAmount, setSelectedAmount] = useState(null);

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

  const beepAudioRef = useRef(null);

  const BET_AMOUNTS = [10, 50, 100, 500];

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

      // ✅ backend se clear flag aa raha hai
      const hadBets = data.hadBets === true;

      if (!hadBets || data.resultNumber === undefined) {
        // user ne is round me bet hi nahi lagayi
        setMessage("No bets placed in this round from your account.");
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

      setResultsHistory((prev) => [result, prev].slice(0, 50));

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
      // har round ke baad selection reset + next period sync
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
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-3">
      {showAdmin && (
        <AdminPanel token={token} onClose={() => setShowAdmin(false)} />
      )}

      <div className="w-full max-w-md rounded-[32px] border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-4 relative overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
        <audio ref={beepAudioRef} src="/beep.mp3" />

        {/* TOP BAR */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="text-[10px] px-2 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700"
              >
                ← Lobby
              </button>
            )}
            <div>
              <p className="text-[10px] text-sky-400 font-semibold">
                GOD WIN · RSX
              </p>
              <h1 className="text-lg font-bold tracking-wide">
                RSX WINGOD Live
              </h1>
              <p className="text-[10px] text-slate-400">
                Multi-period number · color · big/small
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-slate-400">Balance</p>
            <p className="text-emerald-400 text-lg font-semibold">
              ₹ {balance.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-slate-500">
              {user.username} {user.role === "admin" && "· Admin"}
            </p>
            <div className="flex gap-2 justify-end mt-1">
              {user.role === "admin" && (
                <button
                  onClick={() => setShowAdmin(true)}
                  className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-400 text-emerald-300"
                >
                  Admin
                </button>
              )}
              <button
                onClick={onLogout}
                className="text-[10px] text-rose-400 underline"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* GAME TYPE TABS */}
        <div className="mt-3 bg-slate-900/80 rounded-2xl p-1 flex gap-1">
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

        {/* PERIOD + TIMER CARD */}
        <div className="mt-3 rounded-2xl bg-gradient-to-r from-sky-500/20 via-sky-600/10 to-purple-600/10 border border-sky-500/30 px-3 py-2.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-sky-300/80">Current period</p>
            <p className="text-[11px] font-mono text-sky-100">
              {currentPeriod || "–"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-sky-300/80">Time remaining</p>
            <p
              className={`font-semibold ${
                timeLeft <= 10 ? "text-amber-300 text-lg" : "text-sky-50"
              }`}
            >
              {formatTime(timeLeft)}
            </p>
            <div className="mt-1 w-28 h-1.5 rounded-full bg-slate-900/60 overflow-hidden ml-auto">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-yellow-300 to-rose-400"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* MESSAGE BAR */}
        <div
          className={`mt-3 text-[11px] px-3 py-2 rounded-2xl border ${messageBg}`}
        >
          {message}
        </div>

        {/* BET PANEL */}
        <div className="mt-4 rounded-3xl bg-slate-900/90 border border-slate-800 px-3 py-3 space-y-3">
          {/* COLOR ROW */}
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-300 font-medium">Color</p>
            <p className="text-[10px] text-slate-500">
              All colors return x2.0
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
                  selectedBetKind === "color" && selectedBetValue === c.id
                    ? "border-emerald-400 text-emerald-300 bg-emerald-500/10"
                    : "border-slate-700 text-slate-100 bg-slate-800"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* NUMBER ROW */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] text-slate-300 font-medium">
                Number (0–9)
              </p>
              <p className="text-[10px] text-slate-500">Exact hit x10.0</p>
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

          {/* SIZE ROW */}
          <div className="flex items-center justify-between mt-1">
            <button
              disabled={placingDisabled}
              onClick={() => {
                setSelectedBetKind("size");
                setSelectedBetValue("BIG");
              }}
              className={`flex-1 mr-1 py-2 rounded-2xl border text-[11px] font-semibold ${
                selectedBetKind === "size" && selectedBetValue === "BIG"
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
                selectedBetKind === "size" && selectedBetValue === "SMALL"
                  ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow"
                  : "bg-slate-800 border-slate-700 text-slate-100"
              }`}
            >
              SMALL (0–4) · x2.0
            </button>
          </div>

          {/* AMOUNT + PLACE BUTTON */}
          <div className="mt-2">
            <p className="text-[11px] text-slate-300 mb-1">Amount</p>
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
                ? "Bet window closed"
                : isPlacingBet
                ? "Placing bet"
                : "Place bet"}
            </button>
          </div>
        </div>

        {/* RESULTS HISTORY */}
        <div className="mt-4 border-t border-slate-800 pt-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-slate-200 font-semibold">
              Game history · {gameType}
            </p>
            <p className="text-[10px] text-slate-500">
              Last {resultsHistory.length || 0} periods
            </p>
          </div>

          {resultsHistory.length === 0 ? (
            <p className="text-[11px] text-slate-500">
              No result history yet for this game.
            </p>
          ) : (
            <div className="max-h-40 overflow-auto space-y-1 pr-1">
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

        {/* RESULT MODAL */}
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
