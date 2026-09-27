/* Carregado no <head>, antes do primeiro desenho: marca a página para os
   efeitos de entrada. .js-mov: movimento completo; .js-red: o usuário pediu
   movimento reduzido. .js-reveal: o IntersectionObserver existe — só então
   o site.js pode segurar a entrada do que estiver abaixo da tela. Sem JS,
   ou sem o observador, nada fica escondido. */
(function () {
  var raiz = document.documentElement;
  var reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  raiz.classList.add('js', reduzido ? 'js-red' : 'js-mov');
  if ('IntersectionObserver' in window) raiz.classList.add('js-reveal');
})();
