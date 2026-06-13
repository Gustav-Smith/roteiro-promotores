export default function BotoesModal({ onCancel, onSave, labelSave }) {
    return (
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button onClick={onCancel} style={{ flex: 1, background: "#1e2d45", color: "#94a3b8", border: "none", borderRadius: 10, padding: "12px 0", fontWeight: 600, cursor: "pointer" }}>
                Cancelar
            </button>
            <button onClick={onSave} style={{ flex: 2, background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff", border: "none", borderRadius: 10, padding: "12px 0", fontWeight: 700, cursor: "pointer" }}>
                {labelSave}
            </button>
        </div>
    );
}
