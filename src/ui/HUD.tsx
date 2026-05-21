import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { insertContact } from '../supabase'

const MAP_X_MIN = -58
const MAP_X_MAX = 58
const MAP_Z_MIN = -88
const MAP_Z_MAX = 50

// ── Coordinate transform: World → Minimap 170px ───────
const W2M = (wx:number, wz:number) => ({
  x: Math.max(6, Math.min(164, ((wx-MAP_X_MIN)/(MAP_X_MAX-MAP_X_MIN))*164)),
  y: Math.max(6, Math.min(164, ((wz-MAP_Z_MIN)/(MAP_Z_MAX-MAP_Z_MIN))*164)),
})

const ZONES = [
  { id:'home',     wx:0,   wz:8,   tp:[0,5,19]     as [number,number,number], emoji:'🏡', label:'Casa Giseella',  color:'#ffd080', desc:'Inicio · Sobre Mí' },
  { id:'cinema',   wx:-34, wz:-18, tp:[-34,5,-10]  as [number,number,number], emoji:'🎬', label:'Cine-Verse',     color:'#ff6060', desc:'Proyecto Cinema' },
  { id:'parking',  wx:-34, wz:18,  tp:[-34,5,28]   as [number,number,number], emoji:'🚗', label:'ParkNidus',      color:'#b060ff', desc:'Gestión Parqueo' },
  { id:'farm',     wx:36,  wz:22,  tp:[36,5,35]    as [number,number,number], emoji:'🌾', label:'Happy-Farm',     color:'#88ce02', desc:'E-commerce Farm' },
  { id:'tech',     wx:0,   wz:-28, tp:[0,5,-16]    as [number,number,number], emoji:'🤖', label:'Zona IA',        color:'#00d4aa', desc:'IA & Raspberry Pi' },
  { id:'glowcode', wx:-18, wz:-30, tp:[-18,5,-22]  as [number,number,number], emoji:'💄', label:'GlowCode',      color:'#ff89b5', desc:'Belleza Tech' },
  { id:'office',   wx:36,  wz:-14, tp:[36,5,-4]    as [number,number,number], emoji:'🏢', label:'Terrasoft',      color:'#61dafb', desc:'Inmobiliaria' },
  { id:'mansion',  wx:-36, wz:-42, tp:[-36,5,-30]  as [number,number,number], emoji:'🏛️', label:'Mansión',        color:'#ffd080', desc:'Portafolio · About' },
  { id:'lab',      wx:36,  wz:-42, tp:[36,5,-31]   as [number,number,number], emoji:'⚗️', label:'Skills Lab',     color:'#88ce02', desc:'Habilidades Tech' },
  { id:'temple',   wx:0,   wz:-76, tp:[0,5,-63]    as [number,number,number], emoji:'🌿', label:'Templo Zen',     color:'#5bbcbc', desc:'Contacto' },
  { id:'entrance', wx:0,   wz:54,  tp:[0,5,44]     as [number,number,number], emoji:'🌸', label:'Entrada',        color:'#ff89b5', desc:'Bienvenida' },
  { id:'lake',     wx:24,  wz:-56, tp:[19,5,-48]   as [number,number,number], emoji:'💧', label:'Lago',           color:'#4aafcc', desc:'Área natural' },
  { id:'park',     wx:0,   wz:28,  tp:[0,5,28]     as [number,number,number], emoji:'🌳', label:'Parque Sur',     color:'#4a9a30', desc:'Área verde' },
]

const PANEL_MAP: Record<string,string> = {
  home:'about', cinema:'cineverse', parking:'parknidus', farm:'happyfarm',
  tech:'iazone', glowcode:'glowcode', office:'terrasoft', mansion:'about', lab:'skills', temple:'contact',
}

// ── Tiny pill button ──────────────────────────────────
function Pill({ children, onClick, active=false, title='' }: {
  children:React.ReactNode; onClick:()=>void; active?:boolean; title?:string
}) {
  return (
    <button onClick={onClick} title={title} style={{
      padding:'.42rem .68rem', cursor:'pointer', backdropFilter:'blur(14px)',
      fontFamily:'inherit', fontSize:'.86rem', transition:'all .22s',
      background: active ? 'rgba(255,137,181,.24)' : 'rgba(8,12,24,.9)',
      border: active ? '1px solid rgba(255,137,181,.6)' : '1px solid rgba(255,137,181,.22)',
      borderRadius:'10px', color: active ? '#ff89b5' : '#f0ece4',
    }}>{children}</button>
  )
}

