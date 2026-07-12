/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep the libSQL client (and its optional native addon) out of the bundle;
  // it is loaded at runtime in the Node.js serverless environment.
  serverExternalPackages: ["@libsql/client", "libsql"],
  reactStrictMode: true,
  // Allow loading the dev server from other devices on the LAN (e.g. your phone).
  allowedDevOrigins: ["192.168.100.74", "192.168.56.1"],
  // next/image needs the Vercel Blob host allow-listed so it can optimize and
  // serve product images (resized/WebP per device). Blob URLs look like
  // https://<store-id>.public.blob.vercel-storage.com/…
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
