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
    'background:#fff;color:#1a1a1a;border:1px solid #e8e6e1;border-radius:14px;padding:20px 22px;' +
    'box-shadow:0 10px 40px rgba(0,0,0,.14);font-size:.92rem;line-height:1.5;display:none}' +
    '.cb.open{display:block}' +
    '.cb p{margin:0 0 14px;color:#4a4a4a}' +
    '.cb a{text-decoration:underline}' +
    '.cb-row{display:flex;gap:10px;flex-wrap:wrap}' +
    '.cb button{flex:1 1 140px;font:inherit;font-weight:600;border-radius:24px;padding:11px 18px;' +
    'cursor:pointer;background:#1a1a1a;color:#fff;border:1px solid #1a1a1a}' +
    '.cb button:hover{opacity:.9}';

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
      '<p>Käytämme Google Ads -evästeitä mainonnan mittaamiseen ja kohdentamiseen vain, jos hyväksyt ne. ' +
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
})();
