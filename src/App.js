import {Canvas, useFrame} from '@react-three/fiber'
import {Environment, OrbitControls, useTexture} from '@react-three/drei'
import {useMemo, useRef, useState} from "react";
import * as THREE from 'three'

function App() {
    return (
        <div style={{width: '100vw', height: '100vh'}}>
            <Canvas>

                <color attach='background' args={['black']}/>

                <OrbitControls/>

                {/*<ambientLight/>*/}
                {/*<pointLight position={[0, 2, 2]}/>*/}

                <Environment preset="studio"/>

                <Box/>
            </Canvas>
        </div>
    );
}

function Box() {
    const texture1 = useTexture('./texture1.jpeg')
    const texture2 = useTexture('./texture2.jpeg')

    const dispFactorGrowing = useRef(true)

    const material = useMemo(() => {

        const material = new THREE.MeshStandardMaterial()

        material.map = texture1;
        material.userData.dispFactor = {value: 0}

        material.onBeforeCompile = (shader) => {

            shader.uniforms.dispFactor = material.userData.dispFactor

            shader.fragmentShader = 'uniform float dispFactor;\n' + shader.fragmentShader

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <map_fragment>',
                `
            diffuseColor *= texture2D(map, vMapUv) * dispFactor;
       `)

        }

        return material
    }, [])

    useFrame(() => {

        if (material.userData.dispFactor.value <= 0) {
            dispFactorGrowing.current = true
        }

        if (material.userData.dispFactor.value >= 1) {
            dispFactorGrowing.current = false
        }

        if (dispFactorGrowing.current) {
            material.userData.dispFactor.value += 0.01
        } else {
            material.userData.dispFactor.value -= 0.01
        }

    })

    return (
        <mesh material={material}>
            <torusKnotGeometry args={[2, .4, 100, 16]}/>
        </mesh>
    )
}

export default App;
