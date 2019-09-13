import {
  waterVertex, waterFragment, 
  unlitColorVertex, unlitColorFragment, 
  unlitTextureVertex, unlitTextureFragment
} from './waves-shaders.js'

const Colors = {
  lightPink: [0.9803921569, 0.8705882353, 0.8705882353, 1],
  darkPink: [1, 0.7411764706, 0.7490196078, 1],
  darkerPink: [0.969, 0.58, 0.635, 1],
  lightBlue: [0.3058823529, 0.8588235294, 0.9294117647, 1],
  darkBlue: [0.0275, 0.2235294118, 0.2509803922, 1]
}

const WATER_RESOLUTION = 100

const identityMat = createScaleMat(1, 1, 1)

const skyScaleMat = createScaleMat(2, 1, 2)
const skyTranslationMat = createTranslationMat(0, 1, 0)

/**
 * @returns {Float32Array}
 */
function createScaleMat(scaleX, scaleY, scaleZ = 1) {
  return new Float32Array([
    scaleX, 0, 0, 0,
    0, scaleY, 0, 0,
    0, 0, scaleZ, 0,
    0, 0, 0, 1
  ])
}

/**
 * @returns {Float32Array}
 */
function createTranslationMat(tx, ty, tz = 1) {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    tx, ty, tz, 1
  ])
}

/**
 * @param {Vector3} position 
 * @param {Vector3} target 
 * @param {Vector3} up 
 */
function createLookAt(position, target, up) {
  
  let f = target.minus(position).normalized()
  const s = f.cross(up).normalized()
  const u = s.cross(f)

  return new Float32Array([
    s.x, u.x, -f.x, 0,
    s.y, u.y, -f.y, 0,
    s.z, u.z, -f.z, 0,
    -s.dot(position), -u.dot(position), f.dot(position), 1
  ])
}

/**
 * @param {number} n The near plane
 * @param {number} f The far plane
 * @param {number} r The near right edge
 * @param {number} t The near top edge
 */
function createProjection(n, f, r, t) {

  return new Float32Array([
    n / r, 0, 0, 0,
    0, n / t, 0, 0,
    0, 0, -(f + n)/(f - n), -1,
    0, 0, -2 * f * n / (f - n), 0
  ])  
}

class Vector3 {
  constructor(x, y, z) {
    /** @member {number} */
    this.x = x
    /** @member {number} */
    this.y = y
    /** @member {number} */
    this.z = z
  }

  /**
   * @param {Vector3} other 
   * @returns {Vector3}
   */
  cross(other) {
    return new Vector3(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x,
    )
  }

  /**
   * @param {Vector3} other 
   * @returns {Vector3}
   */
  dot(other) {
    return this.x * other.x + this.y * other.y + this.z * other.z
  }

  /**
   * @param {Vector3} other
   * @returns {Vector3}
   */
  minus(other) {
    return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z)
  }

  /**
   * @param {number} scalar 
   * @returns {Vector3}
   */
  divide(scalar) {
    return new Vector3(this.x / scalar, this.y / scalar, this.z / scalar)
  }

  /** @returns {number} */
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
  }

  /** @returns {Vector3} */
  normalized() {
    const len = this.length()
    if (len === 0) return this
    return this.divide(len)
  }
}


class Geometry {

  /** @returns {WebGLBuffer} */
  get buffer() {
    return this._buffer
  }

  /** @returns {WebGLBuffer} */
  get indices() {
    return this._indexBuffer
  }

  /**
   * @param {Vertex[]} vertices 
   */
  constructor(vertices, indices) {
    this._bufferData = new Float32Array(vertices.map(v => v.data).flat())
    if (!indices) {
      this._indices = new Uint16Array(Array(this._bufferData.length).keys())
    } else {
      this._indices = new Uint16Array(indices)
    }
  }

  /**
   * @param {WebGLRenderingContext} gl
   */
  upload(gl) {
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, this._bufferData, gl.STATIC_DRAW)
    this._buffer = buffer
    const indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.STATIC_DRAW)
    this._indexBuffer = indexBuffer
  }
}

class Vertex {

  /** @returns {number[]} */
  get data() {
    return this._data
  }

  /** @param {number[]} data */
  constructor(...data) {
    this._data = data
  }
}

class Wave404Renderer {

  constructor(canvas) {

    /**
     * @member {HTMLCanvasElement}
     */
    this.canvas = canvas
    /**
     * @member {WebGLRenderingContext}
     */
    this.gl = canvas.getContext('webgl')

    /**
     * @member {WebGLShader}
     */
    this.waterShader = this._createProgram(this.gl, waterVertex, waterFragment)
    /**
     * @member {WebGLShader}
     */
    this.unlitShader = this._createProgram(this.gl, unlitColorVertex, unlitColorFragment)
    /**
     * @member {WebGLShader}
     */
    this.unlitTextureShader = this._createProgram(this.gl, unlitTextureVertex, unlitTextureFragment)

    /**
     * @member {Geometry}
     */
    this.skyGeometry = this._createSkyGeometry()
    this.skyGeometry.upload(this.gl)
    /** 
     * @member {Geometry} 
     */
    this.waterGeometry = this._createWaterGeometry()
    this.waterGeometry.upload(this.gl)

    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    /** @member {number} */
    this.time = 0

    const canvasAspect = canvas.width / canvas.height
    this.projMat = createProjection(0.1, 10, 0.1, 0.1 / canvasAspect)

    this.viewMat = createLookAt(
      new Vector3(0, 0.2, -2),
      new Vector3(0, 0, 0),
      new Vector3(0, 1, 1)
    )
  }

