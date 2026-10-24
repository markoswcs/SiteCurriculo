import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { contact, projects, skills, education, languages, marquee } from './data.js';
import './styles.css';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
let lenis;

const img = (name, widths) => ({
  src: `/img/${name}-${widths[widths.length - 1]}.webp`,
  srcSet: widths.map(w => `/img/${name}-${w}.webp ${w}w`).join(', '),
});

// Quebra o texto em caracteres mascarados para a animação de entrada.
function Split({ text, className = '' }) {
  return (
    <span className={`split ${className}`} aria-label={text}>
      {text.split(' ').map((word, w) => (
        <span className="split-word" key={w} aria-hidden="true">
          {[...word].map((ch, c) => <span className="char" key={c}>{ch}</span>)}
        </span>
      ))}
    </span>
  );
}

function Arrow() {
  return <svg className="arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>;
}

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 20);
    return () => clearInterval(id);
  }, []);
  return <span>{now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })} BRT</span>;
}

function Preloader() {
  return (
    <div className="preloader" aria-hidden="true">
      <div className="preloader-count"><span>0</span>%</div>
      <div className="preloader-name">Markos Winycius — Portfólio 2026</div>
      <div className="preloader-bar"><i /></div>
    </div>
  );
}

function Cursor() {
  const dot = useRef();
  const ring = useRef();
  useEffect(() => {
    if (!finePointer) return;
    const xDot = gsap.quickTo(dot.current, 'x', { duration: 0.08 });
    const yDot = gsap.quickTo(dot.current, 'y', { duration: 0.08 });
    const xRing = gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3' });
    const yRing = gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3' });
    const move = e => { xDot(e.clientX); yDot(e.clientY); xRing(e.clientX); yRing(e.clientY); };
    const over = e => {
      const target = e.target.closest('a, button, [data-cursor]');
      ring.current.dataset.label = target?.dataset.cursor || '';
      ring.current.classList.toggle('is-link', !!target);
      ring.current.classList.toggle('is-label', !!target?.dataset.cursor);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerover', over);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerover', over); };
  }, []);
  if (!finePointer) return null;
  return <><div className="cursor-dot" ref={dot} /><div className="cursor-ring" ref={ring} /></>;
}

function Nav() {
  const go = e => {
    const href = e.currentTarget.getAttribute('href');
    if (!href.startsWith('#')) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(href, { offset: 0, duration: 1.4 }) : document.querySelector(href)?.scrollIntoView();
  };
  return (
    <header className="nav">
      <a href="#top" className="nav-logo" onClick={go}>MW<sup>®</sup></a>
      <nav aria-label="Seções">
        {[['#sobre', 'Sobre'], ['#projetos', 'Projetos'], ['#skills', 'Skills'], ['#formacao', 'Formação']].map(([href, label]) => (
          <a key={href} href={href} onClick={go}><span data-text={label}>{label}</span></a>
        ))}
      </nav>
      <a href="#contato" className="nav-cta" onClick={go}>Contato</a>
      <div className="nav-progress"><i /></div>
    </header>
  );
}

function Magnetic({ children, strength = 0.35 }) {
  const ref = useRef();
  useEffect(() => {
    if (!finePointer || reduceMotion) return;
    const el = ref.current;
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, .4)' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, .4)' });
    const move = e => {
      const b = el.getBoundingClientRect();
      x((e.clientX - b.left - b.width / 2) * strength);
      y((e.clientY - b.top - b.height / 2) * strength);
    };
    const leave = () => { x(0); y(0); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
  }, [strength]);
  return <span className="magnetic" ref={ref}>{children}</span>;
}

