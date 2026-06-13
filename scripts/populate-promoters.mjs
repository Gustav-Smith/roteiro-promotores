import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://vkdkxotfxfdewjdfsdad.supabase.co',
    'sb_publishable_st3UIi97Y_XNmT6EFKn7OA_Cehgn5io'
);

const PROMOTORES_PARA_INSERIR = [
  { nome: "ALEXANDRE FREITAS DA SILVA", cidade: "", telefone: "556183110460" },
  { nome: "JHONATTA WISNNER GONÇALVES", cidade: "", telefone: "556182177307" },
  { nome: "ANDERSON WILLIAMS SANTOS TORRES", cidade: "PISTÃO SUL", telefone: "556198011855" },
  { nome: "CARLOS DA GUIA NUNES", cidade: "GAMA E NOVO GAMA", telefone: "556193828554" },
  { nome: "PAULO VICTOR RODRIGUES DE ALMEIDA", cidade: "SOBRADINHO", telefone: "556195847193" },
  { nome: "ANTONIA AMANDA SIEBRA BATISTA", cidade: "PLANALTINA GOIAS E DF", telefone: "556193123343" },
  { nome: "GRAZIELE MELO SILVA ALVES", cidade: "CEILANDIA E AGUAS CLARAS", telefone: "556181054165" },
  { nome: "FRANCISCO PEREIRA MASCIMO", cidade: "AGUAS LINDAS / 070", telefone: "556195182536" },
  { nome: "SAMILLE APARECIDA DOS SANTOS DAMASCENO BARBOSA", cidade: "EPTG / AGUAS / GUARA", telefone: "556193394605" },
  { nome: "WYNGLEY SOARES CABRAL", cidade: "ASA NORTE / JARDIM BOTANICO", telefone: "556183457800" },
  { nome: "MARIA EDUARDA CARDOSO DOS SANTOS", cidade: "", telefone: "556182529308" },
  { nome: "GUILHERME RODRIGUES SILVA DE LIMA", cidade: "VICENTE PIRES / TATICO DA CEILANDIA / TAGUATINGA", telefone: "556181980238" },
  { nome: "FRANKLIN MATOS RODRIGUES", cidade: "VALPARAISO / LUZIANIA", telefone: "556191008170" },
  { nome: "PRISCYLLA GOMES DA SILVA", cidade: "SAMAMBAIA/ RIACHO / RECANTO", telefone: "556196290083" },
  { nome: "LUCAS MATHEUS MOREIRA SILVA", cidade: "GOIANIA", telefone: "556292627000" },
  { nome: "JONAS DUARTE DA SILVA", cidade: "GOIANIA", telefone: "5562993380899" },
  { nome: "BRENNO FELIPE GOMES DA SILVA", cidade: "GOIANIA", telefone: "556294700104" },
  { nome: "MARCIO JERONIMO ALVES", cidade: "GOIANIA", telefone: "5562995737803" },
  { nome: "ROGERIO PEREIRA BARBOSA", cidade: "TRINDADE", telefone: "5562983295210" },
  { nome: "GABRIEL TERRA ANDRADE PORTELLA", cidade: "GOIANIA", telefone: "5562981721490" },
  { nome: "FRANCISCO JOSE DOS SANTOS LOURENÇO", cidade: "GOIANIA", telefone: "5562991779416" },
  { nome: "NUBIA FLAVIA LEITE", cidade: "GOIANIA", telefone: "556291234123" },
  { nome: "FABIO CAMARGO DOS SANTOS", cidade: "GOIANIA", telefone: "556295045351" },
  { nome: "SIMONE DE JESUS PEREIRA", cidade: "CATALAO", telefone: "5564996929742" },
  { nome: "THAYZA DE OLIVEIRA PEREIRA", cidade: "RIO VERDE", telefone: "556493070171" },
  { nome: "MATHEUS RIBEIRO SILVA", cidade: "ITUMBIARA", telefone: "556492682963" },
  { nome: "YAGO BORGES DE QUEIROZ", cidade: "ANAPOLIS", telefone: "5562994414211" },
  { nome: "MARCELO AUGUSTO DE OLIVEIRA PEREIRA GOMES", cidade: "", telefone: "556292519929" },
  { nome: "RODRIGO MARQUES DE OLIVEIRA", cidade: "ANAPOLIS", telefone: "556291570770" },
  { nome: "CAMILA TRINDADE DE OLIVEIRA", cidade: "JATAI", telefone: "556492676362" },
  { nome: "LUCAS PEREIRA DE FARIA SILVA", cidade: "CALDAS NOVAS", telefone: "5564993432324" },
  { nome: "THALLYSON WILLIAM DE SOUSA SILVA", cidade: "", telefone: "556493275027" },
  { nome: "DANIEL ALEXANDRE DE ALMEIDA", cidade: "GOIÂNIA", telefone: "556292067536" },
  { nome: "KAYQUE DE JESUS OLIVEIRA", cidade: "GOIANIA", telefone: "556291327718" },
  { nome: "FERNANDA KELLY ALVES DA SILVA - PRECISA DE TROCA DE EPI", cidade: "ARAGUAINA", telefone: "556391050813" },
  { nome: "KEVEN ALBERTO PAULINO DE SOUSA DE DESLIGAMENTO", cidade: "PALMAS", telefone: "556391178695" },
  { nome: "RAFAELA SILVA GOMES", cidade: "BARRA DO GARÇAS", telefone: "556692188888" },
  { nome: "JEFFERSON JUNIOR DE SOUZA", cidade: "PRIMAVERA DO LESTE", telefone: "556692270687" },
  { nome: "ERIK MATHEUS DE SOUZA MENDES", cidade: "SINOP", telefone: "556699008027" },
  { nome: "ROSILENE DA SILVA GONCALVES GAMBARRA", cidade: "CUIABA/VÁRZEA GRANDE", telefone: "556592377672" },
  { nome: "ALINE DA SILVA PROCOPIO", cidade: "DOURADOS", telefone: "556798546381" },
  { nome: "ANA LETICIA ORTIZ AVALO", cidade: "CAMPO GRANDE", telefone: "556793449807" },
  { nome: "MILLENA CONCEICAO MOURA CRUZ", cidade: "LUIS EDUARDO MAGALHAES", telefone: "557799028012" }
];

