/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable tracing to avoid the EPERM error
  experimental: {
    outputFileTracing: false,
  },
  // Disable telemetry
  telemetry: {
    telemetryDisabled: true,
  },
};

module.exports = nextConfig;
