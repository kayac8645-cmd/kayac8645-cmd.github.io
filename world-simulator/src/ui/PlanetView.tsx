import { useEffect, useRef } from 'react';
import { PlanetRenderer } from '../engine/PlanetRenderer';
import { sim } from '../state/simClient';
import { useApp } from '../state/store';
import { DISASTER_INFO } from '../core/types';

export let rendererRef: PlanetRenderer | null = null;

const REPEATABLE = new Set(['heat', 'cool', 'rain', 'dry', 'grass', 'forest', 'raise', 'lower', 'animals']);

function handleTap(lat: number, lon: number, repeat: boolean) {
  const s = useApp.getState();
  if (s.status !== 'ready') return;
  if (repeat && !REPEATABLE.has(s.tool)) return;
  s.set({ selected: { lat, lon } });
  rendererRef?.setSelection(lat, lon);
  if (s.tool !== 'inspect') {
    sim.applyTool({
      tool: s.tool,
      lat,
      lon,
      radiusKm: s.tool === 'disaster' ? s.disaster.radiusKm : s.brushKm,
      strength: repeat ? s.strength * 0.5 : s.strength,
      speciesId: s.speciesId,
      disaster: s.tool === 'disaster' ? s.disaster : undefined,
    });
  }
  sim.query(lat, lon).then((cell) => useApp.getState().set({ cell }));
}

export function PlanetView() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!host.current) return;
    let r: PlanetRenderer;
    try {
      r = new PlanetRenderer(host.current, {
        onTap: handleTap,
        onModeChange: (m) => useApp.getState().set({ cameraMode: m }),
      });
    } catch (e) {
      useApp.getState().toast('WebGL başlatılamadı: ' + (e instanceof Error ? e.message : String(e)), 'warn');
      return;
    }
    rendererRef = r;
    (window as unknown as { __renderer: PlanetRenderer }).__renderer = r;
    const st = useApp.getState();
    r.setQuality(st.settings.quality);
    r.setExaggeration(st.settings.exaggeration);
    r.setShowClouds(st.settings.clouds);
    const offT = sim.onTerrain((hr, sea, params) => {
      r.setTerrain(hr, sea);
      if (params) {
        r.setSeed(params.seed);
        r.setAtmosphere(params.atmosphereDensity);
      }
    });
    const offF = sim.onFrame((f) => r.setFrame(f));
    const fpsTimer = setInterval(() => useApp.getState().set({ fps: r.fps }), 1000);
    const unsub = useApp.subscribe((s, prev) => {
      if (s.settings !== prev.settings) {
        if (s.settings.quality !== prev.settings.quality) r.setQuality(s.settings.quality);
        if (s.settings.exaggeration !== prev.settings.exaggeration) r.setExaggeration(s.settings.exaggeration);
        r.setShowClouds(s.settings.clouds);
      }
      if (s.tool !== prev.tool || s.brushKm !== prev.brushKm || s.disaster !== prev.disaster) {
        const rad = s.tool === 'inspect' ? null : s.tool === 'disaster' ? (DISASTER_INFO[s.disaster.type].global ? null : s.disaster.radiusKm) : s.brushKm;
        r.setBrush(rad);
      }
      if (s.selected !== prev.selected && !s.selected) r.setSelection(null);
    });
    return () => {
      offT();
      offF();
      unsub();
      clearInterval(fpsTimer);
      r.dispose();
      rendererRef = null;
    };
  }, []);
  return <div ref={host} className="planet-view" data-testid="planet-view" />;
}
