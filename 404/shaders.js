const unlitColorVertex = `
  precision highp float;

  uniform mat4 u_model;
  uniform mat4 u_view;
  uniform mat4 u_proj;

  attribute vec4 a_position;
  attribute vec4 a_color;

  varying vec4 v_color;

  void main() {

    v_color = a_color;
    gl_Position = u_proj * (u_view * (u_model * a_position));
  }
`

const unlitColorFragment = `
  precision highp float;

  varying vec4 v_color;

  void main() {
    gl_FragColor = v_color;
    // gl_FragColor = vec4(1, 0, 0, 0);
  }
`

const unlitTextureVertex = `
  precision highp float;

  uniform mat4 u_mvp;

  attribute vec4 a_position;
  attribute vec2 a_uv;

  varying vec2 v_uv;

  void main() {
    v_uv = a_uv;
    gl_Position = u_mvp * a_position;
  }
`

const unlitTextureFragment = `
  precision highp float;

  uniform sampler2D u_sampler;
  varying vec2 v_uv;

  void main() {
    gl_FragColor = texture2D(u_sampler, v_uv);
  }
`

const waveVertex = `
  precision highp float;

  attribute vec4 a_position;

  void main() {
    gl_Position = a_position;
  }
`

const waveFragment = `
  precision highp float;

  void main() {
    gl_FragColor = vec4(0.431, 0.87, 0.9, 1.0);
  }

`

export { 
  waveVertex, waveFragment,
  unlitColorVertex, unlitColorFragment,
  unlitTextureVertex, unlitTextureFragment
}