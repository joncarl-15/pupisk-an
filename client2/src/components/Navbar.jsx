import { Link, useLocation } from 'react-router-dom'

function Navbar() {
    const location = useLocation()

    const isActive = (path) => {
        return location.pathname === path ? 'active' : ''
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-dark shadow-sm sticky-top glass-nav">
            <div className="container">
                <Link className="navbar-brand fw-bold" to="/">PUP Isk-An</Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive('/')}`} to="/">Scan QR</Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive('/register')}`} to="/register">Register</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
