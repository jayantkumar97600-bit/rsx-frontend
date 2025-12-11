import React, { useEffect, useRef, useState } from "react";

/**
 * ResultModalAdvanced
 * props:
 *  - isOpen (bool)
 *  - data { status: "win"|"loss", amount, period, resultNumber, resultColor, size }
 *  - onClose()
 */
export default function ResultModalAdvanced({ isOpen, data, onClose }) {
  const canvasRef = useRef(null);
  const winAudioRef = useRef(null);
  const loseAudioRef = useRef(null);
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !data) return;

    // Play sound
    try {
      if (data.status === "win") {
        winAudioRef.current && winAudioRef.current.play().catch(()=>{});
      } else {
        loseAudioRef.current && loseAudioRef.current.play().catch(()=>{});
      }
    } catch (e) {
      // ignore
    }

    // Vibrate (mobile)
    if (navigator.vibrate) {
      const pattern = data.status === "win" ? [120,40,120] : [80,40,80];
      navigator.vibrate(pattern);
    }

    // Start confetti + particle burst
    launchConfettiBurst(canvasRef.current, data.status === "win" ? "win" : "loss");

    // animate count-up if win
    if (data.status === "win") {
      animateCount(0, Number(data.amount || 0), 900);
    } else {
      setCount(0);
    }

    // Auto-close after few seconds
    const tid = setTimeout(() => {
      onClose && onClose();
    }, 3500);

    return () => {
      clearTimeout(tid);
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, data]);

  // count-up with requestAnimationFrame
  const animateCount = (from, to, duration = 900) => {
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // easing (easeOutCubic)
      const ease = 1 - Math.pow(1 - t, 3);
      const cur = Math.floor(from + (to - from) * ease);
      setCount(cur);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  return (
    <>
      {isOpen && data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          {/* Canvas for confetti/particles */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

          <div
            className={`relative z-10 w-[320px] sm:w-[400px] rounded-3xl p-5 bg-gradient-to-br from-slate-900/80 to-slate-950/95 border ${data.status === "win" ? "border-emerald-400/40" : "border-rose-400/40"} shadow-xl transform transition-all 
              animate-popIn
            `}
          >
            {/* Glow ring */}
            <div className={`absolute -inset-1 rounded-3xl blur-[24px] opacity-40 ${data.status === "win" ? "bg-emerald-400/20" : "bg-rose-400/20"}`} />

            <div className="relative text-center">
              <div className="flex items-center justify-center mb-3">
                {/* Icon circle */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${data.status === "win" ? "bg-gradient-to-tr from-emerald-400 to-emerald-600 shadow-[0_8px_40px_rgba(16,185,129,0.18)]" : "bg-gradient-to-tr from-rose-400 to-rose-600 shadow-[0_8px_40px_rgba(244,63,94,0.14)]"}`}>
                  {data.status === "win" ? "🏆" : "💔"}
                </div>
              </div>

              <h3 className={`text-lg font-extrabold ${data.status === "win" ? "text-emerald-300" : "text-rose-300"}`}>
                {data.status === "win" ? "Congratulations!" : "Better luck next time"}
              </h3>

              <p className="text-xs text-slate-400 mt-1">Period <span className="font-mono text-slate-100 ml-1">{data.period}</span></p>

              <div className="mt-3">
                <p className="text-sm text-slate-200">
                  Result: <span className="font-bold ml-1">{data.resultNumber}</span> <span className="text-slate-400 ml-2">({data.resultColor}, {data.size})</span>
                </p>
              </div>

              {/* Amount */}
              <div className="mt-4">
                {data.status === "win" ? (
                  <p className="text-3xl sm:text-4xl font-extrabold text-emerald-300 drop-shadow-[0_0_30px_rgba(72,255,166,0.12)]">
                    ₹ {Number(count).toLocaleString("en-IN")}
                  </p>
                ) : (
                  <p className="text-xl font-semibold text-rose-300">No win this round</p>
                )}
              </div>

              {/* CTA */}
              <div className="mt-5 flex gap-2 justify-center">
                <button
                  onClick={() => { onClose && onClose(); }}
                  className="px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-700 text-slate-100"
                >
                  Close
                </button>

                {data.status === "win" && (
                  <button
                    onClick={() => { /* you can open wallet or claim UI */ onClose && onClose(); }}
                    className="px-4 py-2 rounded-2xl bg-emerald-400 text-slate-900 font-semibold"
                  >
                    Collect
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* hidden audios */}
          <audio ref={winAudioRef} src="/sounds/win.mp3" preload="auto" />
          <audio ref={loseAudioRef} src="/sounds/lose.mp3" preload="auto" />
        </div>
      )}
    </>
  );
}

/* ------------------------
   Confetti / particle JS
   ------------------------ */
function launchConfettiBurst(canvas, type = "win") {
  if (!canvas) return;
  // prepare canvas
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  ctx.scale(dpr, dpr);

  const colors = type === "win"
    ? ["#06b6d4","#10b981","#34d399","#bef264","#f6d365","#ffd166"]
    : ["#f43f5e","#fb7185","#fb923c","#fb7185","#f97316"];

  // particles
  const particles = [];
  const cx = canvas.clientWidth / 2;
  const cy = canvas.clientHeight * 0.38;

  const total = type === "win" ? 90 : 45;
  for (let i = 0; i < total; i++) {
    particles.push(createParticle(cx, cy, colors[i % colors.length]));
  }

  let t0 = performance.now();
  let running = true;

  function frame(now) {
    const dt = now - t0;
    t0 = now;
    // fade background area slightly (clear with alpha)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // update & draw
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += p.gravity * (dt / 16);
      p.x += p.vx * (dt / 16);
      p.y += p.vy * (dt / 16);
      p.vx *= 0.995;
      p.vy *= 0.995;
      p.life -= dt;
      // draw
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r, p.r * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      // remove
      if (p.life <= 0 || p.y > canvas.clientHeight + 30) {
        particles.splice(i, 1);
      }
    }

    if (particles.length > 0 && running) {
      requestAnimationFrame(frame);
    } else {
      // finished: clear quickly
      setTimeout(() => {
        try {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        } catch (e) {}
      }, 200);
      running = false;
    }
  }
  requestAnimationFrame(frame);
}

function createParticle(cx, cy, color) {
  const angle = (Math.random() * Math.PI * 2);
  const speed = 2 + Math.random() * 9;
  return {
    x: cx + (Math.random() - 0.5) * 24,
    y: cy + (Math.random() - 0.5) * 24,
    vx: Math.cos(angle) * speed * (Math.random() * 1.2),
    vy: Math.sin(angle) * speed * (Math.random() * 1.2) - (2 + Math.random() * 6),
    gravity: 0.25 + Math.random() * 0.25,
    r: 2 + Math.random() * 4,
    life: 900 + Math.random() * 1200,
    color,
  };
}
