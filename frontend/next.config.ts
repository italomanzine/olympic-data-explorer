import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignorar erros de ESLint durante o build para evitar bloqueios de deploy
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
