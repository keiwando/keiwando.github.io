precision highp float;

const float PI = 3.1415926;

uniform float force;
uniform float altitude;
uniform float azimuth;
uniform float movementDirection;
uniform float speed;
uniform float stiffness;
uniform float bristleLength; 

uniform float frameNum;
uniform float displayMode;

uniform sampler2D texture;

varying vec2 vTextureCoord;
varying float vScaleFactor;

varying float vGlobalColorAmount;

// --------------------    Pressure    ------------------------- // 

/*float pressureDistribution(vec2 pos, vec2 center, float force, vec2 azmDirection, float altWeight) {

	vec2 azmDirectionOrth = vec2(-azmDirection.y, azmDirection.x);

	vec2 dX = pos - center;
	float azmDotPr = dot(azmDirection, dX);
	//float orthDotPr = abs(dot(azmDirectionOrth, dX));

	//const float orthWeight = 0.4;
	const float azmWeight = 0.4;

	float altWeightAdj = sin(altWeight * PI * 1.1);

	//return 1.0 - smoothstep(0.1, 0.6 - 0.1 * force, length(dX) - azmWeight * azmDotPr * altWeightAdj);
	//return 1.0 - smoothstep(0.3 - 0.1 * altWeight, 1.0 - 0.1 * force, pow(length(dX), 0.4) - azmWeight * azmDotPr * altWeightAdj);
	return 1.0 - smoothstep(0.3 - 0.1 * altWeight, 1.0 - 0.03 * force + 0.05 * altWeight, pow(length(dX), 0.4) - azmWeight * azmDotPr * altWeightAdj);
	
}*/

float pressureDistribution(vec2 pos, vec2 center, float force, vec2 azmDirection, float altWeight) {
    
    vec2 dX = pos - center;
    float azmDotPr = dot(azmDirection, dX);
    
    const float azmWeight = 0.6;
    
    float altWeightAdj = sin(PI * ((0.8 + 0.4 * force) * altWeight));
    //altWeightAdj = 0.0;
    
    float minRadius = 0.3;
    float maxRadius = 1.0 - 0.03 * force + 0.05 * altWeight;
    float adjustedDistance = pow(length(dX), 0.4) - azmWeight * azmDotPr * altWeightAdj;

    //maxRadius = 1.0 - 0.1 * force + 0.05 * altWeight;

    //return 1.0 - smoothstep(0.3 - 0.1 * altWeight, 1.0 - 0.03 * force + 0.05 * altWeight, pow(length(dX), 0.4) - azmWeight * azmDotPr * altWeightAdj);
    return 1.0 - smoothstep(minRadius, maxRadius, adjustedDistance);
}

// --------------------    Distortion    ------------------------- // 


vec2 forceField(vec2 textureCoord, vec2 bristleBindingCenter, float force) {

	vec2 dir = bristleBindingCenter - textureCoord;
	float dist = length(dir);

	vec2 normDir = dist == 0.0 ? vec2(0) : normalize(dir);

	float magnitude = pow(dist, 1.4);

	return normDir * (magnitude * force);
}

/// Quadratically increasing value in the direction specified by relativeDirection with the values of 0 being 
/// on the line specified by center.
/// 
/// Example: Multiplying with a vec(1.0, 0.0), with relativeDirection = vec(0.0, 1.0) and center being in the 
/// middle results in the following vector field:
///
/// ---> ---> ---> --->
/// --> --> --> --> -->
/// -> -> -> -> -> -> -
/// . . . . . . . . . .
/// -> -> -> -> -> -> -
/// --> --> --> --> -->
/// ---> ---> ---> --->
///
float parallelFlow(vec2 x, vec2 center, vec2 relativeDirection, float multiply) {

	float dist = abs(dot(center - x, relativeDirection) / length(relativeDirection));
	return pow(dist, 1.8) * multiply;
}

/// Linearly increasing values that simulate compression on one side and expansion on the other side of 
/// a reference line specified by a point (center) and a vector (relativeDirection) pointing in the 
/// direction of compression
///
/// The magnitude of compression 
///
/// Example: Multiplying with a vec(-1.0, 0.0), with relativeDirection = vec(1.0, 0.0) and center being in
/// the middle results in the following vector field:
///
/// <--- <-- <- . <- <----
/// <--- <-- <- . <- <----
/// <--- <-- <- . <- <----
/// <--- <-- <- . <- <----
/// <--- <-- <- . <- <----
/// <--- <-- <- . <- <----
/// <--- <-- <- . <- <----
///
/// - expansion -  compr -
///
float compressionMagnitude(vec2 x, vec2 center, vec2 relativeDirection, float multiply) {
    
    vec2 dX = center - x;
    
	float dotPr = dot(dX, relativeDirection);
	float dist = abs(dotPr);

	return 0.6 * smoothstep(0.0, 0.9, dist * multiply);
}

