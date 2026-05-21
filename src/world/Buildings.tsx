/**
 * Buildings.tsx — Ciudad de Giseella · Edificios Procedurales
 * Cada edificio refleja su proyecto correspondiente
 */
import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard, Float, Sparkles } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { useStore } from '../store'

const CDN = 'https://oldvgciksrwujujimepg.supabase.co/storage/v1/object/public/assets-rpg/audio'
const SFX = { open: `${CDN}/open.mp3`, close: `${CDN}/close.mp3` }

function playSound(url: string, vol = 0.5) {
  const a = new Audio(url); a.volume = vol; a.play().catch(() => {})
}

// ── Door proximity hook ──────────────────────────────
function useDoor(pos: [number,number,number], panel: string, range = 4.5) {
  const { playerPos, setActivePanel, activePanel } = useStore()
  const wasNear = useRef(false)

  useEffect(() => {
    const dx = playerPos[0] - pos[0]
    const dz = playerPos[2] - pos[2]
    const dist = Math.sqrt(dx*dx + dz*dz)
    const near = dist < range
    if (near && !wasNear.current) {
      playSound(SFX.open, 0.4)
      setActivePanel(panel)
      wasNear.current = true
    } else if (!near && wasNear.current) {
      playSound(SFX.close, 0.3)
      if (activePanel === panel) setActivePanel(null)
      wasNear.current = false
    }
  }, [playerPos, pos, panel, range, activePanel, setActivePanel])
}

// ── Shared material helper ───────────────────────────
function mat(color: string, roughness = 0.7, metalness = 0, emissive?: string, emissiveIntensity = 0) {
  return <meshStandardMaterial color={color} roughness={roughness} metalness={metalness}
    emissive={emissive ?? '#000000'} emissiveIntensity={emissiveIntensity} />
}

// ══════════════════════════════════════════════════════
// 🎬 CINEMA — Cine-Verse ([-18, 0, -10])
// ══════════════════════════════════════════════════════
export function Cinema() {
  const pos: [number,number,number] = [-34, 0, -18]
  useDoor([-34, 0, -10], 'cineverse', 11)
  const [tick, setTick] = useState(0)
  useEffect(() => { const id = setInterval(() => setTick(t=>t+1), 800); return ()=>clearInterval(id) }, [])
  const marqueeColors = ['#ff0040','#ff8000','#ffff00','#00ff80','#0080ff','#8000ff']

  return (
    <group position={pos}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,0.012,0]}>
          <planeGeometry args={[18,16]} />
          {mat('#2c2e38',0.92,0.1)}
        </mesh>
      </RigidBody>

      <RigidBody key="cinema-physics" type="fixed" colliders="trimesh">
        {/* Main building */}
        <mesh castShadow receiveShadow position={[0,5,0]}>
          <boxGeometry args={[14,10,10]} />
          {mat('#1a0a2a',0.6)}
        </mesh>
        {/* Facade upper */}
        <mesh castShadow position={[0,10.5,0]}>
          <boxGeometry args={[15,1.5,11]} />
          {mat('#2a0a3a',0.5)}
        </mesh>
        {/* Columns */}
        {[-5,-2.5,0,2.5,5].map((x,i)=>(
          <mesh key={i} castShadow position={[x,5.5,5.1]}>
            <cylinderGeometry args={[0.25,0.3,9,10]} />
            {mat('#3a1a5a',0.6)}
          </mesh>
        ))}
      </RigidBody>

      {/* Red carpet entrance */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.02,7]}>
        <planeGeometry args={[6,4]} />
        {mat('#cc1122',0.95)}
      </mesh>

      {/* Marquee sign */}
      <mesh position={[0,8.5,5.15]}>
        <boxGeometry args={[10,2,0.2]} />
        {mat('#0a0a1a',0.4)}
      </mesh>
      {/* Marquee lights */}
      {Array.from({length:16},(_,i)=>(
        <mesh key={i} position={[-7.2+i*1.0,8.5,5.3]}>
          <sphereGeometry args={[0.12,8,8]} />
          <meshStandardMaterial color={marqueeColors[(i+tick)%6]} emissive={marqueeColors[(i+tick)%6]} emissiveIntensity={2}/>
        </mesh>
      ))}

      {/* CINE-VERSE text on marquee */}
      <Billboard position={[0,8.5,5.5]}>
        <Text fontSize={0.7} color="#FFD700" anchorX="center" outlineWidth={0.04} outlineColor="#000">CINE-VERSE</Text>
        <Text position={[0,-1,0]} fontSize={0.3} color="#ff89b5" anchorX="center">Gestión de Cine + CineBot IA</Text>
      </Billboard>

      {/* Windows */}
      {[-4,0,4].map((x,i)=>(
        <mesh key={i} position={[x,6,5.06]}>
          <boxGeometry args={[2,2.5,0.08]} />
          <meshStandardMaterial color="#ffccaa" emissive="#ff8800" emissiveIntensity={0.4} transparent opacity={0.8}/>
        </mesh>
      ))}

      {/* Door */}
      <mesh position={[0,2,5.06]}>
        <boxGeometry args={[2.5,3.8,0.08]} />
        {mat('#4a0a1a',0.5)}
      </mesh>

      {/* Neon cinema sign */}
      <Float speed={2} floatIntensity={0.2}>
        <mesh position={[0,12,0]}>
          <torusGeometry args={[1.5,0.08,8,32]} />
          <meshStandardMaterial color="#ff0040" emissive="#ff0040" emissiveIntensity={3}/>
        </mesh>
      </Float>
      <pointLight position={[0,9,6]} intensity={3} color="#ff0040" distance={12}/>
      <pointLight position={[0,4,6]} intensity={2} color="#ffaa00" distance={8}/>

      <Billboard position={[0,13,0]}>
        <Text fontSize={0.35} color="#ff89b5" anchorX="center">🎬 Acércate para entrar</Text>
      </Billboard>
    </group>
  )
}

