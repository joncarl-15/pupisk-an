import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: 'rgba(49, 19, 0, 0.95)',
                        color: '#fff3e0',
                        border: '1px solid rgba(255, 196, 140, 0.3)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#5ce1a9',
                            secondary: '#fff3e0',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ff8a8a',
                            secondary: '#fff3e0',
                        },
                    },
                }}
            />
        </BrowserRouter>
    </React.StrictMode>,
)
