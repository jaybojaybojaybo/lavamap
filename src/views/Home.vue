<script lang="ts">
import useMapControls from '@/composables/useMapControls'
import useOrthographicCamera from '@/composables/useOrthographicCamera'
import usePerspectiveCamera from '@/composables/usePerspectiveCamera'
import { Dimensions } from '@/models/dimensions'
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
  ColorRepresentation,
  TetrahedronGeometry,
  SphereGeometry,
  PerspectiveCamera,
} from 'three'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
// VUE
import { defineComponent, inject, onMounted, onUnmounted, reactive, ref, Ref, toRef, toRefs, watch } from 'vue'

export default defineComponent({
  emits: ['selectedMode'],
  setup(props, {emit}) {
    // NAVBAR INFO
    const headerHeightRef = ref<number>(
      (
        document.querySelector('#navbar') ? 
        document.querySelector('#navbar')?.clientHeight : 
        0
      ) as number
    )
    // CANVAS + VARIABLES
    let canvasWidth = ref(document.documentElement.clientWidth)
    let canvasHeight = ref(document.documentElement.clientHeight)
    const aspectRatio = canvasWidth.value / canvasHeight.value
   
    // RENDERER
    const renderer = new WebGLRenderer({antialias: true})
    renderer.setSize(canvasWidth.value, canvasHeight.value)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.physicallyCorrectLights = true
    // renderer.domElement.style.position = 'absolute'
    // renderer.domElement.style.top = headerHeightRef.value + 'px'
    renderer.outputEncoding = sRGBEncoding
    renderer.toneMapping = ReinhardToneMapping
    renderer.toneMappingExposure = 12
    const render = () => {
      renderer.render(scene, currentCamera.value as PerspectiveCamera | OrthographicCamera)
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
    const selectedShape: Ref<string> = inject('selectedShape') as Ref<string>    
    console.log('selectedShape: ', selectedShape.value)
    function createMesh(x: number, y: number) {
      if (selectedShape.value === 'Cube') {
        return createCube(x, y)          
      } else if (selectedShape.value === 'Tetrahedron') {
        return createTetra(x, y)
      } else if (selectedShape.value === 'Sphere') {
        return createSphere(x, y)
      } else {
        console.log('What are you trying to build there, bud?')
      }
    }
     // CUBE
    let cubeIndex = 0
    function createCube(x: number, z: number): Mesh {
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
      cube.name = 'mesh-cube' + cubeIndex.toString();
      cubeIndex++
      return cube
    }
    // TETRAHEDRON
    let tetraIndex = 0
    function createTetra(x: number, z: number): Mesh {
      const radius = .5
      const tetraColor: ColorRepresentation = 0xffffff
      const geometry = new TetrahedronGeometry( radius )
      const material = new MeshBasicMaterial({
        color: tetraColor,
        wireframe: false,
        transparent: false,
        // opacity: 0.0
      })
      const tetra = new Mesh( geometry, material )
      tetra.position.copy(new Vector3(Math.round(x), radius/1.75  , Math.round(z)))
      tetra.material.color.setHex( Math.random() * tetraColor )
      tetra.name = 'mesh-tetra' + tetraIndex.toString();
      tetraIndex++
      return tetra
    }
    // SPHERE
    let sphereIndex = 0
    function createSphere(x: number, z: number): Mesh {
      const radius = .5;
      const widthSegments = 12;
      const heightSegments = 8;
      const sphereColor: ColorRepresentation = 0xffffff
      const geometry = new SphereGeometry( radius, widthSegments, heightSegments )
      const material = new MeshBasicMaterial({
        color: sphereColor,
        wireframe: false,
        transparent: false,
        // opacity: 0.0
      })
      const sphere = new Mesh( geometry, material )
      sphere.position.copy(new Vector3(Math.round(x), radius, Math.round(z)))
      sphere.material.color.setHex( Math.random() * sphereColor )
      sphere.name = 'mesh-sphere' + sphereIndex.toString();
      sphereIndex++
      return sphere
    }

    // END OF MESHES
    
    // CAMERA
    
    const perspCamera = usePerspectiveCamera(gridSize, aspectRatio)
    const orthoCamera = useOrthographicCamera(gridSize, aspectRatio)
    const currentCamera = ref()
    currentCamera.value = perspCamera as PerspectiveCamera
    scene.add(currentCamera.value)
    
    // MAP CONTROLS

    const perspMapControls = useMapControls(perspCamera, renderer.domElement)
    perspMapControls.value.addEventListener('change', render)
    const orthoMapControls = useMapControls(orthoCamera, renderer.domElement)
    orthoMapControls.value.enabled = false
    orthoMapControls.value.addEventListener('change', render)

    // TRANSFORM CONTROLS
    let transformControls = new TransformControls(currentCamera.value, renderer.domElement)
    transformControls.setSize( 1 )
    transformControls.addEventListener( 'change', render )
    transformControls.addEventListener( 'dragging-changed', function ( event ) {
      perspMapControls.value.enabled = ! event.value
      orthoMapControls.value.enabled = ! event.value
    })
    transformControls.setTranslationSnap( 1 )
    transformControls.setRotationSnap( MathUtils.degToRad( 15 ) )
    transformControls.setScaleSnap( 1 )
    // scene.add(transformControls as TransformControls)
    
    // RAYCASTER + MOUSE
    const raycaster: Raycaster = new Raycaster()
    const mouseVector = ref(new Vector2())

    // EVENT HANDLERS
    // WATCHERS
    const selectedMode: Ref<string> = inject('selectedMode') as Ref<string>
    let isEdit: Ref<Boolean> = ref(inject('isEdit') as boolean)
      // MODE
      watch(
        () => selectedMode.value, 
        (newValue) => {
          // turn on/off isEdit
          isEdit.value = newValue === 'Edit' ? true : false
        }
      )
      // EDIT ACTIVE STATE
      watch(
        () => isEdit.value,
        (newValue) => {
          // when saved, edit is turned off until next click
          if (newValue === false) {
            console.log('isEdit is false')
            transformControls.detach()
            transformControls.enabled = false
            scene.remove(transformControls)
          } else if (newValue === true) {
            transformControls.enabled = true
          }
        }
      )
    // KEYPRESS
    function handleKeyPress(event: KeyboardEvent) { 
      switch ( event.key ) {
        // case "c":
        // case "C":
        //   const position = currentCamera.value?.position.clone();
        //   currentCamera.value = currentCamera.value?.type === 'PerspectiveCamera' ? orthoCamera as OrthographicCamera : perspCamera as PerspectiveCamera;
        //   //@ts-ignore
        //   currentCamera.value.position.copy( position );
        //   transformControls.camera = currentCamera.value;
        //   const currentTarget = currentCamera.value.type === 'PerspectiveCamera' ? perspMapControls.value.target : orthoMapControls.value.target
        //   currentCamera.value.lookAt( currentTarget.x, currentTarget.y, currentTarget.z );
        //   handleResize();
        case "a":
        case "A":
          selectedMode.value = 'Add'
          emit('selectedMode', selectedMode.value)
          break
        case "e":
        case "E":
          selectedMode.value = 'Edit'
          break
        case "d":
        case "D":
          selectedMode.value = 'Delete'
          break
        case "t":
        case "T":          
          console.log('you tryina Translate, bro?')
          transformControls.setMode( 'translate' )
          break
        case "r":
        case "R":
          if (event.ctrlKey === false) {
            console.log('yo, where is the rotation?')
            transformControls.setMode( 'rotate' )
            transformControls.rotationSnap = MathUtils.degToRad(15)
          }
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
    let index = 0    
    function handleIntersects(event: MouseEvent) { 
      event.preventDefault()
      // Find intersections.
      let intersects = raycaster.intersectObjects(scene.children, true) as Intersection[]
      if (intersects.length > 0) {    
        console.log('intersect: ', intersects[0])   
        // MODES
        switch(selectedMode.value) {
          case 'Add':
            console.log('Add click: ', intersects[0])            
            if ( intersects[0].object.type === 'GridHelper') {
              console.log('intersect: ', intersects[0])
              let mesh = createMesh(intersects[0].point.x, intersects[0].point.z) as Mesh
              scene.add(mesh)
              console.log('mesh: ', mesh)
              intersects.length = 0
            } 
            break
          case 'Edit':       
            console.log('Edit click: ', intersects[0])
            transformControls.enabled = isEdit.value = true
            if (intersects[0].object.name.includes('mesh')) {
              intersects.forEach((intersect) => {
                console.log('yo - editing')                
                transformControls.attach(intersect.object)
                scene.add(transformControls as TransformControls)
                intersects.length = 0
              })
            }
            break
          case 'Delete':
            console.log('Delete click: ', intersects[0])
            if (intersects[0].object.name.includes('mesh')) {
              console.log('deleted: ', intersects[0].object.name)
              intersects[0].object.removeFromParent()
              intersects.length = 0
            }
            break
        }
      }
    }
    
    // ANIMATE LOOP
    const animate = () => {
      if (currentCamera.value.type === 'PerspectiveCamera') {
        perspMapControls.value.update()
      } else {
        orthoMapControls.value.update()
      }      
      raycaster.setFromCamera(mouseVector.value, currentCamera.value)
      render()
      window.requestAnimationFrame(animate)
    }

    // INIT
    onMounted(() => {
      console.log('you mounted')
      const app = document.querySelector('#app')
      app?.append(renderer.domElement)
      window.addEventListener( 'keydown', handleKeyPress, true)      
      window.addEventListener('resize', handleResize, true)      
      const rect = renderer.domElement.getBoundingClientRect();
      renderer.domElement.addEventListener('mousemove', (event: MouseEvent) => {
        // console.log('event: ', event)
        // console.log('rendererDom: ', renderer.domElement)
        mouseVector.value.x = ( ( event.offsetX - rect.left ) / ( rect.right - rect.left ) ) * 2 - 1;
        mouseVector.value.y = - ( ( event.offsetY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
      })
      renderer.domElement.addEventListener('mousedown', handleIntersects, true)
      console.log('onMounted selectedShape: ', selectedShape.value)
      console.log('onMounted selectedMode: ', selectedMode.value)
      animate()
    })

    // DESTROY
    onUnmounted(() => {
      console.log('you unmounted')
      document.querySelector('#app')?.removeChild(renderer.domElement)
      window.removeEventListener( 'keydown', handleKeyPress, true)
      window.removeEventListener( 'resize', handleResize, true)     
    })

    // WINDOW RESIZE HANDLER
    function handleResize() {
      canvasWidth.value = document.documentElement.clientWidth
      canvasHeight.value = document.documentElement.clientHeight
      const aspectRatio = canvasWidth.value / canvasHeight.value

      perspCamera.aspect = aspectRatio;
      perspCamera.updateProjectionMatrix();

      orthoCamera.left = orthoCamera.bottom * aspectRatio;
      orthoCamera.right = orthoCamera.top * aspectRatio;
      orthoCamera.updateProjectionMatrix();

      renderer.setSize( canvasWidth.value, canvasHeight.value );

      render();

    }
  }
})

</script>