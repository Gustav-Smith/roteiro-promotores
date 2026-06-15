/**
 * GOOGLE APES SCRIPT - API DE INTEGRAÇÃO BIDIRECIONAL
 * 
 * Instalação:
 * 1. Na sua planilha do Google Sheets, acesse: Extensões -> Apps Script.
 * 2. Apague qualquer código existente e cole este código completo.
 * 3. Defina a variável API_SECRET_TOKEN com uma senha de segurança (ex: "MK9_PROMOTORES_2026").
 * 4. Clique em "Salvar" (ícone de disquete).
 * 5. Clique em "Implantar" -> "Nova implantação".
 * 6. Selecione o tipo "App da Web" (engrenagem -> App da Web).
 * 7. Configurações:
 *    - Descrição: API Roteiro Promotores
 *    - Executar como: "Eu" (Seu e-mail)
 *    - Quem tem acesso: "Qualquer pessoa" (Anyone)
 * 8. Clique em "Implantar" e conceda as permissões necessárias.
 * 9. Copie a URL do App da Web gerada (ela termina em /exec).
 * 10. Insira essa URL no seu arquivo .env local como VITE_GOOGLE_SCRIPT_URL.
 */

// ⚠️ DEFIINA UMA CHAVE DE SEGURANÇA. Ela deve ser igual à chave VITE_API_SECRET_TOKEN no seu arquivo .env
const API_SECRET_TOKEN = "MK9_PROMOTORES_2026";

/**
 * Habilita CORS e retorna JSON
 */
function responseJson(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Valida o token de segurança na requisição
 */
function validateToken(token) {
  if (!API_SECRET_TOKEN) return true; // Se não configurado, ignora
  return token === API_SECRET_TOKEN;
}

/**
 * GET - Leitura de dados em tempo real
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    const token = e.parameter.token;

    if (!validateToken(token)) {
      return responseJson({ status: "error", message: "Acesso não autorizado. Token inválido." });
    }

    const doc = SpreadsheetApp.getActiveSpreadsheet();
    if (!doc) {
      return responseJson({ status: "error", message: "Planilha ativa não encontrada." });
    }

    if (action === "readAll" || !action) {
      const sheets = doc.getSheets();
      const result = {};

      sheets.forEach(sheet => {
        const name = sheet.getName();
        const data = readSheetData(sheet);
        result[name] = data;
      });

      return responseJson({ status: "success", source: "sheets", data: result });
    }

    return responseJson({ status: "error", message: "Ação GET desconhecida." });
  } catch (error) {
    return responseJson({ status: "error", message: error.toString() });
  }
}

/**
 * POST - Escrita e sincronização de dados
 */
function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      return responseJson({ status: "error", message: "Corpo da requisição vazio." });
    }

    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const token = payload.token;

    if (!validateToken(token)) {
      return responseJson({ status: "error", message: "Acesso não autorizado. Token inválido." });
    }

    const doc = SpreadsheetApp.getActiveSpreadsheet();
    if (!doc) {
      return responseJson({ status: "error", message: "Planilha ativa não encontrada." });
    }

    let result;
    switch (action) {
      case "savePessoa":
        result = savePessoa(doc, payload.data);
        break;
      case "deletePessoa":
        result = deletePessoa(doc, payload.data);
        break;
      case "saveVisita":
        result = saveVisita(doc, payload.data);
        break;
      case "deleteVisita":
        result = deleteVisita(doc, payload.data);
        break;
      case "saveLoja":
        result = saveLoja(doc, payload.data);
        break;
      case "saveMultiplePessoas":
        result = saveMultiplePessoas(doc, payload.data);
        break;
      case "saveMultipleVisitas":
        result = saveMultipleVisitas(doc, payload.data);
        break;
      default:
        return responseJson({ status: "error", message: "Ação POST desconhecida: " + action });
    }

    return responseJson(result);
  } catch (error) {
    return responseJson({ status: "error", message: error.toString() });
  }
}

