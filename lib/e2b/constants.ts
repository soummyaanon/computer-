/** Sandbox desktop resolution. Bigger = more readable + fewer agent misclicks, but more tokens per screenshot. */
export const resolution = { x: 1280, y: 800 }

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
