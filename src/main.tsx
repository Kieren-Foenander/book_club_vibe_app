import { createRoot } from 'react-dom/client'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { ConvexReactClient } from 'convex/react'
import './index.css'
import App from './App'
// @ts-expect-error vite-plugin-pwa virtual module
import { registerSW } from 'virtual:pwa-register'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

createRoot(document.getElementById('root')!).render(
  <ConvexAuthProvider client={convex}>
    <App />
  </ConvexAuthProvider>
)

registerSW({ immediate: true })
