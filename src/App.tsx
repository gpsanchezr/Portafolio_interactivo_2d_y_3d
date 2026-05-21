import React, { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PortfolioPage from './pages/Portfolio'
import World3DPage   from './pages/World3D'
import './styles/globals.css'

export type View = 'portfolio' | 'world'

export default function App() {
  const [view, setView] = useState<View>('portfolio')
  const goToWorld     = useCallback(() => setView('world'),     [])
  const goToPortfolio = useCallback(() => setView('portfolio'), [])

  return (
    <AnimatePresence mode="wait">
      {view === 'portfolio' ? (
        <motion.div key="pf"
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          exit={{ opacity:0, scale:.97 }}
          transition={{ duration:.45 }}
          style={{ width:'100%', height:'100%' }}
        >
          <PortfolioPage onEnterWorld={goToWorld} />
        </motion.div>
      ) : (
        <motion.div key="w3d"
          initial={{ opacity:0, scale:1.04 }}
          animate={{ opacity:1, scale:1 }}
          exit={{ opacity:0 }}
          transition={{ duration:.55 }}
          style={{ width:'100%', height:'100%' }}
        >
          <World3DPage onBack={goToPortfolio} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
