import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import GlassCard from '../components/GlassCard'

const COURSES = [
    'BEED', 'BPA', 'BPA-FA', 'BS-Account', 'BSAM', 'BS-Archi', 'BSBA-FM', 'BSBA-MM',
    'BS-Bio', 'BSCE', 'BSED', 'BSEE', 'BSHM', 'BSIT', 'BSND', 'BSOA',
    'DCVET', 'DCET', 'DEET', 'DIT', 'DOMT-LOM', 'DOMT-MOM', 'OUTSIDER'
]

const YEAR_LEVELS = ['1st', '2nd', '3rd', '4th', 'Ladderize', 'Overstaying']

function EditAttendee() {
    const { id } = useParams()
    const navigate = useNavigate()
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
        fetchAttendee()
    }, [id])

    const fetchAttendee = async () => {
        try {
            const response = await api.get('/attendees')
            const attendee = response.data.find(a => a._id === id)

            if (!attendee) {
                toast.error('Attendee not found')
                navigate('/attendees')
                return
            }

            setFormData({
                full_name: attendee.full_name || '',
                student_number: attendee.student_number || '',
                course: attendee.course || '',
                year_level: attendee.year_level || '',
                email: attendee.email || '',
                contact_number: attendee.contact_number || '',
                remarks: attendee.remarks || ''
            })
        } catch (error) {
            toast.error('Failed to fetch attendee')
            navigate('/attendees')
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
            await api.put(`/attendees/${id}`, formData)
            toast.success('Attendee updated successfully.')
            navigate('/attendees')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update attendee')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <GlassCard className="p-5 text-center">
                <p>Loading...</p>
            </GlassCard>
        )
    }

    return (
        <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
                <GlassCard>
                    <h3 className="mb-4">Edit Attendee</h3>
                    <form onSubmit={handleSubmit} className="row g-3">
                        <div className="col-12">
                            <label className="form-label">Full name <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="col-12 col-md-6">
                            <label className="form-label">Student number</label>
                            <input
                                type="text"
                                className="form-control"
                                name="student_number"
                                value={formData.student_number}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-12 col-md-6">
                            <label className="form-label">Course <span className="text-danger">*</span></label>
                            <select
                                className="form-select"
                                name="course"
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
                                className="form-select"
                                name="year_level"
                                value={formData.year_level}
                                onChange={handleChange}
                            >
                                <option value="">Select year</option>
                                {YEAR_LEVELS.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-12 col-md-6">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-12 col-md-6">
                            <label className="form-label">Contact number</label>
                            <input
                                type="text"
                                className="form-control"
                                name="contact_number"
                                value={formData.contact_number}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label">Remarks</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                        <div className="col-12 d-flex gap-2">
                            <Link className="btn btn-outline-light" to="/attendees">Cancel</Link>
                            <button type="submit" className="btn btn-primary ms-auto" disabled={submitting}>
                                {submitting ? 'Saving...' : 'Save changes'}
                            </button>
                        </div>
                    </form>
                </GlassCard>
            </div>
        </div>
    )
}

export default EditAttendee