  render(deltaTime) {

    this._render(this.gl, this.canvas, deltaTime)
  }

  /**
   * @param {WebGLRenderingContext} gl 
   * @param {HTMLCanvasElement} canvas 
   * @param {number} deltaTime 
   */
  _render(gl, canvas, deltaTime) {

    gl.viewport(0, 0, canvas.width, canvas.height)
    // Clear
    gl.clearColor(...Colors.lightPink, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    // Render sky background

    let program = this.unlitShader
    gl.useProgram(program)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.skyGeometry.buffer)
    let positionIndex = gl.getAttribLocation(program, "a_position")
    const colorIndex = gl.getAttribLocation(program, "a_color")
    gl.vertexAttribPointer(positionIndex, 4, gl.FLOAT, false, 32, 0)
    gl.vertexAttribPointer(colorIndex, 4, gl.FLOAT, false, 32, 16)
    gl.enableVertexAttribArray(positionIndex)
    gl.enableVertexAttribArray(colorIndex)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.skyGeometry.indices)

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_proj"), false, skyScaleMat)
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_view"), false, skyTranslationMat)
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_model"), false, identityMat)
    
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)

    // Render waves

    program = this.waterShader
    gl.useProgram(program)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.waterGeometry.buffer)
    positionIndex = gl.getAttribLocation(program, "a_position")
    gl.vertexAttribPointer(positionIndex, 4, gl.FLOAT, false, 0, 0)
    gl.disableVertexAttribArray(colorIndex)
    gl.enableVertexAttribArray(positionIndex)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.waterGeometry.indices)

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_proj"), false, this.projMat)
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_view"), false, this.viewMat)
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_model"), false, createScaleMat(10, 4, 4))
    
    gl.uniform1f(gl.getUniformLocation(program, "u_time"), this.time)

    gl.drawElements(gl.TRIANGLES, this.waterGeometry._indices.length, gl.UNSIGNED_SHORT, 0)

    this.time += deltaTime
  }

  /** @returns {Geometry} */
  _createSkyGeometry() {
    return this._createVerticalGradientQuad(Colors.darkerPink, Colors.lightPink)
  }

  /** @returns {Geometry} */
  _createWaterGeometry() {

    const mappedIdx = (x, y) => {
      return WATER_RESOLUTION * y + x
    }

    var vertices = []
    var indices = []
    for (let y = 0; y < WATER_RESOLUTION; y++) {
      for (let x = 0; x < WATER_RESOLUTION; x++) {
        
        vertices.push(new Vertex(-0.5 + (x / (WATER_RESOLUTION - 1)), 0, -0.5 + (y / (WATER_RESOLUTION - 1)), 1))
        // vertices.push(new Vertex(-0.5 + (x / (WATER_RESOLUTION - 1)), -0.5 + (y / (WATER_RESOLUTION - 1)), 0, 1))

        if (y !== WATER_RESOLUTION - 1 && x !== WATER_RESOLUTION - 1) {
          indices.push(mappedIdx(x, y), mappedIdx(x, y + 1), mappedIdx(x + 1, y + 1))
          indices.push(mappedIdx(x + 1, y), mappedIdx(x, y), mappedIdx(x + 1, y + 1))
        }  
      }
    }
    return new Geometry(vertices, indices)
  }

  /**
   * @param {number[]} topColor 
   * @param {number[]} bottomColor 
   * @returns {Geometry}
   */
  _createVerticalGradientQuad(topColor, bottomColor) {
    return new Geometry([
      new Vertex(-0.5, -0.5, 0, 1, ...bottomColor),
      new Vertex(0.5, -0.5, 0, 1, ...bottomColor),
      new Vertex(-0.5, 0.5, 0, 1, ...topColor),
      new Vertex(0.5, 0.5, 0, 1, ...topColor)
    ],[0, 1, 2, 2, 1, 3])
  }

  // Returns program id
  /** 
   * @param {WebGLRenderingContext} gl 
   * */
  _createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = this._createShader(gl, vertexSource, gl.VERTEX_SHADER)
    const fragmentShader = this._createShader(gl, fragmentSource, gl.FRAGMENT_SHADER)
    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    const success = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (!success) {
        throw new Error("Failed to link program: " + gl.getProgramInfoLog(program))
    }
    return program
  }

  /**
   * @param {WebGLRenderingContext} gl 
   * @param {string} source
   * @param {number} type
   */
  _createShader(gl, source, type) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    if (!success) {
        throw new Error("Failed to compile shader: " + gl.getShaderInfoLog(shader))
    }
    return shader
  }

}

const canvas = document.querySelector('canvas')
const renderer = new Wave404Renderer(canvas)

let time = 0
function renderLoop (now = 0) {

  if (!time) 
    time = now
  var elapsed = now - time
  time = now

  renderer.render(elapsed)
  requestAnimationFrame(renderLoop)
}
renderLoop()

// Safari doesn't immediately render the canvas without these lines.
const parent = canvas.parentNode
parent.removeChild(canvas)
parent.appendChild(canvas)