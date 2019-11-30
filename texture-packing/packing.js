
const RENDERING_SCALE = 0.3

const MIN_WIDTH = 512
const MAX_WIDTH = 4902
const SQUARE_RATIO = 0.9
const PADDING = 0

let sizes = [];
(function(){
  let x = 512
  while (x > 0) {
    sizes.push(x)
    x = Math.floor(x * SQUARE_RATIO)
  }
})()

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

/**
 * @param {HTMLCanvasElement} canvas
 */
function pack(canvas) {

  let squares = []
  let width = Math.max(512, canvas.width / RENDERING_SCALE)
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
const slider = document.getElementById('width-slider')
const label = document.getElementById('label')

canvas.width = 800
canvas.height = 600

slider.min = MIN_WIDTH
slider.max = MAX_WIDTH

function refreshLabel() {
  const width = Math.floor(canvas.width / RENDERING_SCALE)
  const height = Math.floor(canvas.height / RENDERING_SCALE)
  label.innerText = `width: ${width}px | height: ${height}px | pixels: ${width * height}`
}

slider.oninput = () => {
  canvas.width = parseInt(slider.value * RENDERING_SCALE)
  pack(canvas)
  refreshLabel()
}

slider.value = MAX_WIDTH

slider.oninput()
pack(canvas)
refreshLabel()

// Find optimal width
let optimalPixels = MAX_WIDTH * MAX_WIDTH
let optimalWidth = 0
for (let width = MIN_WIDTH; width <= MAX_WIDTH; width++) {
  slider.value = width
  const w = Math.floor(canvas.width / RENDERING_SCALE)
  const h = Math.floor(canvas.height / RENDERING_SCALE)
  const px = w * h
  if (px < optimalPixels) {
    optimalPixels = px
    optimalWidth = width
  }
}

slider.value = optimalWidth
pack(canvas)
refreshLabel()