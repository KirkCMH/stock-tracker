// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    '@nuxtjs/supabase',
  ],

  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },

  supabase: {
    redirect: false,
  },

  runtimeConfig: {
    supabaseServiceKey: '',
    finmindToken: '',
    syncSecret: '',
    public: {
      supabaseUrl: '',
      supabaseAnonKey: '',
    },
  },

  typescript: {
    strict: true,
  },

  css: ['~/assets/css/main.css'],
})
