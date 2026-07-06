/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep the libSQL client (and its optional native addon) out of the bundle;
  // it is loaded at runtime in the Node.js serverless environment.
  serverExternalPackages: ["@libsql/client", "libsql"],
  reactStrictMode: true,
  // Allow loading the dev server from other devices on the LAN (e.g. your phone).
  allowedDevOrigins: ["192.168.100.74", "192.168.56.1"],
};

export default nextConfig;
