
import { useEffect } from "react";
import useLocalStorage from "use-local-storage";
import { useNavigate } from "react-router-dom";

export default function Logout() {
    const [, setCoachAuthToken] = useLocalStorage("coachAuthToken", "");
    const [, setUserAuthToken] = useLocalStorage("userAuthToken", "");
    const navigate = useNavigate();

    useEffect(() => {
        setCoachAuthToken("");
        setUserAuthToken("");
        navigate("/");
    }, [setCoachAuthToken, setUserAuthToken, navigate]);

    return null;
}