/**
 * Função utilitária para ler dados de uma aba e retornar vetor de objetos
 */
function readSheetData(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 1 || lastCol < 1) return [];

  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  if (values.length <= 1) return [];

  const rawHeaders = values[0];
  const headers = rawHeaders.map(h => h.toString().trim());

  const data = [];
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    // Se a linha estiver totalmente em branco, ignora
    if (row.every(c => c === "" || c === null || c === undefined)) continue;

    const obj = {};
    headers.forEach((header, cIndex) => {
      let val = row[cIndex];
      // Converte booleano representado em string ou células
      if (val === "true" || val === true) val = true;
      else if (val === "false" || val === false) val = false;
      
      obj[header] = val;
    });
    data.push(obj);
  }
  return data;
}

/**
 * Remove acentos e caracteres especiais para comparação/mapeamento de cabeçalhos
 */
function normalizeKey(str) {
  if (!str) return "";
  return str.toString().trim()
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Retorna o índice da coluna que corresponde à chave buscada
 */
function getColumnIndex(headers, key) {
  const normKey = normalizeKey(key);
  
  // Custom aliases para mapeamento flexível entre JS e Planilha
  const aliases = {
    "id": ["id", "codigo", "cod"],
    "uf": ["uf", "estado", "sigla", "estadouf"],
    "loja": ["loja", "nomeloja", "lojaassociada", "nome", "nomedaloja"],
    "promotor": ["promotor", "nome", "nomedopromotor"],
    "cidade": ["cidade", "cidaderegiao", "regiao", "regiaoatendida"],
    "telefone": ["telefone", "tel", "whatsapp", "celular"],
    "industria": ["industria", "industrias", "empresa"],
    "rede": ["rede", "redesupermercado"],
    "role": ["role", "funcao", "cargo"],
    "observacao": ["observacao", "observacoes", "obs"],
    "supervisor": ["supervisor", "supervisora", "responsavel"]
  };

  // 1. Busca exata de normalizado
  for (let i = 0; i < headers.length; i++) {
    if (normalizeKey(headers[i]) === normKey) return i;
  }

  // 2. Busca por aliases
  if (aliases[key]) {
    for (let i = 0; i < headers.length; i++) {
      const normHeader = normalizeKey(headers[i]);
      if (aliases[key].includes(normHeader)) return i;
    }
  }

  // 3. Busca por dias da semana
  const dayAliases = {
    "SEG": ["seg", "segunda", "segundafeira", "mon", "monday"],
    "TER": ["ter", "terca", "tercafeira", "tue", "tuesday"],
    "QUA": ["qua", "quarta", "quartafeira", "wed", "wednesday"],
    "QUI": ["qui", "quinta", "quintafeira", "thu", "thursday"],
    "SEX": ["sex", "sexta", "sextafeira", "fri", "friday"],
    "SAB": ["sab", "sabado", "sat", "saturday"],
    "DOM": ["dom", "domingo", "sun", "sunday"]
  };
  if (dayAliases[key]) {
    for (let i = 0; i < headers.length; i++) {
      const normHeader = normalizeKey(headers[i]);
      if (dayAliases[key].includes(normHeader)) return i;
    }
  }

  return -1;
}

/**
 * Busca a linha de um registro baseado no ID ou no Nome
 */
function findRowIndex(sheet, idColIndex, idValue, nameColIndex, nameValue) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    // Se temos index de ID e o valor bate
    if (idColIndex !== -1 && idValue && row[idColIndex].toString() === idValue.toString()) {
      return i + 2; // +2 porque o getRange começa na linha 2 e o index é 0
    }
    // Se temos index de nome e o valor bate (fallback)
    if (nameColIndex !== -1 && nameValue && row[nameColIndex].toString().trim().toUpperCase() === nameValue.toString().trim().toUpperCase()) {
      return i + 2;
    }
  }
  return -1;
}

/**
 * Salva ou atualiza uma pessoa (promotor) na aba PROMOTORES
 */
