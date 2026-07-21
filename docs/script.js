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



   /* ==========================================================================
      Originals grid — same scroll-driven feel as the homepage gallery above,
      just dialed way back: no 3D tilt, small scale/opacity drift only. Only
      runs on pages that actually have an originals grid (originals.html).
      ========================================================================== */
   (function () {
     var items = document.querySelectorAll(".originals__item");
     if (!items.length) return;

     function updateOriginalsGrid() {
       var center = window.innerHeight / 2;

       items.forEach(function (item) {
         var rect = item.getBoundingClientRect();
         var itemCenter = rect.top + rect.height / 2;
         var distance = itemCenter - center;
         var strength = Math.min(Math.abs(distance) / window.innerHeight, 1);

         var scale = 1 - strength * 0.06;          // was 0.25 on the homepage gallery
         var translateY = strength * 10 * Math.sign(distance || 1); // was translateZ ±250px

         item.style.transform = 'translateY(' + translateY.toFixed(2) + 'px) scale(' + scale.toFixed(3) + ')';
         item.style.opacity = String(1 - strength * 0.12);
       });
     }

     window.addEventListener('scroll', updateOriginalsGrid, { passive: true });
     window.addEventListener('resize', updateOriginalsGrid);
     updateOriginalsGrid();
   })();

/* ==========================================================================
   PRODUCT PAGE — horizontal scroll gallery (Lusion-style pinned section)
   ========================================================================== */
(function () {
  var wrapper = document.querySelector('.hscroll');
  if (!wrapper) return;
  var sticky = wrapper.querySelector('.hscroll__sticky');
  var track = wrapper.querySelector('.hscroll__track');
  var frames = wrapper.querySelectorAll('.hscroll__frame');
  var counter = wrapper.querySelector('.hscroll__counter');

  function isJacked() {
    return getComputedStyle(sticky).position === 'sticky';
  }

  function setWrapperHeight() {
    var vh = window.innerHeight;
    wrapper.style.height = Math.max(frames.length * vh * 0.9, vh * 2) + 'px';
  }

  function update() {
    if (!isJacked()) return;
    var rect = wrapper.getBoundingClientRect();
    var scrollableDist = wrapper.offsetHeight - window.innerHeight;
    var progress = scrollableDist > 0 ? Math.min(Math.max(-rect.top / scrollableDist, 0), 1) : 0;
    var maxTranslate = Math.max(track.scrollWidth - sticky.clientWidth, 0);
    track.style.transform = 'translateX(-' + (progress * maxTranslate).toFixed(1) + 'px)';

    if (counter && frames.length) {
      var frameSpan = 1 / frames.length;
      var index = Math.min(Math.floor(progress / frameSpan), frames.length - 1);
      var label = String(index + 1).padStart(2, '0') + ' — ' + String(frames.length).padStart(2, '0');
      if (counter.textContent !== label) counter.textContent = label;
    }
  }

  setWrapperHeight();
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', function () { setWrapperHeight(); update(); });
})();

/* ==========================================================================
   PRODUCT PAGE — purchase modal ("Inquire about original")
   ========================================================================== */
(function () {
  var openBtns = document.querySelectorAll('[data-open-modal]');
  var overlay = document.querySelector('.modal-overlay');
  if (!openBtns.length || !overlay) return;
  var closeBtn = overlay.querySelector('.modal__close');

  function open() {
    overlay.classList.add('is-open');
    document.body.classList.add('modal-open');
  }
  function close() {
    overlay.classList.remove('is-open');
    document.body.classList.remove('modal-open');
  }

  openBtns.forEach(function (btn) { btn.addEventListener('click', open); });
  if (closeBtn) closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
})();

/* ==========================================================================
   PRODUCT PAGE — add to cart (localStorage) + small non-blocking toast
   🔌 Real, working client-side cart (persists per browser/device). There's
   no cart *page* yet — this just stores items and confirms the add.
   ========================================================================== */
(function () {
  var addBtns = document.querySelectorAll('[data-add-to-cart]');
  var toast = document.querySelector('.cart-toast');
  if (!addBtns.length) return;
  var CART_KEY = 'studio-cart';

  function addToCart(item) {
    var cart = [];
    try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { cart = []; }
    if (!cart.some(function (c) { return c.id === item.id; })) {
      cart.push(item);
      try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* ignore */ }
    }
    return cart.length;
  }

  addBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      addToCart({
        id: btn.dataset.id,
        title: btn.dataset.title,
        price: btn.dataset.price,
        image: btn.dataset.image
      });
      if (toast) toast.classList.add('is-open');
    });
  });

  if (toast) {
    var closeToast = toast.querySelector('.cart-toast__close');
    if (closeToast) {
      closeToast.addEventListener('click', function () {
        toast.classList.remove('is-open');
      });
    }
  }
})();

/* ==========================================================================
   PRODUCT PAGE — share button
   ========================================================================== */
(function () {
  var shareBtn = document.querySelector('[data-share-btn]');
  var popover = document.querySelector('.share-popover');
  if (!shareBtn) return;

  var pageUrl = window.location.href;
  var pageTitle = document.title;

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: pageTitle, url: pageUrl });
        return true;
      } catch (e) {
        return true;
      }
    }
    return false;
  }

  shareBtn.addEventListener('click', async function (e) {
    e.stopPropagation();
    var shared = await nativeShare();
    if (!shared && popover) popover.classList.toggle('is-open');
  });

  if (popover) {
    var copyLink = popover.querySelector('[data-copy-link]');
    if (copyLink) {
      copyLink.addEventListener('click', function () {
        navigator.clipboard.writeText(pageUrl).then(function () {
          copyLink.textContent = 'Link copied ✓';
          setTimeout(function () {
            copyLink.innerHTML = '<span aria-hidden="true">🔗</span> Copy link';
          }, 1800);
        });
      });
    }
    document.addEventListener('click', function (e) {
      if (!popover.contains(e.target) && e.target !== shareBtn) {
        popover.classList.remove('is-open');
      }
    });
  }
})();

/* ==========================================================================
   PRINTS PAGE — notify-me form (name + email)
   🔌 Same placeholder pattern as the main newsletter form — swap in your
   email provider's real submit logic once you have one.
   ========================================================================== */
(function () {
  var form = document.getElementById('prints-notify-form');
  var feedback = document.getElementById('prints-notify-feedback');
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
