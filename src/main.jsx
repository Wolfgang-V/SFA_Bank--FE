import React from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import App from './App'
import './index.css'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element not found (expected #root)')

createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

