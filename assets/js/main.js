/* CoreLift — site behaviour */
(function () {
  'use strict';

  var d = document;
  d.documentElement.classList.add('js');

  /* ---------- sticky header shadow ---------- */
  var header = d.querySelector('.header');
  var toTop = d.querySelector('.totop');
  var car = d.querySelector('.shaft__car');

  function onScroll() {
    var y = window.scrollY || d.documentElement.scrollTop;
    if (header) header.classList.toggle('is-stuck', y > 70);
    if (toTop) toTop.classList.toggle('is-on', y > 620);
    /* مؤشر المصعد: يتحرك على المسطرة الجانبية بحسب موضع القراءة */
    if (car) {
      var max = d.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0;
      car.style.top = (p * (window.innerHeight - 74)) + 'px';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- desktop dropdowns ---------- */
  var items = Array.prototype.slice.call(d.querySelectorAll('.nav__item--has-menu'));
  items.forEach(function (item) {
    var link = item.querySelector('.nav__link');
    var close = function () { item.classList.remove('is-open'); if (link) link.setAttribute('aria-expanded', 'false'); };
    var open = function () {
      items.forEach(function (o) { if (o !== item) o.classList.remove('is-open'); });
      item.classList.add('is-open');
      if (link) link.setAttribute('aria-expanded', 'true');
    };
    item.addEventListener('mouseenter', open);
    item.addEventListener('mouseleave', close);
    if (link) {
      link.addEventListener('click', function (e) {
        if (window.matchMedia('(hover: none)').matches) {
          e.preventDefault();
          item.classList.contains('is-open') ? close() : open();
        }
      });
    }
  });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') items.forEach(function (o) { o.classList.remove('is-open'); });
  });

  /* ---------- mobile drawer ---------- */
  var drawer = d.getElementById('drawer');
  function setDrawer(on) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', on);
    drawer.setAttribute('aria-hidden', on ? 'false' : 'true');
    d.body.style.overflow = on ? 'hidden' : '';
  }
  d.querySelectorAll('[data-drawer-open]').forEach(function (b) {
    b.addEventListener('click', function () { setDrawer(true); });
  });
  d.querySelectorAll('[data-drawer-close]').forEach(function (b) {
    b.addEventListener('click', function () { setDrawer(false); });
  });
  if (drawer) {
    drawer.addEventListener('click', function (e) { if (e.target === drawer) setDrawer(false); });
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setDrawer(false); });
    });
  }
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });

  /* ---------- accordion ---------- */
  d.querySelectorAll('.acc__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.acc__item');
      var panel = item.querySelector('.acc__panel');
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.style.maxHeight = open ? panel.scrollHeight + 'px' : 0;
    });
  });

  /* ---------- scroll reveal ----------
     يعتمد على الموضع لا على IntersectionObserver، حتى لا يبقى أي محتوى
     مخفياً إذا لم تُطلق المراقبة في متصفح أو سياق معيّن. */
  var rv = Array.prototype.slice.call(d.querySelectorAll('.rv'));
  rv.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + 'ms'; });

  function revealCheck() {
    var limit = window.innerHeight * 0.94;
    for (var i = rv.length - 1; i >= 0; i--) {
      var el = rv[i];
      if (el.getBoundingClientRect().top < limit) {
        el.classList.add('is-in');
        rv.splice(i, 1);
      }
    }
  }
  var lastReveal = 0;
  function onReveal() {
    if (!rv.length) return;
    var now = Date.now();
    if (now - lastReveal < 80) return;
    lastReveal = now;
    revealCheck();
  }
  window.addEventListener('scroll', onReveal, { passive: true });
  window.addEventListener('resize', onReveal);
  window.addEventListener('load', function () { revealCheck(); });
  revealCheck();

  /* ---------- animated counters ---------- */
  var counters = d.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        co.unobserve(el);
        var target = parseFloat(el.dataset.count);
        var suffix = el.dataset.suffix || '';
        var dec = (el.dataset.dec | 0);
        var t0 = null, dur = 1500;
        function tick(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(dec) + (p === 1 ? suffix : '');
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* ---------- quote / contact form ---------- */
  d.querySelectorAll('form[data-mock]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var ok = form.querySelector('.formok');
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'جارٍ الإرسال…'; }
      setTimeout(function () {
        if (ok) ok.classList.add('is-on');
        form.reset();
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; }
        if (ok) ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 700);
    });
  });

  /* ---------- year ---------- */
  d.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
