"use client";

import React, { useEffect, useRef } from "react";

export function SnowfallEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      density: number;
      color: string;
      alpha: number;
    }> = [];

    // Reduced snow particles by half for a cleaner aesthetic
    const numParticles = Math.min(window.innerWidth / 6, 175);

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3 + 1, // 1 to 4 (slightly larger)
        density: Math.random() * numParticles,
        color: Math.random() > 0.85 ? "#93c5fd" : "#ffffff",
        alpha: Math.random() * 0.6 + 0.3, // 0.3 to 0.9 (more visible)
      });
    }

    let angle = 0;
    let animationFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < numParticles; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2, true);
        ctx.fill();
      }
      update();
    };

    const update = () => {
      angle += 0.01;
      for (let i = 0; i < numParticles; i++) {
        const p = particles[i];
        
        // Move particles down and left/right slowly
        p.y += Math.cos(angle + p.density) + 1 + p.radius / 2;
        p.x += Math.sin(angle) * 1.5;

        // Reset if it goes off screen
        if (p.x > width + 5 || p.x < -5 || p.y > height) {
          if (Math.random() > 0.3) {
            particles[i] = { ...p, x: Math.random() * width, y: -10 };
          } else {
            // Enter from the right if moving left, or left if moving right
            if (Math.sin(angle) > 0) {
              particles[i] = { ...p, x: -5, y: Math.random() * height };
            } else {
              particles[i] = { ...p, x: width + 5, y: Math.random() * height };
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10"
      style={{ opacity: 0.8 }}
    />
  );
}
