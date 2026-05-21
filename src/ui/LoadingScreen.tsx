import React, { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'

const TIPS = [
  '🌸 Plantando árboles de cerezo...', '🏡 Construyendo la Mansión Giseella...',
  '🌾 Preparando Happy-Farm...', '🏙️ Levantando el distrito tech...',
  '🤖 Barramquillabrando el lab de IA...', '☕ Encendiendo las luces del café...',
  '🌿 Preparando el Templo Zen...', '✨ Añadiendo partículas mágicas...',
  '👗 Vistiendo a Giseella...', '🎵 Ajustando el audio ambiental...',
]

export default function LoadingScreen() {
  const { progress }       = useProgress()
  const { isLoaded }       = useStore()
  const [tip, setTip]      = useState(0)
  const [dots, setDots]    = useState('')

  useEffect(() => {
    const id = setInterval(() => { setTip(i => (i+1)%TIPS.length) }, 1500)
    return () => clearInterval(id)
  }, [])
  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length < 3 ? d+'.' : ''), 400)
    return () => clearInterval(id)
  }, [])

  const stage = progress < 25 ? 'Iniciando' : progress < 55 ? 'Cargando modelos' : progress < 88 ? 'Construyendo mundo' : 'Casi listo'

  return (
    <AnimatePresence>
      {!isLoaded && (
        <motion.div initial={{ opacity:1 }} exit={{ opacity:0, transition:{ duration:1.1 } }}
          style={{ position:'fixed', inset:0, zIndex:9999,
            background:'linear-gradient(135deg,#080c18 0%,#130a22 50%,#080c18 100%)',
            display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column',
            fontFamily:'Inter, sans-serif',
          }}>

          {/* Floating petals background */}
          <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
            {Array.from({length:22}).map((_,i) => (
              <motion.div key={i}
                style={{ position:'absolute', left:`${(i*4.6)%100}%`, top:'-20px', fontSize:`${.6+i*.04}rem`, opacity:.38 }}
                animate={{ y:'115vh', rotate:720, x:[0,20,-20,0] }}
                transition={{ duration:9+i*.4, delay:i*.28, repeat:Infinity, ease:'linear' }}>
                🌸
              </motion.div>
            ))}
          </div>

          {/* Logo */}
          <motion.div initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1}} transition={{duration:.9,ease:[.25,.46,.45,.94]}}
            style={{ textAlign:'center', marginBottom:'3rem', zIndex:1 }}>
            <motion.div style={{ fontSize:'4.5rem', marginBottom:'.8rem' }}
              animate={{ rotate:[0,12,-12,0] }} transition={{ duration:3.5, repeat:Infinity }}>
              🌸
            </motion.div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2.8rem', color:'#f0ece4', letterSpacing:'.1em', marginBottom:'.35rem' }}>
              Giseella's World
            </h1>
            <p style={{ fontSize:'.8rem', color:'#ff89b5', letterSpacing:'.32em', textTransform:'uppercase' }}>
              Portfolio 3D Interactivo
            </p>
          </motion.div>

          {/* Progress */}
          <div style={{ width:'300px', marginBottom:'2rem', zIndex:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'.5rem' }}>
              <span style={{ fontFamily:'monospace', fontSize:'.7rem', color:'rgba(255,255,255,.35)' }}>
                {stage}{dots}
              </span>
              <span style={{ fontFamily:'monospace', fontSize:'.7rem', color:'rgba(255,255,255,.35)' }}>
                {Math.round(progress)}%
              </span>
            </div>
            <div style={{ height:'3px', background:'rgba(255,255,255,.08)', borderRadius:'3px', overflow:'hidden' }}>
              <motion.div animate={{ width:`${progress}%` }} transition={{ duration:.3 }}
                style={{ height:'100%', background:'linear-gradient(90deg,#ff89b5,#00d4aa,#f0c060)', borderRadius:'3px' }} />
            </div>
          </div>

          {/* Tip */}
          <AnimatePresence mode="wait">
            <motion.p key={tip} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:.38}}
              style={{ fontSize:'.84rem', color:'rgba(255,137,181,.65)', zIndex:1 }}>
              {TIPS[tip]}
            </motion.p>
          </AnimatePresence>

          {/* Controls hint */}
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2.5}}
            style={{ position:'absolute', bottom:'1.8rem', display:'flex', gap:'2rem',
              fontSize:'.68rem', color:'rgba(255,255,255,.2)', fontFamily:'monospace' }}>
            {['WASD · Mover','Shift · Correr','E · Interactuar','Scroll · Zoom','Click der · Rotar'].map(h=><span key={h}>{h}</span>)}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
