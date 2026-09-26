/**
 * Configuração do site institucional — números, textos e preços que mudam
 * sem precisar mexer no HTML. Preencha os TODOs quando tiver a informação;
 * até lá, o elemento correspondente fica escondido (nunca com placeholder).
 */
window.SOUZ_CONFIG = {
  // DDI + DDD + número, só dígitos
  whatsapp: '5545999301242',
  whatsappMensagem: 'Olá! Quero conhecer o Souz Controle de Obra.',

  email: 'gustavo.souza@souztech.com',
  instagram: '@souz.tech',

  cnpj: '61.797.984/0001-78',

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
