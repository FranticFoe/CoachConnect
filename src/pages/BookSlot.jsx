import axios from "axios";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import useLocalStorage from "use-local-storage";
import { jwtDecode } from "jwt-decode";

const url =
    "https://gym-api-mauve.vercel.app/";

export default function BookSlot() {
    const [userAuthToken] = useLocalStorage("userAuthToken", "");
    const [availabilities, setAvailabilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookedStatus, setBookedStatus] = useState("");
    const [bookingMode, setBookingMode] = useState(false);
    const [userBookings, setUserBookings] = useState(new Set());
    const [selectedRows, setSelectedRows] = useState(new Set());

    const [deleting, setDeleting] = useState(false);
    const [rowsToDelete, setRowsToDelete] = useState(new Set());

    const formatDate = (d) =>
        new Date(d).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });

    const fetchAvailabilities = async () => {
        if (!userAuthToken) return;
        setLoading(true);
        try {
            const res = await axios.get(`${url}/availabilities`, {
                params: { usertoken: userAuthToken },
            });
            setAvailabilities(res.data);
        } catch (err) {
            console.error("Failed to fetch availabilities:", err);
        } finally {
            setLoading(false);
        }
    };

    const sortedAvailabilities = [...availabilities].sort(
        (a, b) => new Date(a.available_date) - new Date(b.available_date)
    );

    const toggleRow = (id) =>
        setSelectedRows((prev) => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });

    const toggleDeleteRow = (id) =>
        setRowsToDelete((prev) => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });

    const handleConfirmBooking = async () => {
        if (selectedRows.size === 0) return;

        const { id: user_id } = jwtDecode(userAuthToken);
        const failures = [];

        for (const available_id of selectedRows) {
            try {
                await axios.post(`${url}/bookings`, { user_id, available_id });
            } catch (err) {
                console.error(`Slot ${available_id} could not be booked:`, err);
                failures.push(available_id);
            }
        }

        if (failures.length) setBookedStatus("failed");

        await fetchAvailabilities();
        setBookingMode(false);
        setSelectedRows(new Set());
    };

    const handleConfirmDelete = async () => {
        if (rowsToDelete.size === 0) return;

        const { id: user_id } = jwtDecode(userAuthToken);

        for (const available_id of rowsToDelete) {
            try {
                await axios.delete(`${url}/bookings`, {
                    data: { user_id, available_id },
                });
            } catch (err) {
                console.error(`Could not delete booking ${available_id}:`, err);
            }
        }

        await fetchAvailabilities();
        await fetchUserBookings();
        setDeleting(false);
        setRowsToDelete(new Set());
    };

    const fetchUserBookings = async () => {
        const { id: user_id } = jwtDecode(userAuthToken);
        if (!user_id) return;

        try {
            const res = await axios.get(`${url}/bookings`, {
                params: { user_id, userToken: userAuthToken },
            });
            const bookedIds = new Set(res.data.map((b) => b.available_id));
            setUserBookings(bookedIds);
            setSelectedRows(bookedIds);
        } catch (err) {
            console.error("Failed to fetch user bookings:", err);
        }
    };

    useEffect(() => {
        if (!userAuthToken) return;

        fetchAvailabilities();
        fetchUserBookings();
    }, [userAuthToken]);

    const bookedSlots = sortedAvailabilities.filter((slot) =>
        userBookings.has(slot.id)
    );

    return (
        <>
            {bookedStatus === "failed" && (
                <div
                    className="modal show"
                    tabIndex="-1"
                    style={{
                        display: "block",
                        background: "rgba(0,0,0,0.5)",
                    }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div
                                className="modal-header"
                                style={{ backgroundColor: "#dc3545", color: "white" }}
                            >
                                <h5 className="modal-title">Error: 409</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Close"
                                    onClick={() => setBookedStatus("")}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>Slots are full or has been booked before</p>
                            </div>
                            <div className="modal-footer">
                                <Button variant="secondary" onClick={() => setBookedStatus("")}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-4 mb-3 d-flex justify-content-between align-items-center">
                <h3 className="mx-4">Available slots</h3>
            </div>

            <div className="d-flex gap-2 mx-4 mb-4">
                {!bookingMode ? (
                    <Button onClick={() => setBookingMode(true)}>Book Now</Button>
                ) : (
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setBookingMode(false);
                                setSelectedRows(new Set());
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="success"
                            disabled={selectedRows.size === 0}
                            onClick={handleConfirmBooking}
                        >
                            Confirm&nbsp;Booking&nbsp;
                            {selectedRows.size > 0 && `(${selectedRows.size})`}
                        </Button>
                    </>
                )}
            </div>

            {loading ? (
                <p className="text-center">Loading…</p>
            ) : sortedAvailabilities.length === 0 ? (
                <p className="text-center">No slots available.</p>
            ) : (
                <div className="table-responsive d-flex justify-content-center">
                    <table className="table table-bordered table-striped w-auto">
                        <thead className="table-dark text-center">
                            <tr>
                                <th>Coach</th>
                                <th>Date</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Max&nbsp;People</th>
                                <th>No. of People </th>
                                {bookingMode && <th>Select</th>}
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {sortedAvailabilities.map((slot) => (
                                <tr key={slot.id}>
                                    <td>{slot.coachname}</td>
                                    <td>{formatDate(slot.available_date)}</td>
                                    <td>{slot.start_time}</td>
                                    <td>{slot.end_time}</td>
                                    <td>{slot.capacity ?? "-"}</td>
                                    <td>
                                        {slot.capacity === null
                                            ? "Unlimited"
                                            : `${slot.current_bookings}/${slot.capacity}`}
                                    </td>
                                    {bookingMode && (
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.has(slot.id)}
                                                onChange={() => toggleRow(slot.id)}
                                            />
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mx-4 mt-5">
                <h3>Slots you have booked:</h3>
            </div>

            <div className="mx-4 mb-2 d-flex gap-2">
                {!deleting ? (
                    <Button variant="danger" onClick={() => setDeleting(true)}>
                        Delete&nbsp;Booking
                    </Button>
                ) : (
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setDeleting(false);
                                setRowsToDelete(new Set());
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            disabled={rowsToDelete.size === 0}
                            onClick={handleConfirmDelete}
                        >
                            Confirm&nbsp;Delete&nbsp;
                            {rowsToDelete.size > 0 && `(${rowsToDelete.size})`}
                        </Button>
                    </>
                )}
            </div>

            {bookedSlots.length === 0 ? (
                <p className="text-center">You haven't booked any slots yet.</p>
            ) : (
                <div className="table-responsive d-flex justify-content-center mt-3">
                    <table className="table table-bordered table-striped w-auto">
                        <thead className="table-primary text-center">
                            <tr>
                                <th>Coach</th>
                                <th>Date</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Max&nbsp;People</th>
                                <th>No. of People</th>
                                {deleting && <th>Select</th>}
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {bookedSlots.map((slot) => (
                                <tr key={slot.id}>
                                    <td>{slot.coachname}</td>
                                    <td>{formatDate(slot.available_date)}</td>
                                    <td>{slot.start_time}</td>
                                    <td>{slot.end_time}</td>
                                    <td>{slot.capacity ?? "-"}</td>
                                    <td>
                                        {slot.capacity === null
                                            ? "Unlimited"
                                            : `${slot.current_bookings}/${slot.capacity}`}
                                    </td>
                                    {deleting && (
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={rowsToDelete.has(slot.id)}
                                                onChange={() => toggleDeleteRow(slot.id)}
                                            />
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
