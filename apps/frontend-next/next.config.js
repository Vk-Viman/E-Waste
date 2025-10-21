/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  transpilePackages: ["@ecocollect/ui", "@ecocollect/shared-types", "@ecocollect/config"],
};
module.exports = nextConfig;
