# souztech.com

Site institucional do Souz Controle de Obra. Página estática, sem framework nem passo de
build, servida pelo GitHub Pages — segue o [Manual da Marca Souz](../souz-controle-obra) v1.0.

- `index.html` — a página.
- `privacidade.html` — política de privacidade (LGPD).
- `404.html` — página de erro do GitHub Pages.
- `config.js` — WhatsApp, e-mail, Instagram, CNPJ, preços e depoimentos. Preencha os `TODO`
  quando tiver a informação; até lá, o elemento correspondente fica escondido.
- `site.js` — nav ao rolar, menu de gaveta no celular, revelar ao entrar na tela e montagem
  dos links de WhatsApp a partir de `config.js`.
- `img/telas/` — recortes reais do sistema (Playwright, obra fictícia "Casa 14 — Vila Nova
  Esperança"), em AVIF/WebP/JPG.
- `img/fotos/` — fotos de obra enviadas, tratadas e otimizadas.
- `favicon.svg`, `icon-32.png`, `icon-180.png`, `icon-512.png`, `og.png` — ícones e imagem de
  compartilhamento, gerados a partir do símbolo da marca.
- `sitemap.xml`, `robots.txt` — SEO.
- `conteudo.md` — rascunho da copy, mantido como referência.
- `CNAME` — o domínio.

Para publicar: GitHub Pages -> Deploy from a branch -> `main` / `(root)`.

Nada aqui leva ao sistema (`obras.souztech.com`) — o site é só apresentação.
