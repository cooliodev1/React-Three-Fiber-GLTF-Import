import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from '@react-three/drei';
import { useControls } from 'leva';

export default function Object() {
    const objectRef = useRef();

    useFrame(() => {
        objectRef.current.rotation.y += 0.01;
    });

    const gltf = useLoader(GLTFLoader, '/coolhoodie.glb');
    const [colorMap, normalMap, roughnessMap, aoMap] = useLoader(TextureLoader, [
        '/color.jpg', 
        '/normal.jpg', 
        '/roughness.jpg', 
        '/ao.jpg'
    ]);

    const { roughness, aoIntensity, normalScale } = useControls({
        roughness: { value: 0.5, min: 0, max: 1, step: 0.01 },
        aoIntensity: { value: 1, min: 0, max: 3, step: 0.1 },
        normalScale: { value: 1, min: 0, max: 2, step: 0.1 }
    });

    return <>
        <OrbitControls target={[0, 0, 0]} />
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={3} />

        {/* Rotating Mesh */}
        <mesh ref={objectRef} position-x={2}>
            <meshPhysicalMaterial 
                map={colorMap} 
                normalMap={normalMap} 
                normalScale={[normalScale, normalScale]} 
                roughnessMap={roughnessMap} 
                roughness={roughness} 
                aoMap={aoMap} 
                aoMapIntensity={aoIntensity} 
            />
        </mesh>

        {/* GLTF Model */}
        {gltf && (
            <primitive
                object={gltf.scene}
                scale={[5, 5, 5]}
                position={[0, 0, 0]} // Center the GLTF model
                onUpdate={(self) => {
                    self.traverse((child) => {
                        if (child.isMesh) {
                            child.material.map = colorMap;
                            child.material.normalMap = normalMap;
                            child.material.roughnessMap = roughnessMap;
                            child.material.aoMap = aoMap;
                            child.material.roughness = roughness;
                            child.material.aoMapIntensity = aoIntensity;
                            child.material.normalScale.set(normalScale, normalScale);
                        }
                    });
                }}
            />
        )}
    </>
}