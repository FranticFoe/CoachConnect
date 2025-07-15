import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import { Provider } from 'react-redux'
import Home from './pages/HomePage'
import { Navbar, Container, Nav } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import CoachAuth from './pages/CoachAuth'
import MemberAuth from './pages/MemberAuth'
import CoachLayout from './components/CoachLayout'
import RequireCoachAuth from './components/RequireCoachToken'
import CoachPage from './pages/CoachPage'
import CreateSlot from './pages/CreateSlot'
import Logout from './components/Logout'
import RequireUserAuth from './components/RequireUserToken'
import UserPage from './pages/UserPage'
import UserLayout from './components/UserLayout'
import BookSlot from './pages/BookSlot'

function Layout() {
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
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <div className="vr bg-light opacity-50 mt-2" style={{ height: "24px" }} />
              <Nav.Link as={Link} to="/coachauth">I am a Coach</Nav.Link>
              <div className="vr bg-light opacity-50 mt-2" style={{ height: "24px" }} />
              <Nav.Link as={Link} to="/memberauth">I am a Member</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Outlet />
    </>
  )
}

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />} >
            <Route index element={<Home />} />
            <Route path="coachauth" element={<CoachAuth />} />
            <Route path="memberauth" element={<MemberAuth />} />
            <Route path="*" element={<Home />} />
          </Route>

          <Route path="/coachPage" element={<RequireCoachAuth>
            <CoachLayout />
          </RequireCoachAuth>} >
            <Route index element={<CoachPage />} />
            <Route path="createslot" element={<CreateSlot />} />
            <Route path="logout" element={<Logout />} />
          </Route>

          <Route path="/userPage" element={<RequireUserAuth>
            <UserLayout />
          </RequireUserAuth>} >
            <Route index element={<UserPage />} />
            <Route path="availableBookings" element={<BookSlot />} />
            <Route path="logout" element={<Logout />} />
          </Route>

        </Routes>

      </BrowserRouter>

    </>
  )
}

export default App
