import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
// The installed Drei version does not expose Water, so this uses Three's official water shader.
// @ts-ignore - three/examples/jsm/objects/Water.js has no bundled TypeScript declaration.
import { Water as ThreeWater } from 'three/examples/jsm/objects/Water.js'

type FishSpec = {
  color: string
  radiusX: number
  radiusZ: number
  speed: number
  phase: number
  y: number
}

function createWaterNormalTexture() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  if (ctx) {
    const image = ctx.createImageData(size, size)
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const i = (y * size + x) * 4
        const waveA = Math.sin((x + y) * 0.18)
        const waveB = Math.cos((x - y) * 0.12)
        image.data[i] = 128 + waveA * 42
        image.data[i + 1] = 128 + waveB * 42
        image.data[i + 2] = 255
        image.data[i + 3] = 255
      }
    }
    ctx.putImageData(image, 0, 0)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(3, 3)
  texture.needsUpdate = true
  return texture
}

function createLakeBasinGeometry(radius = 12, segments = 64, rings = 8) {
  const positions: number[] = []
  const indices: number[] = []

  for (let ring = 0; ring <= rings; ring += 1) {
    const t = ring / rings
    const r = radius * t
    const y = -1.35 + Math.pow(t, 2.2) * 1.12

    for (let segment = 0; segment < segments; segment += 1) {
      const a = (segment / segments) * Math.PI * 2
      positions.push(Math.cos(a) * r, y, Math.sin(a) * r)
    }
  }

  for (let ring = 0; ring < rings; ring += 1) {
    for (let segment = 0; segment < segments; segment += 1) {
      const next = (segment + 1) % segments
      const a = ring * segments + segment
      const b = ring * segments + next
      const c = (ring + 1) * segments + segment
      const d = (ring + 1) * segments + next
      indices.push(a, c, b, b, c, d)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function Fish({ color = '#ffb347' }: { color?: string }) {
  return (
    <group>
      <mesh castShadow scale={[0.55, 0.22, 0.18]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      <mesh castShadow position={[-0.42, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.22, 0.22, 0.18]}>
        <coneGeometry args={[1, 1, 3]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      <mesh castShadow position={[0.42, 0.08, 0]} rotation={[0, 0, -0.3]} scale={[0.18, 0.08, 0.08]}>
        <coneGeometry args={[1, 1, 3]} />
        <meshStandardMaterial color="#fff2a8" roughness={0.45} />
      </mesh>
    </group>
  )
}

export default function LakeComponent({ position = [18, 0, -4] as [number, number, number] }) {
  const waterRef = useRef<THREE.Mesh>(null)
  const fishRefs = useRef<THREE.Group[]>([])

  const basinGeometry = useMemo(() => createLakeBasinGeometry(), [])
  const water = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(20, 20, 96, 96)
    const waterNormals = createWaterNormalTexture()
    const waterObject = new ThreeWater(geometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals,
      sunDirection: new THREE.Vector3(0.4, 1, 0.25).normalize(),
      sunColor: 0xffffff,
      waterColor: new THREE.Color('#00AEEF'),
      distortionScale: 3.8,
      fog: false,
    }) as THREE.Mesh

    waterObject.rotation.x = -Math.PI / 2
    waterObject.position.y = -0.18
    return waterObject
  }, [])

  const fish = useMemo<FishSpec[]>(() => [
    { color: '#ffb347', radiusX: 5.2, radiusZ: 3.2, speed: 0.7, phase: 0.2, y: -0.7 },
    { color: '#ff6f91', radiusX: 4.2, radiusZ: 4.8, speed: 0.55, phase: 1.6, y: -0.85 },
    { color: '#f8e16c', radiusX: 6.4, radiusZ: 2.6, speed: 0.82, phase: 3.1, y: -0.62 },
    { color: '#7bdff2', radiusX: 3.6, radiusZ: 5.4, speed: 0.65, phase: 4.3, y: -1.0 },
    { color: '#b2f7a5', radiusX: 5.8, radiusZ: 4.1, speed: 0.5, phase: 5.0, y: -0.78 },
  ], [])

  useFrame(({ clock }) => {
    const time = clock.elapsedTime
    const material = waterRef.current?.material as THREE.ShaderMaterial | undefined
    if (material?.uniforms?.time) material.uniforms.time.value += 1 / 60

    fishRefs.current.forEach((group, index) => {
      const spec = fish[index]
      if (!group || !spec) return

      const t = time * spec.speed + spec.phase
      const x = Math.sin(t) * spec.radiusX
      const z = Math.sin(t * 2) * spec.radiusZ * 0.55
      const nextX = Math.sin(t + 0.04) * spec.radiusX
      const nextZ = Math.sin((t + 0.04) * 2) * spec.radiusZ * 0.55

      group.position.set(x, spec.y + Math.sin(t * 3) * 0.08, z)
      group.rotation.y = Math.atan2(nextX - x, nextZ - z)
    })
  })

  return (
    <group name="CentralLake" position={position}>
      <RigidBody key="central-lake-basin-physics" type="fixed" colliders="trimesh">
        <mesh receiveShadow geometry={basinGeometry}>
          <meshStandardMaterial color="#6f8f78" roughness={0.96} />
        </mesh>
      </RigidBody>

      <primitive ref={waterRef} object={water} />

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[10.7, 12.7, 64]} />
        <meshStandardMaterial color="#d8d0bd" roughness={0.88} />
      </mesh>

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <ringGeometry args={[12.7, 13.8, 64]} />
        <meshStandardMaterial color="#b8ad98" roughness={0.92} />
      </mesh>

      {fish.map((spec, index) => (
        <group
          key={`lake-fish-${index}`}
          ref={(node) => {
            if (node) fishRefs.current[index] = node
          }}
        >
          <Fish color={spec.color} />
        </group>
      ))}

      <Sparkles count={35} scale={[18, 1.8, 18]} size={0.55} speed={0.25} color="#bdf7ff" opacity={0.42} />
      <pointLight position={[0, 1.5, 0]} intensity={1.8} color="#00AEEF" distance={18} />
    </group>
  )
}
