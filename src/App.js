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

    texture1.encoding = THREE.sRGBEncoding
    texture2.encoding = THREE.sRGBEncoding

    const dispFactorGrowing = useRef(true)

    const material = useMemo(() => {

        const material = new THREE.MeshStandardMaterial()

        material.metalness = 1
        material.roughness = 0

        material.userData.texture1 = {value: texture1}
        material.userData.texture2 = {value: texture2}
        material.userData.dispFactor = {value: 0}

        material.onBeforeCompile = (shader) => {

            shader.uniforms.dispFactor = material.userData.dispFactor
            shader.uniforms.texture1 = material.userData.texture1
            shader.uniforms.texture2 = material.userData.texture2

            shader.vertexShader = 'varying vec2 vUv;\n' + shader.vertexShader

            const s = 'void main() {\n'
            const mainStartIndex = shader.vertexShader.indexOf(s) + s.length

            shader.vertexShader = shader.vertexShader.slice(0, mainStartIndex) + 'vUv = uv;\n' + shader.vertexShader.slice(mainStartIndex);

            shader.fragmentShader = 'uniform float dispFactor;\n' + shader.fragmentShader
            shader.fragmentShader = 'varying vec2 vUv;\n' + shader.fragmentShader
            shader.fragmentShader = 'uniform sampler2D texture1;\n' + shader.fragmentShader
            shader.fragmentShader = 'uniform sampler2D texture2;\n' + shader.fragmentShader

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <map_fragment>',
                `
                
                if (vUv.y > dispFactor) {
                    diffuseColor *= texture2D(texture1, vUv);
                } else {
                    diffuseColor *= texture2D(texture2, vUv);
                }
                           
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
            {/*<torusKnotGeometry args={[2, .4, 100, 16]}/>*/}
            <boxGeometry args={[1, 1, 1]}/>
        </mesh>
    )
}

function applyChangingTexture(material) {

}

export default App;
