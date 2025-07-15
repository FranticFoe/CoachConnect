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
import { Navigate } from "react-router-dom";
import useLocalStorage from "use-local-storage";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";


export default function MemberAuth() {
    const url = "https://d6f2da03-86f1-44a0-b30a-17b0e56123a4-00-jaox2jqn66ea.sisko.replit.dev";

    const [mode, setMode] = useState("login");
    const [identifier, setIdentifier] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [authFailed, setAuthFailed] = useState(null);
    const [signStatus, setSignStatus] = useState(null);
    const [userAuthToken, setUserAuthToken] = useLocalStorage("userAuthToken", "");
    const [coachAuthToken] = useLocalStorage("coachAuthToken", "");
    const navigate = useNavigate();

    useEffect(() => {
        if (coachAuthToken) {
            navigate("/coachPage");
        }
    }, [coachAuthToken, navigate])
    useEffect(() => {
        if (userAuthToken) {
            navigate("/userPage");
        }
    }, [userAuthToken, navigate])

    const resetFields = () => {
        setIdentifier("");
        setEmail("");
        setUsername("");
        setPassword("");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${url}/login/users`, {
                usernameOrEmail: identifier,
                password,
            });
            if (res.data && res.data.auth === true && res.data.token) {
                setUserAuthToken(res.data.token);
                console.log("This is authToken", userAuthToken)
                console.log("Login succesfull, auth token saved.")
                resetFields();
                Navigate("/userpage")
            } else {
                setAuthFailed("failed");
            }
        } catch (err) {
            console.error("Login error:", err.response?.data || err.message);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${url}/signup/users`, { email, username, password });
            resetFields();
            if (res.data) {
                setSignStatus("success");
            } else {
                setSignStatus("failed");
            }
            setMode("login");
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
                        {mode === "login" ? "Welcome back!" : "Create your account"}
                    </h3>
                    <p className="text-muted small">
                        {mode === "login"
                            ? "Log in to book your sessions"
                            : "Sign up to get started"}
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
                            <Form.Label className="text-muted small">Email or Username</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter email or username"
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
                                <Form.Label className="text-muted small">Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Choose a username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
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
