// Variables

var blendMode = 0
var blendCode = ""

const SRC = [1, 0, 0, 0.4]
const DST = [0, 0, 0, 0.0]


// UI controls

const srcPreviewCtx = document.getElementById('sourceCanvas').getContext('2d')
const dstPreviewCtx = document.getElementById('dstCanvas').getContext('2d')

const list = document.getElementsByTagName('li')
for (let link of list) {
  link.onclick = () => {
    blendMode = parseInt(link.getAttribute('blendMode'))
    refresh()
  }
}
const label = document.getElementById('label')

const blendCodeInput = document.getElementById('blendCodeInput')
blendCodeInput.value = blendCode
blendCodeInput.onchange = () => {
  blendCode = blendCodeInput.value
  refresh()
}

const srcColorInputs = document.getElementsByClassName('srcColorInput')
for (let inp of srcColorInputs) {
  let idx = parseInt(inp.getAttribute('colorIndex'))
  inp.oninput = () => {
    SRC[idx] = inp.value
    refresh()
    refreshColorPreviewCanvas(srcPreviewCtx, SRC)
  }
  inp.setAttribute('value', SRC[idx]) 
  refreshColorPreviewCanvas(srcPreviewCtx, SRC)
}

const dstColorInputs = document.getElementsByClassName('dstColorInput')
for (let inp of dstColorInputs) {
  let idx = parseInt(inp.getAttribute('colorIndex'))
  inp.oninput = () => {
    DST[idx] = inp.value
    refresh()
    refreshColorPreviewCanvas(dstPreviewCtx, DST)
  }
  inp.setAttribute('value', DST[idx]) 
  refreshColorPreviewCanvas(dstPreviewCtx, DST)
}

function refreshColorPreviewCanvas(ctx, color) {
  ctx.fillStyle = `rgba(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255}, ${color[3]})`
  ctx.clearRect(0, 0, 100, 100)
  ctx.fillRect(0, 0, 100, 100)
}

function blendModeName(blendMode) {
  switch (blendMode) {
    case 0: return "Normal"
    case 1: return "Erase"
        
    // darken
    case 2: return "Darken"
    case 3: return "Multiply"
    case 4: return "Color Burn"
    case 5: return "Linear Burn"
    case 6: return "Darken Color"
        
    // lighten
    case 7: return "Lighten"
    case 8: return "Screen"
    case 9: return "Color Dodge"
    case 10: return "Add"
    case 11: return "Lighten Color"
        
    // contrast
    case 12: return "Overlay"
    case 13: return "Soft Light"
    case 14: return "Hard Light"
    case 15: return "Vivid Light"
    case 16: return "Linear Light"
    case 17: return "Pin Light"
    case 18: return "Hard Mix"
        
    // inversion / cancellation
    case 19: return "Difference"
    case 20: return "Exclusion"
    case 21: return "Subtract"
    case 22: return "Divide"
        
    // component
    case 23: return "Hue"
    case 24: return "Saturation"
    case 25: return "Color"
    case 26: return "Luminosity"
  }
}

// Rendering

const canvas = document.getElementById('canvas')
const gl = canvas.getContext("webgl")

canvas.width = 1000
canvas.height = 1000



function blendNormal(src, dst) {
  return src
}

function blendChannel(src, srcA, dst, dstA) {

  let resA = blendAlpha(srcA, dstA)
  let blended = blendNormal(src, dst)

  if (blendCode === "") {
    return src + (dst * (1 - srcA))
    // return (1.0 - (srcA / resA)) * dst + (srcA / resA) * ((1.0 - dstA) * src + dstA * blended)
  } else {
    return eval(blendCode)
  }
}

function blendAlpha(srcA, dstA) {
  return srcA + dstA * (1 - srcA)
}

function premultiply(col) {
  let a = col[3]
  return [col[0] * a, col[1] * a, col[2] * a, a]
} 

function blend(src, dst) {

  let srcA = src[3]
  let dstA = dst[3]

  var out = [0, 0, 0, blendAlpha(srcA, dstA)]
  for (let i = 0; i < 3; i++) {
    out[i] = blendChannel(src[i], srcA, dst[i], dstA)
  }

  out = premultiply(out)

  gl.clearColor(out[0], out[1], out[2], out[3])
}

function refresh() {
  blend(SRC, DST)
  gl.clear(gl.COLOR_BUFFER_BIT)
  label.innerText = blendModeName(blendMode)
}


gl.disable(gl.BLEND)
refresh()

