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
                // Check if already has time_out (Completed)
                if (qrData.attendee.time_out) {
                    setScanResult({
                        type: 'already_out',
                        data: qrData,
                        code
                    })
                    toast.success('Already checked out!')
                }
                // Check if time_in is missing (Needs Time In)
                else if (!qrData.attendee.time_in) {
                    setScanResult({
                        type: 'needs_time_in',
                        data: qrData,
                        code
                    })
                    // Don't auto time-in, wait for user confirmation
                }
                // Check if time_in is present but time_out is missing (Needs Time Out)
                else {
                    // Automatically check out
                    try {
                        const checkoutResponse = await api.post('/attendees', {
                            qr_code_id: qrData._id
                        })

                        const updatedAttendee = checkoutResponse.data.attendee;
                        const type = checkoutResponse.data.type; // 'time_out' or 'completed'

                        if (type === 'completed') {
                            setScanResult({
                                type: 'already_out',
                                data: { ...qrData, attendee: updatedAttendee },
                                code
                            })
                            toast.success('Already checked out!')
                        } else {
                            setScanResult({
                                type: 'checked_out',
                                data: { ...qrData, attendee: updatedAttendee },
                                code
                            })
                            toast.success('✅ Checked Out Successfully!')
                        }
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

    const handleTimeIn = async () => {
        if (!scanResult || !scanResult.data) return;

        setLoading(true);
        try {
            const response = await api.post('/attendees', {
                qr_code_id: scanResult.data._id
            });

            const updatedAttendee = response.data.attendee;

            setScanResult({
                type: 'timed_in',
                data: {
                    ...scanResult.data,
                    attendee: updatedAttendee
                },
                code: scanResult.code
            });
            toast.success('✅ Time In Recorded!');
        } catch (error) {
            toast.error('Failed to time in');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (date) => {
        if (!date) return '—'
        return new Date(date).toLocaleString('en-US', {
            timeZone: 'Asia/Manila',
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
                        <li><strong>First scan:</strong> Register</li>
                        <li><strong>Second scan:</strong> Time In (Requires confirmation)</li>
                        <li><strong>Third scan:</strong> Time Out</li>
                    </ul>
                    <div className="alert alert-warning">
                        <strong>IMPORTANT:</strong> AFTER REGISTRATION DONT SCAN IT AGAIN TO PREVENT TIMING IN, 2ND SCAN WILL BE HOLD ON THE PROPER EVENT
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

                                {scanResult.type === 'needs_time_in' && (
                                    <GlassCard className="p-3">
                                        <div className="alert alert-info mb-3">
                                            <strong>Ready to Time In?</strong>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div>
                                                <p className="text-uppercase text-muted small mb-1">QR Code</p>
                                                <h5 className="mb-0">{scanResult.data.code}</h5>
                                            </div>
                                            <span className="badge badge-info-soft">Registered</span>
                                        </div>

                                        <div className="row g-3 mb-4">
                                            <div className="col-12">
                                                <label className="text-muted small mb-1">Name</label>
                                                <div className="fw-semibold">{scanResult.data.attendee.full_name}</div>
                                            </div>
                                            <div className="col-12">
                                                <label className="text-muted small mb-1">Course / Year</label>
                                                <div>{scanResult.data.attendee.course} {scanResult.data.attendee.year_level}</div>
                                            </div>
                                        </div>

                                        <button
                                            className="btn btn-primary w-100"
                                            onClick={handleTimeIn}
                                            disabled={loading}
                                        >
                                            {loading ? 'Processing...' : 'Proceed to Time In'}
                                        </button>
                                    </GlassCard>
                                )}

                                {scanResult.type === 'timed_in' && (
                                    <GlassCard className="p-3">
                                        <div className="alert alert-success mb-3">
                                            <strong>✅ Time In Recorded!</strong>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div>
                                                <p className="text-uppercase text-muted small mb-1">QR Code</p>
                                                <h5 className="mb-0">{scanResult.data.code}</h5>
                                            </div>
                                            <span className="badge badge-success-soft">Timed In</span>
                                        </div>

                                        <div className="row g-3">
                                            <div className="col-12 col-md-6">
                                                <label className="text-muted small mb-1">Name</label>
                                                <div className="fw-semibold">{scanResult.data.attendee.full_name}</div>
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="text-muted small mb-1">Time In</label>
                                                <div className="text-success fw-bold">{formatDateTime(scanResult.data.attendee.time_in)}</div>
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
