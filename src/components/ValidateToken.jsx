import axios from "axios";

export async function validateToken(token) {
    try {
        const res = await axios.post("https://d6f2da03-86f1-44a0-b30a-17b0e56123a4-00-jaox2jqn66ea.sisko.replit.dev/validate-token", { token: token });
        console.log("The token is validated")
        return res.data.valid === true;
    } catch (err) {
        console.error("Token validation failed:", err);
        return false;
    }
}