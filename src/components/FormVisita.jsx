import { DIAS } from "../data.js";

export default function FormVisita({ visita, setVisita, lojas, promotores, industrias }) {
    const S = {
        label: { display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
        select: { width: "100%", background: "#0f1623", border: "1px solid #1e2d45", borderRadius: 8, padding: "10px 12px", color: "#e8edf3", fontSize: 13, outline: "none" },
    };

    const set = (k, v) => setVisita((p) => ({ ...p, [k]: v }));
    const lojasFiltradas = visita.uf ? lojas.filter((l) => l.uf === visita.uf) : lojas;

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Indústria *</label>
                <select value={visita.industria} onChange={(e) => set("industria", e.target.value)} style={S.select}>
                    <option value="">Selecionar...</option>
                    {industrias.map((i) => (
                        <option key={i}>{i}</option>
                    ))}
                </select>
            </div>
            <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Estado (UF)</label>
                <select
                    value={visita.uf}
                    onChange={(e) => {
                        set("uf", e.target.value);
                        set("loja", "");
                    }}
                    style={S.select}
                >
                    <option value="">Todos</option>
                    {["BA", "DF", "GO", "MS", "MT", "TO"].map((u) => (
                        <option key={u}>{u}</option>
                    ))}
                </select>
            </div>
            <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Loja *</label>
                <select value={visita.loja} onChange={(e) => set("loja", e.target.value)} style={S.select}>
                    <option value="">Selecionar...</option>
                    {lojasFiltradas.map((l, i) => (
                        <option key={i} value={l.loja}>
                            {l.loja} ({l.uf})
                        </option>
                    ))}
                </select>
            </div>
            <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Promotor *</label>
                <select value={visita.promotor} onChange={(e) => set("promotor", e.target.value)} style={S.select}>
                    <option value="">Selecionar...</option>
                    {promotores.map((p) => (
                        <option key={p.nome} value={p.nome}>
                            {p.nome}
                        </option>
                    ))}
                </select>
            </div>
            <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Supervisor</label>
                <select value={visita.supervisor} onChange={(e) => set("supervisor", e.target.value)} style={S.select}>
                    <option value="LUCAS">LUCAS</option>
                    <option value="ALEXANDRE">ALEXANDRE</option>
                </select>
            </div>
            <div>
                <label style={S.label}>Dias da Semana</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {DIAS.map((d) => (
                        <button
                            key={d}
                            onClick={() => setVisita((v) => ({ ...v, dias: { ...v.dias, [d]: !v.dias[d] } }))}
                            type="button"
                            style={{
                                padding: "8px 12px",
                                borderRadius: 8,
                                border: "1px solid",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                                background: visita.dias[d] ? "#1d4ed8" : "#0f1623",
                                borderColor: visita.dias[d] ? "#3b82f6" : "#1e2d45",
                                color: visita.dias[d] ? "#bfdbfe" : "#475569",
                            }}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
