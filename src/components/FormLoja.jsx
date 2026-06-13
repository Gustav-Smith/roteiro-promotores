export default function FormLoja({ loja, setLoja, onSave, onCancel }) {
    const setField = (key, value) => setLoja((prev) => ({ ...prev, [key]: value }));

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Rede
                </label>
                <input
                    value={loja.rede}
                    onChange={(e) => setField('rede', e.target.value)}
                    placeholder="Digite a rede da loja"
                    style={{ width: '100%', background: '#0f1623', border: '1px solid #1e2d45', borderRadius: 8, padding: '10px 12px', color: '#e8edf3', fontSize: 13, outline: 'none' }}
                />
            </div>
            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Loja
                </label>
                <input
                    value={loja.loja}
                    onChange={(e) => setField('loja', e.target.value)}
                    placeholder="Nome completo da loja"
                    style={{ width: '100%', background: '#0f1623', border: '1px solid #1e2d45', borderRadius: 8, padding: '10px 12px', color: '#e8edf3', fontSize: 13, outline: 'none' }}
                />
            </div>
            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    UF
                </label>
                <input
                    value={loja.uf}
                    onChange={(e) => setField('uf', e.target.value.toUpperCase())}
                    placeholder="Ex: DF"
                    maxLength={2}
                    style={{ width: '100%', background: '#0f1623', border: '1px solid #1e2d45', borderRadius: 8, padding: '10px 12px', color: '#e8edf3', fontSize: 13, outline: 'none', textTransform: 'uppercase' }}
                />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
                <button
                    onClick={onCancel}
                    style={{ flex: 1, background: '#1e2d45', color: '#94a3b8', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 600, cursor: 'pointer' }}
                >
                    Cancelar
                </button>
                <button
                    onClick={onSave}
                    style={{ flex: 2, background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 700, cursor: 'pointer' }}
                >
                    Salvar loja
                </button>
            </div>
        </div>
    );
}
