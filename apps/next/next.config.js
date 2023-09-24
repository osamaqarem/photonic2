/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@photonic/common"],
}

module.exports = nextConfig
