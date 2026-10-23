import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { TelephonyProvider } from './context/TelephonyContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TelephonyProvider>
          <App />
        </TelephonyProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
