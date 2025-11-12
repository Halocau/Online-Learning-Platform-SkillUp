import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'sonner'
import App from './App.jsx'
import './App.css'

const GOOGLE_CLIENT_ID = "650445110591-seugnrenqq24dsieb4vb3fbtrar7rura.apps.googleusercontent.com"

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
