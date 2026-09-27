/* Carregado no <head>, antes do primeiro desenho: marca a página para os
   efeitos de entrada. .js-mov: movimento completo; .js-red: o usuário pediu
   movimento reduzido (entrada vira fade curto). Sem JS, nada fica escondido. */
(function () {
  var raiz = document.documentElement;
  var reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  raiz.classList.add('js', reduzido ? 'js-red' : 'js-mov');
})();
