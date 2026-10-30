# Portfólio — Thiago Alexandre

Site em Astro, com uma cena 3D em Three.js que se monta enquanto a página rola e animações em GSAP. Tem versões em português (`/`) e inglês (`/en/`).

## Rodar no computador

```bash
npm install
npm run dev
```

Abra http://localhost:4321.

## Onde editar

| O que | Arquivo |
|---|---|
| Todos os textos (PT e EN) | `src/data/content.ts` |
| Números do painel de status | `src/data/status.ts` (troque os valores e mude `sample` para `false`) |
| Capturas dos laboratórios | substitua `public/labs/lab-01.svg`, `lab-02.svg` e `lab-03.svg`, ou aponte o campo `image` de cada lab em `content.ts` para um `.webp`/`.png` novo |
| Currículo em PDF | `public/curriculo-thiago-alexandre.pdf` |
| Cores e fontes | `src/styles/global.css` (variáveis no topo) |
| Cena 3D | `src/scripts/scene.ts` |

## Publicar na Vercel

1. Suba esta pasta para um repositório no GitHub.
2. Na Vercel, clique em **Add New → Project** e importe o repositório. Ela detecta o Astro sozinha.
3. Em **Settings → Domains**, adicione `thiago-alexandre.cloud` e configure o DNS como a Vercel indicar.

Cada `git push` publica uma nova versão.
