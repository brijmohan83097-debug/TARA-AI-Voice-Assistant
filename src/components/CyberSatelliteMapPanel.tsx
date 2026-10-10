/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Globe2, 
  Radio, 
  Satellite, 
  Navigation, 
  ShieldCheck, 
  Activity,
  Crosshair,
  Wifi,
  Sparkles,
  Zap,
  Radar
} from 'lucide-react';
import { audioSynth } from '../utils/audio';

interface GeoNode {
  id: string;
  name: string;
  nameHi: string;
  lat: number;
  lng: number;
  x: number; // percent in SVG 0-100
  y: number; // percent in SVG 0-100
  status: 'active' | 'synced' | 'standby';
  role: string;
}

const GEO_NODES: GeoNode[] = [
  {
    id: 'delhi',
    name: 'Delhi HQ',
    nameHi: 'दिल्ली मुख्यालय (Mohan Vishwas HQ)',
    lat: 28.6139,
    lng: 77.2090,
    x: 68.6,
    y: 48.4,
    status: 'active',
    role: 'Primary Command & Fabrication Engine',
  },
  {
    id: 'mumbai',
    name: 'Mumbai Hub',
    nameHi: 'मुंबई हब',
    lat: 19.0760,
    lng: 72.8777,
    x: 66.8,
    y: 52.6,
    status: 'synced',
    role: 'Supply Chain & Material Logistics',
  },
  {
    id: 'bangalore',
    name: 'Bangalore Tech',
    nameHi: 'बेंगलुरु टेक',
    lat: 12.9716,
    lng: 77.5946,
    x: 68.4,
    y: 56.4,
    status: 'synced',
    role: 'Neural AI Core Gateway',
  },
  {
    id: 'tokyo',
    name: 'Tokyo Station',
    nameHi: 'टोक्यो रिले',
    lat: 35.6762,
    lng: 139.6503,
    x: 88.5,
    y: 39.0,
    status: 'synced',
    role: 'Laser Metrology Calibration',
  },
  {
    id: 'london',
    name: 'London Node',
    nameHi: 'लंदन स्टेशन',
    lat: 51.5074,
    lng: -0.1278,
    x: 46.8,
    y: 28.8,
    status: 'standby',
    role: 'Global Timestamp & Quantum Sync',
  },
  {
    id: 'ny',
    name: 'New York',
    nameHi: 'न्यूयॉर्क',
    lat: 40.7128,
    lng: -74.0060,
    x: 29.2,
    y: 33.8,
    status: 'standby',
    role: 'Western Telemetry Mirror',
  },
];

// Telemetry links connecting Delhi HQ to all global nodes
const COORD_LINKS = [
  { from: 'delhi', to: 'mumbai', band: 'Ka-Band', speed: '12 Gbps' },
  { from: 'delhi', to: 'bangalore', band: 'Quantum-QKD', speed: '40 Gbps' },
  { from: 'delhi', to: 'tokyo', band: 'Optical Laser', speed: '100 Gbps' },
  { from: 'delhi', to: 'london', band: 'Ku-Band Relay', speed: '25 Gbps' },
  { from: 'delhi', to: 'ny', band: 'Trans-Pacific SAT', speed: '18 Gbps' },
];

interface CyberSatelliteMapPanelProps {
  className?: string;
  onSelectNode?: (nodeName: string) => void;
}

