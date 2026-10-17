/* Evästesuostumus + Google Ads (AW-18506323049).
   Google-tagi ladataan vasta, kun kävijä hyväksyy evästeet.
   Consent Mode v2: oletus "denied", päivitys "granted" vasta hyväksynnän jälkeen. */
(function () {
  var KEY = 'hj_consent';
  var TAG = 'AW-18506323049';
  var MAX_AGE = 365 * 24 * 60 * 60 * 1000; // suostumus kysytään uudelleen 12 kk:n välein
  var loaded = false;

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied'
  });
  gtag('set', 'ads_data_redaction', true);

  function read() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY));
      if (!c || (c.v !== 'granted' && c.v !== 'denied')) return null;
      if (Date.now() - c.t > MAX_AGE) return null;
      return c.v;
    } catch (e) { return null; }
  }
  function save(v) {
    try { localStorage.setItem(KEY, JSON.stringify({ v: v, t: Date.now() })); } catch (e) {}
  }

  function loadTag() {
    if (loaded) return;
    loaded = true;
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted'
    });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + TAG;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', TAG);
  }

  function clearGoogleCookies() {
    var host = location.hostname;
    var domains = ['', host, '.' + host];
    var parts = host.split('.');
    if (parts.length > 2) domains.push('.' + parts.slice(-2).join('.'));
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (/^(_gcl_|_gac_|FPGCL|FPGSID|FPAU)/.test(name)) {
        domains.forEach(function (d) {
          document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
  }

  function accept() { save('granted'); hide(); loadTag(); }
  function reject() {
    save('denied');
    hide();
    if (loaded) {
      gtag('consent', 'update', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }
    clearGoogleCookies();
  }

  var css =
    '.cb{position:fixed;left:16px;right:16px;bottom:16px;z-index:200;max-width:560px;margin:0 auto;' +
    'background:#fff;color:#241f22;border-radius:14px;padding:20px 22px;' +
    'box-shadow:0 12px 40px rgba(0,0,0,.12);font-size:.9rem;line-height:1.5;display:none}' +
    '.cb.open{display:block}' +
    '.cb p{margin:0 0 14px;color:#665d62}' +
    '.cb a{text-decoration:underline}' +
    '.cb-row{display:flex;gap:10px;flex-wrap:wrap}' +
    '.cb button{flex:1 1 140px;font:inherit;font-weight:700;border-radius:8px;padding:12px 18px;' +
    'cursor:pointer;background:#7c2336;color:#fff;border:0;box-shadow:0 3px 0 #561522}' +
    '.cb button:hover{opacity:.9}' +
    '@media(max-width:560px){.cb{left:8px;right:8px;top:8px;bottom:auto;padding:12px 14px;font-size:.8rem}' +
    '.cb p{margin-bottom:10px}.cb button{flex-basis:100px;padding:9px 12px}}';

  var banner;
  function build() {
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
    banner = document.createElement('div');
    banner.className = 'cb';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Evästeasetukset');
    banner.innerHTML =
      '<p>Sivusto käyttää Google Ads -evästeitä mainonnan mittaamiseen ja kohdentamiseen vain, jos hyväksyt ne. ' +
      'Sivusto toimii ilman niitä. Lisätietoja <a href="tietosuoja.html">tietosuojaselosteessa</a>.</p>' +
      '<div class="cb-row"><button type="button" data-c="deny">Hylkää</button>' +
      '<button type="button" data-c="ok">Hyväksy</button></div>';
    banner.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.getAttribute('data-c') === 'ok') accept(); else reject();
    });
    document.body.appendChild(banner);
    document.querySelectorAll('[data-consent-open]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); show(); });
    });
  }
  function show() { if (banner) banner.classList.add('open'); }
  function hide() { if (banner) banner.classList.remove('open'); }

  var choice = read();
  if (choice === 'granted') loadTag();

  function init() { build(); if (!choice) show(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.hjConsent = { open: show };

  /* Konversiot. Lomakkeen konversio mitataan Google Adsissa kiitos.html-sivun URL:sta.
     Puhelu-, WhatsApp- ja sähköpostiklikkauksille lisää Google Adsin konversiotunniste
     (send_to-arvon kauttaviivan jälkeinen osa) alle. Tyhjä tunniste = vain tapahtuma.
     Mitään ei lähetetä ennen suostumusta, koska tagi ladataan vasta hyväksynnän jälkeen. */
  var LABELS = {
    puhelu: '',
    whatsapp: '',
    sahkoposti: '',
    lomake: ''
  };
  function track(name) {
    if (!loaded) return;
    gtag('event', 'hj_' + name);
    if (LABELS[name]) gtag('event', 'conversion', { send_to: TAG + '/' + LABELS[name] });
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-track]');
    if (el) track(el.getAttribute('data-track'));
  });
  window.hjTrack = track;
})();
