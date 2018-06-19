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

// --------------------    Color Transfer    ------------------------- //

float rand(vec2 co){
	
    return fract(sin(dot(co.xy , vec2(12.9898, 78.233))) * 43758.5453);
    //return fract(sin(dot(co.xy , vec2(12.9898, 78.233))) * 314192.567);
    //return fract(dot(co.xy , vec2(12.9898,78.233)));
    //return fract(co.x * co.y * 0.01241234);
    
    //return fract(dot(co.xy, vec2(35.5 * co.y, 12.4235)));
}

float colorAmount(float frameNum) {

    float minAmount = 0.01;
    
    return max(1.0 - 0.8 * (1.0 / (1.0 + exp(-(frameNum / 100.0 - 4.0)))) - 0.00001 * frameNum, minAmount);
}

float valueAtCenter(vec2 center, float frameNum) {

	float randFromCenter = rand(center);

	frameNum = mod(frameNum, 10000.0 + randFromCenter * 100000.0);

    float frameNumFloor = floor(frameNum / (50.0 + 50.0 * randFromCenter)) + randFromCenter * 20000.0;
    
    float periodDuration = 10000.0 * rand(center + frameNumFloor / (center * 1000.0)) + 500.0;
    
    float t = (frameNum / periodDuration) * 2.0 * PI + randFromCenter * 50000.0;
    
    float ampl = rand(center + floor(t / (2.0 * PI)));

    float offset = 0.01 + colorAmount(frameNum) * 0.1;
    float noiseVal = ampl * 0.5 * (sin(t) + 1.0);// + offset;

    return noiseVal;
}

float valueAtCenterOpt(vec2 center, float frameNum) {
    
    float randFromCenter = rand(center);
    
    float frameNumFloorOffset = randFromCenter * 500.0 * stiffness;
    float tOffset = randFromCenter * 500.0;
    
    //frameNum = mod(frameNum, 10000.0 + randFromCenter * 100000.0);
    
    //float frameNumFloor = floor(frameNum / (50.0 + 50.0 * randFromCenter));// + randFromCenter * 200.0;
    float frameNumFloor = floor(frameNum * 0.005 * randFromCenter) + frameNumFloorOffset;
    
    //float periodDuration = 1000.0 * rand(center + frameNumFloor / (center * 1000.0)) + 500.0;
    float periodDuration = 1000.0 * randFromCenter + 500.0;
    
    float t = (frameNum / periodDuration) * 2.0 * PI + tOffset;
    
    //float ampl = rand(center + floor(t / (2.0 * PI)));
    //float ampl = fract(randFromCenter * 1.234 + frameNumFloor * 0.1445);// rand(center + floor(t / (2.0 * PI)));
    float ampl = fract(randFromCenter * 1.2134 + frameNumFloor * 0.1445);
    
    //float offset = 0.01 + colorAmount(frameNum) * 0.1;
    //float offset = 0.01 + vGlobalColorAmount * 0.1;
    
    //float noiseVal = ampl * sin(t);// + offset;
    float noiseVal = ampl * 0.5 * (sin(t) + 1.0);
    //float noiseVal = ampl;
    
    return min(1.0, max(0.0, noiseVal));
}

highp vec2 centerForCoord(vec2 coord, float res) {

    //vec2 coordFloor = floor(coord * res);// + coordShift;// / res;
    return floor(coord * res) + 0.5;// - coordShift;

    //return center;
}

float distanceWeight(vec2 coord, vec2 center, float res) {

	float radius = 3.0;

	return (radius - min(radius, distance(coord * res, center) * 4.0));
}


float colorAmountNoise(vec2 coord, float frameNum, float res) {

	vec2 center = centerForCoord(coord, res);

	float noiseVal = valueAtCenterOpt(center, frameNum) * distanceWeight(coord, center, res);

	//float noiseVal = avgBetweenCenters(center, coord, frameNum, res);
    
    //return noiseVal * pow((1.0 - centerDist), 1.5);
    return noiseVal;
}

float colorAmountNoise(vec2 coord, float frameNum) {

	float randFromFrameNum = rand(vec2(floor(frameNum * 0.005) * 0.002));

	//float res = 32.0;
	float res = 6.0 + 20.0 * randFromFrameNum;

	float noise1 = colorAmountNoise(coord + 0.5, frameNum, res);
	float noise2 = colorAmountNoise(coord + 0.5, frameNum, res * 2.3);

	return 0.5 * (noise1 + noise2);
	//return noise1;
	//return noise2;
}

