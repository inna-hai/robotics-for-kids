(() => {
  const config = window.HAI_TECH_SUMMER_SUBSCRIPTION || {};
  const paymentUrl = config.paymentUrl || '';
  const isReady = /^https?:\/\//.test(paymentUrl);

  document.querySelectorAll('.js-payment-link').forEach((link) => {
    if (isReady) {
      link.href = paymentUrl;
      link.removeAttribute('data-payment-placeholder');
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      return;
    }

    link.addEventListener('click', (event) => {
      event.preventDefault();
      const notice = document.getElementById('payment-coming-soon');
      if (notice) {
        notice.scrollIntoView({ behavior: 'smooth', block: 'center' });
        notice.animate(
          [
            { transform: 'scale(1)', boxShadow: '0 0 0 rgba(249,115,22,0)' },
            { transform: 'scale(1.025)', boxShadow: '0 0 0 8px rgba(249,115,22,.16)' },
            { transform: 'scale(1)', boxShadow: '0 0 0 rgba(249,115,22,0)' }
          ],
          { duration: 620, easing: 'ease-out' }
        );
      }
    });
  });
})();
