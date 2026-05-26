"use client";

/**
 * Subtle animated wave pattern at the bottom of the page.
 * 3-layer SVG wave with different animation speeds.
 */
export function WaveAnimation() {
  return (
    <div className="wave-animation" aria-hidden="true">
      <svg
        className="wave-layer wave-1"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 40 C120 20 240 60 360 40 C480 20 600 60 720 40 C840 20 960 60 1080 40 C1200 20 1320 60 1440 40 L1440 80 L0 80Z"
          fill="rgba(100, 255, 218, 0.06)"
        />
      </svg>
      <svg
        className="wave-layer wave-2"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 50 C180 30 360 70 540 50 C720 30 900 70 1080 50 C1260 30 1440 70 1440 50 L1440 80 L0 80Z"
          fill="rgba(56, 189, 248, 0.04)"
        />
      </svg>
      <svg
        className="wave-layer wave-3"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 55 C240 35 480 75 720 55 C960 35 1200 75 1440 55 L1440 80 L0 80Z"
          fill="rgba(100, 255, 218, 0.03)"
        />
      </svg>
    </div>
  );
}
