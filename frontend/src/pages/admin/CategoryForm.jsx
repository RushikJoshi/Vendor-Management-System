import { useState } from "react";
import axios from "axios";
import { Sparkles, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function CategoryForm() {
    const [segmentName, setSegmentName] = useState("");
    const [formData, setFormData] = useState({
        uniqueCode: "",
        slug: "",
        description: "",
        approvalType: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleGenerate = async () => {
        if (!segmentName.trim()) {
            setError("Please enter a segment name.");
            return;
        }

        setError("");
        setSuccess(false);
        setLoading(true);

        try {
            console.log("[AI] Sending request for:", segmentName);

            const response = await axios.post(
                "http://localhost:5000/api/category/generate-ai",
                { segmentName: segmentName.trim() },
                { headers: { "Content-Type": "application/json" } }
            );

            console.log("[AI] Raw response:", response);
            console.log("[AI] Response data:", response.data);

            const aiData = response.data?.data;

            if (!aiData) {
                console.error("[AI] No data field in response:", response.data);
                setError("AI returned empty data. Please try again.");
                return;
            }

            console.log("[AI] Parsed aiData:", aiData);

            setFormData(prev => ({
                ...prev,
                uniqueCode: aiData.uniqueCode || "",
                slug: aiData.slug || "",
                description: aiData.description || "",
                approvalType: aiData.approvalType || "",
            }));

            console.log("[AI] Form state updated successfully.");
            setSuccess(true);

        } catch (err) {
            console.error("[AI] Error:", err);
            console.error("[AI] Error response:", err?.response?.data);
            setError(err?.response?.data?.message || "Failed to generate. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <link
                href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                rel="stylesheet"
            />

            <div style={styles.card}>
                {/* Header */}
                <div style={styles.header}>
                    <p style={styles.headerLabel}>Vendor Management System</p>
                    <h1 style={styles.headerTitle}>Category Configuration</h1>
                    <p style={styles.headerSub}>Use AI to instantly auto-fill category details.</p>
                </div>

                <div style={styles.body}>
                    {/* Segment Input */}
                    <div style={styles.aiBox}>
                        <label style={styles.label}>Operational Segment Name</label>
                        <div style={styles.inputRow}>
                            <input
                                type="text"
                                value={segmentName}
                                onChange={(e) => setSegmentName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                                placeholder="e.g. IT Services, Civil Works, Logistics..."
                                style={styles.input}
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                style={{
                                    ...styles.aiBtn,
                                    background: loading ? "#94a3b8" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                                    cursor: loading ? "not-allowed" : "pointer",
                                }}
                            >
                                {loading
                                    ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                                    : <Sparkles size={15} />}
                                {loading ? "Generating..." : "Generate with AI"}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={styles.errorBox}>
                            <AlertCircle size={16} color="#ef4444" />
                            <span style={styles.errorText}>{error}</span>
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div style={styles.successBox}>
                            <CheckCircle2 size={16} color="#16a34a" />
                            <span style={styles.successText}>AI auto-fill complete! Fields updated successfully.</span>
                        </div>
                    )}

                    {/* Form Fields */}
                    <div style={styles.grid2}>
                        <div>
                            <label style={styles.label}>Unique Code</label>
                            <input
                                readOnly
                                value={formData.uniqueCode}
                                placeholder="Auto-generated"
                                style={styles.readOnly}
                            />
                        </div>
                        <div>
                            <label style={styles.label}>Slug</label>
                            <input
                                readOnly
                                value={formData.slug}
                                placeholder="Auto-generated"
                                style={styles.readOnly}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={styles.label}>Description</label>
                        <textarea
                            readOnly
                            value={formData.description}
                            placeholder="AI-generated description will appear here..."
                            rows={5}
                            style={{ ...styles.readOnly, resize: "none", lineHeight: "1.6" }}
                        />
                    </div>

                    <div>
                        <label style={styles.label}>Approval Type</label>
                        <input
                            readOnly
                            value={formData.approvalType}
                            placeholder="Auto-generated"
                            style={styles.readOnly}
                        />
                    </div>

                    {/* Save */}
                    <button
                        type="button"
                        disabled={!formData.uniqueCode}
                        style={{
                            ...styles.saveBtn,
                            background: formData.uniqueCode ? "#0f172a" : "#e2e8f0",
                            color: formData.uniqueCode ? "#fff" : "#94a3b8",
                            cursor: formData.uniqueCode ? "pointer" : "not-allowed",
                        }}
                    >
                        Save Category
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "'Inter', sans-serif",
    },
    card: {
        width: "100%",
        maxWidth: "680px",
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        overflow: "hidden",
    },
    header: {
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
        padding: "2rem",
        color: "#fff",
    },
    headerLabel: {
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.15em",
        color: "#94a3b8",
        textTransform: "uppercase",
        marginBottom: "6px",
        margin: "0 0 6px 0",
    },
    headerTitle: {
        fontSize: "22px",
        fontWeight: 700,
        margin: "0 0 6px 0",
    },
    headerSub: {
        fontSize: "13px",
        color: "#94a3b8",
        margin: 0,
    },
    body: {
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
    },
    aiBox: {
        background: "#f8faff",
        border: "1.5px solid #c7d7f6",
        borderRadius: "12px",
        padding: "1.25rem",
    },
    inputRow: {
        display: "flex",
        gap: "10px",
        marginTop: "8px",
    },
    input: {
        flex: 1,
        padding: "10px 14px",
        fontSize: "14px",
        border: "1.5px solid #cbd5e1",
        borderRadius: "8px",
        outline: "none",
        fontFamily: "inherit",
        color: "#0f172a",
    },
    aiBtn: {
        display: "flex",
        alignItems: "center",
        gap: "7px",
        padding: "10px 18px",
        borderRadius: "8px",
        border: "none",
        color: "#fff",
        fontWeight: 600,
        fontSize: "13px",
        fontFamily: "inherit",
        whiteSpace: "nowrap",
    },
    label: {
        display: "block",
        fontSize: "11px",
        fontWeight: 700,
        color: "#475569",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: "6px",
    },
    readOnly: {
        width: "100%",
        padding: "10px 14px",
        fontSize: "13.5px",
        border: "1.5px solid #e2e8f0",
        borderRadius: "8px",
        background: "#f8fafc",
        color: "#334155",
        fontFamily: "inherit",
        outline: "none",
    },
    grid2: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1rem",
    },
    errorBox: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "#fef2f2",
        border: "1px solid #fca5a5",
        borderRadius: "8px",
        padding: "10px 14px",
    },
    errorText: {
        fontSize: "13px",
        color: "#dc2626",
        fontWeight: 500,
    },
    successBox: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "#f0fdf4",
        border: "1px solid #86efac",
        borderRadius: "8px",
        padding: "10px 14px",
    },
    successText: {
        fontSize: "13px",
        color: "#16a34a",
        fontWeight: 500,
    },
    saveBtn: {
        marginTop: "0.5rem",
        width: "100%",
        padding: "12px",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 600,
        fontFamily: "inherit",
        transition: "background 0.2s",
    },
};
