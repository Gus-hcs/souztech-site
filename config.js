/**
 * Configuração do site institucional — números, textos e preços que mudam
 * sem precisar mexer no HTML. Enquanto um valor estiver vazio, o elemento
 * correspondente fica no texto padrão (nunca com placeholder).
 */

/* ======================= PREENCHA AQUI =======================
   Preços (só o número, ex.: '197' → "a partir de R$ 197/mês").
   Vazio mantém "Sob consulta". Múltiplas frentes é sempre sob consulta. */
var PRECO_INICIAL = '';
var PRECO_CARTEIRA = '';
/* Implantação assistida: número (ex.: '990' → "Implantação assistida:
   R$ 990") ou um texto curto. Vazio: a linha não aparece. */
var IMPLANTACAO = '';

/* Endereço que recebe os formulários (relatório de exemplo e "Conte sobre
   sua carteira"): Formspree (https://formspree.io/f/…), Web3Forms
   (https://api.web3forms.com/submit) ou uma Edge Function do Supabase.
   Vazio: os formulários abrem o WhatsApp com a mensagem pronta.
   ATENÇÃO: antes de preencher, atualize a Política de Privacidade — hoje
   ela diz que o site não tem formulário. Outro domínio, fora dos três
   acima, precisa entrar no connect-src da CSP em index.html. */
var FORM_ENDPOINT = '';
/* Campos fixos que o serviço exige no corpo (ex.: Web3Forms:
   { access_key: '…' }). */
var FORM_CAMPOS_EXTRAS = {};

/* Medição de cliques (sem cookies nem dados pessoais): usa Plausible,
   gtag ou Umami se estiverem na página. Desligada até você ligar — e,
   antes de ligar, a Política de Privacidade precisa mencionar. */
var ANALYTICS_LIGADO = false;
/* ============================================================= */

window.SOUZ_CONFIG = {
  // DDI + DDD + número, só dígitos
  whatsapp: '5545999301242',
  whatsappMensagem: 'Olá! Quero conhecer o Souz Controle de Obra.',

  email: 'gustavo.souza@souztech.com',
  instagram: '@souz.tech',

  cnpj: '61.797.984/0001-78',

  precos: {
    inicial: PRECO_INICIAL,
    carteira: PRECO_CARTEIRA,
  },
  implantacao: IMPLANTACAO,

  formEndpoint: FORM_ENDPOINT,
  formCamposExtras: FORM_CAMPOS_EXTRAS,
  analytics: ANALYTICS_LIGADO,

  /* Vídeo curto da tela (60 a 90 s): ponha o arquivo e a imagem de capa em
     video/ e escreva os caminhos aqui (ex.: 'video/souz-demonstracao.mp4' e
     'video/souz-demonstracao.jpg'). Vazio, ou arquivo ausente: o espaço do
     vídeo não aparece. */
  video: { src: '', poster: '' },
};
