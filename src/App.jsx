import { useState, useMemo } from "react";
import Modal from "./components/Modal.jsx";
import BotoesModal from "./components/BotoesModal.jsx";
import FormVisita from "./components/FormVisita.jsx";
import {
    PROMOTORES_DADOS,
    INDUSTRIAS,
    TODAS_LOJAS,
    DIAS,
    DIAS_LABELS,
    UF_CORES,
    ROTEIROS_INICIAIS,
} from "./data.js";

const nome2 = (n) => {
    const p = n.trim().split(" ");
    return p.length <= 2 ? n : `${p[0]} ${p[p.length - 1]}`;
};

export default function App() {
    const [tab, setTab] = useState("Roteiros");
    const [roteiros, setRoteiros] = useState(ROTEIROS_INICIAIS);
    const [filtros, setFiltros] = useState({ promotor: "", supervisor: "", uf: "", dia: "", busca: "" });
    const [modalVisita, setModalVisita] = useState(false);
    const [modalEditar, setModalEditar] = useState(null);
    const [novaVisita, setNovaVisita] = useState({
        industria: "",
        loja: "",
        uf: "",
        promotor: "",
        supervisor: "LUCAS",
        dias: { SEG: false, TER: false, QUA: false, QUI: false, SEX: false, SAB: false, DOM: false },
    });
    const [toast, setToast] = useState(null);
    const [buscaLojas, setBuscaLojas] = useState("");
    const [filtroUFLojas, setFiltroUFLojas] = useState("");

    const showToast = (msg, tipo = "ok") => {
        setToast({ msg, tipo });
        setTimeout(() => setToast(null), 3000);
    };

    const roteirosFiltrados = useMemo(
        () =>
            roteiros.filter((r) => {
                if (filtros.promotor && r.promotor !== filtros.promotor) return false;
                if (filtros.supervisor && r.supervisor !== filtros.supervisor) return false;
                if (filtros.uf && r.uf !== filtros.uf) return false;
                if (filtros.dia && !r.dias[filtros.dia]) return false;
                if (filtros.busca) {
                    const b = filtros.busca.toLowerCase();
                    return (
                        r.loja.toLowerCase().includes(b) ||
                        r.promotor.toLowerCase().includes(b) ||
                        r.industria.toLowerCase().includes(b)
                    );
                }
                return true;
            }),
        [roteiros, filtros]
    );

    const stats = useMemo(
        () => ({
            total: roteiros.length,
            promotores: new Set(roteiros.map((r) => r.promotor)).size,
            lojas: new Set(roteiros.map((r) => r.loja)).size,
            visitas: roteiros.reduce((a, r) => a + Object.values(r.dias).filter(Boolean).length, 0),
        }),
        [roteiros]
    );

    const lojasFiltradas = useMemo(
        () =>
            TODAS_LOJAS.filter((l) => {
                if (filtroUFLojas && l.uf !== filtroUFLojas) return false;
                if (buscaLojas) {
                    const b = buscaLojas.toLowerCase();
                    return l.loja.toLowerCase().includes(b) || l.rede.toLowerCase().includes(b);
                }
                return true;
            }),
        [buscaLojas, filtroUFLojas]
    );

    const ufsRoteiros = [...new Set(roteiros.map((r) => r.uf))].sort();
    const supervisores = [...new Set(roteiros.map((r) => r.supervisor))].sort();
    const ufsLojas = [...new Set(TODAS_LOJAS.map((l) => l.uf))].sort();

    const salvarVisita = () => {
        if (!novaVisita.industria || !novaVisita.loja || !novaVisita.promotor) {
            showToast("Preencha todos os campos obrigatórios", "erro");
            return;
        }
        setRoteiros((p) => [...p, { ...novaVisita, id: Date.now() }]);
        setNovaVisita({
            industria: "",
            loja: "",
            uf: "",
            promotor: "",
            supervisor: "LUCAS",
            dias: { SEG: false, TER: false, QUA: false, QUI: false, SEX: false, SAB: false, DOM: false },
        });
        setModalVisita(false);
        showToast("Visita adicionada!");
    };

    const excluir = (id) => {
        setRoteiros((p) => p.filter((r) => r.id !== id));
        showToast("Roteiro removido");
    };

    const salvarEdicao = () => {
        setRoteiros((p) => p.map((r) => (r.id === modalEditar.id ? modalEditar : r)));
        setModalEditar(null);
        showToast("Roteiro atualizado!");
    };

    const setF = (k, v) => setFiltros((f) => ({ ...f, [k]: v }));
    const limparFiltros = () => setFiltros({ promotor: "", supervisor: "", uf: "", dia: "", busca: "" });
    const temFiltro = Object.values(filtros).some(Boolean);

    const S = {
        card: { background: "#161e2e", border: "1px solid #1e2d45", borderRadius: 12 },
        select: { background: "#0f1623", border: "1px solid #1e2d45", borderRadius: 8, padding: "8px 12px", color: "#e8edf3", fontSize: 13 },
        label: { display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
    };

    return (
        <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", minHeight: "100vh", background: "#0f1623", color: "#e8edf3" }}>
            {toast && (
                <div
                    style={{
                        position: "fixed",
                        top: 20,
                        right: 20,
                        zIndex: 9999,
                        background: toast.tipo === "erro" ? "#dc2626" : "#16a34a",
                        color: "#fff",
                        padding: "12px 20px",
                        borderRadius: 8,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                        fontSize: 14,
                        fontWeight: 600,
                    }}
                >
                    {toast.msg}
                </div>
            )}

            <div style={{ background: "#161e2e", borderBottom: "1px solid #1e2d45", padding: "0 24px" }}>
                <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                borderRadius: 8,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 18,
                            }}
                        >
                            🗺️
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: "#f0f4f8" }}>MK9 — Roteiro Promotores</div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>DF · GO · MT · MS · TO · BA</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setModalVisita(true)}
                        style={{
                            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 16px",
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: "pointer",
                        }}
                    >
                        ＋ Nova Visita
                    </button>
                </div>
            </div>

            <div style={{ background: "#161e2e", borderBottom: "1px solid #1e2d45", padding: "0 24px" }}>
                <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", gap: 4 }}>
                    {['Roteiros', 'Promotores', 'Lojas'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            style={{
                                background: tab === t ? 'rgba(59,130,246,0.15)' : 'transparent',
                                color: tab === t ? '#60a5fa' : '#64748b',
                                border: 'none',
                                borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent',
                                padding: '14px 18px',
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ maxWidth: 1280, margin: '0 auto', padding: 24 }}>
                {tab === 'Roteiros' && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
                            {[
                                { label: 'Roteiros', valor: stats.total, icon: '📋', cor: '#3b82f6' },
                                { label: 'Promotores', valor: stats.promotores, icon: '👥', cor: '#8b5cf6' },
                                { label: 'Lojas', valor: stats.lojas, icon: '🏪', cor: '#06b6d4' },
                                { label: 'Visitas/Semana', valor: stats.visitas, icon: '📅', cor: '#10b981' },
                            ].map((c) => (
                                <div key={c.label} style={{ ...S.card, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div
                                        style={{
                                            width: 44,
                                            height: 44,
                                            background: `${c.cor}22`,
                                            borderRadius: 10,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 20,
                                        }}
                                    >
                                        {c.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 24, fontWeight: 700, color: c.cor }}>{c.valor}</div>
                                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{c.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ ...S.card, padding: 16, marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                            <input
                                placeholder="🔍 Buscar loja, promotor, indústria..."
                                value={filtros.busca}
                                onChange={(e) => setF('busca', e.target.value)}
                                style={{
                                    flex: 1,
                                    minWidth: 220,
                                    background: '#0f1623',
                                    border: '1px solid #1e2d45',
                                    borderRadius: 8,
                                    padding: '8px 12px',
                                    color: '#e8edf3',
                                    fontSize: 13,
                                    outline: 'none',
                                }}
                            />
                            <select value={filtros.supervisor} onChange={(e) => setF('supervisor', e.target.value)} style={S.select}>
                                <option value="">Todos Supervisores</option>
                                {supervisores.map((s) => (
                                    <option key={s}>{s}</option>
                                ))}
                            </select>
                            <select value={filtros.uf} onChange={(e) => setF('uf', e.target.value)} style={S.select}>
                                <option value="">Todas UFs</option>
                                {['BA', 'DF', 'GO', 'MS', 'MT', 'TO'].map((u) => (
                                    <option key={u}>{u}</option>
                                ))}
                            </select>
                            <select value={filtros.dia} onChange={(e) => setF('dia', e.target.value)} style={S.select}>
                                <option value="">Todos os Dias</option>
                                {DIAS.map((d) => (
                                    <option key={d} value={d}>
                                        {DIAS_LABELS[d]}
                                    </option>
                                ))}
                            </select>
                            {temFiltro && (
                                <button
                                    onClick={limparFiltros}
                                    style={{
                                        background: '#1e2d45',
                                        border: 'none',
                                        borderRadius: 8,
                                        padding: '8px 14px',
                                        color: '#94a3b8',
                                        fontSize: 12,
                                        cursor: 'pointer',
                                    }}
                                >
                                    ✕ Limpar
                                </button>
                            )}
                        </div>

                        <div style={{ ...S.card, overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                                    <thead>
                                        <tr style={{ background: '#1a2740' }}>
                                            {['INDÚSTRIA', 'PROMOTOR', 'LOJA', 'UF', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM', 'AÇÕES'].map((h) => (
                                                <th
                                                    key={h}
                                                    style={{
                                                        padding: '10px 12px',
                                                        color: '#64748b',
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                        letterSpacing: 0.5,
                                                        textAlign: h.length <= 3 ? 'center' : 'left',
                                                        borderBottom: '1px solid #1e2d45',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roteirosFiltrados.length === 0 && (
                                            <tr>
                                                <td colSpan={12} style={{ padding: 32, textAlign: 'center', color: '#475569' }}>
                                                    Nenhum roteiro encontrado.
                                                </td>
                                            </tr>
                                        )}
                                        {roteirosFiltrados.map((r, i) => (
                                            <tr key={r.id} style={{ background: i % 2 === 0 ? '#161e2e' : '#132030' }}>
                                                <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid #1a2333', whiteSpace: 'nowrap' }}>
                                                    {r.industria}
                                                </td>
                                                <td style={{ padding: '10px 12px', fontSize: 12, color: '#cbd5e1', borderBottom: '1px solid #1a2333', whiteSpace: 'nowrap' }}>
                                                    {nome2(r.promotor)}
                                                </td>
                                                <td style={{ padding: '10px 12px', fontSize: 12, color: '#e2e8f0', borderBottom: '1px solid #1a2333' }}>
                                                    {r.loja}
                                                    <span style={{ marginLeft: 8, fontSize: 10, background: '#1e3a5f', color: '#60a5fa', padding: '2px 6px', borderRadius: 4 }}>
                                                        {r.supervisor}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '10px 12px', borderBottom: '1px solid #1a2333', textAlign: 'center' }}>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: UF_CORES[r.uf] || '#94a3b8' }}>{r.uf}</span>
                                                </td>
                                                {DIAS.map((d) => (
                                                    <td key={d} style={{ padding: '10px 4px', borderBottom: '1px solid #1a2333', textAlign: 'center', fontSize: 15 }}>
                                                        {r.dias[d] ? <span style={{ color: '#22c55e' }}>✓</span> : <span style={{ color: '#1e2d45' }}>·</span>}
                                                    </td>
                                                ))}
                                                <td style={{ padding: '10px 8px', borderBottom: '1px solid #1a2333' }}>
                                                    <div style={{ display: 'flex', gap: 4 }}>
                                                        <button
                                                            onClick={() => setModalEditar({ ...r, dias: { ...r.dias } })}
                                                            style={{
                                                                background: '#1e3a5f',
                                                                border: 'none',
                                                                borderRadius: 6,
                                                                padding: '4px 8px',
                                                                color: '#60a5fa',
                                                                fontSize: 12,
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={() => excluir(r.id)}
                                                            style={{
                                                                background: '#3f1515',
                                                                border: 'none',
                                                                borderRadius: 6,
                                                                padding: '4px 8px',
                                                                color: '#f87171',
                                                                fontSize: 12,
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ padding: '10px 16px', background: '#1a2740', color: '#475569', fontSize: 12, borderTop: '1px solid #1e2d45' }}>
                                {roteirosFiltrados.length} de {roteiros.length} roteiros
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'Promotores' && (
                    <div>
                        <div style={{ marginBottom: 16, color: '#64748b', fontSize: 13 }}>{PROMOTORES_DADOS.length} promotores cadastrados</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px,1fr))', gap: 12 }}>
                            {PROMOTORES_DADOS.map((p) => {
                                const qtd = roteiros.filter((r) => r.promotor.trim().toUpperCase() === p.nome.trim().toUpperCase()).length;
                                const uf = roteiros.find((r) => r.promotor.trim().toUpperCase() === p.nome.trim().toUpperCase())?.uf;
                                return (
                                    <div key={p.id ?? p.nome} style={{ ...S.card, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 16,
                                                fontWeight: 700,
                                                color: '#fff',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {p.nome.charAt(0)}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: 13, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {p.nome}
                                            </div>
                                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                                                {p.cidade || <span style={{ fontStyle: 'italic' }}>Sem cidade</span>}
                                                {p.id && <span style={{ marginLeft: 6, color: '#334155' }}>· #{p.id}</span>}
                                                {uf && <span style={{ marginLeft: 6, fontWeight: 700, color: UF_CORES[uf] || '#94a3b8' }}>{uf}</span>}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'center', flexShrink: 0 }}>
                                            <div style={{ fontSize: 20, fontWeight: 700, color: qtd > 0 ? '#22c55e' : '#334155' }}>{qtd}</div>
                                            <div style={{ fontSize: 10, color: '#475569' }}>visitas</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {tab === 'Lojas' && (
                    <div>
                        <div style={{ ...S.card, padding: 14, marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                            <input
                                placeholder="🔍 Buscar loja ou rede..."
                                value={buscaLojas}
                                onChange={(e) => setBuscaLojas(e.target.value)}
                                style={{
                                    flex: 1,
                                    minWidth: 200,
                                    background: '#0f1623',
                                    border: '1px solid #1e2d45',
                                    borderRadius: 8,
                                    padding: '8px 12px',
                                    color: '#e8edf3',
                                    fontSize: 13,
                                    outline: 'none',
                                }}
                            />
                            <select value={filtroUFLojas} onChange={(e) => setFiltroUFLojas(e.target.value)} style={S.select}>
                                <option value="">Todos os estados</option>
                                {ufsLojas.map((u) => (
                                    <option key={u} value={u}>
                                        {u} ({TODAS_LOJAS.filter((l) => l.uf === u).length})
                                    </option>
                                ))}
                            </select>
                            {(buscaLojas || filtroUFLojas) && (
                                <button
                                    onClick={() => {
                                        setBuscaLojas('');
                                        setFiltroUFLojas('');
                                    }}
                                    style={{
                                        background: '#1e2d45',
                                        border: 'none',
                                        borderRadius: 8,
                                        padding: '8px 14px',
                                        color: '#94a3b8',
                                        fontSize: 12,
                                        cursor: 'pointer',
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                            <span style={{ color: '#475569', fontSize: 12 }}>{lojasFiltradas.length} lojas</span>
                        </div>

                        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                            {ufsLojas.map((u) => (
                                <button
                                    key={u}
                                    onClick={() => setFiltroUFLojas(filtroUFLojas === u ? '' : u)}
                                    style={{
                                        background: filtroUFLojas === u ? `${UF_CORES[u]}33` : '#161e2e',
                                        border: `1px solid ${filtroUFLojas === u ? UF_CORES[u] : '#1e2d45'}`,
                                        borderRadius: 20,
                                        padding: '4px 14px',
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: UF_CORES[u] || '#94a3b8',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {u} <span style={{ opacity: 0.7 }}>({TODAS_LOJAS.filter((l) => l.uf === u).length})</span>
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px,1fr))', gap: 8 }}>
                            {lojasFiltradas.map((l, i) => (
                                <div key={i} style={{ ...S.card, padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: UF_CORES[l.uf] || '#64748b', flexShrink: 0 }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.loja}</div>
                                        <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{l.rede}</div>
                                    </div>
                                    <span
                                        style={{
                                            background: `${UF_CORES[l.uf] || '#1e2d45'}22`,
                                            color: UF_CORES[l.uf] || '#64748b',
                                            fontSize: 11,
                                            fontWeight: 700,
                                            padding: '2px 8px',
                                            borderRadius: 4,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {l.uf}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {modalVisita && (
                <Modal titulo="Nova Visita" onClose={() => setModalVisita(false)}>
                    <FormVisita visita={novaVisita} setVisita={setNovaVisita} lojas={TODAS_LOJAS} promotores={PROMOTORES_DADOS} industrias={INDUSTRIAS} />
                    <BotoesModal onCancel={() => setModalVisita(false)} onSave={salvarVisita} labelSave="Salvar" />
                </Modal>
            )}

            {modalEditar && (
                <Modal titulo="Editar Roteiro" onClose={() => setModalEditar(null)}>
                    <FormVisita visita={modalEditar} setVisita={setModalEditar} lojas={TODAS_LOJAS} promotores={PROMOTORES_DADOS} industrias={INDUSTRIAS} />
                    <BotoesModal onCancel={() => setModalEditar(null)} onSave={salvarEdicao} labelSave="Salvar Alterações" />
                </Modal>
            )}

            <style>
                {`input::placeholder{color:#334155} select option{background:#161e2e} ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:#0f1623} ::-webkit-scrollbar-thumb{background:#1e2d45;border-radius:3px}`}
            </style>
        </div>
    );
}
