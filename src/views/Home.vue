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
ColorRepresentation,
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
    const gridSize = 100
    const gridDivisions = gridSize*2
    const grid: GridHelper = new GridHelper(gridSize, gridDivisions)
    grid.name = 'grid'
    scene.add(grid)

    // MESHES
    let cubeIndex = 0
    function createCube(x: number, z: number) {
      const cubeDims: Dimensions = {
        width: 1,
        height: 1,
        depth: 1
      }
      const cubeColor: ColorRepresentation = 0xffffff
      const geometry = new BoxGeometry( cubeDims.width, cubeDims.height, cubeDims.depth )
      const material = new MeshBasicMaterial({
        color: cubeColor,
        wireframe: false,
        transparent: false,
        // opacity: 0.0
      })
      const cube = new Mesh( geometry, material )
      cube.position.copy(new Vector3(Math.round(x), cubeDims.height/2, Math.round(z)))
      cube.material.color.setHex( Math.random() * cubeColor )
      cube.name = 'cube' + cubeIndex.toString();
      cubeIndex++
      return cube
    }
    
    // CAMERA
    const viewportWidth = gridSize * aspectRatio
    const viewportHeight = gridSize
    const zoomWidth = gridSize
    const zoomHeight = zoomWidth/aspectRatio
    const near = 1;
    const far = 1000
    const camera = new OrthographicCamera(
        viewportWidth / - 2 , 
        viewportWidth / 2, 
        viewportHeight / 2, 
        viewportHeight / - 2, 
        near,
        far
    )
    const initialZoomFactor = zoomHeight < viewportHeight ? viewportHeight/zoomHeight * 10 : 1
    camera.position.copy(new Vector3(0, 0, 0))
    camera.zoom = initialZoomFactor
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
    transformControls.setTranslationSnap( 1 )
    transformControls.setRotationSnap( MathUtils.degToRad( 15 ) )
    transformControls.setScaleSnap( 1 )
    // scene.add(transformControls as TransformControls)
    
    // RAYCASTER + MOUSE
    const raycaster: Raycaster = new Raycaster()
    const mouseVector: Vector2 = new Vector2()

    // EVENT HANDLERS
    // KEYPRESS
    function handleKeyPress(event: KeyboardEvent) { 
      switch ( event.key ) {
        case "t":
        case "T":
          transformControls.showX = true
          transformControls.showY = false
          transformControls.showZ = true
          console.log('you tryina Translate, bro?')
          transformControls.setMode( 'translate' )
          break
        case "r":
        case "R":
          if (event.ctrlKey === false) {
            console.log('yo, where is the rotation?')
            transformControls.showX = false
            transformControls.showY = true
            transformControls.showZ = false
            transformControls.setMode( 'rotate' )
            transformControls.rotationSnap = MathUtils.degToRad(15)
          }
          break
        case "s":
        case "S":
          transformControls.showX = true
          transformControls.showY = false
          transformControls.showZ = true
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
    let index = 0
    function handleIntersects(event: MouseEvent) { 
      event.preventDefault()
      // Find intersections.
      let intersects = raycaster.intersectObjects(scene.children, true) as Intersection[]
      if (intersects.length > 0) {       
        // if existing object is selected        
        // if no object is selected
        console.log('intersects @' + index + ' length: ', intersects.length)
        index ++
        if (
          intersects[0].object.type === 'GridHelper' || 
          intersects[0].object.type === 'TransformControlsPlane' ||
          (intersects[0].object.type === 'Line' && intersects[0].object.parent?.type !== 'TransformControlsPlane')
        ) {
            console.log('first one was one of the three: ', intersects[0])
            let cube = createCube(intersects[0].point.x, intersects[0].point.z)
            scene.add(cube)
            transformControls.attach(cube)
            scene.add(transformControls as TransformControls)
            intersects.length = 0
        } else if (
          intersects[0].object.type === 'Mesh' && 
          intersects[0].object.name.includes('cube')
        )
        {
            intersects.forEach((intersect) => {
              console.log('intersect @' + intersects.indexOf(intersect) + ': ', intersect )
              transformControls.attach(intersect.object)
              scene.add(transformControls as TransformControls)
              intersects.length = 0
            })
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
        mouseVector.y = -(event.offsetY / renderer.value.domElement.clientHeight) * 2 + 1
      })
      renderer.value.domElement.addEventListener('mousedown', handleIntersects, true)
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