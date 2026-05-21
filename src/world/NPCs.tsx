import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text, Float } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { useStore } from '../store'

// ── NPC data ─────────────────────────────────────────
const NPC_DATA = [
  {
    id:'react-dev', pos:[-6,0,-22] as [number,number,number],
    name:'Dev Reactivo', color:'#61dafb', skin:'#f0c890',
    hair:'#2a1a0a', shirt:'#0a4a6a',
    dialogues:[
      '⚛️ React hace que las UIs sean declarativas y eficientes!',
      '💡 Los Hooks revolucionaron React: useState, useEffect, useCallback...',
      '🚀 React 18 trae Concurrent Mode para UIs más fluidas.',
      '📦 Redux y Zustand son excelentes para estado global.',
      'useRef es perfecto para acceder al DOM sin re-renders! 🎯',
    ]
  },
  {
    id:'python-dev', pos:[8,0,-8] as [number,number,number],
    name:'Pythonista', color:'#ffd43b', skin:'#c8a070',
    hair:'#1a0a00', shirt:'#1a3a1a',
    dialogues:[
      '🐍 Python es el lenguaje más versátil del mundo!',
      '🤖 Con OpenCV puedes hacer visión por computadora fácilmente.',
      '📊 Pandas y NumPy son esenciales para ciencia de datos.',
      'Django o FastAPI para APIs REST robustas en Python! ⚡',
      '🎓 Python es el lenguaje #1 para aprender a programar.',
    ]
  },
  {
    id:'db-expert', pos:[6,0,12] as [number,number,number],
    name:'DB Master', color:'#e68b00', skin:'#d4a080',
    hair:'#4a2a10', shirt:'#3a1a00',
    dialogues:[
      '🗄️ MySQL es ideal para aplicaciones relacionales estructuradas.',
      '⚡ Supabase = PostgreSQL + Auth + Storage, todo en uno!',
      'Los índices son la clave para queries rápidas en BD. 🔑',
      '📐 El modelo ER define toda la estructura de tu app.',
      '🔐 Siempre usa prepared statements contra SQL injection!',
    ]
  },
  {
    id:'fullstack', pos:[-4,0,-5] as [number,number,number],
    name:'Full Stacker', color:'#ff89b5', skin:'#f5d5b5',
    hair:'#2a1a0a', shirt:'#4a0a6a',
    dialogues:[
      '🌐 Full Stack = dominar tanto frontend como backend!',
      '📱 Responsive Design con CSS Grid y Flexbox es esencial.',
      'REST API + React = combinación perfecta para web apps! 💯',
      '🔄 Git flow: main, develop, feature branches — siempre!',
      '🌸 El mejor código es el que se puede leer fácilmente.',
    ]
  },
  {
    id:'devops', pos:[0,0,-35] as [number,number,number],
    name:'DevOps Ninja', color:'#00d4aa', skin:'#c8b090',
    hair:'#101010', shirt:'#0a2a2a',
    dialogues:[
      '🐋 Docker containeriza tu app para deploy consistente.',
      '☁️ Vercel es perfecto para deployar proyectos Next.js/Vite.',
      'CI/CD con GitHub Actions automatiza testing y deploy! 🤖',
      '📊 Monitoring con Grafana + Prometheus para producción.',
      '🔒 HTTPS, CORS, rate limiting — seguridad desde el inicio!',
    ]
  },
]

