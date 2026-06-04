"use client";

import { memo } from "react";
import type { BackgroundTheme } from "@/lib/background-themes";

interface BackgroundParticlesProps {
  theme: BackgroundTheme;
}

export const BackgroundParticles = memo(function BackgroundParticles({ theme }: BackgroundParticlesProps) {
  if (!theme.particles) return null;

  if (theme.particles.type === "stars") {
    return <StarsAndMoon config={theme.particles.config} />;
  }

  if (theme.particles.type === "fire") {
    return <FireParticles config={theme.particles.config} />;
  }

  return null;
});

function StarsAndMoon({
  config,
}: {
  config: { count?: number; moon?: { size?: number; phase?: string } };
}) {
  const count = config.count ?? 30;
  const moon = config.moon ?? {};
  const moonSize = moon.size ?? 50;

  const stars = Array.from({ length: count }, (_, i) => {
    let seed = i * 7.5;
    const nextRandom = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const size = nextRandom() * 3 + 1;
    const top = nextRandom() * 60;
    const left = nextRandom() * 100;
    const duration = nextRandom() * 4 + 2;
    const delay = nextRandom() * 5;
    const brightness = nextRandom();
    const variant = brightness > 0.7 ? "bright" : brightness < 0.3 ? "dim" : "";

    return (
      <div
        key={i}
        className={`star-particle ${variant}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          top: `${top}%`,
          left: `${left}%`,
          "--twinkle-duration": `${duration}s`,
          "--twinkle-delay": `${delay}s`,
        } as React.CSSProperties}
      />
    );
  });

  return (
    <>
      {stars}
      {/* Crescent moon */}
      {moon.phase === "crescent" && (
        <div
          className="moon-glow"
          style={{
            position: "absolute",
            top: "8%",
            right: "12%",
            width: `${moonSize}px`,
            height: `${moonSize}px`,
          }}
        >
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M70 10 C30 10 10 40 10 60 C10 85 30 95 55 90 C35 80 25 60 30 40 C35 20 50 12 70 10Z"
              fill="rgba(255, 255, 220, 0.9)"
            />
          </svg>
        </div>
      )}
      {moon.phase === "full" && (
        <div
          className="moon-glow"
          style={{
            position: "absolute",
            top: "8%",
            right: "12%",
            width: `${moonSize}px`,
            height: `${moonSize}px`,
            borderRadius: "50%",
            background: "rgba(255, 255, 220, 0.9)",
            boxShadow: "0 0 30px rgba(255, 255, 200, 0.5), 0 0 60px rgba(255, 255, 200, 0.2)",
          }}
        />
      )}
    </>
  );
}

function FireParticles({ config }: { config: { count?: number; colors?: string[] } }) {
  const count = config.count ?? 20;
  const colors = config.colors ?? ["#ff4500", "#ff6b35", "#ffa500", "#ff8c00", "#ff3300"];

  const particles = Array.from({ length: count }, (_, i) => {
    let seed = i * 12.3;
    const nextRandom = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const size = nextRandom() * 20 + 8;
    const left = nextRandom() * 100;
    const bottom = nextRandom() * 10;
    const duration = nextRandom() * 3 + 2;
    const delay = nextRandom() * 5;
    const color = colors[Math.floor(nextRandom() * colors.length)];
    const riseDistance = nextRandom() * 200 + 100;

    return (
      <div
        key={i}
        className="fire-particle"
        style={{
          width: `${size}px`,
          height: `${size * 1.5}px`,
          left: `${left}%`,
          bottom: `${bottom}%`,
          background: `radial-gradient(ellipse at center, ${color}, transparent)`,
          "--fire-duration": `${duration}s`,
          "--fire-delay": `${delay}s`,
          "--fire-rise-distance": `-${riseDistance}px`,
        } as React.CSSProperties}
      />
    );
  });

  // Smaller embers floating higher
  const embers = Array.from({ length: Math.ceil(count / 2) }, (_, i) => {
    let seed = i * 19.7 + 500;
    const nextRandom = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const size = nextRandom() * 6 + 2;
    const left = nextRandom() * 100;
    const duration = nextRandom() * 4 + 3;
    const delay = nextRandom() * 6;
    const color = colors[Math.floor(nextRandom() * colors.length)];

    return (
      <div
        key={`ember-${i}`}
        className="fire-ember"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          left: `${left}%`,
          bottom: "5%",
          background: color,
          "--ember-duration": `${duration}s`,
          "--ember-delay": `${delay}s`,
          "--fire-rise-distance": "-300px",
        } as React.CSSProperties}
      />
    );
  });

  return (
    <>
      {particles}
      {embers}
    </>
  );
}
