/* Carregado no <head>, antes do primeiro desenho: marca a página para os
   efeitos de entrada (corte a laser, símbolo que se constrói). Com
   movimento reduzido, ou sem JS, nada fica escondido esperando efeito. */
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('js-mov');
}
