/* eslint-disable @typescript-eslint/no-var-requires */
// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const moduleExports = {
  redirects() {
    return [
      process.env.MODE === 'maintenance'
        ? { source: '/((?!maintenance).*)', destination: '/maintenance', permanent: false }
        : null,
    ].filter(Boolean);
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  // Your existing module.exports
  reactStrictMode: true,
  distDir: 'build',
  experimental: {
    esmExternals: false,
  },
  transpilePackages: ['@cometa/hooks', '@cometa/utils', '@cometa/trpc', '@cometa/contexts', 'react-hotjar'],
};

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  org: 'cometa',
  project: 'dashboard',
  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
  // dryRun: process.env.VERCEL_ENV !== 'production',
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