// ══════════════════════════════════════════════════════
// 🚗 PARKING — ParkNidus ([-18, 0, 8])
// ══════════════════════════════════════════════════════
export function ParkingLot() {
  const pos: [number,number,number] = [-34, 0, 18]
  useDoor([-34, 0, 28], 'parknidus', 11)

  return (
    <group position={pos}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,0.012,1.5]}>
          <planeGeometry args={[22,19]} />
          {mat('#242838',0.96,0.15)}
        </mesh>
      </RigidBody>

      <RigidBody key="parking-physics" type="fixed" colliders="trimesh">
        {/* Ground floor structure */}
        <mesh castShadow receiveShadow position={[0,1.5,0]}>
          <boxGeometry args={[18,3,14]} />
          {mat('#1a1a2a',0.5,0.4)}
        </mesh>
        {/* 2nd floor */}
        <mesh castShadow receiveShadow position={[0,5,0]}>
          <boxGeometry args={[18,2.5,14]} />
          {mat('#16162a',0.5,0.4)}
        </mesh>
        {/* Ramp between floors */}
        <mesh castShadow receiveShadow rotation={[Math.PI*0.1,0,0]} position={[7,3.5,-5]}>
          <boxGeometry args={[3,0.2,6]} />
          {mat('#222240',0.8)}
        </mesh>
        {/* Columns */}
        {[-6,0,6].map((x,i)=>(
          [-5,5].map((z,j)=>(
            <mesh key={`${i}-${j}`} castShadow position={[x,3.5,z]}>
              <boxGeometry args={[0.5,8,0.5]} />
              {mat('#2a2a4a',0.4,0.5)}
            </mesh>
          ))
        ))}
      </RigidBody>

      {/* Parking spaces lines */}
      {[-6,-2,2,6].map((x,i)=>(
        <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[x,0.05,0]}>
          <planeGeometry args={[0.1,10]} />
          {mat('#ffff00',1)}
        </mesh>
      ))}
      {/* Cars in parking spaces */}
      {[-5,-1,3].map((x,i)=>{
        const colors=['#cc2222','#2244cc','#22aa44']
        return (
          <group key={i} position={[x,0.4,-2]}>
            <mesh castShadow>
              <boxGeometry args={[2.5,0.8,4.5]} />
              {mat(colors[i],0.4,0.2)}
            </mesh>
            <mesh castShadow position={[0,0.7,0]}>
              <boxGeometry args={[2,0.7,2.5]} />
              {mat(colors[i],0.3,0.1)}
            </mesh>
            {[[-0.8,0,-1.5],[ 0.8,0,-1.5],[-0.8,0,1.5],[0.8,0,1.5]].map(([wx,wy,wz],wi)=>(
              <mesh key={wi} position={[wx as number,-0.35,wz as number]} rotation={[Math.PI/2,0,0]}>
                <cylinderGeometry args={[0.35,0.35,0.25,12]} />
                {mat('#111',0.9,0)}
              </mesh>
            ))}
          </group>
        )
      })}

      {/* Entrance gate */}
      <mesh position={[0,1.5,8]}>
        <boxGeometry args={[6,0.2,0.3]} />
        {mat('#b060ff',0.3,0.6)}
      </mesh>

      {/* Neon P sign */}
      <Float speed={1.5} floatIntensity={0.3}>
        <Billboard position={[0,10,0]}>
          <Text fontSize={2} color="#b060ff" anchorX="center" outlineWidth={0.06} outlineColor="#000">P</Text>
          <Text position={[0,-2.5,0]} fontSize={0.4} color="#ffffff" anchorX="center">ParkNidus</Text>
          <Text position={[0,-3.2,0]} fontSize={0.25} color="#b060ff" anchorX="center">Gestión de Parqueo en Red</Text>
        </Billboard>
      </Float>
      <pointLight position={[0,6,0]} intensity={4} color="#b060ff" distance={15}/>
      <Sparkles count={20} scale={[12,8,12]} size={0.8} speed={0.3} color="#b060ff" opacity={0.4}/>
    </group>
  )
}

