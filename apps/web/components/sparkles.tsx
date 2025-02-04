"use client";

import { useEffect, useRef, useState } from "react";
import { useMousePosition } from "@/hooks/use-mouse-position";

interface SparklesProps {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
}

class Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;

  constructor(
    canvasWidth: number,
    canvasHeight: number,
    minSize: number,
    maxSize: number
  ) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.size = Math.random() * (maxSize - minSize) + minSize;
    this.speedX = Math.random() * 0.5 - 0.25;
    this.speedY = Math.random() * 0.5 - 0.25;
  }

  update(
    canvasWidth: number,
    canvasHeight: number,
    mouseX: number,
    mouseY: number
  ) {
    this.x += this.speedX;
    this.y += this.speedY;

    // Wrap around screen edges
    if (this.x > canvasWidth) this.x = 0;
    if (this.x < 0) this.x = canvasWidth;
    if (this.y > canvasHeight) this.y = 0;
    if (this.y < 0) this.y = canvasHeight;

    // Mouse interaction
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 100) {
      const angle = Math.atan2(dy, dx);
      this.x -= Math.cos(angle) * 1;
      this.y -= Math.sin(angle) * 1;
    }
  }

  draw(ctx: CanvasRenderingContext2D, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export const SparklesCore = ({
  id = "tsparticles",
  background = "transparent",
  minSize = 0.6,
  maxSize = 1.4,
  particleDensity = 100,
  className = "h-full w-full",
  particleColor = "#FFFFFF",
}: SparklesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosition = useMousePosition();
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateDimensions();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const init = () => {
      particles = [];
      for (let i = 0; i < particleDensity; i++) {
        particles.push(
          new Particle(canvas.width, canvas.height, minSize, maxSize)
        );
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update(
          canvas.width,
          canvas.height,
          mousePosition.x,
          mousePosition.y
        );
        particle.draw(ctx, particleColor);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      if (typeof window === "undefined") return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      updateDimensions();
      init();
    };

    window.addEventListener("resize", handleResize);

    init();
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    maxSize,
    minSize,
    particleColor,
    particleDensity,
    mousePosition.x,
    mousePosition.y,
    dimensions.height,
    dimensions.width,
  ]);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      className={className}
      style={{
        background,
        width: dimensions.width,
        height: dimensions.height,
      }}
    />
  );
};
