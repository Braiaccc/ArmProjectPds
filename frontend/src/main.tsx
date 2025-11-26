import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* NÃO coloque AuthProvider ou BrowserRouter aqui, pois já estão no App.tsx */}
    <App />
  </React.StrictMode>,
)