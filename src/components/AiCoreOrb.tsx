/**
 * AiCoreOrb.tsx
 * High-Tech Concentric Particle AI Core Sphere & Energy Orb for TARA OS
 * - 3D concentric particle sphere with dynamic rotation, depth projection, and voice reactivity.
 * - Multi-tier rotating gyroscopic reticle rings.
 * - Real-time status indicators: Thinking, Speaking, Listening, Ready.
 * - Volumetric pedestal emitter with concentric laser rings.
 */

import React, { useEffect, useRef } from 'react';
import { Zap, Mic, Volume2, Brain } from 'lucide-react';
import { TaraEmotion } from '../types';

interface AiCoreOrbProps {
  isSpeaking: boolean;
  isListening: boolean;
  isThinking?: boolean;
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
  isThinking = false,
  isHandsFreeMode,
  currentEmotion = 'calm_caring',
  onTapCore,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angleY = 0;
    const angleX = 0.16;
    let ringRot1 = 0;
    let ringRot2 = 0;
    let pulsePhase = 0;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, rect.width * dpr);
      canvas.height = Math.max(1, rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const PARTICLE_COUNT = 240;
    const particles: Particle3D[] = [];
    const baseSphereRadius = 108;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / PARTICLE_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      particles.push({
        x: 0,
        y: 0,
        z: 0,
        baseRadius: baseSphereRadius + (Math.random() - 0.5) * 14,
        theta,
        phi,
        speed: (Math.random() * 0.004 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
        size: Math.random() * 2.1 + 1.1,
        alpha: Math.random() * 0.5 + 0.4,
      });
    }

    const DUST_COUNT = 54;
    const dustParticles: { orbitR: number; speed: number; angle: number; yOffset: number }[] = [];
    for (let i = 0; i < DUST_COUNT; i++) {
      dustParticles.push({
        orbitR: 138 + Math.random() * 68,
        speed: (Math.random() * 0.015 + 0.005) * (i % 2 === 0 ? 1 : -1),
        angle: Math.random() * Math.PI * 2,
        yOffset: (Math.random() - 0.5) * 58,
      });
    }

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2 - 12;

      const speedMultiplier = isSpeaking ? 3.0 : isThinking ? 2.6 : isListening ? 1.9 : 1.0;
      angleY += 0.008 * speedMultiplier;
      ringRot1 += 0.012 * speedMultiplier;
      ringRot2 -= 0.009 * speedMultiplier;
      pulsePhase += 0.045 * speedMultiplier;

      const currentPulse = Math.sin(pulsePhase) * (isSpeaking ? 13 : isThinking ? 9 : isListening ? 7 : 3.5);
      const sphereRadius = baseSphereRadius + currentPulse;

      // Color scheme mapped strictly to live state
      const primaryColor = isListening
        ? { r: 16, g: 225, b: 178 } // Listening: Cyan-Emerald
        : isThinking
        ? { r: 96, g: 165, b: 250 } // Thinking: Luminous Cobalt-Cyan
        : isSpeaking
        ? { r: 0, g: 240, b: 255 } // Speaking: Electric Cyan
        : { r: 14, g: 165, b: 233 }; // Standby: Deep Sky Cyan

      // 1. Pedestal Emitter Base
      const pedestalY = centerY + 158;
      ctx.save();
      ctx.translate(centerX, pedestalY);

      const baseGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 170);
      baseGrad.addColorStop(0, `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.34)`);
      baseGrad.addColorStop(0.5, `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.08)`);
      baseGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 165, 38, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.4)`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(0, 0, 145, 33, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.save();
      ctx.rotate(ringRot2 * 0.5);
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.6)`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, 115, 26, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.strokeStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.8)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 68, 15, 0, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 6; i++) {
        const rayAngle = (i / 6) * Math.PI * 2 + ringRot1 * 0.8;
        const rx = Math.cos(rayAngle) * 86;
        const ry = Math.sin(rayAngle) * 20;
        const rayGrad = ctx.createLinearGradient(rx, ry, rx * 0.3, -120);
        rayGrad.addColorStop(0, `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.55)`);
        rayGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.strokeStyle = rayGrad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx * 0.4, -120);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Central Ambient Glow Aura
      const auraGrad = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, sphereRadius + 55);
      auraGrad.addColorStop(0, `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.24)`);
      auraGrad.addColorStop(0.55, `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.08)`);
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, sphereRadius + 55, 0, Math.PI * 2);
      ctx.fill();

      // 3. Concentric Gyroscopic Reticle Rings
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(0.25);
      ctx.strokeStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.35)`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, sphereRadius + 22, (sphereRadius + 22) * 0.44, ringRot1, 0, Math.PI * 2);
      ctx.stroke();

      for (let k = 0; k < 12; k++) {
        const tickAngle = (k / 12) * Math.PI * 2 + ringRot1;
        const tx = Math.cos(tickAngle) * (sphereRadius + 22);
        const ty = Math.sin(tickAngle) * (sphereRadius + 22) * 0.44;
        ctx.fillStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.85)`;
        ctx.beginPath();
        ctx.arc(tx, ty, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-0.35);
      ctx.setLineDash([12, 6, 3, 6]);
      ctx.strokeStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.45)`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(0, 0, sphereRadius + 36, (sphereRadius + 36) * 0.36, ringRot2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 4. 3D Particle Sphere Shell
      const projectedParticles: { x: number; y: number; z: number; size: number; alpha: number }[] = [];

      particles.forEach((p) => {
        p.theta += p.speed * speedMultiplier;
        const r = p.baseRadius + currentPulse;
        const px = r * Math.sin(p.phi) * Math.cos(p.theta);
        const py = r * Math.cos(p.phi);
        const pz = r * Math.sin(p.phi) * Math.sin(p.theta);

        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const x1 = px * cosY - pz * sinY;
        const z1 = px * sinY + pz * cosY;

        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const y2 = py * cosX - z1 * sinX;
        const z2 = py * sinX + z1 * cosX;

        const fov = 380;
        const scale = fov / (fov + z2);
        const projX = centerX + x1 * scale;
        const projY = centerY + y2 * scale;
        const depthAlpha = Math.max(0.14, Math.min(1.0, (z2 + r) / (2 * r)));

        projectedParticles.push({
          x: projX,
          y: projY,
          z: z2,
          size: p.size * scale,
          alpha: p.alpha * depthAlpha,
        });
      });

      projectedParticles.sort((a, b) => a.z - b.z);

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

      projectedParticles.forEach((p) => {
        ctx.fillStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.z > 40) {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.8})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 5. Orbiting Data Dust
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

      // 6. Equatorial Scanline Wave
      const scanY = centerY + Math.sin(pulsePhase * 0.8) * (sphereRadius * 0.7);
      const scanWidth = Math.sqrt(Math.max(0, sphereRadius * sphereRadius - Math.pow(scanY - centerY, 2))) * 1.05;
      if (scanWidth > 10) {
        const scanGrad = ctx.createLinearGradient(centerX - scanWidth, scanY, centerX + scanWidth, scanY);
        scanGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
        scanGrad.addColorStop(0.5, `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.72)`);
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
  }, [isSpeaking, isListening, isThinking, currentEmotion]);

  const statusLabel = isListening
    ? 'LISTENING'
    : isThinking
    ? 'THINKING'
    : isSpeaking
    ? 'SPEAKING'
    : isHandsFreeMode
    ? 'VOICE ACTIVE'
    : 'TARA CORE';

  const statusHindi = isListening
    ? 'सुन रही हूँ Boss, बोलिए...'
    : isThinking
    ? 'तारा सोच रही है...'
    : isSpeaking
    ? 'तारा बोल रही है...'
    : isHandsFreeMode
    ? 'लाइव वॉयस लिंक सक्रिय'
    : 'क्लिक करें और बात शुरू करें';

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center select-none overflow-hidden ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block pointer-events-auto" />

      {/* Central Interactive TARA Energy Hub */}
      <div className="absolute top-[47%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-auto">
        <button
          type="button"
          onClick={onTapCore}
          className={`group relative flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-md ${
            isListening
              ? 'bg-[#03262e]/90 border-2 border-emerald-400 shadow-[0_0_42px_rgba(16,225,178,0.75)]'
              : isThinking
              ? 'bg-[#071a38]/90 border-2 border-sky-400 shadow-[0_0_42px_rgba(56,189,248,0.75)]'
              : isSpeaking
              ? 'bg-[#032136]/90 border-2 border-cyan-300 shadow-[0_0_45px_rgba(0,240,255,0.8)]'
              : isHandsFreeMode
              ? 'bg-[#042436]/90 border-2 border-cyan-400 shadow-[0_0_35px_rgba(0,240,255,0.55)]'
              : 'bg-[#030d22]/85 border-2 border-cyan-400/80 shadow-[0_0_35px_rgba(0,240,255,0.4)] hover:border-cyan-300 hover:shadow-[0_0_48px_rgba(0,240,255,0.65)]'
          }`}
          title={
            isSpeaking
              ? 'तारा को रोककर बोलें'
              : isHandsFreeMode
              ? 'वॉयस कॉल बंद करें'
              : 'क्लिक करके बात शुरू करें'
          }
        >
          <div className="absolute inset-[-5px] rounded-full border border-dashed border-cyan-400/50 animate-[spin_14s_linear_infinite] pointer-events-none" />
          <div className="absolute inset-[-11px] rounded-full border border-cyan-500/20 pointer-events-none" />

          <div className="flex flex-col items-center justify-center gap-1 z-10">
            {isListening ? (
              <Mic className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-300" />
            ) : isThinking ? (
              <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-sky-300 animate-pulse" />
            ) : isSpeaking ? (
              <Volume2 className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-200 animate-pulse" />
            ) : (
              <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400 group-hover:text-cyan-200 transition-colors" />
            )}

            <span className="font-heading font-bold text-xs tracking-widest text-cyan-100 uppercase">
              {statusLabel}
            </span>

            <span className="text-[10px] font-mono text-cyan-300/85">
              {isHandsFreeMode ? 'LIVE' : 'TARA'}
            </span>
          </div>

          <div className="absolute inset-2 rounded-full bg-gradient-to-b from-cyan-400/10 via-cyan-500/5 to-transparent pointer-events-none" />
        </button>

        {/* Live Status Indicators Strip below Core */}
        <div className="mt-4 flex flex-col items-center gap-1.5 pointer-events-none">
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className={isListening ? 'text-emerald-300 font-semibold' : 'text-slate-500'}>
              Listening
            </span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className={isThinking ? 'text-sky-300 font-semibold' : 'text-slate-500'}>
              Thinking
            </span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className={isSpeaking ? 'text-cyan-300 font-semibold' : 'text-slate-500'}>
              Speaking
            </span>
          </div>
          <span className="text-xs text-cyan-200/90 font-medium text-center px-3">
            {statusHindi}
          </span>
        </div>
      </div>
    </div>
  );
};
