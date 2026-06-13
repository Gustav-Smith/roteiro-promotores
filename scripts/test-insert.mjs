import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://vkdkxotfxfdewjdfsdad.supabase.co',
    'sb_publishable_st3UIi97Y_XNmT6EFKn7OA_Cehgn5io'
);

const { data, error } = await supabase
    .from('pessoas')
    .insert([
        { nome: 'Teste Telefone', role: 'Promotor', cidade: 'Teste', loja: '', telefone: '5561992910841' }
    ])
    .select();

console.log('Insert attempt output:');
console.log('Data:', data);
console.log('Error:', error);
