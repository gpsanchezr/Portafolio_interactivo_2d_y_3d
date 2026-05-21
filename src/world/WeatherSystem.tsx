import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Cloud } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'

// ── Animated Sun ──────────────────────────────────────
export function Sun() {
  const ref = useRef<THREE.Group>(null)
  const raysRef = useRef<THREE.Mesh[]>([])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime * 0.04
    ref.current.position.set(Math.cos(t) * 140, 60 + Math.sin(t) * 80, -100)
  })

  return (
    <group ref={ref}>
      {/* Sun core */}
      <mesh>
        <sphereGeometry args={[8, 16, 16]} />
        <meshStandardMaterial color="#FFF176" emissive="#FFD600" emissiveIntensity={3} />
      </mesh>
      {/* Sun glow halo */}
      <mesh>
        <sphereGeometry args={[13, 16, 16]} />
        <meshStandardMaterial color="#FF8F00" emissive="#FF6D00" emissiveIntensity={1} transparent opacity={0.18} />
      </mesh>
      <pointLight intensity={5} color="#FFE57F" distance={500} />
    </group>
  )
}

// ── Moon + stars ──────────────────────────────────────
export function Moon() {
  const ref = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime * 0.04 + Math.PI
    ref.current.position.set(Math.cos(t) * 140, 60 + Math.sin(t) * 80, -100)
  })

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[6, 16, 16]} />
        <meshStandardMaterial color="#F5F5DC" emissive="#E8E8C0" emissiveIntensity={1.2} />
      </mesh>
      {/* Shadow sphere for crescent effect */}
      <mesh position={[3, 1, 0.5]}>
        <sphereGeometry args={[5.5, 16, 16]} />
        <meshStandardMaterial color="#080c18" transparent opacity={0.85} />
      </mesh>
      <pointLight intensity={2.5} color="#C8D8FF" distance={400} />
    </group>
  )
}

// ── Starfield ─────────────────────────────────────────
export function StarField() {
  const { positions, sizes } = useMemo(() => {
    const count = 1200
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const r     = 180 + Math.random() * 30
      positions[i*3]   = r * Math.sin(phi) * Math.cos(theta)
      positions[i*3+1] = Math.abs(r * Math.cos(phi)) + 15
      positions[i*3+2] = r * Math.sin(phi) * Math.sin(theta)
      sizes[i] = 0.3 + Math.random() * 0.8
    }
    return { positions, sizes }
  }, [])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('size',     new THREE.BufferAttribute(sizes, 1))
    return g
  }, [positions, sizes])

  const twinkleRef = useRef<THREE.Points>(null)
  useFrame(({ clock }) => {
    if (twinkleRef.current) {
      const m = twinkleRef.current.material as THREE.PointsMaterial
      m.opacity = 0.75 + Math.sin(clock.elapsedTime * 0.8) * 0.2
    }
  })

  return (
    <points ref={twinkleRef} geometry={geo}>
      <pointsMaterial color="#ffffff" size={0.55} transparent opacity={0.85} sizeAttenuation />
    </points>
  )
}

// ── Dynamic sky background ────────────────────────────
const DAY_SKY   = new THREE.Color('#87CEEB')
const SUNSET_SKY= new THREE.Color('#FF7043')
const NIGHT_SKY = new THREE.Color('#06060F')
const SAKURA_SKY= new THREE.Color('#FFCDD2')
const RAIN_SKY  = new THREE.Color('#455A64')

export function DynamicSky() {
  const { scene } = useThree()
  const { weather } = useStore()

  useFrame(({ clock }) => {
    const t = Math.sin(clock.elapsedTime * 0.03) * 0.5 + 0.5

    let skyColor: THREE.Color
    let fogColor: string
    let fogDensity: number

    switch (weather) {
      case 'night':
        skyColor   = NIGHT_SKY.clone()
        fogColor   = '#06060F'
        fogDensity = 0.003
        break
      case 'rain':
        skyColor   = RAIN_SKY.clone()
        fogColor   = '#455A64'
        fogDensity = 0.007
        break
      case 'sakura':
        skyColor   = SAKURA_SKY.clone().lerp(SUNSET_SKY, t * 0.3)
        fogColor   = '#FFCDD2'
        fogDensity = 0.004
        break
      default: // day
        skyColor   = DAY_SKY.clone().lerp(SUNSET_SKY, t * 0.25)
        fogColor   = '#C8E6FF'
        fogDensity = 0.004
    }

    scene.background = skyColor
    scene.fog = new THREE.FogExp2(fogColor, fogDensity)
  })

  return null
}

