/**
 * AiCoreOrb.tsx
 * High-Tech Concentric Particle AI Core Sphere & Energy Orb
 * Faithfully replaces the wireframe figure with a multi-layered cybernetic reactor:
 * - 3D concentric particle sphere with dynamic rotation, depth projection, and audio reactivity.
 * - Multi-tier rotating gyroscopic reticle rings (dashed, segmented, degree ticks).
 * - Central glowing "START AI" interactive energy hub button with neon pulse aura.
 * - Volumetric pedestal emitter with concentric laser rings and particle plumes.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Zap, Mic, Volume2, Sparkles, Orbit, Radio, Cpu } from 'lucide-react';
import { TaraEmotion } from '../types';

interface AiCoreOrbProps {
  isSpeaking: boolean;
  isListening: boolean;
  isHandsFreeMode: boolean;
  currentEmotion?: TaraEmotion;
  onTapCore?: () => void;
  className?: string;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  baseRadius: number;
  theta: number;
  phi: number;
  speed: number;
  size: number;
  alpha: number;
}

export const AiCoreOrb: React.FC<AiCoreOrbProps> = ({
  isSpeaking,
  isListening,
  isHandsFreeMode,
  currentEmotion = 'calm_caring',
  onTapCore,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angleY = 0;
    let angleX = 0.15;
    let ringRot1 = 0;
    let ringRot2 = 0;
    let pulsePhase = 0;

    // Handle high DPI
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize 3D particles on a spherical shell
    const PARTICLE_COUNT = 240;
    const particles: Particle3D[] = [];
    const baseSphereRadius = 110;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Golden spiral distribution on sphere
      const phi = Math.acos(1 - (2 * (i + 0.5)) / PARTICLE_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      particles.push({
        x: 0,
        y: 0,
        z: 0,
        baseRadius: baseSphereRadius + (Math.random() - 0.5) * 16,
        theta,
        phi,
        speed: (Math.random() * 0.004 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
        size: Math.random() * 2.2 + 1.2,
        alpha: Math.random() * 0.5 + 0.4,
      });
    }

    // Outer orbiting data dust particles
    const DUST_COUNT = 60;
    const dustParticles: { x: number; y: number; z: number; orbitR: number; speed: number; angle: number; yOffset: number }[] = [];
    for (let i = 0; i < DUST_COUNT; i++) {
      dustParticles.push({
        x: 0,
        y: 0,
        z: 0,
        orbitR: 140 + Math.random() * 70,
        speed: (Math.random() * 0.015 + 0.005) * (i % 2 === 0 ? 1 : -1),
        angle: Math.random() * Math.PI * 2,
        yOffset: (Math.random() - 0.5) * 60,
      });
    }

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2 - 10;

      // Dynamic energy dynamics based on speech / listening states
      const speedMultiplier = isSpeaking ? 3.2 : isListening ? 2.0 : 1.0;
      angleY += 0.008 * speedMultiplier;
      ringRot1 += 0.012 * speedMultiplier;
      ringRot2 -= 0.009 * speedMultiplier;
      pulsePhase += 0.04 * speedMultiplier;

      const currentPulse = Math.sin(pulsePhase) * (isSpeaking ? 14 : isListening ? 8 : 4);
      const sphereRadius = baseSphereRadius + currentPulse;

      // Color scheme based on state (pure high-tech cyber cyan and sky blue)
      const primaryColor = isListening
        ? { r: 56, g: 189, b: 248 } // Sky Cyan / Listening
        : isSpeaking
        ? { r: 0, g: 240, b: 255 } // Electric Cyan
        : { r: 14, g: 165, b: 233 }; // Deep Cyan / Sky

      // 1. PEDESTAL EMITTER BASE (Holographic Floor Platform underneath the Orb)
      const pedestalY = centerY + 170;
      ctx.save();
      ctx.translate(centerX, pedestalY);

      // Radial base spotlight gradient
      const baseGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 180);
      baseGrad.addColorStop(0, `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.35)`);
      baseGrad.addColorStop(0.5, `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.08)`);
      baseGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 170, 42, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outer concentric ring
      ctx.strokeStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.4)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 150, 36, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating dashed ring
      ctx.save();
      ctx.rotate(ringRot2 * 0.5);
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.6)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 120, 28, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Inner glowing core ring
      ctx.strokeStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.8)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 70, 16, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Vertical energy lift rays rising from pedestal to orb
      for (let i = 0; i < 6; i++) {
        const rayAngle = (i / 6) * Math.PI * 2 + ringRot1 * 0.8;
        const rx = Math.cos(rayAngle) * 90;
        const ry = Math.sin(rayAngle) * 22;
        const rayGrad = ctx.createLinearGradient(rx, ry, rx * 0.3, -130);
        rayGrad.addColorStop(0, `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.6)`);
        rayGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.strokeStyle = rayGrad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx * 0.4, -130);
        ctx.stroke();
      }
      ctx.restore();

      // 2. CENTRAL AMBIENT GLOW AURA
      const auraGrad = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, sphereRadius + 60);
      auraGrad.addColorStop(0, `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.22)`);
      auraGrad.addColorStop(0.5, `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.08)`);
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, sphereRadius + 60, 0, Math.PI * 2);
      ctx.fill();

      // 3. CONCENTRIC ROTATING GYROSCOPIC RETICLE RINGS
      // Ring A (Tilted Plane 1)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(0.25);
      ctx.strokeStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.35)`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, sphereRadius + 24, (sphereRadius + 24) * 0.45, ringRot1, 0, Math.PI * 2);
      ctx.stroke();

      // Ring A markers (ticks)
      for (let k = 0; k < 12; k++) {
        const tickAngle = (k / 12) * Math.PI * 2 + ringRot1;
        const tx = Math.cos(tickAngle) * (sphereRadius + 24);
        const ty = Math.sin(tickAngle) * (sphereRadius + 24) * 0.45;
        ctx.fillStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.8)`;
        ctx.beginPath();
        ctx.arc(tx, ty, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Ring B (Counter-tilted Plane 2)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-0.35);
      ctx.setLineDash([12, 6, 3, 6]);
      ctx.strokeStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.45)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, sphereRadius + 38, (sphereRadius + 38) * 0.38, ringRot2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 4. PROJECT 3D PARTICLES ON SPHERICAL SHELL
      const projectedParticles: { x: number; y: number; z: number; size: number; alpha: number }[] = [];

      particles.forEach((p) => {
        p.theta += p.speed * speedMultiplier;
        const r = p.baseRadius + currentPulse;
        // 3D coordinates on sphere
        const px = r * Math.sin(p.phi) * Math.cos(p.theta);
        const py = r * Math.cos(p.phi);
        const pz = r * Math.sin(p.phi) * Math.sin(p.theta);

        // Rotate Y
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const x1 = px * cosY - pz * sinY;
        const z1 = px * sinY + pz * cosY;

        // Rotate X
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const y2 = py * cosX - z1 * sinX;
        const z2 = py * sinX + z1 * cosX;

        // Perspective projection
        const fov = 380;
        const scale = fov / (fov + z2);
        const projX = centerX + x1 * scale;
        const projY = centerY + y2 * scale;
        const depthAlpha = Math.max(0.12, Math.min(1.0, (z2 + r) / (2 * r)));

        projectedParticles.push({
          x: projX,
          y: projY,
          z: z2,
          size: p.size * scale,
          alpha: p.alpha * depthAlpha,
        });
      });

      // Sort back-to-front
      projectedParticles.sort((a, b) => a.z - b.z);

      // Draw particle connections (nearest neighbors for high-tech constellation effect)
      ctx.lineWidth = 0.6;
      for (let i = 0; i < projectedParticles.length; i += 2) {
        const p1 = projectedParticles[i];
        for (let j = i + 1; j < Math.min(i + 4, projectedParticles.length); j++) {
          const p2 = projectedParticles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 38) {
            const lineAlpha = (1 - dist / 38) * 0.25 * ((p1.alpha + p2.alpha) / 2);
            ctx.strokeStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw particle dots
      projectedParticles.forEach((p) => {
        ctx.fillStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Extra specular bloom on front-facing particles
        if (p.z > 40) {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.8})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 5. DRAW DATA DUST ORBITERS
      dustParticles.forEach((d) => {
        d.angle += d.speed;
        const dx = Math.cos(d.angle) * d.orbitR;
        const dz = Math.sin(d.angle) * d.orbitR;
        const dy = d.yOffset + Math.sin(d.angle * 2) * 12;

        const cosY = Math.cos(angleY * 0.5);
        const sinY = Math.sin(angleY * 0.5);
        const rx = dx * cosY - dz * sinY;
        const rz = dx * sinY + dz * cosY;

        const fov = 400;
        const scale = fov / (fov + rz);
        const px = centerX + rx * scale;
        const py = centerY + dy * scale;
        const alpha = Math.max(0.1, (rz + d.orbitR) / (2 * d.orbitR)) * 0.6;

        ctx.fillStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.4 * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      // 6. EQUATORIAL SCANLINE WAVE
      const scanY = centerY + Math.sin(pulsePhase * 0.8) * (sphereRadius * 0.7);
      const scanWidth = Math.sqrt(Math.max(0, sphereRadius * sphereRadius - Math.pow(scanY - centerY, 2))) * 1.05;
      if (scanWidth > 10) {
        const scanGrad = ctx.createLinearGradient(centerX - scanWidth, scanY, centerX + scanWidth, scanY);
        scanGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
        scanGrad.addColorStop(0.5, `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.7)`);
        scanGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.strokeStyle = scanGrad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(centerX - scanWidth, scanY);
        ctx.lineTo(centerX + scanWidth, scanY);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isSpeaking, isListening, currentEmotion]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full h-full flex items-center justify-center select-none overflow-hidden ${className}`}
    >
      {/* 1. Underlying dynamic Canvas Particle Core */}
      <canvas ref={canvasRef} className="w-full h-full block pointer-events-auto" />

      {/* 2. THE CENTRAL "START AI" / "TARA CORE" INTERACTIVE ENERGY HUB */}
      <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-auto">
        <button
          type="button"
          onClick={onTapCore}
          className={`group relative flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95 ${
            isHandsFreeMode
              ? isListening
                ? 'bg-[#021d3a]/90 border-2 border-cyan-400 shadow-[0_0_45px_rgba(0,240,255,0.85)] animate-pulse'
                : isSpeaking
                ? 'bg-cyan-950/80 border-2 border-cyan-300 shadow-[0_0_45px_rgba(0,240,255,0.8)]'
                : 'bg-emerald-950/80 border-2 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.6)]'
              : 'bg-[#030d22]/85 border-2 border-cyan-400/80 shadow-[0_0_35px_rgba(0,240,255,0.45)] hover:border-cyan-300 hover:shadow-[0_0_50px_rgba(0,240,255,0.7)]'
          } backdrop-blur-md`}
          title={isHandsFreeMode ? 'TARA कॉल सक्रिय है (क्लिक करके बंद करें)' : 'START AI: क्लिक करके बातचीत शुरू करें'}
        >
          {/* Rotating outer dash rim on button */}
          <div className="absolute inset-[-4px] rounded-full border border-dashed border-cyan-400/50 animate-[spin_12s_linear_infinite] pointer-events-none" />
          <div className="absolute inset-[-10px] rounded-full border border-cyan-500/20 pointer-events-none" />

          {/* Central Core Icon & Glowing State */}
          <div className="flex flex-col items-center justify-center gap-1 z-10">
            {isListening ? (
              <Mic className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-200 animate-bounce" />
            ) : isSpeaking ? (
              <Volume2 className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-200 animate-pulse" />
            ) : (
              <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400 group-hover:text-cyan-200 group-hover:rotate-12 transition-transform duration-300" />
            )}

            <span className="font-heading font-black text-[11px] sm:text-xs tracking-widest text-cyan-200 group-hover:text-white uppercase drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">
              {isHandsFreeMode ? (isListening ? 'LISTENING' : 'SPEAKING') : 'START AI'}
            </span>

            <span className="text-[8px] font-mono text-cyan-400/80 tracking-wider">
              {isHandsFreeMode ? 'LIVE LINK' : 'TAP TO ENGAGE'}
            </span>
          </div>

          {/* Core Inner Glow */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-b from-cyan-400/10 via-cyan-500/5 to-transparent pointer-events-none" />
        </button>
      </div>

      {/* 3. Top Chamber Status & Frequency Tag */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 font-mono text-[9px] text-cyan-300/80 px-3 py-0.5 rounded-full bg-slate-950/80 border border-cyan-500/30 backdrop-blur-md pointer-events-none flex items-center gap-2 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span className="tracking-widest uppercase">CONCENTRIC AI REACTOR CORE • 99.8% COHERENCE</span>
      </div>
    </div>
  );
};