async function run() {
    console.log('Verificando se a coluna "telefone" existe...');
    
    // Tenta fazer uma inserção de teste com o campo telefone
    const testRow = {
        nome: "TESTE_TEMPORARIO",
        role: "Promotor",
        loja: "",
        cidade: "TESTE",
        telefone: "5561992910841"
    };
    
    const { data: testData, error: testError } = await supabase
        .from('pessoas')
        .insert([testRow])
        .select();
        
    let useTelefone = true;
    if (testError) {
        if (testError.message && testError.message.includes('telefone')) {
            console.log('⚠️ Coluna "telefone" não existe no Supabase.');
            useTelefone = false;
        } else {
            console.error('Erro ao testar inserção:', testError);
            process.exit(1);
        }
    } else {
        console.log('✅ Coluna "telefone" existe!');
        // Remove a linha de teste
        await supabase.from('pessoas').delete().eq('nome', 'TESTE_TEMPORARIO');
    }
    
    // Agora vamos limpar a tabela de pessoas para recolocar a lista correta
    console.log('Limpando tabela "pessoas" (deletando promotores antigos)...');
    const { error: deleteError } = await supabase
        .from('pessoas')
        .delete()
        .neq('nome', 'Gustavo Jean'); // Mantém o Gustavo Jean se quiser
        
    if (deleteError) {
        console.error('Erro ao limpar a tabela:', deleteError);
        process.exit(1);
    }
    
    // Prepara os dados para inserção
    const pessoasParaInserir = PROMOTORES_PARA_INSERIR.map(p => {
        const item = {
            nome: p.nome,
            role: "Promotor",
            loja: "",
            cidade: p.cidade || ""
        };
        if (useTelefone) {
            item.telefone = p.telefone;
        }
        return item;
    });
    
    console.log(`Inserindo ${pessoasParaInserir.length} promotores no Supabase...`);
    const { data: insertData, error: insertError } = await supabase
        .from('pessoas')
        .insert(pessoasParaInserir)
        .select();
        
    if (insertError) {
        console.error('Erro ao inserir promotores:', insertError);
        process.exit(1);
    }
    
    console.log(`✅ Inseridos com sucesso: ${insertData.length} promotores!`);
    
    if (!useTelefone) {
        console.log('\n======================================================');
        console.log('⚠️ AVISO IMPORTANTE:');
        console.log('Os promotores foram importados com sucesso, mas SEM os números de telefone.');
        console.log('Para que os telefones apareçam, você deve acessar o painel do Supabase,');
        console.log('abrir o "SQL Editor" e rodar o comando abaixo:');
        console.log('\nALTER TABLE pessoas ADD COLUMN IF NOT EXISTS telefone text;\n');
        console.log('Depois de rodar esse comando no Supabase, execute este script novamente');
        console.log('para que os telefones sejam importados!');
        console.log('======================================================\n');
    } else {
        console.log('\n✅ Todos os promotores foram cadastrados com sucesso com seus respectivos telefones!');
    }
}

run();
