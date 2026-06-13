-- Supabase schema for Roteiro Promotores

-- Tabela de lojas
CREATE TABLE IF NOT EXISTS public.lojas (
  id serial PRIMARY KEY,
  rede text NOT NULL,
  loja text NOT NULL,
  uf text NOT NULL
);

-- Tabela de pessoas
CREATE TABLE IF NOT EXISTS public.pessoas (
  id serial PRIMARY KEY,
  nome text NOT NULL,
  loja text NOT NULL,
  role text NOT NULL,
  cidade text DEFAULT '',
  telefone text DEFAULT ''
);

-- Opcional: tabela de roteiros/visitas para sincronização futura
CREATE TABLE IF NOT EXISTS public.roteiros (
  id serial PRIMARY KEY,
  industria text NOT NULL,
  loja text NOT NULL,
  uf text NOT NULL,
  promotor text NOT NULL,
  supervisor text NOT NULL,
  dias jsonb NOT NULL DEFAULT '{}'::jsonb
);
