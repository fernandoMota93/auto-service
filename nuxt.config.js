export default {
  ssr: false,
  target: "static",
  head: {
    title: "Grilo Mecânica",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: "Sistema de gestão da Grilo Auto Service",
      },
    ],
  },
  css: ["./assets/scss/custom.scss"],
  plugins: [
    "~/plugins/firebase.js",
    "~/plugins/auth.js",
    "~/plugins/v-money.js",
    "~/plugins/v-mask.js",
    "~/plugins/vue-apexcharts.js",
  ],
  components: true,
  modules: ["@nuxtjs/dotenv", "bootstrap-vue/nuxt"],
  router: {
    middleware: ["auth"],
  },
  bootstrapVue: {
    bootstrapCSS: false, // evita duplicação de CSS
    bootstrapVueCSS: false,
    icons: true,
  },
  publicRuntimeConfig: {
    APP_NAME: process.env.APP_NAME || "Grilo Auto Service",
  },
  build: {},
};
