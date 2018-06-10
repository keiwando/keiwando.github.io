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

varying vec2 vTextureCoord;
varying float vScaleFactor;

void main() {

	float directionRad = movementDirection * PI / 180.0;
	float altitudeRad = altitude * PI / 180.0;
	float azimuthRad = azimuth * PI / 180.0;

	float offsetX = -cos(directionRad) * cos(altitudeRad) * bristleLength;
	float offsetY = -sin(directionRad) * cos(altitudeRad) * bristleLength;
	highp vec4 offset = vec4(offsetX, offsetY, 0.0, 0.0);
	offset = vec4(0.0);

	float distortion = min(abs(position.x), abs(position.y)) * 5.5 * force + 1.0 + abs(max(-position.x, 0.0)) * 20.5 * sin(force);

	vTextureCoord = textureCoord;
	vScaleFactor = (1.0 + (0.7 * force + 0.28 * speed + 0.4 * min(60.0, (90.0 - altitude)) / 60.0) * (1.0 - stiffness));

	//vScaleFactor = 1.0;

	//gl_Position = projectionMat * modelViewMat * distortion * (position + offset);
	gl_Position = projectionMat * modelViewMat * (vec4(position.xy * vScaleFactor, 0.0, 1.0) + offset);
}