// ══════════════════════════════════════════════════════
// 🌾 FARM — Happy-Farm ([18, 0, 8])
// ══════════════════════════════════════════════════════
export function Farm() {
  const pos: [number,number,number] = [36, 0, 22]
  useDoor([36, 0, 34], 'happyfarm', 12)

  return (
    <group position={pos}>
      {/* Grass area */}
      <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,0.01,0]}>
        <circleGeometry args={[15,32]} />
        {mat('#3a8022',1)}
      </mesh>

      <RigidBody key="farm-physics" type="fixed" colliders="trimesh">
        {/* Barn main body */}
        <mesh castShadow receiveShadow position={[0,4,-3]}>
          <boxGeometry args={[10,8,9]} />
          {mat('#8B3A1A',0.8)}
        </mesh>
        {/* Barn roof */}
        <mesh castShadow position={[0,8.5,-3]}>
          <coneGeometry args={[7.5,4,4]} />
          {mat('#4a2010',0.7)}
        </mesh>
        {/* Barn door */}
        <mesh position={[0,3,2.06]}>
          <boxGeometry args={[3.5,5.5,0.15]} />
          {mat('#5a2810',0.8)}
        </mesh>
        {/* White trim */}
        <mesh position={[0,8,-3]}>
          <boxGeometry args={[10.2,0.3,9.2]} />
          {mat('#ffffff',0.9)}
        </mesh>
        {/* Silo */}
        <mesh castShadow position={[7,5,-3]}>
          <cylinderGeometry args={[2,2.2,10,16]} />
          {mat('#c8c8a0',0.7)}
        </mesh>
        <mesh castShadow position={[7,10.2,-3]}>
          <coneGeometry args={[2.3,2.5,16]} />
          {mat('#888870',0.7)}
        </mesh>
      </RigidBody>

      {/* Wooden fence */}
      {Array.from({length:12},(_,i)=>{
        const a=(i/12)*Math.PI*2, r=13
        return (
          <group key={i} position={[Math.cos(a)*r,0,Math.sin(a)*r]}>
            <mesh castShadow position={[0,1,0]}>
              <boxGeometry args={[0.2,2,0.2]} />
              {mat('#8B6340',0.9)}
            </mesh>
          </group>
        )
      })}
      {/* Fence rails */}
      {[0.6,1.4].map((h,hi)=>(
        <mesh key={hi} rotation={[-Math.PI/2,0,0]} position={[0,h,0]}>
          <torusGeometry args={[13,0.08,4,32]} />
          {mat('#8B6340',0.9)}
        </mesh>
      ))}

      {/* Sunflowers */}
      {Array.from({length:8},(_,i)=>{
        const a=(i/8)*Math.PI*2, r=10
        return (
          <group key={i} position={[Math.cos(a)*r,0,Math.sin(a)*r]}>
            <mesh castShadow position={[0,1,0]}>
              <cylinderGeometry args={[0.06,0.06,2,6]} />
              {mat('#2a7a10',0.8)}
            </mesh>
            <mesh castShadow position={[0,2.2,0]}>
              <sphereGeometry args={[0.5,10,10]} />
              {mat('#FFD700',0.6)}
            </mesh>
          </group>
        )
      })}

      {/* Haystacks */}
      {[[-4,0,3],[4,0,3]].map(([x,y,z],i)=>(
        <mesh key={i} castShadow receiveShadow position={[x as number,0.8,z as number]}>
          <cylinderGeometry args={[1.2,1.4,1.6,12]} />
          {mat('#d4a832',0.9)}
        </mesh>
      ))}

      <Float speed={0.8} floatIntensity={0.2}>
        <Billboard position={[0,13,-3]}>
          <Text fontSize={0.8} color="#FFD700" anchorX="center" outlineWidth={0.04} outlineColor="#000">🌾 Happy-Farm</Text>
          <Text position={[0,-1,0]} fontSize={0.32} color="#88ce02" anchorX="center">E-commerce · Python · Django</Text>
        </Billboard>
      </Float>
      <pointLight position={[0,5,2]} intensity={2} color="#ffa830" distance={14}/>
    </group>
  )
}

