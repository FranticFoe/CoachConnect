import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useLocalStorage from "use-local-storage";
import { validateToken } from "./ValidateToken";

export default function RequireUserAuth({ children }) {
    const [userAuthToken, setUserAuthToken] = useLocalStorage("userAuthToken", "");
    const [isValid, setIsValid] = useState(null);

    useEffect(() => {
        const checkToken = async () => {
            if (!userAuthToken) {
                setIsValid(false);
                return;
            }
            const valid = await validateToken(userAuthToken);
            setIsValid(valid);
            if (!valid) setUserAuthToken("");
        };
        checkToken();
    }, [userAuthToken, setUserAuthToken]);

    if (isValid === null) return <div>Loading...</div>;
    if (!isValid) return <Navigate to="/" replace />;

    return children;
}
