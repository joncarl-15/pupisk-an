import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import GlassCard from '../components/GlassCard'

function QRGenerator() {
    const [quantity, setQuantity] = useState(10)
    const [label, setLabel] = useState('')
    const [qrCodes, setQrCodes] = useState([])
    const [loading, setLoading] = useState(false)
    const [isAdminUnlocked, setIsAdminUnlocked] = useState(false)

    useEffect(() => {
        fetchQRCodes()
    }, [])

    const fetchQRCodes = async () => {
        try {
            const response = await api.get('/qrcodes')
            setQrCodes(response.data.slice(0, 50))
        } catch (error) {
            console.error('Error fetching QR codes:', error)
        }
    }

    const handleGenerate = async (e) => {
        e.preventDefault()

        if (!isAdminUnlocked) {
            toast.error('Please unlock admin controls first')
            return
        }

        if (quantity < 1 || quantity > 3000) {
            toast.error('Please generate between 1 and 3000 QR codes per batch.')
            return
        }

        setLoading(true)
        try {
            const response = await api.post('/qrcodes/generate', { quantity, label })
            toast.success(response.data.message)
            setQuantity(10)
            setLabel('')
            fetchQRCodes()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate QR codes')
        } finally {
            setLoading(false)
        }
    }

    const handleUnlock = () => {
        const password = prompt('Enter Admin Password to Unlock Generation:')
        if (password === 'csc@20252026') {
            setIsAdminUnlocked(true)
            toast.success('Generation unlocked!')
        } else if (password !== null) {
            toast.error('Incorrect Password')
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        toast.success('Link copied to clipboard!')
    }

    const getQRImageUrl = (code) => {
        const registrationUrl = `${window.location.origin}/register?code=${code}`
        return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(registrationUrl)}`
    }

    const getRegistrationUrl = (code) => {
        return `${window.location.origin}/register?code=${code}`
    }

    return (
        <div className="row g-4">
            <div className="col-12 col-lg-4">
                <GlassCard className="h-100">
                    <h4 className="mb-3">Generate New Batch</h4>
                    <form onSubmit={handleGenerate} className="d-grid gap-3">
                        <div>
                            <label className="form-label">How many codes?</label>
                            <input
                                type="number"
                                className="form-control"
                                min="1"
                                max="3000"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                                required
                            />
                            <small className="text-muted">Limit 3000 per batch to keep things manageable.</small>
                        </div>
                        <div>
                            <label className="form-label">Batch label (optional)</label>
                            <input
                                type="text"
                                className="form-control"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100" disabled={loading || !isAdminUnlocked}>
                            {loading ? 'Generating...' : 'Generate Codes'}
                        </button>
                        {!isAdminUnlocked && (
                            <button type="button" className="btn btn-outline-warning w-100" onClick={handleUnlock}>
                                Unlock Generation
                            </button>
                        )}
                    </form>
                </GlassCard>
            </div>

            <div className="col-12 col-lg-8">
                <GlassCard className="h-100">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                        <div>
                            <h4 className="mb-1">Latest QR codes</h4>
                            <p className="mb-0 text-muted">Share or print the QR image for scanning.</p>
                        </div>
                        <div className="d-flex gap-2">
                            <Link className="btn btn-outline-light" to="/qr-codes">View full list</Link>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-glass align-middle">
                            <thead>
                                <tr>
                                    <th>QR</th>
                                    <th>Code</th>
                                    <th>Batch / Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {qrCodes.length > 0 ? (
                                    qrCodes.map((qr) => (
                                        <tr key={qr._id}>
                                            <td>
                                                <div className="qr-preview">
                                                    <img
                                                        src={getQRImageUrl(qr.code)}
                                                        alt={`QR ${qr.code}`}
                                                        className="img-fluid rounded-3"
                                                    />
                                                </div>
                                            </td>
                                            <td className="fw-semibold">{qr.code}</td>
                                            <td>
                                                <div className="text-white-50 small">{qr.label || '—'}</div>
                                                <span className={`badge badge-soft ${qr.status === 'registered' ? 'badge-success-soft' : 'badge-warning-soft'}`}>
                                                    {qr.status.charAt(0).toUpperCase() + qr.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="d-grid gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-light btn-sm"
                                                    onClick={() => copyToClipboard(getRegistrationUrl(qr.code))}
                                                >
                                                    Copy link
                                                </button>
                                                <a
                                                    className="btn btn-primary btn-sm"
                                                    href={getQRImageUrl(qr.code)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Open QR
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center text-muted py-4">No QR codes yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}

export default QRGenerator
