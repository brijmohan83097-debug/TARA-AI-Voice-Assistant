/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

export interface LaptopTelemetry {
  batteryLevel: number; // 0 - 100%
  isCharging: boolean;
  batteryStatusText: string;
  isOnline: boolean;
  latencyMs: number;
  networkType: string;
  downlinkSpeed: string;
}

export function useLaptopTelemetry(): LaptopTelemetry {
  const [telemetry, setTelemetry] = useState<LaptopTelemetry>({
    batteryLevel: 88,
    isCharging: true,
    batteryStatusText: 'AC Connected',
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    latencyMs: 14,
    networkType: 'WiFi 5GHz',
    downlinkSpeed: '100 Mbps',
  });

  useEffect(() => {
    let batteryObj: any = null;

    // 1. Battery Status via Navigator Battery API
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryObj = battery;
        const updateBattery = () => {
          setTelemetry((prev) => ({
            ...prev,
            batteryLevel: Math.round(battery.level * 100),
            isCharging: battery.charging,
            batteryStatusText: battery.charging ? 'Charging (AC)' : 'Battery Discharge',
          }));
        };

        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      }).catch(() => {
        // Fallback simulation
      });
    }

    // 2. Online / Offline Listener
    const handleOnline = () => setTelemetry((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () => setTelemetry((prev) => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 3. Network Connection Info & Latency Ping Jitter
    const pingInterval = setInterval(() => {
      // Jitter latency between 11ms and 24ms for authentic sci-fi HUD telemetry
      const simulatedLatency = 12 + Math.floor(Math.random() * 14);

      let netType = 'WiFi 5GHz';
      let speed = '120 Mbps';

      if (typeof navigator !== 'undefined' && (navigator as any).connection) {
        const conn = (navigator as any).connection;
        if (conn.effectiveType) {
          netType = conn.effectiveType.toUpperCase();
        }
        if (conn.downlink) {
          speed = `${conn.downlink} Mbps`;
        }
      }

      setTelemetry((prev) => ({
        ...prev,
        latencyMs: simulatedLatency,
        networkType: netType,
        downlinkSpeed: speed,
        isOnline: navigator.onLine,
      }));
    }, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(pingInterval);
      if (batteryObj) {
        try {
          batteryObj.removeEventListener('levelchange', () => {});
          batteryObj.removeEventListener('chargingchange', () => {});
        } catch {}
      }
    };
  }, []);

  return telemetry;
}
