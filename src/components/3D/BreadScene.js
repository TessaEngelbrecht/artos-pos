import React, { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float, Sparkles, Environment } from '@react-three/drei'

// 3D Bread Component
function Bread({ position, rotation, scale = 1 }) {
    const meshRef = useRef()
    const [hovered, setHovered] = useState(false)

    return (
        <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
            <mesh
                ref={meshRef}
                position={position}
                rotation={rotation}
                scale={hovered ? [scale * 1.1, scale * 1.1, scale * 1.1] : [scale, scale, scale]}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <boxGeometry args={[2, 1, 0.8]} />
                <meshStandardMaterial
                    color={hovered ? "#D2B48C" : "#8B4513"}
                    roughness={0.7}
                    metalness={0.1}
                />
            </mesh>
        </Float>
    )
}

// 3D Scene Component
export const BreadScene = () => {
    return (
        <div className="h-64 w-full relative">
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                <ambientLight intensity={0.6} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#F4A460" />

                <Sparkles count={50} scale={10} size={2} speed={0.4} color="#F4A460" />

                <Bread position={[-2, 0, 0]} rotation={[0.1, 0.2, 0]} />
                <Bread position={[2, 0, 0]} rotation={[-0.1, -0.2, 0]} scale={0.8} />
                <Bread position={[0, 1.5, -1]} rotation={[0, 0, 0.1]} scale={0.6} />

                {/* Change "warm" to a valid preset */}
                <Environment preset="sunset" />
                <OrbitControls
                    enableZoom={false}
                    autoRotate
                    autoRotateSpeed={2}
                    enablePan={false}
                    enableDamping={true}
                />
            </Canvas>
        </div>
    )
}
