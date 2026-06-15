import { DIAS } from "../data.js";
import MultiSelect from "./MultiSelect.jsx";

export default function FormVisita({ isEditing = false, visita, setVisita, lojas, promotores, industrias, supervisores = [] }) {
    const S = {
        label: { display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
        select: { width: "100%", background: "#0f1623", border: "1px solid #1e2d45", borderRadius: 8, padding: "10px 12px", color: "#e8edf3", fontSize: 13, outline: "none" },
    };

    const set = (k, v) => setVisita((p) => ({ ...p, [k]: v }));
    const lojasFiltradas = visita.uf ? lojas.filter((l) => l.uf === visita.uf) : lojas;

    return (
        <div>
            {/* INDÚSTRIA */}
            <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Indústria *</label>
                {isEditing ? (
                    <select value={visita.industria} onChange={(e) => set("industria", e.target.value)} style={S.select}>
                        <option value="">Selecionar...</option>
                        {industrias.map((i) => (
                            <option key={i}>{i}</option>
                        ))}
                    </select>
                ) : (
                    <MultiSelect
                        options={industrias}
                        selectedValues={visita.industrias || []}
                        onChange={(vals) => set("industrias", vals)}
                        placeholder="Selecionar indústrias..."
                        searchPlaceholder="Buscar indústria..."
                    />
                )}
            </div>

            {/* ESTADO (UF) */}
            <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Estado (UF)</label>
                <select
                    value={visita.uf}
                    onChange={(e) => {
                        const nextUf = e.target.value;
                        set("uf", nextUf);
                        if (isEditing) {
                            set("loja", "");
                        } else {
                            // Limpa lojas que não pertencem à UF selecionada
                            const novasLojas = (visita.lojas || []).filter(lojaNome => {
                                const lojaObj = lojas.find(l => l.loja === lojaNome);
                                return !nextUf || (lojaObj && lojaObj.uf === nextUf);
                            });
                            set("lojas", novasLojas);
                        }
                    }}
                    style={S.select}
                >
                    <option value="">Todos</option>
                    {["BA", "DF", "GO", "MS", "MT", "TO"].map((u) => (
                        <option key={u}>{u}</option>
                    ))}
                </select>
            </div>

            {/* LOJA */}
            <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Loja *</label>
                {isEditing ? (
                    <select value={visita.loja} onChange={(e) => set("loja", e.target.value)} style={S.select}>
                        <option value="">Selecionar...</option>
                        {lojasFiltradas.map((l, i) => (
                            <option key={i} value={l.loja}>
                                {l.loja} ({l.uf})
                            </option>
                        ))}
                    </select>
                ) : (
                    <MultiSelect
                        options={lojasFiltradas.map((l) => l.loja)}
                        selectedValues={visita.lojas || []}
                        onChange={(vals) => set("lojas", vals)}
                        placeholder="Selecionar lojas..."
                        searchPlaceholder="Buscar loja..."
                    />
                )}
            </div>

            {/* PROMOTOR */}
            <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Promotor *</label>
                {isEditing ? (
                    <select value={visita.promotor} onChange={(e) => set("promotor", e.target.value)} style={S.select}>
                        <option value="">Selecionar...</option>
                        {promotores.map((p) => (
                            <option key={p.nome} value={p.nome}>
                                {p.nome}
                            </option>
                        ))}
                    </select>
                ) : (
                    <MultiSelect
                        options={promotores.map((p) => p.nome)}
                        selectedValues={visita.promotores || []}
                        onChange={(vals) => set("promotores", vals)}
                        placeholder="Selecionar promotores..."
                        searchPlaceholder="Buscar promotor..."
                    />
                )}
            </div>

            {/* SUPERVISOR */}
            <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Supervisor</label>
                <select value={visita.supervisor} onChange={(e) => set("supervisor", e.target.value)} style={S.select}>
                    <option value="LUCAS">LUCAS</option>
                    <option value="ALEXANDRE">ALEXANDRE</option>
                </select>
            </div>

            {/* DIAS DA SEMANA */}
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