// ── Sakura petals (instanced) ─────────────────────────
function SakuraPetals({ count = 250 }: { count?: number }) {
  const ref   = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const data  = useMemo(() => Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 180, y: Math.random() * 40 + 5,
    z: (Math.random() - 0.5) * 180,
    vy: -(Math.random() * 1.4 + 0.4), vx: (Math.random() - 0.5) * 0.2,
    phase: Math.random() * Math.PI * 2, swing: Math.random() * 1.5 + 0.3,
    rx: Math.random() * Math.PI, rxv: (Math.random() - 0.5) * 2.5,
    size: 0.04 + Math.random() * 0.09,
  })), [count])

  useFrame((_, dt) => {
    if (!ref.current) return
    const t = Date.now() * 0.001
    data.forEach((p, i) => {
      p.y += p.vy * dt
      p.x += (Math.sin(t * p.swing + p.phase) * 0.3 + p.vx) * dt
      p.rx += p.rxv * dt
      if (p.y < -2) { p.y = 42; p.x = (Math.random() - 0.5) * 180 }
      dummy.position.set(p.x, p.y, p.z)
      dummy.rotation.set(p.rx, p.rx * 0.5, 0)
      dummy.scale.setScalar(p.size)
      dummy.updateMatrix()
      ref.current!.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial color="#FFB8D8" side={THREE.DoubleSide} transparent opacity={0.88} roughness={0.9} />
    </instancedMesh>
  )
}

// ── Rain ──────────────────────────────────────────────
function Rain({ count = 900 }: { count?: number }) {
  const ref   = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const drops = useMemo(() => Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 180, y: Math.random() * 55,
    z: (Math.random() - 0.5) * 180, speed: 14 + Math.random() * 9,
  })), [count])

  useFrame((_, dt) => {
    if (!ref.current) return
    drops.forEach((d, i) => {
      d.y -= d.speed * dt
      if (d.y < 0) { d.y = 55; d.x = (Math.random()-0.5)*180; d.z = (Math.random()-0.5)*180 }
      dummy.position.set(d.x, d.y, d.z)
      dummy.scale.set(0.02, 0.3, 0.02)
      dummy.updateMatrix()
      ref.current!.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <cylinderGeometry args={[1, 1, 1, 4]} />
      <meshStandardMaterial color="#90CAF9" transparent opacity={0.42} />
    </instancedMesh>
  )
}

// ── Fireflies (night) ─────────────────────────────────
function Fireflies({ count = 65 }: { count?: number }) {
  const ref   = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const flies = useMemo(() => Array.from({ length: count }, () => ({
    x: (Math.random()-0.5)*100, y: 0.5+Math.random()*6, z: (Math.random()-0.5)*100,
    phase: Math.random()*Math.PI*2, spd: 0.22+Math.random()*0.5,
  })), [count])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    flies.forEach((f, i) => {
      const bright = (Math.sin(t*f.spd+f.phase)+1)/2
      dummy.position.set(f.x+Math.sin(t*0.3+f.phase)*3, f.y+Math.sin(t*0.5+f.phase)*0.5, f.z+Math.cos(t*0.3+f.phase)*3)
      dummy.scale.setScalar(bright * 0.14 + 0.04)
      dummy.updateMatrix()
      ref.current!.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial color="#CCFF90" emissive="#CCFF90" emissiveIntensity={3} transparent opacity={0.9} />
    </instancedMesh>
  )
}

// ── Clouds (daytime) ──────────────────────────────────
function DayClouds() {
  return (
    <>
      <Cloud position={[-55, 55, -70]} opacity={0.38} speed={0.07} bounds={[24, 7, 8]} segments={12} color="#FFFFFF" />
      <Cloud position={[65, 60, -55]} opacity={0.30} speed={0.05} bounds={[20, 6, 7]} segments={10} color="#FFF8F0" />
      <Cloud position={[30, 52, 70]}  opacity={0.32} speed={0.09} bounds={[18, 6, 7]} segments={10} color="#FFFFFF" />
      <Cloud position={[-70, 58, 40]} opacity={0.26} speed={0.06} bounds={[28, 8, 9]} segments={12} color="#FFF0F8" />
      <Cloud position={[10, 65, -30]} opacity={0.22} speed={0.04} bounds={[22, 7, 8]} segments={11} color="#FFFFFF" />
    </>
  )
}

// ── Main export ───────────────────────────────────────
export default function WeatherSystem() {
  const { weather } = useStore()
  const isNight  = weather === 'night'
  const isSakura = weather === 'sakura'
  const isRain   = weather === 'rain'
  const isDay    = weather === 'day'

  return (
    <>
      <DynamicSky />
      <Sun />
      <Moon />
      {isNight && <><StarField /><Fireflies /></>}
      {(isSakura || isDay) && <SakuraPetals count={isSakura ? 260 : 80} />}
      {isRain && <Rain />}
      {!isNight && !isRain && <DayClouds />}
    </>
  )
}
