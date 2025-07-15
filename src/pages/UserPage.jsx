import { jwtDecode } from "jwt-decode";

export default function UserPage() {
    const userAuthToken = localStorage.getItem("userAuthToken")
    const decoded = jwtDecode(userAuthToken);
    const username = decoded.username

    return (
        <>
            <h1>Welcome back, {username}!</h1>

            <h3>About yourself:</h3>

            <p>
                Hey there! I'm <strong>{username}</strong>, and I'm excited to work with a coach
                who can help me achieve my fitness goals. Here's what I think you'd want to know about me:
            </p>

            <ul>
                <li><strong>My goals:</strong> I want to gain muscle and improve upon my endurance </li>
                <li><strong>Experience level:</strong> I'm a beginner when it comes to working out.</li>
                <li><strong>Workout preferences:</strong> I enjoy doing cardio. </li>
                <li><strong>Schedule:</strong> I'm usually free to work out on weekends.</li>
                <li><strong>Health concerns or injuries:</strong> I have none.</li>
                <li><strong>Motivation:</strong> I stay motivated by seeing progress and having a stable routine. </li>
            </ul>

            <p>
                Looking forward to starting strong and staying consistent with your help!
            </p>
        </>
    )
}