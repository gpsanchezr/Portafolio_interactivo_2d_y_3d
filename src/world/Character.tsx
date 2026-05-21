import React, { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useAnimations, useKeyboardControls } from '@react-three/drei'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { useStore } from '../store'

const AVATAR_URL = '/models/giseella-avatar.glb'
const WALK = 7, RUN = 13, ROT = 0.14

class AvatarBoundary extends React.Component<{children:React.ReactNode},{e:boolean}> {
  constructor(p:{children:React.ReactNode}) { super(p); this.state={e:false} }
  static getDerivedStateFromError() { return {e:true} }
  render() { return this.state.e ? <FallbackGirl /> : this.props.children }
}

function GiseellaAvatar() {
  const groupRef = useRef<THREE.Group>(null)
  const bodyRef  = useRef<any>(null)
  const rotY     = useRef(0)
  const [curAnim, setCurAnim] = useState('')
  const { camera }   = useThree()
  const [, getKeys]  = useKeyboardControls()
  const { setPlayerPos, unlockAchievement, teleportTarget, setTeleportTarget, activePanel, minimapExpanded, appMode } = useStore()
  const { scene, animations } = useGLTF(AVATAR_URL)
  const { actions, names }    = useAnimations(animations, groupRef)

  useEffect(() => { if (names.length) console.log('🎭 Anims:', names) }, [names])
  useEffect(() => {
    if (!names.length) return
    const idle = names.find(n => /idle/i.test(n)) ?? names[0]
    actions[idle]?.reset().fadeIn(0.4).play(); setCurAnim(idle)
  }, [names])
  useEffect(() => {
    scene.traverse(n => { const m=n as THREE.Mesh; if(m.isMesh){m.castShadow=true;m.receiveShadow=true} })
  }, [scene])

  const playAnim = (target:string, fade=0.3) => {
    if (curAnim===target) return
    if (curAnim && actions[curAnim]) actions[curAnim]!.fadeOut(fade)
    const act = actions[target] ?? actions[names.find(n=>n.toLowerCase().includes(target.toLowerCase()))??''] ?? actions[names[0]]
    if (act) { act.reset().fadeIn(fade).play(); setCurAnim(target) }
  }

  useFrame((_, dt) => {
    if (!bodyRef.current || !groupRef.current) return

    // ── Teleport handler ──────────────────────────────
    const tp = teleportTarget
    if (tp) {
      bodyRef.current.setTranslation({ x:tp[0], y:tp[1], z:tp[2] }, true)
      bodyRef.current.setLinvel({ x:0, y:0, z:0 }, true)
      setTeleportTarget(null)
      return
    }

    const posNow = bodyRef.current.translation()
    if (posNow.y < -12) {
      bodyRef.current.setTranslation({ x:0, y:5, z:32 }, true)
      bodyRef.current.setLinvel({ x:0, y:0, z:0 }, true)
      return
    }

    const { forward, backward, left, right, run } = getKeys()
    const speed = run ? RUN : WALK

    // Camera-relative movement
    const camFwd = new THREE.Vector3()
    camera.getWorldDirection(camFwd); camFwd.y=0; camFwd.normalize()
    const camRight = new THREE.Vector3()
    camRight.crossVectors(camFwd, new THREE.Vector3(0,1,0)).normalize()

    const dir = new THREE.Vector3()
    if (forward)  dir.add(camFwd)
    if (backward) dir.sub(camFwd)
    if (right)    dir.add(camRight)
    if (left)     dir.sub(camRight)

    const moving = dir.length() > 0.01

    if (moving && !activePanel && !minimapExpanded && appMode === 'world3d') {
      dir.normalize()
      const target = Math.atan2(dir.x, dir.z)
      let diff = target - rotY.current
      while (diff > Math.PI)  diff -= Math.PI*2
      while (diff < -Math.PI) diff += Math.PI*2
      rotY.current += diff * ROT
      groupRef.current.rotation.y = rotY.current
      const vel = bodyRef.current.linvel()
      bodyRef.current.setLinvel({ x:dir.x*speed, y:vel.y, z:dir.z*speed }, true)
      const walkName = run ? (names.find(n=>/run/i.test(n)) ?? names.find(n=>/walk/i.test(n)) ?? names[Math.min(1,names.length-1)])
                           : (names.find(n=>/walk/i.test(n)) ?? names[Math.min(1,names.length-1)])
      if (walkName) playAnim(walkName)
    } else {
      const vel = bodyRef.current.linvel()
      bodyRef.current.setLinvel({ x:vel.x*0.78, y:vel.y, z:vel.z*0.78 }, true)
      const idle = names.find(n=>/idle/i.test(n)) ?? names[0]
      if (idle) playAnim(idle)
    }

    const pos = bodyRef.current.translation()
    setPlayerPos([pos.x, pos.y, pos.z])
    if (Math.abs(pos.x-36)<8  && Math.abs(pos.z-22)<10) unlockAchievement('🌾 Visitaste Happy-Farm!')
    if (Math.abs(pos.x+34)<8  && Math.abs(pos.z+18)<10) unlockAchievement('🎬 Entraste al Cine!')
    if (Math.abs(pos.x+34)<8  && Math.abs(pos.z-18)<10) unlockAchievement('🚗 Visitaste ParkNidus!')
    if (Math.abs(pos.x)<8     && pos.z < -64)           unlockAchievement('🌿 Llegaste al Templo!')
    if (Math.abs(pos.x-36)<8  && Math.abs(pos.z+14)<10) unlockAchievement('🏢 Terrasoft Visitado!')
    if (Math.abs(pos.x)<8     && Math.abs(pos.z+28)<10) unlockAchievement('🤖 Zona IA Desbloqueada!')
  })

  return (
    <RigidBody ref={bodyRef} type="dynamic" position={[0,5,5]} enabledRotations={[false,false,false]} linearDamping={3.5} colliders={false} canSleep={false} name="player">
      <CapsuleCollider args={[0.95,0.48]}/>
      <group ref={groupRef} position={[0,-1.25,0]}>
        <primitive object={scene} scale={3.6}/>
      </group>
    </RigidBody>
  )
}

