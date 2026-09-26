/**
 * Configuração do site institucional — números, textos e preços que mudam
 * sem precisar mexer no HTML. Preencha os TODOs quando tiver a informação;
 * até lá, o elemento correspondente fica escondido (nunca com placeholder).
 */
window.SOUZ_CONFIG = {
  // TODO: número real, com DDI + DDD, só dígitos. Ex.: '5562988887777'
  whatsapp: '',
  whatsappMensagem: 'Olá! Quero conhecer o Souz Controle de Obra.',

  email: 'gustavo.souza@souztech.com',
  instagram: '@souz.tech',

  // TODO: CNPJ da Souz Tech
  cnpj: '',

  // Preencha com uma string (ex.: '197') para mostrar "a partir de R$ 197/mês".
  // null mantém "Sob consulta".
  precos: {
    inicial: null,
    carteira: null,
    multiplas: null,
  },

  // [{ texto, nome, cargo }] — lista vazia não renderiza a seção.
  depoimentos: [],
};
