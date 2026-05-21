/**
 * World.tsx — Giseella's City · Complete 3D World
 * Dense low-poly city: cobblestone plazas, sakura trees,
 * river, bridge, lake, all buildings grounded at y=0
 */
import React, { Suspense, useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float, Billboard, Sparkles, ContactShadows, Environment, useProgress } from '@react-three/drei'
import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { useStore } from '../store'
import Character from './Character'
import CameraController from './CameraController'
import WeatherSystem from './WeatherSystem'
import NPCs from './NPCs'
import LakeComponent from './LakeComponent'
import {
  Cinema, ParkingLot, Farm, TechZone, RealEstateOffice,
  HeroHouse, ZenTemple, SkillsLab, MansionAbout, CityEntrance,
  GlowCodeBoutique
} from './Buildings'

// ── Audio ─────────────────────────────────────────────
const CDN = 'https://oldvgciksrwujujimepg.supabase.co/storage/v1/object/public/assets-rpg'
let _bg: HTMLAudioElement | null = null
export function setAudio(on: boolean) {
  if (!_bg) { _bg = new Audio(`${CDN}/audio/background.mp3`); _bg.loop = true; _bg.volume = 0.18 }
  on ? _bg.play().catch(()=>{}) : _bg.pause()
}

// ═══════════════════════════════════════════════════
// GROUND — terracotta cobblestone style (ref image)
// ═══════════════════════════════════════════════════
function CityGround() {
  return (
    <group name="city-ground">
      {/* Main terrain */}
      <RigidBody type="fixed" colliders={false} name="ground">
        <CuboidCollider args={[130,0.12,130]} position={[0,-0.08,0]} />
        <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,-0.01,0]}>
          <planeGeometry args={[260,260]} />
          <meshStandardMaterial color="#4a8a38" roughness={1} />
        </mesh>
      </RigidBody>

      {/* Central terracotta plaza */}
      <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,0.01,0]}>
        <circleGeometry args={[26,8]} />
        <meshStandardMaterial color="#c8855a" roughness={0.88} />
      </mesh>

      {/* Cobblestone tile grid on plaza */}
      {Array.from({length:9},(_,ix)=>Array.from({length:9},(_,iz)=>{
        const x=-8+ix*2, z=-8+iz*2
        return (
          <mesh key={`tile-${ix}-${iz}`} receiveShadow rotation={[-Math.PI/2,0,0]} position={[x,0.02,z]}>
            <planeGeometry args={[1.88,1.88]}/>
            <meshStandardMaterial color={((ix+iz)%2===0)?'#c07a4a':'#b87040'} roughness={0.92}/>
          </mesh>
        )
      }))}

      {/* Stone paths connecting buildings */}
      {[
        {x:0, z:-18, w:4, h:112, r:0},
        {x:0, z:18,  w:4, h:46, r:0},
        {x:-18,z:-18,w:4, h:34, r:Math.PI/2},
        {x:18, z:-18,w:4, h:34, r:Math.PI/2},
        {x:-18,z:18, w:4, h:34, r:Math.PI/2},
        {x:18, z:18, w:4, h:34, r:Math.PI/2},
        {x:-18,z:-42,w:4, h:34, r:Math.PI/2},
        {x:18, z:-42,w:4, h:34, r:Math.PI/2},
        {x:0, z:-66, w:4, h:24, r:0},
      ].map((p,i)=>(
        <mesh key={`path-${i}`} receiveShadow rotation={[-Math.PI/2,0,p.r]} position={[p.x,0.006,p.z]}>
          <planeGeometry args={[p.w,p.h]}/>
          <meshStandardMaterial color="#d4b896" roughness={0.9}/>
        </mesh>
      ))}

      <group name="Road">
        {[
          {x:0, z:-18, w:7, h:142, r:0},
          {x:0, z:18,  w:76, h:7, r:Math.PI/2},
          {x:0, z:-18, w:76, h:7, r:Math.PI/2},
          {x:0, z:-42, w:78, h:7, r:Math.PI/2},
        ].map((p,i)=>(
          <mesh key={`road-${i}`} receiveShadow rotation={[-Math.PI/2,0,p.r]} position={[p.x,0.01,p.z]}>
            <planeGeometry args={[p.w,p.h]}/>
            <meshStandardMaterial color="#303030" roughness={0.97}/>
          </mesh>
        ))}

        {Array.from({length:21},(_,i)=>(
          <mesh key={`dash-${i}`} receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,0.025,-86+i*7]}>
            <planeGeometry args={[0.18,3.4]}/>
            <meshStandardMaterial color="#f0c040" roughness={1}/>
          </mesh>
        ))}
      </group>

      {/* Grass zones between buildings */}
      {[
        [-44,0,18], [44,0,22], [-44,0,-18], [44,0,-14],
        [-42,0,-42],[42,0,-42],[-18,0,36],[18,0,36],
        [-18,0,-64],[18,0,-64],[0,0,30],
      ].map(([x,y,z],i)=>(
        <mesh key={`grass-${i}`} receiveShadow rotation={[-Math.PI/2,0,0]} position={[x,0.005,z as number]}>
          <circleGeometry args={[8+i%3,12]}/>
          <meshStandardMaterial color="#5aaa3a" roughness={1}/>
        </mesh>
      ))}
    </group>
  )
}