// ══════════════════════════════════════════════════════
// 🤖 TECH ZONE — Zona-IA ([0, 0, -15])
// ══════════════════════════════════════════════════════
export function TechZone() {
  const pos: [number,number,number] = [0, 0, -28]
  useDoor([0, 0, -16], 'iazone', 12)
  const ringRef = useRef<THREE.Mesh>(null)
  const holoRef = useRef<THREE.Mesh>(null)
  useFrame(({clock})=>{
    if(ringRef.current) ringRef.current.rotation.y=clock.elapsedTime*0.8
    if(holoRef.current) holoRef.current.rotation.y=clock.elapsedTime*1.2
  })

  return (
    <group position={pos}>
      {/* Hexagonal base platform */}
      <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,0.02,0]}>
        <circleGeometry args={[11,6]} />
        {mat('#0a0a1a',0.3,0.6)}
      </mesh>
      {/* Grid lines on platform */}
      {[-8,-4,0,4,8].map((v,i)=>(
        <React.Fragment key={i}>
          <mesh rotation={[-Math.PI/2,0,0]} position={[v,0.03,0]}>
            <planeGeometry args={[0.05,22]}/>
            <meshStandardMaterial color="#00d4aa" transparent opacity={0.3}/>
          </mesh>
          <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.03,v]}>
            <planeGeometry args={[22,0.05]}/>
            <meshStandardMaterial color="#00d4aa" transparent opacity={0.3}/>
          </mesh>
        </React.Fragment>
      ))}

      <RigidBody key="iazone-physics" type="fixed" colliders="trimesh">
        {/* Main tower */}
        <mesh castShadow receiveShadow position={[0,6.5,0]}>
          <boxGeometry args={[6,13,6]} />
          {mat('#0a1a2a',0.2,0.7)}
        </mesh>
        {/* Tower glass panels */}
        {[[3.01,0],[-3.01,0],[0,3.01],[0,-3.01]].map(([x,z],i)=>(
          <mesh key={i} position={[x as number,7,z as number]}>
            <planeGeometry args={[5.5,12]} />
            <meshStandardMaterial color="#00d4ff" transparent opacity={0.25} emissive="#004488" emissiveIntensity={0.3} side={THREE.DoubleSide}/>
          </mesh>
        ))}
        {/* Side antennas */}
        {[-3,3].map((x,i)=>(
          <mesh key={i} castShadow position={[x,16,0]}>
            <cylinderGeometry args={[0.08,0.1,4,8]}/>
            {mat('#606070',0.5,0.8)}
          </mesh>
        ))}
      </RigidBody>

      {/* Rotating rings */}
      <mesh ref={ringRef} position={[0,7,0]}>
        <torusGeometry args={[5,0.1,8,64]}/>
        <meshStandardMaterial color="#00d4aa" emissive="#00d4aa" emissiveIntensity={2}/>
      </mesh>
      <mesh rotation={[Math.PI/2,0,0]} position={[0,10,0]}>
        <torusGeometry args={[4,0.08,8,64]}/>
        <meshStandardMaterial color="#0088ff" emissive="#0088ff" emissiveIntensity={2}/>
      </mesh>

      {/* Holographic display */}
      <mesh ref={holoRef} position={[0,4,0]}>
        <octahedronGeometry args={[1.2]}/>
        <meshStandardMaterial color="#00ffaa" emissive="#00ffaa" emissiveIntensity={2} transparent opacity={0.7} wireframe/>
      </mesh>

      {/* Satellite dish */}
      <group position={[5,0,3]}>
        <mesh castShadow position={[0,1.5,0]}>
          <cylinderGeometry args={[0.1,0.1,3,8]}/>
          {mat('#888888',0.5,0.5)}
        </mesh>
        <mesh castShadow rotation={[-Math.PI/3,0,0]} position={[0,3.2,0]}>
          <sphereGeometry args={[1.8,12,12,0,Math.PI*2,0,Math.PI/2]}/>
          {mat('#cccccc',0.3,0.6)}
        </mesh>
      </group>

      <pointLight position={[0,8,0]} intensity={5} color="#00d4aa" distance={18}/>
      <pointLight position={[0,14,0]} intensity={3} color="#0088ff" distance={12}/>
      <Sparkles count={40} scale={[14,18,14]} size={1.2} speed={0.6} color="#00d4ff" opacity={0.6}/>

      <Float speed={1} floatIntensity={0.4}>
        <Billboard position={[0,16,0]}>
          <Text fontSize={0.75} color="#00d4aa" anchorX="center" outlineWidth={0.04} outlineColor="#000">🤖 Zona IA</Text>
          <Text position={[0,-1,0]} fontSize={0.28} color="#60e8cc" anchorX="center" maxWidth={6} textAlign="center">
            Contador IA · Raspberry Pi 5 · OpenCV
          </Text>
        </Billboard>
      </Float>
    </group>
  )
}

// ══════════════════════════════════════════════════════
// 💄 GLOWCODE — Beauty / Cosmetics ([ -18, 0, -30 ])
// ══════════════════════════════════════════════════════
export function GlowCodeBoutique() {
  const pos: [number,number,number] = [-18, 0, -30]
  useDoor([-18, 0, -22], 'glowcode', 10)

  return (
    <group position={pos}>
      <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,0.025,0]}>
        <circleGeometry args={[8,24]} />
        {mat('#452038',0.65,0.1)}
      </mesh>

      <RigidBody key="glowcode-physics" type="fixed" colliders="trimesh">
        <mesh castShadow receiveShadow position={[0,3.2,0]}>
          <boxGeometry args={[7.5,6.4,6.5]} />
          {mat('#2a1024',0.45,0.2)}
        </mesh>
        <mesh castShadow position={[0,6.9,0]}>
          <coneGeometry args={[5.8,2.8,4]} />
          {mat('#d4608a',0.5,0.2)}
        </mesh>
        <mesh position={[0,3.4,3.31]}>
          <planeGeometry args={[6.5,4.8]} />
          <meshStandardMaterial color="#ffb8d8" emissive="#6a2040" emissiveIntensity={0.25} transparent opacity={0.52} side={THREE.DoubleSide}/>
        </mesh>
        <mesh castShadow position={[0,1.55,3.45]}>
          <boxGeometry args={[2.2,3.1,0.12]} />
          {mat('#120816',0.35,0.4)}
        </mesh>
      </RigidBody>

      <Float speed={1.1} floatIntensity={0.25}>
        <Billboard position={[0,9.5,0]}>
          <Text fontSize={0.62} color="#ff89b5" anchorX="center" outlineWidth={0.035} outlineColor="#000">💄 GlowCode</Text>
          <Text position={[0,-0.85,0]} fontSize={0.25} color="#ffd0e8" anchorX="center">Belleza · Cosmética · Próximamente</Text>
        </Billboard>
      </Float>
      <pointLight position={[0,5,4]} intensity={3} color="#ff89b5" distance={13}/>
      <Sparkles count={28} scale={[9,8,9]} size={0.9} speed={0.35} color="#ffb8d8" opacity={0.5}/>
    </group>
  )
}

