module.exports = {
  // images: {
  //     remotePatterns: [
  //         {
  //             protocol: 'https',
  //             hostname: 'api.bn-tour.com',
  //             pathname: '/uploads/**',
  //         },
  //     ],
  // },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3002",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api.renklicyzgy.com",
        pathname: "/uploads/**",
      },
    ],
  },
};
