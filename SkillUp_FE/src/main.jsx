import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'sonner'
import App from './App.jsx'
import './App.css'

const GOOGLE_CLIENT_ID = "184639190577-7em5iq5it6gcqmdblf266mqguq0a1fkj.apps.googleusercontent.com"

createRoot(document.getElementById('root')).render(
  <>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </>,
)