// ══════════════════════════════════════════════════════
// 🏢 REAL ESTATE — Terrasoft ([18, 0, -10])
// ══════════════════════════════════════════════════════
export function RealEstateOffice() {
  const pos: [number,number,number] = [36, 0, -14]
  useDoor([36, 0, -6], 'terrasoft', 12)

  return (
    <group position={pos}>
      <RigidBody key="terrasoft-physics" type="fixed" colliders="trimesh">
        {/* Modern office building */}
        <mesh castShadow receiveShadow position={[0,7,0]}>
          <boxGeometry args={[10,14,9]} />
          {mat('#e8e0d0',0.6)}
        </mesh>
        {/* Glass facade */}
        <mesh position={[0,8,4.56]}>
          <planeGeometry args={[9,12]}/>
          <meshStandardMaterial color="#88ccff" transparent opacity={0.5} emissive="#4488aa" emissiveIntensity={0.2} side={THREE.DoubleSide}/>
        </mesh>
        {/* Floor dividers */}
        {[2,5,8,11].map((y,i)=>(
          <mesh key={i} castShadow position={[0,y,0]}>
            <boxGeometry args={[10.2,0.25,9.2]}/>
            {mat('#c0b898',0.7)}
          </mesh>
        ))}
        {/* Entrance canopy */}
        <mesh castShadow position={[0,2.5,6]}>
          <boxGeometry args={[6,0.25,3]}/>
          {mat('#d4c8b0',0.6)}
        </mesh>
        <mesh position={[-2.8,1,6.5]}><cylinderGeometry args={[0.15,0.15,2.5,8]}/>{mat('#c0b090',0.7)}</mesh>
        <mesh position={[ 2.8,1,6.5]}><cylinderGeometry args={[0.15,0.15,2.5,8]}/>{mat('#c0b090',0.7)}</mesh>
      </RigidBody>

      {/* "For Sale" signs on lawn */}
      {[[-4,0,6],[4,0,6],[-4,0,-5],[4,0,-5]].map(([x,y,z],i)=>(
        <group key={i} position={[x as number,y as number,z as number]}>
          <mesh position={[0,1,0]}><cylinderGeometry args={[0.05,0.05,2,6]}/>{mat('#888850',0.9)}</mesh>
          <mesh position={[0,2.3,0]}><boxGeometry args={[1.5,0.9,0.08]}/>{mat('#ffffff',0.8)}</mesh>
          <Billboard position={[0,2.3,0.05]}>
            <Text fontSize={0.18} color="#2244aa" anchorX="center">SE VENDE</Text>
          </Billboard>
        </group>
      ))}

      {/* Terrasoft logo sign */}
      <mesh position={[0,14.6,0]}>
        <boxGeometry args={[8,1.2,0.3]}/>
        {mat('#1a3a6a',0.4)}
      </mesh>

      <Float speed={0.8} floatIntensity={0.15}>
        <Billboard position={[0,16,0]}>
          <Text fontSize={0.7} color="#61dafb" anchorX="center" outlineWidth={0.03} outlineColor="#000">🏢 Terrasoft</Text>
          <Text position={[0,-1,0]} fontSize={0.28} color="#aaddff" anchorX="center">Inmobiliaria MonteVerde</Text>
        </Billboard>
      </Float>
      <pointLight position={[0,8,5]} intensity={2.5} color="#88ccff" distance={12}/>
    </group>
  )
}

// ══════════════════════════════════════════════════════
// 🏡 HERO HOUSE ([0, 0, 3])
// ══════════════════════════════════════════════════════
export function HeroHouse() {
  const pos: [number,number,number] = [0, 0, 8]
  useDoor([0, 0, 16], 'about', 10)

  return (
    <group position={pos}>
      {/* Garden */}
      <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,0.01,0]}>
        <circleGeometry args={[10,32]}/>
        {mat('#4a9a30',1)}
      </mesh>

      <RigidBody key="hero-house-physics" type="fixed" colliders="trimesh">
        {/* Main house */}
        <mesh castShadow receiveShadow position={[0,3,0]}>
          <boxGeometry args={[9,6,8]}/>
          {mat('#f0e8d8',0.8)}
        </mesh>
        {/* Roof */}
        <mesh castShadow position={[0,6.8,0]}>
          <coneGeometry args={[7,3.5,4]}/>
          {mat('#c84428',0.7)}
        </mesh>
        {/* Chimney */}
        <mesh castShadow position={[2.5,8,0]}>
          <boxGeometry args={[0.8,1.8,0.8]}/>
          {mat('#8a5a40',0.8)}
        </mesh>
        {/* Porch */}
        <mesh castShadow position={[0,1.5,4.6]}>
          <boxGeometry args={[5,0.2,2]}/>
          {mat('#d4c8a8',0.7)}
        </mesh>
        {[[-1.8,4.6],[1.8,4.6]].map(([x,z],i)=>(
          <mesh key={i} castShadow position={[x,0.9,z as number]}>
            <cylinderGeometry args={[0.15,0.18,1.8,10]}/>
            {mat('#d4c8a8',0.7)}
          </mesh>
        ))}
      </RigidBody>

      {/* Door */}
      <mesh position={[0,1.6,4.06]}>
        <boxGeometry args={[1.8,3,0.1]}/>
        {mat('#5a3010',0.7)}
      </mesh>
      {/* Door knob */}
      <mesh position={[0.65,1.5,4.12]}>
        <sphereGeometry args={[0.1,8,8]}/>
        {mat('#ffd700',0.2,0.8)}
      </mesh>

      {/* Windows */}
      {[[-2.8,3.5,4.06],[2.8,3.5,4.06]].map(([x,y,z],i)=>(
        <mesh key={i} position={[x,y,z as number]}>
          <boxGeometry args={[1.6,1.8,0.09]}/>
          <meshStandardMaterial color="#aaddff" transparent opacity={0.7} emissive="#88aacc" emissiveIntensity={0.3}/>
        </mesh>
      ))}

      {/* Mailbox */}
      <group position={[-5,0,4]}>
        <mesh castShadow position={[0,1,0]}><cylinderGeometry args={[0.06,0.06,2,8]}/>{mat('#888860',0.9)}</mesh>
        <mesh castShadow position={[0,2.2,0]}><boxGeometry args={[0.7,0.5,0.4]}/>{mat('#3a5a8a',0.6)}</mesh>
        <Billboard position={[0,2.6,0]}><Text fontSize={0.18} color="#ffd080" anchorX="center">GS</Text></Billboard>
      </group>

      {/* Path to house */}
      {Array.from({length:4},(_,i)=>(
        <RigidBody key={i} type="fixed" colliders="cuboid">
          <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.055,4.9+i*0.82]}>
            <boxGeometry args={[1.75,0.72]}/>
            {mat('#d7ccb6',0.9)}
          </mesh>
        </RigidBody>
      ))}

      {/* Cherry blossom tree in garden */}
      <group position={[-7.2,0,-2.6]}>
        <mesh castShadow position={[0,3.5,0]}><cylinderGeometry args={[0.22,0.3,7,8]}/>{mat('#5a3010',0.9)}</mesh>
        {[[0,8,0],[1.5,7,1],[-1.5,7,-1],[0,9,1.5]].map(([x,y,z],i)=>(
          <mesh key={i} castShadow position={[x,y,z]}>
            <sphereGeometry args={[1.8+i*0.3,8,8]}/>
            {mat(i%2?'#ff9ec4':'#ffb8d8',0.8)}
          </mesh>
        ))}
        <Sparkles count={30} scale={[5,4,5]} size={1.5} speed={0.4} color="#ffb8d8" opacity={0.7} position={[0,8,0]}/>
      </group>

      <Float speed={0.35} floatIntensity={0.08}>
        <Billboard position={[0,7.35,4.8]}>
          <Text fontSize={0.5} color="#ffd080" anchorX="center" outlineWidth={0.025} outlineColor="#000">🏡 Casa de Giseella</Text>
          <Text position={[0,-0.7,0]} fontSize={0.22} color="#f0e8dc" anchorX="center">Full Stack Developer · SENA ADSO</Text>
        </Billboard>
      </Float>
      <pointLight position={[0,5,4]} intensity={2} color="#ffa830" distance={10}/>
    </group>
  )
}

