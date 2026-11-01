import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Módulo nativo do SQLite: não deve ser empacotado pelo bundler
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