///
/// . . . . -> ---> ---> >
/// . . . . -> ---> ---> >
/// . . . . -> ---> ---> >
/// . . . . -> ---> ---> >
/// . . . . -> ---> ---> >
/// . . . . -> ---> ---> >
///
float sideStretchingMagnitude(vec2 x, vec2 center, vec2 relativeDirection, float multiply) {

	vec2 dX = x - center;

	float dotPr = dot(dX, relativeDirection);
	
	float dist = smoothstep(0.2, 0.9, dotPr);

	return min(0.7, dist * multiply * 0.2);
}


// ----------------------------- Paint Distribution -------------------------------- //
float rand(vec2 co){
	
    return fract(sin(dot(co.xy , vec2(12.9898, 78.233))) * 43758.5453);
    //return fract(sin(dot(co.xy , vec2(12.9898, 78.233))) * 314192.567);
    //return fract(dot(co.xy , vec2(12.9898,78.233)));
    //return fract(co.x * co.y * 0.01241234);
    
    //return fract(dot(co.xy, vec2(35.5 * co.y, 12.4235)));
}

float valueAtCenter(vec2 center, float frameNum) {
    
    float randFromCenter = rand(center);
    
    float frameNumFloorOffset = randFromCenter * 500.0;
    float tOffset = randFromCenter * 500.0;
    
    float frameNumFloor = floor(frameNum * 0.005 * randFromCenter) + frameNumFloorOffset;
    
    float periodDuration = 1000.0 * randFromCenter + 500.0;
    
    float t = (frameNum / periodDuration) * 2.0 * PI + tOffset;
    
    float ampl = fract(randFromCenter * 1.2134 + frameNumFloor * 0.1445);
    
    float noiseVal = ampl * 0.5 * (sin(t) + 1.0);
    
    return noiseVal;
}

highp vec2 centerForCoord(vec2 coord, float res) {

    return floor(coord * res) + 0.5;
}

float distanceWeight(vec2 coord, vec2 center, float res) {

	float radius = 3.0;

	return (radius - min(radius, distance(coord * res, center) * 4.0));
}


float paintDistribution(vec2 coord, float frameNum, float res) {

	vec2 center = centerForCoord(coord, res);

	return valueAtCenter(center, frameNum) * distanceWeight(coord, center, res);
}

float paintDistribution(vec2 coord, float frameNum) {

	float randFromFrameNum = rand(vec2(floor(frameNum * 0.005) * 0.002));

	//float res = 32.0;
	float res = 6.0 + 20.0 * randFromFrameNum;

	float noise1 = paintDistribution(coord + 0.5, frameNum, res);
    float noise2 = paintDistribution(coord + 0.5, frameNum, res * 2.8);
    //float noise3 = paintDistribution(coord + 0.5, frameNum, res * 4.0);
    
    //return noise1;
    return 0.5 * (noise1 + noise2);
    //return 0.333 * (noise1 + noise2 + noise3);
}

