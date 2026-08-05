'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// 3D Particles that drift and respond to mouse/pointer movement
function ParticleField({ isDark }: { isDark: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse coordinates (-1 to 1)
      setMouse({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const particleCount = 2000;
  
  // Initialize positions and colors
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const cols = new Float32Array(particleCount * 3);
    
    // Pixela Brand Gradient Colors (Stitch Theme)
    // Blue: #0066ff, Pink: #ff007a, Violet: #8a2be2
    const colorA = new THREE.Color('#0066ff'); // Electric Blue
    const colorB = new THREE.Color('#ff007a'); // Pink/Magenta
    const colorC = new THREE.Color('#8a2be2'); // Violet/Purple
    
    for (let i = 0; i < particleCount; i++) {
      // Random coordinates inside viewport-based bounds
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;

      // Color interpolation along X/Y coordinates to simulate the gradient
      const factor = (pos[i * 3] + 7.5) / 15;
      const interpColor = new THREE.Color();
      if (factor < 0.5) {
        interpColor.lerpColors(colorA, colorB, factor * 2);
      } else {
        interpColor.lerpColors(colorB, colorC, (factor - 0.5) * 2);
      }
      
      cols[i * 3] = interpColor.r;
      cols[i * 3 + 1] = interpColor.g;
      cols[i * 3 + 2] = interpColor.b;
    }
    return [pos, cols];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = time * 0.03;
    pointsRef.current.rotation.x = time * 0.01;

    // React to mouse movement
    const targetX = mouse.x * 0.5;
    const targetY = mouse.y * 0.5;
    pointsRef.current.position.x += (targetX - pointsRef.current.position.x) * 0.05;
    pointsRef.current.position.y += (targetY - pointsRef.current.position.y) * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={isDark ? 0.6 : 0.4}
        depthWrite={false}
        blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}

// 3D Shutter / Camera Aperture Blade Rings
function ShutterRing({ isDark }: { isDark: boolean }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.z = time * 0.15;
    // Scale slightly on hover simulation
    const scale = 1 + Math.sin(time * 0.8) * 0.03;
    meshRef.current.scale.set(scale, scale, scale);
  });

  return (
    <group ref={meshRef} position={[0, 0, -2]}>
      {/* Central Aperture Shutter Loop */}
      <mesh>
        <ringGeometry args={[2.0, 2.05, 32]} />
        <meshBasicMaterial color="#0066ff" transparent opacity={isDark ? 0.4 : 0.25} />
      </mesh>
      
      {/* Aperture blades simulated as lines in a star pattern */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * Math.PI) / 4;
        return (
          <mesh key={i} rotation={[0, 0, angle]}>
            <boxGeometry args={[0.02, 1.2, 0.02]} />
            <meshBasicMaterial color={isDark ? "#ffffff" : "#18181b"} transparent opacity={isDark ? 0.2 : 0.1} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function ThreeCanvas() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Fallback static gradient backdrop while canvas mounts
    return (
      <div className="absolute inset-0 -z-10 bg-background overflow-hidden">
        <div className="absolute inset-0 pixela-gradient opacity-15 blur-[120px]" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 -z-10 w-full h-full overflow-hidden bg-background">
      {/* Background glow base - dynamically updates based on theme background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,102,255,0.08),var(--background)_85%)] z-0 pointer-events-none" />
      
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ width: '100%', height: '100%', position: 'absolute' }}
      >
        <ambientLight intensity={0.5} />
        <ParticleField isDark={isDark} />
        <ShutterRing isDark={isDark} />
      </Canvas>
    </div>
  );
}
