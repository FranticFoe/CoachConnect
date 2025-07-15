import { jwtDecode } from "jwt-decode";
import useLocalStorage from "use-local-storage";

export default function CoachPage() {
    const [coachAuthToken] = useLocalStorage("coachAuthToken", "");

    if (!coachAuthToken) return <h1>Unauthorized</h1>;

    let coachname = "";
    try {
        const decoded = jwtDecode(coachAuthToken);
        coachname = decoded.coachname;
    } catch (err) {
        console.error("Invalid token:", err);
        return <h1>Unauthorized</h1>;
    }

    return (
        <>
            <p>
                Hi! I'm {coachname}, a certified personal trainer with over 6 years of experience helping individuals of all fitness levels achieve their goals.
                Whether you're just getting started or pushing for the next level, I design personalized programs tailored to your body, your schedule, and your goals.
            </p>
            <p>
                My coaching style is supportive, motivational, and results-driven. I believe fitness isn't just about how you look — it's about how you feel,
                how you move, and building the confidence to take control of your health.
            </p>
            <p><strong>Specialties:</strong></p>
            <ul>
                <li>Weight loss and body transformation</li>
                <li>Strength and conditioning</li>
                <li>Mobility and injury prevention</li>
                <li>Nutrition and habit coaching</li>
            </ul>
            <p>
                Let's train smart, stay consistent, and celebrate progress together — one session at a time.
            </p>
        </>

    );
}