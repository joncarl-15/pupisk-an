import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import GlassCard from '../components/GlassCard'
import { format } from 'date-fns'

const COURSES = [
    'BEED', 'BPA', 'BPA-FA', 'BS-Account', 'BSAM', 'BS-Archi', 'BSBA-FM', 'BSBA-MM',
    'BS-Bio', 'BSCE', 'BSED', 'BSEE', 'BSHM', 'BSIT', 'BSND', 'BSOA',
    'DCVET', 'DCET', 'DEET', 'DIT', 'DOMT-LOM', 'DOMT-MOM', 'OUTSIDER'
]

const YEAR_LEVELS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th']

function Register() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const code = searchParams.get('code')

    const [qrData, setQrData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        full_name: '',
        student_number: '',
        course: '',
        year_level: '',
        email: '',
        contact_number: '',
        remarks: ''
    })

    useEffect(() => {
        if (!code) {
            setLoading(false)
            return
        }
        fetchQRData()
    }, [code])

    const fetchQRData = async () => {
        try {
            const response = await api.get(`/qrcodes/${code}`)
            setQrData(response.data)
        } catch (error) {
            toast.error('QR code not found')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.full_name || !formData.course) {
            toast.error('Full name and course are required.')
            return
        }

        setSubmitting(true)
        try {
            await api.post('/attendees', {
                qr_code_id: qrData._id,
                ...formData
            })
            toast.success('Attendance saved! Enjoy Isko-Fest!')
            fetchQRData() // Refresh to show registered state
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save attendance')
        } finally {
            setSubmitting(false)
        }
    }

    if (!code) {
        return (
            <GlassCard className="p-5 text-center">
                <h3>QR code missing</h3>
                <p>Please scan a valid QR code to continue.</p>
            </GlassCard>
        )
    }

    if (loading) {
        return (
            <GlassCard className="p-5 text-center">
                <p>Loading...</p>
            </GlassCard>
        )
    }

    if (!qrData) {
        return (
            <GlassCard className="p-5 text-center">
                <h3>QR code not found</h3>
                <p>Please contact the organizer.</p>
            </GlassCard>
        )
    }

    const attendee = qrData.attendee

    return (
        <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
                <GlassCard>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <p className="text-uppercase text-muted small mb-1">Isko-Fest Attendance</p>
                            <h3 className="mb-0">QR Code {qrData.code}</h3>
                        </div>
                        <span className={`badge badge-soft ${attendee ? 'badge-success-soft' : 'badge-warning-soft'}`}>
                            {attendee ? 'Registered' : 'Waiting for details'}
                        </span>
                    </div>

                    {attendee ? (
                        <>
                            <div className="alert alert-success mb-4">
                                <strong>Welcome back!</strong> This QR has already been registered.
                            </div>
                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <label className="text-muted small mb-1">Full Name</label>
                                    <div className="fw-semibold">{attendee.full_name}</div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="text-muted small mb-1">Course / Year</label>
                                    <div>{attendee.course} {attendee.year_level}</div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="text-muted small mb-1">Student #</label>
                                    <div>{attendee.student_number || '—'}</div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="text-muted small mb-1">Email</label>
                                    <div>{attendee.email || '—'}</div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="text-muted small mb-1">Contact</label>
                                    <div>{attendee.contact_number || '—'}</div>
                                </div>
                                <div className="col-12">
                                    <label className="text-muted small mb-1">Remarks</label>
                                    <div>{attendee.remarks || '—'}</div>
                                </div>
                                <div className="col-12">
                                    <label className="text-muted small mb-1">Registered on</label>
                                    <div>{format(new Date(attendee.created_at), 'MMM dd, yyyy h:mm a')}</div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit} className="row g-3 register-form">
                            <div className="col-12">
                                <label className="form-label">Full name <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    name="full_name"
                                    className="form-control"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label">Student number (optional)</label>
                                <input
                                    type="text"
                                    name="student_number"
                                    className="form-control"
                                    value={formData.student_number}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label">Course <span className="text-danger">*</span></label>
                                <select
                                    name="course"
                                    className="form-select"
                                    value={formData.course}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select course</option>
                                    {COURSES.map(course => (
                                        <option key={course} value={course}>{course}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label">Year level / Section</label>
                                <select
                                    name="year_level"
                                    className="form-select"
                                    value={formData.year_level}
                                    onChange={handleChange}
                                >
                                    <option value="">Select year</option>
                                    {YEAR_LEVELS.map(year => (
                                        <option key={year} value={year}>{year} Year</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-12 col-md-6">
                                <label className="form-label">Contact number</label>
                                <input
                                    type="text"
                                    name="contact_number"
                                    className="form-control"
                                    value={formData.contact_number}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-12">
                                <label className="form-label">Remarks</label>
                                <textarea
                                    name="remarks"
                                    className="form-control"
                                    rows="3"
                                    value={formData.remarks}
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                            <div className="col-12">
                                <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                                    {submitting ? 'Saving...' : 'Save attendance'}
                                </button>
                            </div>
                        </form>
                    )}
                </GlassCard>
            </div>
        </div>
    )
}

export default Register
