import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import QRGenerator from './pages/QRGenerator'
import QRCodes from './pages/QRCodes'
import QRScanner from './pages/QRScanner'
import Register from './pages/Register'
import Attendees from './pages/Attendees'
import EditAttendee from './pages/EditAttendee'
import Reports from './pages/Reports'

function App() {
    return (
        <>
            <Navbar />
            <main className="py-4">
                <div className="container">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/qr-generator" element={<QRGenerator />} />
                        <Route path="/qr-codes" element={<QRCodes />} />
                        <Route path="/qr-scanner" element={<QRScanner />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/attendees" element={<Attendees />} />
                        <Route path="/attendees/edit/:id" element={<EditAttendee />} />
                        <Route path="/reports" element={<Reports />} />
                    </Routes>
                </div>
            </main>
        </>
    )
}

export default App
