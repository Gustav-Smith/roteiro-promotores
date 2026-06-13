import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://vkdkxotfxfdewjdfsdad.supabase.co',
    'sb_publishable_st3UIi97Y_XNmT6EFKn7OA_Cehgn5io'
);

const { data: pessoas, error: pessoasError } = await supabase.from('pessoas').select('*').order('id');
console.log('=== PESSOAS ===');
console.log('Error:', pessoasError);
console.log('Count:', pessoas?.length);
if (pessoas) console.log('First 3:', pessoas.slice(0, 3));

const { data: roteiros, error: roteirosError } = await supabase.from('roteiros').select('*').order('id');
console.log('\n=== ROTEIROS ===');
console.log('Error:', roteirosError);
console.log('Count:', roteiros?.length);
