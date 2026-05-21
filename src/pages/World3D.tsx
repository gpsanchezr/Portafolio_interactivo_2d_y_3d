import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls, Preload, PerformanceMonitor } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import LoadingScreen from '../ui/LoadingScreen'
import IntroScreen   from '../ui/IntroScreen'
import HUD, { Minimap, AchievementToast, MobileControls, PanelOverlay } from '../ui/HUD'
import World from '../world/World'

const CONTROLS = [
  { name:'forward',  keys:['ArrowUp',    'KeyW'] },
  { name:'backward', keys:['ArrowDown',  'KeyS'] },
  { name:'left',     keys:['ArrowLeft',  'KeyA'] },
  { name:'right',    keys:['ArrowRight', 'KeyD'] },
  { name:'run',      keys:['ShiftLeft',  'ShiftRight'] },
  { name:'interact', keys:['KeyE', 'Enter'] },
]

interface Props { onBack: () => void }

export default function World3DPage({ onBack }: Props) {
  const { isLoaded, introComplete, isMobile } = useStore()

  return (
    <div style={{ width:'100vw', height:'100vh', position:'relative', overflow:'hidden', background:'#f5d8b8' }}>

      {/* Loading + Intro */}
      <LoadingScreen/>
      {isLoaded && !introComplete && <IntroScreen/>}

      {/* In-game UI (shown after intro) */}
      {introComplete && (
        <>
          <HUD/>
          <Minimap/>
          <PanelOverlay/>
          <AchievementToast/>
          {isMobile && <MobileControls/>}
        </>
      )}

      {/* ← Back to 2D Portfolio button */}
      <motion.button
        initial={{ opacity:0, x:-20 }}
        animate={{ opacity:1, x:0 }}
        transition={{ delay:.6 }}
        onClick={onBack}
        style={{
          position:'fixed', top:'1rem', left:'1rem', zIndex:350,
          display:'flex', alignItems:'center', gap:'.4rem',
          padding:'.46rem 1.15rem',
          background:'rgba(8,12,24,.9)',
          border:'1px solid rgba(255,137,181,.42)',
          borderRadius:'100px', color:'#ff89b5',
          fontSize:'.8rem', cursor:'pointer',
          backdropFilter:'blur(14px)',
          fontFamily:'Inter, sans-serif', fontWeight:500,
          boxShadow:'0 4px 20px rgba(0,0,0,.4)',
          transition:'all .25s ease',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,137,181,.15)'
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#ff89b5'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(8,12,24,.9)'
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,137,181,.42)'
        }}
      >
        ← Portafolio 2D
      </motion.button>

      {/* 3D Canvas */}
      <KeyboardControls map={CONTROLS}>
        <Canvas
          shadows="soft"
          gl={{ antialias:true, powerPreference:'high-performance', alpha:false }}
          camera={{ fov:58, near:0.1, far:450, position:[0,15,28] }}
          dpr={[1, isMobile ? 1.5 : 2]}
          style={{ background:'#f5d8b8' }}
        >
          <PerformanceMonitor
            onDecline={() => { /* reduce quality on low-end devices */ }}
          />
          <Suspense fallback={null}>
            <Physics gravity={[0,-30,0]} timeStep="vary">
              <World/>
            </Physics>
            <Preload all/>
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </div>
  )
}
