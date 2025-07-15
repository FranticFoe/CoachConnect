import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { Navbar, Container, Nav } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function CoachLayout() {
    return (
        <>
            <Navbar bg="dark" variant="dark" expand="md" collapseOnSelect>
                <Container fluid className="px-3">
                    <Navbar.Brand as={Link} to="/" className="me-4">
                        CoachConnect - Easy Bookings, Better Workouts.
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="main-navbar-nav" />
                    <Navbar.Collapse id="main-navbar-nav">
                        <Nav className="ms-auto align-items-center gap-3">
                            <Nav.Link as={Link} to="/coachPage">Home</Nav.Link>
                            <div className="vr bg-light opacity-50 mt-2" style={{ height: "24px" }} />
                            <Nav.Link as={Link} to="/coachPage/createslot">Create workout slot</Nav.Link>
                            <div className="vr bg-light opacity-50 mt-2" style={{ height: "24px" }} />
                            <Nav.Link as={Link} to="/coachPage">View participants</Nav.Link>
                            <div className="vr bg-light opacity-50 mt-2" style={{ height: "24px" }} />
                            <Nav.Link as={Link} to="/coachPage/logout">Logout</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Outlet />
        </>
    )
}
