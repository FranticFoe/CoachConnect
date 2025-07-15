import axios from "axios";

export async function validateToken(token) {
    try {
        const res = await axios.post("https://gym-api-mauve.vercel.app/validate-token", { token: token });
        console.log("The token is validated")
        return res.data.valid === true;
    } catch (err) {
        console.error("Token validation failed:", err);
        return false;
    }
}