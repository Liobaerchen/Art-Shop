/* ==========================================================================
   Language switch (EN / 日本語)
   ========================================================================== */
(function () {
  var html = document.documentElement;
  var buttons = document.querySelectorAll('[data-lang-btn]');
  var STORAGE_KEY = 'site-lang';

  function setLang(lang) {
    html.setAttribute('data-lang', lang);
    buttons.forEach(function (btn) {
      var isActive = btn.getAttribute('data-lang-btn') === lang;
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }

    // Swap the newsletter email placeholder to match the active language
    var emailInput = document.getElementById('newsletter-email');
    if (emailInput) {
      var key = lang === 'ja' ? 'placeholderJa' : 'placeholderEn';
      emailInput.setAttribute('placeholder', emailInput.dataset[key] || emailInput.placeholder);
    }
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setLang(btn.getAttribute('data-lang-btn'));
    });
  });

  // Restore saved preference on load
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setLang(saved);
  } catch (e) { /* ignore */ }
})();

/* ==========================================================================
   Mobile menu
   ========================================================================== */
(function () {
  var toggle = document.getElementById('menu-toggle');
  var menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  function closeMenu() {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  toggle.addEventListener('click', function () {
    var isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  });

  menu.querySelectorAll('[data-close-menu]').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });
})();

/* ==========================================================================
   Newsletter form
   🔌 Replace this handler with your email provider's own submit logic
   (Mailchimp / ConvertKit / Etsy / Flodesk all provide a form action + a
   snippet like this — swap this whole block out once you have one).
   ========================================================================== */
(function () {
  var form = document.getElementById('newsletter-form');
  var feedback = document.getElementById('newsletter-feedback');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var lang = document.documentElement.getAttribute('data-lang');
    feedback.textContent = lang === 'ja'
      ? 'ありがとうございます！登録が完了しました。'
      : "Thanks — you're on the list.";
    form.reset();
  });
})();

/* ==========================================================================
   Footer year + back to top
   ========================================================================== */
(function () {
  var year = document.getElementById('footer-year');
  if (year) year.textContent = new Date().getFullYear();

  var backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();


/* ==========================================================================
   Gallery stuff
   ========================================================================== */
   const galleryItems = document.querySelectorAll(".gallery__item");


   function updateSphereGallery(){

       const center = window.innerHeight / 2;


       galleryItems.forEach(item => {

           const rect = item.getBoundingClientRect();

           const itemCenter = rect.top + rect.height / 2;

           const distance = itemCenter - center;


           const strength = Math.min(
               Math.abs(distance) / window.innerHeight,
               1
           );


           const scale = 1 - strength * 0.25;

          const rotateX = distance * -0.02;

          const translateZ = -strength * 250;

          item.style.transform = `
              translateZ(${translateZ}px)
              scale(${scale})
              rotateX(${rotateX}deg)
          `;

       });

   }


   window.addEventListener(
       "scroll",
       updateSphereGallery,
       {passive:true}
   );

   window.addEventListener(
       "resize",
       updateSphereGallery
   );


   updateSphereGallery();
