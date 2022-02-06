import { OrthographicCamera, Vector3 } from "three"

export default function useOrthographicCamera(gridSize: number, aspectRatio: number) {
    const viewportWidth = gridSize * aspectRatio
    const viewportHeight = gridSize
    const zoomWidth = gridSize
    const zoomHeight = zoomWidth/aspectRatio
    const near = 1
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
    return camera
}