// ═══════════════════════════════════════════════════
// LAKE + RIVER (east side)
// ═══════════════════════════════════════════════════
function WaterFeatures() {
  const waterRef = useRef<THREE.Mesh>(null)
  useFrame(({clock}) => {
    if (waterRef.current) {
      const m = waterRef.current.material as THREE.MeshStandardMaterial
      m.roughness = 0.03 + Math.sin(clock.elapsedTime*0.5)*0.02
    }
  })

  return (
    <group name="water-features">
      {/* Main lake */}
      <group position={[24,-0.28,-56]}>
        <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,-0.12,0]} scale={[9.5,7.5,1]}>
          <circleGeometry args={[1,24]}/>
          <meshStandardMaterial color="#285a6a" roughness={1}/>
        </mesh>
        <mesh ref={waterRef} rotation={[-Math.PI/2,0,0]} position={[0,0,0]} scale={[9,7,1]}>
          <circleGeometry args={[1,24]}/>
          <meshStandardMaterial color="#3a8aaa" roughness={0.03} metalness={0.3} transparent opacity={0.88}/>
        </mesh>
        {/* Sandy shore */}
        <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.06,0]}>
          <ringGeometry args={[9,11,24]}/>
          <meshStandardMaterial color="#9a8868" roughness={0.95}/>
        </mesh>
        {/* Lily pads */}
        {Array.from({length:10},(_,i)=>{
          const a=(i/10)*Math.PI*2, rx=Math.cos(a)*5.5, rz=Math.sin(a)*4.5
          return (
            <mesh key={i} rotation={[-Math.PI/2,0,a]} position={[rx,0.05,rz]}>
              <circleGeometry args={[0.55,10]}/>
              <meshStandardMaterial color="#2a8a3a" roughness={0.8}/>
            </mesh>
          )
        })}
        <Sparkles count={25} scale={[16,2,12]} size={0.6} speed={0.3} color="#88ddff" opacity={0.4}/>
        <pointLight position={[0,2,0]} intensity={2} color="#4aafcc" distance={16}/>
      </group>

      {/* Small river flowing south from lake */}
      {Array.from({length:6},(_,i)=>(
        <mesh key={`river-${i}`} receiveShadow rotation={[-Math.PI/2,0,0]} position={[19,-0.18,-48+i*4]}>
          <planeGeometry args={[3.5,4.2]}/>
          <meshStandardMaterial color="#3a8aaa" roughness={0.04} transparent opacity={0.82}/>
        </mesh>
      ))}
    </group>
  )
}