// ── Single NPC component ─────────────────────────────
function NPC(props: typeof NPC_DATA[0]) {
  const { pos, name, color, skin, hair, shirt, dialogues } = props
  const { playerPos } = useStore()
  const [dialogue, setDialogue] = useState(0)
  const [showBubble, setShowBubble] = useState(false)
  const bodyRef = useRef<any>(null)
  const groupRef = useRef<THREE.Group>(null)
  const walkRef = useRef({ t: 0, baseX: pos[0], baseZ: pos[2], angle: Math.random()*Math.PI*2 })

  // Wander around spawn point
  useFrame((_, dt) => {
    const w = walkRef.current
    w.t += dt * 0.4
    const nx = w.baseX + Math.sin(w.t) * 3
    const nz = w.baseZ + Math.cos(w.t * 0.7) * 3

    if (bodyRef.current && groupRef.current) {
      const current = bodyRef.current.translation()
      const nextX = current.x + (nx - current.x) * 0.04
      const nextZ = current.z + (nz - current.z) * 0.04
      const dx = nextX - current.x
      const dz = nextZ - current.z
      bodyRef.current.setNextKinematicTranslation({ x: nextX, y: pos[1], z: nextZ })

      // Face direction of movement
      if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
        groupRef.current.rotation.y = Math.atan2(dx, dz)
      }

      // Bob while walking
      groupRef.current.position.y = Math.sin(w.t * 4) * 0.05
    }
  })

  // Check proximity to player
  useEffect(() => {
    const dx = playerPos[0] - pos[0]
    const dz = playerPos[2] - pos[2]
    const dist = Math.sqrt(dx*dx + dz*dz)
    const near = dist < 6
    setShowBubble(near)
    if (near) {
      // Cycle through dialogues
      const id = setInterval(() => setDialogue(d => (d+1)%dialogues.length), 4000)
      return () => clearInterval(id)
    }
  }, [playerPos])

  return (
    <RigidBody ref={bodyRef} type="kinematicPosition" colliders={false} position={pos} enabledRotations={[false,false,false]}>
      <CuboidCollider args={[0.35,1.05,0.35]} position={[0,1.05,0]} />
      <group ref={groupRef}>
      {/* Body */}
      <mesh castShadow position={[0,1.1,0]}>
        <capsuleGeometry args={[0.22,0.55,8,12]}/>
        <meshStandardMaterial color={shirt} roughness={0.8}/>
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0,1.85,0]}>
        <sphereGeometry args={[0.22,12,12]}/>
        <meshStandardMaterial color={skin} roughness={0.8}/>
      </mesh>
      {/* Hair */}
      <mesh castShadow position={[0,1.96,0]}>
        <sphereGeometry args={[0.23,12,12]}/>
        <meshStandardMaterial color={hair} roughness={0.7}/>
      </mesh>
      {/* Eyes */}
      {[-0.08,0.08].map((x,i)=>(
        <mesh key={i} position={[x,1.87,0.2]}>
          <sphereGeometry args={[0.03,6,6]}/>
          <meshStandardMaterial color="#1a1a2a"/>
        </mesh>
      ))}
      {/* Legs */}
      {[-0.12,0.12].map((x,i)=>(
        <mesh key={i} castShadow position={[x,0.42,0]}>
          <capsuleGeometry args={[0.07,0.38,6,8]}/>
          <meshStandardMaterial color="#3a3a5a" roughness={0.9}/>
        </mesh>
      ))}
      {/* Name tag */}
      <Billboard position={[0,2.5,0]}>
        <mesh position={[0,0,0]}>
          <planeGeometry args={[2.2,0.5]}/>
          <meshStandardMaterial color={color} transparent opacity={0.85}/>
        </mesh>
        <Text fontSize={0.22} color="#000000" anchorX="center" anchorY="middle" position={[0,0,0.01]}>
          {name}
        </Text>
      </Billboard>

      {/* Speech bubble */}
      {showBubble && (
        <Billboard position={[0,3.5,0]}>
          <mesh>
            <planeGeometry args={[4.5,1.1]}/>
            <meshStandardMaterial color="#ffffff" transparent opacity={0.92}/>
          </mesh>
          <Text fontSize={0.22} color="#111111" anchorX="center" anchorY="middle"
            maxWidth={4} textAlign="center" position={[0,0,0.01]}>
            {dialogues[dialogue]}
          </Text>
          {/* Bubble tail */}
          <mesh position={[0,-0.7,0]} rotation={[0,0,Math.PI/4]}>
            <planeGeometry args={[0.25,0.25]}/>
            <meshStandardMaterial color="#ffffff" transparent opacity={0.92}/>
          </mesh>
        </Billboard>
      )}

      {/* Interaction hint */}
      {!showBubble && (
        <Float speed={2} floatIntensity={0.3}>
          <Billboard position={[0,2.8,0]}>
            <Text fontSize={0.18} color={color} anchorX="center">
              💬 Acércate
            </Text>
          </Billboard>
        </Float>
      )}
      </group>
    </RigidBody>
  )
}

// ── Animals ──────────────────────────────────────────

