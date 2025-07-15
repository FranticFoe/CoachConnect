import { useState } from "react";
import {
    Container,
    Card,
    Form,
    Button,
    ToggleButtonGroup,
    ToggleButton,
} from "react-bootstrap";
import axios from "axios";
import useLocalStorage from "use-local-storage";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function CoachAuth() {
    const url =
        "https://d6f2da03-86f1-44a0-b30a-17b0e56123a4-00-jaox2jqn66ea.sisko.replit.dev";

    const [mode, setMode] = useState("login");
    const [identifier, setIdentifier] = useState("");
    const [email, setEmail] = useState("");
    const [coachname, setCoachname] = useState("");
    const [password, setPassword] = useState("");
    const [coachAuthToken, setCoachAuthToken] = useLocalStorage("coachAuthToken", "");
    const [authFailed, setAuthFailed] = useState(null)
    const [signStatus, setSignStatus] = useState(null)
    const [userAuthToken] = useLocalStorage("userAuthToken", "");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (coachAuthToken && location.pathname === "/coachauth") {
            navigate("/coachPage");
        }
    }, [coachAuthToken, navigate, location.pathname]);

    useEffect(() => {
        if (userAuthToken && location.pathname === "/userAuth") {
            navigate("/userPage");
        }
    }, [userAuthToken, navigate, location.pathname]);


    const resetFields = () => {
        setIdentifier("");
        setEmail("");
        setCoachname("");
        setPassword("");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${url}/login/coaches`, {
                usernameOrEmail: identifier,
                password,
            });

            if (res.data && res.data.auth === true && res.data.token) {
                setCoachAuthToken(res.data.token);
                console.log("Login successful, token:", res.data.token);
                resetFields();
                navigate("/coachPage");
            } else {
                setAuthFailed("failed");
            }
        } catch (err) {
            console.error("Login error:", err.response?.data || err.message);
            setAuthFailed("failed");
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${url}/signup/coaches`, {
                email,
                coachname,
                password,
            });
            console.log("Coach account created! You may now log in.");
            resetFields();
            if (res.data) {
                setSignStatus("success")
            } else {
                setSignStatus("failed")
            }
        } catch (err) {
            console.error("Signup error:", err.response?.data || err.message);
        }
    };



    return (
        <Container
            fluid
            className="min-vh-100 d-flex align-items-center justify-content-center bg-light"
        >
            <Card
                className="p-4 shadow border"
                style={{ width: "100%", maxWidth: "420px", backgroundColor: "#fff" }}
            >
                <div className="text-center mb-3">
                    <h3 className="fw-bold">
                        {mode === "login" ? "Coach Login" : "Coach Sign Up"}
                    </h3>
                    <p className="text-muted small">
                        {mode === "login"
                            ? "Log in to manage your coaching sessions"
                            : "Sign up to join as a coach"}
                    </p>
                </div>

                <ToggleButtonGroup
                    type="radio"
                    name="mode"
                    value={mode}
                    onChange={setMode}
                    className="mb-4 d-flex justify-content-center"
                >
                    <ToggleButton
                        id="login-toggle"
                        value="login"
                        variant={mode === "login" ? "primary" : "outline-primary"}
                        className="w-50"
                    >
                        Login
                    </ToggleButton>
                    <ToggleButton
                        id="signup-toggle"
                        value="signup"
                        variant={mode === "signup" ? "primary" : "outline-primary"}
                        className="w-50"
                    >
                        Sign Up
                    </ToggleButton>
                </ToggleButtonGroup>

                <Form
                    onSubmit={mode === "login" ? handleLogin : handleSignup}
                    className="d-grid gap-3"
                >
                    {mode === "login" ? (
                        <Form.Group>
                            <Form.Label className="text-muted small">
                                Email or Coach Name
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter email or coach name"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                            />
                        </Form.Group>
                    ) : (
                        <>
                            <Form.Group>
                                <Form.Label className="text-muted small">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label className="text-muted small">Coach Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter your coach name"
                                    value={coachname}
                                    onChange={(e) => setCoachname(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </>
                    )}

                    <Form.Group>
                        <Form.Label className="text-muted small">Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Button
                        type="submit"
                        variant="success"
                        className="w-100 rounded-pill fw-bold mt-2"
                    >
                        {mode === "login" ? "Log In" : "Continue"}
                    </Button>
                    {mode === "login" && authFailed === "failed" && (
                        <p className="text-danger text-center mt-2">
                            Incorrect username/email or password
                        </p>
                    )}

                    {mode === "signup" && signStatus === "failed" && (
                        <p className="text-danger text-center mt-2">
                            Username/email already exists. Please enter a different one.
                        </p>
                    )}
                    {mode === "signup" && signStatus === "success" && (
                        <p className="text-success text-center mt-2">
                            Account created successfully. You can now login.
                        </p>
                    )}
                    <p className="text-muted small text-center mt-2">
                        By continuing, you agree to the Terms of Service and Privacy Policy.
                    </p>
                </Form>
            </Card>
        </Container>
    );
}
