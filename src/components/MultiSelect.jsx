import { useState, useEffect, useRef } from "react";

export default function MultiSelect({
    options = [],
    selectedValues = [],
    onChange,
    placeholder = "Selecionar...",
    searchPlaceholder = "Buscar...",
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef(null);

    // Fechar ao clicar fora do componente
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Limpar busca quando abre/fecha
    useEffect(() => {
        if (!isOpen) {
            setSearch("");
        }
    }, [isOpen]);

    const toggleOption = (option) => {
        const isSelected = selectedValues.includes(option);
        let newSelection;
        if (isSelected) {
            newSelection = selectedValues.filter((v) => v !== option);
        } else {
            newSelection = [...selectedValues, option];
        }
        onChange(newSelection);
    };

    const handleSelectAll = () => {
        const filtered = options.filter((opt) =>
            opt.toLowerCase().includes(search.toLowerCase())
        );
        // Une os filtrados com os já selecionados
        const newSelection = [...new Set([...selectedValues, ...filtered])];
        onChange(newSelection);
    };

    const handleClearAll = () => {
        const filtered = options.filter((opt) =>
            opt.toLowerCase().includes(search.toLowerCase())
        );
        // Remove os filtrados dos selecionados
        const newSelection = selectedValues.filter((val) => !filtered.includes(val));
        onChange(newSelection);
    };

    const filteredOptions = options.filter((opt) =>
        opt.toLowerCase().includes(search.toLowerCase())
    );

    // Texto de exibição do cabeçalho do select
    let displayText = placeholder;
    if (selectedValues.length === 1) {
        displayText = selectedValues[0];
    } else if (selectedValues.length > 1) {
        if (selectedValues.length === options.length) {
            displayText = `Todos selecionados (${options.length})`;
        } else {
            displayText = `${selectedValues.length} selecionados`;
        }
    }

    const S = {
        container: { position: "relative", width: "100%", userSelect: "none" },
        trigger: {
            width: "100%",
            background: "#0f1623",
            border: "1px solid #1e2d45",
            borderRadius: 8,
            padding: "10px 12px",
            color: selectedValues.length > 0 ? "#e8edf3" : "#64748b",
            fontSize: 13,
            outline: "none",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            textAlign: "left",
        },
        arrow: {
            fontSize: 10,
            color: "#64748b",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
        },
        dropdown: {
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            background: "#161e2e",
            border: "1px solid #1e2d45",
            borderRadius: 8,
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
            zIndex: 1100,
            padding: 8,
            maxHeight: 280,
            display: "flex",
            flexDirection: "column",
        },
        searchBox: {
            width: "100%",
            background: "#0f1623",
            border: "1px solid #1e2d45",
            borderRadius: 6,
            padding: "6px 10px",
            color: "#e8edf3",
            fontSize: 12,
            outline: "none",
            marginBottom: 8,
        },
        actionRow: {
            display: "flex",
            justifyContent: "space-between",
            padding: "0 4px 6px 4px",
            borderBottom: "1px solid #1e2d45",
            marginBottom: 6,
        },
        actionBtn: {
            background: "none",
            border: "none",
            color: "#3b82f6",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            padding: 0,
        },
        list: {
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 2,
        },
        option: {
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 8px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 12,
            color: "#e8edf3",
            transition: "background 0.15s ease",
        },
        optionHovered: {
            background: "#1e2d45",
        },
        checkbox: {
            accentColor: "#3b82f6",
            cursor: "pointer",
            width: 14,
            height: 14,
        },
        empty: {
            padding: "12px 8px",
            textAlign: "center",
            color: "#64748b",
            fontSize: 12,
        }
    };

    const [hoveredIdx, setHoveredIdx] = useState(null);

    return (
        <div ref={containerRef} style={S.container}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                style={S.trigger}
            >
                <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", marginRight: 8 }}>
                    {displayText}
                </span>
                <span style={S.arrow}>▼</span>
            </button>

            {isOpen && (
                <div style={S.dropdown}>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={searchPlaceholder}
                        style={S.searchBox}
                        autoFocus
                    />
                    
                    <div style={S.actionRow}>
                        <button type="button" onClick={handleSelectAll} style={S.actionBtn}>
                            Selecionar Todos
                        </button>
                        <button type="button" onClick={handleClearAll} style={S.actionBtn}>
                            Limpar
                        </button>
                    </div>

                    <div style={S.list}>
                        {filteredOptions.length === 0 ? (
                            <div style={S.empty}>Nenhum resultado encontrado</div>
                        ) : (
                            filteredOptions.map((opt, idx) => {
                                const isSelected = selectedValues.includes(opt);
                                return (
                                    <div
                                        key={opt}
                                        onClick={() => toggleOption(opt)}
                                        onMouseEnter={() => setHoveredIdx(idx)}
                                        onMouseLeave={() => setHoveredIdx(null)}
                                        style={{
                                            ...S.option,
                                            ...(hoveredIdx === idx ? S.optionHovered : {}),
                                            background: isSelected ? "rgba(59, 130, 246, 0.08)" : "transparent",
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            readOnly
                                            style={S.checkbox}
                                        />
                                        <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                            {opt}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
