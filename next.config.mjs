import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/lib/sw.ts",
  swDest: "public/sw.js",

});

export default withSerwist({


});