function Hero() {
  const avatar = useRef();
  const tilt = e => {
    if (!finePointer || reduceMotion) return;
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    gsap.to(avatar.current, { rotate: x * 24, x: x * 30, y: y * 20, duration: 1, ease: 'power3.out' });
    gsap.to('.hero-photo img', { x: x * -18, y: y * -12, duration: 1.2, ease: 'power3.out' });
  };
  return (
    <section className="hero" id="top" onPointerMove={tilt}>
      <div className="hero-meta">
        <span className="status"><i /> Disponível para estágio e júnior</span>
        <span>Brasília, DF — <Clock /></span>
      </div>
      <h1 className="hero-title">
        <span className="line line-1"><Split text="Markos" /><em className="hero-amp">engenheiro<br />de software</em></span>
        <span className="line line-2"><Split text="Winycius" /></span>
      </h1>
      <div className="hero-photo">
        <img {...img('markos-foto', [480, 900])} sizes="(max-width: 760px) 70vw, 30vw" alt="Foto de Markos Winycius sorrindo, de óculos redondos" />
        <span className="hero-photo-tag">Markos, 2026</span>
      </div>
      <img className="hero-avatar" ref={avatar} {...img('markos-avatar', [360, 720])} sizes="180px" alt="" aria-hidden="true" />
      <p className="hero-lead">
        Construo produtos digitais com código, design e <em>IA generativa</em> — do primeiro rascunho ao deploy.
      </p>
      <div className="hero-actions">
        <Magnetic><a className="btn btn-accent" href="#projetos" onClick={e => { e.preventDefault(); lenis?.scrollTo('#projetos', { duration: 1.4 }); }}>Ver projetos <Arrow /></a></Magnetic>
        <Magnetic><a className="btn btn-ghost" href={contact.whatsapp} target="_blank" rel="noreferrer">WhatsApp <Arrow /></a></Magnetic>
      </div>
      <div className="hero-scroll" aria-hidden="true"><span>Role</span><i /></div>
    </section>
  );
}

function Marquee() {
  const items = [...marquee, ...marquee];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map(k => (
          <div className="marquee-group" key={k}>
            {items.map((t, i) => <span key={i}>{t}<b>✺</b></span>)}
          </div>
        ))}
      </div>
    </div>
  );
}

function About() {
  const statement = 'Sou estudante do 8º semestre de Engenharia de Software e uno código, design e IA para transformar ideias em sites, apps e sistemas que funcionam — e que as pessoas gostam de usar.';
  const stats = [[8, 'º', 'semestre de Engenharia de Software'], [5, '+', 'projetos publicados no GitHub'], [2026, '', 'ano de conclusão da graduação']];
  return (
    <section className="about" id="sobre">
      <div className="section-label"><span>01</span> Sobre</div>
      <p className="about-statement">
        {statement.split(' ').map((w, i) => <span className="word" key={i}>{w} </span>)}
      </p>
      <div className="about-grid">
        <div className="stats">
          {stats.map(([n, suf, label]) => (
            <div className="stat" key={label}>
              <strong><span className="count" data-to={n}>{n}</span>{suf}</strong>
              <small>{label}</small>
            </div>
          ))}
        </div>
        <article className="job">
          <div className="job-head">
            <span className="job-badge">Atual</span>
            <small>Experiência</small>
          </div>
          <h3>OnTrack Agência Digital</h3>
          <p className="job-role">Atendimento, Estratégia e Gestão de Clientes</p>
          <ul>
            <li>Relacionamento com clientes da agência, acompanhando dúvidas e necessidades.</li>
            <li>Análise de sites, sistemas, usabilidade e processos internos para encontrar oportunidades de melhoria.</li>
          </ul>
          <a className="link" href="https://ontrackagenciadigital.com.br" target="_blank" rel="noreferrer">ontrackagenciadigital.com.br <Arrow /></a>
        </article>
      </div>
    </section>
  );
}

