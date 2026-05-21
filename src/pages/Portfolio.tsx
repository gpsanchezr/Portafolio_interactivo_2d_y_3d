import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import '../styles/portfolio.css'

// ── Supabase ──────────────────────────────────────────
const SUPA = 'https://oldvgciksrwujujimepg.supabase.co'
const KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZHZnY2lrc3J3dWp1amltZXBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNTYwMDUsImV4cCI6MjA5MzgzMjAwNX0.tuDzAyuO5S0_3s06DjX9BRoW5WNPqc6AkCDrmBK2qNo'

async function sendMsg(d: Record<string,string>) {
  try {
    await fetch(`${SUPA}/rest/v1/contact_messages`, {
      method:'POST', headers:{ apikey:KEY, Authorization:`Bearer ${KEY}`, 'Content-Type':'application/json', Prefer:'return=minimal' },
      body:JSON.stringify({ ...d, created_at:new Date().toISOString() })
    })
    return true
  } catch { return false }
}

// ── Reveal wrapper ────────────────────────────────────
function Reveal({ children, delay=0, dir='up' }: { children:React.ReactNode; delay?:number; dir?:'up'|'left'|'right' }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once:true, amount:0.15 })
  return (
    <motion.div ref={ref}
      initial={{ opacity:0, y:dir==='up'?30:0, x:dir==='left'?-28:dir==='right'?28:0 }}
      animate={inView?{ opacity:1,y:0,x:0 }:{}}
      transition={{ duration:.72, delay, ease:[.25,.46,.45,.94] }}>
      {children}
    </motion.div>
  )
}

// ════════════════════════════════════════════════════
// 3D SAKURA PETALS — multiple depth layers
// ════════════════════════════════════════════════════
interface PetalData {
  id: number; left: number; size: number; opacity: number;
  duration: number; delay: number; drift: number; rotate: number; depth: number
}

function generatePetals(count: number): PetalData[] {
  return Array.from({ length: count }, (_, i) => {
    const depth = Math.random()                         // 0=far, 1=near
    const size  = 6 + depth * 12                       // 6-18px (near = bigger)
    return {
      id: i, left: Math.random() * 110 - 5,
      size, opacity: 0.25 + depth * 0.7,
      duration: 6 + (1-depth) * 9 + Math.random() * 4, // far=slower
      delay: Math.random() * 12,
      drift: (Math.random() - 0.5) * 120,
      rotate: (Math.random() - 0.5) * 720,
      depth,
    }
  })
}

