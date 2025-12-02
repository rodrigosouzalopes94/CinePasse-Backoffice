import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// ❌ REMOVIDO: import './styles/global.css'
// Os estilos agora são injetados exclusivamente via Styled Components no App.jsx

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)