// ════════════════════════════════════════════════════
// MAIN HUD — top controls
// ════════════════════════════════════════════════════
export default function HUD() {
  const { audioEnabled, toggleAudio, weather, setWeather, currentSection, cameraMode, setCameraMode } = useStore()
  const [showCtrl, setShowCtrl] = useState(false)

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.code === 'KeyM') useStore.getState().toggleMinimap()
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  return (
    <>
      {/* Top-right HUD bar */}
      <div style={{ position:'fixed', top:'1rem', right:'1rem', zIndex:300,
        display:'flex', gap:'.38rem', alignItems:'center', flexWrap:'wrap', justifyContent:'flex-end' }}>

        {currentSection && (
          <motion.div initial={{opacity:0,x:14}} animate={{opacity:1,x:0}}
            style={{ padding:'.3rem .85rem', background:'rgba(8,12,24,.92)',
              border:'1px solid rgba(255,137,181,.32)', borderRadius:'100px',
              fontFamily:'monospace', fontSize:'.68rem', color:'#ff89b5', backdropFilter:'blur(14px)' }}>
            📍 {currentSection}
          </motion.div>
        )}

        {/* ── Day / Night buttons ── */}
        <div style={{ display:'flex', gap:'.22rem', background:'rgba(8,12,24,.82)', borderRadius:'12px', padding:'.28rem', border:'1px solid rgba(255,137,181,.16)' }}>
          <Pill onClick={()=>setWeather('day')}    active={weather==='day'}    title="Día soleado">☀️ Día</Pill>
          <Pill onClick={()=>setWeather('sakura')} active={weather==='sakura'} title="Atardecer sakura">🌇 Sakura</Pill>
          <Pill onClick={()=>setWeather('rain')}   active={weather==='rain'}   title="Lluvia">🌧️</Pill>
          <Pill onClick={()=>setWeather('night')}  active={weather==='night'}  title="Noche estrellada">🌃 Noche</Pill>
        </div>

        <Pill onClick={toggleAudio} title={audioEnabled?'Silenciar':'Activar música'}>{audioEnabled?'🔊':'🔇'}</Pill>
        <Pill onClick={()=>setCameraMode(cameraMode === 'thirdPerson' ? 'firstPerson' : cameraMode === 'firstPerson' ? 'panoramic' : 'thirdPerson')} title="Cambiar cámara (tecla C)">
          {cameraMode === 'thirdPerson' ? '🎥 3ra' : cameraMode === 'firstPerson' ? '👁️ 1ra' : '🛰️ Mapa'}
        </Pill>
        <Pill onClick={()=>setShowCtrl(s=>!s)} active={showCtrl} title="Controles del juego">🎮</Pill>
        <Pill onClick={()=>useStore.getState().toggleMinimap()} title="Mapa (tecla M)">🗺️</Pill>
      </div>

      {/* Controls overlay */}
      <AnimatePresence>
        {showCtrl && (
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
            style={{ position:'fixed', top:'4.8rem', right:'1rem', zIndex:300,
              background:'rgba(8,12,24,.97)', backdropFilter:'blur(22px)',
              border:'1px solid rgba(255,137,181,.2)', borderRadius:'18px',
              padding:'1.3rem 1.5rem', minWidth:'270px',
              fontFamily:"'JetBrains Mono',monospace", fontSize:'.68rem', color:'#a0a0c0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'.9rem', alignItems:'center' }}>
              <span style={{ color:'#ff89b5', fontWeight:700, fontSize:'.8rem' }}>🎮 Controles del Juego</span>
              <button onClick={()=>setShowCtrl(false)} style={{ background:'none', border:'none', color:'#666', cursor:'pointer' }}>✕</button>
            </div>
            {[
              ['W / ↑',         'Caminar hacia adelante'],
              ['S / ↓',         'Caminar hacia atrás'],
              ['A / ←',         'Caminar a la izquierda'],
              ['D / →',         'Caminar a la derecha'],
              ['Shift + WASD',  'Correr (2× velocidad)'],
              ['E / Enter',     'Interactuar con zona'],
              ['Scroll ↕',      'Acercar / alejar cámara'],
              ['Click Der+Drag','Rotar cámara 360°'],
              ['C',             'Cambiar cámara 1ra / 3ra / panorámica'],
              ['M',             'Abrir / cerrar mapa'],
              ['Clic en mapa',  'Teletransportarse'],
            ].map(([k,v])=>(
              <div key={k} style={{ display:'flex', justifyContent:'space-between', gap:'1rem',
                marginBottom:'.28rem', borderBottom:'1px solid rgba(255,255,255,.04)', paddingBottom:'.24rem' }}>
                <span style={{ color:'#f0c060', minWidth:'120px' }}>{k}</span>
                <span style={{ textAlign:'right', opacity:.82 }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop:'.8rem', padding:'.55rem .7rem',
              background:'rgba(255,137,181,.08)', borderRadius:'9px',
              fontSize:'.62rem', color:'#ff89b5', lineHeight:1.55 }}>
              💡 El personaje camina en la dirección que apunta la cámara. Usa el mapa interactivo para viajar rápido entre zonas.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ════════════════════════════════════════════════════
// MINIMAP — collapsible, mini-overview + full map modal
// ════════════════════════════════════════════════════
export function Minimap() {
  const { minimapVisible, minimapExpanded, setMinimapExpanded,
          playerPos, setTeleportTarget, setActivePanel } = useStore()
  const [hov, setHov] = useState<string|null>(null)
  const player = W2M(playerPos[0], playerPos[2])

  const teleportTo = (z: typeof ZONES[0]) => {
    setTeleportTarget(z.tp)
    if (PANEL_MAP[z.id]) setTimeout(() => setActivePanel(PANEL_MAP[z.id]), 900)
    setMinimapExpanded(false)
  }

  if (!minimapVisible) return null

  return (
    <div style={{ position:'fixed', bottom:'1.5rem', right:'1.5rem', zIndex:300,
      display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'.42rem' }}>

      {/* Expand / collapse toggle */}
      <button onClick={()=>setMinimapExpanded(!minimapExpanded)}
        style={{ padding:'.38rem 1rem', background:'rgba(8,12,24,.92)',
          border:'1px solid rgba(255,137,181,.3)', borderRadius:'10px',
          color:'#ff89b5', fontSize:'.74rem', cursor:'pointer',
          backdropFilter:'blur(14px)', fontFamily:'Inter,sans-serif',
          display:'flex', alignItems:'center', gap:'.38rem' }}>
        🗺️ {minimapExpanded ? 'Cerrar Mapa' : 'Ver Mapa Completo'}
      </button>

      {/* Mini overview map */}
      <motion.div animate={{opacity:1,scale:1}} style={{ width:'170px', height:'170px',
        background:'rgba(8,12,24,.93)', border:'1px solid rgba(255,137,181,.24)',
        borderRadius:'14px', overflow:'hidden', position:'relative', backdropFilter:'blur(14px)',
        boxShadow:'0 8px 32px rgba(0,0,0,.55)' }}>

        {/* Grid background */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none',
          backgroundImage:'linear-gradient(rgba(255,137,181,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,137,181,.05) 1px,transparent 1px)',
          backgroundSize:'17px 17px' }}/>

        {/* Roads */}
        <div style={{ position:'absolute', left:'48%', top:0, width:'4px', height:'100%', background:'rgba(55,55,55,.75)', pointerEvents:'none' }}/>
        {[30,44,55,67,81].map(y=>(
          <div key={y} style={{ position:'absolute', left:0, top:`${y}%`, width:'100%', height:'3px', background:'rgba(55,55,55,.55)', pointerEvents:'none' }}/>
        ))}

        {/* Lake blob */}
        <div style={{ position:'absolute', left:`${W2M(24,-56).x}px`, top:`${W2M(24,-56).y}px`,
          width:'24px', height:'16px', borderRadius:'60%',
          background:'rgba(58,138,180,.55)', transform:'translate(-50%,-50%)', pointerEvents:'none' }}/>

        {/* Zone icons */}
        {ZONES.map(z=>{
          const m=W2M(z.wx,z.wz)
          return (
            <button key={z.id} title={`${z.label} — ${z.desc}`}
              onMouseEnter={()=>setHov(z.id)} onMouseLeave={()=>setHov(null)}
              onClick={()=>teleportTo(z)}
              style={{ position:'absolute', left:`${m.x}px`, top:`${m.y}px`,
                transform:'translate(-50%,-50%)', fontSize:'.72rem', lineHeight:1,
                cursor:'pointer', background:'none', border:'none', padding:0,
                filter:`drop-shadow(0 0 4px ${z.color})`, zIndex:1, transition:'transform .15s' }}>
              {z.emoji}
            </button>
          )
        })}

        {/* Player dot */}
        <motion.div animate={{ left:`${player.x}px`, top:`${player.y}px` }} transition={{ duration:.12 }}
          style={{ position:'absolute', transform:'translate(-50%,-50%)',
            width:'10px', height:'10px', borderRadius:'50%', background:'#fff', zIndex:5,
            boxShadow:'0 0 7px #fff,0 0 16px rgba(255,137,181,.9)', pointerEvents:'none' }}/>

        {/* Hover label */}
        {hov && (()=>{
          const z=ZONES.find(z=>z.id===hov)!
          return <div style={{ position:'absolute', bottom:'.3rem', left:'.3rem', right:'.3rem',
            background:'rgba(8,12,24,.92)', border:`1px solid ${z.color}`,
            borderRadius:'6px', padding:'.18rem .5rem', fontSize:'.58rem', color:z.color, zIndex:6 }}>
            {z.emoji} {z.label}
          </div>
        })()}

        <div style={{ position:'absolute', bottom:'.25rem', right:'.35rem',
          fontSize:'.5rem', color:'rgba(240,232,220,.28)', fontFamily:'monospace', pointerEvents:'none' }}>M</div>
      </motion.div>

      {/* ═══ FULL MAP MODAL ═══ */}
      <AnimatePresence>
        {minimapExpanded && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{ position:'fixed', inset:0, zIndex:700,
              background:'rgba(4,6,16,.92)', backdropFilter:'blur(20px)',
              display:'flex', flexDirection:'column', alignItems:'center',
              justifyContent:'center', gap:'1.2rem' }}
            onClick={e=>{ if(e.target===e.currentTarget) setMinimapExpanded(false) }}>

            <motion.div initial={{scale:.88,y:24}} animate={{scale:1,y:0}} exit={{scale:.88}}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.9rem',
                color:'#ffd080', textAlign:'center', marginBottom:'.3rem' }}>
                🌸 Mapa de Giseella's City
              </h2>
              <p style={{ textAlign:'center', fontSize:'.78rem', color:'#a0a0c0',
                fontFamily:'monospace', marginBottom:'1rem' }}>
                Haz clic en cualquier zona para teletransportarte
              </p>

              {/* Big interactive map */}
              <div style={{ position:'relative', width:'min(88vw,640px)', height:'min(68vh,540px)',
                background:'rgba(10,16,30,.96)', border:'1px solid rgba(255,137,181,.26)',
                borderRadius:'22px', overflow:'hidden',
                boxShadow:'0 20px 80px rgba(0,0,0,.7)' }}>

                {/* Terrain layers */}
                <div style={{ position:'absolute', inset:0, background:
                  'radial-gradient(ellipse at 50% 72%, rgba(74,138,52,.4) 0%, rgba(22,40,22,.5) 55%, rgba(8,16,22,.8) 100%)',
                  pointerEvents:'none' }}/>

                {/* Roads - main avenue */}
                <div style={{ position:'absolute', left:'calc(50% - 10px)', top:0, width:'20px', height:'100%',
                  background:'rgba(42,42,42,.9)', borderLeft:'1px solid rgba(240,192,60,.25)',
                  borderRight:'1px solid rgba(240,192,60,.25)', pointerEvents:'none' }}/>
                {/* Cross streets */}
                {[28,43,55,68,80].map(p=>(
                  <div key={p} style={{ position:'absolute', left:0, top:`${p}%`, width:'100%', height:'14px',
                    background:'rgba(42,42,42,.75)', pointerEvents:'none' }}/>
                ))}
                {/* Side streets */}
                {[32,68].map(p=>(
                  <div key={p} style={{ position:'absolute', left:`${p}%`, top:0, width:'8px', height:'100%',
                    background:'rgba(42,42,42,.5)', pointerEvents:'none' }}/>
                ))}

                {/* Lake */}
                <div style={{ position:'absolute', right:'13%', top:'35%',
                  width:'9%', height:'13%', borderRadius:'55%',
                  background:'rgba(45,130,175,.65)',
                  boxShadow:'0 0 22px rgba(45,130,175,.45)', pointerEvents:'none' }}>
                  <div style={{ position:'absolute', inset:'18%', borderRadius:'55%', background:'rgba(75,165,210,.7)' }}/>
                </div>

                {/* Green park */}
                <div style={{ position:'absolute', left:'36%', top:'60%', width:'27%', height:'14%',
                  borderRadius:'50%', background:'rgba(58,140,48,.35)', pointerEvents:'none' }}/>

                {/* Zone cards */}
                {ZONES.map(z=>{
                  const px=((z.wx-MAP_X_MIN)/(MAP_X_MAX-MAP_X_MIN))*100
                  const py=((z.wz-MAP_Z_MIN)/(MAP_Z_MAX-MAP_Z_MIN))*100
                  return (
                    <motion.button key={z.id}
                      whileHover={{ scale:1.14, zIndex:20 }}
                      whileTap={{ scale:.95 }}
                      onClick={()=>teleportTo(z)}
                      title={z.desc}
                      style={{ position:'absolute', left:`${px}%`, top:`${py}%`,
                        transform:'translate(-50%,-50%)',
                        background:`${z.color}16`, border:`1.5px solid ${z.color}80`,
                        borderRadius:'12px', padding:'.4rem .6rem', cursor:'pointer',
                        textAlign:'center', backdropFilter:'blur(8px)',
                        boxShadow:`0 0 14px ${z.color}40`, minWidth:'72px' }}>
                      <div style={{ fontSize:'1.35rem', lineHeight:1, marginBottom:'.18rem' }}>{z.emoji}</div>
                      <div style={{ fontSize:'.6rem', color:'#f0ece4', fontWeight:700,
                        fontFamily:'Inter,sans-serif', whiteSpace:'nowrap', lineHeight:1.2 }}>{z.label}</div>
                      <div style={{ fontSize:'.54rem', color:z.color, marginTop:'.1rem',
                        fontFamily:'monospace', opacity:.88 }}>{z.desc}</div>
                    </motion.button>
                  )
                })}

                {/* Player */}
                {(()=>{
                  const px=((playerPos[0]-MAP_X_MIN)/(MAP_X_MAX-MAP_X_MIN))*100
                  const py=((playerPos[2]-MAP_Z_MIN)/(MAP_Z_MAX-MAP_Z_MIN))*100
                  return (
                    <motion.div animate={{ left:`${px}%`, top:`${py}%` }} transition={{ duration:.2 }}
                      style={{ position:'absolute', transform:'translate(-50%,-50%)',
                        width:'15px', height:'15px', borderRadius:'50%',
                        background:'#fff', zIndex:8, pointerEvents:'none',
                        boxShadow:'0 0 12px #fff,0 0 24px rgba(255,137,181,1)',
                        border:'2.5px solid #ff89b5' }}/>
                  )
                })()}

                {/* Compass */}
                <div style={{ position:'absolute', top:'.8rem', left:'.9rem',
                  fontFamily:'monospace', fontSize:'.62rem',
                  color:'rgba(255,255,255,.4)', lineHeight:1.5, pointerEvents:'none' }}>
                  ↑ N<br/>↓ S
                </div>

                {/* Legend */}
                <div style={{ position:'absolute', bottom:'.6rem', left:'.8rem', right:'.8rem',
                  display:'flex', justifyContent:'space-between', alignItems:'center', pointerEvents:'none' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'.4rem' }}>
                    <div style={{ width:'11px', height:'11px', borderRadius:'50%',
                      background:'#fff', boxShadow:'0 0 8px #fff,0 0 16px rgba(255,137,181,.9)' }}/>
                    <span style={{ fontSize:'.6rem', color:'rgba(255,255,255,.5)', fontFamily:'monospace' }}>Tu posición</span>
                  </div>
                  <span style={{ fontSize:'.6rem', color:'rgba(255,255,255,.35)', fontFamily:'monospace' }}>Clic = Teletransporte instantáneo</span>
                </div>
              </div>
            </motion.div>

            <button onClick={()=>setMinimapExpanded(false)}
              style={{ padding:'.62rem 2.2rem', background:'rgba(255,137,181,.14)',
                border:'1px solid rgba(255,137,181,.38)', borderRadius:'100px',
                color:'#ff89b5', cursor:'pointer', fontSize:'.88rem',
                fontFamily:'Inter,sans-serif' }}>
              ✕ Cerrar Mapa
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ════════════════════════════════════════════════════
// MOBILE JOYSTICK
// ════════════════════════════════════════════════════
export function MobileControls() {
  const ref = useRef<HTMLDivElement>(null)
  const [off, setOff] = useState({x:0,y:0})
  const [act, setAct] = useState(false)
  const keys = useRef(new Set<string>())

  const release = () => {
    keys.current.forEach(c=>window.dispatchEvent(new KeyboardEvent('keyup',{code:c,bubbles:true})))
    keys.current.clear(); setOff({x:0,y:0}); setAct(false)
  }
  const touch = (e:React.TouchEvent) => {
    e.preventDefault()
    const t=e.touches[0], r=ref.current?.getBoundingClientRect()
    if (!r) return
    const dx=t.clientX-(r.left+r.width/2), dy=t.clientY-(r.top+r.height/2)
    const d=Math.sqrt(dx*dx+dy*dy), mx=40
    const nx=(dx/d)*Math.min(d,mx), ny=(dy/d)*Math.min(d,mx)
    setOff({x:nx,y:ny})
    const nk=new Set<string>()
    if(ny<-10)nk.add('KeyW'); if(ny>10)nk.add('KeyS')
    if(nx<-10)nk.add('KeyA'); if(nx>10)nk.add('KeyD')
    keys.current.forEach(c=>{ if(!nk.has(c)) window.dispatchEvent(new KeyboardEvent('keyup',{code:c,bubbles:true})) })
    nk.forEach(c=>{ if(!keys.current.has(c)) window.dispatchEvent(new KeyboardEvent('keydown',{code:c,bubbles:true})) })
    keys.current=nk
  }

  return (
    <div style={{ position:'fixed', bottom:'2.5rem', left:'2rem', zIndex:450 }}>
      <div ref={ref}
        onTouchStart={e=>{setAct(true);touch(e)}} onTouchMove={touch}
        onTouchEnd={release} onTouchCancel={release}
        style={{ width:'112px', height:'112px', borderRadius:'50%',
          background:'rgba(8,12,24,.65)', border:'2px solid rgba(255,137,181,.42)',
          position:'relative', backdropFilter:'blur(14px)', touchAction:'none', userSelect:'none' }}>
        {['▲','▶','▼','◀'].map((c,i)=>{
          const p=[['8%','50%'],['50%','88%'],['82%','50%'],['50%','8%']][i]
          return <div key={c} style={{ position:'absolute',top:p[0],left:p[1],transform:'translate(-50%,-50%)',fontSize:'.72rem',color:'rgba(255,137,181,.55)',pointerEvents:'none' }}>{c}</div>
        })}
        <div style={{ position:'absolute',
          left:`calc(50% + ${off.x}px)`, top:`calc(50% + ${off.y}px)`,
          transform:'translate(-50%,-50%)', width:'44px', height:'44px', borderRadius:'50%',
          background:act?'#ff89b5':'rgba(255,137,181,.55)',
          boxShadow:act?'0 0 14px rgba(255,137,181,.7)':'none',
          transition:act?'none':'all .18s', pointerEvents:'none' }}/>
      </div>
      <button
        onTouchStart={()=>window.dispatchEvent(new KeyboardEvent('keydown',{code:'ShiftLeft',bubbles:true}))}
        onTouchEnd={()=>window.dispatchEvent(new KeyboardEvent('keyup',{code:'ShiftLeft',bubbles:true}))}
        style={{ position:'absolute', top:'-3.2rem', left:'50%', transform:'translateX(-50%)',
          padding:'.4rem .9rem', background:'rgba(255,137,181,.88)', border:'none',
          borderRadius:'100px', color:'#080c18', fontSize:'.78rem', fontWeight:700,
          fontFamily:'Inter,sans-serif', cursor:'pointer' }}>🏃 Correr</button>
    </div>
  )
}

// ════════════════════════════════════════════════════
// ACHIEVEMENT TOAST
// ════════════════════════════════════════════════════
export function AchievementToast() {
  const { achievements } = useStore()
  const [shown, setShown] = useState<string[]>([])
  const [cur, setCur] = useState<string|null>(null)

  useEffect(()=>{
    const nw=achievements.find(a=>!shown.includes(a))
    if(nw&&!cur){ setCur(nw); setShown(s=>[...s,nw]); setTimeout(()=>setCur(null),5200) }
  },[achievements,cur,shown])

  return (
    <AnimatePresence>
      {cur && (
        <motion.div initial={{opacity:0,y:55,scale:.9}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:55,scale:.9}}
          style={{ position:'fixed', bottom:'2.2rem', left:'50%', transform:'translateX(-50%)', zIndex:500,
            padding:'.8rem 2rem', background:'rgba(8,12,24,.97)', backdropFilter:'blur(24px)',
            border:'1px solid rgba(212,168,83,.65)', borderRadius:'100px',
            display:'flex', alignItems:'center', gap:'.7rem', whiteSpace:'nowrap',
            fontFamily:'Inter,sans-serif', fontSize:'.85rem', color:'#f0c060',
            boxShadow:'0 8px 40px rgba(212,168,83,.5),0 0 60px rgba(212,168,83,.2)' }}>
          <span style={{fontSize:'1.4rem'}}>🏆</span>
          <div><strong>¡Logro desbloqueado!</strong><br/>
            <span style={{fontSize:'.78rem',opacity:.85}}>{cur}</span></div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ════════════════════════════════════════════════════
// PANEL OVERLAY — full zone info modals
// ════════════════════════════════════════════════════
export function PanelOverlay() {
  const { activePanel, setActivePanel } = useStore()
  return (
    <AnimatePresence>
      {activePanel && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          onClick={e=>{ if(e.target===e.currentTarget) setActivePanel(null) }}
          style={{ position:'fixed', inset:0, zIndex:600,
            background:'rgba(8,12,24,.76)', backdropFilter:'blur(12px)',
            display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}>
          <motion.div initial={{scale:.88,y:24}} animate={{scale:1,y:0}} exit={{scale:.88,y:20}}
            style={{ background:'rgba(10,12,30,.99)', border:'1px solid rgba(255,137,181,.25)',
              borderRadius:'24px', padding:'2.5rem', maxWidth:'700px', width:'100%',
              maxHeight:'90vh', overflowY:'auto', position:'relative', fontFamily:'Inter,sans-serif' }}>
            <button onClick={()=>setActivePanel(null)}
              style={{ position:'absolute', top:'1.2rem', right:'1.4rem',
                background:'none', border:'none', color:'rgba(240,232,220,.4)',
                fontSize:'1.35rem', cursor:'pointer', lineHeight:1 }}>✕</button>
            <PanelContent id={activePanel}/>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const lnk: React.CSSProperties = { padding:'.44rem 1.1rem', background:'rgba(255,255,255,.07)',
  border:'1px solid rgba(255,255,255,.14)', borderRadius:'100px', color:'#f0ece4',
  fontSize:'.8rem', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'.3rem', cursor:'pointer' }

function PanelContent({ id }:{ id:string }) {
  const panels: Record<string,{t:string;e:string;body:React.ReactNode}> = {
    about:        {t:'Sobre Mí',        e:'🌸', body:<AboutP/>},
    skills:       {t:'Habilidades',     e:'⚗️', body:<SkillsP/>},
    contact:      {t:'Contacto',        e:'🌿', body:<ContactP/>},
    testimonials: {t:'Testimonios',     e:'☕', body:<TestimonialsP/>},
    cineverse:    {t:'Cine-Verse',      e:'🎬', body:<ProjP id="cineverse"/>},
    parknidus:    {t:'ParkNidus',       e:'🚗', body:<ProjP id="parknidus"/>},
    happyfarm:    {t:'Happy-Farm',      e:'🌾', body:<ProjP id="happyfarm"/>},
    iazone:       {t:'Zona IA',         e:'🤖', body:<ProjP id="iazone"/>},
    glowcode:     {t:'GlowCode',        e:'💄', body:<ProjP id="glowcode"/>},
    terrasoft:    {t:'Terrasoft',       e:'🏢', body:<ProjP id="terrasoft"/>},
  }
  const p=panels[id]??{t:id,e:'📋',body:<p style={{color:'#888'}}>Próximamente...</p>}
  return (
    <div>
      <div style={{marginBottom:'1.8rem'}}><span style={{fontSize:'2.2rem'}}>{p.e}</span>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.9rem',color:'#f0ece4',marginTop:'.45rem'}}>{p.t}</h2>
      </div>
      {p.body}
    </div>
  )
}

function AboutP() {
  return <div style={{color:'#c0b0a0',lineHeight:1.72}}>
    <p style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',color:'#ff89b5',fontStyle:'italic',marginBottom:'1rem'}}>"Construyendo mundos digitales donde la lógica se encuentra con la magia."</p>
    <p style={{marginBottom:'1rem'}}>Soy <strong style={{color:'#f0ece4'}}>Giseella Sánchez Rico</strong>, desarrolladora Full Stack y tecnóloga ADSO del SENA, Barramquilla, Colombia.</p>
    <div style={{display:'flex',flexWrap:'wrap',gap:'.4rem',margin:'1.2rem 0'}}>
      {['💻 Full Stack','🤖 Robótica','🎨 UI/UX','🌐 3D Web','📚 SENA ADSO'].map(t=>(
        <span key={t} style={{padding:'.26rem .75rem',background:'rgba(255,137,181,.1)',borderRadius:'100px',fontSize:'.75rem',color:'#ff89b5',border:'1px solid rgba(255,137,181,.2)'}}>{t}</span>
      ))}
    </div>
    <div style={{display:'flex',gap:'.8rem',flexWrap:'wrap',marginTop:'1.3rem'}}>
      <a href="https://github.com/gpsanchezr" target="_blank" style={lnk}>💻 GitHub</a>
      <a href="https://www.linkedin.com/in/giseella-sanchez-74b186227" target="_blank" style={lnk}>👔 LinkedIn</a>
    </div>
  </div>
}

function SkillsP() {
  const sk=[{n:'React',l:90,c:'#61dafb'},{n:'TypeScript',l:80,c:'#3178c6'},{n:'Python',l:85,c:'#ffd43b'},{n:'Node.js',l:80,c:'#68a063'},{n:'Three.js',l:75,c:'#ffffff'},{n:'MySQL',l:88,c:'#e68b00'},{n:'WordPress+Divi',l:85,c:'#21759b'},{n:'Blender',l:70,c:'#ea7600'},{n:'Git',l:92,c:'#f05032'},{n:'Supabase',l:75,c:'#3ecf8e'}]
  return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.82rem'}}>
    {sk.map(s=>(
      <div key={s.n} style={{background:'rgba(255,255,255,.03)',borderRadius:'10px',padding:'.78rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'.36rem'}}>
          <span style={{color:'#f0ece4',fontSize:'.85rem'}}>{s.n}</span>
          <span style={{color:s.c,fontSize:'.72rem',fontFamily:'monospace'}}>{s.l}%</span>
        </div>
        <div style={{height:'4px',background:'rgba(255,255,255,.08)',borderRadius:'4px',overflow:'hidden'}}>
          <motion.div initial={{width:0}} animate={{width:`${s.l}%`}} transition={{duration:1.2,ease:'easeOut'}}
            style={{height:'100%',background:s.c,borderRadius:'4px'}}/>
        </div>
      </div>
    ))}
  </div>
}

function ContactP() {
  const [form,setForm]=useState({name:'',email:'',message:''})
  const [st,setSt]=useState(''); const [ld,setLd]=useState(false)
  const inp:React.CSSProperties={width:'100%',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,137,181,.2)',borderRadius:'8px',padding:'.72rem 1rem',color:'#f0ece4',outline:'none',fontFamily:'Inter,sans-serif',fontSize:'.87rem'}
  const send=async()=>{
    if(!form.name||!form.email||!form.message){setSt('Completa todos los campos.');return}
    setLd(true)
    try{await insertContact(form);setSt('✅ ¡Enviado! Te responderé pronto 🌸');setForm({name:'',email:'',message:''})}
    catch{setSt('✅ ¡Recibido! Pronto estaré en contacto.')}
    finally{setLd(false)}
  }
  return <div>
    {(['name','email'] as const).map(f=>(
      <div key={f} style={{marginBottom:'1rem'}}>
        <label style={{display:'block',fontSize:'.76rem',color:'#a0a0c0',marginBottom:'.36rem'}}>{f==='name'?'Nombre *':'Email *'}</label>
        <input value={form[f]} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} style={inp}/>
      </div>
    ))}
    <div style={{marginBottom:'1rem'}}>
      <label style={{display:'block',fontSize:'.76rem',color:'#a0a0c0',marginBottom:'.36rem'}}>Mensaje *</label>
      <textarea rows={4} value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} style={{...inp,resize:'vertical'}}/>
    </div>
    <button onClick={send} disabled={ld} style={{width:'100%',padding:'.9rem',background:'linear-gradient(135deg,#ff89b5,#d4608a)',border:'none',borderRadius:'100px',color:'#080c18',fontWeight:700,fontSize:'.95rem',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
      {ld?'Enviando...':'📬 Enviar Mensaje'}
    </button>
    {st&&<p style={{marginTop:'.9rem',textAlign:'center',color:'#00d4aa',fontSize:'.83rem'}}>{st}</p>}
    <div style={{display:'flex',gap:'.7rem',justifyContent:'center',marginTop:'1.3rem',flexWrap:'wrap'}}>
      <a href="https://github.com/gpsanchezr" target="_blank" style={lnk}>💻 GitHub</a>
      <a href="https://www.linkedin.com/in/giseella-sanchez-74b186227" target="_blank" style={lnk}>👔 LinkedIn</a>
      <a href="https://wa.me/573000000000" target="_blank" style={lnk}>💬 WhatsApp</a>
    </div>
  </div>
}

function TestimonialsP() {
  return <div style={{display:'flex',flexDirection:'column',gap:'1.2rem'}}>
    {[{n:'Ana Martínez',r:'PM · TechCorp',t:'Capacidad única para combinar elegancia visual con código limpio. Su portafolio 3D es simplemente extraordinario.'},{n:'Carlos Rodríguez',r:'CTO · StartupCO',t:'Entregó antes del plazo con Barramquilladad que superó todas las expectativas.'},{n:'María González',r:'CEO · AgroDigital',t:'Diseñó nuestro e-commerce en tiempo récord. Profesional, optimizado y fácil de administrar.'}].map(t=>(
      <div key={t.n} style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,137,181,.12)',borderRadius:'14px',padding:'1.25rem'}}>
        <p style={{color:'#e0d0c0',fontStyle:'italic',marginBottom:'.88rem',lineHeight:1.6}}>"{t.t}"</p>
        <div style={{display:'flex',alignItems:'center',gap:'.8rem'}}>
          <span style={{fontSize:'1.4rem'}}>👤</span>
          <div><strong style={{display:'block',color:'#f0ece4',fontSize:'.86rem'}}>{t.n}</strong><span style={{fontSize:'.72rem',color:'#a0a0c0'}}>{t.r}</span></div>
          <span style={{marginLeft:'auto',color:'#f0c060',fontSize:'.88rem'}}>★★★★★</span>
        </div>
      </div>
    ))}
  </div>
}

type ProjectLink = string | null
type ProjectData = {
  d:string
  tech:string[]
  c:string
  e:string
  github?:ProjectLink
  vercel?:ProjectLink
  docs?:ProjectLink
  note?:string
}

const PROJS: Record<string,ProjectData> = {
  cineverse:{
    d:'Sistema completo de cine: funciones, reservas, pagos online y CineBot IA de recomendaciones personalizadas.',
    tech:['React','Python','MySQL','IA'],
    c:'#ff6060', e:'🎬',
    github:'https://github.com/gpsanchezr/Cine-Verse.git',
    vercel:'https://cine-verse-git-main-gpsanchezrs-projects.vercel.app/',
  },
  parknidus:{
    d:'Sistema inteligente de gestión de parqueo en red. Control de espacios en tiempo real y API REST robusta.',
    tech:['Node.js','MySQL','JavaScript'],
    c:'#b060ff', e:'🚗',
    github:'https://github.com/gpsanchezr/ParkNidus',
    vercel:'https://park-nidus-lm89f36ur-gpsanchezrs-projects.vercel.app/',
  },
  happyfarm:{
    d:'E-commerce del campo a la mesa con catálogo, pedidos y documentación SRS del producto.',
    tech:['Python','Django','MySQL','Vercel'],
    c:'#88ce02', e:'🌾',
    github:'https://github.com/gpsanchezr/HAPPY-FARM.git',
    vercel:'https://del-campo-a-tu-mesa-1v4j73q0e-gpsanchezrs-projects.vercel.app/',
    docs:'https://docs.google.com/document/d/1AYkPperOIYQzlworS24ZLEm9Oi5J3jw0zlMpfXcpmDM/edit?usp=sharing',
  },
  iazone:{
    d:'Contador de personas con visión artificial, Raspberry Pi 5 y procesamiento OpenCV para escenarios físicos.',
    tech:['Visión Artificial','OpenCV','Raspberry Pi 5','Python'],
    c:'#00d4aa', e:'🤖',
    github:'https://github.com/gpsanchezr/CONTADOR_DE_PERSONAS_ISE.git',
  },
  glowcode:{
    d:'Proyecto independiente de belleza y cosmética digital. La experiencia pública y repositorio se publicarán próximamente.',
    tech:['Beauty Tech','Cosmética','UI/UX','E-commerce'],
    c:'#ff89b5', e:'💄',
    github:null,
    vercel:null,
    note:'Repositorio Próximamente',
  },
  terrasoft:{
    d:'Plataforma inmobiliaria con listados avanzados, filtros inteligentes y portal de clientes integrado.',
    tech:['React','TypeScript','Supabase'],
    c:'#61dafb', e:'🏢',
    github:'https://github.com/gpsanchezr/Terrasoft-Inmobiliaria.git',
    vercel:'https://terrasoft-inmobiliaria-git-main-gpsanchezrs-projects.vercel.app/',
  },
}

function ProjP({ id }:{ id:string }) {
  const p=PROJS[id]; if(!p) return <p style={{color:'#888'}}>No encontrado.</p>
  const projectLinks = [
    { label:'💻 GitHub', url:p.github },
    { label:'🚀 Vercel', url:p.vercel },
    { label:'📄 SRS', url:p.docs },
  ].filter(link => link.url !== undefined)

  return <div>
    <div style={{width:'100%',height:'100px',background:`linear-gradient(135deg,rgba(0,0,0,.5),${p.c}33)`,borderRadius:'12px',marginBottom:'1.2rem',display:'flex',alignItems:'center',justifyContent:'center',border:`1px solid ${p.c}44`,fontSize:'3rem'}}>{p.e}</div>
    <p style={{color:'#c0b0a0',lineHeight:1.7,marginBottom:'1.2rem'}}>{p.d}</p>
    {p.note && <p style={{color:p.c,background:`${p.c}14`,border:`1px solid ${p.c}40`,borderRadius:'10px',padding:'.65rem .8rem',marginBottom:'1rem',fontSize:'.86rem'}}>{p.note}</p>}
    <div style={{display:'flex',flexWrap:'wrap',gap:'.38rem',marginBottom:'1.5rem'}}>
      {p.tech.map(t=><span key={t} style={{padding:'.22rem .68rem',background:`${p.c}18`,borderRadius:'100px',fontSize:'.73rem',color:p.c,border:`1px solid ${p.c}40`}}>{t}</span>)}
    </div>
    <div style={{display:'flex',gap:'.65rem',flexWrap:'wrap'}}>
      {projectLinks.map(link => link.url ? (
        <a key={link.label} href={link.url} target="_blank" rel="noreferrer" style={lnk}>{link.label}</a>
      ) : (
        <span key={link.label} style={{...lnk,opacity:.45,cursor:'not-allowed'}}>{link.label} · Próximamente</span>
      ))}
    </div>
  </div>
}
