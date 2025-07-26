import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Environment } from '@react-three/drei'
import * as THREE from 'three'

// 3D Bread Loaf Component
function BreadLoaf({ position, scale = 1, color = "#8B4513" }) {
    const meshRef = useRef()

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.2
        }
    })

    return (
        <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
            <mesh ref={meshRef} position={position} scale={[scale, scale * 0.6, scale * 1.2]}>
                {/* Main bread body */}
                <boxGeometry args={[1.8, 1, 1]} />
                <meshStandardMaterial
                    color={color}
                    roughness={0.8}
                    metalness={0.1}
                />
            </mesh>

            {/* Bread crust detail */}
            <mesh position={[position[0], position[1] + 0.4, position[2]]} scale={[scale * 0.9, scale * 0.2, scale * 1.1]}>
                <boxGeometry args={[1.6, 0.3, 0.9]} />
                <meshStandardMaterial
                    color={new THREE.Color(color).multiplyScalar(1.2)}
                    roughness={0.9}
                />
            </mesh>
        </Float>
    )
}

// Multiple bread loaves for variety
function BreadCollection() {
    return (
        <>
            <BreadLoaf position={[0, 0, 0]} scale={1.2} color="#8B4513" />
            <BreadLoaf position={[-2.5, 0, -1]} scale={0.8} color="#A0522D" />
            <BreadLoaf position={[2.5, 0, 1]} scale={0.9} color="#CD853F" />
            <BreadLoaf position={[0, 1.5, -2]} scale={0.7} color="#D2691E" />
        </>
    )
}

export const Enhanced3DBread = () => {
    return (
        <div className="h-80 w-full max-w-4xl mx-auto relative">
            <Canvas
                camera={{ position: [0, 2, 8], fov: 50 }}
                style={{
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fdba74 100%)',
                    borderRadius: '1.5rem'
                }}
            >
                {/* Lighting setup */}
                <ambientLight intensity={0.4} />
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={1}
                    color="#fff8dc"
                    castShadow
                />
                <pointLight
                    position={[-10, -10, -5]}
                    intensity={0.3}
                    color="#f4a460"
                />

                <BreadCollection />

                <Environment preset="studio" />
                <OrbitControls
                    enableZoom={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                    enablePan={false}
                    enableDamping={true}
                    dampingFactor={0.05}
                    maxPolarAngle={Math.PI / 2}
                    minPolarAngle={Math.PI / 4}
                />
            </Canvas>

            {/* Elegant overlay text */}
            <div className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg">
                    <p className="text-primary font-medium text-center">
                        Handcrafted Daily • Fresh Ingredients • Artisan Quality
                    </p>
                </div>
            </div>
        </div>
    )
}
