import { useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import toast from 'react-hot-toast'
import api from '../api/axios'
import GlassCard from '../components/GlassCard'

function QRScanner() {
    const scannerRef = useRef(null)
    const [scanResult, setScanResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [isScanning, setIsScanning] = useState(false)

    const startScanner = () => {
        if (scannerRef.current) return // Already started

        const scanner = new Html5QrcodeScanner('qr-reader', {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            facingMode: 'environment',
            aspectRatio: 1.0
        })

        scanner.render(onScanSuccess, onScanError)
        scannerRef.current = scanner
        setIsScanning(true)
    }

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error)
            scannerRef.current = null
            setIsScanning(false)
        }
    }

    const extractCode = (decodedText) => {
        const match = decodedText.match(/code=([A-Za-z0-9]+)/i)
        if (match) {
            return match[1].toUpperCase()
        }
        return decodedText.trim().toUpperCase()
    }

    const onScanSuccess = async (decodedText) => {
        const code = extractCode(decodedText)
        setLoading(true)
        setScanResult({ type: 'loading', code, raw: decodedText })

        try {
            const response = await api.get(`/qrcodes/${code}`)
            const qrData = response.data

            // Check if QR is registered and has attendee
            if (qrData.status === 'registered' && qrData.attendee) {
                // Check if already has time_out
                if (qrData.attendee.time_out) {
                    setScanResult({
                        type: 'already_out',
                        data: qrData,
                        code
                    })
                    toast.success('Already checked out!')
                } else {
                    // Automatically check out
                    try {
                        const checkoutResponse = await api.post('/attendees', {
                            qr_code_id: qrData._id
                        })

                        // Refresh data to get updated time_out
                        const updatedResponse = await api.get(`/qrcodes/${code}`)
                        setScanResult({
                            type: 'checked_out',
                            data: updatedResponse.data,
                            code
                        })
                        toast.success('✅ Checked Out Successfully!')
                    } catch (error) {
                        setScanResult({
                            type: 'error',
                            message: 'Failed to check out',
                            code
                        })
                        toast.error('Failed to check out')
                    }
                }
            } else {
                // Not registered yet - show registration option
                setScanResult({ type: 'success', data: qrData, code })
            }
        } catch (error) {
            setScanResult({
                type: 'error',
                message: error.response?.data?.message || 'QR Code not found',
                code
            })
            toast.error('QR Code not found')
        } finally {
            setLoading(false)
        }
    }

    const onScanError = (error) => {
        // Ignore scan errors (they happen frequently during scanning)
        console.debug('Scan error:', error)
    }

    const getRegistrationUrl = (code) => {
        return `${window.location.origin}/register?code=${code}`
    }

    const formatDateTime = (date) => {
        if (!date) return '—'
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
    }

    return (
        <div className="row g-4">
            <div className="col-12 col-lg-5">
                <GlassCard className="h-100">
                    <h4 className="mb-3">Scan Instructions</h4>
                    <ul className="text-white-50 small mb-4">
                        <li>Click "Start Scanner" to activate the camera.</li>
                        <li>Grant camera permission when prompted.</li>
                        <li>Align the QR code within the highlighted box.</li>
                        <li>Hold steady around 15–25 cm from the lens.</li>
                        <li><strong>First scan:</strong> Register/Time In</li>
                        <li><strong>Second scan:</strong> Automatic Time Out</li>
                    </ul>
                    <div className="alert alert-info">
                        <strong>Auto Check-Out:</strong> Scanning a registered QR code will automatically record time out.
                    </div>

                    <div className="d-grid gap-2">
                        {!isScanning ? (
                            <button className="btn btn-primary" onClick={startScanner}>
                                Start Scanner
                            </button>
                        ) : (
                            <button className="btn btn-outline-danger" onClick={stopScanner}>
                                Stop Scanner
                            </button>
                        )}
                    </div>
                </GlassCard>
            </div>

            <div className="col-12 col-lg-7">
                <GlassCard className="h-100 scan-card">
                    <h4 className="mb-3">Live Scanner</h4>
                    <div id="qr-reader" className="rounded-4 overflow-hidden"></div>

                    <div id="scan-feedback" className="mt-4">
                        {scanResult && (
                            <>
                                {scanResult.type === 'loading' && (
                                    <div className="alert alert-secondary">
                                        Scanned payload: <code>{scanResult.raw}</code><br />
                                        Resolving code: <strong>{scanResult.code}</strong>
                                    </div>
                                )}

                                {scanResult.type === 'error' && (
                                    <div className="alert alert-danger mb-0">
                                        <strong>Scan result:</strong> {scanResult.message}
                                    </div>
                                )}

                                {scanResult.type === 'checked_out' && (
                                    <GlassCard className="p-3">
                                        <div className="alert alert-success mb-3">
                                            <strong>✅ Checked Out Successfully!</strong>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div>
                                                <p className="text-uppercase text-muted small mb-1">QR Code</p>
                                                <h5 className="mb-0">{scanResult.data.code}</h5>
                                            </div>
                                            <span className="badge badge-success-soft">Checked Out</span>
                                        </div>

                                        <div className="row g-3">
                                            <div className="col-12 col-md-6">
                                                <label className="text-muted small mb-1">Name</label>
                                                <div className="fw-semibold">{scanResult.data.attendee.full_name}</div>
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="text-muted small mb-1">Course / Year</label>
                                                <div>{scanResult.data.attendee.course} {scanResult.data.attendee.year_level}</div>
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="text-muted small mb-1">Time In</label>
                                                <div className="text-success">{formatDateTime(scanResult.data.attendee.created_at)}</div>
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="text-muted small mb-1">Time Out</label>
                                                <div className="text-danger fw-semibold">{formatDateTime(scanResult.data.attendee.time_out)}</div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                )}

                                {scanResult.type === 'already_out' && (
                                    <GlassCard className="p-3">
                                        <div className="alert alert-warning mb-3">
                                            <strong>Already Checked Out</strong>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div>
                                                <p className="text-uppercase text-muted small mb-1">QR Code</p>
                                                <h5 className="mb-0">{scanResult.data.code}</h5>
                                            </div>
                                            <span className="badge badge-warning-soft">Completed</span>
                                        </div>

                                        <div className="row g-3">
                                            <div className="col-12 col-md-6">
                                                <label className="text-muted small mb-1">Name</label>
                                                <div className="fw-semibold">{scanResult.data.attendee.full_name}</div>
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="text-muted small mb-1">Course / Year</label>
                                                <div>{scanResult.data.attendee.course} {scanResult.data.attendee.year_level}</div>
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="text-muted small mb-1">Time In</label>
                                                <div>{formatDateTime(scanResult.data.attendee.created_at)}</div>
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="text-muted small mb-1">Time Out</label>
                                                <div>{formatDateTime(scanResult.data.attendee.time_out)}</div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                )}

                                {scanResult.type === 'success' && (
                                    <GlassCard className="p-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div>
                                                <p className="text-uppercase text-muted small mb-1">QR Code</p>
                                                <h5 className="mb-0">{scanResult.data.code}</h5>
                                            </div>
                                            <span className={`badge ${scanResult.data.attendee ? 'badge-success-soft' : 'badge-warning-soft'}`}>
                                                {scanResult.data.attendee ? 'Registered' : 'Unregistered'}
                                            </span>
                                        </div>

                                        {scanResult.data.attendee ? (
                                            <div className="row g-3">
                                                <div className="col-12 col-md-6">
                                                    <label className="text-muted small mb-1">Name</label>
                                                    <div className="fw-semibold">{scanResult.data.attendee.full_name}</div>
                                                </div>
                                                <div className="col-12 col-md-6">
                                                    <label className="text-muted small mb-1">Course / Year</label>
                                                    <div>{scanResult.data.attendee.course} {scanResult.data.attendee.year_level}</div>
                                                </div>
                                                <div className="col-12 col-md-6">
                                                    <label className="text-muted small mb-1">Email</label>
                                                    <div>{scanResult.data.attendee.email || '—'}</div>
                                                </div>
                                                <div className="col-12 col-md-6">
                                                    <label className="text-muted small mb-1">Contact</label>
                                                    <div>{scanResult.data.attendee.contact_number || '—'}</div>
                                                </div>
                                                <div className="col-12">
                                                    <label className="text-muted small mb-1">Remarks</label>
                                                    <div>{scanResult.data.attendee.remarks || '—'}</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="alert alert-warning mb-3">
                                                    QR not registered yet. Capture details now.
                                                </div>
                                                <a
                                                    className="btn btn-primary"
                                                    href={getRegistrationUrl(scanResult.data.code)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Open registration form
                                                </a>
                                            </>
                                        )}
                                    </GlassCard>
                                )}
                            </>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}

export default QRScanner
