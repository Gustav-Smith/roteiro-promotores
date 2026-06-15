import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://vkdkxotfxfdewjdfsdad.supabase.co',
    'sb_publishable_st3UIi97Y_XNmT6EFKn7OA_Cehgn5io'
);

const { data: supervisors, error } = await supabase
    .from('pessoas')
    .select('*')
    .eq('role', 'Supervisor');

console.log('Supervisors in DB:', supervisors);
console.log('Error:', error);
