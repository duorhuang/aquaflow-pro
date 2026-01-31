import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // cacheOnFrontEndNav: true,
  // aggressiveFrontEndNavCaching: true,
  // reloadOnOnline: true,
  // swcMinify: true,
  // workboxOptions: {
  //   disableDevLogs: true,
  // },
});

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/dashboard/editor',
        destination: '/dashboard/new-plan',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