// ══════════════════════════════════════════════════════
// 🏛️ ZEN TEMPLE — Contacto ([0, 0, -54])
// ══════════════════════════════════════════════════════
export function ZenTemple() {
  const pos: [number,number,number] = [0, 0, -76]
  useDoor([0, 0, -64], 'contact', 12)

  return (
    <group position={pos}>
      {/* Stone platform */}
      <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,0.1,0]}>
        <circleGeometry args={[14,8]}/>
        {mat('#909080',0.95)}
      </mesh>

      <RigidBody key="zen-temple-physics" type="fixed" colliders="trimesh">
        {/* Main hall */}
        <mesh castShadow receiveShadow position={[0,5.5,0]}>
          <boxGeometry args={[13,11,11]}/>
          {mat('#1e2a3a',0.4,0.2)}
        </mesh>
        {/* Curved roof */}
        <mesh castShadow position={[0,11.5,0]}>
          <boxGeometry args={[15,0.6,13]}/>
          {mat('#2a4a3a',0.6)}
        </mesh>
        {/* Roof ridge */}
        <mesh castShadow position={[0,12,0]}>
          <boxGeometry args={[15.5,0.4,0.4]}/>
          {mat('#3a6a4a',0.6)}
        </mesh>
        {/* Torii gate posts */}
        {[-6,6].map((x,i)=>(
          <mesh key={i} castShadow position={[x,4,7.5]}>
            <cylinderGeometry args={[0.3,0.36,8,12]}/>
            {mat('#c84820',0.6)}
          </mesh>
        ))}
        {/* Torii top beams */}
        <mesh castShadow position={[0,8.5,7.5]}><boxGeometry args={[14,0.55,0.55]}/>{mat('#c84820',0.6)}</mesh>
        <mesh castShadow position={[0,7.2,7.5]}><boxGeometry args={[12.5,0.4,0.4]}/>{mat('#c84820',0.6)}</mesh>
        {/* Windows */}
        {[-3.5,0,3.5].map((x,i)=>(
          <mesh key={i} position={[x,6,5.56]}>
            <boxGeometry args={[2,3,0.07]}/>
            <meshStandardMaterial color="#5bbcbc" emissive="#5bbcbc" emissiveIntensity={0.6} transparent opacity={0.5}/>
          </mesh>
        ))}
      </RigidBody>

      {/* Stone lanterns along path */}
      {[-4,0,4].map((x,i)=>(
        <group key={i} position={[x,0,8]}>
          <mesh castShadow position={[0,0.6,0]}><cylinderGeometry args={[0.3,0.4,1.2,8]}/>{mat('#909080',0.9)}</mesh>
          <mesh castShadow position={[0,1.4,0]}><cylinderGeometry args={[0.06,0.06,0.8,8]}/>{mat('#808070',0.9)}</mesh>
          <mesh position={[0,1.9,0]}><boxGeometry args={[0.5,0.5,0.5]}/><meshStandardMaterial color="#ffe8b0" emissive="#ff8030" emissiveIntensity={0.8} transparent opacity={0.8}/></mesh>
          <pointLight position={[0,1.9,0]} intensity={2} color="#ff8030" distance={5}/>
        </group>
      ))}

      {/* Zen garden (raked gravel) */}
      <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,0.12,4]}>
        <planeGeometry args={[10,6]}/>
        {mat('#d0c8b0',0.95)}
      </mesh>

      <pointLight position={[0,7,0]} intensity={4} color="#5bbcbc" distance={20}/>
      <Sparkles count={30} scale={[14,12,14]} size={0.8} speed={0.3} color="#5bbcbc" opacity={0.4}/>

      <Float speed={0.5} floatIntensity={0.2}>
        <Billboard position={[0,14,0]}>
          <Text fontSize={0.7} color="#5bbcbc" anchorX="center" outlineWidth={0.03} outlineColor="#000">🌿 Templo Zen · Contacto</Text>
          <Text position={[0,-1,0]} fontSize={0.28} color="#a0d0c0" anchorX="center">Acércate para contactar</Text>
        </Billboard>
      </Float>
    </group>
  )
}