// ═══════════════════════════════════════════════════
// BRIDGE over river
// ═══════════════════════════════════════════════════
function Bridge() {
  return (
    <group position={[15,-0.05,-46]}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow position={[0,0.35,0]}>
          <boxGeometry args={[3.5,0.42,7]}/>
          <meshStandardMaterial color="#9a8a6a" roughness={0.82}/>
        </mesh>
      </RigidBody>
      {[-1.55,1.55].map((x,i)=>(
        <group key={i}>
          <mesh castShadow position={[x,0.9,0]}>
            <boxGeometry args={[0.14,1.0,7]}/>
            <meshStandardMaterial color="#7a6a4a" roughness={0.85}/>
          </mesh>
          {[-3,-1.5,0,1.5,3].map((z,j)=>(
            <mesh key={j} castShadow position={[x,0.6,z]}>
              <cylinderGeometry args={[0.08,0.08,0.85,8]}/>
              <meshStandardMaterial color="#8a7a5a" roughness={0.85}/>
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

// ═══════════════════════════════════════════════════
// TREES — low-poly reference style
// ═══════════════════════════════════════════════════
type TV = 'sakura'|'orange'|'green'|'pine'|'autumn'

function LPTree({ p, v='green', s=1 }: { p:[number,number,number]; v?:TV; s?:number }) {
  const cfg: Record<TV,{t:string;c:[string,string,string]}> = {
    sakura: {t:'#5a3010',c:['#ff9ec4','#ffb8d8','#ffd0e8']},
    orange: {t:'#5a3010',c:['#e86820','#f07830','#d05010']},
    green:  {t:'#4a2e10',c:['#3a8820','#4a9a2a','#2a7a10']},
    pine:   {t:'#4a2e10',c:['#1a5a18','#1a6a20','#0a4a10']},
    autumn: {t:'#5a3010',c:['#d04020','#e05030','#c03010']},
  }
  const { t, c } = cfg[v]
  return (
    <RigidBody type="fixed" colliders={false} position={p}>
      <CylinderCollider args={[1.6*s,0.32*s]} position={[0,1.6*s,0]} />
      <group scale={s}>
        {/* Trunk */}
        <mesh castShadow position={[0,1.5,0]}>
          <cylinderGeometry args={[0.18,0.28,3,8]}/>
          <meshStandardMaterial color={t} roughness={0.9}/>
        </mesh>
        {v==='pine' ? (
          <>
            <mesh castShadow position={[0,4.2,0]}><coneGeometry args={[2.2,3.5,8]}/><meshStandardMaterial color={c[0]} roughness={0.8}/></mesh>
            <mesh castShadow position={[0,5.8,0]}><coneGeometry args={[1.6,2.8,8]}/><meshStandardMaterial color={c[1]} roughness={0.8}/></mesh>
            <mesh castShadow position={[0,7.1,0]}><coneGeometry args={[1.0,2.2,8]}/><meshStandardMaterial color={c[2]} roughness={0.8}/></mesh>
          </>
        ) : (
          <>
            <mesh castShadow position={[0,4.5,0]}><sphereGeometry args={[2.1,7,6]}/><meshStandardMaterial color={c[0]} roughness={0.8}/></mesh>
            <mesh castShadow position={[0.5,5.8,0.4]}><sphereGeometry args={[1.5,6,5]}/><meshStandardMaterial color={c[1]} roughness={0.8}/></mesh>
            <mesh castShadow position={[-0.3,6.6,-0.2]}><sphereGeometry args={[1.0,6,5]}/><meshStandardMaterial color={c[2]} roughness={0.8}/></mesh>
            {[0,1,2,3].map(k=>{
              const a=(k/4)*Math.PI*2
              return <mesh key={k} castShadow position={[Math.cos(a)*1.4,4.8,Math.sin(a)*1.4]}>
                <sphereGeometry args={[0.9,5,4]}/><meshStandardMaterial color={c[k%2===0?0:2]} roughness={0.8}/>
              </mesh>
            })}
          </>
        )}
        {v==='sakura' && (
          <Sparkles count={16} scale={[5,4,5]} size={1.2} speed={0.4} color="#ffb8d8" opacity={0.6} position={[0,5.5,0]}/>
        )}
      </group>
    </RigidBody>
  )
}

// Dense bush (low-poly blob)
function Bush({ p, c='#3a8820', s=1 }: { p:[number,number,number]; c?:string; s?:number }) {
  return (
    <group position={p} scale={s}>
      <mesh castShadow position={[0,0.55,0]}><sphereGeometry args={[0.7,7,6]}/><meshStandardMaterial color={c} roughness={0.85}/></mesh>
      <mesh castShadow position={[0.45,0.5,0.2]}><sphereGeometry args={[0.55,6,5]}/><meshStandardMaterial color={c} roughness={0.85}/></mesh>
      <mesh castShadow position={[-0.4,0.45,-0.2]}><sphereGeometry args={[0.5,6,5]}/><meshStandardMaterial color={c} roughness={0.85}/></mesh>
    </group>
  )
}

// Flower (stem + bloom)
function Flower({ p, c='#ff89b5' }: { p:[number,number,number]; c?:string }) {
  return (
    <group position={p}>
      <mesh castShadow position={[0,0.2,0]}><cylinderGeometry args={[0.03,0.03,0.4,5]}/><meshStandardMaterial color="#3a7a18"/></mesh>
      <mesh castShadow position={[0,0.45,0]}><sphereGeometry args={[0.13,7,7]}/><meshStandardMaterial color={c} roughness={0.6} emissive={c} emissiveIntensity={0.12}/></mesh>
    </group>
  )
}

// Lamp post (reference image style)
function LampPost({ p }: { p:[number,number,number] }) {
  return (
    <group position={p}>
      <mesh castShadow position={[0,2.5,0]}><cylinderGeometry args={[0.06,0.1,5,8]}/><meshStandardMaterial color="#3a3a4a" roughness={0.5} metalness={0.7}/></mesh>
      <mesh castShadow position={[0,5.1,0]}><boxGeometry args={[0.08,0.08,1.1]}/><meshStandardMaterial color="#3a3a4a" roughness={0.5} metalness={0.7}/></mesh>
      <mesh position={[0.48,5.1,0]}><sphereGeometry args={[0.24,10,10]}/><meshStandardMaterial color="#fffdd0" emissive="#ffee80" emissiveIntensity={1.5}/></mesh>
      <pointLight position={[0.48,5.1,0]} intensity={2.5} color="#ffee88" distance={9}/>
    </group>
  )
}

// Wooden bench (reference image style)
function Bench({ p, r=0 }: { p:[number,number,number]; r?:number }) {
  return (
    <group position={p} rotation={[0,r,0]}>
      <mesh castShadow receiveShadow position={[0,0.48,0]}><boxGeometry args={[2.2,0.1,0.65]}/><meshStandardMaterial color="#8B5A2B" roughness={0.8}/></mesh>
      <mesh castShadow receiveShadow position={[0,0.82,-0.27]}><boxGeometry args={[2.2,0.6,0.08]}/><meshStandardMaterial color="#8B5A2B" roughness={0.8}/></mesh>
      {[-0.9,0.9].map((x,i)=>[-0.25,0.25].map((z,j)=>(
        <mesh key={`${i}${j}`} castShadow position={[x,0.22,z]}><boxGeometry args={[0.08,0.44,0.08]}/><meshStandardMaterial color="#6B3A1A" roughness={0.9}/></mesh>
      )))}
    </group>
  )
}

// Fence segment
function Fence({ p, r=0, w=3 }: { p:[number,number,number]; r?:number; w?:number }) {
  return (
    <group position={p} rotation={[0,r,0]}>
      {Array.from({length:Math.floor(w/0.7)+1},(_,i)=>(
        <mesh key={i} castShadow position={[i*0.7-w/2,0.6,0]}>
          <boxGeometry args={[0.1,1.2,0.1]}/><meshStandardMaterial color="#8a6340" roughness={0.9}/>
        </mesh>
      ))}
      <mesh castShadow position={[0,0.85,0]}><boxGeometry args={[w,0.1,0.1]}/><meshStandardMaterial color="#8a6340" roughness={0.9}/></mesh>
      <mesh castShadow position={[0,0.45,0]}><boxGeometry args={[w,0.1,0.1]}/><meshStandardMaterial color="#8a6340" roughness={0.9}/></mesh>
    </group>
  )
}

// 3D extruded city name letters (reference image)
// ═══════════════════════════════════════════════════
// DENSE NATURE — fills every gap (reference image style)
// ═══════════════════════════════════════════════════
function CityNature() {
  // 40 border trees in ring
  const borderTrees = useMemo(() => Array.from({length:42},(_,i)=>{
    const a=(i/42)*Math.PI*2, r=58+(i%5)*8
    const variants:TV[]=['sakura','sakura','orange','green','pine','autumn']
    const x = Math.cos(a)*r
    const z = Math.sin(a)*r
    const safeX = Math.abs(x) < 8 ? (i % 2 === 0 ? -12 : 12) : x
    return { p:[safeX,0,z] as [number,number,number], v:variants[i%6] as TV, s:0.7+(i%4)*0.18 }
  }),[])

  // Street-side trees
  const streetTrees = useMemo<{p:[number,number,number];v:TV;s?:number}[]>(() => [
    ...Array.from({length:12},(_,i)=>({p:[12,0,-82+i*9] as [number,number,number],v:'green' as TV, s:0.72+(i%3)*0.05})),
    ...Array.from({length:12},(_,i)=>({p:[-12,0,-82+i*9] as [number,number,number],v:'sakura' as TV, s:0.72+(i%3)*0.05})),
    ...Array.from({length:5},(_,i) =>({p:[46,0,-38+i*11] as [number,number,number],v:'orange' as TV})),
    ...Array.from({length:5},(_,i) =>({p:[-46,0,-38+i*11] as [number,number,number],v:'autumn' as TV})),
    {p:[-22,0,2] as [number,number,number],v:'sakura' as TV},
    {p:[22,0,2] as [number,number,number],v:'green' as TV},
    {p:[-24,0,30] as [number,number,number],v:'orange' as TV},
    {p:[24,0,30] as [number,number,number],v:'sakura' as TV},
  ], [])

  // Scattered bushes — reference image has them everywhere
  const bushes: {p:[number,number,number];c:string}[] = [
    {p:[15,0,8],c:'#3a8820'},{p:[-15,0,8],c:'#ff9ec4'},{p:[15,0,-8],c:'#3a8820'},
    {p:[-15,0,-8],c:'#ff9ec4'},{p:[24,0,0],c:'#4a9a2a'},{p:[-24,0,0],c:'#3a8820'},
    {p:[18,0,34],c:'#ff9ec4'},{p:[42,0,12],c:'#3a8820'},{p:[-42,0,12],c:'#4a9a2a'},
    {p:[42,0,-28],c:'#3a8820'},{p:[-42,0,-28],c:'#ff9ec4'},{p:[16,0,-62],c:'#3a8820'},
    {p:[30,0,-54],c:'#4a9a2a'},{p:[-30,0,-54],c:'#3a8820'},{p:[48,0,-4],c:'#ff9ec4'},
    {p:[-48,0,-4],c:'#3a8820'},{p:[14,0,42],c:'#4a9a2a'},{p:[-14,0,42],c:'#3a8820'},
  ]

  // Scattered flowers — very dense near plaza
  const flowers: {p:[number,number,number];c:string}[] = [
    ...Array.from({length:24},(_,i)=>{
      const a=(i/24)*Math.PI*2, r=9+Math.sin(i)*3
      const cols=['#ff89b5','#f0c060','#b060ff','#60e8cc','#ff6060','#88ce02']
      return {p:[Math.cos(a)*r,0,Math.sin(a)*r] as [number,number,number],c:cols[i%6]}
    }),
    ...Array.from({length:30},(_,i)=>{
      const a=(i/30)*Math.PI*2, r=14+Math.cos(i)*4
      return {p:[Math.cos(a)*r,0,Math.sin(a)*r] as [number,number,number],c:['#ff89b5','#ffd080','#88ce02'][i%3]}
    }),
  ]

  // Lamp posts along main road
  const lamps: [number,number,number][] = [
    [5.4,0,34],[5.4,0,22],[5.4,0,10],[5.4,0,-2],[5.4,0,-14],[5.4,0,-26],[5.4,0,-38],[5.4,0,-50],[5.4,0,-62],
    [-5.4,0,34],[-5.4,0,22],[-5.4,0,10],[-5.4,0,-2],[-5.4,0,-14],[-5.4,0,-26],[-5.4,0,-38],[-5.4,0,-50],[-5.4,0,-62],
    [22,0,18],[-22,0,18],[22,0,-18],[-22,0,-18],[22,0,-42],[-22,0,-42],
  ]

  // Benches
  const benches: {p:[number,number,number];r:number}[] = [
    {p:[10,0,7],r:1.2},{p:[-10,0,7],r:-1.2},{p:[10,0,-8],r:0.8},{p:[-10,0,-8],r:-0.8},
    {p:[0,0,-64],r:0},{p:[11,0,-64],r:1.4},{p:[-11,0,-64],r:-1.4},
    {p:[0,0,30],r:Math.PI/2},{p:[12,0,30],r:Math.PI/2},{p:[-12,0,30],r:Math.PI/2},
  ]

  // Fences bordering certain areas
  const fences = [
    {p:[28,0,32] as [number,number,number],r:0,w:5},
    {p:[-28,0,32] as [number,number,number],r:0,w:5},
    {p:[52,0,8] as [number,number,number],r:Math.PI/2,w:5},
    {p:[-52,0,8] as [number,number,number],r:Math.PI/2,w:5},
  ]

  return (
    <group name="city-nature">
      <group name="city-border-trees">
        {borderTrees.map((t,i)=><LPTree key={`bt${i}`} p={t.p} v={t.v} s={t.s}/>)}
      </group>
      <group name="city-street-trees">
        {streetTrees.map((t,i)=><LPTree key={`st${i}`} p={t.p} v={t.v} s={t.s ?? 0.9}/>)}
      </group>
      <group name="city-bushes">
        {bushes.map((b,i)=><Bush key={`b${i}`} p={b.p} c={b.c} s={0.8+i%3*0.15}/>)}
      </group>
      <group name="city-flowers">
        {flowers.map((f,i)=><Flower key={`f${i}`} p={f.p} c={f.c}/>)}
      </group>
      <group name="city-props">
        {lamps.map((p,i)=><LampPost key={`lp${i}`} p={p}/>)}
        {benches.map((b,i)=><Bench key={`bn${i}`} p={b.p} r={b.r}/>)}
        {fences.map((f,i)=><Fence key={`fn${i}`} p={f.p} r={f.r} w={f.w}/>)}
      </group>
    </group>
  )
}

// ═══════════════════════════════════════════════════
// FOUNTAIN + WELCOME
// ═══════════════════════════════════════════════════
function HeroFountain() {
  const crystalRef = useRef<THREE.Mesh>(null)
  useFrame(({clock})=>{ if(crystalRef.current) crystalRef.current.rotation.y=clock.elapsedTime*0.7 })

  return (
    <group position={[0,0,-1]}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow position={[0,0.45,0]}>
          <cylinderGeometry args={[2.6,3.0,0.9,8]}/>
          <meshStandardMaterial color="#b0a888" roughness={0.75}/>
        </mesh>
        <mesh position={[0,0.92,0]}>
          <cylinderGeometry args={[2.3,2.3,0.1,8]}/>
          <meshStandardMaterial color="#5599cc" roughness={0.04} metalness={0.3} transparent opacity={0.9}/>
        </mesh>
        <mesh castShadow position={[0,1.2,0]}>
          <cylinderGeometry args={[0.15,0.22,0.8,10]}/>
          <meshStandardMaterial color="#c8b890" roughness={0.8}/>
        </mesh>
      </RigidBody>
      <Float speed={2.2} floatIntensity={0.7}>
        <mesh ref={crystalRef} position={[0,2.2,0]}>
          <octahedronGeometry args={[0.65]}/>
          <meshStandardMaterial color="#e8a4c8" emissive="#e8a4c8" emissiveIntensity={2.5} transparent opacity={0.9}/>
        </mesh>
        <pointLight position={[0,2.2,0]} intensity={6} color="#e8a4c8" distance={18}/>
      </Float>
      <Sparkles count={55} scale={[10,10,10]} size={1.2} speed={0.4} color="#ffd080" opacity={0.5}/>
    </group>
  )
}

// ═══════════════════════════════════════════════════
// SOUTH PARK
// ═══════════════════════════════════════════════════
function SouthPark() {
  const parkFlowers = useMemo(() => Array.from({length:20},(_,i)=>{
    const a=(i/20)*Math.PI*2, r=4+((i*7)%10)/10*3
    return { p:[Math.cos(a)*r,0,Math.sin(a)*r] as [number,number,number], c:['#ff89b5','#ffd080','#88ce02','#b060ff'][i%4] }
  }), [])

  return (
    <group name="south-park" position={[0,0,28]}>
      <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,0.004,0]}>
        <circleGeometry args={[9,16]}/>
        <meshStandardMaterial color="#4a9a30" roughness={1}/>
      </mesh>
      {[[-7,0,-5],[7,0,-5],[-9,0,0],[9,0,0],[-7,0,6],[7,0,6]].map(([x,y,z],i)=>(
        <LPTree key={i} p={[x,y,z]} v={i%2===0?'sakura':'green'} s={0.9}/>
      ))}
      {/* Dense flowers in park */}
      {parkFlowers.map((f,i)=><Flower key={i} p={f.p} c={f.c}/>)}
      <Bench p={[-4,0,0]} r={Math.PI/2}/><Bench p={[4,0,0]} r={-Math.PI/2}/>
      <Bench p={[0,0,-3]} r={0}/><Bench p={[0,0,3]} r={Math.PI}/>
      {/* Small gazebo */}
      <mesh castShadow position={[0,1.5,-2]}><cylinderGeometry args={[2.2,2.4,0.25,8]}/><meshStandardMaterial color="#c8b890" roughness={0.8}/></mesh>
      {Array.from({length:8},(_,i)=>{
        const a=(i/8)*Math.PI*2
        return <mesh key={i} castShadow position={[Math.cos(a)*2,0.9,-2+Math.sin(a)*2]}><cylinderGeometry args={[0.1,0.12,1.8,8]}/><meshStandardMaterial color="#a89070" roughness={0.8}/></mesh>
      })}
      <mesh castShadow position={[0,3,-2]}><coneGeometry args={[2.6,1.5,8]}/><meshStandardMaterial color="#c84420" roughness={0.7}/></mesh>
    </group>
  )
}

// ═══════════════════════════════════════════════════
// WORLD LOADER
// ═══════════════════════════════════════════════════
function WorldLoader() {
  const { progress } = useProgress()
  const { isLoaded, setLoadingProgress, setIsLoaded } = useStore()
  useEffect(()=>{
    let rafA = 0
    let rafB = 0
    const timeoutId = window.setTimeout(() => {
      rafA = window.requestAnimationFrame(() => {
        rafB = window.requestAnimationFrame(() => {
          setLoadingProgress(progress)
          if (progress >= 100 && !isLoaded) setIsLoaded(true)
        })
      })
    }, progress >= 100 ? 500 : 0)
    return () => {
      window.clearTimeout(timeoutId)
      window.cancelAnimationFrame(rafA)
      window.cancelAnimationFrame(rafB)
    }
  },[progress, isLoaded, setLoadingProgress, setIsLoaded])
  return null
}

// ═══════════════════════════════════════════════════
// MAIN WORLD
// ═══════════════════════════════════════════════════
export default function World() {
  const { weather, introComplete, audioEnabled } = useStore()
  const isNight = weather==='night'

  useEffect(()=>{ setAudio(audioEnabled) },[audioEnabled])

  return (
    <>
      <WorldLoader/>

      {/* Lighting */}
      <ambientLight intensity={isNight?0.22:0.82} color={isNight?'#2030a0':'#fffaea'}/>
      <directionalLight position={[55,90,35]} intensity={isNight?0.08:3.0}
        color={isNight?'#4060aa':'#ffe8a0'} castShadow
        shadow-mapSize={[2048,2048]}
        shadow-camera-far={220} shadow-camera-left={-110} shadow-camera-right={110}
        shadow-camera-top={110} shadow-camera-bottom={-110} shadow-bias={-0.0004}/>
      <directionalLight position={[-35,25,-45]} intensity={isNight?0.04:0.45} color="#c0d8ff"/>
      {isNight && <pointLight position={[0,0,0]} intensity={0.8} color="#ffee88" distance={70}/>}

      <Environment preset={isNight?'night':'sunset'}/>

      {/* World elements */}
      <CityGround/>
      <WaterFeatures/>
      <Bridge/>
      <CityNature/>
      <SouthPark/>
      <HeroFountain/>
      <LakeComponent position={[18,0,-4]}/>

      {/* Buildings */}
      <group name="city-buildings">
        <group name="CineVerse"><Cinema/></group>
        <group name="ParkNidus"><ParkingLot/></group>
        <group name="HappyFarm"><Farm/></group>
        <group name="TechZone"><TechZone/></group>
        <group name="GlowCode"><GlowCodeBoutique/></group>
        <group name="Terrasoft"><RealEstateOffice/></group>
        <group name="HeroHouse"><HeroHouse/></group>
        <group name="ZenTemple"><ZenTemple/></group>
        <group name="SkillsLab"><SkillsLab/></group>
        <group name="Mansion"><MansionAbout/></group>
        <group name="Entrance"><CityEntrance/></group>
      </group>

      {/* NPCs + Animals */}
      <NPCs/>

      {/* Weather */}
      <WeatherSystem/>

      {/* Shadows */}
      <ContactShadows position={[0,0.01,0]} opacity={0.26} scale={100} blur={2.5} far={20} color="#2a1800"/>

      {/* World ambient sparkles */}
      <Sparkles count={180} scale={[170,22,170]} size={0.65} speed={0.12} color="#ffd080" opacity={0.25}/>

      {/* Character + Camera */}
      {introComplete && <Suspense fallback={null}><Character/></Suspense>}
      <CameraController/>
    </>
  )
}
