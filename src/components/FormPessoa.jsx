export default function FormPessoa({ pessoa, setPessoa, lojas, modoManual, setModoManual, manualInput, setManualInput, onSave, onProcessManual, onCancel }) {
    const lojaSelecionada = lojas.find((l) => l.loja === pessoa.loja);

    const setField = (key, value) => setPessoa((prev) => ({ ...prev, [key]: value }));

    return (
        <div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
                <button
                    type="button"
                    onClick={() => setModoManual(false)}
                    style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid #1e2d45',
                        background: modoManual ? 'transparent' : '#1d4ed8',
                        color: modoManual ? '#94a3b8' : '#fff',
                        cursor: 'pointer',
                        fontWeight: 700,
                    }}
                >
                    Formulário rápido
                </button>
                <button
                    type="button"
                    onClick={() => setModoManual(true)}
                    style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid #1e2d45',
                        background: modoManual ? '#1d4ed8' : 'transparent',
                        color: modoManual ? '#fff' : '#94a3b8',
                        cursor: 'pointer',
                        fontWeight: 700,
                    }}
                >
                    Preenchimento manual
                </button>
            </div>

            {!modoManual ? (
                <>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Nome da pessoa
                        </label>
                        <input
                            value={pessoa.nome}
                            onChange={(e) => setField('nome', e.target.value)}
                            placeholder="Digite o nome completo"
                            style={{ width: '100%', background: '#0f1623', border: '1px solid #1e2d45', borderRadius: 8, padding: '10px 12px', color: '#e8edf3', fontSize: 13, outline: 'none' }}
                        />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Função
                        </label>
                        <select
                            value={pessoa.role}
                            onChange={(e) => setField('role', e.target.value)}
                            style={{ width: '100%', background: '#0f1623', border: '1px solid #1e2d45', borderRadius: 8, padding: '10px 12px', color: '#e8edf3', fontSize: 13, outline: 'none' }}
                        >
                            <option value="Promotor">Promotor</option>
                            <option value="Supervisor">Supervisor</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Telefone (WhatsApp)
                        </label>
                        <input
                            value={pessoa.telefone || ''}
                            onChange={(e) => setField('telefone', e.target.value)}
                            placeholder="Ex: 5561992910841"
                            style={{ width: '100%', background: '#0f1623', border: '1px solid #1e2d45', borderRadius: 8, padding: '10px 12px', color: '#e8edf3', fontSize: 13, outline: 'none' }}
                        />
                        <div style={{ marginTop: 4, color: '#475569', fontSize: 11 }}>
                            Formato: código do país + DDD + número (sem espaços ou traços)
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Conteúdo manual
                        </label>
                        <textarea
                            value={manualInput}
                            onChange={(e) => setManualInput(e.target.value)}
                            placeholder="Digite cada linha como: Fulano Silva | Promotor\nCicrana Souza | Supervisor"
                            rows={8}
                            style={{ width: '100%', background: '#0f1623', border: '1px solid #1e2d45', borderRadius: 8, padding: '10px 12px', color: '#e8edf3', fontSize: 13, outline: 'none', resize: 'vertical' }}
                        />
                        <div style={{ marginTop: 8, color: '#94a3b8', fontSize: 12 }}>
                            A loja selecionada será aplicada a todas as pessoas inseridas manualmente.
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onProcessManual}
                        style={{ width: '100%', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 700, cursor: 'pointer' }}
                    >
                        Processar lista manual
                    </button>
                </>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
                <button
                    onClick={onCancel}
                    style={{ flex: 1, background: '#1e2d45', color: '#94a3b8', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 600, cursor: 'pointer' }}
                >
                    Cancelar
                </button>
                {!modoManual ? (
                    <button
                        onClick={onSave}
                        style={{ flex: 2, background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 700, cursor: 'pointer' }}
                    >
                        Salvar pessoa
                    </button>
                ) : null}
            </div>
            <div style={{ marginTop: 16, color: '#94a3b8', fontSize: 12 }}>
                As pessoas podem ser cadastradas sem loja. Se você estiver usando o botão de loja, a associação será gravada internamente.
            </div>
        </div>
    );
}
