function GlassCard({ children, className = '', ...props }) {
    return (
        <div className={`glass-card p-4 ${className}`} {...props}>
            {children}
        </div>
    )
}

export default GlassCard