function Cow({ position }: { position: [number,number,number] }) {
  const bodyRef = useRef<any>(null)
  const ref = useRef<THREE.Group>(null)
  const t = useRef(Math.random()*Math.PI*2)
  useFrame((_, dt) => {
    t.current += dt * 0.2
    if (bodyRef.current) {
      bodyRef.current.setNextKinematicTranslation({
        x: position[0] + Math.sin(t.current) * 2,
        y: position[1],
        z: position[2] + Math.cos(t.current*0.6) * 2,
      })
    }
    if (ref.current) {
      ref.current.rotation.y = t.current
    }
  })
  return (
    <RigidBody ref={bodyRef} type="kinematicPosition" colliders={false} position={position} enabledRotations={[false,false,false]}>
      <CuboidCollider args={[0.75,0.55,1.25]} position={[0,0.65,0]} />
      <group ref={ref}>
      {/* Body */}
      <mesh castShadow position={[0,0.7,0]}>
        <boxGeometry args={[1.4,0.8,2.4]}/>
        <meshStandardMaterial color="#f0f0e8" roughness={0.9}/>
      </mesh>
      {/* Black spots */}
      {[[0.3,0.3,0.5],[-0.4,0.1,-0.3],[0.1,0.4,-0.8]].map(([x,y,z],i)=>(
        <mesh key={i} castShadow position={[x,0.7+y,z]}>
          <sphereGeometry args={[0.18,8,8]}/>
          <meshStandardMaterial color="#1a1a1a" roughness={0.9}/>
        </mesh>
      ))}
      {/* Head */}
      <mesh castShadow position={[0,0.85,1.4]}>
        <boxGeometry args={[0.7,0.65,0.8]}/>
        <meshStandardMaterial color="#e8e8d8" roughness={0.9}/>
      </mesh>
      {/* Ears */}
      {[-0.45,0.45].map((x,i)=>(
        <mesh key={i} castShadow position={[x,1.1,1.4]}>
          <sphereGeometry args={[0.14,8,8]}/>
          <meshStandardMaterial color="#e8c8b0" roughness={0.9}/>
        </mesh>
      ))}
      {/* Horns */}
      {[-0.25,0.25].map((x,i)=>(
        <mesh key={i} castShadow position={[x,1.3,1.35]} rotation={[0,0,i===0?0.5:-0.5]}>
          <cylinderGeometry args={[0.04,0.02,0.35,6]}/>
          <meshStandardMaterial color="#c8a870" roughness={0.8}/>
        </mesh>
      ))}
      {/* Legs */}
      {[[-0.4,0,-0.7],[0.4,0,-0.7],[-0.4,0,0.7],[0.4,0,0.7]].map(([x,y,z],i)=>(
        <mesh key={i} castShadow position={[x,0.2,z as number]}>
          <cylinderGeometry args={[0.1,0.1,0.55,8]}/>
          <meshStandardMaterial color="#d8d8c8" roughness={0.9}/>
        </mesh>
      ))}
      {/* Tail */}
      <mesh castShadow position={[0,0.7,-1.3]} rotation={[0.5,0,0]}>
        <cylinderGeometry args={[0.04,0.02,0.7,6]}/>
        <meshStandardMaterial color="#c8c8b0" roughness={0.9}/>
      </mesh>
      </group>
    </RigidBody>
  )
}

function Chicken({ position }: { position: [number,number,number] }) {
  const bodyRef = useRef<any>(null)
  const ref = useRef<THREE.Group>(null)
  const t = useRef(Math.random()*100)
  useFrame((_, dt) => {
    t.current += dt * 1.5
    if (bodyRef.current) {
      bodyRef.current.setNextKinematicTranslation({
        x: position[0] + Math.sin(t.current*0.3)*1.5,
        y: position[1],
        z: position[2] + Math.cos(t.current*0.25)*1.5,
      })
    }
    if (ref.current) {
      ref.current.rotation.y = Math.sin(t.current*0.3)
      // Pecking animation
      const headChild = ref.current.children[1]
      if (headChild) headChild.position.z = 0.35 + Math.sin(t.current*3)*0.08
    }
  })
  return (
    <RigidBody ref={bodyRef} type="kinematicPosition" colliders={false} position={position} enabledRotations={[false,false,false]}>
      <CuboidCollider args={[0.35,0.35,0.35]} position={[0,0.35,0]} />
      <group ref={ref} scale={0.7}>
      {/* Body */}
      <mesh castShadow position={[0,0.45,0]}>
        <sphereGeometry args={[0.38,10,10]}/>
        <meshStandardMaterial color="#f8e030" roughness={0.9}/>
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0,0.88,0.35]}>
        <sphereGeometry args={[0.2,10,10]}/>
        <meshStandardMaterial color="#f8e030" roughness={0.9}/>
      </mesh>
      {/* Beak */}
      <mesh castShadow position={[0,0.84,0.56]}>
        <coneGeometry args={[0.06,0.15,6]} />
        <meshStandardMaterial color="#ff8800" roughness={0.7}/>
      </mesh>
      {/* Comb */}
      <mesh castShadow position={[0,1.08,0.35]}>
        <sphereGeometry args={[0.08,6,6]}/>
        <meshStandardMaterial color="#ff2020" roughness={0.7}/>
      </mesh>
      {/* Legs */}
      {[-0.12,0.12].map((x,i)=>(
        <mesh key={i} castShadow position={[x,0.1,0]}>
          <cylinderGeometry args={[0.03,0.03,0.35,6]}/>
          <meshStandardMaterial color="#ff8800"/>
        </mesh>
      ))}
      </group>
    </RigidBody>
  )
}