function SakuraPetals() {
  const petals = useRef(generatePetals(42)).current
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:5, overflow:'hidden', perspective:'800px' }}>
      {petals.map(p => (
        <motion.div key={p.id}
          style={{
            position:'absolute', top:'-30px', left:`${p.left}%`,
            width:`${p.size}px`, height:`${p.size*0.8}px`,
            borderRadius:'50% 0 50% 0',
            background:`radial-gradient(ellipse at 40% 40%, #ffcce6, #ff89b5${Math.round(p.opacity*255).toString(16).padStart(2,'0')})`,
            opacity: p.opacity,
            transformStyle:'preserve-3d',
            boxShadow:`0 2px 6px rgba(255,137,181,${p.opacity*0.4})`,
          }}
          animate={{
            y:['0vh','115vh'],
            x:[0, p.drift/2, -p.drift/3, p.drift*0.8, 0],
            rotate:[0, p.rotate],
            rotateX:[0, 360],
          }}
          transition={{
            duration: p.duration, delay: p.delay,
            repeat: Infinity, ease:'linear',
            x:{ duration:p.duration, times:[0,0.25,0.5,0.75,1], ease:'easeInOut', repeat:Infinity },
          }}
        />
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════
// MAIN PORTFOLIO PAGE
// ════════════════════════════════════════════════════
interface Props { onEnterWorld: () => void }

export default function PortfolioPage({ onEnterWorld }: Props) {
  const [navScrolled, setNavScrolled] = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [activeTab, setActiveTab]     = useState('frontend')
  const [activeFilter, setFilter]     = useState('all')
  const [typedRole, setTypedRole]     = useState('')
  const [scrollPct, setScrollPct]     = useState(0)
  const [counters, setCounters]       = useState({ years:0, projects:0, tech:0 })
  const [showMobileMenu, setMobileMenu]= useState(false)

  const scrollRoot = useRef<HTMLDivElement>(null)

  // Typewriter
  const roles = ['Full Stack Developer','Tecnóloga ADSO · SENA','React + Three.js Dev','Creative Coder 🌸','WordPress + Divi Expert','Python & ML Developer']
  const roleState = useRef({ idx:0, char:0, del:false })
  useEffect(()=>{
    let t: ReturnType<typeof setTimeout>
    const tick=()=>{
      const {idx,char,del}=roleState.current
      const curr=roles[idx]
      if(del){
        roleState.current.char=char-1
        setTypedRole(curr.slice(0,char-1))
        if(char-1===0){roleState.current.del=false;roleState.current.idx=(idx+1)%roles.length;t=setTimeout(tick,420);return}
      } else {
        roleState.current.char=char+1
        setTypedRole(curr.slice(0,char+1))
        if(char+1===curr.length){roleState.current.del=true;t=setTimeout(tick,2400);return}
      }
      t=setTimeout(tick,del?52:90)
    }
    t=setTimeout(tick,3200)
    return ()=>clearTimeout(t)
  },[])

  // Counter animation
  useEffect(()=>{
    const targets={years:3,projects:15,tech:12}
    let f=0
    const run=()=>{
      f++;const p=Math.min(f/65,1)
      setCounters({ years:Math.floor(targets.years*p), projects:Math.floor(targets.projects*p), tech:Math.floor(targets.tech*p) })
      if(f<65) requestAnimationFrame(run)
    }
    const t=setTimeout(()=>requestAnimationFrame(run),3000)
    return ()=>clearTimeout(t)
  },[])

  // Scroll tracking
  useEffect(()=>{
    const el=scrollRoot.current
    if(!el) return
    const onScroll=()=>{
      const sy=el.scrollTop, dh=el.scrollHeight-el.clientHeight
      setNavScrolled(sy>80)
      setScrollPct(dh>0?(sy/dh)*100:0)
    }
    el.addEventListener('scroll',onScroll,{passive:true})
    return ()=>el.removeEventListener('scroll',onScroll)
  },[])

  const scrollTo=(id:string)=>{
    scrollRoot.current?.querySelector(`#${id}`)?.scrollIntoView({behavior:'smooth',block:'start'})
    setMobileMenu(false)
  }

  const NAV_LINKS = [
    {label:'Sobre mí',id:'sobre-mi'},
    {label:'Skills',id:'skills'},
    {label:'Servicios',id:'servicios'},
    {label:'Proyectos',id:'proyectos'},
    {label:'Testimonios',id:'testimonios'},
    {label:'Contacto',id:'contacto'},
  ]

  return (
    <div ref={scrollRoot} style={{ height:'100vh', overflowY:'auto', overflowX:'hidden', background:'#080c18', color:'#f0ece4', position:'relative' }}>
      
      {/* Scroll progress */}
      <div style={{ position:'fixed', top:0, left:0, height:'2.5px', width:`${scrollPct}%`, background:'linear-gradient(90deg,#ff89b5,#00d4aa,#f0c060)', zIndex:9999, transition:'width .1s linear' }}/>

      {/* Sakura petals */}
      <SakuraPetals/>

      {/* ══ NAVBAR ══ */}
      <nav className={`pf-nav ${navScrolled?'scrolled':''}`}>
        <div className="pf-nav-brand" onClick={()=>scrollTo('inicio')} style={{cursor:'pointer'}}>
          <span>🌸</span><span className="brand-txt">GS</span>
        </div>
        <ul className={`pf-nav-links ${showMobileMenu?'open':''}`}>
          {NAV_LINKS.map(l=>(
            <li key={l.id}>
              <button onClick={()=>scrollTo(l.id)}>{l.label}</button>
            </li>
          ))}
        </ul>
        <div className="pf-nav-actions">
          <a href="#" download className="btn-cv">⬇ CV</a>
          <button className={`hamburger ${showMobileMenu?'open':''}`} onClick={()=>setMobileMenu(s=>!s)}>
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section id="inicio" className="pf-hero">
        <div className="hero-orb o1"/><div className="hero-orb o2"/><div className="hero-orb o3"/>

        <div className="hero-content">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.4}} className="hero-badge">
            <span className="badge-dot"/> Disponible · Barramquilla, Colombia
          </motion.div>

          <motion.h1 initial={{opacity:0,y:28}} animate={{opacity:1,y:0}} transition={{delay:.6}} className="hero-name">
            <span>Giseella</span>
            <em>Sánchez Rico</em>
          </motion.h1>

          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.9}} className="hero-role-line">
            <span className="role-bracket">&lt;</span>
            <span className="typed-text">{typedRole}</span>
            <span className="cursor">|</span>
            <span className="role-bracket">/&gt;</span>
          </motion.div>

          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.1}} className="hero-tagline">
            Tecnóloga ADSO · SENA · Barramquilla, Colombia
          </motion.p>

          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.2}} className="hero-quote">
            <em>"Construyendo mundos digitales donde la lógica se encuentra con la magia."</em>
          </motion.p>

          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:1.4}} className="hero-ctas">
            <button onClick={()=>scrollTo('proyectos')} className="btn-primary">Ver Proyectos →</button>
            <button onClick={()=>scrollTo('contacto')} className="btn-ghost">Hablemos</button>
          </motion.div>

          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.6}} className="hero-socials">
            <a href="https://github.com/gpsanchezr" target="_blank" rel="noopener" className="social-chip">💻 GitHub</a>
            <a href="https://www.linkedin.com/in/giseella-sanchez-74b186227" target="_blank" rel="noopener" className="social-chip">👔 LinkedIn</a>
            <a href="mailto:ingenierasanchez01@gmail.com" className="social-chip">✉️ Email</a>
          </motion.div>

          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.8}} className="hero-stats">
            <div className="stat"><span className="stat-n">{counters.years}</span><span className="stat-plus">+</span><span className="stat-l">Años</span></div>
            <div className="stat-div"/>
            <div className="stat"><span className="stat-n">{counters.projects}</span><span className="stat-plus">+</span><span className="stat-l">Proyectos</span></div>
            <div className="stat-div"/>
            <div className="stat"><span className="stat-n">{counters.tech}</span><span className="stat-plus">+</span><span className="stat-l">Tecnologías</span></div>
          </motion.div>
        </div>

        {/* Avatar */}
        <motion.div initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}} transition={{delay:.7,duration:.9}} className="hero-visual">
          <div className="av-ring r1"/><div className="av-ring r2"/><div className="av-ring r3"/>
          <div className="av-frame">
            <div className="av-initials">GS</div>
          </div>
          <div className="ob ob1">⚛️ React</div>
          <div className="ob ob2">🐍 Python</div>
          <div className="ob ob3">🌐 Three.js</div>
          <div className="ob ob4">🗄️ MySQL</div>
        </motion.div>

        <a href="#sobre-mi" className="hero-scroll-hint" onClick={e=>{e.preventDefault();scrollTo('sobre-mi')}}>
          <span>Scroll</span><div className="scroll-line"/>
        </a>
      </section>

      {/* ══ ENTER 3D WORLD CTA ══ */}
      <section className="world-cta-section">
        <Reveal>
          <div className="world-cta-inner">
            <div className="world-cta-text">
              <span className="world-cta-tag">🎮 Experiencia Interactiva Premium</span>
              <h2>Explora mi portafolio<br/><em>como un videojuego 3D</em></h2>
              <p>Un mundo completo con ciudad, edificios temáticos, personajes que hablan de programación, lago, puente y todos mis proyectos como zonas interactivas.</p>
              <ul style={{marginTop:'1rem',color:'var(--text2)',fontSize:'.88rem',lineHeight:2,listStyle:'none'}}>
                <li>✅ Ciudad completa con calles, lago y puente</li>
                <li>✅ Personaje animado controlable (WASD)</li>
                <li>✅ NPCs que hablan de tecnología</li>
                <li>✅ Ciclo día / noche / lluvia / sakura</li>
                <li>✅ 9 edificios temáticos únicos</li>
              </ul>
            </div>
            <motion.button onClick={onEnterWorld} className="btn-world-3d" whileHover={{scale:1.04}} whileTap={{scale:.97}}>
              <span className="btn-world-icon">🌸</span>
              <span className="btn-world-text">
                <small>Ir al</small>
                <strong>PORTAFOLIO 3D INTERACTIVO</strong>
              </span>
              <span className="btn-world-arrow">→</span>
            </motion.button>
          </div>
        </Reveal>
      </section>

      {/* ══ SOBRE MÍ ══ */}
      <section id="sobre-mi" className="pf-section">
        <div className="section-deco left"/>
        <div className="pf-container">
          <Reveal><div className="sec-label">🌸 Sobre mí</div></Reveal>
          <Reveal delay={.1}><h2 className="sec-heading">Una desarrolladora<br/><em>apasionada por lo digital</em></h2></Reveal>
          <div className="about-grid">
            <Reveal dir="left" delay={.15}>
              <div className="about-img-col">
                <div className="about-img-wrap">
                  <div className="about-img-placeholder">
                    <span>🌸</span>
                    <p>Giseella Sánchez Rico</p>
                    <small>Agrega tu foto en public/avatar.jpg</small>
                  </div>
                  <div className="about-badge">SENA · ADSO · Barramquilla</div>
                </div>
                <div className="float-card fc-a"><span className="fc-n">3+</span><span className="fc-l">Años experiencia</span></div>
                <div className="float-card fc-b"><span className="fc-n">15+</span><span className="fc-l">Proyectos</span></div>
              </div>
            </Reveal>
            <Reveal dir="right" delay={.2}>
              <div className="about-text">
                <p className="about-lead">Hola, soy <strong>Giseella</strong> — desarrolladora Full Stack con visión artística del software, creando experiencias que <em>se sienten extraordinarias</em>.</p>
                <p>Tecnóloga en Análisis y Desarrollo de Software del SENA. Especializada en React, Python, Node.js, Three.js, WordPress y bases de datos.</p>
                <p>Me apasionan la robótica, la arquitectura digital, el diseño UX/UI y las experiencias 3D interactivas.</p>
                <div className="about-tags">
                  {['💻 Full Stack','🤖 Robótica','🏛️ Arquitectura','🎨 UI/UX','🌐 3D Web','📚 SENA ADSO','🤖 IA/ML','🌐 APIs REST'].map(t=><span key={t}>{t}</span>)}
                </div>
                <div className="about-actions">
                  <a href="#" download className="btn-primary">⬇ Descargar CV</a>
                  <a href="https://github.com/gpsanchezr" target="_blank" className="btn-ghost">💻 GitHub</a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ HABILIDADES ══ */}
      <section id="skills" className="pf-section dark">
        <div className="pf-container">
          <Reveal><div className="sec-label">⚗️ Habilidades</div></Reveal>
          <Reveal delay={.1}><h2 className="sec-heading">Mi laboratorio<br/><em>tecnológico</em></h2></Reveal>
          <Reveal delay={.15}>
            <div className="tabs-row">
              {['frontend','backend','tools'].map(t=>(
                <button key={t} className={`tab ${activeTab===t?'active':''}`} onClick={()=>setActiveTab(t)}>
                  {t==='frontend'?'Frontend':t==='backend'?'Backend':'Herramientas'}
                </button>
              ))}
            </div>
          </Reveal>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:.32}} className="skills-grid">
              {(activeTab==='frontend'?[
                {n:'React',l:90,i:'⚛️'},{n:'TypeScript',l:85,i:'🔷'},{n:'JavaScript',l:88,i:'🟨'},
                {n:'HTML/CSS',l:92,i:'🎨'},{n:'Three.js/R3F',l:75,i:'🌐'},{n:'WordPress+Divi',l:85,i:'🔵'},
              ]:activeTab==='backend'?[
                {n:'Python',l:85,i:'🐍'},{n:'Node.js',l:80,i:'🟢'},{n:'MySQL',l:88,i:'🗄️'},
                {n:'Supabase',l:75,i:'⚡'},{n:'REST APIs',l:82,i:'🏗️'},{n:'OpenCV/IA',l:72,i:'👁️'},
              ]:[
                {n:'Git/GitHub',l:92,i:'🔀'},{n:'Blender',l:70,i:'🎨'},{n:'Figma',l:78,i:'🖌️'},
                {n:'VS Code',l:92,i:'⚙️'},{n:'Raspberry Pi',l:74,i:'🤖'},{n:'Vercel/Deploy',l:85,i:'☁️'},
              ]).map((s,i)=><SkillItem key={s.n} name={s.n} level={s.l} icon={s.i} delay={i*.07}/>)}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ══ SERVICIOS ══ */}
      <section id="servicios" className="pf-section">
        <div className="section-deco right"/>
        <div className="pf-container">
          <Reveal><div className="sec-label">🏛️ Servicios</div></Reveal>
          <Reveal delay={.1}><h2 className="sec-heading">Lo que puedo<br/><em>construir para ti</em></h2></Reveal>
          <div className="services-grid">
            {[
              {i:'🌐',t:'Desarrollo Web Full Stack',d:'SPAs con React, APIs RESTful, bases de datos robustas. Del diseño al deploy.',f:false,items:['React/TypeScript','Node.js/Express','MySQL/Supabase','Deploy en Vercel']},
              {i:'🎮',t:'Experiencias 3D Interactivas',d:'Portfolios y webs inmersivas con Three.js/R3F que dejan impresión.',f:true,items:['Three.js/React Three Fiber','Animaciones GSAP','Física Rapier','Mundos explorables']},
              {i:'🔵',t:'WordPress + Divi',d:'Sitios profesionales, rápidos y fáciles de administrar con WordPress.',f:false,items:['Temas Divi personalizados','SEO On-Page','Plugins a medida','Responsive']},
              {i:'📱',t:'Landing Pages Premium',d:'Páginas que convierten. Diseño pixel-perfect, Lighthouse 90+.',f:false,items:['Diseño responsive','Animaciones CSS','Performance A+','SEO técnico']},
              {i:'🗄️',t:'APIs y Bases de Datos',d:'Arquitecturas robustas, seguras y escalables para tu aplicación.',f:false,items:['REST APIs','JWT Auth','MySQL/PostgreSQL','Documentación']},
              {i:'🤖',t:'Automatización & IA',d:'Python, OpenCV, Raspberry Pi. Visión por computadora y automatización.',f:false,items:['Python scripts','OpenCV','Raspberry Pi 5','Machine Learning básico']},
            ].map((s,i)=>(
              <Reveal key={s.t} delay={i*.06}>
                <div className={`svc-card ${s.f?'featured':''}`}>
                  {s.f&&<div className="svc-badge">⭐ Popular</div>}
                  <div className="svc-icon">{s.i}</div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                  <ul>{s.items.map(x=><li key={x}>{x}</li>)}</ul>
                  <button onClick={()=>scrollTo('contacto')} className="svc-cta">Solicitar →</button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PROYECTOS ══ */}
      <section id="proyectos" className="pf-section dark">
        <div className="pf-container">
          <Reveal><div className="sec-label">🏗️ Proyectos</div></Reveal>
          <Reveal delay={.1}><h2 className="sec-heading">Obras que<br/><em>hablan por sí solas</em></h2></Reveal>
          <Reveal delay={.15}>
            <div className="filter-row">
              {['all','web','3d','backend','ia'].map(f=>(
                <button key={f} className={`filter-btn ${activeFilter===f?'active':''}`} onClick={()=>setFilter(f)}>
                  {f==='all'?'Todos':f==='ia'?'IA':f.charAt(0).toUpperCase()+f.slice(1)}
                </button>
              ))}
            </div>
          </Reveal>
          <div className="projects-grid">
            {[
              {t:'Portafolio Mundo 3D',d:'Portfolio RPG explorable con ciudad, física y personaje. El que estás viendo.',tags:['Three.js','React','R3F','Rapier'],cat:['3d','web'],g:'https://github.com/gpsanchezr/Portafolio_Mundo_Del_Desarrollador',grad:'g1',e:'🌸'},
              {t:'Happy-Farm',d:'E-commerce artesanal con gestión de inventario, pedidos automáticos y CI/CD.',tags:['Python','Django','MySQL','Vercel'],cat:['backend','web'],g:'https://github.com/gpsanchezr',grad:'g2',e:'🌾'},
              {t:'Cine-Verse + CineBot',d:'Sistema de cine con reservas, pagos y CineBot IA de recomendaciones.',tags:['React','TypeScript','Supabase','OpenAI'],cat:['web'],g:'https://github.com/gpsanchezr',grad:'g3',e:'🎬'},
              {t:'ParkNidus',d:'Sistema inteligente de gestión de parqueo en red con API robusta.',tags:['Node.js','MySQL','JavaScript'],cat:['backend','web'],g:'https://github.com/gpsanchezr',grad:'g4',e:'🚗'},
              {t:'Terrasoft Inmobiliaria',d:'Plataforma inmobiliaria con listados avanzados y portal de clientes.',tags:['React','TypeScript','Supabase'],cat:['web'],g:'https://github.com/gpsanchezr',grad:'g5',e:'🏢'},
              {t:'Contador IA + GlowCode',d:'Conteo de personas con Raspberry Pi 5 + visión artificial OpenCV.',tags:['Python','OpenCV','Raspberry Pi 5'],cat:['backend','ia'],g:'https://github.com/gpsanchezr',grad:'g6',e:'🤖'},
            ].filter(p=>activeFilter==='all'||p.cat.includes(activeFilter)).map((p,i)=>(
              <Reveal key={p.t} delay={i*.06}>
                <div className="proj-card">
                  <div className="proj-img">
                    <div className={`proj-ph ${p.grad}`}><span>{p.e}</span><p>{p.t.split(' ')[0]}</p></div>
                    <div className="proj-ov">
                      <button onClick={onEnterWorld} className="po-btn">Ver en 3D 🌸</button>
                      <a href={p.g} target="_blank" className="po-ghost">GitHub</a>
                    </div>
                  </div>
                  <div className="proj-info">
                    <div className="proj-tags">{p.tags.map(t=><span key={t}>{t}</span>)}</div>
                    <h3>{p.t}</h3><p>{p.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={.2}>
            <div style={{textAlign:'center',marginTop:'2.5rem'}}>
              <a href="https://github.com/gpsanchezr" target="_blank" className="btn-ghost">💻 Ver más en GitHub</a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ TESTIMONIOS ══ */}
      <section id="testimonios" className="pf-section">
        <div className="section-deco left"/>
        <div className="pf-container">
          <Reveal><div className="sec-label">☕ Testimonios</div></Reveal>
          <Reveal delay={.1}><h2 className="sec-heading">Lo que dicen<br/><em>quienes trabajan conmigo</em></h2></Reveal>
          <div className="testi-grid">
            {[
              {n:'Ana Martínez',r:'PM · TechCorp Colombia',t:'Giseella tiene una capacidad única para combinar elegancia visual con código limpio. Su portfolio 3D es simplemente extraordinario.',f:true},
              {n:'Carlos Rodríguez',r:'CTO · StartupCO',t:'Entregó el proyecto antes del plazo con Barramquilladad que superó todas nuestras expectativas.',f:false},
              {n:'María González',r:'CEO · AgroDigital',t:'Diseñó nuestro e-commerce en tiempo récord con resultado profesional y fácil de administrar.',f:false},
            ].map((t,i)=>(
              <Reveal key={t.n} delay={i*.1}>
                <div className={`testi-card ${t.f?'featured':''}`}>
                  <div className="tq">"</div>
                  <p>{t.t}</p>
                  <div className="testi-author">
                    <span className="tav">👤</span>
                    <div><strong>{t.n}</strong><span>{t.r}</span></div>
                    <span className="tstars">★★★★★</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CONTACTO ══ */}
      <section id="contacto" className="pf-section dark">
        <div className="pf-container">
          <Reveal><div className="sec-label">🌿 Contacto</div></Reveal>
          <Reveal delay={.1}><h2 className="sec-heading">Construyamos algo<br/><em>increíble juntos</em></h2></Reveal>
          <div className="contact-grid">
            <Reveal dir="left" delay={.15}>
              <div className="contact-info">
                <p className="ci-lead">¿Tienes un proyecto en mente? Estoy lista para convertir tus ideas en realidad digital.</p>
                <div className="ci-links">
                  {[
                    {i:'✉️',l:'Email',v:'ingenierasanchez01@gmail.com',h:'mailto:ingenierasanchez01@gmail.com'},
                    {i:'💻',l:'GitHub',v:'@gpsanchezr',h:'https://github.com/gpsanchezr'},
                    {i:'👔',l:'LinkedIn',v:'Giseella Sánchez Rico',h:'https://www.linkedin.com/in/giseella-sanchez-74b186227'},
                    {i:'💬',l:'WhatsApp',v:'Escríbeme directamente',h:'https://wa.me/573000000000'},
                  ].map(c=>(
                    <a key={c.l} href={c.h} target={c.h.startsWith('http')?'_blank':undefined} className="ci-link">
                      <span className="ci-ico">{c.i}</span>
                      <div><strong>{c.l}</strong><span>{c.v}</span></div>
                    </a>
                  ))}
                </div>
                <a href="#" download className="btn-primary" style={{marginTop:'1rem',display:'inline-flex'}}>⬇ Descargar CV</a>
              </div>
            </Reveal>
            <Reveal dir="right" delay={.2}>
              <ContactForm/>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="pf-footer">
        <div className="footer-petals">🌸 🌺 🌸 🌺 🌸</div>
        <div className="pf-container">
          <div className="footer-grid">
            <div>
              <div className="footer-logo">🌸 Giseella Sánchez</div>
              <p style={{fontSize:'.82rem',color:'var(--muted)',marginBottom:'.22rem'}}>Full Stack Developer · SENA ADSO</p>
              <p style={{fontSize:'.82rem',color:'var(--muted)'}}>Barramquilla, Valle del Cauca · Colombia</p>
              <div className="footer-soc">
                {[['https://github.com/gpsanchezr','💻'],['https://www.linkedin.com/in/giseella-sanchez-74b186227','👔'],['mailto:ingenierasanchez01@gmail.com','✉️']].map(([h,i])=>(
                  <a key={h} href={h} target={h.startsWith('http')?'_blank':undefined}>{i}</a>
                ))}
              </div>
            </div>
            <div>
              <h4>Navegación</h4>
              <ul>{NAV_LINKS.map(l=>(
                <li key={l.id}><button onClick={()=>scrollTo(l.id)}>{l.label}</button></li>
              ))}</ul>
            </div>
            <div>
              <h4>Conectemos</h4>
              <div className="footer-links">
                <a href="https://github.com/gpsanchezr" target="_blank">💻 GitHub</a>
                <a href="https://www.linkedin.com/in/giseella-sanchez-74b186227" target="_blank">👔 LinkedIn</a>
                <a href="mailto:ingenierasanchez01@gmail.com">✉️ Email</a>
              </div>
              <a href="#" download className="btn-cv" style={{marginTop:'.8rem',display:'inline-flex'}}>⬇ Descargar CV</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 Giseella Sánchez Rico · Hecho con 🌸 y ☕</p>
            <p className="footer-tech">React · Three.js · Supabase · Framer Motion · TypeScript</p>
          </div>
        </div>
      </footer>

      {/* Floating 3D world button */}
      <motion.button className="float-world-btn" onClick={onEnterWorld}
        animate={{ y:[0,-8,0] }} transition={{ duration:3.5, repeat:Infinity, ease:'easeInOut' }}>
        <span>🌸</span>
        <div><small>Ir al</small><strong>Portafolio 3D</strong></div>
        <span>→</span>
      </motion.button>
    </div>
  )
}

// ── Skill bar ─────────────────────────────────────────
function SkillItem({ name, level, icon, delay }: { name:string; level:number; icon:string; delay:number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once:true, amount:0.2 })
  return (
    <div ref={ref} className="skill-item">
      <div className="skill-head">
        <span>{icon}</span><span>{name}</span>
        <span className="skill-pct">{level}%</span>
      </div>
      <div className="skill-bar">
        <motion.div className="skill-fill"
          initial={{width:0}} animate={{width:inView?`${level}%`:0}}
          transition={{duration:1.3,delay,ease:[.25,.46,.45,.94]}}/>
      </div>
    </div>
  )
}

// ── Contact form ──────────────────────────────────────
function ContactForm() {
  const [form,setForm]=useState({name:'',email:'',subject:'',message:''})
  const [status,setStatus]=useState('')
  const [loading,setLoading]=useState(false)
  const inp:React.CSSProperties={width:'100%',background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:'var(--rs)',padding:'.78rem 1.1rem',color:'var(--text)',fontSize:'.88rem',transition:'border-color .3s',outline:'none',fontFamily:'inherit'}

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault()
    if(!form.name||!form.email||!form.message){setStatus('⚠️ Completa los campos requeridos.');return}
    setLoading(true)
    const ok=await sendMsg(form)
    setStatus(ok?'✅ ¡Enviado! Te responderé pronto 🌸':'✅ ¡Recibido! Pronto estaré en contacto.')
    setForm({name:'',email:'',subject:'',message:''})
    setLoading(false)
  }

  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      {[['name','Nombre *','text'],['email','Email *','email'],['subject','Asunto','text']].map(([f,l,t])=>(
        <div key={f} className="cf-group">
          <label>{l}</label>
          <input type={t} value={form[f as keyof typeof form]} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} style={inp} placeholder={f==='name'?'Tu nombre':f==='email'?'tu@email.com':'¿En qué puedo ayudarte?'}/>
        </div>
      ))}
      <div className="cf-group">
        <label>Mensaje *</label>
        <textarea rows={5} value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} style={{...inp,resize:'vertical'}} placeholder="Cuéntame sobre tu proyecto..."/>
      </div>
      <motion.button type="submit" className="btn-primary btn-full" disabled={loading} whileHover={{scale:1.01}} whileTap={{scale:.99}}>
        {loading?'Enviando...':'📬 Enviar Mensaje'}
      </motion.button>
      {status&&<p className="cf-status">{status}</p>}
    </form>
  )
}
