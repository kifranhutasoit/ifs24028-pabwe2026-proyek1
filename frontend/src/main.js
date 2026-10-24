import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@fontsource/plus-jakarta-sans/400.css'
import '@fontsource/plus-jakarta-sans/600.css'
import '@fontsource/plus-jakarta-sans/800.css'
import './index.css'
import App from './App.vue'
import { createAppRouter } from './router.js'

createApp(App).use(createPinia()).use(createAppRouter()).mount('#app')