import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import api from '../api/axios'
import StatCard from '../components/StatCard'
import GlassCard from '../components/GlassCard'

function Dashboard() {
    const [stats, setStats] = useState({ totalQr: 0, registered: 0, available: 0 })
    const [recentAttendees, setRecentAttendees] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            // Fetch QR codes and attendees
            const [qrRes, attendeesRes] = await Promise.all([
                api.get('/qrcodes'),
                api.get('/attendees')
            ])

            const totalQr = qrRes.data.length
            const registered = attendeesRes.data.length
            const available = Math.max(totalQr - registered, 0)

            setStats({ totalQr, registered, available })
            setRecentAttendees(attendeesRes.data.slice(0, 6))
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (date) => {
        return format(new Date(date), 'MMM dd, yyyy h:mm a')
    }

    return (
        <>
            <div className="row g-4">
                <div className="col-12 col-lg-4">
                    <StatCard
                        title="Total QR Codes"
                        value={stats.totalQr}
                        description="Active pool of generated entry passes"
                    />
                </div>
                <div className="col-12 col-lg-4">
                    <StatCard
                        title="Registered Attendees"
                        value={stats.registered}
                        description="Successfully checked-in participants"
                    />
                </div>
                <div className="col-12 col-lg-4">
                    <StatCard
                        title="Available Slots"
                        value={stats.available}
                        description="Remaining QR codes ready to assign"
                    />
                </div>
            </div>

            <section className="mt-5">
                <GlassCard>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                        <div>
                            <h4 className="mb-1">Quick Actions</h4>
                            <p className="mb-0 text-muted">Generate codes, enroll students, and export reports seamlessly.</p>
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                            <Link className="btn btn-primary" to="/qr-generator">Generate QR Codes</Link>
                            <Link className="btn btn-outline-light" to="/attendees">Manage Attendees</Link>
                            <Link className="btn btn-outline-light" to="/reports">Download Report</Link>
                        </div>
                    </div>
                </GlassCard>
            </section>

            <section className="mt-4">
                <GlassCard>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="mb-0">Recent Check-ins</h4>
                        <Link className="btn btn-sm btn-outline-light" to="/attendees">View all</Link>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover table-glass align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Course / Year</th>
                                    <th>Email</th>
                                    <th>QR Code</th>
                                    <th>Checked In</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted py-4">Loading...</td>
                                    </tr>
                                ) : recentAttendees.length > 0 ? (
                                    recentAttendees.map((attendee) => (
                                        <tr key={attendee._id}>
                                            <td className="fw-semibold">{attendee.full_name}</td>
                                            <td>{attendee.course} {attendee.year_level}</td>
                                            <td>{attendee.email || '—'}</td>
                                            <td>
                                                <span className="badge badge-success-soft">
                                                    {attendee.qr_code_id?.code || 'N/A'}
                                                </span>
                                            </td>
                                            <td>{formatDate(attendee.created_at)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted py-4">No attendees yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </section>
        </>
    )
}

export default Dashboard
