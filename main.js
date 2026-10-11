(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* Demo login: fill in a dedicated throwaway account. Never use a personal email or a password you use elsewhere.
     While the values below start with YOUR_, the demo box stays hidden. */
  const DEMO = { email: 'YOUR_DEMO_EMAIL', pass: 'YOUR_DEMO_PASSWORD' };
  const demoBox = $('.demo-box');
  if (demoBox) {
    if (DEMO.email.startsWith('YOUR_')) demoBox.style.display = 'none';
    else {
      $('#demoEmail').textContent = DEMO.email;
      $('#demoPass').textContent = DEMO.pass;
      $('#demoToggle').addEventListener('click', () => $('#demoCreds').classList.toggle('open'));
    }
  }

  /* Theme */
  const body = document.body, themeBtn = $('#themeBtn');
  const setTheme = t => {
    body.classList.toggle('dark', t === 'dark');
    themeBtn.innerHTML = t === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    try { localStorage.setItem('theme', t); } catch (e) {}
  };
  let saved = null; try { saved = localStorage.getItem('theme'); } catch (e) {}
  setTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  themeBtn.addEventListener('click', () => setTheme(body.classList.contains('dark') ? 'light' : 'dark'));

  /* Mobile menu */
  const nl = $('#navLinks'), mb = $('#menuBtn');
  mb.addEventListener('click', () => {
    nl.classList.toggle('open');
    mb.innerHTML = nl.classList.contains('open') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  });
  $$('a', nl).forEach(a => a.addEventListener('click', () => { nl.classList.remove('open'); mb.innerHTML = '<i class="fas fa-bars"></i>'; }));

  /* Scroll: progress, back-to-top, active link */
  const bar = $('#progress'), top = $('#top');
  const sections = $$('section[id]');
  const links = $$('.nav-links a');
  let tick = false;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
    top.classList.toggle('show', scrollY > 400);
    let cur = '';
    sections.forEach(s => { if (scrollY + 140 >= s.offsetTop) cur = s.id; });
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
    tick = false;
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  top.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  /* Reveal + counters */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    $$('[data-count]', e.target).forEach(countUp);
    if (e.target.dataset.count) countUp(e.target);
    io.unobserve(e.target);
  }), { threshold: .12 });
  $$('.rv').forEach(el => io.observe(el));
  function countUp(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    const end = +el.dataset.count;
    if (reduce) { el.textContent = end; return; }
    let n = 0; const step = () => { n += Math.max(1, end / 24); if (n >= end) { el.textContent = end; return; } el.textContent = Math.floor(n); setTimeout(step, 40); };
    step();
  }

  /* Typed role line */
  const roles = ['Product Success Intern', 'Data & Analytics Builder', 'Root-Cause Problem Solver', 'Full-Stack Web Developer'];
  const typed = $('#typed');
  if (reduce) { typed.textContent = roles[0]; }
  else {
    let r = 0, c = 0, del = false;
    (function loop() {
      const w = roles[r];
      typed.textContent = w.slice(0, c);
      if (!del && c === w.length) { del = true; return setTimeout(loop, 1600); }
      if (del && c === 0) { del = false; r = (r + 1) % roles.length; }
      c += del ? -1 : 1;
      setTimeout(loop, del ? 35 : 70);
    })();
  }

  /* Hero particles */
  const cv = $('#hero-canvas');
  if (cv && !reduce) {
    const ctx = cv.getContext('2d'); let W, H; const P = [];
    const size = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; };
    size(); addEventListener('resize', size);
    for (let i = 0; i < 40; i++) P.push({ x: Math.random() * 1200, y: Math.random() * 800, r: Math.random() * 2 + 1, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4 });
    (function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = body.classList.contains('dark') ? '#e1c48b' : '#8b6534';
      P.forEach(p => {
        p.x = (p.x + p.vx + W) % W; p.y = (p.y + p.vy + H) % H;
        ctx.globalAlpha = .5; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      });
      requestAnimationFrame(draw);
    })();
  }

  /* Pointer effects (desktop only) */
  if (!reduce && fine) {
    let raf = 0, ev;
    addEventListener('pointermove', e => {
      ev = e; if (raf) return;
      raf = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--px', ev.clientX + 'px');
        document.documentElement.style.setProperty('--py', ev.clientY + 'px');
        raf = 0;
      });
    }, { passive: true });

    $$('.tilt').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--sx', x * 100 + '%'); el.style.setProperty('--sy', y * 100 + '%');
        el.style.transform = `perspective(1000px) rotateX(${((.5 - y) * 7).toFixed(2)}deg) rotateY(${((x - .5) * 8).toFixed(2)}deg) translateY(-4px)`;
      }, { passive: true });
      el.addEventListener('pointerleave', () => el.style.transform = '');
    });

    const hero = $('#hero'), stage = $('#stage');
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      stage.style.transform = `rotateY(${(x * 22).toFixed(2)}deg) rotateX(${(-y * 16).toFixed(2)}deg)`;
    }, { passive: true });
    hero.addEventListener('pointerleave', () => stage.style.transform = '');
  }

  /* Project filter */
  $$('.filter').forEach(b => b.addEventListener('click', () => {
    $$('.filter').forEach(x => x.classList.remove('active')); b.classList.add('active');
    const f = b.dataset.f;
    $$('.proj').forEach(p => { p.style.display = (f === 'all' || p.dataset.cat === f) ? '' : 'none'; });
  }));

  /* Broken image fallbacks (LinkedIn image URLs expire) */
  $$('.thumb img').forEach(img => img.addEventListener('error', () => {
    img.style.display = 'none';
    const f = img.parentElement.querySelector('.fallback'); if (f) f.style.display = 'grid';
  }));

  /* AI modal */
  const modal = $('#aiModal'), frame = $('#aiFrame'), AI = 'https://assitance.vercel.app/';
  const closeM = () => { modal.classList.remove('open'); body.style.overflow = ''; };
  $('#ai-btn').addEventListener('click', () => {
    /* Check the attribute, not frame.src: with src="" the resolved URL drops the #hash and never equals location.href */
    if (!frame.getAttribute('src')) frame.setAttribute('src', AI);
    modal.classList.add('open'); body.style.overflow = 'hidden';
  });
  $('#aiClose').addEventListener('click', closeM);
  modal.addEventListener('click', e => { if (e.target === modal) closeM(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeM(); });

  $('#year').textContent = new Date().getFullYear();

  /* Contact form */
  const form = $('#contactForm'), st = $('#formStatus'), sb = $('#submitBtn');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const orig = sb.innerHTML; sb.innerHTML = '<span>Sending…</span> <i class="fas fa-spinner fa-spin"></i>'; sb.disabled = true; st.className = 'status';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (res.ok) { st.className = 'status ok'; st.innerHTML = '<i class="fas fa-check-circle"></i><span>Message sent. I will get back to you soon.</span>'; form.reset(); }
      else { st.className = 'status err'; st.innerHTML = '<i class="fas fa-circle-exclamation"></i><span>Could not send. Please try again or email me directly.</span>'; }
    } catch (err) { st.className = 'status err'; st.innerHTML = '<i class="fas fa-circle-exclamation"></i><span>Network error. Please email me directly.</span>'; }
    finally { sb.innerHTML = orig; sb.disabled = false; }
  });
})();
