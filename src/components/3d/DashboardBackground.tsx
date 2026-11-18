import { useEffect, useRef } from "react";

/**
 * DashboardBackground - Atmosfera visual cirúrgica e minimalista suíça.
 * Padrão Awwwards: Fundo ambiente com grade técnica pontilhada e partículas de telemetria sutis.
 */
export default function DashboardBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Partículas ultra-sutis de ambiente laboratorial
    const count = 30;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.3 + 0.1,
      color: Math.random() > 0.4 ? "20, 184, 166" : "139, 92, 246", // teal or violet
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Renderiza partículas sutis
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Luz ambiente cirúrgica suave no topo e rodapé */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-teal-500/[0.04] dark:bg-teal-500/[0.06] rounded-full blur-[140px]" />
      <div className="absolute bottom-1/3 left-1/4 w-[500px] h-[350px] bg-violet-600/[0.03] dark:bg-violet-600/[0.05] rounded-full blur-[140px]" />

      {/* Grade pontilhada técnica suíça */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Canvas com micro-partículas vivas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
