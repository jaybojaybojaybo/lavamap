import { PerspectiveCamera } from "three"

export default function usePerspectiveCamera(gridSize: number, aspectRatio: number) {
    /* CAMERA - Perspective (cameraPersp = Primary) */
    const fov = 50 // Field of view --- lower to reduce distortion    
    const near = 0.1 // Near clipping plane
    const far = gridSize * 2 // Far clipping plane
    const perspCamera = new PerspectiveCamera(fov, aspectRatio, near, far)
    
    // starting position
    const z = Math.tan(30 * Math.PI/180) * (gridSize / 10)
    const y = Math.tan(60 * Math.PI/180) * z
    perspCamera.position.set(0, y, z)
    perspCamera.lookAt(0, 0 ,0)
    perspCamera.updateProjectionMatrix()
    perspCamera.name = "perspCamera"
    
    return perspCamera
}