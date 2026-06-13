# Roteiro Promotores

> Sistema de gestão de rotas e visitas — front-end inicial (Vite + React).

Funcionalidades planejadas:

- Cadastro e edição de pessoas por loja (promotores, supervisores)
- Registro de visitas e rotas
- Exportação de relatórios (CSV/XLSX)
- Autenticação básica e painel administrativo
- Deploy em plataforma gratuita (GitHub Pages / Vercel / Netlify)

Como rodar localmente

```bash
npm install
npm run dev
```

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
