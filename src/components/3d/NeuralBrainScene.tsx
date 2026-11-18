import { useEffect, useRef } from "react";

/**
 * NeuralBrainScene - Visualizador Sináptico de Alta Precisão (Swiss Clinical Minimalist)
 * Padrão Awwwards: Canvas 60 FPS com nós dinâmicos, pulsos sinápticos e interação com mouse.
 */
export function NeuralBrainScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth / 2);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Adaptação para telas Retina / High-DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", handleResize);

    // Mouse interativo
    const mouse = {
      x: width * 0.5,
      y: height * 0.5,
      targetX: width * 0.5,
      targetY: height * 0.5,
      isHovered: false,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.isHovered = true;
    };

    const handleMouseLeave = () => {
      mouse.isHovered = false;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // Criação dos nós sinápticos
    const nodeCount = Math.min(Math.floor((width * height) / 9000), 55);
    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseRadius: number;
      radius: number;
      color: string;
      pulseOffset: number;
      isCore: boolean;
    }

    const colors = [
      "rgba(20, 184, 166, ", // Teal
      "rgba(6, 182, 212, ",  // Cyan
      "rgba(139, 92, 246, ", // Violet
      "rgba(248, 250, 252, ", // Arctic White
    ];

    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const isCore = i < 6;
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (isCore ? 0.3 : 0.6),
        vy: (Math.random() - 0.5) * (isCore ? 0.3 : 0.6),
        baseRadius: isCore ? 3.5 : 1.8 + Math.random() * 1.5,
        radius: isCore ? 3.5 : 1.8,
        color: colors[i % colors.length],
        pulseOffset: Math.random() * Math.PI * 2,
        isCore,
      });
    }

    // Pulsos que viajam pelas sinapses
    interface Pulse {
      fromIndex: number;
      toIndex: number;
      progress: number;
      speed: number;
      color: string;
    }
    const pulses: Pulse[] = [];

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Suavização do mouse
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Grade clínica de fundo (Swiss grid dots)
      const gridSpacing = 48;
      ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
      for (let x = gridSpacing; x < width; x += gridSpacing) {
        for (let y = gridSpacing; y < height; y += gridSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Atualização dos nós
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        n.x += n.vx;
        n.y += n.vy;

        // Bouncing nas bordas
        if (n.x < 20 || n.x > width - 20) n.vx *= -1;
        if (n.y < 20 || n.y > height - 20) n.vy *= -1;

        // Leve atração ao mouse se próximo
        if (mouse.isHovered) {
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180 && dist > 20) {
            n.x += (dx / dist) * 0.35;
            n.y += (dy / dist) * 0.35;
          }
        }

        // Respiração do raio
        const pulse = Math.sin(frame * 0.03 + n.pulseOffset);
        n.radius = n.baseRadius + (n.isCore ? pulse * 1.2 : pulse * 0.4);
      }

      // Conexões e cálculo de sinapses
      const maxDistance = 140;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.28;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(20, 184, 166, ${alpha})`;
            ctx.lineWidth = dist < 70 ? 1 : 0.5;
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();

            // Ocasionalmente emite um pulso de sinapse
            if (Math.random() < 0.0015 && pulses.length < 12) {
              pulses.push({
                fromIndex: i,
                toIndex: j,
                progress: 0,
                speed: 0.015 + Math.random() * 0.02,
                color: n1.color,
              });
            }
          }
        }
      }

      // Renderização dos pulsos sinápticos
      for (let p = pulses.length - 1; p >= 0; p--) {
        const pulse = pulses[p];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          pulses.splice(p, 1);
          continue;
        }

        const n1 = nodes[pulse.fromIndex];
        const n2 = nodes[pulse.toIndex];
        if (!n1 || !n2) {
          pulses.splice(p, 1);
          continue;
        }

        const px = n1.x + (n2.x - n1.x) * pulse.progress;
        const py = n1.y + (n2.y - n1.y) * pulse.progress;

        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `${pulse.color}0.95)`;
        ctx.shadowColor = "rgba(20, 184, 166, 0.8)";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      // Renderização dos nós
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Glow central
        if (n.isCore) {
          const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * 3.5);
          grad.addColorStop(0, `${n.color}0.4)`);
          grad.addColorStop(1, `${n.color}0)`);
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${n.color}0.85)`;
        ctx.fill();

        // Borda ultra-fina estilo suíço
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto">
      {/* Luz ambiente clínica sutil */}
      <div className="absolute top-1/4 left-1/4 w-[460px] h-[460px] rounded-full bg-teal-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[140px] pointer-events-none" />

      {/* Canvas interativo */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
}
