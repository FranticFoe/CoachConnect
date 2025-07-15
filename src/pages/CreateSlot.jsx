import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import useLocalStorage from "use-local-storage";
import { jwtDecode } from "jwt-decode";

const url = "https://gym-api-mauve.vercel.app";

export default function CreateSlot() {
    const [coachtoken] = useLocalStorage("coachAuthToken", "");
    const [availabilities, setAvailabilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formstatus, setFormStatus] = useState("");
    const [slotStatus, setSlotStatus] = useState("");
    const [deletionMode, setDeletionMode] = useState(false);
    const [editStatus, setEditStatus] = useState("")
    const [selectedRows, setSelectedRows] = useState(new Set());

    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        coach_id: "",
        coachname: "",
        start_time: "",
        available_date: "",
        duration: "",
        capacity: "",
        duration_hours: "",
        duration_minutes: ""
    });

    const handleShow = () => {
        setFormStatus("");
        setSlotStatus("");
        setEditMode(false);
        setEditingId(null);
        setFormData({
            coach_id: "",
            coachname: "",
            start_time: "",
            available_date: "",
            duration: "",
            capacity: "",
            duration_hours: "",
            duration_minutes: ""
        });
        setShowModal(true);
    };
    const handleClose = () => setShowModal(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        if (!coachtoken) return;

        async function fetchAvailabilities() {
            try {
                const res = await axios.get(`${url}/availabilities`, {
                    params: { coachtoken },
                });
                setAvailabilities(res.data);
            } catch (err) {
                console.error("Failed to fetch availabilities:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchAvailabilities();
    }, [coachtoken]);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    const shortTime = (t) => (t ? t.slice(0, 5) : "");

    const handleAddSlot = async (e) => {
        e.preventDefault();

        /* build duration (total minutes) */
        const duration =
            Number(formData.duration_hours || 0) * 60 +
            Number(formData.duration_minutes || 0);

        if (duration <= 0) {
            setFormStatus("Invalid");
            return;
        }

        try {
            if (editMode && editingId) {
                /* ▶ UPDATE existing slot */
                await axios.put(
                    `${url}/availabilities/${editingId}`,
                    {
                        available_date: formData.available_date,
                        start_time: formData.start_time,
                        duration,                                // total minutes
                        capacity: formData.capacity || null
                    },
                    { params: { coachtoken } }                 // ?coachtoken=...
                );
            } else {
                /* ▶ CREATE new slot (unchanged) */
                const decoded = jwtDecode(coachtoken);
                await axios.post(
                    `${url}/availabilities`,
                    {
                        coach_id: decoded.id,
                        coachname: decoded.coachname,
                        start_time: formData.start_time,
                        available_date: formData.available_date,
                        duration,
                        capacity: formData.capacity || null
                    },
                    { params: { coachtoken } }
                );
            }

            /* refresh list, reset modal */
            const res = await axios.get(`${url}/availabilities`, { params: { coachtoken } });
            setAvailabilities(res.data);

            setEditMode(false);
            setEditingId(null);
            setShowModal(false);
        } catch (err) {
            console.error("Save failed:", err.response?.data || err.message);
            setSlotStatus("failed");
            alert(err.response?.data?.error || "Unable to save slot.");
        }
    };

    const sortedAvailabilities = [...availabilities].sort((a, b) => {
        return new Date(a.available_date) - new Date(b.available_date);
    });

    const handleDeleteToggle = () => {
        setDeletionMode(true);
        setSelectedRows(new Set());
    };

    const handleRowSelection = (id) => {
        setSelectedRows(prev => {
            const updated = new Set(prev);
            if (updated.has(id)) {
                updated.delete(id);
            } else {
                updated.add(id);
            }
            return updated;
        });
    };

    const handleCancelDelete = () => {
        setDeletionMode(false);
        setSelectedRows(new Set());
    };

    const handleConfirmDelete = async () => {
        try {
            for (let id of selectedRows) {
                await axios.delete(`${url}/availabilities/${id}`, {
                    params: { coachtoken }
                });
            }

            const res = await axios.get(`${url}/availabilities`, {
                params: { coachtoken },
            });
            setAvailabilities(res.data);
            setDeletionMode(false);
            setSelectedRows(new Set());
        } catch (err) {
            console.error("Failed to delete slots:", err);
        }
    };

    const handleEdit = (slot) => {
        // reset status messages
        setFormStatus("");
        setSlotStatus("");

        /* figure out the original duration (minutes) */
        const minutes =
            slot.duration ??
            (() => {
                const [sh, sm] = slot.start_time.split(":").map(Number);
                const [eh, em] = slot.end_time.split(":").map(Number);
                return eh * 60 + em - (sh * 60 + sm);
            })();

        /* pre‑fill the modal */
        setFormData({
            available_date: formatDateForInput(slot.available_date), // yyyy‑MM‑dd
            start_time: shortTime(slot.start_time),                  // HH:mm
            duration_hours: Math.floor(minutes / 60),
            duration_minutes: minutes % 60,
            capacity: slot.capacity ?? ""
        });

        setEditMode(true);          // tell the save‑handler we’re editing ✔
        setEditingId(slot.id);      // remember which slot ✔
        setShowModal(true);         // open modal ✔
    };


    function formatDateForInput(dateStr) {
        const date = new Date(dateStr);
        return date.toISOString().split("T")[0]; // returns 'yyyy-MM-dd'
    }


    return (
        <div className="container mt-4">
            <h3>Available slots: </h3>
            <div className="d-flex gap-2 flex-wrap mb-3">
                <Button onClick={handleShow}>Add Slot</Button>

                {editStatus === "Edit" ? (
                    <Button variant="secondary" onClick={() => setEditStatus("")}>Cancel Edit</Button>
                ) : (
                    <Button variant="warning" onClick={() => setEditStatus("Edit")}>Edit Slot</Button>
                )}

                {!deletionMode && (
                    <Button variant="danger" onClick={handleDeleteToggle}>
                        Delete
                    </Button>
                )}
            </div>


            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Availability Slot</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Available Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="available_date"
                                value={formData.available_date}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Start Time</Form.Label>
                            <Form.Control
                                type="time"
                                name="start_time"
                                value={formData.start_time}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Duration</Form.Label>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <Form.Control
                                    type="number"
                                    name="duration_hours"
                                    min="0"
                                    placeholder="Hours"
                                    value={formData.duration_hours || ""}
                                    onChange={(e) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            duration_hours: e.target.value
                                        }));
                                    }}
                                />
                                <Form.Control
                                    type="number"
                                    name="duration_minutes"
                                    min="0"
                                    max="59"
                                    placeholder="Minutes"
                                    value={formData.duration_minutes || ""}
                                    onChange={(e) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            duration_minutes: e.target.value
                                        }));
                                    }}
                                />
                            </div>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Capacity</Form.Label>
                            <Form.Control
                                type="number"
                                name="capacity"
                                min="1"
                                placeholder="Number of people"
                                value={formData.capacity}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        {formstatus === "Invalid" && (
                            <p className="text-danger">Invalid Form Data.</p>
                        )}
                        {slotStatus === "failed" && (
                            <p className="text-danger">Time slot conflict.</p>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleAddSlot}>
                        Save Slot
                    </Button>
                </Modal.Footer>
            </Modal>

            {loading ? (
                <p>Loading...</p>
            ) : (!sortedAvailabilities || sortedAvailabilities.length === 0) ? (
                <p>No availabilities found.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered table-striped mt-3">
                        <thead className="table-dark text-center">
                            <tr>
                                {deletionMode && <th>Select</th>}
                                {editStatus === "Edit" && <th>Select</th>}
                                <th>Coach Name</th>
                                <th>Date</th>
                                <th>Start Time</th>
                                <th>End Time</th>
                                <th> Capcity of People</th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {sortedAvailabilities.map((slot) => (
                                <tr key={slot.id}>
                                    {deletionMode && (
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.has(slot.id)}
                                                onChange={() => handleRowSelection(slot.id)}
                                            />
                                        </td>
                                    )}
                                    {editStatus === "Edit" && <td>
                                        <Button size="sm" variant="warning" onClick={() => handleEdit(slot)}>
                                            Edit
                                        </Button>
                                    </td>}

                                    <td>{slot.coachname}</td>
                                    <td>{formatDate(slot.available_date)}</td>
                                    <td>{slot.start_time}</td>
                                    <td>{slot.end_time}</td>
                                    <td>{slot.capacity || "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {deletionMode && (
                <div
                    className="d-flex justify-content-between align-items-center px-4 py-3 bg-light border-top"
                    style={{
                        position: "fixed",
                        bottom: 0,
                        left: 0,
                        width: "100%",
                        zIndex: 1050,
                    }}
                >
                    <Button variant="secondary" onClick={handleCancelDelete}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleConfirmDelete}>
                        Confirm Delete
                    </Button>
                </div>
            )}
        </div>
    );
}
