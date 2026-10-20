/**
 * HologramEntity3D.tsx
 * High-Fidelity 3D Anatomical Humanoid Wireframe Hologram Projection Engine.
 * Faithfully matches IMG_20261013_145133.jpg:
 * - High-density anatomical 3D male human wireframe mesh (cranial dome, facial contours,
 *   neck, shoulders, pectorals, 6-pack abs, obliques, arms with open fingers,
 *   muscular quads, knees, calf bulges, and floating feet).
 * - Multi-tiered holographic emitter pedestal floor with outer segmented cyan LED tick ring,
 *   solid neon ring, radial circuit bus traces, inner core, and volumetric light beam.
 * - Sweeping vertical laser scanline and audio-reactive soundwave floor ripples.
 * - Interactive 360° drag-to-rotate and gentle idle spin.
 */

import React, { useEffect, useRef, useState } from 'react';
import { TaraEmotion } from '../types';

interface HologramEntity3DProps {
  isSpeaking: boolean;
  isListening: boolean;
  isHandsFreeMode: boolean;
  currentEmotion?: TaraEmotion;
  onTapEntity?: () => void;
  className?: string;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface EmotionColorPalette {
  primary: string;
  glow: string;
  accent: string;
  fillAlpha: number;
}

const EMOTION_PALETTES: Record<string, EmotionColorPalette> = {
  calm_caring: {
    primary: '#00f0ff',
    glow: 'rgba(0, 240, 255, 0.75)',
    accent: '#38bdf8',
    fillAlpha: 0.08,
  },
  empathy_support: {
    primary: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.75)',
    accent: '#e879f9',
    fillAlpha: 0.08,
  },
  happy_excited: {
    primary: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.85)',
    accent: '#22d3ee',
    fillAlpha: 0.10,
  },
  focused_alert: {
    primary: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.75)',
    accent: '#0ea5e9',
    fillAlpha: 0.08,
  },
};

