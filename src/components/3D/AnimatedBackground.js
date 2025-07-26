import React from 'react'
import { Canvas } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'

function AnimatedSphere({ position, color, speed }) {
    return (
        <Sphere args={[1, 32, 32]} position={position}>
            <meshStandardMaterial
                color={color}
                transparent
                opacity={0.1}
                roughness={0.4}
                metalness={0.1}
            />
        </Sphere>
    )
}

export const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 -z-10">
            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.3} />
                <AnimatedSphere position={[-5, -2, -5]} color="#8B4513" speed={2} />
                <AnimatedSphere position={[5, 2, -3]} color="#D2B48C" speed={1.5} />
                <AnimatedSphere position={[0, -5, -4]} color="#F4A460" speed={1} />
                <AnimatedSphere position={[3, 3, -6]} color="#8B4513" speed={2.5} />
            </Canvas>
        </div>
    )
}