function Bird({ index }: { index: number }) {
  const ref = useRef<THREE.Group>(null)
  const t = useRef(index * 1.3)
  const r = 25 + index * 8
  const h = 22 + index * 4

  useFrame((_, dt) => {
    t.current += dt * (0.25 + index * 0.04)
    if (ref.current) {
      ref.current.position.set(Math.cos(t.current)*r, h + Math.sin(t.current*2)*2, Math.sin(t.current)*r)
      ref.current.rotation.y = t.current + Math.PI/2
      // Wing flap
      const wings = ref.current.children
      if (wings[1]) wings[1].rotation.z = Math.sin(t.current * 8) * 0.5
      if (wings[2]) wings[2].rotation.z = -Math.sin(t.current * 8) * 0.5
    }
  })

  return (
    <group ref={ref}>
      {/* Body */}
      <mesh castShadow>
        <sphereGeometry args={[0.18,8,8]}/>
        <meshStandardMaterial color="#2a2a3a" roughness={0.8}/>
      </mesh>
      {/* Left wing */}
      <mesh castShadow position={[-0.35,0,0]}>
        <boxGeometry args={[0.5,0.05,0.3]}/>
        <meshStandardMaterial color="#1a1a2a" roughness={0.8}/>
      </mesh>
      {/* Right wing */}
      <mesh castShadow position={[0.35,0,0]}>
        <boxGeometry args={[0.5,0.05,0.3]}/>
        <meshStandardMaterial color="#1a1a2a" roughness={0.8}/>
      </mesh>
      {/* Tail */}
      <mesh castShadow position={[0,0,-0.22]}>
        <coneGeometry args={[0.08,0.28,6]}/>
        <meshStandardMaterial color="#2a2a3a" roughness={0.8}/>
      </mesh>
    </group>
  )
}

function Butterfly({ position }: { position: [number,number,number] }) {
  const ref = useRef<THREE.Group>(null)
  const t = useRef(Math.random()*100)
  useFrame((_, dt) => {
    t.current += dt * 1.2
    if (ref.current) {
      ref.current.position.set(
        position[0] + Math.sin(t.current)*1.5,
        position[1] + 1.5 + Math.sin(t.current*2)*0.5,
        position[2] + Math.cos(t.current)*1.5
      )
      ref.current.rotation.y = t.current
      const wings = ref.current.children
      const flap = Math.sin(t.current*8)*0.6
      if (wings[0]) wings[0].rotation.y = flap
      if (wings[1]) wings[1].rotation.y = -flap
    }
  })
  const colors = ['#ff89b5','#f0c060','#61dafb','#88ce02','#b060ff']
  const c = colors[Math.floor(position[0]+position[2]) % 5]

  return (
    <group ref={ref} position={position} scale={0.4}>
      <mesh castShadow>
        <planeGeometry args={[0.8,1]}/>
        <meshStandardMaterial color={c} transparent opacity={0.85} side={THREE.DoubleSide} emissive={c} emissiveIntensity={0.3}/>
      </mesh>
      <mesh castShadow position={[0.5,0,0]}>
        <planeGeometry args={[0.6,0.8]}/>
        <meshStandardMaterial color={c} transparent opacity={0.85} side={THREE.DoubleSide} emissive={c} emissiveIntensity={0.3}/>
      </mesh>
    </group>
  )
}

// ── Main export ──────────────────────────────────────
export default function NPCs() {
  return (
    <>
      {NPC_DATA.map(npc => <NPC key={npc.id} {...npc}/>)}
      {/* Farm animals */}
      {[[38,0,20],[41,0,25],[35,0,29],[44,0,22]].map((p,i)=>(
        <Cow key={`cow-${i}`} position={p as [number,number,number]}/>
      ))}
      {[[32,0,21],[38,0,32],[42,0,18],[36,0,34]].map((p,i)=>(
        <Chicken key={`chicken-${i}`} position={p as [number,number,number]}/>
      ))}
      {/* Flying birds */}
      {Array.from({length:6},(_,i)=><Bird key={`bird-${i}`} index={i}/>)}
      {/* Butterflies near flowers */}
      {[[-8,0,4],[8,0,4],[-5,0,-5],[5,0,-5],[0,0,8],[-10,0,-5],[10,0,-5]].map((p,i)=>(
        <Butterfly key={`butterfly-${i}`} position={p as [number,number,number]}/>
      ))}
    </>
  )
}
