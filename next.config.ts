import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Imagen de producción mínima (Dockerfile, target `prod`): solo los archivos necesarios para ejecutar.
  output: "standalone",
};

export default nextConfig;
