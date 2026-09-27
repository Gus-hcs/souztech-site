# souztech.com

Site institucional do Souz Controle de Obra. Página estática, sem framework nem passo de
build, servida pelo GitHub Pages — segue o [Manual da Marca Souz](../souz-controle-obra) v1.1: moldura em Souz Preto
(topo, capa, manifesto, chamada final e rodapé) e conteúdo em chumbo neutro; a seção de relatórios
usa a paleta clara do manual. Vermelho e âmbar não aparecem no site.

- `index.html` — a página.
- `privacidade.html` — política de privacidade (LGPD).
- `404.html` — página de erro do GitHub Pages.
- `config.js` — no topo, o que você preenche: `PRECO_INICIAL`, `PRECO_CARTEIRA` (vazios =
  "Sob consulta"), `IMPLANTACAO`, `FORM_ENDPOINT` (vazio = os formulários abrem o WhatsApp),
  `FORM_CAMPOS_EXTRAS` (ex.: a chave do Web3Forms) e `ANALYTICS_LIGADO` (medição de cliques,
  desligada). Embaixo, WhatsApp, e-mail, CNPJ e o vídeo (`video.src`/`poster`, vazio = não
  aparece). **Antes de preencher `FORM_ENDPOINT` ou ligar a medição, atualize a Política de
  Privacidade** — hoje ela diz que o site não tem formulário nem analytics.
- `depoimentos.json` — depoimentos reais; só entra no site o item com `"publicar": true`. Sem
  nenhum, a faixa de prova de origem fica no lugar.
- `video/` — o vídeo curto da tela e a capa (veja `video/LEIA-ME.txt`).
- `mov.js` — carregado no `<head>`: marca a página (`.js-mov`, ou `.js-red` com movimento
  reduzido) antes do primeiro desenho; sem JS, nada fica escondido (a CSP não permite script
  embutido).
- `site.js` — links de WhatsApp a partir de `config.js`, nav (sólida depois de 40px, link da
  seção ativa), gaveta, CTA fixo no celular (depois do topo, some no fechamento; o botão de chat
  sobe 72px) e os efeitos:
  - **gabarito**: a malha isométrica de 30° (canvas) é locada a partir do centro e acende sob o
    cursor; começa depois do load, ocioso, para não disputar a carga. No topo e no fechamento;
  - **topo**: print de até 1180px inclinado 6° que se desfaz com a rolagem, halo ciano, cubos
    que se encaixam na diagonal, destaque de "no azul?" que se desenha, cotas que pulsam 1 → 4;
  - **reveal** em cascata (16px, 500 ms, 80 ms entre irmãos) que nunca deixa caixa vazia:
    varredura a cada rolagem e, em rolagem rápida, sem transição;
  - cards do problema com borda em degradê e brilho que segue o cursor; as planilhas riscadas
    convergem para o botão, que acende;
  - história com tela fixa (crossfade de 300 ms); **linha da obra** presa na horizontal com o
    cronograma de três fases (lista vertical no celular e com movimento reduzido);
  - planos com o do meio em destaque ("Mais escolhido"), checks que se traçam e brilho no botão;
  - cubo em contorno como marca d'água (parallax 0,15×), manifesto que acende, barra de progresso.
  Só transform e opacity nos efeitos de CSS; tudo reduz com `prefers-reduced-motion`.
- `fonts/` — Archivo (variável, 400–800) e IBM Plex Mono 400/500, subconjunto latino, servidas
  pelo próprio site (licença OFL) — sem a folha do Google bloqueando o primeiro desenho.
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
