import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'

export default function CameraController() {
  const { camera }    = useThree()
  const { playerPos, cameraMode, setCameraMode } = useStore()

  const targetPos = useRef(new THREE.Vector3(0,0,5))
  const lookTarget= useRef(new THREE.Vector3(0,2,5))
  const drag      = useRef(false)
  const prev      = useRef({ x:0, y:0 })
  const orbitH    = useRef(0)          // horizontal orbit angle
  const orbitV    = useRef(0.68)       // vertical pitch (radians ~39°)
  const zoom      = useRef(22)         // distance from player

  useFrame(() => {
    const pp = new THREE.Vector3(...playerPos)
    targetPos.current.lerp(pp, 0.06)

    let camPos: THREE.Vector3
    let lookAt: THREE.Vector3

    if (cameraMode === 'firstPerson') {
      const forward = new THREE.Vector3(Math.sin(orbitH.current + Math.PI), 0, Math.cos(orbitH.current + Math.PI))
      camPos = targetPos.current.clone().add(new THREE.Vector3(0, 1.75, 0)).add(forward.clone().multiplyScalar(0.4))
      lookAt = camPos.clone().add(forward.multiplyScalar(12)).add(new THREE.Vector3(0, 0.25, 0))
    } else if (cameraMode === 'panoramic') {
      camPos = targetPos.current.clone().add(new THREE.Vector3(0, 82, 42))
      lookAt = targetPos.current.clone().add(new THREE.Vector3(0, 0, -8))
    } else {
      const flatD = zoom.current * Math.cos(orbitV.current)
      const height = zoom.current * Math.sin(orbitV.current)
      camPos = new THREE.Vector3(
        targetPos.current.x + Math.sin(orbitH.current) * flatD,
        targetPos.current.y + height,
        targetPos.current.z + Math.cos(orbitH.current) * flatD
      )
      lookAt = targetPos.current.clone().add(new THREE.Vector3(0,2.2,0))
    }

    camera.position.lerp(camPos, cameraMode === 'firstPerson' ? 0.22 : 0.055)
    lookTarget.current.lerp(lookAt, cameraMode === 'firstPerson' ? 0.22 : 0.08)
    camera.lookAt(lookTarget.current)
  })

  // Scroll zoom
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (useStore.getState().cameraMode !== 'thirdPerson') return
      zoom.current = Math.max(8, Math.min(48, zoom.current + e.deltaY * 0.012 * zoom.current * 0.18))
    }
    window.addEventListener('wheel', onWheel, { passive:true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [])

  // Right/middle click orbit
  useEffect(() => {
    const dn = (e: MouseEvent) => {
      if (e.button===1||e.button===2) { drag.current=true; prev.current={x:e.clientX,y:e.clientY} }
    }
    const mv = (e: MouseEvent) => {
      if (!drag.current) return
      orbitH.current -= (e.clientX-prev.current.x)*0.008
      if (useStore.getState().cameraMode === 'thirdPerson') {
        orbitV.current  = Math.max(0.22, Math.min(1.35, orbitV.current+(e.clientY-prev.current.y)*0.006))
      }
      prev.current = {x:e.clientX,y:e.clientY}
    }
    const up  = () => { drag.current=false }
    const ctx = (e:Event) => e.preventDefault()
    window.addEventListener('mousedown',dn)
    window.addEventListener('mousemove',mv)
    window.addEventListener('mouseup',up)
    window.addEventListener('contextmenu',ctx)
    return () => {
      window.removeEventListener('mousedown',dn)
      window.removeEventListener('mousemove',mv)
      window.removeEventListener('mouseup',up)
      window.removeEventListener('contextmenu',ctx)
    }
  }, [])

  useEffect(() => {
    const modes = ['thirdPerson', 'firstPerson', 'panoramic'] as const
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'KeyC') return
      const current = useStore.getState().cameraMode
      setCameraMode(modes[(modes.indexOf(current) + 1) % modes.length])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setCameraMode])

  // Mobile pinch zoom
  useEffect(() => {
    let last=0
    const ts=(e:TouchEvent)=>{
      if(e.touches.length===2){const a=e.touches[0],b=e.touches[1];last=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)}
    }
    const tm=(e:TouchEvent)=>{
      if(e.touches.length===2){
        const a=e.touches[0],b=e.touches[1]
        const d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)
        zoom.current=Math.max(8,Math.min(48,zoom.current+(last-d)*0.06))
        last=d
      }
    }
    window.addEventListener('touchstart',ts,{passive:true})
    window.addEventListener('touchmove',tm,{passive:true})
    return ()=>{ window.removeEventListener('touchstart',ts); window.removeEventListener('touchmove',tm) }
  }, [])

  return null
}
