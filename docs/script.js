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
    if (!isJacked()) {
      wrapper.style.height = ''; // let the mobile CSS (height:auto) take over cleanly
      return;
    }
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
   Two steps: (1) name/email/shipping address, (2) thank-you + order recap +
   the actual PayPal.me button. A plain PayPal.me link can't tell this page
   when payment succeeds (no return-URL support), so step 2 is shown as soon
   as the buyer submits their details — framed as "here's your order, now
   complete payment," not as a verified "payment confirmed" claim.
   ========================================================================== */
(function () {
  var openBtns = document.querySelectorAll('[data-open-modal]');
  var overlay = document.querySelector('.modal-overlay');
  if (!openBtns.length || !overlay) return;
  var closeBtn = overlay.querySelector('.modal__close');
  var step1 = overlay.querySelector('[data-step="1"]');
  var step2 = overlay.querySelector('[data-step="2"]');
  var form = overlay.querySelector('[data-order-form]');
  var errorEl = overlay.querySelector('[data-order-error]');

  function showStep1() {
    if (!step1 || !step2) return;
    step1.classList.add('is-active');
    step2.classList.remove('is-active');
    if (errorEl) errorEl.classList.remove('is-visible');
  }
  function open() {
    overlay.classList.add('is-open');
    document.body.classList.add('modal-open');
    showStep1(); // always start fresh
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

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nameField = form.querySelector('[data-order-name]');
      var emailField = form.querySelector('[data-order-email]');
      var addressField = form.querySelector('[data-order-address]');
      var name = nameField.value.trim();
      var email = emailField.value.trim();
      var address = addressField.value.trim();

      if (!name || !email || !address) {
        if (errorEl) errorEl.classList.add('is-visible');
        return;
      }
      if (errorEl) errorEl.classList.remove('is-visible');

      // fill the recap shown in step 2
      var recapName = overlay.querySelector('[data-recap-name]');
      var recapAddress = overlay.querySelector('[data-recap-address]');
      var recapEmail = overlay.querySelector('[data-recap-email]');
      if (recapName) recapName.textContent = name;
      if (recapAddress) recapAddress.textContent = address;
      if (recapEmail) recapEmail.textContent = email;

      // 🔌 Sends you the order by opening a pre-filled email in the buyer's own
      // mail app (same no-backend approach used everywhere else on the site).
      // If their mail app doesn't open automatically, the compose window is
      // still sitting there ready — they just need to hit send.
      var openBtn = document.querySelector('[data-open-modal]');
      var pieceTitle = (openBtn && openBtn.dataset.title) || document.title;
      var piecePrice = (openBtn && openBtn.dataset.price) || '';
      var subject = 'New order — ' + pieceTitle;
      var body = 'New order from the website:\n\n' +
                 'Piece: ' + pieceTitle + (piecePrice ? ' (' + piecePrice + ')' : '') + '\n' +
                 'Name: ' + name + '\n' +
                 'Email: ' + email + '\n' +
                 'Shipping address:\n' + address;
      var mailtoUrl = 'mailto:lioba.roggendorf@gmail.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);
      window.location.href = mailtoUrl;

      step1.classList.remove('is-active');
      step2.classList.add('is-active');
    });
  }
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

/* ==========================================================================
   ABOUT PAGE — grid photo cycler
   Six fixed grid cells. For the active colour category, cells light up one
   at a time (not all together) in a random order, hold full for a moment,
   clear in the reverse of that order, then the next files/about/ folder
   begins. Each pass through a folder picks a random subset of its photos
   (up to six) and lights up the cells in a random sequence, so it's never
   the same squares or the same images twice in a row. Categories with
   fewer than 6 photos just use fewer cells for that pass.
   ========================================================================== */
