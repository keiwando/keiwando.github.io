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

  varying vec4 v_pos;
  varying vec4 pos;
  varying float offset;
  varying float v_distance;

  float rand(vec2 co){
	
    return fract(sin(dot(co.xy , vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    
    float distanceWeight = 0.5 - a_position.z;
    offset = distanceWeight * sin((u_time + rand(a_position.zx) * 10000.0) * 0.001) * 0.005 * rand(a_position.xz);
    pos = a_position + vec4(0, offset, 0, 0);
    
    gl_Position = u_proj * (u_view * (u_model * pos));
    v_pos = a_position;
    v_distance = 1.0 - distanceWeight;
  }
`

const waterFragment = `
  precision highp float;

  const vec4 LIGHT_BLUE = vec4(0.3058823529, 0.8588235294, 0.9294117647, 1);
  const vec4 DARK_BLUE = vec4(0.0275, 0.2235294118, 0.2509803922, 1);
  const vec4 FOG_COLOR = vec4(0.9803921569, 0.8705882353, 0.8705882353, 1);

  const float FOG_DENSITY = 0.8;

  varying vec4 v_pos;
  varying vec4 pos;
  varying float offset;
  varying float v_distance;

  float exponentialFogWeight(float distance) {
    return 1.0 - (1.0 / (exp(pow(distance, 2.0) * FOG_DENSITY)));
  }
    
  void main() {

    float centerRadius = 0.6;
    float centerDistance = distance(v_pos.xz, vec2(0.0, 0.1));
    float centerWeight = 0.3 * (1.0 - smoothstep(0.0, centerRadius, centerDistance));

    float fogWeight = exponentialFogWeight(v_distance);

    vec4 spikeColorOffset = vec4(1.0) * pow(offset * 100.0, 3.0);
    float negOffset = abs(min(0.0, offset));
    vec4 colorWithoutFog = mix(DARK_BLUE, LIGHT_BLUE, (20.0 * offset) + 0.4) + spikeColorOffset + 1.2 * vec4(centerWeight) - vec4(vec3(200.0 * pow(negOffset, 1.1) * centerWeight), 0.0);
    gl_FragColor = mix(colorWithoutFog, FOG_COLOR, fogWeight);

  }

`

export { 
  waterVertex, waterFragment,
  unlitColorVertex, unlitColorFragment,
  unlitTextureVertex, unlitTextureFragment
}