// ══════════════════════════════════════════════════════
// 🔬 SKILLS LAB ([22, 0, -25])
// ══════════════════════════════════════════════════════
export function SkillsLab() {
  const pos: [number,number,number] = [36, 0, -42]
  useDoor([36, 0, -31], 'skills', 11)
  const antennaRef = useRef<THREE.Group>(null)
  useFrame(({clock})=>{if(antennaRef.current) antennaRef.current.rotation.y=clock.elapsedTime*1.5})

  return (
    <group position={pos}>
      <RigidBody key="skills-lab-physics" type="fixed" colliders="trimesh">
        <mesh castShadow receiveShadow position={[0,4.5,0]}>
          <boxGeometry args={[9,9,9]}/>
          {mat('#1a2a3a',0.3,0.5)}
        </mesh>
        {/* Dome */}
        <mesh castShadow position={[0,9.4,0]}>
          <sphereGeometry args={[5,16,16,0,Math.PI*2,0,Math.PI/2]}/>
          {mat('#2a3a4a',0.2,0.6)}
        </mesh>
        {/* Window strips */}
        {[-3,0,3].map((x,i)=>(
          <mesh key={i} position={[x,5.5,4.56]}>
            <boxGeometry args={[1.5,6,0.08]}/>
            <meshStandardMaterial color="#88ce02" emissive="#88ce02" emissiveIntensity={0.8} transparent opacity={0.6}/>
          </mesh>
        ))}
      </RigidBody>

      {/* Spinning antenna */}
      <group ref={antennaRef} position={[0,12,0]}>
        <mesh castShadow><cylinderGeometry args={[0.06,0.06,4,8]}/>{mat('#60606a',0.5,0.8)}</mesh>
        <mesh position={[0,2.5,0]}><sphereGeometry args={[0.22,10,10]}/><meshStandardMaterial color="#88ce02" emissive="#88ce02" emissiveIntensity={3}/></mesh>
        <pointLight position={[0,2.5,0]} intensity={3} color="#88ce02" distance={8}/>
      </group>

      {/* Skill orbs around building */}
      {['React','Python','Node','MySQL','Three.js','Git'].map((skill,i)=>{
        const a=(i/6)*Math.PI*2, r=7
        const colors=['#61dafb','#ffd43b','#68a063','#e68b00','#ffffff','#f05032']
        return (
          <Float key={skill} speed={1.5+i*0.2} floatIntensity={0.4}>
            <mesh position={[Math.cos(a)*r,3+Math.sin(i),Math.sin(a)*r]}>
              <icosahedronGeometry args={[0.5,0]}/>
              <meshStandardMaterial color={colors[i]} emissive={colors[i]} emissiveIntensity={1.5} roughness={0.1}/>
            </mesh>
          </Float>
        )
      })}

      <Float speed={0.8} floatIntensity={0.2}>
        <Billboard position={[0,16,0]}>
          <Text fontSize={0.7} color="#88ce02" anchorX="center" outlineWidth={0.03} outlineColor="#000">⚗️ Skills Lab</Text>
          <Text position={[0,-1,0]} fontSize={0.28} color="#aaee44" anchorX="center">Laboratorio Tecnológico</Text>
        </Billboard>
      </Float>
      <pointLight position={[0,5,5]} intensity={3} color="#88ce02" distance={14}/>
    </group>
  )
}

