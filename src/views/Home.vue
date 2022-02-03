<template>
  <div class="canvas"></div>
</template>

<script lang="ts">
import {
  Scene,
  OrthographicCamera,
  Color,
  WebGLRenderer,
  sRGBEncoding,
  ReinhardToneMapping,
  Raycaster,
  Vector2,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  Vector3,
  MathUtils,
  GridHelper,
} from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { defineComponent, onMounted, onUnmounted, render } from 'vue';

export default defineComponent({
  setup() {
    // CANVAS + VARIABLES
    const canvas = document.querySelector('#canvas') as HTMLElement;
    let canvasWidth = document.documentElement.clientWidth
    let canvasHeight = document.documentElement.clientHeight
    const aspectRatio = canvasWidth / canvasHeight
    
    // RENDERER
    const renderer = new WebGLRenderer({antialias: true})
    renderer.setSize(canvasWidth, canvasHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.physicallyCorrectLights = true
    renderer.outputEncoding = sRGBEncoding
    renderer.toneMapping = ReinhardToneMapping
    renderer.toneMappingExposure = 12
    const render = () => {
      renderer.render(scene, camera)
    }

    // SCENE
    const scene: Scene = new Scene()
    scene.background = new Color('#000')

    // GRID HELPER
    const grid = new GridHelper(1000, 200)
    scene.add(grid)

    // MESHES
    const dims = {
      x: 10,
      y: 10,
      z: 10
    }
    const geometry = new BoxGeometry( dims.x, dims.y, dims.z );
    const material = new MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
      transparent: false,
      opacity: 0.0
    });
    const cube = new Mesh( geometry, material );
    cube.position.copy(new Vector3(0, dims.y/2, 0))
    scene.add( cube );
    
    // CAMERA
    const camera: OrthographicCamera = new OrthographicCamera(canvasWidth / - 2, canvasWidth / 2, canvasHeight / 2, canvasHeight / - 2, 1, 1000)
    camera.position.copy(new Vector3(0, 500, 0))
    camera.zoom = 25
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    camera.name = 'orthoCamera'
    scene.add(camera)
    
    // MAP CONTROLS
    const mapControls = new MapControls(camera, renderer.domElement)
    mapControls.enableDamping = true
    mapControls.dampingFactor = 0.05
    mapControls.screenSpacePanning = false
    mapControls.minDistance = 0.1
    mapControls.maxDistance = 1000
    mapControls.enableRotate = false
    mapControls.enablePan = true
    mapControls.addEventListener( 'change', render )

    // TRANSFORM CONTROLS
    const transformControls = new TransformControls(camera, renderer.domElement)
    transformControls.rotationSnap = MathUtils.degToRad(15)
    transformControls.addEventListener( 'change', render )
    transformControls.addEventListener( 'dragging-changed', ( event ) => {
      mapControls.enabled = ! event.value;
		});
    transformControls.attach(cube)
    transformControls.setMode('rotate')
    transformControls.setSize( 2 )
    transformControls.showX = false
    transformControls.showZ = false
    scene.add(transformControls)
    
    // RAYCASTER + MOUSE
    const raycaster = new Raycaster()
    const mouseVector = new Vector2()
    
    // ANIMATE LOOP
    const animate = () => {
      mapControls.update()
      raycaster.setFromCamera(mouseVector, camera)
      render()
      window.requestAnimationFrame(animate)
    }

    // INIT
    onMounted(() => {
      console.log('you mounted')
      document.querySelector('#app')?.append(renderer.domElement)
      renderer.domElement.addEventListener('mousemove', (event: MouseEvent) => {
        mouseVector.x = (event.offsetX / renderer.domElement.clientWidth) * 2 - 1
        mouseVector.y = (event.offsetY / renderer.domElement.clientHeight) * 2 + 1
      })
      animate()
    })

    // DESTROY
    onUnmounted(() => {
      console.log('you unmounted')
      document.querySelector('#app')?.removeChild(renderer.domElement)
    })
  }
})

</script>