void main() {

	highp vec2 textureCoord = vTextureCoord;

	vec2 center = vec2(0.5, 0.5);

	float stiffnessWeight = (1.0 - stiffness) * bristleLength; 

	float forceDistWeight = 0.35;
	float linearFlowWeight = 0.3;
	float compressionFlowWeight = 0.3;
	float sideStrechingWeight = 1.1;

	float upMovAngle = (movementDirection + 180.0) * PI / 180.0;
	float upAzmAngle = (azimuth + 180.0) * PI / 180.0;

	float rightMovAngle = upMovAngle + PI / 2.0;
	float downMovAngle = rightMovAngle + PI / 2.0;

	float rightAzmAngle = upAzmAngle + PI / 2.0;
	float downAzmAngle = rightAzmAngle + PI / 2.0;

	vec2 rightMov = vec2(cos(-rightMovAngle), sin(-rightMovAngle));
	vec2 downMov = vec2(rightMov.y, -rightMov.x);

	vec2 rightAzm = vec2(cos(-rightAzmAngle), sin(-rightAzmAngle));
	vec2 downAzm = vec2(rightAzm.y, -rightAzm.x);

	float altWeight = max(0.0, min(75.0, (90.0 - altitude)) / 75.0); // ∈ [0, 1]

	// increase the force distortion weight if azimuth and movement are pointing in
	// the opposite direction
	//float oppWeightIncrease = 0.3 * speed * max(0.0, 0.5 - abs(abs(upMovAngle - upAzmAngle) - PI)) * abs(dot(rightAzm, textureCoord - center)) * altWeight * 0.5;
	//forceDistWeight += oppWeightIncrease;

	float azm = -azimuth * PI / 180.0;

	vec2 strechingCenter = center - (0.15 * altWeight) * vec2(cos(azm), sin(azm));
	//vec2 bristleBindingCenter = center + 0.4 * vec2(cos(azm), sin(azm)) * altWeight; 
	vec2 bristleBindingCenter = center + (0.55 * altWeight) * vec2(cos(azm), sin(azm)); 
	//vec2 bristleBindingCenter = center + 0.3 * vec2(cos(azm), sin(azm)) * altWeight; 
	//vec2 bristleBindingCenter = center;

	// Distortion caused by the force
	vec2 forceDistortion = forceField(textureCoord, bristleBindingCenter, force) * (forceDistWeight * stiffnessWeight);

	textureCoord += forceDistortion;

    // Distortion caused by the movement direction + speed
    //vec2 linearMovDistortion = quadraticParallelFlow(textureCoord, center, rightMov, max(0.0, speed)) * linearFlowWeight * stiffnessWeight * downMov * 2.0;
    vec2 compressMovDistortion = compressionMagnitude(textureCoord, center, downMov, smoothstep(0.0, 1.0, speed)) * compressionFlowWeight * stiffnessWeight * downMov;
    
    // Distortion caused by the azimuth and altitude angles
    //vec2 linearAngleDistortion = quadraticParallelFlow(textureCoord, center, rightAzm, altWeight) * linearFlowWeight * stiffnessWeight * downAzm;
    vec2 sideStretchAngleDistortion = sideStretchingMagnitude(textureCoord, strechingCenter, downAzm, altWeight) * sideStrechingWeight * stiffnessWeight * -downAzm;

    vec2 offset = compressMovDistortion + sideStretchAngleDistortion;
    //vec2 offset = forceDistortion + compressMovDistortion + sideStretchAngleDistortion;

	textureCoord += offset;

	// ------------------------------------- Draw results ------------------------------------------- //

    bool showShape = int(displayMode) == 0;
	bool showNoise = int(displayMode) == 1;
	bool showPressure = int(displayMode) == 2;
	bool showBristleColor = int(displayMode) == 3;
	bool showFullResult = int(displayMode) == 4;
	
	bool markOutside = false;
	bool markBackground = false;

	if (markOutside) {
		if (textureCoord.x >= 1.0 || textureCoord.x <= 0.0 || textureCoord.y >= 1.0 || textureCoord.y <= 0.0) {
			//gl_FragColor.a = 0.0;
			gl_FragColor = vec4(1.0, 0.0, 0.0, 0.5);
		}
	} else {
		if (textureCoord.x > 1.0 || textureCoord.x < 0.0 || textureCoord.y > 1.0 || textureCoord.y < 0.0) {
			gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
		}
	}

	vec4 texColor = texture2D(texture, textureCoord);
	gl_FragColor = vec4(1.0, 1.0, 1.0, texColor.a);

	if (markBackground && texColor.a < 1.0) {
		gl_FragColor = mix(gl_FragColor, vec4(0.0, 0.6, 0.8, 1.0), 1.0 - texColor.a);
	}

	if (showNoise) {

		gl_FragColor = vec4(vec3(paintDistribution(vTextureCoord, frameNum)), 1.0);
	}

	//vec2 forceCenter = center + vec2(cos(azm), sin(azm)) * 0.1 * altWeight;
	vec2 forceCenter = center;

	if (showPressure) {

		float pressureDistrib = pressureDistribution(textureCoord, forceCenter, force, -downAzm, altWeight);
		float pressure = pressureDistrib * force;

		gl_FragColor = vec4(1.0, 0.0, 0.0, pressureDistrib);	
	}

	float bristlePaintDistribution = max(0.0, 1.0 - paintDistribution(vTextureCoord, frameNum)); // PERFORMANCE CRITICAL!
	
    float pressure = pressureDistribution(textureCoord, forceCenter, force, -downAzm, altWeight) * force;	
    
    float colAmountWeight = 0.6;
    float pressureWeight = 0.5;
    float speedWeight = 0.6;
    

    float paintThreshold = 3.5 * vGlobalColorAmount;

    paintThreshold *= pressure;
    paintThreshold *= (1.0 - speedWeight * speed);
    
    //paintThreshold += grainWeight * (1.0 - grainInfluence);

    paintThreshold = min(1.0, max(0.0, paintThreshold));
    
    float paintAmount = (bristlePaintDistribution <= paintThreshold) ? paintThreshold : 0.0;
    //float paintAmount = max(paintThreshold - bristlePaintDistribution, 0.0);
    //float paintAmount = (bristleColorAmount <= paintThreshold) ? bristleColorAmount : 0.0;
    //float paintAmount = (bristlePaintDistribution <= paintThreshold) ? mix(paintThreshold, bristlePaintDistribution, pressure) : 0.0;

	if (showBristleColor) {
		gl_FragColor = vec4(vec3(1.0), paintAmount);
	}

	if (showFullResult) {

	    gl_FragColor = vec4(vec3(1.0), paintAmount * texColor.a);
	}
}