function savePessoa(doc, data) {
  const sheet = doc.getSheetByName("PROMOTORES") || doc.getSheets()[0];
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const idCol = getColumnIndex(headers, "id");
  const nomeCol = getColumnIndex(headers, "nome");

  // Localiza linha existente
  let rowIndex = findRowIndex(sheet, idCol, data.id, nomeCol, data.nome);

  let isNew = false;
  if (rowIndex === -1) {
    isNew = true;
    rowIndex = sheet.getLastRow() + 1;
    // Se a aba estiver vazia, cria cabeçalhos padrão
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["id", "nome", "role", "loja", "cidade", "telefone", "observacao"]);
      return savePessoa(doc, data);
    }
  }

  // Gera ID se for novo e ID não fornecido
  let recordId = data.id;
  if (isNew && !recordId) {
    recordId = Date.now();
  }

  // Preenche a linha com base nos mapeamentos
  const rowValues = [];
  headers.forEach((header, i) => {
    // Valor atual da linha para não apagar colunas desconhecidas
    let val = isNew ? "" : sheet.getRange(rowIndex, i + 1).getValue();

    // Mapeia chaves JavaScript para colunas da planilha
    const normH = normalizeKey(header);
    if (normH === "id" || normH === "codigo" || normH === "cod") val = recordId;
    else if (normH === "nome" || normH === "promotor") val = data.nome || "";
    else if (normH === "role" || normH === "funcao" || normH === "cargo") val = data.role || "Promotor";
    else if (normH === "loja" || normH === "lojaassociada") val = data.loja || "";
    else if (normH === "cidade" || normH === "regiao") val = data.cidade || "";
    else if (normH === "telefone" || normH === "whatsapp") val = data.telefone || "";
    else if (normH === "observacao" || normH === "observacoes" || normH === "obs") val = data.observacao || "";

    rowValues.push(val);
  });

  // Grava na planilha
  sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);

  return { 
    status: "success", 
    message: isNew ? "Pessoa cadastrada com sucesso!" : "Pessoa atualizada com sucesso!",
    data: { ...data, id: recordId }
  };
}

/**
 * Remove um promotor da aba PROMOTORES
 */
function deletePessoa(doc, data) {
  const sheet = doc.getSheetByName("PROMOTORES");
  if (!sheet) return { status: "error", message: "Aba PROMOTORES não encontrada." };

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idCol = getColumnIndex(headers, "id");
  const nomeCol = getColumnIndex(headers, "nome");

  const rowIndex = findRowIndex(sheet, idCol, data.id, nomeCol, data.nome);
  if (rowIndex === -1) {
    return { status: "error", message: "Pessoa não localizada na planilha." };
  }

  sheet.deleteRow(rowIndex);
  return { status: "success", message: "Pessoa removida com sucesso!" };
}

/**
 * Salva ou atualiza uma visita (roteiro) na aba correspondente do supervisor
 */
function saveVisita(doc, data) {
  const supervisor = (data.supervisor || "LUCAS").trim().toUpperCase();
  const sheetName = "ROTEIRO " + supervisor;
  
  let sheet = doc.getSheetByName(sheetName);
  if (!sheet) {
    // Se a aba do supervisor não existe, cria a partir de um cabeçalho padrão
    sheet = doc.insertSheet(sheetName);
    sheet.appendRow(["id", "industria", "loja", "uf", "promotor", "segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo", "supervisor"]);
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idCol = getColumnIndex(headers, "id");

  let rowIndex = findRowIndex(sheet, idCol, data.id, -1, null);
  let isNew = false;

  if (rowIndex === -1) {
    isNew = true;
    rowIndex = sheet.getLastRow() + 1;
  }

  let recordId = data.id;
  if (isNew && !recordId) {
    recordId = Date.now() + Math.floor(Math.random() * 100000);
  }

  const rowValues = [];
  headers.forEach((header, i) => {
    let val = isNew ? "" : sheet.getRange(rowIndex, i + 1).getValue();
    const normH = normalizeKey(header);

    if (normH === "id") val = recordId;
    else if (normH === "industria") val = data.industria || "";
    else if (normH === "loja") val = data.loja || "";
    else if (normH === "uf") val = data.uf || "";
    else if (normH === "promotor") val = data.promotor || "";
    else if (normH === "supervisor") val = supervisor;
    else {
      // Verifica se a coluna representa um dia da semana
      const diasSemana = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];
      diasSemana.forEach(d => {
        const dIndex = getColumnIndex(headers, d);
        if (dIndex === i) {
          const isTicked = data.dias && data.dias[d];
          val = isTicked ? "x" : "";
        }
      });
    }
    rowValues.push(val);
  });

  sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);

  return {
    status: "success",
    message: isNew ? "Visita criada com sucesso!" : "Visita atualizada com sucesso!",
    data: { ...data, id: recordId }
  };
}

