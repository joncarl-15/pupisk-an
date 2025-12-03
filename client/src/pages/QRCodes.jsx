import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import GlassCard from '../components/GlassCard'

function QRCodes() {
    const [qrCodes, setQrCodes] = useState([])
    const [statusFilter, setStatusFilter] = useState('')
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [isAdminUnlocked, setIsAdminUnlocked] = useState(false)

    useEffect(() => {
        fetchQRCodes()
    }, [statusFilter])

    const fetchQRCodes = async () => {
        try {
            const response = await api.get('/qrcodes')
            let filtered = response.data

            if (statusFilter) {
                filtered = filtered.filter(qr => qr.status === statusFilter)
            }

            setQrCodes(filtered)
        } catch (error) {
            console.error('Error fetching QR codes:', error)
            toast.error('Failed to fetch QR codes')
        } finally {
            setLoading(false)
        }
    }

    const getRegistrationUrl = (code) => {
        return `https://pupisk-an-user.vercel.app/register?code=${code}`
    }

    const getQRImageUrl = (code) => {
        const registrationUrl = getRegistrationUrl(code)
        return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(registrationUrl)}`
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const handleDownloadAll = async () => {
        if (qrCodes.length === 0) {
            toast.error('No QR codes to download')
            return
        }

        setDownloading(true)
        toast.loading('Generating printable PDF...')

        try {
            // Create a printable HTML page with all QR codes
            const printWindow = window.open('', '_blank')

            const qrCodesHTML = qrCodes.map(qr => `
                <div class="qr-item">
                    <img src="${getQRImageUrl(qr.code)}" alt="${qr.code}" />
                    <div class="qr-code">${qr.code}</div>
                    ${qr.label ? `<div class="qr-label">${qr.label}</div>` : ''}
                </div>
            `).join('')

            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>QR Codes - Print</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body {
                            font-family: Arial, sans-serif;
                            padding: 20px;
                            background: white;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                            padding-bottom: 20px;
                            border-bottom: 2px solid #333;
                        }
                        .header h1 {
                            color: #333;
                            margin-bottom: 10px;
                        }
                        .header p {
                            color: #666;
                        }
                        .qr-grid {
                            display: grid;
                            grid-template-columns: repeat(auto-fill, minmax(1.4in, 1fr));
                            gap: 10px;
                            margin-top: 20px;
                        }
                        .qr-item {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            padding: 10px;
                            border: 1px dashed #ccc;
                            border-radius: 4px;
                            page-break-inside: avoid;
                        }
                        .qr-item img {
                            width: 1in;
                            height: 1in;
                            margin-bottom: 5px;
                        }
                        .qr-code {
                            font-size: 18px;
                            font-weight: bold;
                            color: #333;
                            margin-top: 10px;
                        }
                        .qr-label {
                            font-size: 14px;
                            color: #666;
                            margin-top: 5px;
                        }
                        @media print {
                            body { padding: 10px; }
                            .qr-grid { gap: 20px; }
                            .qr-item { padding: 15px; }
                        }
                        @page {
                            size: A4;
                            margin: 1cm;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>QR Codes - Isko Fest Attendance</h1>
                        <p>Total: ${qrCodes.length} QR Code(s) | Generated: ${new Date().toLocaleDateString()}</p>
                    </div>
                    <div class="qr-grid">
                        ${qrCodesHTML}
                    </div>
                    <script>
                        // Auto print when images are loaded
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                            }, 1000);
                        }
                    </script>
                </body>
                </html>
            `)
            printWindow.document.close()

            toast.dismiss()
            toast.success('Print preview opened!')
        } catch (error) {
            toast.dismiss()
            toast.error('Failed to generate PDF')
        } finally {
            setDownloading(false)
        }
    }

    const handleUnlock = async () => {
        const password = prompt('Enter Admin Password to Unlock Actions:')
        if (password === null) return

        try {
            const response = await api.post('/admin/verify', { password })
            if (response.data.success) {
                setIsAdminUnlocked(true)
                toast.success('Admin actions unlocked!')
            }
        } catch (error) {
            toast.error('Incorrect Password')
        }
    }

    const handleDeleteAll = async () => {
        const generatedCount = qrCodes.filter(qr => qr.status === 'generated').length

        if (generatedCount === 0) {
            toast.error('No generated QR codes to delete')
            return
        }

        if (!window.confirm(`Are you sure you want to delete ALL ${generatedCount} generated QR code(s)? This action cannot be undone!`)) {
            return
        }

        try {
            const response = await api.delete('/qrcodes/generated/all')
            toast.success(response.data.message)
            fetchQRCodes()
        } catch (error) {
            toast.error('Failed to delete QR codes')
        }
    }

    return (
        <GlassCard>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h4 className="mb-1">QR Code Inventory</h4>
                    <p className="mb-0 text-muted">Track every generated QR and its assignment.</p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                    {!isAdminUnlocked && (
                        <button className="btn btn-outline-warning" onClick={handleUnlock}>
                            Unlock Admin
                        </button>
                    )}
                    <button
                        className="btn btn-outline-light"
                        onClick={() => {
                            if (isAdminUnlocked) {
                                window.location.href = '/qr-generator'
                            }
                        }}
                        disabled={!isAdminUnlocked}
                    >
                        Generate QR
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleDownloadAll}
                        disabled={downloading || qrCodes.length === 0}
                    >
                        {downloading ? 'Generating...' : 'Download All as PDF'}
                    </button>
                    <button
                        className="btn btn-outline-danger"
                        onClick={handleDeleteAll}
                        disabled={!isAdminUnlocked || qrCodes.filter(qr => qr.status === 'generated').length === 0}
                    >
                        Delete All Generated
                    </button>
                </div>
            </div>

            <form method="get" className="row g-3 mb-4">
                <div className="col-12 col-md-4">
                    <select
                        name="status"
                        className="form-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All statuses</option>
                        <option value="generated">Generated</option>
                        <option value="registered">Registered</option>
                    </select>
                </div>
            </form>

            <div className="table-responsive">
                <table className="table table-glass align-middle">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Batch</th>
                            <th>Status</th>
                            <th>Assigned To</th>
                            <th>Generated</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center text-muted py-4">Loading...</td>
                            </tr>
                        ) : qrCodes.length > 0 ? (
                            qrCodes.map((qr) => (
                                <tr key={qr._id}>
                                    <td className="fw-semibold">{qr.code}</td>
                                    <td>{qr.label || '—'}</td>
                                    <td>
                                        <span className={`badge badge-soft ${qr.status === 'registered' ? 'badge-success-soft' : 'badge-warning-soft'}`}>
                                            {qr.status.charAt(0).toUpperCase() + qr.status.slice(1)}
                                        </span>
                                    </td>
                                    <td>
                                        {qr.attendee ? (
                                            <div>
                                                <div className="fw-semibold">{qr.attendee.full_name}</div>
                                                <small className="text-muted">{qr.attendee.course}</small>
                                            </div>
                                        ) : (
                                            <span className="text-muted">—</span>
                                        )}
                                    </td>
                                    <td>{formatDate(qr.created_at)}</td>
                                    <td className="text-end">
                                        <div className="btn-group flex-wrap">
                                            <Link
                                                className="btn btn-sm btn-outline-light"
                                                to={`/register?code=${qr.code}`}
                                                target="_blank"
                                            >
                                                Open form
                                            </Link>
                                            <a
                                                className="btn btn-sm btn-outline-light"
                                                href={getQRImageUrl(qr.code)}
                                                download
                                            >
                                                Download QR
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center text-muted py-4">No QR codes yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </GlassCard>
    )
}

export default QRCodes
