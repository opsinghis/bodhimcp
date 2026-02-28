/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mcp-handler'],
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
