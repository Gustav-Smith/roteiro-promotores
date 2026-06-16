/**
 * MÓDULO CLIENTE DO GOOGLE SHEETS
 * Realiza leituras em tempo real através da API Google Visualization (CDN rápida/sem limites de cota)
 * e escritas via requisições POST para a URL do App da Web do Google Apps Script.
 */

const SHEET_ID = '1oALlf5FFvojWg78MqcANKlv1AT-6WQk3';
const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
const SECRET_TOKEN = import.meta.env.VITE_API_SECRET_TOKEN || "MK9_PROMOTORES_2026";

/** Leitura via GViz CDN — sempre disponível (planilha pública) */
export async function checkSheetsAvailable() {
  return true;
}

/** Escrita via Apps Script — só disponível se a URL estiver configurada */
export function checkWriteAvailable() {
  return !!SCRIPT_URL;
}

/**
 * Função auxiliar para buscar uma aba específica via a API de Visualização do Google (GViz JSON)
 * Adiciona um timestamp na URL para prevenir caching do navegador.
 */
async function fetchGViz(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&t=${Date.now()}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Erro HTTP ${resp.status} ao carregar aba "${sheetName}"`);
  }
  
  const text = await resp.text();
  const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);/);
  if (!match) {
    throw new Error(`Falha ao processar JSONP da aba "${sheetName}"`);
  }
  
  const json = JSON.parse(match[1]);
  if (json.status === "error") {
    throw new Error(`Erro GViz na aba "${sheetName}": ${JSON.stringify(json.errors)}`);
  }
  
  const table = json.table;
  const cols = table.cols.map((c, i) => c.label ? c.label.toString().trim() : `col_${i}`);
  
  return table.rows.map(r => {
    const obj = {};
    if (r && r.c) {
      r.c.forEach((cell, idx) => {
        const colLabel = cols[idx];
        obj[colLabel] = cell ? cell.v : null;
      });
    }
    return obj;
  });
}

/**
 * Busca valor em um objeto usando chaves case-insensíveis e tolerantes a espaços.
 */
function getVal(obj, keys, defaultVal = "") {
  for (let key of keys) {
    const normKey = key.toLowerCase().trim();
    for (let k of Object.keys(obj)) {
      if (k.toLowerCase().trim() === normKey) {
        return obj[k] !== null && obj[k] !== undefined ? obj[k] : defaultVal;
      }
    }
  }
  return defaultVal;
}

/**
 * Carrega todos os dados da planilha online (todas as abas necessárias) em paralelo.
 * Não consome cotas de execução do Apps Script!
 */
export async function loadAllFromSheets() {
  try {
    const [
      promotoresRaw,
      lojasRaw,
      industriaRaw,
      roteiroLucasRaw,
      roteiroAlexandreRaw
    ] = await Promise.all([
      fetchGViz("PROMOTORES"),
      fetchGViz("LOJAS"),
      fetchGViz("INDUSTRIA"),
      fetchGViz("ROTEIRO LUCAS"),
      fetchGViz("ROTEIRO ALEXANDRE")
    ]);

    // 1. Normalização das Lojas (Aba: LOJAS)
    // Se a primeira linha contiver os títulos "REDE" na col_0, removemos ela.
    const lojasStart = (lojasRaw[0] && lojasRaw[0]["col_0"] === "REDE") ? 1 : 0;
    const lojas = lojasRaw.slice(lojasStart).map(r => ({
      rede: (r["col_0"] || "").toString().trim(),
      loja: (r["col_1"] || "").toString().trim(),
      uf: (r["col_2"] || "").toString().trim()
    })).filter(l => l.loja);

    // 2. Normalização dos Promotores (Aba: PROMOTORES)
    const pessoas = promotoresRaw.map((r, i) => {
      const idVal = getVal(r, ["id", "codigo", "cod"]);
      return {
        id: parseInt(idVal || i + 1, 10),
        nome: getVal(r, ["nome", "promotor", "nome do promotor"]).toString().trim(),
        role: "Promotor",
        loja: getVal(r, ["loja", "loja associada"]).toString().trim(),
        cidade: getVal(r, ["cidade", "cidade atendimento", "regiao", "região"]).toString().trim(),
        telefone: getVal(r, ["telefone", "contato", "whatsapp"]).toString().trim(),
        observacao: getVal(r, ["observacao", "observação", "observacoes", "observações"]).toString().trim()
      };
    }).filter(p => p.nome);

    // 3. Normalização das Indústrias (Aba: INDUSTRIA)
    const indStart = (industriaRaw[0] && industriaRaw[0]["col_0"] === "INDUSTRIA") ? 1 : 0;
    const industrias = industriaRaw.slice(indStart).map(r => {
      return (r["col_0"] || "").toString().trim();
    }).filter(Boolean);

    // 4. Normalização dos Roteiros (Lucas + Alexandre)
    const parseRoteiroRows = (rows, supervisor) => {
      if (!rows || rows.length === 0) return [];
      const rotStart = (rows[0] && rows[0]["col_1"] === "INDUSTRIA") ? 1 : 0;
      return rows.slice(rotStart).map((r, idx) => {
        const getDayVal = (val) => val === "✓" || val === "x" || val === "X" || val === true || val === "true";
        const col0Val = r["col_0"];
        const parsedId = col0Val ? Number(col0Val) : NaN;
        const fallbackId = idx + 1 + (supervisor === "ALEXANDRE" ? 1000 : 0);
        const finalId = (!isNaN(parsedId) && parsedId !== 0) ? parsedId : fallbackId;
        return {
          id: finalId,
          industria: (r["col_1"] || "").toString().trim(),
          loja: (r["col_2"] || "").toString().trim(),
          uf: (r["col_3"] || "").toString().trim(),
          promotor: (r["col_4"] || "").toString().trim(),
          supervisor: supervisor,
          dias: {
            SEG: getDayVal(r["col_5"]),
            TER: getDayVal(r["col_6"]),
            QUA: getDayVal(r["col_7"]),
            QUI: getDayVal(r["col_8"]),
            SEX: getDayVal(r["col_9"]),
            SAB: getDayVal(r["col_10"]),
            DOM: getDayVal(r["col_11"])
          }
        };
      }).filter(v => v.loja && v.promotor);
    };

    const roteirosLucas = parseRoteiroRows(roteiroLucasRaw, "LUCAS");
    const roteirosAlexandre = parseRoteiroRows(roteiroAlexandreRaw, "ALEXANDRE");
    const roteiros = [...roteirosLucas, ...roteirosAlexandre];

    return {
      lojas,
      pessoas,
      roteiros,
      industrias,
      source: 'sheets'
    };
  } catch (error) {
    console.error("[Sheets API] Erro ao carregar dados via CDN:", error);
    throw error;
  }
}

/**
 * Função genérica para enviar comandos POST para o Google Apps Script Web App
 * Suporta dois formatos de resposta de erro:
 * 1. { status: "error", message: "..." } - formato legado
 * 2. { success: false, message: "..." } - formato padrão solicitado
 */
async function postToSheets(action, payloadData) {
  if (!SCRIPT_URL) {
    throw new Error("Escrita indisponível: VITE_GOOGLE_SCRIPT_URL não configurada no arquivo .env");
  }

  const payload = {
    token: SECRET_TOKEN,
    action: action,
    data: payloadData
  };

  console.log(`[Sheets API] Enviando ${action}:`, JSON.stringify(payloadData, null, 2));

  const resp = await fetch(SCRIPT_URL, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  });

  console.log(`[Sheets API] Resposta HTTP ${resp.status} para ${action}`);

  if (!resp.ok) {
    const errorText = await resp.text().catch(() => 'Sem corpo de resposta');
    console.error(`[Sheets API] Erro HTTP ${resp.status}:`, errorText);
    throw new Error(`Erro HTTP na escrita: ${resp.status} - ${errorText}`);
  }

  let result;
  try {
    result = await resp.json();
  } catch (jsonError) {
    const responseText = await resp.text().catch(() => 'Não foi possível ler resposta');
    console.error(`[Sheets API] Resposta não é JSON válido:`, responseText);
    throw new Error(`Resposta inválida do servidor: ${responseText.substring(0, 200)}`);
  }

  console.log(`[Sheets API] Resposta parseada:`, JSON.stringify(result, null, 2));

  // Verifica ambos os formatos de erro possíveis
  const isErrorResponse = result.status === "error" || result.success === false;
  const errorMessage = result.message || result.error || "Erro desconhecido na API";

  if (isErrorResponse) {
    console.error(`[Sheets API] Erro na resposta:`, errorMessage);
    throw new Error(errorMessage);
  }

  // Valida se a resposta de sucesso contém dados esperados
  if (result.success === true && !result.data) {
    console.warn(`[Sheets API] Resposta de sucesso sem dados:`, result);
  }

  return result;
}

export async function savePessoaToSheets(pessoa) {
  return postToSheets("savePessoa", pessoa);
}

export async function deletePessoaFromSheets(pessoa) {
  return postToSheets("deletePessoa", pessoa);
}

export async function saveVisitaToSheets(visita) {
  return postToSheets("saveVisita", visita);
}

export async function deleteVisitaFromSheets(visita) {
  return postToSheets("deleteVisita", visita);
}

export async function saveLojaToSheets(loja) {
  return postToSheets("saveLoja", loja);
}

export async function saveMultiplePessoasToSheets(pessoas) {
  return postToSheets("saveMultiplePessoas", { pessoas });
}

export async function saveMultipleVisitasToSheets(visitas) {
  return postToSheets("saveMultipleVisitas", { visitas });
}