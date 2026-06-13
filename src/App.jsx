import { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import Modal from "./components/Modal.jsx";
import BotoesModal from "./components/BotoesModal.jsx";
import FormVisita from "./components/FormVisita.jsx";
import FormPessoa from "./components/FormPessoa.jsx";
import FormLoja from "./components/FormLoja.jsx";
import { supabase } from "./supabaseClient.js";
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
    const [modalPessoa, setModalPessoa] = useState(false);
    const [modalEditarPessoa, setModalEditarPessoa] = useState(null);
    const [modoManual, setModoManual] = useState(false);
    const [manualInput, setManualInput] = useState("");
    const [pessoaForm, setPessoaForm] = useState({ nome: "", loja: "", role: "Promotor" });
    const [pessoas, setPessoas] = useState(
        PROMOTORES_DADOS.map((p) => ({ ...p, role: "Promotor", loja: p.loja || "", cidade: p.cidade || "" }))
    );
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
    const [storeFilter, setStoreFilter] = useState("");
    const [lojasState, setLojasState] = useState(TODAS_LOJAS);
    const [modalLoja, setModalLoja] = useState(false);
    const [lojaForm, setLojaForm] = useState({ rede: "", loja: "", uf: "" });
    const [loadingSupabase, setLoadingSupabase] = useState(false);
    const [supabaseError, setSupabaseError] = useState(null);
    const [modalWhatsApp, setModalWhatsApp] = useState(false);

    const showToast = (msg, tipo = "ok") => {
        setToast({ msg, tipo });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const carregarDados = async () => {
            setLoadingSupabase(true);
            setSupabaseError(null);
            try {
                const { data: lojas, error: lojasError } = await supabase.from("lojas").select("*").order("id", { ascending: true });
                if (lojasError) throw lojasError;
                if (lojas && lojas.length > 0) setLojasState(lojas);

                const { data: pessoas, error: pessoasError } = await supabase.from("pessoas").select("*").order("nome", { ascending: true });
                if (pessoasError) throw pessoasError;
                if (pessoas && pessoas.length > 0) setPessoas(pessoas);

                const { data: roteirosData, error: roteirosError } = await supabase.from("roteiros").select("*").order("id", { ascending: true });
                if (roteirosError) throw roteirosError;
                if (roteirosData && roteirosData.length > 0) setRoteiros(roteirosData);
            } catch (error) {
                setSupabaseError(error.message || "Falha ao conectar ao Supabase");
                showToast("Não foi possível carregar dados do Supabase. Dados locais serão usados.", "erro");
            } finally {
                setLoadingSupabase(false);
            }
        };

        carregarDados();
    }, []);

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
            lojasState.filter((l) => {
                if (filtroUFLojas && l.uf !== filtroUFLojas) return false;
                if (buscaLojas) {
                    const b = buscaLojas.toLowerCase();
                    return l.loja.toLowerCase().includes(b) || l.rede.toLowerCase().includes(b);
                }
                return true;
            }),
        [buscaLojas, filtroUFLojas, lojasState]
    );

    const lojasOrdenadas = useMemo(
        () => [...new Set(lojasState.map((l) => l.loja))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
        [lojasState]
    );

    const pessoasFiltradas = useMemo(
        () => pessoas.filter((p) => !storeFilter || p.loja === storeFilter),
        [pessoas, storeFilter]
    );

    const ufsRoteiros = [...new Set(roteiros.map((r) => r.uf))].sort();
    const pessoasPorLoja = useMemo(
        () =>
            pessoas.reduce((acc, pessoa) => {
                if (!pessoa.loja) return acc;
                acc[pessoa.loja] = (acc[pessoa.loja] || 0) + 1;
                return acc;
            }, {}),
        [pessoas]
    );
    const supervisores = [...new Set(roteiros.map((r) => r.supervisor))].sort();
    const ufsLojas = [...new Set(lojasState.map((l) => l.uf))].sort();
    const promotoresParaSelect = pessoas.filter((p) => p.role === "Promotor");
    const supervisoresParaSelect = pessoas.filter((p) => p.role === "Supervisor");

    const salvarVisita = async () => {
        if (!novaVisita.industria || !novaVisita.loja || !novaVisita.promotor) {
            showToast("Preencha todos os campos obrigatórios", "erro");
            return;
        }
        const dadosVisita = { ...novaVisita };
        const { data, error } = await supabase.from("roteiros").insert([dadosVisita]).select().single();
        if (error) {
            console.warn(error);
            setRoteiros((p) => [...p, { ...dadosVisita, id: Date.now() }]);
            showToast("Visita adicionada localmente (Supabase indisponível)");
        } else {
            setRoteiros((p) => [...p, data]);
            showToast("Visita adicionada!");
        }
        setNovaVisita({
            industria: "",
            loja: "",
            uf: "",
            promotor: "",
            supervisor: "LUCAS",
            dias: { SEG: false, TER: false, QUA: false, QUI: false, SEX: false, SAB: false, DOM: false },
        });
        setModalVisita(false);
    };

    const salvarPessoa = async () => {
        if (!pessoaForm.nome || !pessoaForm.role) {
            showToast("Preencha nome e função", "erro");
            return;
        }
        const novaPessoa = { ...pessoaForm, cidade: pessoaForm.cidade || "" };
        const { data, error } = await supabase.from("pessoas").insert([novaPessoa]).select().single();
        if (error) {
            console.warn(error);
            setPessoas((p) => [...p, { ...novaPessoa, id: Date.now() }]);
            showToast("Pessoa adicionada localmente (Supabase indisponível)");
        } else {
            setPessoas((p) => [...p, data]);
            showToast("Pessoa adicionada!");
        }
        setPessoaForm({ nome: "", loja: "", role: "Promotor" });
        setModalPessoa(false);
    };

    const salvarEdicaoPessoa = async () => {
        if (!modalEditarPessoa) return;
        const { data, error } = await supabase
            .from("pessoas")
            .update({ ...modalEditarPessoa })
            .eq("id", modalEditarPessoa.id)
            .select()
            .single();
        if (error) {
            console.warn(error);
            setPessoas((p) => p.map((item) => (item.id === modalEditarPessoa.id ? modalEditarPessoa : item)));
            showToast("Alteração salva localmente (Supabase indisponível)");
        } else {
            setPessoas((p) => p.map((item) => (item.id === modalEditarPessoa.id ? data : item)));
            showToast("Pessoa atualizada!");
        }
        setModalEditarPessoa(null);
    };

    const processarManual = async () => {
        if (!manualInput.trim()) {
            showToast("Digite ao menos uma linha para processar", "erro");
            return;
        }
        const linhas = manualInput
            .split("\n")
            .map((linha) => linha.trim())
            .filter(Boolean);
        if (!linhas.length) {
            showToast("Nenhuma linha válida encontrada", "erro");
            return;
        }
        const novas = linhas.map((linha, index) => {
            const partes = linha.split("|").map((texto) => texto.trim());
            const nome = partes[0] || "";
            const role = partes[1] ? partes[1].charAt(0).toUpperCase() + partes[1].slice(1).toLowerCase() : "Promotor";
            return {
                id: Date.now() + index,
                nome,
                role: role === "Supervisor" ? "Supervisor" : "Promotor",
                loja: pessoaForm.loja || "",
                cidade: "",
            };
        });
        const { error } = await supabase.from("pessoas").insert(novas);
        if (error) {
            console.warn(error);
            setPessoas((p) => [...p, ...novas]);
            showToast(`${novas.length} pessoas adicionadas localmente (Supabase indisponível)`);
        } else {
            setPessoas((p) => [...p, ...novas]);
            showToast(`${novas.length} pessoas adicionadas!`);
        }
        setManualInput("");
        setModoManual(false);
        setPessoaForm({ nome: "", loja: "", role: "Promotor" });
        setModalPessoa(false);
    };

    const excluirPessoa = async (id) => {
        const { error } = await supabase.from("pessoas").delete().eq("id", id);
        if (error) {
            console.warn(error);
            setPessoas((p) => p.filter((item) => item.id !== id));
            showToast("Pessoa removida localmente (Supabase indisponível)");
        } else {
            setPessoas((p) => p.filter((item) => item.id !== id));
            showToast("Pessoa removida");
        }
    };

    const salvarLoja = async () => {
        if (!lojaForm.rede || !lojaForm.loja || !lojaForm.uf) {
            showToast("Preencha rede, loja e UF", "erro");
            return;
        }
        const novaLoja = { ...lojaForm };
        const { data, error } = await supabase.from("lojas").insert([novaLoja]).select().single();
        if (error) {
            console.warn(error);
            setLojasState((p) => [...p, { ...novaLoja, id: Date.now() }]);
            showToast("Loja adicionada localmente (Supabase indisponível)");
        } else {
            setLojasState((p) => [...p, data]);
            showToast("Loja adicionada!");
        }
        setLojaForm({ rede: "", loja: "", uf: "" });
        setModalLoja(false);
    };

    const excluir = async (id) => {
        const { error } = await supabase.from("roteiros").delete().eq("id", id);
        if (error) {
            console.warn(error);
            setRoteiros((p) => p.filter((r) => r.id !== id));
            showToast("Roteiro removido localmente (Supabase indisponível)");
        } else {
            setRoteiros((p) => p.filter((r) => r.id !== id));
            showToast("Roteiro removido");
        }
    };

    const salvarEdicao = async () => {
        if (!modalEditar) return;
        const { data, error } = await supabase
            .from("roteiros")
            .update({ ...modalEditar })
            .eq("id", modalEditar.id)
            .select()
            .single();
        if (error) {
            console.warn(error);
            setRoteiros((p) => p.map((r) => (r.id === modalEditar.id ? modalEditar : r)));
            showToast("Roteiro atualizado localmente (Supabase indisponível)");
        } else {
            setRoteiros((p) => p.map((r) => (r.id === modalEditar.id ? data : r)));
            showToast("Roteiro atualizado!");
        }
        setModalEditar(null);
    };

    const setF = (k, v) => setFiltros((f) => ({ ...f, [k]: v }));
    const limparFiltros = () => setFiltros({ promotor: "", supervisor: "", uf: "", dia: "", busca: "" });
    const temFiltro = Object.values(filtros).some(Boolean);

    const exportarExcel = () => {
        const dados = roteirosFiltrados.map((r) => ({
            "Indústria": r.industria,
            "Promotor": r.promotor,
            "Loja": r.loja,
            "UF": r.uf,
            "Supervisor": r.supervisor,
            "SEG": r.dias.SEG ? "✓" : "",
            "TER": r.dias.TER ? "✓" : "",
            "QUA": r.dias.QUA ? "✓" : "",
            "QUI": r.dias.QUI ? "✓" : "",
            "SEX": r.dias.SEX ? "✓" : "",
            "SAB": r.dias.SAB ? "✓" : "",
            "DOM": r.dias.DOM ? "✓" : "",
        }));
        const ws = XLSX.utils.json_to_sheet(dados);
        ws["!cols"] = [
            { wch: 20 }, { wch: 35 }, { wch: 40 }, { wch: 5 }, { wch: 15 },
            { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 5 },
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Roteiros");
        XLSX.writeFile(wb, `roteiro-promotores-${new Date().toISOString().slice(0, 10)}.xlsx`);
        showToast("Arquivo Excel exportado com sucesso!");
    };

    const compartilharWhatsApp = (pessoa) => {
        const promotorNome = pessoa.nome;
        const telefone = (pessoa.telefone || '').replace(/\D/g, '');
        const roteirosDoPromotor = roteiros.filter(
            (r) => r.promotor.trim().toUpperCase() === promotorNome.trim().toUpperCase()
        );
        if (roteirosDoPromotor.length === 0) {
            showToast("Nenhum roteiro encontrado para este promotor", "erro");
            return;
        }

        const diasSemana = { SEG: "Segunda", TER: "Terça", QUA: "Quarta", QUI: "Quinta", SEX: "Sexta", SAB: "Sábado", DOM: "Domingo" };
        let msg = `📋 *ROTEIRO SEMANAL*\n`;
        msg += `👤 *${promotorNome}*\n`;
        msg += `📅 Gerado em ${new Date().toLocaleDateString("pt-BR")}\n`;
        msg += `━━━━━━━━━━━━━━━━━━\n\n`;

        DIAS.forEach((dia) => {
            const doDia = roteirosDoPromotor.filter((r) => r.dias[dia]);
            if (doDia.length > 0) {
                msg += `📌 *${diasSemana[dia]}*\n`;
                doDia.forEach((r) => {
                    msg += `  🏪 ${r.loja} (${r.uf})\n`;
                    msg += `  🏭 ${r.industria}\n\n`;
                });
            }
        });

        msg += `━━━━━━━━━━━━━━━━━━\n`;
        msg += `✅ Total: ${roteirosDoPromotor.length} loja(s)`;

        const encoded = encodeURIComponent(msg);
        if (telefone) {
            window.open(`https://wa.me/${telefone}?text=${encoded}`, "_blank");
            showToast(`Enviando roteiro direto para ${promotorNome}!`);
        } else {
            window.open(`https://wa.me/?text=${encoded}`, "_blank");
            showToast("Telefone não cadastrado — escolha o contato manualmente", "erro");
        }
        setModalWhatsApp(false);
    };

    const S = {
        card: { background: "#161e2e", border: "1px solid #1e2d45", borderRadius: 12 },
        select: { background: "#0f1623", border: "1px solid #1e2d45", borderRadius: 8, padding: "8px 12px", color: "#e8edf3", fontSize: 13 },
        label: { display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
    };

    return (
        <div className="app-root">
            {toast && (
                <div className={`toast ${toast.tipo === "erro" ? "toast-error" : "toast-success"}`}>
                    {toast.msg}
                </div>
            )}

            <header className="header-bar">
                <div className="container header">
                    <div className="header-brand">
                        <div className="header-logo">🗺️</div>
                        <div>
                            <div className="header-title">MK9 — Roteiro Promotores</div>
                            <div className="header-subtitle">DF · GO · MT · MS · TO · BA</div>
                        </div>
                    </div>
                    <div className="header-actions actions-row">
                        <button
                            onClick={exportarExcel}
                            className="btn btn-success"
                        >
                            📥 Exportar Excel
                        </button>
                        <button
                            onClick={() => setModalWhatsApp(true)}
                            className="btn btn-whatsapp"
                        >
                            📲 WhatsApp
                        </button>
                        <button
                            onClick={() => setModalVisita(true)}
                            className="btn btn-primary"
                        >
                            ＋ Nova Visita
                        </button>
                    </div>
                </div>
            </header>

            <div className="tabs-bar">
                <div className="container">
                    <nav className="tabs" role="tablist">
                        {['Roteiros', 'Pessoas', 'Lojas'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`tab-btn ${tab === t ? "tab-active" : ""}`}
                                role="tab"
                                aria-selected={tab === t}
                            >
                                {t}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <main className="main-content">
                <div className="container">
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

                {tab === 'Pessoas' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                            <div style={{ color: '#64748b', fontSize: 13 }}>{pessoasFiltradas.length} pessoas cadastradas{storeFilter ? ` em ${storeFilter}` : ''}</div>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                                <select
                                    value={storeFilter}
                                    onChange={(e) => setStoreFilter(e.target.value)}
                                    style={S.select}
                                >
                                    <option value="">Todas as lojas</option>
                                    {lojasOrdenadas.map((loja) => (
                                        <option key={loja} value={loja}>
                                            {loja}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => {
                                        setPessoaForm({ nome: '', loja: storeFilter || '', role: 'Promotor', cidade: '' });
                                        setModoManual(false);
                                        setManualInput('');
                                        setModalPessoa(true);
                                    }}
                                    style={{
                                        background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 8,
                                        padding: '8px 16px',
                                        fontWeight: 600,
                                        fontSize: 13,
                                        cursor: 'pointer',
                                    }}
                                >
                                    ＋ Nova Pessoa
                                </button>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px,1fr))', gap: 12 }}>
                            {pessoasFiltradas.map((p) => {
                                const qtd = roteiros.filter((r) => r.promotor.trim().toUpperCase() === p.nome.trim().toUpperCase()).length;
                                return (
                                    <div key={p.id ?? p.nome} className="person-card" style={{ ...S.card, padding: 16, display: 'flex', alignItems: 'flex-start', gap: 14, flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
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
                                                    {p.role} · {p.loja || 'Loja não informada'}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: 12, flexWrap: 'wrap' }}>
                                            <div style={{ color: '#94a3b8', fontSize: 12 }}>
                                                {p.cidade || <span style={{ fontStyle: 'italic' }}>Sem cidade</span>}
                                            </div>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button
                                                    onClick={() => setModalEditarPessoa({ ...p })}
                                                    style={{
                                                        background: '#1e3a5f',
                                                        border: 'none',
                                                        borderRadius: 6,
                                                        padding: '6px 10px',
                                                        color: '#60a5fa',
                                                        fontSize: 12,
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    ✏️ Editar
                                                </button>
                                                <button
                                                    onClick={() => excluirPessoa(p.id)}
                                                    style={{
                                                        background: '#3f1515',
                                                        border: 'none',
                                                        borderRadius: 6,
                                                        padding: '6px 10px',
                                                        color: '#f87171',
                                                        fontSize: 12,
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    🗑️ Remover
                                                </button>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: 4 }}>
                                            <span style={{ fontSize: 12, color: '#475569' }}>Visitas associadas: {qtd}</span>
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
                                        {u} ({lojasState.filter((l) => l.uf === u).length})
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
                            <button
                                onClick={() => {
                                    setLojaForm({ rede: "", loja: "", uf: "" });
                                    setModalLoja(true);
                                }}
                                style={{
                                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 8,
                                    padding: '8px 16px',
                                    fontWeight: 600,
                                    fontSize: 13,
                                    cursor: 'pointer',
                                }}
                            >
                                ＋ Nova Loja
                            </button>
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
                                    {u} <span style={{ opacity: 0.7 }}>({lojasState.filter((l) => l.uf === u).length})</span>
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px,1fr))', gap: 8 }}>
                            {lojasFiltradas.map((l, i) => {
                                const count = pessoasPorLoja[l.loja] || 0;
                                return (
                                    <div key={i} className="store-card" style={{ ...S.card, padding: '11px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                            <span style={{ color: '#94a3b8', fontSize: 12 }}>{count} pessoa{count === 1 ? '' : 's'} associada{count === 1 ? '' : 's'}</span>
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                <button
                                                    onClick={() => {
                                                        setStoreFilter(l.loja);
                                                        setTab('Pessoas');
                                                    }}
                                                    style={{
                                                        background: '#1e3a5f',
                                                        border: 'none',
                                                        borderRadius: 6,
                                                        padding: '6px 10px',
                                                        color: '#60a5fa',
                                                        fontSize: 12,
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    Ver pessoas
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                </div>
            </main>

            {modalVisita && (
                <Modal titulo="Nova Visita" onClose={() => setModalVisita(false)}>
                    <FormVisita visita={novaVisita} setVisita={setNovaVisita} lojas={lojasState} promotores={promotoresParaSelect} industrias={INDUSTRIAS} supervisores={supervisoresParaSelect} />
                    <BotoesModal onCancel={() => setModalVisita(false)} onSave={salvarVisita} labelSave="Salvar" />
                </Modal>
            )}

            {modalEditar && (
                <Modal titulo="Editar Roteiro" onClose={() => setModalEditar(null)}>
                    <FormVisita visita={modalEditar} setVisita={setModalEditar} lojas={lojasState} promotores={promotoresParaSelect} industrias={INDUSTRIAS} supervisores={supervisoresParaSelect} />
                    <BotoesModal onCancel={() => setModalEditar(null)} onSave={salvarEdicao} labelSave="Salvar Alterações" />
                </Modal>
            )}

            {modalPessoa && (
                <Modal titulo="Nova Pessoa" onClose={() => setModalPessoa(false)}>
                    <FormPessoa
                        pessoa={pessoaForm}
                        setPessoa={setPessoaForm}
                        lojas={lojasState}
                        modoManual={modoManual}
                        setModoManual={setModoManual}
                        manualInput={manualInput}
                        setManualInput={setManualInput}
                        onSave={salvarPessoa}
                        onProcessManual={processarManual}
                        onCancel={() => setModalPessoa(false)}
                    />
                </Modal>
            )}

            {modalEditarPessoa && (
                <Modal titulo="Editar Pessoa" onClose={() => setModalEditarPessoa(null)}>
                    <FormPessoa
                        pessoa={modalEditarPessoa}
                        setPessoa={setModalEditarPessoa}
                        lojas={TODAS_LOJAS}
                        modoManual={false}
                        setModoManual={setModoManual}
                        manualInput={manualInput}
                        setManualInput={setManualInput}
                        onSave={salvarEdicaoPessoa}
                        onProcessManual={() => { }}
                        onCancel={() => setModalEditarPessoa(null)}
                    />
                </Modal>
            )}

            {modalLoja && (
                <Modal titulo="Nova Loja" onClose={() => setModalLoja(false)}>
                    <FormLoja
                        loja={lojaForm}
                        setLoja={setLojaForm}
                        onSave={salvarLoja}
                        onCancel={() => setModalLoja(false)}
                    />
                </Modal>
            )}

            {modalWhatsApp && (
                <Modal titulo="📲 Enviar Roteiro via WhatsApp" onClose={() => setModalWhatsApp(false)}>
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>
                            Selecione o promotor para enviar o roteiro:
                        </div>
                        <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {promotoresParaSelect.map((p) => {
                                const qtd = roteiros.filter((r) => r.promotor.trim().toUpperCase() === p.nome.trim().toUpperCase()).length;
                                return (
                                    <div
                                        key={p.id ?? p.nome}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            background: '#0f1623',
                                            border: '1px solid #1e2d45',
                                            borderRadius: 8,
                                            padding: '10px 14px',
                                        }}
                                    >
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {p.nome}
                                            </div>
                                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                                                {qtd} roteiro{qtd !== 1 ? 's' : ''} · {p.telefone ? `📱 ${p.telefone}` : '⚠️ sem telefone'}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => compartilharWhatsApp(p)}
                                            disabled={qtd === 0}
                                            style={{
                                                background: qtd > 0 ? 'linear-gradient(135deg, #25d366, #128c7e)' : '#1e2d45',
                                                color: qtd > 0 ? '#fff' : '#475569',
                                                border: 'none',
                                                borderRadius: 6,
                                                padding: '6px 14px',
                                                fontSize: 12,
                                                fontWeight: 600,
                                                cursor: qtd > 0 ? 'pointer' : 'not-allowed',
                                                flexShrink: 0,
                                                marginLeft: 12,
                                            }}
                                        >
                                            {p.telefone ? '📲 Enviar direto' : '📋 Compartilhar'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Modal>
            )}

            <style>
                {`input::placeholder{color:#334155} select option{background:#161e2e} ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:#0f1623} ::-webkit-scrollbar-thumb{background:#1e2d45;border-radius:3px}`}
            </style>
        </div>
    );
}
