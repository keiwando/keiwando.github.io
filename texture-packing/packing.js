
const RENDERING_SCALE = 0.3

const MAX_WIDTH = 4902
const SQUARE_RATIO = 0.9
let padding = 2
let max_square_size = 512



// struct Square {
//   int x;
//   int y;
//   int size;
// }

function drawSquare(ctx, square) {
  const r = square.size % 255
  const g = (square.size * 58 + 100) % 255
  const b = (square.size * 258 + 200) % 255
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
  const size = RENDERING_SCALE * square.size
  const x = RENDERING_SCALE * square.x
  const y = RENDERING_SCALE * square.y
  ctx.fillRect(x, y, size, size)
}

function isPointInSquare(x, y, square) {
  const right = square.x + square.size
  const bottom = square.y + square.size
  return square.x <= x && x < right 
    && square.y <= y && y < bottom
}

function isPointInAnySquare(x, y, squares) {
  for (let square of squares) {
    if (isPointInSquare(x, y, square))
      return [true, square.x + square.size]
  }
  return [false, 0]
}

function isPointInASquare(x, y, squares) {
  for (let square of squares) {
    if (isPointInSquare(x, y, square))
      return true
  }
  return false
}

function squareIntersection(lhs, rhs) {
  const lCX = lhs.x + 0.5 * lhs.size
  const lCY = lhs.y + 0.5 * lhs.size
  const rCX = rhs.x + 0.5 * rhs.size
  const rCY = rhs.y + 0.5 * rhs.size
  return (Math.abs(lCX - rCX) * 2 < (lhs.size + rhs.size)) && 
    (Math.abs(lCY - rCY) * 2 < (lhs.size + rhs.size))
}

function wouldSquareIntersect(sq, squares) {
  for (let square of squares) {
    if (squareIntersection(sq, square)) {
      return true
    }
  }
  return false
}

function firstIndexOfIntersection(sq, squares) {
  for (let i = 0; i < squares.length; i++) {
    if (squareIntersection(sq, squares[i])) {
      return i
    }
  }
  return -1
}

let sizes = [];

function refreshSizes() {
  sizes = []
  let x = max_square_size
  while (x > 0) {
    sizes.push(x + 2 * padding)
    x = Math.floor(x * SQUARE_RATIO)
  }
}

/**
 * @param {HTMLCanvasElement} canvas
 */
function pack(canvas) {

  refreshSizes()

  let squares = []
  let width = Math.max(max_square_size, canvas.width / RENDERING_SCALE)
  // Sizes are already sorted

  sizeLoop:
  for (let size of sizes) {
    for (let y = 0; y + size < MAX_WIDTH; y++) {
      for (let x = 0; x + size < width; x++) {

        let square = { x, y, size }
        let i = -1
        while ((i = firstIndexOfIntersection(square, squares)) != -1) {
          x = squares[i].x + squares[i].size
          square = { x, y, size }
        }
        if (x + size < width) {
          squares.push(square)
          continue sizeLoop
        }
      }
    }
  }


  let height = 0
  for (let square of squares) {
    height = Math.max(height, square.y + square.size)
  }

  canvas.height = height * RENDERING_SCALE

  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  for (let square of squares) {
    drawSquare(ctx, square)
  }
}



const canvas = document.getElementById('canvas')
const maxSizeInput = document.getElementById('max-size-input')
const paddingInput = document.getElementById('padding-input')
const widthInput = document.getElementById('width-input')
const slider = document.getElementById('width-slider')
const label = document.getElementById('label')

let atlasWidth = 800
canvas.width = 800
canvas.height = 600

slider.min = max_square_size
slider.max = MAX_WIDTH

function refreshLabel() {
  const width = atlasWidth
  const height = Math.floor(canvas.height / RENDERING_SCALE)
  label.innerText = `width: ${width}px | height: ${height}px | pixels: ${width * height}`
}

function refresh() {
  pack(canvas)
  refreshLabel()
  slider.min = max_square_size
  widthInput.value = atlasWidth
} 

function findAndDisplayOptimalWidth() {
  // Find optimal width
  let optimalPixels = MAX_WIDTH * MAX_WIDTH
  let optimalWidth = 0
  for (let width = max_square_size; width <= MAX_WIDTH; width++) {
    slider.value = width
    const w = Math.floor(canvas.width / RENDERING_SCALE)
    const h = Math.floor(canvas.height / RENDERING_SCALE)
    const px = w * h
    if (px < optimalPixels) {
      optimalPixels = px
      optimalWidth = width
    }
  }

  refresh()
}

refreshSizes()
findAndDisplayOptimalWidth()

maxSizeInput.value = max_square_size
paddingInput.value = padding
widthInput.value = MAX_WIDTH
slider.value = MAX_WIDTH

slider.oninput = () => {
  atlasWidth = parseInt(slider.value)
  canvas.width = parseInt(atlasWidth * RENDERING_SCALE)
  refresh()
}
maxSizeInput.onchange = () => {
  max_square_size = parseInt(maxSizeInput.value)
  refresh()
}
paddingInput.onchange = () => {
  padding = parseInt(paddingInput.value)
  refresh()
}
widthInput.onchange = () => {
  slider.value = widthInput.value
  slider.oninput()
  // canvas.width = parseInt(widthInput.value)
  // refresh()
}

slider.oninput()