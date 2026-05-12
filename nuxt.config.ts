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
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
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

  components: {
    dirs: [{ path: '~/components', pathPrefix: false }],
  },

  css: ['~/assets/css/main.css'],
})
