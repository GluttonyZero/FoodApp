// next.config.js
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
  };
  