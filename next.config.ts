import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Handle Node.js polyfills for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        async_hooks: false,
      };
    }

    // Ignore specific Node.js modules on client side
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        "@langchain/langgraph": "commonjs @langchain/langgraph",
        "@langchain/core": "commonjs @langchain/core",
        "@langchain/openai": "commonjs @langchain/openai",
        "@langchain/community": "commonjs @langchain/community",
        "@langchain/textsplitters": "commonjs @langchain/textsplitters",
      });
    }

    return config;
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
