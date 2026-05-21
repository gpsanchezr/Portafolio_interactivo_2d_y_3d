import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'

const STEPS = [
  { h:'Bienvenido a...', s:'' },
  { h:'🌸 El Mundo de Giseella', s:'Un jardín digital donde el código y la naturaleza se fusionan' },
  { h:'Explora · Descubre · Conecta', s:'WASD para moverte · E para interactuar · Scroll para hacer zoom' },
]

export default function IntroScreen() {
  const { setIntroComplete, toggleAudio } = useStore()
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (step < STEPS.length - 1) {
      const t = setTimeout(() => setStep(s => s+1), 2500)
      return () => clearTimeout(t)
    }
  }, [step])

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:500,
      background:'rgba(8,12,24,.92)', backdropFilter:'blur(14px)',
      display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column',
      fontFamily:'Inter, sans-serif',
    }}>
      {/* Petals */}
      {Array.from({length:14}).map((_,i) => (
        <motion.div key={i}
          style={{ position:'absolute', left:`${(i*7.2)%100}%`, top:'-25px', fontSize:`${.85+i*.04}rem`, opacity:.42 }}
          animate={{ y:'115vh', rotate:720 }}
          transition={{ duration:9+i*.55, delay:i*.35, repeat:Infinity, ease:'linear' }}>🌸</motion.div>
      ))}

      <AnimatePresence mode="wait">
        <motion.div key={step}
          initial={{opacity:0,y:26,scale:.96}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-18}}
          transition={{duration:.85,ease:[.25,.46,.45,.94]}}
          style={{ textAlign:'center', padding:'2rem', maxWidth:'580px' }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(2rem,5vw,3.8rem)', color:'#f0ece4',
            marginBottom:'1rem', fontStyle:step===1?'italic':'normal',
            textShadow:'0 0 50px rgba(255,137,181,.45)' }}>
            {STEPS[step].h}
          </h2>
          {STEPS[step].s && <p style={{ fontSize:'1rem', color:'#ff89b5', opacity:.85 }}>{STEPS[step].s}</p>}
        </motion.div>
      </AnimatePresence>

      {step === STEPS.length-1 && (
        <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:.55}}
          style={{ marginTop:'3rem', display:'flex', flexDirection:'column', alignItems:'center', gap:'.9rem' }}>
          <motion.button whileHover={{scale:1.06}} whileTap={{scale:.96}}
            onClick={() => { toggleAudio(); setIntroComplete(true) }}
            style={{ padding:'1rem 3rem', background:'linear-gradient(135deg,#ff89b5,#d4608a)',
              border:'none', borderRadius:'100px', fontFamily:'Inter,sans-serif',
              fontSize:'1.05rem', fontWeight:700, color:'#080c18', cursor:'pointer',
              boxShadow:'0 0 50px rgba(255,137,181,.45)' }}>
            🌸 Entrar al Mundo
          </motion.button>
          <p style={{ fontSize:'.7rem', color:'rgba(255,255,255,.26)', fontFamily:'monospace' }}>
            Activa el audio ambiental al entrar
          </p>
        </motion.div>
      )}

      {/* Step dots */}
      <div style={{ position:'absolute', bottom:'2rem', display:'flex', gap:'.5rem' }}>
        {STEPS.map((_,i) => (
          <div key={i} style={{ width:i===step?'24px':'8px', height:'8px', borderRadius:'4px',
            background:i===step?'#ff89b5':'rgba(255,255,255,.18)', transition:'all .35s ease' }} />
        ))}
      </div>
    </div>
  )
}
