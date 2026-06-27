"use client";

import { motion } from "framer-motion";

/**
 * Premium Dynamic Water Caustics Background
 * Uses framer-motion and CSS blend modes to create an immersive,
 * deep-water light refraction effect without heavy WebGL.
 */
export function PremiumBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#020b14]">
      {/* Deep water gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#021526] via-[#052220] to-[#01090d] opacity-95" />
      
      {/* Dynamic caustic light layer 1 - Cyan */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.25, 0.1],
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[20%] -left-[10%] w-[80vw] h-[80vw] rounded-[40%_60%_70%_30%] bg-cyan-400/20 mix-blend-screen blur-[100px]"
      />
      
      {/* Dynamic caustic light layer 2 - Emerald */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.3, 0.1],
          rotate: [360, 270, 180, 90, 0],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute top-[10%] -right-[20%] w-[70vw] h-[70vw] rounded-[60%_40%_30%_70%] bg-emerald-400/20 mix-blend-screen blur-[120px]"
      />
      
      {/* Deep ocean blue shifting layer */}
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.3, 0.15],
          y: [0, -50, 0],
          x: [0, 50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[20%] left-[20%] w-[90vw] h-[60vw] rounded-[50%] bg-blue-500/20 mix-blend-overlay blur-[120px]"
      />

      {/* SVG Noise Overlay for fine water particulate texture */}
      <div 
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay" 
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat' 
        }} 
      />
      
      {/* Surface light rays from top */}
      <div className="absolute inset-x-0 top-0 h-[30vh] bg-gradient-to-b from-cyan-100/10 to-transparent mix-blend-overlay pointer-events-none" />
    </div>
  );
}
