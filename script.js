/* ═══════════════════════════════════════════════════════════════
   B-MAX SITES — script.js
   • Navbar scroll behavior
   • Mobile menu toggle
   • Scroll reveal (IntersectionObserver)
   • Parallax na seção de contato
   • Neve animada (Canvas particle system)
   • Stagger nos cards de serviço
═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ──────────────────────────────────────────────────────────
     1. NAVBAR — scroll state + mobile menu
  ────────────────────────────────────────────────────────── */
  const navbar    = document.getElementById('navbar');
  const navBurger = document.getElementById('navBurger');
  const navLinks  = document.getElementById('navLinks');

  const updateNavbar = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  // Mobile burger
  navBurger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const isOpen = navLinks.classList.contains('open');
    navBurger.setAttribute('aria-expanded', isOpen);
    // Animate burger → ×
    const spans = navBurger.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // Close menu on nav link click
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navBurger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });

  /* ──────────────────────────────────────────────────────────
     2. SCROLL REVEAL — IntersectionObserver
  ────────────────────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('[data-reveal]');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ──────────────────────────────────────────────────────────
     3. SERVICE CARDS — stagger reveal
  ────────────────────────────────────────────────────────── */
  const serviceCards = document.querySelectorAll('[data-service]');

  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const idx = Array.from(serviceCards).indexOf(entry.target);
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, idx * 90);
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  serviceCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity .55s ease, transform .55s ease, border-color .22s ease, box-shadow .22s ease';
    cardObserver.observe(card);
  });

  /* ──────────────────────────────────────────────────────────
     4. PARALLAX — seção contato (montanha + overlay)
  ────────────────────────────────────────────────────────── */
  const mountainImg = document.getElementById('mountainImg');

  const applyParallax = () => {
    if (!mountainImg) return;
    const section  = document.getElementById('contato');
    if (!section) return;
    const rect     = section.getBoundingClientRect();
    const winH     = window.innerHeight;
    // Entra em ação quando a seção está na viewport
    if (rect.bottom < 0 || rect.top > winH) return;
    const progress = (winH - rect.top) / (winH + rect.height); // 0→1
    const offset   = (progress - 0.5) * 80; // ±40px
    mountainImg.style.transform = `translateY(${offset}px) scale(1.08)`;
  };

  window.addEventListener('scroll', applyParallax, { passive: true });
  applyParallax();

  /* ──────────────────────────────────────────────────────────
     5. NEVE — Canvas particle system (seção contato)
  ────────────────────────────────────────────────────────── */
  const canvas = document.getElementById('snowCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');

    // Resize canvas to match section
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Reduz carga em mobile
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const FLAKE_COUNT = isMobile ? 60 : 140;

    // Flake class
    class Snowflake {
      constructor(x, y) {
        this.reset(x, y);
      }
      reset(x, y) {
        this.x    = x  !== undefined ? x  : Math.random() * canvas.width;
        this.y    = y  !== undefined ? y  : Math.random() * canvas.height;
        this.r    = Math.random() * 2.5 + .5;
        this.speed = Math.random() * .8 + .3;
        this.wind  = (Math.random() - 0.5) * .35;
        this.alpha = Math.random() * .55 + .2;
        this.wobble      = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * .015 + .005;
      }
      update() {
        this.wobble += this.wobbleSpeed;
        this.x += this.wind + Math.sin(this.wobble) * .3;
        this.y += this.speed;
        if (this.y > canvas.height + 5) this.reset(Math.random() * canvas.width, -5);
        if (this.x > canvas.width + 5)  this.x = -5;
        if (this.x < -5)                this.x = canvas.width + 5;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(234,237,243,${this.alpha})`;
        ctx.fill();
      }
    }

    // Spawn flakes
    const flakes = Array.from({ length: FLAKE_COUNT }, () => new Snowflake());

    // Only animate when section is near viewport
    let snowActive = false;
    const snowSection = document.getElementById('contato');
    const snowObserver = new IntersectionObserver(entries => {
      snowActive = entries[0].isIntersecting;
    }, { threshold: 0 });
    if (snowSection) snowObserver.observe(snowSection);

    let animFrame;
    const animate = () => {
      animFrame = requestAnimationFrame(animate);
      if (!snowActive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      flakes.forEach(f => { f.update(); f.draw(); });
    };
    animate();

    // Pause when tab not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animFrame);
      } else {
        animate();
      }
    });
  }

  /* ──────────────────────────────────────────────────────────
     6. PORTFOLIO — hover tilt sutil
  ────────────────────────────────────────────────────────── */
  document.querySelectorAll('.porto-item').forEach(item => {
    item.addEventListener('mousemove', e => {
      const rect = item.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      item.style.transform = `perspective(600px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) scale(1.01)`;
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
      item.style.transition = 'transform .5s ease';
    });
    item.addEventListener('mouseenter', () => {
      item.style.transition = 'transform .1s ease';
    });
  });

  /* ──────────────────────────────────────────────────────────
     7. ESTATÍSTICAS — count-up ao entrar na viewport
  ────────────────────────────────────────────────────────── */
  const stats = document.querySelectorAll('.stat strong');

  const parseTarget = text => {
    const match = text.match(/[\d]+/);
    return match ? parseInt(match[0]) : null;
  };

  const formatValue = (val, original) => {
    if (original.startsWith('+')) return `+${val}`;
    if (original.endsWith('%')) return `${val}%`;
    if (original.includes('anos')) return `${val} anos`;
    return String(val);
  };

  const countUp = (el, target, original) => {
    const duration = 1400;
    const start    = performance.now();
    const step = now => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = formatValue(Math.floor(ease * target), original);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const statObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el       = entry.target;
        const original = el.dataset.original || el.textContent;
        el.dataset.original = original;
        const target   = parseTarget(original);
        if (target !== null) countUp(el, target, original);
        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(s => statObserver.observe(s));

  /* ──────────────────────────────────────────────────────────
     8. SMOOTH SCROLL — âncoras com offset de navbar
  ────────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = navbar.offsetHeight + 16;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ──────────────────────────────────────────────────────────
     10. CONTACT BUTTONS — micro-feedback de click
  ────────────────────────────────────────────────────────── */
  document.querySelectorAll('.contact-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      // Ripple effect
      const ripple = document.createElement('span');
      const rect   = this.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position:absolute;
        border-radius:50%;
        background:rgba(255,255,255,.18);
        width:${size}px;
        height:${size}px;
        left:${e.clientX - rect.left - size / 2}px;
        top:${e.clientY - rect.top  - size / 2}px;
        transform:scale(0);
        animation:ripple .55s ease-out forwards;
        pointer-events:none;
      `;
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Inject ripple keyframe
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to { transform: scale(2.5); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

});
