import {
  waveVertex, waveFragment, 
  unlitColorVertex, unlitColorFragment, 
  unlitTextureVertex, unlitTextureFragment
} from './shaders.js'

const Colors = {
  lightPink: [0.9803921569, 0.8705882353, 0.8705882353, 1],
  darkPink: [1, 0.7411764706, 0.7490196078, 1]
}

const identityMat = new Float32Array([
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
])
const scale2Mat = new Float32Array([
  2, 0, 0, 0,
  0, 2, 0, 0,
  0, 0, 2, 0,
  0, 0, 0, 1
])


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
      this._indices = new Float32Array(Array(this._bufferData.length).keys())
    } else {
      this._indices = new Uint8Array(indices)
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

  /** @returns {WebGLRenderingContext} */
  get gl() {
    return this._gl
  } 

  /** @returns {HTMLCanvasElement} */
  get canvas() {
    return this._canvas
  }

  /** @returns {WebGLProgram} */
  get unlitShader() {
    return this._unlitShader
  }

  /** @returns {WebGLProgram} */
  get unlitTextureShader() {
    return this._unlitTextureShader
  }

  /** @returns {WebGLProgram} */
  get waterShader() {
    return this._waterShader
  }

  /** @returns {Geometry} */
  get skyGeometry() {
    return this._skyGeometry
  }

  constructor(canvas) {
    this._canvas = canvas
    this._gl = canvas.getContext('webgl')
    this._waterShader = this._createProgram(this.gl, waveVertex, waveFragment)
    this._unlitShader = this._createProgram(this.gl, unlitColorVertex, unlitColorFragment)
    this._unlitTextureShader = this._createProgram(this.gl, unlitTextureVertex, unlitTextureFragment)
    this._skyGeometry = this._createSkyGeometry()
    this._skyGeometry.upload(this._gl)

    // console.log(this._skyGeometry._bufferData.length)

    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
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

    const projMat = new Float32Array([
      2 / canvas.width, 0, 0, 0,
      0, 2 / canvas.height, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ])
    
    // Render sky background
    let program = this._unlitShader
    gl.useProgram(program)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.skyGeometry.buffer)
    const positionIndex = gl.getAttribLocation(program, "a_position")
    const colorIndex = gl.getAttribLocation(program, "a_color")
    gl.vertexAttribPointer(positionIndex, 4, gl.FLOAT, false, 32, 0)
    gl.vertexAttribPointer(colorIndex, 4, gl.FLOAT, false, 32, 16)
    gl.enableVertexAttribArray(positionIndex)
    gl.enableVertexAttribArray(colorIndex)

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_proj"), false, scale2Mat)
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_view"), false, identityMat)
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_model"), false, identityMat)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.skyGeometry.indices)
    
    // gl.drawArrays(gl.TRIANGLES, 0, 6)
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0)

    // Render waves
    // Render overlay 404 message
  }

  /** @returns {Geometry} */
  _createSkyGeometry() {
    return this._createVerticalGradientQuad(Colors.darkPink, Colors.lightPink)
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
      new Vertex(0.5, 0.5, 0, 1, ...topColor),
      // new Vertex(-0.5, -0.5, 0, 1, ...bottomColor),
      // new Vertex(0.5, -0.5, 0, 1, ...bottomColor),
      // new Vertex(-0.5, 0.5, 0, 1, ...topColor),
      // new Vertex(-0.5, 0.5, 0, 1, ...topColor),
      // new Vertex(0.5, -0.5, 0, 1, ...bottomColor),
      // new Vertex(0.5, 0.5, 0, 1, ...topColor),
      // new Vertex(-0.5, -0.5, 0, 1),
      // new Vertex(0.5, -0.5, 0, 1),
      // new Vertex(-0.5, 0.5, 0, 1),
      // new Vertex(0.5, 0.5, 0, 1),
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
function renderLoop (now) {

  if (!time) time = now
  var elapsed = now - time

  renderer.render(elapsed)
  requestAnimationFrame(renderLoop)
}
renderLoop()