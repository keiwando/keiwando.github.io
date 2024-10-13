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
uniform float displayMode;
uniform float frameNum;

varying vec2 vTextureCoord;
varying float vScaleFactor;

varying float vGlobalColorAmount;

// The global color amount of the brush
float colorAmount(float frameNum) {
    
    float minAmount = 0.01;
    
    return max(1.0 - 0.8 * (1.0 / (1.0 + exp(-(frameNum / 60.0 - 4.0)))) - 0.00001 * frameNum, minAmount);
}

void main() {

	float directionRad = movementDirection * PI / 180.0;
	float altitudeRad = altitude * PI / 180.0;
	float azimuthRad = azimuth * PI / 180.0;

	float altWeight = min(75.0, (90.0 - altitude)) / 75.0;

	float distortionWeight = (1.0 - stiffness);

	//vScaleFactor = (1.0 + (0.55 * force + 0.4 * speed + 0.4 * altWeight * (1.0 - stiffness)));
	//vScaleFactor = (1.0 + (0.55 * force + 0.16 * speed + 0.25 * altWeight));

	//vScaleFactor = (1.0 + (force * (0.45 + altWeight * 0.25) + altWeight * (0.2) + speed * 0.11) * distortionWeight);
	vScaleFactor = (1.0 + (force * (0.58 * pow(force, 0.6) + altWeight * 0.45 + 0.13 * speed) + altWeight * (0.2) + speed * 0.11) * distortionWeight);
	//vScaleFactor = (1.0 + (0.55 * force + min(0.3, 0.16 * speed + 0.2 * altWeight) * (1.0 - stiffness)));

	//vScaleFactor *= distortionWeight;

	vec2 azmVec = vec2(cos(azimuthRad), sin(azimuthRad));
	vec2 dirVec = vec2(cos(directionRad), sin(directionRad));

	vec2 pixelOffset = 0.1 * azmVec * altWeight * vertexSize;
	pixelOffset += -0.13 * dirVec * speed * vertexSize;
	pixelOffset += -0.1 * dirVec * speed * force * vertexSize;
	//pixelOffset += -0.2 * azmVec * altWeight * force * vertexSize;
	pixelOffset += -0.45 * azmVec * altWeight * pow(force, 2.0) * vertexSize;

	pixelOffset *= distortionWeight;

	// vScaleFactor = 1.0;
	// pixelOffset = vec2(0.0);

	vec2 texOffset = pixelOffset / vertexSize;
	//offset = vec4(cos(altitudeRad), sin(altitudeRad), 0.0, 0.0) * 0.3;
	//offset = vec4(-0.7, 0.0, 0.0, 0.0);

	//vTextureCoord = textureCoord;
	vTextureCoord = (textureCoord - vec2(0.5, 0.5)) * vScaleFactor + vec2(0.5, 0.5) + vec2(texOffset.x, -texOffset.y);

	//vScaleFactor = 1.0;

	//gl_Position = projectionMat * modelViewMat * distortion * (position + offset);
	gl_Position = projectionMat * modelViewMat * (vec4(position.xy * vScaleFactor, 0.0, 1.0) + vec4(pixelOffset, 0.0, 0.0));
	//gl_Position = projectionMat * modelViewMat * (vec4(vec2(position.x, position.y - 0.3) * vScaleFactor, 0.0, 1.0) + vec4(pixelOffset, 0.0, 0.0));

	vGlobalColorAmount = colorAmount(frameNum);
}