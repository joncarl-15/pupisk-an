import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../api/axios'
import GlassCard from '../components/GlassCard'

function Attendees() {
    const [attendees, setAttendees] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [isAdminUnlocked, setIsAdminUnlocked] = useState(false)

    useEffect(() => {
        fetchAttendees()
    }, [])

    const fetchAttendees = async () => {
        if (!isAdminUnlocked) return // Don't fetch if not unlocked

        try {
            const response = await api.get('/attendees')
            setAttendees(response.data)
        } catch (error) {
            console.error('Error fetching attendees:', error)
            toast.error('Failed to fetch attendees')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isAdminUnlocked) {
            fetchAttendees()
        }
    }, [isAdminUnlocked])

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this attendee?')) return

        try {
            await api.delete(`/attendees/${id}`)
            toast.success('Attendee deleted successfully')
            fetchAttendees()
        } catch (error) {
            toast.error('Failed to delete attendee')
        }
    }

    const handleExport = async () => {
        try {
            const response = await api.get('/attendees/export', {
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'attendance_export.xlsx')
            document.body.appendChild(link)
            link.click()
            link.remove()
            toast.success('Export downloaded successfully')
        } catch (error) {
            toast.error('Failed to export data')
        }
    }

    const filteredAttendees = attendees.filter(attendee => {
        const searchLower = search.toLowerCase()
        return (
            attendee.full_name?.toLowerCase().includes(searchLower) ||
            attendee.course?.toLowerCase().includes(searchLower) ||
            attendee.qr_code_id?.code?.toLowerCase().includes(searchLower)
        )
    })

    const formatDate = (date) => {
        return format(new Date(date), 'MMM dd, yyyy h:mm a')
    }

    const handleUnlock = async () => {
        const password = prompt('Enter Admin Password to View Attendees:')
        if (password === null) return

        try {
            const response = await api.post('/admin/verify', { password })
            if (response.data.success) {
                setIsAdminUnlocked(true)
                toast.success('Access granted!')
            }
        } catch (error) {
            toast.error('Incorrect Password')
        }
    }

    return (
        <GlassCard>
            <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
                <div>
                    <h4 className="mb-1">Registered Attendees</h4>
                    <p className="mb-0 text-muted">Search, update, or clean up the attendee list.</p>
                </div>
                <div className="d-flex flex-wrap gap-2">
                    {!isAdminUnlocked && (
                        <button className="btn btn-warning" onClick={handleUnlock}>
                            Unlock List
                        </button>
                    )}
                    {isAdminUnlocked && (
                        <>
                            <Link className="btn btn-outline-light" to="/qr-generator">Generate QR Codes</Link>
                            <button className="btn btn-primary" onClick={handleExport}>Export to Excel</button>
                        </>
                    )}
                </div>
            </div>

            {isAdminUnlocked ? (
                <>
                    <form className="row g-3 mb-4" onSubmit={(e) => e.preventDefault()}>
                        <div className="col-12 col-md-6">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search name, course, QR..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button className="btn btn-outline-light" type="button">Search</button>
                            </div>
                        </div>
                    </form>

                    <div className="table-responsive">
                        <table className="table table-glass align-middle">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Course / Year</th>
                                    <th>QR Code</th>
                                    <th>Contact</th>
                                    <th>Registered</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted py-4">Loading...</td>
                                    </tr>
                                ) : filteredAttendees.length > 0 ? (
                                    filteredAttendees.map((attendee) => (
                                        <tr key={attendee._id}>
                                            <td className="fw-semibold">
                                                {attendee.full_name}<br />
                                                <small className="text-muted">{attendee.student_number || '—'}</small>
                                            </td>
                                            <td>{attendee.course} {attendee.year_level}</td>
                                            <td>
                                                <span className="badge badge-success-soft">
                                                    {attendee.qr_code_id?.code || 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                <div>{attendee.email || '—'}</div>
                                                <small className="text-muted">{attendee.contact_number || ''}</small>
                                            </td>
                                            <td>{formatDate(attendee.created_at)}</td>
                                            <td className="text-end">
                                                <div className="btn-group">
                                                    <Link
                                                        className="btn btn-sm btn-outline-light"
                                                        to={`/attendees/edit/${attendee._id}`}
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(attendee._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted py-4">No attendees found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="text-center py-5">
                    <div className="mb-3 text-muted">
                        <i className="bi bi-lock-fill fs-1"></i>
                    </div>
                    <h5>Content Locked</h5>
                    <p className="text-muted">Please enter the admin password to view the attendee list.</p>
                    <button className="btn btn-primary" onClick={handleUnlock}>
                        Enter Password
                    </button>
                </div>
            )}
        </GlassCard>
    )
}

export default Attendees
