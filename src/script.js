import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import smokeVertexShader from './shaders/smoke/vertex.glsl';
import smokeFragmentShader from './shaders/smoke/fragment.glsl';

//Practice:  Shaders with Vertex Shaders & Fragment Shaders
// - Better Performance: Instead using a perlin function, we are going to use a perlin image ('/static/perlin.png')
// To create our own perlin noise image:
// - PerlinNoiseMaker: http://kitfox.com/projects/perlinNoiseMaker/
// - Noise Texture Pack: https://opengameart.org/content/noise-texture-pack
// - Effect Texture Maker:  https://mebiusbox.github.io/contents/EffectTextureMaker/
// CREATION AN ANIMATED SMOKE PATTERN:
// 1. Load the texture located in static/perlin.png using TextureLoader
// 2. Add it in smokeMaterial.uniforms
// 3. In the fragment shader we need the 2D coordinates to display the texture UV coordinates
// As the uv attribute is available in the vertex...we need to send it to the fragment
// STRECTCH THE TEXTURE & ANIMATION:
// - We need to change the UV coordinates. We cannot modify a varying directly, we need to create a new variable out of it
// - Remap de value "smoke" in fragment.glsl. The perlin texture pixels go from 0 (black) to 1(white) => There is no large transparent areas within the texture
//- We need to remap this value so that is goes from 0 (when it should be under 0.4) to 1( when is should be 1)
// The better solution would be to have a smooth transition => smootstep function in glsl
// & than fade the edges
// ANIMATE THE VERTICES. The smoke must be twisted. The vertices must rotate around the center of the plane and
// to have that rotation changing according to the elevation (rotation on axis "xz" along to the y axis) => rotate2D function in vertex.glsl
// ADDING WIND EFFECT. To calculate the strength of the wind we are going to use the same technique as for the twist
// by picking a color from the Perlin Texture and move the vertices on the x and z axes.
/**
 * Base
 */
// Debug
//const gui = new GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Loaders
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 8;
camera.position.y = 10;
camera.position.z = 12;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.y = 3;
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Model
 */
gltfLoader.load(
    './bakedModel.glb',
    (gltf) =>
    {
        gltf.scene.getObjectByName('baked').material.map.anisotropy = 8
        scene.add(gltf.scene)
    }
);
/**
 * Smoke
 */
//Geometry:
const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16,64);
smokeGeometry.translate(0, 0.5, 0);
smokeGeometry.scale(1.5, 6, 1.5);

//Perlin Texture
const perlinTexture = textureLoader.load('./perlin.png');
// Repetion of perlin texture both axis
perlinTexture.wrapS = THREE.RepeatWrapping;
perlinTexture.wrapT = THREE.RepeatWrapping;
//Material:
// const smokeMaterial = new THREE.MeshBasicMaterial({
//     color: 'cyan',
//     wireframe: true
// })
const smokeMaterial = new THREE.ShaderMaterial({
    vertexShader: smokeVertexShader,
    fragmentShader: smokeFragmentShader,
    uniforms: { 
        uTime: new THREE.Uniform(0.0),
        uPerlinTexture: new THREE.Uniform(perlinTexture)
    },
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
   // wireframe: true
})

const smoke =  new THREE.Mesh(smokeGeometry, smokeMaterial);
smoke.position.y = 1.83;

scene.add(smoke);

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Update material
    smokeMaterial.uniforms.uTime.value = elapsedTime;

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
};

tick();