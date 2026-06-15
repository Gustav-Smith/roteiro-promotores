/**
 * Data Loader Unificado - Orquestra fontes de dados:
 * 1. Google Sheets (via Apps Script API Web App) - banco oficial e central
 * 2. Local (data.js) - fallback de desenvolvimento se a URL do Sheets não estiver configurada
 *
 * Uso no App.jsx:
 *   import { loadAllData } from './dataLoader.js';
 *   useEffect(() => { loadAllData().then(setData); }, []);
 */

import { loadAllFromSheets, checkSheetsAvailable } from './sheets.js';
import {
  PROMOTORES_DADOS,
  INDUSTRIAS,
  TODAS_LOJAS,
  ROTEIROS_INICIAIS,
  DIAS,
  DIAS_LABELS,
  UF_CORES,
} from './data.js';

/**
 * Carrega dados do Google Sheets
 */
async function loadFromSheets() {
  const available = await checkSheetsAvailable();
  if (!available) {
    console.log('[DataLoader] Google Sheets não disponível (VITE_GOOGLE_SCRIPT_URL não configurada)');
    return null;
  }

  try {
    console.log('[DataLoader] Carregando do Google Sheets...');
    const sheetsData = await loadAllFromSheets();
    
    console.log('[DataLoader] ✓ Sheets carregado: lojas=', sheetsData.lojas?.length,
      'pessoas=', sheetsData.pessoas?.length, 'industrias=', sheetsData.industrias?.length,
      'roteiros=', sheetsData.roteiros?.length);

    return sheetsData;
  } catch (e) {
    console.warn('[DataLoader] Erro no Google Sheets, tentando usar fallback local:', e.message);
    return null;
  }
}

/**
 * Carrega dados locais (data.js) - fallback final
 */
function loadFromLocal() {
  console.log('[DataLoader] Usando dados locais (data.js) como fallback');
  return {
    lojas: TODAS_LOJAS,
    pessoas: PROMOTORES_DADOS.map(p => ({ ...p, role: p.role || 'Promotor', telefone: p.telefone || '', loja: p.loja || '', cidade: p.cidade || '' })),
    roteiros: ROTEIROS_INICIAIS,
    industrias: INDUSTRIAS,
    source: 'local',
  };
}

/**
 * Função principal: carrega dados na ordem de prioridade
 * Retorna: { lojas, pessoas, roteiros, industrias, source }
 */
export async function loadAllData() {
  console.log('[DataLoader] Iniciando carregamento de dados...');

  // 1. Tenta Google Sheets (Banco Central)
  const data = await loadFromSheets();
  if (data) return data;

  // 2. Fallback local (Desenvolvimento)
  return loadFromLocal();
}

/**
 * Carrega apenas uma entidade específica (útil para refresh parcial)
 */
export async function loadEntity(entity) {
  const sheetsAvailable = await checkSheetsAvailable();
  if (sheetsAvailable) {
    try {
      const result = await loadAllFromSheets();
      if (result && result[entity]) return result[entity];
    } catch (e) {
      console.warn(`[DataLoader] Erro ao carregar ${entity} do Sheets:`, e.message);
    }
  }

  // Local fallback
  const localMap = {
    lojas: TODAS_LOJAS,
    pessoas: PROMOTORES_DADOS.map(p => ({ ...p, role: p.role || 'Promotor', telefone: p.telefone || '', loja: p.loja || '', cidade: p.cidade || '' })),
    roteiros: ROTEIROS_INICIAIS,
    industrias: INDUSTRIAS,
  };
  return localMap[entity] || [];
}

// Exporta constantes locais para uso direto se necessário
export { DIAS, DIAS_LABELS, UF_CORES };