/** Lower resolution reduces screenshot token count (~4x fewer tokens at 640x480 vs 1024x768) */
export const resolution = { x: 640, y: 480 }

export type DesktopActionInput = {
  action:
    | "click"
    | "rightClick"
    | "doubleClick"
    | "middleClick"
    | "type"
    | "key"
    | "hotkey"
    | "scroll"
    | "move"
    | "drag"
    | "wait"
    | "open"
  x?: number
  y?: number
  toX?: number
  toY?: number
  text?: string
  key?: string
  deltaY?: number
  ms?: number
}