// ══════════════════════════════════════════════════════
// 🌸 MANSION — About ([-22, 0, -25])
// ══════════════════════════════════════════════════════
export function MansionAbout() {
  const pos: [number,number,number] = [-36, 0, -42]
  useDoor([-36, 0, -30], 'about', 11)

  return (
    <group position={pos}>
      {/* Estate grounds */}
      <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,0.01,0]}>
        <circleGeometry args={[13,32]}/>
        {mat('#3a7a22',1)}
      </mesh>

      <RigidBody key="mansion-physics" type="fixed" colliders="trimesh">
        {/* Mansion body */}
        <mesh castShadow receiveShadow position={[0,5.5,0]}>
          <boxGeometry args={[12,11,10]}/>
          {mat('#e8d5b0',0.7)}
        </mesh>
        {/* Mansard roof */}
        <mesh castShadow position={[0,11.5,0]}>
          <boxGeometry args={[12.5,1.5,10.5]}/>
          {mat('#6a4a30',0.7)}
        </mesh>
        <mesh castShadow position={[0,13,0]}>
          <boxGeometry args={[10,2.5,8]}/>
          {mat('#5a3a22',0.7)}
        </mesh>
        {/* Columns */}
        {[-3.5,0,3.5].map((x,i)=>(
          <mesh key={i} castShadow position={[x,4.5,5.1]}>
            <cylinderGeometry args={[0.28,0.32,9,12]}/>
            {mat('#f0e8d0',0.7)}
          </mesh>
        ))}
        {/* Balcony */}
        <mesh castShadow position={[0,7.5,5.4]}>
          <boxGeometry args={[8,0.2,1.5]}/>
          {mat('#d4c8a0',0.7)}
        </mesh>
        {/* Windows */}
        {[-3.5,0,3.5].map((x,i)=>(
          <React.Fragment key={i}>
            <mesh position={[x,5,5.07]}>
              <boxGeometry args={[1.8,2.5,0.08]}/>
              <meshStandardMaterial color="#aaddff" transparent opacity={0.7} emissive="#88aacc" emissiveIntensity={0.3}/>
            </mesh>
            <mesh position={[x,8.5,5.07]}>
              <boxGeometry args={[1.8,2,0.08]}/>
              <meshStandardMaterial color="#aaddff" transparent opacity={0.7} emissive="#88aacc" emissiveIntensity={0.3}/>
            </mesh>
          </React.Fragment>
        ))}
      </RigidBody>

      {/* Entrance path */}
      {Array.from({length:6},(_,i)=>(
        <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[0,0.02,5.5+i*1.3]}>
          <boxGeometry args={[2.5,1.1]}/>
          {mat('#c8b898',0.9)}
        </mesh>
      ))}

      {/* Gate posts */}
      {[-4,4].map((x,i)=>(
        <group key={i} position={[x,0,11]}>
          <mesh castShadow position={[0,2,0]}><boxGeometry args={[0.6,4,0.6]}/>{mat('#c8b898',0.8)}</mesh>
          <mesh castShadow position={[0,4.3,0]}><sphereGeometry args={[0.4,8,8]}/>{mat('#c8b898',0.8)}</mesh>
        </group>
      ))}

      <Float speed={0.7} floatIntensity={0.2}>
        <Billboard position={[0,16,0]}>
          <Text fontSize={0.7} color="#ffd080" anchorX="center" outlineWidth={0.03} outlineColor="#000">🏡 Mansión Giseella</Text>
          <Text position={[0,-1,0]} fontSize={0.28} color="#f0e8dc" anchorX="center">Sobre Mí · Portfolio</Text>
        </Billboard>
      </Float>
      <pointLight position={[0,6,5]} intensity={2} color="#ffa830" distance={14}/>
    </group>
  )
}

// ══════════════════════════════════════════════════════
// ENTRANCE ARCH ([0, 0, 22])
// ══════════════════════════════════════════════════════
export function CityEntrance() {
  const glowRef = useRef<THREE.Mesh>(null)
  useFrame(({clock})=>{
    if(glowRef.current){
      const m = glowRef.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 0.8+Math.sin(clock.elapsedTime*1.5)*0.4
    }
  })

  return (
    <group position={[0,0,54]}>
      {/* Arch posts */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[0.55,4.25,0.55]} position={[-6,4.25,0]} />
        <CuboidCollider args={[0.55,4.25,0.55]} position={[6,4.25,0]} />
        <CuboidCollider args={[5.25,0.65,0.55]} position={[0,9.5,0]} />
        {[-6,6].map((x,i)=>(
          <mesh key={i} castShadow receiveShadow position={[x,4.25,0]}>
            <boxGeometry args={[1.1,8.5,1.1]}/>
            {mat('#2a1a0a',0.7)}
          </mesh>
        ))}
        {/* Top arch beam */}
        <mesh castShadow position={[0,9.5,0]}>
          <boxGeometry args={[10.5,1.3,1.1]}/>
          {mat('#2a1a0a',0.7)}
        </mesh>
      </RigidBody>
      {/* Arch curve */}
      <mesh ref={glowRef} position={[0,8.8,0]}>
        <torusGeometry args={[4.7,0.22,8,24,Math.PI]}/>
        <meshStandardMaterial color="#ff89b5" emissive="#ff89b5" emissiveIntensity={0.8}/>
      </mesh>

      {/* Welcome sign */}
      <Billboard position={[0,11.4,0]}>
        <Text fontSize={0.56} color="#ffd080" anchorX="center" outlineWidth={0.035} outlineColor="#000">
          🌸 Giseella's World
        </Text>
        <Text position={[0,-0.82,0]} fontSize={0.27} color="#f0e8dc" anchorX="center">
          Portafolio Interactivo
        </Text>
        <Text position={[0,-1.28,0]} fontSize={0.18} color="#00d4aa" anchorX="center">
          Bienvenido · Welcome · Bienvenue
        </Text>
      </Billboard>

      {/* Neon strips on arch */}
      {[...Array(12)].map((_,i)=>(
        <mesh key={i} position={[-4.5+i*0.82,9.5,0]}>
          <sphereGeometry args={[0.1,8,8]}/>
          <meshStandardMaterial color="#ff89b5" emissive="#ff89b5" emissiveIntensity={2}/>
        </mesh>
      ))}
      <pointLight position={[0,12,0]} intensity={4} color="#ff89b5" distance={15}/>
    </group>
  )
}
