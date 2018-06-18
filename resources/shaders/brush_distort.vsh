precision highp float;

const float PI = 3.1415926;

attribute vec4 position;
attribute vec2 textureCoord;

// Advanced Pencil inputs
uniform float force;
uniform float altitude;
uniform float azimuth;
uniform float movementDirection;
uniform float speed;
uniform float stiffness;
uniform float bristleLength; 

uniform mat4 modelViewMat;
uniform mat4 projectionMat;

uniform float vertexSize;

varying vec2 vTextureCoord;
varying float vScaleFactor;

void main() {

	float directionRad = movementDirection * PI / 180.0;
	float altitudeRad = altitude * PI / 180.0;
	float azimuthRad = azimuth * PI / 180.0;

	float altWeight = min(60.0, (90.0 - altitude)) / 60.0;

	//vScaleFactor = (1.0 + (0.55 * force + 0.4 * speed + 0.4 * altWeight * (1.0 - stiffness)));
	vScaleFactor = (1.0 + (0.55 * force + 0.16 * speed + 0.2 * altWeight * (1.0 - stiffness)));
	//vScaleFactor = (1.0 + (0.55 * force + min(0.3, 0.16 * speed + 0.2 * altWeight) * (1.0 - stiffness)));

	vec2 pixelOffset = 0.1 * vec2(cos(azimuthRad), sin(azimuthRad)) * altWeight * vertexSize;
	pixelOffset += -0.18 * vec2(cos(directionRad), sin(directionRad)) * speed * vertexSize;

	vec2 texOffset = pixelOffset / vertexSize;
	//offset = vec4(cos(altitudeRad), sin(altitudeRad), 0.0, 0.0) * 0.3;
	//offset = vec4(-0.7, 0.0, 0.0, 0.0);

	//vTextureCoord = textureCoord;
	vTextureCoord = (textureCoord - vec2(0.5, 0.5)) * vScaleFactor + vec2(0.5, 0.5) + vec2(texOffset.x, -texOffset.y);

	//vScaleFactor = 1.0;

	//gl_Position = projectionMat * modelViewMat * distortion * (position + offset);
	gl_Position = projectionMat * modelViewMat * (vec4(position.xy * vScaleFactor, 0.0, 1.0) + vec4(pixelOffset, 0.0, 0.0));
}