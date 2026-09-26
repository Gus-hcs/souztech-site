# souztech.com

Site institucional do Souz Controle de Obra. Página estática, sem framework nem passo de
build, servida pelo GitHub Pages — segue o [Manual da Marca Souz](../souz-controle-obra) v1.1: moldura em Souz Preto
(topo, capa, manifesto, chamada final e rodapé) e conteúdo em chumbo neutro; a seção de relatórios
usa a paleta clara do manual. Vermelho e âmbar não aparecem no site.

- `index.html` — a página.
- `privacidade.html` — política de privacidade (LGPD).
- `404.html` — página de erro do GitHub Pages.
- `config.js` — WhatsApp, e-mail, Instagram, CNPJ, preços e depoimentos. Preencha os `TODO`
  quando tiver a informação; até lá, o elemento correspondente fica escondido.
- `site.js` — links de WhatsApp a partir de `config.js`, nav, menu de gaveta e os efeitos de
  rolagem (tela do topo que assenta, manifesto que acende, história com tela fixa, paralaxe,
  barra de progresso). Tudo desliga com `prefers-reduced-motion`.
- `img/telas/` — telas reais do sistema em modo escuro, sem a barra lateral (Playwright, obras
  fictícias "Casa 14" e "Casa 42"), em AVIF/WebP/JPG, 1280 e 2560 px; celular em 390/780/1170.
  Clicar numa tela abre a versão de 2560 px.
- `img/fotos/` — fotos de obra enviadas, tratadas e otimizadas.
- `favicon.svg`, `icon-32.png`, `icon-180.png`, `icon-512.png`, `og.png` — ícones e imagem de
  compartilhamento, gerados a partir do símbolo da marca.
- `sitemap.xml`, `robots.txt` — SEO.
- `conteudo.md` — rascunho da copy, mantido como referência.
- `CNAME` — o domínio.

Para publicar: GitHub Pages -> Deploy from a branch -> `main` / `(root)`.

Nada aqui leva ao sistema (`obras.souztech.com`) — o site é só apresentação.