(function () {
  var slots = Array.prototype.slice.call(document.querySelectorAll('.about-photo-slot'));
  if (!slots.length) return;
  var caption = document.querySelector('[data-photo-caption]');

  // 🔌 Real filenames from files/about/ — the full pool for each colour
  // folder (minus a handful of filenames elsewhere in there that looked
  // like saved reference images of other artists' work — Hopper, Richter,
  // Kollwitz, Caillebotte, Rembrandt, Bosch, Cross, Rohlfs, Spilliaert,
  // Abramović, plus a couple of ambiguous attributed-looking ones — rather
  // than your own photography. Everything below is your own shots).
  var categories = [
    { name: 'Black & White', files: [
      '01_Black_and_White/144500178_250062063184374_6465332016512148564_n.jpg',
      '01_Black_and_White/230063635_120085906920052_7288109951353199303_n.jpg',
      '01_Black_and_White/265247282_153507697006480_7868117419849147761_n.jpg',
      '01_Black_and_White/38ad30ec924c4554bd4c741ea236a9af_301536842_457960676226949_3513484977010121366_n.jpg',
      '01_Black_and_White/793ec3bd3762f59cca67aea05c8790b5.jpg',
      '01_Black_and_White/FFu_7c1XwAIkLGN.jpeg',
      '01_Black_and_White/images.jpeg',
      '01_Black_and_White/IMG_20191129_080816.jpg',
      '01_Black_and_White/IMG_20210609_090452.jpg',
      '01_Black_and_White/IMG_20210921_182458.jpg',
      '01_Black_and_White/IMG_20211007_004116.jpg',
      '01_Black_and_White/IMG_20240707_114637.jpg',
      '01_Black_and_White/IMG_20240707_194725.jpg',
      '01_Black_and_White/IMG_5331.JPG',
      '01_Black_and_White/IMG_6018.JPG',
      '01_Black_and_White/landscape-rain-kao-ko-kung-1248-1310-10731011.jpg.webp'
    ]},
    { name: 'Warm Earth', files: [
      '02_Warm_Earth/275635163_329862309167906_1766172622988324282_n.webp',
      '02_Warm_Earth/277911126_726148745425768_7619526445872976090_n.jpg',
      '02_Warm_Earth/Ctumblr_maqyep7R4g1ql3umeo1_1280.jpg',
      '02_Warm_Earth/drawing.anatomy.and.art_20191129_1.png',
      '02_Warm_Earth/FIEifaGXwAIB_jU.jpeg',
      '02_Warm_Earth/FIMaMFXWYAoI5GX.jpeg',
      '02_Warm_Earth/IMG_20190926_194824.jpg',
      '02_Warm_Earth/IMG_20200419_175604.jpg',
      '02_Warm_Earth/IMG_20210608_175422.jpg',
      '02_Warm_Earth/IMG_20210608_175432.jpg',
      '02_Warm_Earth/IMG_20230827_225057.jpg',
      '02_Warm_Earth/IMG_20230831_224144.jpg',
      '02_Warm_Earth/IMG_20240318_162027.jpg',
      '02_Warm_Earth/IMG_20240611_174619.jpg',
      '02_Warm_Earth/IMG_20241227_012551.jpg',
      '02_Warm_Earth/IMG_20250817_151110.jpg',
      '02_Warm_Earth/IMG-20260628-WA0014~2.jpg',
      '02_Warm_Earth/me.jpg',
      '02_Warm_Earth/PXL_20260702_191042569.jpg',
      '02_Warm_Earth/PXL_20260715_054801736.jpg'
    ]},
    { name: 'Golden Hour', files: [
      '03_Golden_Hour/272328646_475066264137527_4067976837318847095_n.jpg',
      '03_Golden_Hour/280962357_1158840424882468_2093167533924611968_n.webp',
      '03_Golden_Hour/70_50_3_2_cropped.jpeg',
      '03_Golden_Hour/IMG_20190424_182023.jpg',
      '03_Golden_Hour/IMG_20210320_173841.jpg',
      '03_Golden_Hour/IMG_20210330_180448.jpg',
      '03_Golden_Hour/IMG_20211009_101622.jpg',
      '03_Golden_Hour/IMG_20230828_201858.jpg',
      '03_Golden_Hour/IMG_20230828_204104.jpg',
      '03_Golden_Hour/PXL_20260711_084932588.jpg',
      '03_Golden_Hour/PXL_20260721_211604309.jpg',
      '03_Golden_Hour/selbstportrait.jpg'
    ]},
    { name: 'Greens', files: [
      '04_Greens/dd5c7-24962.jpg',
      '04_Greens/FLlVzjoVIAEiQY5.jpg',
      '04_Greens/image.png',
      '04_Greens/IMG_20191105_223506.jpg',
      '04_Greens/IMG_20230903_174833.jpg',
      '04_Greens/IMG-20220123-WA0004.jpg',
      '04_Greens/IMG-20220123-WA0006.jpg'
    ]},
    { name: 'Blues', files: [
      '06_Blues/146709734_439747103742004_5348826101348119537_n.jpg',
      '06_Blues/281842164_526304029203489_6425556555671571947_n.jpg',
      '06_Blues/717853025cbab02a88a8fee91d4e4ed3.jpg',
      '06_Blues/7bfa3c8eae35d8f0b7c388f79e6404e2.jpg',
      '06_Blues/daa6f6026a354c4eac4568be06521523_352250076_581715190758470_5485735826110339839_n.jpg',
      '06_Blues/images (1).jpeg',
      '06_Blues/IMG_20200414_161132.jpg',
      '06_Blues/IMG_20210620_123951.jpg',
      '06_Blues/IMG_20210731_121502.jpg',
      '06_Blues/IMG_20210905_121455.jpg',
      '06_Blues/IMG_20250624_070208.jpg',
      '06_Blues/IMG_20250724_184109~2.jpg',
      '06_Blues/IMG-20240706-WA0043~2.jpg',
      '06_Blues/IMG-20260501-WA0031.jpg',
      '06_Blues/PXL_20260701_191348964.jpg'
    ]},
    { name: 'Purples & Pinks', files: [
      '07_Purples_Pinks/2aeab81f76f6898f7825b093f330ee9e.jpg',
      '07_Purples_Pinks/9dbbbd3b2a934c251c3b949bf252e443.jpg',
      '07_Purples_Pinks/IMG_20210522_121830.jpg',
      '07_Purples_Pinks/IMG_20230811_212810.jpg',
      '07_Purples_Pinks/IMG-20241230-WA0048.jpg'
    ]},
    { name: 'Night & Neon', files: [
      '08_Night_Neon/187201004_156137949800397_600356751617423942_n.jpg',
      '08_Night_Neon/711ac333cbe448f15107aad0460b951f.jpg',
      '08_Night_Neon/IMG_20190518_205348.jpg',
      '08_Night_Neon/IMG_20210512_081031.jpg',
      '08_Night_Neon/IMG_20240802_201304.jpg',
      '08_Night_Neon/PXL_20260117_202256388.jpg',
      '08_Night_Neon/PXL_20260523_203838584.jpg'
    ]},
    { name: 'Monochrome', files: [
      '09_Monochrome/187381557_312313900342716_3293118700972903551_n.jpg',
      '09_Monochrome/267274889_449553816571044_6127579007937435255_n.jpg',
      '09_Monochrome/270061145_107910531679892_145830595301327923_n.webp.jpg',
      '09_Monochrome/277950259_702333744281706_2271594439745522709_n.webp',
      '09_Monochrome/7ae6569bc8e3f2bfa5dd41c933cde159.jpg',
      '09_Monochrome/bodybuilders3.jpg',
      '09_Monochrome/e5f7e98146301c4534b38b213c283a18.jpg',
      '09_Monochrome/image(1).png',
      '09_Monochrome/IMG_20190326_232715.jpg',
      '09_Monochrome/IMG_20190715_195531.jpg',
      '09_Monochrome/IMG_20200630_221045.jpg',
      '09_Monochrome/IMG_20200828_175321.jpg',
      '09_Monochrome/IMG_20200921_095058.jpg',
      '09_Monochrome/IMG_20200922_164045.jpg',
      '09_Monochrome/IMG_20200922_164107.jpg',
      '09_Monochrome/IMG_20210522_122118.jpg',
      '09_Monochrome/IMG_20210708_000810.jpg',
      '09_Monochrome/IMG_20210714_131710.jpg',
      '09_Monochrome/IMG_20211007_222624.jpg',
      '09_Monochrome/IMG_20230817_220809.jpg',
      '09_Monochrome/Screenshot_2018-08-08-16-45-18.png',
      '09_Monochrome/Screenshot_20190203-225746.png'
    ]},
    { name: 'Colourful', files: [
      '10_Colourful/IMG_20210725_000135.jpg',
      '10_Colourful/original_e4111742-d2bb-4276-bf93-0627c416b8ed_IMG_20230319_180609.jpg',
      '10_Colourful/PXL_20260710_150727976.MP.jpg'
    ]}
  ];

  var BASE = 'files/about/';
  var FILL_STEP = 450;   // ms between each cell lighting up
  var HOLD_FULL = 1700;  // ms the full grid stays lit before clearing
  var CLEAR_STEP = 380;  // ms between each cell clearing
  var PAUSE = 550;       // ms of empty grid before the next folder starts
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var timers = [];

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }
  function after(ms, fn) { timers.push(setTimeout(fn, ms)); }

  // Fisher–Yates shuffle, returns a new shuffled copy
  function shuffled(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function runCategory(catIndex, onDone) {
    var cat = categories[catIndex];
    var chosenFiles = shuffled(cat.files).slice(0, slots.length); // random subset, up to 6
    var n = chosenFiles.length;
    var slotOrder = shuffled(slots.map(function (_, i) { return i; })); // random cell order

    slots.forEach(function (slot) {
      slot.classList.remove('is-visible');
      slot.style.visibility = 'hidden';
    });

    for (var k = 0; k < n; k++) {
      var slotIdx = slotOrder[k];
      var img = slots[slotIdx].querySelector('img');
      img.src = BASE + chosenFiles[k];
      img.alt = cat.name + ' reference photo';
      slots[slotIdx].style.visibility = 'visible';
    }

    if (caption) {
      caption.textContent = cat.name;
      caption.classList.add('is-visible');
    }

    // fill, one cell at a time, in the random order chosen for this pass
    for (var k = 0; k < n; k++) {
      (function (slotIdx, delayIdx) {
        after(delayIdx * FILL_STEP, function () { slots[slotIdx].classList.add('is-visible'); });
      })(slotOrder[k], k);
    }

    var fillDuration = (n - 1) * FILL_STEP;
    after(fillDuration + HOLD_FULL, function () {
      // clear in the reverse of that same random order
      for (var k = 0; k < n; k++) {
        (function (slotIdx, delayIdx) {
          after(delayIdx * CLEAR_STEP, function () { slots[slotIdx].classList.remove('is-visible'); });
        })(slotOrder[n - 1 - k], k);
      }
      var clearDuration = (n - 1) * CLEAR_STEP;
      after(clearDuration + 150, function () {
        if (caption) caption.classList.remove('is-visible');
        after(PAUSE, onDone);
      });
    });
  }

  function loop(idx) {
    runCategory(idx, function () { loop((idx + 1) % categories.length); });
  }

  if (reduced) {
    // static fallback: light up a random subset of the first category once, no cycling
    var first = categories[0];
    var picks = shuffled(first.files).slice(0, slots.length);
    var order = shuffled(slots.map(function (_, i) { return i; }));
    slots.forEach(function (slot) { slot.style.visibility = 'hidden'; });
    picks.forEach(function (file, k) {
      var slotIdx = order[k];
      var img = slots[slotIdx].querySelector('img');
      img.src = BASE + file;
      img.alt = first.name + ' reference photo';
      slots[slotIdx].style.visibility = 'visible';
      slots[slotIdx].classList.add('is-visible');
    });
    if (caption) { caption.textContent = first.name; caption.classList.add('is-visible'); }
  } else {
    loop(0);
  }
})();

/* ==========================================================================
   ABOUT PAGE — studio photo reveal
   As the visitor scrolls through the tall #studio-reveal wrapper, the white
   overlay fades out (1 -> 0), so the studio photo behind it gradually
   emerges. By the end of the section's scroll distance the photo is fully
   visible with nothing over it.
   ========================================================================== */
(function () {
  var wrapper = document.getElementById('studio-reveal');
  if (!wrapper) return;
  var overlay = wrapper.querySelector('.studio-reveal__overlay');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return; // CSS already sets the overlay to opacity:0 in this case

  function update() {
    var rect = wrapper.getBoundingClientRect();
    var scrollableDist = wrapper.offsetHeight - window.innerHeight;
    var progress = scrollableDist > 0 ? Math.min(Math.max(-rect.top / scrollableDist, 0), 1) : 0;
    overlay.style.opacity = String(1 - progress);
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
})();