// --------------------    Pressure    ------------------------- // 

/*float fP(vec2 pos, vec2 center) {

	return 1.0 - smoothstep(0.1, 0.6, distance(pos, center));
	//return 1.0 - smoothstep(0.2, 0.7, distance(pos, center));
	//return 1.0 - smoothstep(0.0, 0.4, distance(pos, center));
}*/

float fP(vec2 pos, vec2 center, float force, vec2 azmDirection, float altWeight) {

	vec2 azmDirectionOrth = vec2(-azmDirection.y, azmDirection.x);

	vec2 dX = pos - center;
	float azmDotPr = dot(azmDirection, dX);
	float orthDotPr = abs(dot(azmDirectionOrth, dX));

	const float orthWeight = 0.4;
	const float azmWeight = 0.4;

	float altWeightAdj = sin(altWeight * PI);

	return 1.0 - smoothstep(0.1, 0.6 - 0.1 * force, length(dX) - azmWeight * azmDotPr * altWeightAdj);
	//return smoothstep(0.1, 0.6 + 0.1 * force, azmDotPr * orthDotPr);

	//return 1.0 - smoothstep(0.1, 0.6 - 0.1 * force, distance(pos, center));
	//return 1.0 - smoothstep(0.2, 0.7, distance(pos, center));
	//return 1.0 - smoothstep(0.0, 0.4, distance(pos, center));
}

// --------------------    Distortion    ------------------------- // 


