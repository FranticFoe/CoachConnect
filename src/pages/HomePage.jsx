import { useEffect } from "react";
import useLocalStorage from "use-local-storage";
import { useNavigate, useLocation } from "react-router-dom";
export default function Home() {
    const navigate = useNavigate();
    const [coachAuthToken] = useLocalStorage("coachAuthToken", "");
    const [userAuthToken] = useLocalStorage("userAuthToken", "");
    const location = useLocation();

    useEffect(() => {
        if (coachAuthToken && location.pathname === "/") {
            navigate("/coachPage");
        }
    }, [coachAuthToken, navigate, location.pathname]);

    useEffect(() => {
        if (userAuthToken && location.pathname === "/") {
            navigate("/userPage");
        }
    }, [userAuthToken, navigate, location.pathname]);
    return (
        <p>This is the home page. It will display what the booking app does.</p>
    )
}