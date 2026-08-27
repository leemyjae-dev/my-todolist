import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './app/styles/tokens.css'
import { applyTheme, getInitialTheme } from './shared/lib/theme'
import { applyLocale, getInitialLocale } from './shared/lib/locale'
import App from './App.tsx'

applyTheme(getInitialTheme())
applyLocale(getInitialLocale())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