highp float parabola(vec2 x, vec2 center, float multiply) {

	//return pow(min(1.0, length(center - x)), 1.4) * multiply;
	//return length(center - x) * multiply;
	return smoothstep(0.0, 1.0, length(center - x)) * multiply;
	//return smoothstep(0.0, 1.0, length(center - x)) * multiply;
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
float quadraticParallelFlow(vec2 x, vec2 center, vec2 relativeDirection, float multiply) {

	float dist = abs(dot(center - x, relativeDirection) / length(relativeDirection));
	return pow(dist, 1.8) * multiply;
	//return smoothstep(0.0, 1.0, dist) * multiply;
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
float compressionFlow(vec2 x, vec2 center, vec2 relativeDirection, float multiply) {
    
    vec2 dX = center - x;
    
	float dotPr = dot(dX, relativeDirection);
	float dist = abs(dotPr);
    
    //dist = smoothstep(0.0, 1.0, dist);
    dist = smoothstep(0.0, 0.9, dist);
    
    return min(0.6, dist * multiply * 0.7);
}

///
/// . . . . -> ---> ---> >
/// . . . . -> ---> ---> >
/// . . . . -> ---> ---> >
/// . . . . -> ---> ---> >
/// . . . . -> ---> ---> >
/// . . . . -> ---> ---> >
///
float sideStretching(vec2 x, vec2 center, vec2 relativeDirection, float multiply) {

	vec2 dX = x - center;

	float dotPr = dot(dX, relativeDirection);
	
	//float dist = smoothstep(0.0, 1.0, dotPr);
	float dist = smoothstep(0.2, 0.9, dotPr);

	return min(0.7, dist * multiply * 0.2);
}

float distanceInDirection(highp vec2 x, highp vec2 center, vec2 relativeDirection) {

	float dotPr = dot(center - x, relativeDirection);

	if (dotPr <= 0.0) {
		return 0.0;
	}

	float dist = smoothstep(0.0, 1.0, dotPr / length(relativeDirection));

	return dist;
}

void main() {

	highp vec2 textureCoord = vTextureCoord;
	//vec2 textureCoord = (vTextureCoord - vec2(0.5, 0.5)) * vScaleFactor + vec2(0.5, 0.5);

	vec2 center = vec2(0.5, 0.5);

	float stiffnessWeight = (1.0 - stiffness) * bristleLength; 

	float forceDistWeight = 0.3; // 0.3;
	float linearFlowWeight = 0.3; // 0.2;
	float compressionFlowWeight = 0.3;
	float sideStrechingWeight = 1.1;

	float upMovAngle = (movementDirection + 180.0) * PI / 180.0;
	float upAzmAngle = (azimuth + 180.0) * PI / 180.0;

	float rightMovAngle = upMovAngle + PI / 2.0;
	float downMovAngle = rightMovAngle + PI / 2.0;

	float rightAzmAngle = upAzmAngle + PI / 2.0;
	float downAzmAngle = rightAzmAngle + PI / 2.0;

	vec2 rightMov = vec2(cos(-rightMovAngle), sin(-rightMovAngle));
	//vec2 downMov = vec2(cos(-downMovAngle), sin(-downMovAngle)); 
	vec2 downMov = vec2(rightMov.y, -rightMov.x);

	vec2 rightAzm = vec2(cos(-rightAzmAngle), sin(-rightAzmAngle));
	//vec2 downAzm = vec2(cos(-downAzmAngle), sin(-downAzmAngle));
	vec2 downAzm = vec2(rightAzm.y, -rightAzm.x);

	//float altWeight = min(60.0, (90.0 - altitude)) / 22.5; // ∈ [0, 2]
	float altWeight = max(0.0, min(60.0, (90.0 - altitude)) / 60.0); // ∈ [0, 2]

	// increase the force distortion weight if azimuth and movement are pointing in
	// the opposite direction
	float oppWeightIncrease = 0.3 * speed * max(0.0, 0.5 - abs(abs(upMovAngle - upAzmAngle) - PI)) * abs(dot(rightAzm, textureCoord - center)) * altWeight * 0.5;
	forceDistWeight += oppWeightIncrease;

	float azm = -azimuth * PI / 180.0;

	vec2 zeroRef = vec2(0.5, 0.5) - 0.8 * vec2(cos(azm), sin(azm)) * altWeight;
	//center += altWeight * 0.25 * vec2(cos(azm), sin(azm));
	vec2 strechingCenter = center - 0.15 * vec2(cos(azm), sin(azm)) * altWeight;

	// Distortion caused by the force
	vec2 forceDistortion = normalize(center - textureCoord) * parabola(textureCoord, center, force) * forceDistWeight * stiffnessWeight;

	textureCoord += forceDistortion;

	//vec2 forceDistortion = normalize(center - textureCoord) * parabola(textureCoord, center, force) * forceDistWeight;
	//vec2 forceDistortion = normalize(center - textureCoord) * force * forceDistWeight * stiffnessWeight;
    // Distortion caused by the movement direction + speed
    vec2 linearMovDistortion = quadraticParallelFlow(textureCoord, center, rightMov, max(0.0, speed)) * linearFlowWeight * stiffnessWeight * downMov * 2.0;
    vec2 compressMovDistortion = compressionFlow(textureCoord, center, downMov, max(0.0, smoothstep(0.0, 1.0, speed))) * compressionFlowWeight * stiffnessWeight * downMov;
    // Distortion caused by the azimuth and altitude angles
    
    vec2 linearAngleDistortion = quadraticParallelFlow(textureCoord, center, rightAzm, altWeight) * linearFlowWeight * stiffnessWeight * downAzm;
    vec2 sideStretchAngleDistortion = sideStretching(textureCoord, strechingCenter, downAzm, altWeight) * sideStrechingWeight * stiffnessWeight * -downAzm;
    //highp vec2 linearAngleDistortion = compressionFlowInv(textureCoord, center, downAzm, max(0.0, altWeight)) * linearFlowWeight * (1.0 - stiffness) * downAzm;
    //vec2 compressAngleDistortion = compressionFlow(textureCoord, center, downAzm, max(0.0, altWeight)) * compressionFlowWeight * stiffnessWeight * downAzm;
    vec2 compressAngleDistortion = compressionFlow(textureCoord, center, downAzm, altWeight) * compressionFlowWeight * stiffnessWeight * downAzm;
    
    
    //linearAngleDistortion *= min(1.0, max(0.0, distanceInDirection(vTextureCoord, zeroRef, -downAzm))) * 5.0;
    //linearAngleDistortion *= distanceInDirection(vTextureCoord, zeroRef, -downAzm) * 5.0;
    //linearAngleDistortion *= smoothstep(0.0, 1.0, distanceInDirection(textureCoord, zeroRef, -downAzm)) * 5.0;

    //vec2 offset = forceDistortion + linearMovDistortion + compressMovDistortion + linearAngleDistortion + compressAngleDistortion;
    //vec2 offset = linearMovDistortion + compressMovDistortion + linearAngleDistortion;
    //vec2 offset = compressMovDistortion + linearAngleDistortion;
    vec2 offset = compressMovDistortion + sideStretchAngleDistortion;
    //vec2 offset = linearMovDistortion + compressMovDistortion + compressAngleDistortion;

    //vec2 offset = forceDistortion + linearMovDistortion + linearAngleDistortion + compressAngleDistortion;
    //vec2 offset = forceDistortion + linearMovDistortion + compressMovDistortion + compressAngleDistortion;


	textureCoord += offset;

	vec4 texColor = texture2D(texture, textureCoord);

	gl_FragColor = vec4(1.0, 1.0, 1.0, texColor.a);


	float bristleColorAmount = max(0.0, 1.0 - colorAmountNoise(textureCoord, frameNum)); // PERFORMANCE CRITICAL!
	
	float dryThreshold = 1.0;
            
    //float force = fP(textureCoord, center) * vForce;
    
    float forceWeight = 0.5;
    float speedWeight = 0.6;
    
    //dryThreshold = min(1.0, max(0.0, colAmountWeight * colAmount + forceWeight * force + drynessWeight * abs(wetness) + speedWeight * vSpeed + grainWeight * (1.0 - grainInfluence * grainInfluence)));
    
    //dryThreshold = min(1.0, max(0.05, colAmountWeight * colAmount + forceWeight * force + drynessWeight * abs(wetness) + speedWeight * vSpeed + grainWeight * (1.0 - grainInfluence)));
    dryThreshold = min(1.0, max(0.0, forceWeight * force));
    //dryThreshold = min(1.0, max(0.0, forceWeight * force));
    
    dryThreshold *= (1.0 - speedWeight * speed);
    
    
    //float dryVal = (bristleColorAmount >= dryThreshold) ? bristleColorAmount : 0.0;
    float dryVal = (bristleColorAmount <= dryThreshold) ? bristleColorAmount : 0.0;
    //float dryVal = (bristleColorAmount <= dryThreshold) ? 1.0 - bristleColorAmount - dryThreshold : 0.0;
    //float dryVal = (bristleColorAmount <= dryThreshold) ? 1.0 - bristleColorAmount / (dryThreshold + 0.01) : 0.0;

    bool showShape = int(displayMode) == 0;
	bool showNoise = int(displayMode) == 1;
	bool showPressure = int(displayMode) == 2;
	bool showBristleColor = int(displayMode) == 3;
	bool showFullResult = int(displayMode) == 4;
	
	bool markOutside = false;

	if (showNoise) {

		
		gl_FragColor = vec4(vec3(colorAmountNoise(textureCoord, frameNum)), 1.0);
		
		//gl_FragColor = vec4(vec3(colorAmountNoise(vTextureCoord, frameNum)), 1.0);
		//vec4(vec3(colorAmountNoise(textureCoord, frameNum)), 1.0);
		
		//gl_FragColor.a *= colorAmountNoise(textureCoord, frameNum);
	}

	if (showBristleColor) {
		gl_FragColor = vec4(vec3(1.0), dryVal);
	}

	/*if (textureCoord.x > 1.0 || textureCoord.x < 0.0 || textureCoord.y > 1.0 || textureCoord.y < 0.0) {
		gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
	}*/
	if (markOutside) {
		if (textureCoord.x >= 1.0 || textureCoord.x <= 0.0 || textureCoord.y >= 1.0 || textureCoord.y <= 0.0) {
			//gl_FragColor.a = 0.0;
			gl_FragColor = vec4(1.0, 0.0, 0.0, 0.5);
		}
	}

	if (showPressure) {

		vec2 forceCenter = center - vec2(cos(azm), sin(azm)) * 0.05 * altWeight;
		//gl_FragColor.a *= fP(textureCoord, forceCenter);
		gl_FragColor = vec4(1.0, 0.0, 0.0, fP(textureCoord, forceCenter, force, -downAzm, altWeight));	
	}

	if (showFullResult) {

		vec2 forceCenter = center + vec2(cos(azm), sin(azm)) * 0.05 * altWeight;
		float pressure = fP(textureCoord, forceCenter, force, -downAzm, altWeight);	

		dryThreshold = min(1.0, max(0.0, forceWeight * pressure));
    
	    dryThreshold *= (1.0 - speedWeight * speed);
	    
	    float dryVal = (bristleColorAmount <= dryThreshold) ? bristleColorAmount : 0.0;

	    if (!showBristleColor) {
	    	//dryVal = (bristleColorAmount <= dryThreshold) ? 1.0 : 0.0;
	    	dryVal = texColor.a > dryThreshold ? texColor.a * pressure : 0.0;
	    }

	    gl_FragColor = vec4(vec3(1.0), dryVal);
	}
}










