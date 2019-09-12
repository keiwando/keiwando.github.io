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

const waterVertex = `
  precision highp float;

  uniform mat4 u_model;
  uniform mat4 u_view;
  uniform mat4 u_proj;
  uniform float u_time;

  attribute vec4 a_position;

  varying vec4 pos;

  float rand(vec2 co){
	
    return fract(sin(dot(co.xy , vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    gl_Position = a_position.xzyw;
    pos = u_proj * (u_view * (u_model * a_position));
    // pos = (u_view * (u_model * a_position));
    // pos.z = abs(pos.z);
    gl_Position = pos;
    // gl_Position.z = abs(gl_Position.z);
    // gl_Position = mix(a_position.xzyw, pos, u_time * 0.000001);
  }
`

const waterFragment = `
  precision highp float;

  const vec4 LIGHT_BLUE = vec4(0.3058823529, 0.8588235294, 0.9294117647, 1);
  const vec4 DARK_BLUE = vec4(0.0275, 0.2235294118, 0.2509803922, 1);

  varying vec4 pos;
    
  void main() {

    gl_FragColor = DARK_BLUE;
    // gl_FragColor = vec4(pos.xyz, 1.0) + vec4(0.2, 0.2, 0.2, 0);

    // x = red
    // gl_FragColor = vec4(pos.x, 0.0, 0.0, 1.0);

    // y = green
    // gl_FragColor = vec4(0.0, pos.y, 0.0, 1.0);

    // z = blue
    // gl_FragColor = vec4(0.0, 0.0, pos.z, 1.0);
    // gl_FragColor = vec4(0.0, 0.0, abs(pos.z), 1.0);

    // w = red
    // gl_FragColor = vec4(pos.w, 0.0, 0.0, 1.0);

    // gl_FragColor = DARK_BLUE;
  }

`

export { 
  waterVertex, waterFragment,
  unlitColorVertex, unlitColorFragment,
  unlitTextureVertex, unlitTextureFragment
}