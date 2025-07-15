import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useLocalStorage from "use-local-storage";
import { validateToken } from "./ValidateToken";

export default function RequireCoachAuth({ children }) {
    const [coachAuthToken, setCoachAuthToken] = useLocalStorage("coachAuthToken", "");
    const [isValid, setIsValid] = useState(null);

    useEffect(() => {
        const checkToken = async () => {
            if (!coachAuthToken) {
                setIsValid(false);
                return;
            }
            const valid = await validateToken(coachAuthToken);
            setIsValid(valid);
            if (!valid) setCoachAuthToken("");
        };
        checkToken();
    }, [coachAuthToken, setCoachAuthToken]);

    if (isValid === null) return <div>Loading...</div>;
    if (!isValid) return <Navigate to="/" replace />;

    return children;
}
