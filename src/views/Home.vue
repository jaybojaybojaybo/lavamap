<template>
  <div></div>
</template>

<script lang="ts">
import { Dimensions } from '@/models/dimensions'
import { useKeyHandler } from '@/composables/useKeyHandler'
import { useTransformControls } from '@/composables/useTransformControls'
// THREE
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
Intersection,
InstancedMesh,
} from 'three'
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
// VUE
import { defineComponent, onMounted, onUnmounted, reactive, ref, Ref } from 'vue'

export default defineComponent({
  setup() {
    // CANVAS + VARIABLES
    let canvasWidth: number = document.documentElement.clientWidth
    let canvasHeight: number = document.documentElement.clientHeight
    const aspectRatio = canvasWidth / canvasHeight
    
    // RENDERER
    const renderer: Ref<WebGLRenderer> = ref(new WebGLRenderer({antialias: true}))
    renderer.value.setSize(canvasWidth, canvasHeight)
    renderer.value.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.value.physicallyCorrectLights = true
    renderer.value.outputEncoding = sRGBEncoding
    renderer.value.toneMapping = ReinhardToneMapping
    renderer.value.toneMappingExposure = 12
    const render = () => {
      renderer.value.render(scene, camera)
    }

    // SCENE
    const scene: Scene = new Scene()
    scene.background = new Color('#000')

    // GRID HELPER
    const gridSize = 1000
    const gridDivisions = 1000
    const grid: GridHelper = new GridHelper(gridSize, gridDivisions)
    scene.add(grid)

    // MESHES
    let cubeIndex = 0
    function createCube(x: number, z: number) {
      const cubeDims: Dimensions = {
        width: 1,
        height: 1,
        depth: 1
      }
      const geometry = new BoxGeometry( cubeDims.width, cubeDims.height, cubeDims.depth )
      const material = new MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: false,
        transparent: false,
        // opacity: 0.0
      })
      const cube = new Mesh( geometry, material )
      cube.position.copy(new Vector3(Math.round(x), cubeDims.height/2, Math.round(z)))
      console.log('cube.position: ', cube.position)
      cube.material.color.setHex( Math.random() * 0xffffff )
      cube.name = cubeIndex.toString();
      cubeIndex++
      return cube
    }
    
    // CAMERA
    const frustrumSize = 500
    const near = 1;
    const far = 1000
    const camera = new OrthographicCamera(
        canvasWidth / - 2 , 
        canvasWidth / 2, 
        canvasHeight / 2, 
        canvasHeight / - 2, 
        near,
        far
    ) 
    camera.position.copy(new Vector3(0, far/2, 0))
    camera.zoom = 65
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    camera.name = 'orthoCamera'
    scene.add(camera)
    
    // MAP CONTROLS
    const mapControls = ref(new MapControls(camera, renderer.value.domElement))
    mapControls.value.enableDamping = true
    mapControls.value.dampingFactor = 0.05
    mapControls.value.screenSpacePanning = false
    mapControls.value.minDistance = near * 10
    mapControls.value.maxDistance = far
    mapControls.value.enableRotate = false
    mapControls.value.enablePan = true
    mapControls.value.addEventListener( 'change', render )

    // TRANSFORM CONTROLS
    let transformControls = new TransformControls(camera, renderer.value.domElement)
    transformControls.setSize( 1 )
    transformControls.addEventListener( 'change', render )
    transformControls.addEventListener( 'dragging-changed', function ( event ) {
      mapControls.value.enabled = ! event.value
    })
    transformControls.setTranslationSnap( .5 )
    transformControls.setRotationSnap( MathUtils.degToRad( 15 ) )
    transformControls.setScaleSnap( 0.5 )
    scene.add(transformControls as TransformControls)
    
    // RAYCASTER + MOUSE
    const raycaster: Raycaster = new Raycaster()
    const mouseVector: Vector2 = new Vector2()

    // EVENT HANDLERS
    // KEYPRESS
    function handleKeyPress(event: KeyboardEvent) { 
      switch ( event.key ) {
        case "t":
        case "T":
            console.log('you tryina Translate, bro?')
            transformControls.setMode( 'translate' )
            break
        case "r":
        case "R":
            console.log('yo, where is the rotation?')
            transformControls.setMode( 'rotate' )
            transformControls.rotationSnap = MathUtils.degToRad(15)
            break
        case "s":
        case "S":
            console.log('adjust scale?')
            transformControls.setMode( 'scale' )            
            break
        case "+":
        case "=": // +, =, num+
            transformControls.setSize( transformControls.size + 0.1 )            
            break
        case "-":
        case "_": // -, _, num-
            transformControls.setSize( Math.max( transformControls.size - 0.1, 0.1 ) )            
            break
        case "x": // X
            transformControls.showX = ! transformControls.showX            
            break
        case "y": // Y
            transformControls.showY = ! transformControls.showY            
            break
        case "z": // Z
            transformControls.showZ = ! transformControls.showZ            
            break
        case " ": // Spacebar
            transformControls.enabled = ! transformControls.enabled            
            break
        case "Esc": // Esc
            transformControls.reset()            
            break
        }
    }
    // MOUSE CLICK
    function handleIntersects(event: MouseEvent) { 
      event.preventDefault()
      // Find intersections.
      let intersects = raycaster.intersectObjects(scene.children, true) as Intersection[]
      if (intersects.length > 0) {
        // Console logging the array of intersections.
        for (const intersect of intersects) {
          // if existing object is selected
          if (intersect.object.type !== 'GridHelper') {
            transformControls.attach(intersect.object)
            scene.add(transformControls as TransformControls)
            intersects.length = 0
          } 
          // if no object is selected
          console.log('intersect: ', intersect)
          let cube = createCube(intersect.point.x, intersect.point.z)
          scene.add(cube)
          transformControls.attach(cube)
          scene.add(transformControls as TransformControls)
          intersects.length = 0
        }
      }
    }    
    
    // ANIMATE LOOP
    const animate = () => {
      mapControls.value.update()
      raycaster.setFromCamera(mouseVector, camera)
      render()
      window.requestAnimationFrame(animate)
    }

    // INIT
    onMounted(() => {
      console.log('you mounted')
      const app = document.querySelector('#app')
      app?.append(renderer.value.domElement)
      window.addEventListener( 'keydown', handleKeyPress, true)
      renderer.value.domElement.addEventListener('mousemove', (event: MouseEvent) => {
        mouseVector.x = (event.offsetX / renderer.value.domElement.clientWidth) * 2 - 1
        mouseVector.y = (event.offsetY / renderer.value.domElement.clientHeight) * 2 + 1
      })
      renderer.value.domElement.addEventListener('click', handleIntersects, true)
      animate()
    })

    // DESTROY
    onUnmounted(() => {
      console.log('you unmounted')
      document.querySelector('#app')?.removeChild(renderer.value.domElement)
      window.removeEventListener( 'keydown', handleKeyPress, true)
    })
  }
})

</script>