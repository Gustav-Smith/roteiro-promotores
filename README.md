# Roteiro Promotores

> Sistema de gestão de rotas e visitas — front-end inicial (Vite + React).

Funcionalidades planejadas:

- Cadastro e edição de pessoas por loja (promotores, supervisores)
- Registro de visitas e rotas
- Exportação de relatórios (CSV/XLSX)
- Autenticação básica e painel administrativo
- Deploy em plataforma gratuita (Vercel / Netlify)

Integração com Supabase

- Banco Postgres gerenciado
- Tabelas `pessoas` e `lojas`
- Uso de `@supabase/supabase-js` no React

Como rodar localmente

```bash
npm install
cp .env.example .env
# preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm run dev
```

Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
```

Esquema do Supabase

- tabela `lojas`
  - `id` (integer, primary key, auto-increment)
  - `rede` (text)
  - `loja` (text)
  - `uf` (text)

- tabela `pessoas`
  - `id` (integer, primary key, auto-increment)
  - `nome` (text)
  - `loja` (text)
  - `role` (text)
  - `cidade` (text)

Próximos passos para GitHub

- Criar repositório remoto no GitHub
- Adicionar remote e dar push:

```bash
git remote add origin <URL-DO-REPO>
git push -u origin main
```

Para hospedar no GitHub Pages (opção simples):

1. Criar branch `gh-pages` com build:

```bash
npm run build
git checkout -b gh-pages
cp -r dist/* .
git add .
git commit -m "chore: deploy gh-pages"
git push origin gh-pages
```

Alternativas recomendadas: usar Vercel ou Netlify para deploy contínuo a partir da branch `main`.

Deploy no Vercel

1. Crie um projeto no Vercel apontando para o repositório GitHub.
2. Configure as variáveis de ambiente em `Project Settings > Environment Variables`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Defina o comando de build:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Faça deploy automático a partir da branch `main`.

Nota: o frontend consome o Supabase diretamente; mantenha as chaves públicas no Vercel e não comite `.env`.
