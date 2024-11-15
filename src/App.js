import {Canvas, useFrame} from '@react-three/fiber'
import {Environment, OrbitControls, useTexture, RoundedBox} from '@react-three/drei'
import {useMemo, useRef, useState} from "react";
import * as THREE from 'three'

function App() {
    return (
        <div>
            <div style={{width: '100vw', height: '100vh'}}>
                <Canvas shadows camera={{ fov: 75, position: [1.2, .3, 2]}}>

                    <color attach='background' args={['black']}/>

                    <OrbitControls/>

                    {/*<Environment preset="studio"/>*/}

                    <pointLight position={[0, 2, 2]} castShadow/>
                    <pointLight position={[-2, -1, -2]} castShadow/>
                    <pointLight position={[2, -1, 2]} castShadow/>
                    <pointLight position={[2, -1, -2]} castShadow/>
                    <pointLight position={[-2, -1, 2]} castShadow/>

                    <Box/>
                </Canvas>
            </div>

            <div style={{
                position: "absolute",
                top: '20px',
                left: '20px',
                color: 'black',
                backgroundColor: 'whitesmoke',
                padding: '20px'
            }}>
                <div>Direct shader modification on three.js built-in materials (here MeshStandardMaterial).</div>
                <div>
                    <a href={'https://github.com/SGolab'}>Github</a>
                </div>
                <div>
                    <a href={'https://www.linkedin.com/in/szymon-go%C5%82%C4%85b-35149219b/'}>LinkedIn</a>
                </div>
                <div>
                    <a href={'https://nikifor.app/'}>Nikifor</a>
                </div>

            </div>

            <div style={{position: "absolute", right: '20px', bottom: '20px', padding: '20px', backgroundColor: 'whitesmoke'}}>
                <a href={'https://github.com/SGolab/shader-chunk-replacement'}>Code</a>
            </div>
        </div>
    );
}

function Box() {
    const texture1 = useTexture('./author.jpg')
    const texture2 = useTexture('./company.png')

    const dispFactorGrowing = useRef(true)

    const material = useMemo(() => {

        const material = new THREE.MeshStandardMaterial()

        material.metalness = 1
        material.roughness = .4

        applyChangingTexture(material, texture1, texture2)

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
        <>
            <RoundedBox material={material} castShadow/>
            <mesh position={[0, -.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[15, 15]} />
                <meshStandardMaterial/>
            </mesh>
        </>
    )
}

function applyChangingTexture(material, texture1, texture2) {

    texture1.encoding = THREE.sRGBEncoding
    texture2.encoding = THREE.sRGBEncoding

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
}

export default App;
