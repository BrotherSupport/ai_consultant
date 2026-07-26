/* AI consultant — mobile navigation + PWA registration
   Works with the shared header markup (.nav > .brand + .navlinks) and the
   standalone result_ai.html header (header > .navlinks). Pure progressive
   enhancement: if JS is off, desktop links still render. */
(function () {
  function initNav() {
    var navlinks = document.querySelector('header .navlinks');
    if (!navlinks || navlinks.dataset.mobileReady) return;
    navlinks.dataset.mobileReady = '1';

    // Build hamburger toggle
    var toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-label', '開啟選單');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span></span><span></span><span></span>';

    // Place it in the same flex row as the links so it sits top-right on mobile
    navlinks.parentNode.insertBefore(toggle, navlinks);

    function setOpen(open) {
      navlinks.classList.toggle('open', open);
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
    }

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(!navlinks.classList.contains('open'));
    });

    // Close when a link is tapped
    navlinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    /* Dropdown groups. CSS already opens them on hover for pointer users;
       this adds click + keyboard support and keeps aria-expanded honest.
       On mobile the buttons are pointer-events:none and the menus render
       inline, so none of this runs there. */
    var groups = [].slice.call(navlinks.querySelectorAll('.navgroup'));

    function closeGroups(except) {
      groups.forEach(function (g) {
        if (g === except) return;
        g.classList.remove('open');
        var b = g.querySelector('.navgroup-btn');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
    }

    groups.forEach(function (g) {
      var btn = g.querySelector('.navgroup-btn');
      if (!btn) return;
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var willOpen = !g.classList.contains('open');
        closeGroups(g);
        g.classList.toggle('open', willOpen);
        btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });
      // Pointer users get hover from CSS; keep the aria state in sync.
      g.addEventListener('mouseleave', function () {
        g.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click / Escape
    document.addEventListener('click', function (e) {
      if (!navlinks.contains(e.target)) closeGroups(null);
      if (!navlinks.classList.contains('open')) return;
      if (!navlinks.contains(e.target) && e.target !== toggle) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { setOpen(false); closeGroups(null); }
    });

    // Reset when resizing back to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) setOpen(false);
      closeGroups(null);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }

  // Register the service worker (installable + offline).
  // Resolve sw.js relative to THIS script so it works from subdirectories too.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      var me = document.querySelector('script[src$="mobile-nav.js"]');
      var swUrl = me ? new URL('sw.js', me.src).href : 'sw.js';
      navigator.serviceWorker.register(swUrl).catch(function () {/* no-op */});
    });
  }
})();