function FallbackGirl() {
  const groupRef = useRef<THREE.Group>(null)
  const bodyRef  = useRef<any>(null)
  const rotY     = useRef(0)
  const walkT    = useRef(0)
  const { camera }  = useThree()
  const [, getKeys] = useKeyboardControls()
  const { setPlayerPos, teleportTarget, setTeleportTarget, activePanel, minimapExpanded, appMode } = useStore()

  useFrame((_, dt) => {
    if (!bodyRef.current || !groupRef.current) return

    const tp = teleportTarget
    if (tp) {
      bodyRef.current.setTranslation({ x:tp[0], y:tp[1], z:tp[2] }, true)
      bodyRef.current.setLinvel({ x:0, y:0, z:0 }, true)
      setTeleportTarget(null)
      return
    }

    const posNow = bodyRef.current.translation()
    if (posNow.y < -12) {
      bodyRef.current.setTranslation({ x:0, y:5, z:32 }, true)
      bodyRef.current.setLinvel({ x:0, y:0, z:0 }, true)
      return
    }

    const { forward, backward, left, right, run } = getKeys()
    const speed = run ? RUN : WALK
    const camFwd = new THREE.Vector3()
    camera.getWorldDirection(camFwd); camFwd.y=0; camFwd.normalize()
    const camRight = new THREE.Vector3()
    camRight.crossVectors(camFwd, new THREE.Vector3(0,1,0)).normalize()

    const dir = new THREE.Vector3()
    if (forward)  dir.add(camFwd)
    if (backward) dir.sub(camFwd)
    if (right)    dir.add(camRight)
    if (left)     dir.sub(camRight)

    const moving = dir.length() > 0.01
    if (moving && !activePanel && !minimapExpanded && appMode === 'world3d') {
      dir.normalize()
      const target = Math.atan2(dir.x, dir.z)
      let diff = target - rotY.current
      while (diff > Math.PI)  diff -= Math.PI*2
      while (diff < -Math.PI) diff += Math.PI*2
      rotY.current += diff * ROT
      groupRef.current.rotation.y = rotY.current
      walkT.current += dt * (run ? 13 : 8)
      const vel = bodyRef.current.linvel()
      bodyRef.current.setLinvel({ x:dir.x*speed, y:vel.y, z:dir.z*speed }, true)
      const c = groupRef.current.children
      const sw = Math.sin(walkT.current) * 0.38
      if (c[3]) (c[3] as THREE.Object3D).rotation.x =  sw
      if (c[4]) (c[4] as THREE.Object3D).rotation.x = -sw
      if (c[5]) (c[5] as THREE.Object3D).rotation.x = -sw*0.75
      if (c[6]) (c[6] as THREE.Object3D).rotation.x =  sw*0.75
    } else {
      const vel = bodyRef.current.linvel()
      bodyRef.current.setLinvel({ x:vel.x*0.78, y:vel.y, z:vel.z*0.78 }, true)
    }
    const pos = bodyRef.current.translation()
    setPlayerPos([pos.x, pos.y, pos.z])
  })

  const d='#7ec8e8', s='#f0c8a0', h='#2a1a0a'
  return (
    <RigidBody ref={bodyRef} type="dynamic" position={[0,5,5]} enabledRotations={[false,false,false]} linearDamping={3.5} colliders={false} canSleep={false} name="player-fallback">
      <CapsuleCollider args={[0.95,0.48]}/>
      <group ref={groupRef} position={[0,-1.25,0]} scale={2.3}>
        <group position={[0,1.06,0]}>
          <mesh castShadow><capsuleGeometry args={[0.21,0.46,8,14]}/><meshStandardMaterial color={d} roughness={0.7}/></mesh>
          <mesh castShadow position={[0,-0.38,0]}><coneGeometry args={[0.32,0.46,14]}/><meshStandardMaterial color={d} roughness={0.7}/></mesh>
        </group>
        <group position={[0,1.72,0]}>
          <mesh castShadow><sphereGeometry args={[0.19,14,14]}/><meshStandardMaterial color={s} roughness={0.8}/></mesh>
          <mesh castShadow position={[0,0.09,0]}><sphereGeometry args={[0.21,14,14]}/><meshStandardMaterial color={h} roughness={0.7}/></mesh>
          <mesh castShadow position={[0,-0.55,0.04]}><capsuleGeometry args={[0.13,0.88,6,8]}/><meshStandardMaterial color={h} roughness={0.7}/></mesh>
          {[-0.07,0.07].map((x,i)=><mesh key={i} position={[x,0.025,0.175]}><sphereGeometry args={[0.024,8,8]}/><meshStandardMaterial color="#1a0a0a"/></mesh>)}
        </group>
        {[-0.29,0.29].map((x,i)=>(
          <group key={i} position={[x,1.12,0]}>
            <mesh castShadow><capsuleGeometry args={[0.075,0.28,7,8]}/><meshStandardMaterial color={d} roughness={0.7}/></mesh>
            <mesh castShadow position={[0,-0.23,0]}><sphereGeometry args={[0.065,8,8]}/><meshStandardMaterial color={s} roughness={0.8}/></mesh>
          </group>
        ))}
        {[-0.11,0.11].map((x,i)=>(
          <group key={i} position={[x,0.55,0]}>
            <mesh castShadow><capsuleGeometry args={[0.065,0.33,7,8]}/><meshStandardMaterial color={s} roughness={0.8}/></mesh>
            <mesh castShadow position={[0,-0.25,0.04]}><boxGeometry args={[0.13,0.055,0.19]}/><meshStandardMaterial color="#c8a87a" roughness={0.6}/></mesh>
          </group>
        ))}
      </group>
    </RigidBody>
  )
}

useGLTF.preload(AVATAR_URL)

export default function Character() {
  return <AvatarBoundary><GiseellaAvatar/></AvatarBoundary>
}