function FlowyArt() {
  const cols = [['A fazer', 3], ['Fazendo', 2], ['Feito', 3]];
  return (
    <div className="flowy-art" aria-label="Ilustração da interface Kanban do Flowy" role="img">
      <div className="flowy-top">
        <img src="/img/flowy-logo-160.webp" alt="" />
        <b>Flowy</b>
        <span className="flowy-search">Buscar tarefas…</span>
      </div>
      <div className="flowy-board">
        {cols.map(([title, n], c) => (
          <div className="flowy-col" key={title}>
            <small>{title} <i>{n}</i></small>
            {Array.from({ length: n }, (_, i) => (
              <div className="flowy-card" key={i} style={{ '--d': `${(c * 3 + i) * 0.4}s` }}>
                <span style={{ width: `${55 + ((c + i * 7) % 4) * 10}%` }} />
                <span style={{ width: `${30 + ((c * 3 + i) % 3) * 15}%` }} />
                <em className={`tag tag-${(c + i) % 3}`} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Projects() {
  return (
    <section className="projects" id="projetos">
      <div className="projects-head">
        <div className="section-label"><span>02</span> Projetos selecionados</div>
        <h2 className="big-title"><Split text="Trabalhos" /> <em>recentes</em></h2>
      </div>
      <div className="project-stack">
        {projects.map((p, i) => (
          <article className="project" key={p.id} style={{ '--tone': p.tone, '--i': i }}>
            <div className="project-inner">
              <div className="project-info">
                <div className="project-index">
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <span>/ {String(projects.length).padStart(2, '0')}</span>
                </div>
                <small className="project-kind">{p.kind} · {p.year}</small>
                <h3>{p.name}</h3>
                <p>{p.summary}</p>
                <ul className="chips">{p.stack.map(s => <li key={s}>{s}</li>)}</ul>
                <Magnetic strength={0.2}>
                  <a className="btn btn-light" href={p.url} target="_blank" rel="noreferrer">Ver no GitHub <Arrow /></a>
                </Magnetic>
              </div>
              <a className={`project-media ${p.device === 'tall' ? 'is-tall' : ''}`} href={p.url} target="_blank" rel="noreferrer" data-cursor="Abrir" aria-label={`Abrir ${p.name} no GitHub`}>
                {p.device === 'phone' ? (
                  <div className="phone">
                    <div className="phone-view">
                      <img {...img(p.image, p.widths)} sizes="320px" loading="lazy" decoding="async" alt={`Tela real do app ${p.name}`} />
                    </div>
                  </div>
                ) : (
                  <div className="browser">
                    <div className="browser-bar"><i /><i /><i /><span>{p.id}.markoswcs.dev</span></div>
                    <div className="browser-view">
                      {p.image
                        ? <img {...img(p.image, p.widths)} sizes="(max-width: 900px) 92vw, 55vw" loading="lazy" decoding="async" alt={`Tela real do projeto ${p.name}`} />
                        : <FlowyArt />}
                    </div>
                  </div>
                )}
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Skills() {
  return (
    <section className="skills" id="skills">
      <div className="section-label dark"><span>03</span> Competências</div>
      <h2 className="big-title"><Split text="O que eu" /> <em>faço bem</em></h2>
      <div className="bento">
        <article className="bento-card bento-ai">
          <img {...img('cerebro', [600, 1100])} sizes="(max-width: 900px) 80vw, 40vw" loading="lazy" decoding="async" alt="Cérebro com circuitos luminosos representando IA" />
          <div>
            <small>Especialidade</small>
            <h3>IA generativa & engenharia de prompts</h3>
            <p>Uso avançado de IA para criar sites, sistemas, imagens e conteúdo — mais rápido, sem abrir mão da qualidade.</p>
          </div>
        </article>
        {skills.map((s, i) => (
          <article className="bento-card" key={s.title}>
            <small>0{i + 1}</small>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
            <ul className="chips dark">{s.tags.map(t => <li key={t}>{t}</li>)}</ul>
          </article>
        ))}
        <article className="bento-card bento-lang">
          <small>Idiomas</small>
          {languages.map(([name, level, value]) => (
            <div className="lang" key={name}>
              <span>{name}</span><span>{level}</span>
              <div className="meter"><i style={{ '--v': value }} /></div>
            </div>
          ))}
        </article>
      </div>
    </section>
  );
}

function Education() {
  return (
    <section className="education" id="formacao">
      <div className="section-label"><span>04</span> Formação & cursos</div>
      <h2 className="big-title"><Split text="Sempre" /> <em>aprendendo</em></h2>
      <ol className="timeline">
        <div className="timeline-line"><i /></div>
        {education.map(e => (
          <li key={e.title}>
            <span className="timeline-dot" />
            <small>{e.period}</small>
            <h3>{e.title}</h3>
            <p>{e.place}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(contact.email); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { window.location.href = `mailto:${contact.email}`; }
  };
  return (
    <footer className="contact" id="contato">
      <div className="section-label dark"><span>05</span> Contato</div>
      <h2 className="contact-title">
        <span className="line"><Split text="Vamos" /></span>
        <span className="line"><em>construir</em> <Split text="algo?" /></span>
      </h2>
      <div className="contact-row">
        <p>Tem uma ideia, desafio ou vaga? Respondo rápido — pode chamar.</p>
        <div className="contact-actions">
          <Magnetic><a className="btn btn-dark btn-xl" href={`mailto:${contact.email}`}>{contact.email} <Arrow /></a></Magnetic>
          <button className="btn btn-outline-dark" type="button" onClick={copy}>{copied ? 'Copiado ✓' : 'Copiar e-mail'}</button>
          <Magnetic><a className="btn btn-outline-dark" href={contact.whatsapp} target="_blank" rel="noreferrer">WhatsApp <Arrow /></a></Magnetic>
        </div>
      </div>
      <div className="footer-bottom">
        <nav aria-label="Redes sociais">
          <a href={contact.linkedin} target="_blank" rel="noreferrer">LinkedIn <Arrow /></a>
          <a href={contact.github} target="_blank" rel="noreferrer">GitHub <Arrow /></a>
          <a href={contact.instagram} target="_blank" rel="noreferrer">Instagram <Arrow /></a>
        </nav>
        <span>Brasília — <Clock /></span>
        <button type="button" className="to-top" onClick={() => (lenis ? lenis.scrollTo(0, { duration: 1.6 }) : window.scrollTo(0, 0))}>Voltar ao topo ↑</button>
      </div>
      <div className="footer-name" aria-hidden="true">Markos Winycius</div>
    </footer>
  );
}

function useAnimations(root) {
  useLayoutEffect(() => {
    const tick = t => lenis?.raf(t * 1000);
    if (!reduceMotion) {
      lenis = new Lenis({ lerp: 0.09 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    const ctx = gsap.context(() => {
      // Barra de progresso e navegação que se esconde ao rolar para baixo.
      gsap.to('.nav-progress i', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });
      const nav = document.querySelector('.nav');
      ScrollTrigger.create({
        start: 0, end: 'max',
        onUpdate: self => nav.classList.toggle('is-hidden', self.direction === 1 && self.scroll() > 160),
      });

      if (reduceMotion) {
        gsap.set('.preloader', { display: 'none' });
        return;
      }

      // Preloader → entrada do hero.
      const counter = { v: 0 };
      const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
      intro
        .to(counter, { v: 100, duration: 1.5, ease: 'power2.inOut', onUpdate: () => { document.querySelector('.preloader-count span').textContent = Math.round(counter.v); } })
        .to('.preloader-bar i', { scaleX: 1, duration: 1.5, ease: 'power2.inOut' }, 0)
        .to('.preloader', { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '+=.15')
        .from('.hero-title .char', { yPercent: 115, rotate: 8, duration: 1.3, stagger: 0.035 }, '-=.55')
        .from('.hero-photo', { clipPath: 'inset(100% 0 0 0 round 999px 999px 24px 24px)', duration: 1.4 }, '<.1')
        .from('.hero-photo img', { scale: 1.4, duration: 1.8 }, '<')
        .from('.hero-avatar', { scale: 0, rotate: -90, duration: 1.2, ease: 'back.out(1.7)' }, '<.5')
        .from('.hero-meta > *, .hero-lead, .hero-actions .magnetic, .hero-amp, .hero-scroll', { y: 30, opacity: 0, duration: 1, stagger: 0.07 }, '<.1')
        .set('.preloader', { display: 'none' });

      // Parallax do hero ao sair da tela.
      const heroOut = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('.hero-title', { yPercent: -30, ease: 'none', scrollTrigger: heroOut });
      gsap.to('.hero-photo', { yPercent: -18, ease: 'none', scrollTrigger: heroOut });
      gsap.to('.hero-avatar', { yPercent: -120, rotate: 30, ease: 'none', scrollTrigger: heroOut });

      // Marquee acompanha a velocidade da rolagem.
      const track = gsap.to('.marquee-track', { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
      lenis?.on('scroll', ({ velocity }) => {
        gsap.to(track, { timeScale: 1 + Math.min(Math.abs(velocity) / 6, 5), duration: 0.3, overwrite: true });
        gsap.to('.marquee', { skewX: gsap.utils.clamp(-8, 8, -velocity / 3), duration: 0.4, overwrite: 'auto' });
      });

      // Texto do "Sobre" acende palavra por palavra.
      gsap.fromTo('.about-statement .word', { opacity: 0.12 }, {
        opacity: 1, stagger: 0.1, ease: 'none',
        scrollTrigger: { trigger: '.about-statement', start: 'top 80%', end: 'bottom 45%', scrub: true },
      });

      gsap.utils.toArray('.count').forEach(el => {
        const to = Number(el.dataset.to);
        const from = to > 100 ? to - 30 : 0;
        const o = { v: from };
        gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' }, onUpdate: () => { el.textContent = Math.round(o.v); } });
      });

      gsap.from('.stat, .job', { y: 60, opacity: 0, duration: 1.1, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.about-grid', start: 'top 80%' } });

      // Títulos grandes de cada seção.
      gsap.utils.toArray('.big-title').forEach(t => {
        gsap.from(t.querySelectorAll('.char, em'), { yPercent: 110, opacity: 0, duration: 1.1, stagger: 0.03, ease: 'expo.out', scrollTrigger: { trigger: t, start: 'top 85%' } });
      });
      gsap.utils.toArray('.section-label').forEach(l => gsap.from(l, { x: -30, opacity: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: l, start: 'top 90%' } }));

      // Cartões de projeto empilhados: o anterior recua quando o próximo chega.
      const cards = gsap.utils.toArray('.project');
      cards.forEach((card, i) => {
        const inner = card.querySelector('.project-inner');
        gsap.from(card.querySelectorAll('.project-info > *'), { y: 40, opacity: 0, duration: 1, stagger: 0.06, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 70%' } });
        gsap.fromTo(card.querySelector('.browser-view img, .phone-view img, .flowy-art'), { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'top 20%', scrub: true } });
        if (i < cards.length - 1 && window.innerWidth > 900) {
          gsap.to(inner, {
            scale: 0.9, filter: 'brightness(.45)', ease: 'none',
            scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 14%', scrub: true },
          });
        }
      });

      gsap.from('.bento-card', { y: 80, opacity: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.bento', start: 'top 80%' } });
      gsap.fromTo('.bento-ai img', { rotate: -12, scale: 0.85 }, { rotate: 6, scale: 1.05, ease: 'none', scrollTrigger: { trigger: '.bento-ai', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from('.meter i', { scaleX: 0, duration: 1.4, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.bento-lang', start: 'top 85%' } });

      gsap.fromTo('.timeline-line i', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 60%', scrub: true } });
      gsap.utils.toArray('.timeline li').forEach(li => {
        gsap.from(li, { x: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: li, start: 'top 82%' } });
      });

      gsap.from('.contact-title .char, .contact-title em', { yPercent: 110, duration: 1.2, stagger: 0.03, ease: 'expo.out', scrollTrigger: { trigger: '.contact-title', start: 'top 80%' } });
      gsap.from('.footer-name', { yPercent: 60, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.footer-bottom', start: 'top bottom', end: 'max', scrub: true } });
    }, root);

    return () => { ctx.revert(); gsap.ticker.remove(tick); lenis?.destroy(); lenis = undefined; };
  }, []);
}

function App() {
  const root = useRef();
  useAnimations(root);
  return (
    <div ref={root}>
      <Preloader />
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Projects />
        <Skills />
        <Education />
      </main>
      <Contact />
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
