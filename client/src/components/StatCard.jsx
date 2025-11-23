function StatCard({ title, value, description }) {
    return (
        <div className="glass-card p-4 stat-card h-100">
            <p className="text-uppercase text-muted small mb-1">{title}</p>
            <h3>{value?.toLocaleString() || '0'}</h3>
            <p className="text-muted mb-0">{description}</p>
        </div>
    )
}

export default StatCard
