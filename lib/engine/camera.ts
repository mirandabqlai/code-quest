// lib/engine/camera.ts
//
// The camera controls what part of the office is visible on screen.
// Two modes: zoomed out (see all rooms) and zoomed in (one room fills the view).
// Smooth transitions between positions using linear interpolation.

export type CameraMode = 'overview' | 'room' | 'tour';

export interface Camera {
  x: number;          // current center x in world pixels
  y: number;          // current center y in world pixels
  zoom: number;       // current zoom level (1 = 1 world pixel = 1 screen pixel)
  targetX: number;
  targetY: number;
  targetZoom: number;
  mode: CameraMode;
}

export function createCamera(): Camera {
  return {
    x: 0, y: 0, zoom: 1,
    targetX: 0, targetY: 0, targetZoom: 1,
    mode: 'overview',
  };
}

/** Smoothly move camera toward its target. Called every frame. */
export function updateCamera(camera: Camera, dt: number): void {
  const lerpSpeed = 4; // higher = faster transitions
  const t = 1 - Math.exp(-lerpSpeed * dt);

  camera.x += (camera.targetX - camera.x) * t;
  camera.y += (camera.targetY - camera.y) * t;
  camera.zoom += (camera.targetZoom - camera.zoom) * t;

  // Snap when close enough to avoid floating point drift
  if (Math.abs(camera.x - camera.targetX) < 0.5) camera.x = camera.targetX;
  if (Math.abs(camera.y - camera.targetY) < 0.5) camera.y = camera.targetY;
  if (Math.abs(camera.zoom - camera.targetZoom) < 0.001) camera.zoom = camera.targetZoom;
}

/** Set camera to show the entire office */
export function focusOverview(
  camera: Camera,
  worldWidth: number,
  worldHeight: number,
  canvasWidth: number,
  canvasHeight: number
): void {
  camera.mode = 'overview';
  camera.targetX = worldWidth / 2;
  camera.targetY = worldHeight / 2;
  // Fit the whole world in the canvas with some padding
  const zoomX = canvasWidth / (worldWidth + 32);
  const zoomY = canvasHeight / (worldHeight + 32);
  camera.targetZoom = Math.min(zoomX, zoomY);
}

/** Set camera to zoom into a specific room */
export function focusRoom(
  camera: Camera,
  roomCenterX: number,
  roomCenterY: number,
  roomPixelWidth: number,
  roomPixelHeight: number,
  canvasWidth: number,
  canvasHeight: number
): void {
  camera.mode = 'room';
  camera.targetX = roomCenterX;
  camera.targetY = roomCenterY;
  // Zoom so room fills ~80% of canvas
  const zoomX = (canvasWidth * 0.8) / roomPixelWidth;
  const zoomY = (canvasHeight * 0.8) / roomPixelHeight;
  camera.targetZoom = Math.min(zoomX, zoomY);
}

/** Set camera to follow a character (for Mike's tour) */
export function followCharacter(
  camera: Camera,
  charX: number,
  charY: number,
  canvasWidth: number,
  canvasHeight: number
): void {
  camera.mode = 'tour';
  camera.targetX = charX;
  camera.targetY = charY;
  // Moderate zoom for tour — not too close, not too far
  camera.targetZoom = Math.min(canvasWidth, canvasHeight) / 200;
}

/** Transform world coordinates to screen coordinates for drawing */
export function worldToScreen(
  camera: Camera,
  worldX: number,
  worldY: number,
  canvasWidth: number,
  canvasHeight: number
): { screenX: number; screenY: number } {
  return {
    screenX: (worldX - camera.x) * camera.zoom + canvasWidth / 2,
    screenY: (worldY - camera.y) * camera.zoom + canvasHeight / 2,
  };
}

/** Transform screen coordinates to world coordinates (for click detection) */
export function screenToWorld(
  camera: Camera,
  screenX: number,
  screenY: number,
  canvasWidth: number,
  canvasHeight: number
): { worldX: number; worldY: number } {
  return {
    worldX: (screenX - canvasWidth / 2) / camera.zoom + camera.x,
    worldY: (screenY - canvasHeight / 2) / camera.zoom + camera.y,
  };
}