/**
 * Remove uma visita do roteiro correspondente
 */
function deleteVisita(doc, data) {
  const supervisor = (data.supervisor || "LUCAS").trim().toUpperCase();
  const sheetName = "ROTEIRO " + supervisor;

  const sheet = doc.getSheetByName(sheetName);
  if (!sheet) return { status: "error", message: "Aba do Roteiro não encontrada." };

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idCol = getColumnIndex(headers, "id");

  const rowIndex = findRowIndex(sheet, idCol, data.id, -1, null);
  if (rowIndex === -1) {
    return { status: "error", message: "Visita não localizada na planilha." };
  }

  sheet.deleteRow(rowIndex);
  return { status: "success", message: "Visita removida com sucesso!" };
}

/**
 * Cadastra uma nova loja (com validação anti-duplicidade)
 */
function saveLoja(doc, data) {
  const sheet = doc.getSheetByName("LOJAS");
  if (!sheet) return { status: "error", message: "Aba LOJAS não encontrada." };

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const lojaCol = getColumnIndex(headers, "loja");

  // Validação: Nunca permitir loja duplicada
  const lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    const lojasExistentes = sheet.getRange(2, lojaCol + 1, lastRow - 1, 1).getValues().map(r => r[0].toString().trim().toUpperCase());
    const novaLojaNome = (data.loja || "").trim().toUpperCase();

    if (lojasExistentes.includes(novaLojaNome)) {
      return { status: "error", message: "Esta loja já está cadastrada na aba LOJAS. Cadastro duplicado não permitido." };
    }
  }

  // Insere
  const rowValues = [];
  headers.forEach(header => {
    let val = "";
    const normH = normalizeKey(header);
    if (normH === "rede") val = data.rede || "";
    else if (normH === "loja") val = data.loja || "";
    else if (normH === "uf") val = data.uf || "";
    rowValues.push(val);
  });

  sheet.appendRow(rowValues);
  
  return {
    status: "success",
    message: "Loja cadastrada com sucesso!",
    data: data
  };
}

/**
 * Salva múltiplos promotores em lote
 */
function saveMultiplePessoas(doc, data) {
  const sheet = doc.getSheetByName("PROMOTORES");
  if (!sheet) return { status: "error", message: "Aba PROMOTORES não encontrada." };

  const list = data.pessoas || [];
  let insertCount = 0;

  list.forEach(p => {
    const result = savePessoa(doc, p);
    if (result.status === "success") insertCount++;
  });

  return {
    status: "success",
    message: insertCount + " pessoas processadas e salvas com sucesso!"
  };
}

/**
 * Salva múltiplas visitas em lote
 */
function saveMultipleVisitas(doc, data) {
  const list = data.visitas || [];
  let insertCount = 0;
  const savedData = [];

  list.forEach(v => {
    const result = saveVisita(doc, v);
    if (result.status === "success") {
      insertCount++;
      savedData.push(result.data);
    }
  });

  return {
    status: "success",
    message: insertCount + " visitas processadas e salvas com sucesso!",
    data: savedData
  };
}
