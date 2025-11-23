import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../api/axios'
import GlassCard from '../components/GlassCard'

function Reports() {
    const [fromDate, setFromDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'))
    const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [totalRange, setTotalRange] = useState(0)
    const [courseStats, setCourseStats] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReportData()
    }, [fromDate, toDate])

    const fetchReportData = async () => {
        try {
            const response = await api.get('/attendees')
            const attendees = response.data

            // Filter by date range
            const filtered = attendees.filter(attendee => {
                const createdDate = format(new Date(attendee.created_at), 'yyyy-MM-dd')
                return createdDate >= fromDate && createdDate <= toDate
            })

            setTotalRange(filtered.length)

            // Group by course
            const courseMap = {}
            filtered.forEach(attendee => {
                const course = attendee.course || 'Unspecified'
                courseMap[course] = (courseMap[course] || 0) + 1
            })

            // Convert to array and sort
            const stats = Object.entries(courseMap)
                .map(([course, total]) => ({ course, total }))
                .sort((a, b) => b.total - a.total)
                .slice(0, 6)

            setCourseStats(stats)
        } catch (error) {
            console.error('Error fetching report data:', error)
            toast.error('Failed to fetch report data')
        } finally {
            setLoading(false)
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
            link.setAttribute('download', `attendance_${fromDate}_to_${toDate}.xlsx`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            toast.success('Report downloaded successfully')
        } catch (error) {
            toast.error('Failed to download report')
        }
    }

    const formatDisplayDate = (dateStr) => {
        return format(new Date(dateStr), 'MMM dd, yyyy')
    }

    return (
        <GlassCard>
            <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
                <div>
                    <h4 className="mb-1">Attendance Reports</h4>
                    <p className="mb-0 text-muted">Filter by date, slice by course, and export the dataset.</p>
                </div>
                <button className="btn btn-primary" onClick={handleExport}>Download Excel</button>
            </div>

            <form className="row g-3 mb-4" onSubmit={(e) => e.preventDefault()}>
                <div className="col-12 col-md-4">
                    <label className="form-label">From</label>
                    <input
                        type="date"
                        className="form-control"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />
                </div>
                <div className="col-12 col-md-4">
                    <label className="form-label">To</label>
                    <input
                        type="date"
                        className="form-control"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />
                </div>
                <div className="col-12 col-md-4 align-self-end">
                    <button className="btn btn-outline-light w-100" type="button" onClick={fetchReportData}>
                        Apply filter
                    </button>
                </div>
            </form>

            <div className="row g-4">
                <div className="col-12 col-lg-4">
                    <GlassCard>
                        <p className="text-uppercase text-muted small mb-1">Total check-ins</p>
                        <h2 className="mb-0">{totalRange.toLocaleString()}</h2>
                        <p className="text-muted mb-0">
                            Between {formatDisplayDate(fromDate)} — {formatDisplayDate(toDate)}
                        </p>
                    </GlassCard>
                </div>
                <div className="col-12 col-lg-8">
                    <GlassCard>
                        <h5 className="mb-3">Top courses</h5>
                        {courseStats.length > 0 ? (
                            <div className="list-group list-group-flush">
                                {courseStats.map((stat, index) => (
                                    <div
                                        key={index}
                                        className="list-group-item d-flex justify-content-between align-items-center glass-card mb-2 p-3"
                                    >
                                        <span>{stat.course}</span>
                                        <span className="badge badge-success-soft">
                                            {stat.total} attendee(s)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted">No data for selected range.</p>
                        )}
                    </GlassCard>
                </div>
            </div>
        </GlassCard>
    )
}

export default Reports
