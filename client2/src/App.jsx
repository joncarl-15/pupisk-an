import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import QRScanner from './pages/QRScanner'
import Register from './pages/Register'

function App() {
    return (
        <>
            <Navbar />
            <main className="py-4">
                <div className="container">
                    <Routes>
                        <Route path="/" element={<QRScanner />} />
                        <Route path="/register" element={<Register />} />
                    </Routes>
                </div>
            </main>
        </>
    )
}

export default App