export const CyberSatelliteMapPanel: React.FC<CyberSatelliteMapPanelProps> = ({
  className = '',
  onSelectNode,
}) => {
  const [selectedNode, setSelectedNode] = useState<GeoNode>(GEO_NODES[0]);
  const [tickerLog, setTickerLog] = useState<string>('SAT-TARA-01: ORBITAL LOCK ACTIVE // TELEMETRY NORMAL');

  // Animation states for 60fps rotating radar beam, rotating satellite orbits, and satellites
  const [radarAngle, setRadarAngle] = useState<number>(0);
  const [orbit1Angle, setOrbit1Angle] = useState<number>(0);
  const [orbit2Angle, setOrbit2Angle] = useState<number>(-22);
  const [orbit3Angle, setOrbit3Angle] = useState<number>(38);
  const [sat1Progress, setSat1Progress] = useState<number>(45);
  const [sat2Progress, setSat2Progress] = useState<number>(210);
  const [sat3Progress, setSat3Progress] = useState<number>(120);
  const [coordBlinkPhase, setCoordBlinkPhase] = useState<number>(0);

  // Smooth continuous requestAnimationFrame loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // 1. Holographic radar line continuous 360-degree rotation (~62 deg/sec)
      setRadarAngle((prev) => (prev + 62 * dt) % 360);

      // 2. Rotating satellite orbital planes in 3D perspective space
      setOrbit1Angle((prev) => (prev + 8 * dt) % 360);
      setOrbit2Angle((prev) => (prev - 10 * dt) % 360);
      setOrbit3Angle((prev) => (prev + 6 * dt) % 360);

      // 3. Satellites orbiting along their respective paths
      setSat1Progress((prev) => (prev + 36 * dt) % 360);
      setSat2Progress((prev) => (prev + 24 * dt) % 360);
      setSat3Progress((prev) => (prev + 40 * dt) % 360);

      // 4. Coordinates links data packets and signal pulsation
      setCoordBlinkPhase((prev) => (prev + 2.5 * dt) % 1);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Cycling real-time telemetry status tickers
  useEffect(() => {
    const logs = [
      'SAT-TARA-01: 360° HOLO-RADAR ACTIVE // ORBITAL BEAM LOCKED',
      'UPLINK: 14.2 GHz KA-BAND // QUANTUM ENCRYPTION AES-256',
      'GEO-RELAY-09: TARA NEURAL TELEMETRY STREAMING // 120 Mbps',
      'MOHAN VISHWAS FABRICATION: REAL-TIME RATE ENGINE OPERATIONAL',
      'ORBITAL PASS: 420.4 KM ALTITUDE // VELOCITY 7.66 KM/S',
      'COORDINATES LINK: DELHI <-> MUMBAI <-> BLR SYNCHRONIZED',
      'SCANNER BEAM: 100% COVERAGE // ZERO BLIND SPOTS ACTIVE',
    ];
    let idx = 0;
    const tickerInterval = setInterval(() => {
      idx = (idx + 1) % logs.length;
      setTickerLog(logs[idx]);
    }, 3800);

    return () => clearInterval(tickerInterval);
  }, []);

  // Helper to calculate (x, y) coordinates on a rotated ellipse
  const getRotatedEllipsePoint = (
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    orbitRotDeg: number,
    progressDeg: number
  ) => {
    const theta = (orbitRotDeg * Math.PI) / 180;
    const phi = (progressDeg * Math.PI) / 180;
    const x0 = rx * Math.cos(phi);
    const y0 = ry * Math.sin(phi);
    const x = cx + x0 * Math.cos(theta) - y0 * Math.sin(theta);
    const y = cy + x0 * Math.sin(theta) + y0 * Math.cos(theta);
    return { x, y };
  };

  // Center of world map SVG
  const centerCX = 300;
  const centerCY = 160;

  // Calculate live satellite 1 (SAT-TARA-01 // Primary LEO)
  const sat1 = getRotatedEllipsePoint(centerCX, centerCY, 228, 76, orbit1Angle, sat1Progress);

  // Calculate live satellite 2 (GEO-RELAY-09 // Tilted Equatorial)
  const sat2 = getRotatedEllipsePoint(centerCX, centerCY, 204, 88, orbit2Angle, sat2Progress);

  // Calculate live satellite 3 (NAV-BEACON-03 // Quantum Polar)
  const sat3 = getRotatedEllipsePoint(centerCX, centerCY, 172, 110, orbit3Angle, sat3Progress);

  // Calculate leading edge point of the holographic radar scanner beam (radius 285)
  const radarRad = (radarAngle * Math.PI) / 180;
  const radarBeamX = centerCX + 285 * Math.cos(radarRad);
  const radarBeamY = centerCY + 285 * Math.sin(radarRad);

  // Calculate trailing edge point of the radar cone (45 degrees behind)
  const radarTrailRad = ((radarAngle - 45) * Math.PI) / 180;
  const radarTrailX = centerCX + 285 * Math.cos(radarTrailRad);
  const radarTrailY = centerCY + 285 * Math.sin(radarTrailRad);

  // Delhi HQ coordinates for beam downlinks
  const delhiNode = GEO_NODES[0];
  const delhiX = (delhiNode.x / 100) * 600;
  const delhiY = (delhiNode.y / 100) * 320;

  return (
    <div className={`flex flex-col h-full bg-[#030816]/95 border border-cyan-400/50 rounded-xl overflow-hidden shadow-[0_0_35px_rgba(0,240,255,0.25)] relative backdrop-blur-md neon-hud-border ${className}`}>
      {/* Sci-Fi HUD Corner Brackets */}
      <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-300 z-20 pointer-events-none shadow-[0_0_10px_#00f0ff]" />
      <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-300 z-20 pointer-events-none shadow-[0_0_10px_#00f0ff]" />
      <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-300 z-20 pointer-events-none shadow-[0_0_10px_#00f0ff]" />
      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-300 z-20 pointer-events-none shadow-[0_0_10px_#00f0ff]" />

      {/* 1. TOP PANEL HEADER */}
      <div className="px-3 py-2 bg-[#051024] border-b border-cyan-400/30 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-cyan-300 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="font-mono text-xs font-black text-cyan-200 tracking-wider drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">
            [GLOBAL SAT-RADAR // REAL EARTH SATELLITE]
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Active 360-degree radar scanner sweep indicator */}
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-cyan-200 bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping" />
            <span>RADAR: 360° BEAM</span>
          </div>
          <div className="flex items-center gap-1 text-[9px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.25)]">
            <Globe2 className="w-3 h-3 text-cyan-300 animate-pulse" />
            <span>TRUE-COLOR EARTH</span>
          </div>
          <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ORBIT: LOCKED</span>
          </div>
        </div>
      </div>

      {/* 2. REALISTIC SATELLITE EARTH WORLD MAP & HOLOGRAPHIC RADAR CANVAS */}
      <div 
        className="relative flex-1 min-h-[175px] bg-[#020713] overflow-hidden flex items-center justify-center"
        style={{
          backgroundImage: 'url(/satellite_world_map.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Futuristic Glowing Scanline Effect */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent pointer-events-none animate-hud-scan z-10" />

        {/* Ambient Grid Scanlines (Subtle so map is crisp and clear) */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.15) 0%, transparent 75%), linear-gradient(rgba(0, 240, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.08) 1px, transparent 1px)`,
            backgroundSize: '100% 100%, 20px 20px, 20px 20px',
          }}
        />

        {/* SVG World Map, Rotating Orbits & Transparent Holographic Radar */}
        <svg 
          viewBox="0 0 600 320" 
          className="w-full h-full select-none cursor-crosshair"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Glowing neon filters for shining coastlines & borders */}
            <filter id="brightBorderGlow" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="2.5" result="blur1" />
              <feGaussianBlur stdDeviation="1.2" result="blur2" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="indiaBrightGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.2" result="blur1" />
              <feGaussianBlur stdDeviation="1" result="blur2" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="laserBeamGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Vignette border gradient for seamless integration into cyber panel */}
            <radialGradient id="satelliteVignette" cx="50%" cy="50%" r="58%">
              <stop offset="65%" stopColor="#020713" stopOpacity="0" />
              <stop offset="88%" stopColor="#020713" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#020713" stopOpacity="0.65" />
            </radialGradient>

            {/* High-transparency radar sweep cone gradient (transparent so map is crystal clear) */}
            <linearGradient id="transparentRadarSweepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.10" />
              <stop offset="60%" stopColor="#00f0ff" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.0" />
            </linearGradient>

            {/* Rotating Orbits Gradients */}
            <linearGradient id="orbit1Grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
            </linearGradient>

            <linearGradient id="orbit2Grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.25" />
            </linearGradient>

            <linearGradient id="orbit3Grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {/* ============================================================== */}
          {/* 1. ORIGINAL REALISTIC SATELLITE EARTH WORLD MAP TEXTURE */}
          {/* Real continents, green/brown vegetation, oceans & polar caps */}
          {/* ============================================================== */}
          <g>
            <image 
              href="/satellite_world_map.jpg" 
              x="0" 
              y="0" 
              width="600" 
              height="320" 
              preserveAspectRatio="none"
              className="select-none pointer-events-none"
            />

            {/* Subtle cyber vignette to integrate nicely with dark HUD border */}
            <rect 
              x="0" 
              y="0" 
              width="600" 
              height="320" 
              fill="url(#satelliteVignette)" 
              pointerEvents="none" 
            />

            {/* Micro atmospheric depth glow */}
            <rect 
              x="0" 
              y="0" 
              width="600" 
              height="320" 
              fill="#00f0ff" 
              fillOpacity="0.02" 
              style={{ mixBlendMode: 'screen', pointerEvents: 'none' }}
            />
          </g>

          {/* Coordinate Lat/Long Gridlines (Crisp, Light & Clean) */}
          <g stroke="#00f0ff" strokeWidth="0.5" strokeOpacity="0.12" strokeDasharray="3 3">
            <line x1="0" y1="80" x2="600" y2="80" />
            <line x1="0" y1="160" x2="600" y2="160" />
            <line x1="0" y1="240" x2="600" y2="240" />
            <line x1="150" y1="0" x2="150" y2="320" />
            <line x1="300" y1="0" x2="300" y2="320" />
            <line x1="450" y1="0" x2="450" y2="320" />
            {/* Equator & Prime Meridian highlight */}
            <line x1="0" y1="160" x2="600" y2="160" stroke="#00f0ff" strokeOpacity="0.22" strokeDasharray="none" />
            <line x1="300" y1="0" x2="300" y2="320" stroke="#00f0ff" strokeOpacity="0.22" strokeDasharray="none" />
          </g>

          {/* 3. ROTATING SATELLITE ORBITAL RINGS (3D Rotating Gyroscope Planes) */}
          {/* Orbit 1: Primary Polar / LEO Orbital Path (Continuous Rotation) */}
          <g transform={`rotate(${orbit1Angle}, ${centerCX}, ${centerCY})`}>
            <ellipse 
              cx={centerCX} 
              cy={centerCY} 
              rx="228" 
              ry="76" 
              fill="none" 
              stroke="url(#orbit1Grad)" 
              strokeWidth="1.4" 
              strokeDasharray="5 3" 
              strokeOpacity="0.8"
              filter="url(#brightBorderGlow)"
            />
            <circle cx={centerCX + 228} cy={centerCY} r="2" fill="#00f0ff" />
            <circle cx={centerCX - 228} cy={centerCY} r="2" fill="#00f0ff" />
          </g>

          {/* Orbit 2: Tilted Molniya / Equatorial Orbital Path (Reverse Rotation) */}
          <g transform={`rotate(${orbit2Angle}, ${centerCX}, ${centerCY})`}>
            <ellipse 
              cx={centerCX} 
              cy={centerCY} 
              rx="204" 
              ry="88" 
              fill="none" 
              stroke="url(#orbit2Grad)" 
              strokeWidth="1.2" 
              strokeDasharray="4 4" 
              strokeOpacity="0.65"
            />
            <circle cx={centerCX + 204} cy={centerCY} r="1.8" fill="#38bdf8" />
            <circle cx={centerCX - 204} cy={centerCY} r="1.8" fill="#38bdf8" />
          </g>

          {/* Orbit 3: High-Inclination Quantum Polar Orbital Path */}
          <g transform={`rotate(${orbit3Angle}, ${centerCX}, ${centerCY})`}>
            <ellipse 
              cx={centerCX} 
              cy={centerCY} 
              rx="172" 
              ry="110" 
              fill="none" 
              stroke="url(#orbit3Grad)" 
              strokeWidth="1" 
              strokeDasharray="3 4" 
              strokeOpacity="0.55"
            />
            <circle cx={centerCX + 172} cy={centerCY} r="1.8" fill="#10b981" />
            <circle cx={centerCX - 172} cy={centerCY} r="1.8" fill="#10b981" />
          </g>

          {/* 4. BLINKING COORDINATES LINKS (INTER-NODE TELEMETRY VECTORS) */}
          {COORD_LINKS.map((link, idx) => {
            const fromNode = GEO_NODES.find((n) => n.id === link.from) || GEO_NODES[0];
            const toNode = GEO_NODES.find((n) => n.id === link.to);
            if (!toNode) return null;

            const x1 = (fromNode.x / 100) * 600;
            const y1 = (fromNode.y / 100) * 320;
            const x2 = (toNode.x / 100) * 600;
            const y2 = (toNode.y / 100) * 320;

            const packetPos = (coordBlinkPhase + idx * 0.2) % 1;
            const px = x1 + (x2 - x1) * packetPos;
            const py = y1 + (y2 - y1) * packetPos;

            return (
              <g key={`coord-link-${link.from}-${link.to}`}>
                {/* Background Cyber Track */}
                <line 
                  x1={x1} 
                  y1={y1} 
                  x2={x2} 
                  y2={y2} 
                  stroke="#00f0ff" 
                  strokeWidth="0.8" 
                  strokeOpacity="0.3" 
                />

                {/* Animated Blinking Coordinates Link Vector */}
                <line 
                  x1={x1} 
                  y1={y1} 
                  x2={x2} 
                  y2={y2} 
                  stroke={toNode.id === selectedNode.id ? "#00f0ff" : "#38bdf8"} 
                  strokeWidth={toNode.id === selectedNode.id ? "1.8" : "1.2"} 
                  strokeDasharray="6 4" 
                  className="animate-coord-link"
                  filter="url(#brightBorderGlow)"
                  style={{ animationDelay: `${idx * 0.3}s` }}
                />

                {/* Blinking Photon Data Packet Pulse traveling along the vector */}
                <circle 
                  cx={px} 
                  cy={py} 
                  r="2.2" 
                  fill="#ffffff" 
                  stroke="#00f0ff" 
                  strokeWidth="1"
                  filter="url(#brightBorderGlow)"
                />
              </g>
            );
          })}

          {/* 5. TRANSPARENT HOLOGRAPHIC RADAR SCANNER (MAP CHHUP NA JAYE) */}
          <g style={{ mixBlendMode: 'screen', pointerEvents: 'none' }}>
            {/* Concentric Radar Range Rings */}
            {[65, 130, 195, 260].map((radius, rIdx) => (
              <g key={`range-ring-${rIdx}`}>
                <circle 
                  cx={centerCX} 
                  cy={centerCY} 
                  r={radius} 
                  fill="none" 
                  stroke="#00f0ff" 
                  strokeWidth="0.6" 
                  strokeOpacity="0.18" 
                  strokeDasharray={rIdx % 2 === 1 ? "4 4" : "none"}
                />
                <text 
                  x={centerCX + radius - 20} 
                  y={centerCY - 3} 
                  fill="#00f0ff" 
                  fontSize="5.5" 
                  fontFamily="monospace" 
                  fillOpacity="0.45"
                >
                  {(rIdx + 1) * 500}KM
                </text>
              </g>
            ))}

            {/* Pulsing Radar Wave Ripple Expanding From Center */}
            <circle 
              cx={centerCX} 
              cy={centerCY} 
              r="20" 
              fill="none" 
              stroke="#00f0ff" 
              strokeWidth="1" 
              className="animate-radar-ripple"
            />

            {/* Transparent Glowing Sweeping Radar Sector Cone (Light wash so real map is crystal clear) */}
            <path 
              d={`M ${centerCX} ${centerCY} L ${radarBeamX} ${radarBeamY} A 285 285 0 0 0 ${radarTrailX} ${radarTrailY} Z`}
              fill="url(#transparentRadarSweepGrad)"
              opacity="0.4"
            />

            {/* Leading Holographic Laser Scanner Beam Line (Sharp, clean needle) */}
            <line 
              x1={centerCX} 
              y1={centerCY} 
              x2={radarBeamX} 
              y2={radarBeamY} 
              stroke="#00f0ff" 
              strokeWidth="1.4" 
              strokeOpacity="0.9"
              filter="url(#laserBeamGlow)"
            />

            {/* Fine white core needle */}
            <line 
              x1={centerCX} 
              y1={centerCY} 
              x2={radarBeamX} 
              y2={radarBeamY} 
              stroke="#ffffff" 
              strokeWidth="0.6" 
              strokeOpacity="0.95"
            />

            {/* Scanner Beam Head Target Crosshair */}
            <circle cx={radarBeamX} cy={radarBeamY} r="3" fill="none" stroke="#00f0ff" strokeWidth="1" />
            <circle cx={radarBeamX} cy={radarBeamY} r="1.2" fill="#ffffff" />

            {/* Central Radar Pulsar Origin Core */}
            <circle cx={centerCX} cy={centerCY} r="5" fill="#00f0ff" fillOpacity="0.35" />
            <circle cx={centerCX} cy={centerCY} r="2.5" fill="#00f0ff" />
            <circle cx={centerCX} cy={centerCY} r="1.2" fill="#ffffff" />
          </g>

          {/* 6. ORBITING SATELLITES */}
          {/* SATELLITE 1: SAT-TARA-01 (Primary LEO Fabrication Link) */}
          <g transform={`translate(${sat1.x}, ${sat1.y})`}>
            {/* Active Holographic Downlink Beam to Delhi HQ */}
            <line 
              x1="0" 
              y1="0" 
              x2={delhiX - sat1.x} 
              y2={delhiY - sat1.y} 
              stroke="#00f0ff" 
              strokeWidth="1" 
              strokeOpacity="0.6" 
              strokeDasharray="3 3"
              filter="url(#brightBorderGlow)"
            />
            <circle cx="0" cy="0" r="10" fill="none" stroke="#00f0ff" strokeWidth="0.8" className="animate-ping opacity-60" />
            <rect x="-9" y="-2.5" width="18" height="5" fill="#00f0ff" rx="1" filter="url(#brightBorderGlow)" />
            <rect x="-3" y="-6" width="6" height="12" fill="#ffffff" rx="1" />
            <circle cx="0" cy="0" r="2.5" fill="#0284c7" />
            <text x="12" y="3.5" fill="#00f0ff" fontSize="7" fontFamily="monospace" fontWeight="bold" filter="url(#brightBorderGlow)">
              SAT-TARA-01
            </text>
          </g>

          {/* SATELLITE 2: GEO-RELAY-09 (Quantum Data Relay) */}
          <g transform={`translate(${sat2.x}, ${sat2.y})`}>
            <circle cx="0" cy="0" r="8" fill="none" stroke="#38bdf8" strokeWidth="0.7" className="animate-ping opacity-50" />
            <rect x="-7" y="-2" width="14" height="4" fill="#38bdf8" rx="1" />
            <rect x="-2.5" y="-5" width="5" height="10" fill="#e0f2fe" rx="1" />
            <circle cx="0" cy="0" r="2" fill="#0369a1" />
            <text x="10" y="2.5" fill="#38bdf8" fontSize="6.5" fontFamily="monospace" fontWeight="bold">
              GEO-RELAY-09
            </text>
          </g>

          {/* SATELLITE 3: NAV-BEACON-03 (Telecom/GPS Beacon) */}
          <g transform={`translate(${sat3.x}, ${sat3.y})`}>
            <circle cx="0" cy="0" r="7" fill="none" stroke="#10b981" strokeWidth="0.6" className="animate-ping opacity-50" />
            <rect x="-6" y="-2" width="12" height="4" fill="#10b981" rx="1" />
            <rect x="-2.5" y="-4" width="5" height="8" fill="#a7f3d0" rx="1" />
            <circle cx="0" cy="0" r="1.8" fill="#047857" />
            <text x="9" y="2" fill="#10b981" fontSize="6" fontFamily="monospace" fontWeight="bold">
              NAV-BEACON-03
            </text>
          </g>

          {/* 7. INTERACTIVE BLINKING GEO-NODES WITH COORDINATES LABELS */}
          {GEO_NODES.map((node) => {
            const isSelected = selectedNode.id === node.id;
            const cx = (node.x / 100) * 600;
            const cy = (node.y / 100) * 320;

            return (
              <g 
                key={node.id} 
                transform={`translate(${cx}, ${cy})`}
                className="cursor-pointer group"
                onClick={() => {
                  audioSynth.playSciFiClick();
                  setSelectedNode(node);
                  if (onSelectNode) onSelectNode(node.name);
                }}
              >
                {/* Holographic Radar Target Crosshair Reticle */}
                <g stroke={node.id === 'delhi' ? "#00f0ff" : isSelected ? "#38bdf8" : "#0284c7"} strokeWidth="0.9" strokeOpacity="0.85">
                  <line x1="-12" y1="0" x2="-6" y2="0" />
                  <line x1="6" y1="0" x2="12" y2="0" />
                  <line x1="0" y1="-12" x2="0" y2="-6" />
                  <line x1="0" y1="6" x2="0" y2="12" />
                </g>

                {/* Blinking Signal Pulse Rings */}
                <circle 
                  cx="0" 
                  cy="0" 
                  r={isSelected ? "13" : "9"} 
                  fill="none" 
                  stroke={node.id === 'delhi' ? "#00f0ff" : "#38bdf8"} 
                  strokeWidth="1.2" 
                  className="animate-signal-ping" 
                />
                <circle 
                  cx="0" 
                  cy="0" 
                  r={isSelected ? "8" : "6"} 
                  fill={node.id === 'delhi' ? "#00f0ff" : "#0284c7"} 
                  fillOpacity="0.5"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
                <circle cx="0" cy="0" r="2.8" fill="#ffffff" filter="url(#brightBorderGlow)" />

                {/* Blinking Coordinates Link Label & Micro Telemetry Badge */}
                <g transform="translate(10, -14)">
                  <rect 
                    x="0" 
                    y="0" 
                    width={node.id === 'delhi' ? "90" : "76"} 
                    height="19" 
                    rx="3" 
                    fill="#030c18" 
                    stroke={isSelected ? "#00f0ff" : "#1e3a5f"} 
                    strokeWidth={isSelected ? "1.2" : "0.8"} 
                    className={isSelected ? "animate-pulse" : ""}
                  />
                  {/* Station Name */}
                  <text 
                    x="4" 
                    y="8" 
                    fill={node.id === 'delhi' ? "#00f0ff" : isSelected ? "#38bdf8" : "#cbd5e1"} 
                    fontSize="6.5" 
                    fontFamily="monospace" 
                    fontWeight="bold"
                  >
                    {node.name}
                  </text>
                  {/* Live Blinking Coordinate Readout */}
                  <text 
                    x="4" 
                    y="15.5" 
                    fill={node.id === 'delhi' ? "#10b981" : "#38bdf8"} 
                    fontSize="5" 
                    fontFamily="monospace"
                    className="animate-pulse"
                  >
                    {node.lat.toFixed(2)}°N, {node.lng.toFixed(2)}°E
                  </text>
                  {/* Blinking link signal dot */}
                  <circle 
                    cx={node.id === 'delhi' ? "83" : "70"} 
                    cy="8" 
                    r="1.8" 
                    fill={node.status === 'active' ? "#10b981" : "#00f0ff"} 
                    className="animate-ping" 
                  />
                </g>
              </g>
            );
          })}
        </svg>

        {/* Floating Reticle Telemetry Overlay at Top Right */}
        <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#040c1a]/90 border border-cyan-400/40 text-[9px] font-mono text-cyan-200 pointer-events-none shadow-lg">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>RADAR LOCK: {selectedNode.name}</span>
          </div>
          <div className="text-emerald-300">
            COORD: {selectedNode.lat.toFixed(4)}°N, {selectedNode.lng.toFixed(4)}°E
          </div>
          <div className="text-cyan-300/80">
            RADAR: {Math.round(radarAngle)}° // ALT: 420.4 KM
          </div>
        </div>
      </div>

      {/* 3. SELECTED NODE TELEMETRY & COORDINATES MATRIX */}
      <div className="p-2.5 bg-[#050c1b] border-t border-cyan-500/20 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-xs font-bold font-mono text-white">
              {selectedNode.nameHi}
            </span>
          </div>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
            {selectedNode.status.toUpperCase()} • BEAM LOCKED
          </span>
        </div>

        <p className="text-[10px] text-slate-300 font-sans line-clamp-1 mb-2">
          {selectedNode.role}
        </p>

        {/* 4-Item Live Telemetry Matrix */}
        <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono">
          <div className="p-1 rounded bg-[#030814] border border-cyan-500/20 flex items-center justify-between">
            <span className="text-slate-400">Uplink:</span>
            <span className="text-cyan-300 font-bold">14.2 GHz (Ka)</span>
          </div>
          <div className="p-1 rounded bg-[#030814] border border-cyan-500/20 flex items-center justify-between">
            <span className="text-slate-400">Latency:</span>
            <span className="text-emerald-400 font-bold">12 ms (Synced)</span>
          </div>
          <div className="p-1 rounded bg-[#030814] border border-cyan-500/20 flex items-center justify-between">
            <span className="text-slate-400">Cipher:</span>
            <span className="text-cyan-300 font-bold">AES-256 Quantum</span>
          </div>
          <div className="p-1 rounded bg-[#030814] border border-cyan-500/20 flex items-center justify-between">
            <span className="text-slate-400">Scanner:</span>
            <span className="text-emerald-400 font-bold">360° Holo Active</span>
          </div>
        </div>
      </div>

      {/* 4. REAL-TIME TICKER STATUS BAR AT BOTTOM */}
      <div className="px-2.5 py-1.5 bg-[#02050e] border-t border-cyan-500/20 flex items-center gap-2 overflow-hidden shrink-0">
        <Radio className="w-3 h-3 text-cyan-400 animate-pulse shrink-0" />
        <div className="text-[9px] font-mono text-cyan-300 truncate">
          {tickerLog}
        </div>
      </div>
    </div>
  );
};
