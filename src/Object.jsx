import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from '@react-three/drei';
import { useControls } from 'leva';
import * as THREE from 'three';

export default function Object() {
    const objectRef = useRef();
    const gltfRef = useRef();

    const gltf = useLoader(GLTFLoader, '/coolhoodie.glb');
    const [colorMap, normalMap, roughnessMap, aoMap, overlayMap] = useLoader(TextureLoader, [
        '/color.jpg',
        '/normal.jpg', 
        '/roughness.jpg', 
        '/ao.jpg'// Load the overlay map texture
    ]);

    const { roughness, aoIntensity, normalScale } = useControls({
        roughness: { value: 0, min: 0, max: 10, step: .01 },
        aoIntensity: { value: 0, min: 0, max: 5, step: .01  },
        normalScale: { value: 0, min: 0, max: 5, step: .01  }
    });

    useFrame(() => {
        // Rotate the mesh
        if (objectRef.current) {
            objectRef.current.rotation.y += 0.01;
            // Live update rotating mesh material properties
            const mat = objectRef.current.material;
            if (mat) {
                mat.roughness = roughness;
                mat.aoMapIntensity = aoIntensity;
                mat.normalScale.set(normalScale, normalScale);
            }
        }
        // Live update GLTF model material properties
        if (gltfRef.current) {
            gltfRef.current.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.roughness = roughness;
                    child.material.aoMapIntensity = aoIntensity;
                    if (child.material.normalScale) {
                        child.material.normalScale.set(normalScale, normalScale);
                    }
                    child.material.needsUpdate = true;
                }
            });
        }
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
                onBeforeCompile={(shader) => {
                    shader.uniforms.overlayMap = { value: overlayMap };
                    shader.fragmentShader = `
                        uniform sampler2D overlayMap;
                        ${shader.fragmentShader}
                    `.replace(
                        `#include <map_fragment>`,
                        `
                        #include <map_fragment>
                        vec4 overlayColor = texture2D(overlayMap, vUv);
                        diffuseColor.rgb = mix(diffuseColor.rgb, overlayColor.rgb, 0.8);
                        `
                    );
                }}
            />
        </mesh>

        {/* GLTF Model */}
        {gltf && (
            <primitive
                ref={gltfRef}
                object={gltf.scene}
                scale={[5, 5, 5]}
                position={[0, 0, 0]}
                onUpdate={(self) => {
                    self.traverse((child) => {
                        if (child.isMesh) {
                            child.material.map = colorMap;
                            child.material.normalMap = normalMap;
                            child.material.roughnessMap = roughnessMap;
                            child.material.aoMap = aoMap;
                            child.material.roughness = roughness;
                            child.material.aoMapIntensity = aoIntensity;
                            child.material.normalScale && child.material.normalScale.set(normalScale, normalScale);
                        }
                    });
                }}
            />
        )}
    </>
}