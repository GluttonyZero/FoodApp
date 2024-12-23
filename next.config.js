module.exports = {
    reactStrictMode: true,
    images: {
      domains: ['www.foodbasics.ca'], // add domains if you're using images
    },
    webpack(config) {
      config.node = {
        fs: 'empty', // Fixes issues with 'fs' module in serverless environments
      };
      return config;
    },
    env: {
      PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: "true"  // Ensures Puppeteer doesn't download Chromium
    },
  };
  