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
  Sparkles
} from 'lucide-react';

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
    lat: 28.61,
    lng: 77.20,
    x: 68.5,
    y: 43.0,
    status: 'active',
    role: 'Primary Command & Fabrication Engine',
  },
  {
    id: 'mumbai',
    name: 'Mumbai Hub',
    nameHi: 'मुंबई हब',
    lat: 19.07,
    lng: 72.87,
    x: 67.2,
    y: 48.0,
    status: 'synced',
    role: 'Supply Chain & Material Logistics',
  },
  {
    id: 'bangalore',
    name: 'Bangalore Tech',
    nameHi: 'बेंगलुरु टेक',
    lat: 12.97,
    lng: 77.59,
    x: 68.6,
    y: 53.0,
    status: 'synced',
    role: 'Neural AI Core Gateway',
  },
  {
    id: 'tokyo',
    name: 'Tokyo Station',
    nameHi: 'टोक्यो रिले',
    lat: 35.67,
    lng: 139.65,
    x: 84.5,
    y: 40.0,
    status: 'standby',
    role: 'Laser Metrology Calibration',
  },
  {
    id: 'london',
    name: 'London Node',
    nameHi: 'लंदन स्टेशन',
    lat: 51.50,
    lng: -0.12,
    x: 48.0,
    y: 31.0,
    status: 'standby',
    role: 'Global Timestamp & Quantum Sync',
  },
  {
    id: 'ny',
    name: 'New York',
    nameHi: 'न्यूयॉर्क',
    lat: 40.71,
    lng: -74.00,
    x: 28.5,
    y: 36.5,
    status: 'standby',
    role: 'Western Telemetry Mirror',
  },
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
  const [satAngle, setSatAngle] = useState<number>(45);
  const [sat2Angle, setSat2Angle] = useState<number>(210);
  const [radarAngle, setRadarAngle] = useState<number>(0);
  const [tickerLog, setTickerLog] = useState<string>('SAT-TARA-01: ORBITAL LOCK ACTIVE // TELEMETRY NORMAL');

  // Animation loop for orbiting satellites & sweeping radar
  useEffect(() => {
    const interval = setInterval(() => {
      setSatAngle((prev) => (prev + 0.8) % 360);
      setSat2Angle((prev) => (prev + 0.5) % 360);
      setRadarAngle((prev) => (prev + 2.5) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Cycling telemetry status tickers
  useEffect(() => {
    const logs = [
      'SAT-TARA-01: ORBITAL LOCK ACTIVE // DELHI HQ CONNECTED',
      'UPLINK: 14.2 GHz KA-BAND // QUANTUM ENCRYPTION AES-256',
      'GEO-RELAY-09: TARA NEURAL TELEMETRY STREAMING // 120 Mbps',
      'MOHAN VISHWAS FABRICATION: REAL-TIME RATE ENGINE OPERATIONAL',
      'ORBITAL PASS: 420.4 KM ALTITUDE // VELOCITY 7.66 KM/S',
    ];
    let idx = 0;
    const tickerInterval = setInterval(() => {
      idx = (idx + 1) % logs.length;
      setTickerLog(logs[idx]);
    }, 4000);

    return () => clearInterval(tickerInterval);
  }, []);

  // Calculate satellite 1 position along elliptical orbit
  const rad1 = (satAngle * Math.PI) / 180;
  const sat1X = 50 + 38 * Math.cos(rad1);
  const sat1Y = 46 + 22 * Math.sin(rad1);

  // Satellite 2 along tilted orbit
  const rad2 = (sat2Angle * Math.PI) / 180;
  const sat2X = 50 + 34 * Math.cos(rad2 - 0.4);
  const sat2Y = 46 + 26 * Math.sin(rad2 + 0.3);

  return (
    <div className={`flex flex-col h-full bg-[#040814]/95 border border-cyan-500/40 rounded-xl overflow-hidden shadow-[0_0_25px_rgba(0,240,255,0.18)] relative backdrop-blur-md neon-hud-border ${className}`}>
      {/* Sci-Fi HUD Corner Accents */}
      <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 z-20 pointer-events-none shadow-[0_0_8px_#00f0ff]" />
      <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 z-20 pointer-events-none shadow-[0_0_8px_#00f0ff]" />
      <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 z-20 pointer-events-none shadow-[0_0_8px_#00f0ff]" />
      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 z-20 pointer-events-none shadow-[0_0_8px_#00f0ff]" />

      {/* 1. PANEL HEADER */}
      <div className="px-3 py-2 bg-[#060e1d] border-b border-cyan-500/25 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-mono text-xs font-bold text-cyan-300 tracking-wider">
            [01 // ORBITAL SAT-TRACKER]
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>SYNCED</span>
        </div>
      </div>

      {/* 2. GLOWING VECTOR WORLD MAP & SATELLITE CANVAS */}
      <div className="relative flex-1 min-h-[170px] bg-[#030611] overflow-hidden flex items-center justify-center">
        {/* Futuristic Glowing Scanline Effect */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent pointer-events-none animate-hud-scan z-10" />

        {/* Ambient Grid Scanlines */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.2) 0%, transparent 70%), linear-gradient(rgba(0, 240, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.08) 1px, transparent 1px)`,
            backgroundSize: '100% 100%, 20px 20px, 20px 20px',
          }}
        />

        {/* SVG World Map & Orbitals */}
        <svg 
          viewBox="0 0 600 320" 
          className="w-full h-full select-none cursor-crosshair"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Glowing neon gradients */}
            <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
            </linearGradient>
            <radialGradient id="radarBeam" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.0" />
            </radialGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Coordinate Lat/Long Gridlines */}
          <g stroke="#00f0ff" strokeWidth="0.5" strokeOpacity="0.12" strokeDasharray="3 3">
            <line x1="0" y1="80" x2="600" y2="80" />
            <line x1="0" y1="160" x2="600" y2="160" />
            <line x1="0" y1="240" x2="600" y2="240" />
            <line x1="150" y1="0" x2="150" y2="320" />
            <line x1="300" y1="0" x2="300" y2="320" />
            <line x1="450" y1="0" x2="450" y2="320" />
            {/* Equator & Prime Meridian highlight */}
            <line x1="0" y1="160" x2="600" y2="160" strokeOpacity="0.25" strokeDasharray="none" />
            <line x1="300" y1="0" x2="300" y2="320" strokeOpacity="0.25" strokeDasharray="none" />
          </g>

          {/* Rotating Radar Sweep Cone */}
          <g transform="translate(300, 160)">
            <g transform={`rotate(${radarAngle})`}>
              <path 
                d="M 0 0 L 260 -70 A 270 270 0 0 1 270 0 Z" 
                fill="url(#radarBeam)" 
              />
              <line x1="0" y1="0" x2="270" y2="0" stroke="#00f0ff" strokeWidth="1" strokeOpacity="0.6" />
            </g>
            <circle cx="0" cy="0" r="140" fill="none" stroke="#00f0ff" strokeWidth="0.6" strokeOpacity="0.15" />
            <circle cx="0" cy="0" r="230" fill="none" stroke="#00f0ff" strokeWidth="0.6" strokeOpacity="0.1" strokeDasharray="4 4" />
          </g>

          {/* SIMPLIFIED CYBERPUNK VECTOR CONTINENTS */}
          {/* North America */}
          <path 
            d="M 90 70 Q 140 60 190 75 Q 170 110 180 140 Q 150 160 120 180 Q 90 140 80 100 Z" 
            fill="#081a2e" 
            stroke="#00f0ff" 
            strokeWidth="1" 
            strokeOpacity="0.5" 
          />
          {/* South America */}
          <path 
            d="M 160 190 Q 200 200 210 230 Q 190 280 160 300 Q 140 260 150 210 Z" 
            fill="#081a2e" 
            stroke="#00f0ff" 
            strokeWidth="1" 
            strokeOpacity="0.5" 
          />
          {/* Europe & Africa */}
          <path 
            d="M 280 70 Q 320 60 340 90 Q 320 120 290 110 Z" 
            fill="#081a2e" 
            stroke="#00f0ff" 
            strokeWidth="1" 
            strokeOpacity="0.5" 
          />
          <path 
            d="M 280 120 Q 340 125 350 170 Q 330 230 300 250 Q 270 200 280 140 Z" 
            fill="#081a2e" 
            stroke="#00f0ff" 
            strokeWidth="1" 
            strokeOpacity="0.5" 
          />
          {/* Asia & Eurasia */}
          <path 
            d="M 340 70 Q 430 50 510 80 Q 520 130 460 140 Q 430 160 390 140 Q 360 100 340 70 Z" 
            fill="#081a2e" 
            stroke="#00f0ff" 
            strokeWidth="1" 
            strokeOpacity="0.5" 
          />
          {/* Indian Subcontinent (Highlighted in Cyber Neon) */}
          <path 
            d="M 395 125 Q 425 130 435 155 Q 415 185 400 175 Q 385 155 395 125 Z" 
            fill="#0a2a44" 
            stroke="#00f0ff" 
            strokeWidth="1.5" 
            strokeOpacity="0.9"
            filter="url(#glow)"
          />
          {/* Australia */}
          <path 
            d="M 480 200 Q 530 195 540 230 Q 510 260 470 240 Z" 
            fill="#081a2e" 
            stroke="#00f0ff" 
            strokeWidth="1" 
            strokeOpacity="0.5" 
          />

          {/* SATELLITE 1 ORBITAL PATH (Elliptical) */}
          <ellipse 
            cx="300" 
            cy="147" 
            rx="228" 
            ry="70" 
            fill="none" 
            stroke="url(#orbitGrad)" 
            strokeWidth="1.2" 
            strokeDasharray="4 3" 
            strokeOpacity="0.7"
          />

          {/* SATELLITE 2 ORBITAL PATH (Tilted) */}
          <g transform="rotate(-18, 300, 147)">
            <ellipse 
              cx="300" 
              cy="147" 
              rx="204" 
              ry="83" 
              fill="none" 
              stroke="#0284c7" 
              strokeWidth="0.8" 
              strokeDasharray="3 4" 
              strokeOpacity="0.5"
            />
          </g>

          {/* SATELLITE 1: SAT-TARA-01 */}
          <g transform={`translate(${(sat1X / 100) * 600}, ${(sat1Y / 100) * 320})`}>
            {/* Communication Beam to Delhi Node */}
            <line 
              x1="0" 
              y1="0" 
              x2={(GEO_NODES[0].x / 100) * 600 - (sat1X / 100) * 600} 
              y2={(GEO_NODES[0].y / 100) * 320 - (sat1Y / 100) * 320} 
              stroke="#00f0ff" 
              strokeWidth="0.8" 
              strokeOpacity="0.4" 
              strokeDasharray="2 2"
            />
            {/* Satellite Body & Solar Panels */}
            <rect x="-8" y="-2" width="16" height="4" fill="#00f0ff" rx="1" />
            <rect x="-3" y="-5" width="6" height="10" fill="#ffffff" rx="1" />
            <circle cx="0" cy="0" r="2" fill="#0284c7" />
            <text x="10" y="3" fill="#00f0ff" fontSize="7" fontFamily="monospace" fontWeight="bold">
              SAT-TARA-01
            </text>
          </g>

          {/* SATELLITE 2: GEO-RELAY-09 */}
          <g transform={`translate(${(sat2X / 100) * 600}, ${(sat2Y / 100) * 320})`}>
            <rect x="-6" y="-2" width="12" height="4" fill="#38bdf8" rx="1" />
            <rect x="-2" y="-4" width="4" height="8" fill="#e0f2fe" rx="1" />
            <text x="8" y="2" fill="#38bdf8" fontSize="6.5" fontFamily="monospace">
              GEO-RELAY-09
            </text>
          </g>

          {/* INTERACTIVE GEO-NODES */}
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
                  setSelectedNode(node);
                  if (onSelectNode) onSelectNode(node.name);
                }}
              >
                {/* Pulsing Target Rings */}
                <circle 
                  cx="0" 
                  cy="0" 
                  r={isSelected ? "11" : "7"} 
                  fill="none" 
                  stroke={node.id === 'delhi' ? "#00f0ff" : "#38bdf8"} 
                  strokeWidth="1" 
                  className="animate-ping opacity-60" 
                />
                <circle 
                  cx="0" 
                  cy="0" 
                  r={isSelected ? "7" : "5"} 
                  fill={node.id === 'delhi' ? "#00f0ff" : "#0284c7"} 
                  fillOpacity="0.4"
                  stroke="#ffffff"
                  strokeWidth="1"
                />
                <circle cx="0" cy="0" r="2.5" fill="#ffffff" />

                {/* Node Label */}
                <rect 
                  x="8" 
                  y="-11" 
                  width={node.id === 'delhi' ? "75" : "58"} 
                  height="14" 
                  rx="2" 
                  fill="#030c18" 
                  stroke={isSelected ? "#00f0ff" : "#1e3a5f"} 
                  strokeWidth="0.8" 
                />
                <text 
                  x="12" 
                  y="-1" 
                  fill={node.id === 'delhi' ? "#00f0ff" : "#94a3b8"} 
                  fontSize="6.5" 
                  fontFamily="monospace" 
                  fontWeight="bold"
                >
                  {node.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Reticle Overlay at Top Right of Map */}
        <div className="absolute top-2 right-2 p-1.5 rounded bg-[#040c1a]/80 border border-cyan-500/20 text-[9px] font-mono text-cyan-300 pointer-events-none">
          <div>LOC: {selectedNode.lat}°N, {selectedNode.lng}°E</div>
          <div className="text-slate-400">ALT: 420.4 KM // VEL: 7.66 KM/S</div>
        </div>
      </div>

      {/* 3. SELECTED NODE TELEMETRY CARD */}
      <div className="p-2.5 bg-[#050c1b] border-t border-cyan-500/20 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-bold font-mono text-white">
              {selectedNode.nameHi}
            </span>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
            {selectedNode.status.toUpperCase()}
          </span>
        </div>

        <p className="text-[10px] text-slate-300 font-sans line-clamp-1 mb-2">
          {selectedNode.role}
        </p>

        {/* 4-Item Telemetry Matrix */}
        <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono">
          <div className="p-1 rounded bg-[#030814] border border-cyan-500/15 flex items-center justify-between">
            <span className="text-slate-400">Uplink:</span>
            <span className="text-cyan-300 font-bold">14.2 GHz</span>
          </div>
          <div className="p-1 rounded bg-[#030814] border border-cyan-500/15 flex items-center justify-between">
            <span className="text-slate-400">Ping:</span>
            <span className="text-emerald-400 font-bold">12 ms</span>
          </div>
          <div className="p-1 rounded bg-[#030814] border border-cyan-500/15 flex items-center justify-between">
            <span className="text-slate-400">Cipher:</span>
            <span className="text-cyan-300 font-bold">AES-256</span>
          </div>
          <div className="p-1 rounded bg-[#030814] border border-cyan-500/15 flex items-center justify-between">
            <span className="text-slate-400">Band:</span>
            <span className="text-emerald-400 font-bold">Ka-Band</span>
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