export const HologramEntity3D: React.FC<HologramEntity3DProps> = ({
  isSpeaking,
  isListening,
  isHandsFreeMode,
  currentEmotion = 'calm_caring',
  onTapEntity,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 3D rotation state
  const rotationYRef = useRef<number>(0);
  const rotationXRef = useRef<number>(0.08); // Slight pitch tilt for 3D realism
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let scanLineY = -1.1;
    let scanDirection = 1;
    let pulsePhase = 0;
    let pedestalAngle = 0;

    // =========================================================================
    // 1. GENERATE HIGH-DENSITY ANATOMICAL 3D MALE HUMANOID WIREFRAME MESH
    // Matching IMG_20261013_145133.jpg:
    // Symmetrical human body from head crown (Y = +0.86) down to feet (Y = -0.92)
    // =========================================================================
    const nodes: Point3D[] = [];
    const edges: [number, number][] = [];
    const bodyPolygons: number[][] = []; // For translucent holographic mass fill

    const addNode = (x: number, y: number, z: number): number => {
      nodes.push({ x, y, z });
      return nodes.length - 1;
    };

    const addEdge = (i1: number, i2: number) => {
      edges.push([i1, i2]);
    };

    // Helper: Build a closed 3D anatomical ring
    const buildRing = (
      y: number,
      centerX: number,
      centerZ: number,
      radiusX: number,
      radiusZ: number,
      numPoints: number,
      zOffsetFront = 0
    ): number[] => {
      const ringNodes: number[] = [];
      for (let i = 0; i < numPoints; i++) {
        const theta = (i / numPoints) * Math.PI * 2;
        // Asymmetric front prominence for human anatomy
        const isFront = Math.sin(theta) > 0;
        const actualZ = centerZ + Math.sin(theta) * radiusZ + (isFront ? zOffsetFront : 0);
        const actualX = centerX + Math.cos(theta) * radiusX;
        ringNodes.push(addNode(actualX, y, actualZ));
      }
      // Connect horizontal latitude ring
      for (let i = 0; i < numPoints; i++) {
        addEdge(ringNodes[i], ringNodes[(i + 1) % numPoints]);
      }
      return ringNodes;
    };

    // Helper: Connect two adjacent rings longitudinally to form quad wireframes
    const connectRings = (r1: number[], r2: number[], addPoly = true) => {
      const count = Math.min(r1.length, r2.length);
      for (let i = 0; i < count; i++) {
        addEdge(r1[i], r2[i]);
        if (addPoly) {
          const next = (i + 1) % count;
          bodyPolygons.push([r1[i], r1[next], r2[next], r2[i]]);
        }
      }
    };

    // --- A. HEAD & FACIAL CRANIUM GEOMETRY ---
    const crownNode = addNode(0, 0.88, 0);
    const headRing1 = buildRing(0.82, 0, 0, 0.065, 0.075, 10);
    const headRing2 = buildRing(0.75, 0, 0.01, 0.078, 0.085, 10, 0.015); // Forehead / brow
    const headRing3 = buildRing(0.68, 0, 0.015, 0.072, 0.080, 10, 0.025); // Eye sockets / nose bridge
    const headRing4 = buildRing(0.61, 0, 0.01, 0.058, 0.068, 10, 0.018); // Mouth / jawline
    const chinNode = addNode(0, 0.56, 0.035);

    headRing1.forEach((idx) => addEdge(crownNode, idx));
    connectRings(headRing1, headRing2);
    connectRings(headRing2, headRing3);
    connectRings(headRing3, headRing4);
    headRing4.forEach((idx) => addEdge(chinNode, idx));

    // Nose tip and visor line
    const noseTip = addNode(0, 0.69, 0.105);
    addEdge(headRing3[2], noseTip);
    addEdge(headRing3[3], noseTip);
    addEdge(chinNode, noseTip);

    // --- B. NECK ---
    const neckRing1 = buildRing(0.55, 0, 0, 0.045, 0.048, 8);
    const neckRing2 = buildRing(0.50, 0, 0, 0.055, 0.055, 8);
    connectRings(neckRing1, neckRing2);
    addEdge(chinNode, neckRing1[2]);

    // --- C. TORSO: CHEST, PECTORALS, RIBS, ABS, WAIST, PELVIS ---
    // Clavicles & Acromion Shoulders
    const torsoShoulders = buildRing(0.46, 0, 0, 0.24, 0.095, 12, 0.02);
    connectRings(neckRing2, [torsoShoulders[0], torsoShoulders[1], torsoShoulders[2], torsoShoulders[3], torsoShoulders[4], torsoShoulders[5], torsoShoulders[6], torsoShoulders[11]], false);

    // Pectoral major muscle contour ring (broad chest plates)
    const torsoPectorals = buildRing(0.39, 0, 0.02, 0.22, 0.11, 12, 0.035);
    connectRings(torsoShoulders, torsoPectorals);

    // Sternum centerline and pectoral separation
    const sternumMid = addNode(0, 0.40, 0.075);
    addEdge(torsoPectorals[2], sternumMid);
    addEdge(torsoPectorals[3], sternumMid);

    // Lower chest / Solar plexus
    const torsoLowerPecs = buildRing(0.32, 0, 0.015, 0.19, 0.10, 12, 0.025);
    connectRings(torsoPectorals, torsoLowerPecs);

    // Upper Abdomen (Upper six-pack abs)
    const torsoUpperAbs = buildRing(0.24, 0, 0.01, 0.17, 0.09, 10, 0.02);
    connectRings(torsoLowerPecs, [torsoUpperAbs[0], torsoUpperAbs[1], torsoUpperAbs[2], torsoUpperAbs[3], torsoUpperAbs[4], torsoUpperAbs[5], torsoUpperAbs[6], torsoUpperAbs[7], torsoUpperAbs[8], torsoUpperAbs[9]], false);

    // Mid Abdomen (Navel & Oblique waist taper)
    const torsoNavel = buildRing(0.16, 0, 0.005, 0.155, 0.085, 10, 0.018);
    connectRings(torsoUpperAbs, torsoNavel);

    // Inguinal ligament & Iliac crest (hip bone flare)
    const torsoIliac = buildRing(0.08, 0, 0, 0.17, 0.09, 10, 0.015);
    connectRings(torsoNavel, torsoIliac);

    // Pelvis & Groin ring
    const torsoPelvis = buildRing(0.00, 0, 0, 0.175, 0.095, 10);
    connectRings(torsoIliac, torsoPelvis);

    // Groin perineum center divider
    const perineum = addNode(0, -0.06, 0.01);
    addEdge(torsoPelvis[2], perineum);
    addEdge(torsoPelvis[7], perineum);

    // --- D. ARMS & HANDS (LEFT & RIGHT) ---
    // Arms hang naturally with open contoured hands facing inward/forward
    const buildArm = (isLeft: boolean) => {
      const sign = isLeft ? -1 : 1;
      const shX = sign * 0.25;

      // Deltoid cap
      const shoulderJoint = addNode(shX, 0.45, 0);

      // Bicep upper
      const bicepUpper = buildRing(0.38, sign * 0.28, 0.01, 0.045, 0.048, 6);
      bicepUpper.forEach((idx) => addEdge(shoulderJoint, idx));

      // Bicep mid
      const bicepMid = buildRing(0.29, sign * 0.31, 0.01, 0.042, 0.045, 6);
      connectRings(bicepUpper, bicepMid);

      // Elbow joint
      const elbow = buildRing(0.20, sign * 0.33, 0.005, 0.038, 0.040, 6);
      connectRings(bicepMid, elbow);

      // Forearm upper
      const forearmUpper = buildRing(0.11, sign * 0.35, 0.01, 0.038, 0.042, 6);
      connectRings(elbow, forearmUpper);

      // Forearm lower
      const forearmLower = buildRing(0.02, sign * 0.365, 0.015, 0.034, 0.038, 6);
      connectRings(forearmUpper, forearmLower);

      // Wrist
      const wrist = buildRing(-0.07, sign * 0.38, 0.02, 0.030, 0.034, 6);
      connectRings(forearmLower, wrist);

      // Palm center & hand plate
      const palmCenter = addNode(sign * 0.39, -0.14, 0.025);
      wrist.forEach((idx) => addEdge(palmCenter, idx));

      // 5 Defined contoured fingers hanging gracefully
      const fingerOffsets = [
        { name: 'thumb', dx: sign * -0.018, dy: -0.05, dz: 0.022 },
        { name: 'index', dx: sign * -0.008, dy: -0.08, dz: 0.012 },
        { name: 'middle', dx: 0, dy: -0.095, dz: 0.005 },
        { name: 'ring', dx: sign * 0.008, dy: -0.085, dz: -0.002 },
        { name: 'pinky', dx: sign * 0.016, dy: -0.065, dz: -0.008 },
      ];

      fingerOffsets.forEach((fo) => {
        const midJoint = addNode(sign * 0.39 + fo.dx * 0.5, -0.14 + fo.dy * 0.55, 0.025 + fo.dz * 0.5);
        const tipJoint = addNode(sign * 0.39 + fo.dx, -0.14 + fo.dy, 0.025 + fo.dz);
        addEdge(palmCenter, midJoint);
        addEdge(midJoint, tipJoint);
      });
    };

    buildArm(true);  // Left arm
    buildArm(false); // Right arm

    // --- E. LEGS & FEET (LEFT & RIGHT) ---
    // Muscular quadriceps, patella knees, defined calves, and horizontal floating feet
    const buildLeg = (isLeft: boolean) => {
      const sign = isLeft ? -1 : 1;
      const hipX = sign * 0.11;

      // Upper thigh
      const thighUpper = buildRing(-0.11, hipX, 0.01, 0.076, 0.082, 8, 0.018);
      addEdge(perineum, thighUpper[isLeft ? 0 : 4]);

      // Mid thigh (quadriceps bulge)
      const thighMid = buildRing(-0.23, sign * 0.115, 0.015, 0.072, 0.078, 8, 0.022);
      connectRings(thighUpper, thighMid);

      // Lower thigh above knee
      const thighLower = buildRing(-0.35, sign * 0.115, 0.01, 0.064, 0.068, 8, 0.015);
      connectRings(thighMid, thighLower);

      // Knee / Patella ring (patellar cap prominence)
      const kneeRing = buildRing(-0.46, sign * 0.11, 0.012, 0.055, 0.058, 8, 0.025);
      connectRings(thighLower, kneeRing);

      // Patella center ring
      const patellaCenter = addNode(sign * 0.11, -0.46, 0.072);
      addEdge(kneeRing[2], patellaCenter);
      addEdge(kneeRing[3], patellaCenter);

      // Upper calf (gastrocnemius muscle bulge)
      const calfUpper = buildRing(-0.57, sign * 0.108, 0.005, 0.062, 0.068, 8, 0.010);
      connectRings(kneeRing, calfUpper);

      // Mid calf taper
      const calfMid = buildRing(-0.69, sign * 0.105, 0.00, 0.052, 0.056, 8);
      connectRings(calfUpper, calfMid);

      // Lower calf / Achilles tendon
      const calfLower = buildRing(-0.79, sign * 0.102, -0.005, 0.042, 0.046, 8);
      connectRings(calfMid, calfLower);

      // Ankle joint
      const ankleRing = buildRing(-0.86, sign * 0.10, 0.00, 0.038, 0.042, 8);
      connectRings(calfLower, ankleRing);

      // Contoured horizontal floating foot
      const heelNode = addNode(sign * 0.10, -0.91, -0.065);
      const archNode = addNode(sign * 0.10, -0.91, 0.025);
      const ballNode = addNode(sign * 0.10, -0.92, 0.095);
      const toesOuter = addNode(sign * 0.125, -0.92, 0.155);
      const toesInner = addNode(sign * 0.075, -0.92, 0.160);

      addEdge(ankleRing[0], heelNode);
      addEdge(ankleRing[4], heelNode);
      addEdge(ankleRing[2], archNode);
      addEdge(heelNode, archNode);
      addEdge(archNode, ballNode);
      addEdge(ballNode, toesInner);
      addEdge(ballNode, toesOuter);
      addEdge(toesInner, toesOuter);
    };

    buildLeg(true);  // Left leg
    buildLeg(false); // Right leg

    // --- F. FLOATING QUANTUM NEURAL MOTES ---
    interface NeuralMote {
      radius: number;
      speed: number;
      orbitAngle: number;
      elevation: number;
      size: number;
    }
    const motes: NeuralMote[] = [];
    for (let i = 0; i < 36; i++) {
      motes.push({
        radius: 0.25 + Math.random() * 0.55,
        speed: (0.006 + Math.random() * 0.012) * (Math.random() > 0.5 ? 1 : -1),
        orbitAngle: Math.random() * Math.PI * 2,
        elevation: -0.85 + Math.random() * 1.7,
        size: 1.0 + Math.random() * 2.0,
      });
    }

    // =========================================================================
    // 2. CANVAS RESIZING (High-DPI sharp rendering)
    // =========================================================================
    const handleResize = () => {
      const container = containerRef.current;
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // =========================================================================
    // 3. ANIMATION & 3D PROJECTION LOOP
    // =========================================================================
    const render = () => {
      const container = containerRef.current;
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (width === 0 || height === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth idle rotation around Y
      if (!isDraggingRef.current) {
        rotationYRef.current += isSpeaking ? 0.010 : isListening ? 0.007 : 0.004;
      }

      // Vertical laser scan line sweep
      scanLineY += 0.014 * scanDirection;
      if (scanLineY > 1.05) {
        scanDirection = -1;
      } else if (scanLineY < -1.05) {
        scanDirection = 1;
      }

      pulsePhase += isSpeaking ? 0.12 : 0.05;
      pedestalAngle += 0.006;

      const palette = EMOTION_PALETTES[currentEmotion] || EMOTION_PALETTES.calm_caring;
      const primaryColor = isListening ? '#f43f5e' : palette.primary;
      const glowColor = isListening ? 'rgba(244, 63, 94, 0.75)' : palette.glow;
      const fillAlpha = isSpeaking ? 0.14 : isListening ? 0.12 : palette.fillAlpha;

      // Coordinate center and scale:
      // Entity is centered vertically with the emitter floor at ~88% of canvas height
      const centerX = width * 0.5;
      const centerY = height * 0.51;
      const scale = Math.min(width, height) * 0.44;
      const perspectiveDist = 3.4;

      // 3D Rotation Matrix
      const cosY = Math.cos(rotationYRef.current);
      const sinY = Math.sin(rotationYRef.current);
      const cosX = Math.cos(rotationXRef.current);
      const sinX = Math.sin(rotationXRef.current);

      const projectPoint = (p: Point3D): { x: number; y: number; zDepth: number; scaleFactor: number } => {
        // Subtle organic breathing motion on Y
        const breath = Math.sin(pulsePhase * 0.5) * 0.012;
        const curY = p.y + (p.y > 0 ? breath : -breath * 0.3);

        // Rotate Y
        const rx = p.x * cosY - p.z * sinY;
        const rz = p.x * sinY + p.z * cosY;

        // Rotate X (pitch)
        const ry = curY * cosX - rz * sinX;
        const rzFinal = curY * sinX + rz * cosX;

        // Perspective Projection
        const zDepth = rzFinal + perspectiveDist;
        const scaleFactor = perspectiveDist / Math.max(zDepth, 0.8);

        const screenX = centerX + rx * scale * scaleFactor;
        const screenY = centerY - ry * scale * scaleFactor;

        return { x: screenX, y: screenY, zDepth, scaleFactor };
      };

      // -----------------------------------------------------------------------
      // PART A: DETAILED HOLOGRAPHIC EMITTER PEDESTAL FLOOR (IMG_20261013_145133.jpg)
      // Multi-ring concentric platform with glowing radial ticks, circuit lines, and volumetric core
      // -----------------------------------------------------------------------
      const pedestalBaseY = -0.98;
      const floorCenter = projectPoint({ x: 0, y: pedestalBaseY, z: 0 });

      // 1. Central Volumetric Upward Light Beam (lifting the hologram feet)
      const beamHeight = 0.65;
      const beamTop = projectPoint({ x: 0, y: pedestalBaseY + beamHeight, z: 0 });
      const beamGrad = ctx.createLinearGradient(floorCenter.x, floorCenter.y, beamTop.x, beamTop.y);
      beamGrad.addColorStop(0, primaryColor + '55');
      beamGrad.addColorStop(0.35, primaryColor + '20');
      beamGrad.addColorStop(1, 'transparent');

      ctx.save();
      ctx.beginPath();
      const beamRBottom = scale * 0.32;
      const beamRTop = scale * 0.42;
      ctx.moveTo(floorCenter.x - beamRBottom, floorCenter.y);
      ctx.lineTo(beamTop.x - beamRTop, beamTop.y);
      ctx.lineTo(beamTop.x + beamRTop, beamTop.y);
      ctx.lineTo(floorCenter.x + beamRBottom, floorCenter.y);
      ctx.closePath();
      ctx.fillStyle = beamGrad;
      ctx.fill();
      ctx.restore();

      // 2. Outer Beveled Metallic Base Platform Ring
      ctx.save();
      ctx.beginPath();
      const numPts = 48;
      const outerRingR = 0.52;
      for (let i = 0; i <= numPts; i++) {
        const ang = (i / numPts) * Math.PI * 2;
        const pt = projectPoint({ x: Math.cos(ang) * outerRingR, y: pedestalBaseY, z: Math.sin(ang) * outerRingR });
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 3. Outer Ring of 48 Bright Glowing Segmented Cyan LED Ticks (Exact Match to Photo)
      const numTicks = 48;
      for (let t = 0; t < numTicks; t++) {
        const tickAng = (t / numTicks) * Math.PI * 2 + pedestalAngle;
        const r1 = 0.45;
        const r2 = 0.50;
        const p1 = projectPoint({ x: Math.cos(tickAng) * r1, y: pedestalBaseY, z: Math.sin(tickAng) * r1 });
        const p2 = projectPoint({ x: Math.cos(tickAng) * r2, y: pedestalBaseY, z: Math.sin(tickAng) * r2 });

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        const isAccentTick = t % 4 === 0;
        ctx.strokeStyle = isAccentTick ? '#ffffff' : primaryColor;
        ctx.lineWidth = isAccentTick ? 2.5 : 1.4;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = isAccentTick ? 10 : 5;
        ctx.stroke();
      }

      // 4. Solid Bright Neon Cyan Concentric Ring
      const solidRingR = 0.42;
      ctx.beginPath();
      for (let i = 0; i <= numPts; i++) {
        const ang = (i / numPts) * Math.PI * 2;
        const pt = projectPoint({ x: Math.cos(ang) * solidRingR, y: pedestalBaseY, z: Math.sin(ang) * solidRingR });
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2.0;
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 12;
      ctx.stroke();

      // 5. Radial Circuit Board Bus Traces (radiating inward from solid ring to inner ring)
      const numTraces = 24;
      for (let tr = 0; tr < numTraces; tr++) {
        const trAng = (tr / numTraces) * Math.PI * 2 - pedestalAngle * 0.6;
        const rInner = 0.28;
        const rOuter = 0.41;
        const pIn = projectPoint({ x: Math.cos(trAng) * rInner, y: pedestalBaseY, z: Math.sin(trAng) * rInner });
        const pOut = projectPoint({ x: Math.cos(trAng) * rOuter, y: pedestalBaseY, z: Math.sin(trAng) * rOuter });

        ctx.beginPath();
        ctx.moveTo(pIn.x, pIn.y);
        ctx.lineTo(pOut.x, pOut.y);
        ctx.strokeStyle = tr % 3 === 0 ? primaryColor : 'rgba(0, 240, 255, 0.4)';
        ctx.lineWidth = tr % 3 === 0 ? 1.4 : 0.8;
        ctx.stroke();
      }

      // 6. Inner Glowing Neon Ring
      const innerRingR = 0.26;
      ctx.beginPath();
      for (let i = 0; i <= numPts; i++) {
        const ang = (i / numPts) * Math.PI * 2;
        const pt = projectPoint({ x: Math.cos(ang) * innerRingR, y: pedestalBaseY, z: Math.sin(ang) * innerRingR });
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 1.8;
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 10;
      ctx.stroke();

      // 7. Central Core Glow Pool (Under feet)
      const coreR = 0.15;
      const coreGrad = ctx.createRadialGradient(floorCenter.x, floorCenter.y, 2, floorCenter.x, floorCenter.y, scale * 0.25);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.3, primaryColor + '99');
      coreGrad.addColorStop(0.8, primaryColor + '22');
      coreGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.ellipse(floorCenter.x, floorCenter.y, scale * 0.25, scale * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 8. Soundwave Floor Ripples during speech
      if (isSpeaking || isListening) {
        const ripplePhase = (pulsePhase * 0.8) % (Math.PI * 2);
        const rippleR = 0.16 + (ripplePhase / (Math.PI * 2)) * 0.34;
        const rippleAlpha = (1 - ripplePhase / (Math.PI * 2)) * (isSpeaking ? 0.8 : 0.55);

        ctx.save();
        ctx.beginPath();
        for (let i = 0; i <= 32; i++) {
          const ang = (i / 32) * Math.PI * 2;
          const pt = projectPoint({ x: Math.cos(ang) * rippleR, y: pedestalBaseY, z: Math.sin(ang) * rippleR });
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = isListening ? `rgba(244, 63, 94, ${rippleAlpha})` : `rgba(0, 240, 255, ${rippleAlpha})`;
        ctx.lineWidth = 2.0;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.restore();
      }

      // -----------------------------------------------------------------------
      // PART B: 3D ANATOMICAL HUMANOID SILHOUETTE BODY (IMG_20261013_145133.jpg)
      // -----------------------------------------------------------------------
      const projectedNodes = nodes.map(projectPoint);

      // 1. Translucent Holographic Body Silhouette Fill (Gives solid substance to mesh)
      ctx.save();
      bodyPolygons.forEach((poly) => {
        if (poly.length < 3) return;
        ctx.beginPath();
        ctx.moveTo(projectedNodes[poly[0]].x, projectedNodes[poly[0]].y);
        for (let i = 1; i < poly.length; i++) {
          ctx.lineTo(projectedNodes[poly[i]].x, projectedNodes[poly[i]].y);
        }
        ctx.closePath();
        ctx.fillStyle = primaryColor;
        ctx.globalAlpha = fillAlpha;
        ctx.fill();
      });
      ctx.restore();

      // 2. High-Density Electric Blue Wireframe Grid Edges
      ctx.save();
      edges.forEach(([idx1, idx2]) => {
        const p1 = projectedNodes[idx1];
        const p2 = projectedNodes[idx2];
        const origY1 = nodes[idx1].y;
        const origY2 = nodes[idx2].y;
        const midY = (origY1 + origY2) * 0.5;

        // Proximity to sweeping laser scan line
        const distToScan = Math.abs(midY - scanLineY);
        const isNearScan = distToScan < 0.14;
        const scanBoost = isNearScan ? (1 - distToScan / 0.14) : 0;

        // Perspective depth cueing
        const avgDepth = (p1.zDepth + p2.zDepth) * 0.5;
        const depthAlpha = Math.max(0.35, Math.min(1.0, 1.45 - (avgDepth - 3.0) * 0.42));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        if (isNearScan) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.8;
          ctx.shadowColor = primaryColor;
          ctx.shadowBlur = 16;
          ctx.globalAlpha = 1.0;
        } else {
          ctx.strokeStyle = primaryColor;
          ctx.lineWidth = isSpeaking ? 1.2 : 0.95;
          ctx.shadowColor = primaryColor;
          ctx.shadowBlur = isSpeaking ? 8 : 4;
          ctx.globalAlpha = depthAlpha;
        }

        ctx.stroke();
      });
      ctx.restore();

      // 3. Sweeping Horizontal Laser Plane Line
      const laserY = projectPoint({ x: 0, y: scanLineY, z: 0 }).y;
      ctx.save();
      const laserGrad = ctx.createLinearGradient(centerX - scale * 0.38, laserY, centerX + scale * 0.38, laserY);
      laserGrad.addColorStop(0, 'transparent');
      laserGrad.addColorStop(0.2, primaryColor + '66');
      laserGrad.addColorStop(0.5, '#ffffff');
      laserGrad.addColorStop(0.8, primaryColor + '66');
      laserGrad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.moveTo(centerX - scale * 0.42, laserY);
      ctx.lineTo(centerX + scale * 0.42, laserY);
      ctx.strokeStyle = laserGrad;
      ctx.lineWidth = 2.0;
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.restore();

      // 4. Floating Neural Quantum Particles
      ctx.save();
      motes.forEach((m) => {
        m.orbitAngle += m.speed;
        const px = Math.cos(m.orbitAngle) * m.radius;
        const pz = Math.sin(m.orbitAngle) * m.radius;
        const pt = projectPoint({ x: px, y: m.elevation, z: pz });

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, Math.max(0.8, m.size * pt.scaleFactor), 0, Math.PI * 2);
        ctx.fillStyle = primaryColor;
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 6;
        ctx.globalAlpha = Math.max(0.2, Math.min(0.85, 1.2 - (pt.zDepth - 3.0) * 0.3));
        ctx.fill();
      });
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // =========================================================================
    // 4. INTERACTIVE DRAG-TO-ROTATE (Touch + Mouse)
    // =========================================================================
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      rotationYRef.current += dx * 0.008;
      rotationXRef.current = Math.max(-0.25, Math.min(0.35, rotationXRef.current + dy * 0.005));
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    // Touch Support
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - lastMousePosRef.current.x;
      const dy = e.touches[0].clientY - lastMousePosRef.current.y;
      rotationYRef.current += dx * 0.008;
      rotationXRef.current = Math.max(-0.25, Math.min(0.35, rotationXRef.current + dy * 0.005));
      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const el = containerRef.current;
    if (el) {
      el.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      el.addEventListener('touchstart', handleTouchStart, { passive: true });
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (el) {
        el.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        el.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isSpeaking, isListening, currentEmotion]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onTapEntity}
      className={`relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none ${className}`}
      title="TARA Core AI Entity (3D वायरफ़्रेम) - घुमाने के लिए ड्रैग करें / बातचीत शुरू करने के लिए क्लिक करें"
    >
      <canvas ref={canvasRef} className="w-full h-full block pointer-events-auto" />

      {/* Interactive Drag Hint */}
      <div
        className={`absolute top-4 left-1/2 -translate-x-1/2 font-mono text-[9px] text-cyan-300/80 px-2.5 py-0.5 rounded-full bg-slate-950/70 border border-cyan-500/30 backdrop-blur-md pointer-events-none transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-40'
        }`}
      >
        <span>↔ 360° घुमाएं • TARA CORE ENTITY</span>
      </div>
    </div>
  );
};
