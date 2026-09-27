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
- `mov.js` — carregado no `<head>`: marca a página para os efeitos de entrada antes do primeiro
  desenho (a CSP não permite script embutido).
- `site.js` — links de WhatsApp a partir de `config.js`, nav, menu de gaveta e os efeitos:
  - **gabarito**: a malha isométrica de 30° do Manual (canvas) é locada a partir do centro e
    acende sob o cursor, com as estacas (cruzamentos); sem cursor, a luz passeia devagar. No topo
    e no fechamento.
  - **nível a laser**: toda tela do sistema entra por um corte diagonal de 30° com a linha do
    laser na borda (`.corte`, `--corte` com `@property`); na história com tela fixa, a troca de
    tela é o mesmo corte.
  - o símbolo do topo se constrói (contorno traço a traço, depois as faces), sem girar nem deformar;
  - **cotas** numeradas na tela do topo, ligadas à legenda;
  - **linha da obra**: "Como funciona" fica presa e as etapas correm na horizontal com a
    rolagem, com um cronograma de três fases enchendo junto (lista vertical no celular);
  - manifesto que acende, paralaxe, barra de progresso.
  Nada gira nem inclina em 3D (Manual, prancha 04). Tudo desliga com `prefers-reduced-motion`.
- `img/telas/` — telas reais do sistema em modo escuro, sem a barra lateral (obras fictícias,
  "Casa 07" e a carteira de exemplo), em AVIF/WebP/JPG, 1280 e 1680 px; o login do usuário foi
  tirado da barra do topo. Celular (diário e prestadores) em 390/780/1170. Clicar numa tela abre a
  versão de 1680 px.
- `img/fotos/` — fotos de obra enviadas, tratadas e otimizadas.
- `favicon.svg`, `icon-32.png`, `icon-180.png`, `icon-512.png`, `og.png` — ícones e imagem de
  compartilhamento, gerados a partir do símbolo da marca.
- `sitemap.xml`, `robots.txt` — SEO.
- `conteudo.md` — rascunho da copy, mantido como referência.
- `CNAME` — o domínio.

Para publicar: GitHub Pages -> Deploy from a branch -> `main` / `(root)`.

Nada aqui leva ao sistema (`obras.souztech.com`) — o site é só apresentação.
