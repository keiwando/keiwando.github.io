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

uniform sampler2D texture;

varying vec2 vTextureCoord;
varying float vScaleFactor;

// --------------------    Color Transfer    ------------------------- //

float rand(vec2 co){
	
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float colorAmount(float frameNum) {

    float minAmount = 0.01;
    
    return max(1.0 - 0.8 * (1.0 / (1.0 + exp(-(frameNum / 100.0 - 4.0)))) - 0.00001 * frameNum, minAmount);
}

float baseOffset(vec2 coord, float frameNum) {

	float res = 128.0;
	//float res = 256.0 * rand(floor(coord * 20.0)) + 4.0;

	return 0.5 * (1.0 + sin(coord.x * res) * sin(coord.y * res) * sin(frameNum * 2.0 * PI / 300.0 + res));
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

highp vec2 centerForCoord(vec2 coord, float res) {

    vec2 coordFloor = floor(coord * res);// + coordShift;// / res;
    vec2 center = (floor(coord * res) + 0.5);// - coordShift;

    return center;
}

float angleBetween(vec2 origin, vec2 point) {

	vec2 norm = normalize(point - origin);

	return sign(norm.y) * acos(dot(norm, vec2(1.0, 0.0)));

	//return atan2((point.y - origin.y) / (point.x - origin.x));
	//return acos(dot(origin, point));
}

vec2 nextCenter(vec2 center, float angle) {

	float cA = cos(angle);
	float sA = sin(angle);

	float x = cA > 0.0 ? floor(cA) : ceil(cA);
	float y = sA > 0.0 ? floor(sA) : ceil(sA);

	return center + vec2(x, y);
}

float distanceWeight(vec2 coord, vec2 center, float res) {

	float radius = 3.0;

	return (radius - min(radius, distance(coord * res, center) * 4.0));
}

float avgBetweenCenters(vec2 center, vec2 coord, float frameNum, float res) {

	float angle = angleBetween(center, coord * res);

	float dAngle = PI / 2.0;

	// Determine 3 surrounding center values and average them
	vec2 nextCenter1 = nextCenter(center, angle);
	vec2 nextCenter2 = nextCenter(center, angle + dAngle);
	vec2 nextCenter3 = nextCenter(center, angle - dAngle);

	float noise0 = valueAtCenter(center, 	  frameNum);
	float noise1 = valueAtCenter(nextCenter1, frameNum);
	float noise2 = valueAtCenter(nextCenter2, frameNum);
	float noise3 = valueAtCenter(nextCenter3, frameNum);

	float dist0 = distanceWeight(coord, center, 	 res);
	float dist1 = distanceWeight(coord, nextCenter1, res);
	float dist2 = distanceWeight(coord, nextCenter2, res);
	float dist3 = distanceWeight(coord, nextCenter3, res);

	// DEBUG
	if (nextCenter1.x < center.x && nextCenter1.y < center.y) {
		
		gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
		return 0.0;
	}
	// if (abs(angle) > PI / 1.1) {
	// //if (angle < 0.0) {
		
	// 	gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	// 	return 0.0;
	// }

	return (dist0 * noise0 + dist1 * noise1 + dist2 * noise2 + dist3 * noise3) / (dist0 + dist1 + dist2 + dist3);
	//return (dist0 * noise0 + dist1 * noise1 + dist2 * noise2 + dist3 * noise3);
	//return (dist0 * noise0 + dist1 * noise1);
	//return dist0 * noise0;
}

float colorAmountNoise(vec2 coord, float frameNum, float res) {

	vec2 center = centerForCoord(coord, res);

	float noiseVal = valueAtCenter(center, frameNum) * distanceWeight(coord, center, res);

	//float noiseVal = avgBetweenCenters(center, coord, frameNum, res);
    
    //return noiseVal * pow((1.0 - centerDist), 1.5);
    return noiseVal;
}

float colorAmountNoise(vec2 coord, float frameNum) {

	float res = 32.0;
	float noise1 = colorAmountNoise(coord + 0.5, frameNum, res);
	float noise2 = colorAmountNoise(coord + 0.5, frameNum, res * 2.3);

	return 0.5 * (noise1 + noise2);
	//return noise1;
	//return noise2;
}

// --------------------    Pressure    ------------------------- // 

float fP(vec2 pos, vec2 center) {

	//return 1.0 - smoothstep(0.2, 0.7, distance(pos, center));
	return 1.0 - smoothstep(0.1, 0.4, distance(pos, center));
}

// --------------------    Distortion    ------------------------- // 


highp float parabola(vec2 x, vec2 center, float multiply) {

	//return pow(min(1.0, length(center - x)), 1.4) * multiply;
	//return length(center - x) * multiply;

	return smoothstep(0.0, 1.0, length(center - x)) * multiply;
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
	//return pow(dist, 2.0) * multiply;
	return smoothstep(0.0, 1.0, dist) * multiply;
}

/*float quadraticParallelFlow2(vec2 x, vec2 center, vec2 relativeDirection, float multiply) {

	float dist = length(dot(center - x, relativeDirection) / length(relativeDirection));
	//return pow(dist, 2.0) * multiply;
	return dist * multiply;
}*/

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

	float dist = length(dot(dX, relativeDirection) / length(relativeDirection));

	dist = smoothstep(0.0, 1.0, dist) * 1.0;

	float angle = asin(dot(dX, relativeDirection)) / (length(dX) * length(relativeDirection));

	float maxMult = 1.0 + 0.2 * speed;

	if (angle < 0.0) {
		// compression
		//return dist * multiply * 5.0;
		return min(0.2, dist * multiply * 5.0);
		//return dist * min(maxMult, multiply * 5.0);
	}
	//return dist * multiply * 2.0;
	return min(0.2, dist * multiply * 2.0);
	//return dist * min(maxMult, multiply * 2.0);
}

/*float compressionFlowInv(vec2 x, vec2 center, vec2 relativeDirection, float multiply) {

	highp vec2 dX = center - x;

	float dist = length(dot(dX, relativeDirection) / length(relativeDirection));

	dist = smoothstep(0.0, 1.0, dist) * 1.0;

	float angle = asin(dot(dX, relativeDirection)) / (length(dX) * length(relativeDirection));

	if (angle > 0.0) {
		// compression
		return -pow(dist, 1.0) * multiply * 5.0 * quadraticParallelFlow2(x, center, vec2(-relativeDirection.y, relativeDirection.x), multiply);
	}
	return pow(dist, 1.0) * multiply * 2.0 * quadraticParallelFlow2(x, center, vec2(-relativeDirection.y, relativeDirection.x), multiply);
}*/

float distanceInDirection(highp vec2 x, highp vec2 center, vec2 relativeDirection) {

	float dotPr = dot(center - x, relativeDirection);

	if (dotPr <= 0.0) {
		return 0.0;
	}

	float dist = smoothstep(0.0, 1.0, dotPr / length(relativeDirection));

	return dist;
}

void markCenter(vec2 texturePos, vec3 center, vec3 color) {

	if (center.z == 0.0) return;

	if (length(texturePos - center.xy) < 0.01) {
		gl_FragColor = vec4(color, 1.0);
	}
}

void main() {

	//highp vec2 textureCoord = vTextureCoord;
	vec2 textureCoord = (vTextureCoord - vec2(0.5, 0.5)) * vScaleFactor + vec2(0.5, 0.5);

	vec2 center = vec2(0.5, 0.5);

	float stiffnessWeight = (1.0 - stiffness) * bristleLength; 

	float forceDistWeight = 0.3;
	float linearFlowWeight = 0.1;
	float compressionFlowWeight = 0.04;

	float upMovAngle = (movementDirection + 180.0) * PI / 180.0;
	float upAzmAngle = (azimuth + 180.0) * PI / 180.0;

	float rightMovAngle = upMovAngle + PI / 2.0;
	float downMovAngle = rightMovAngle + PI / 2.0;

	float rightAzmAngle = upAzmAngle + PI / 2.0;
	float downAzmAngle = rightAzmAngle + PI / 2.0;

	vec2 rightMov = vec2(cos(-rightMovAngle), sin(-rightMovAngle));
	vec2 downMov = vec2(cos(-downMovAngle), sin(-downMovAngle)); 

	vec2 rightAzm = vec2(cos(-rightAzmAngle), sin(-rightAzmAngle));
	vec2 downAzm = vec2(cos(-downAzmAngle), sin(-downAzmAngle));

	float altWeight = min(60.0, (90.0 - altitude)) / 22.5; // ∈ [0, 2]

	// increase the force distortion weight if azimuth and movement are pointing in
	// the opposite direction
	float oppWeightIncrease = 0.2 * speed * max(0.0, 0.5 - abs(abs(upMovAngle - upAzmAngle) - PI)) * abs(dot(rightAzm, textureCoord - center));
	forceDistWeight += oppWeightIncrease;

	float azm = -azimuth * PI / 180.0;
	//center += altWeight * 0.25 * vec2(cos(azm), sin(azm));

	// Distortion caused by the force
	vec2 forceDistortion = normalize(center.xy - textureCoord) * parabola(textureCoord, center, force) * forceDistWeight * stiffnessWeight;
    // Distortion caused by the movement direction + speed
    vec2 linearMovDistortion = quadraticParallelFlow(textureCoord, center, rightMov, max(0.0, speed)) * linearFlowWeight * stiffnessWeight * downMov * 2.0;
    vec2 compressMovDistortion = compressionFlow(textureCoord, center, downMov, max(0.0, smoothstep(0.0, 1.0, speed))) * compressionFlowWeight * stiffnessWeight * downMov;
    // Distortion caused by the azimuth and altitude angles
    
    vec2 linearAngleDistortion = quadraticParallelFlow(textureCoord, center, rightAzm, max(0.0, altWeight)) * linearFlowWeight * stiffnessWeight * downAzm;
    //highp vec2 linearAngleDistortion = compressionFlowInv(textureCoord, center, downAzm, max(0.0, altWeight)) * linearFlowWeight * (1.0 - stiffness) * downAzm;
    vec2 compressAngleDistortion = compressionFlow(textureCoord, center, downAzm, max(0.0, altWeight)) * compressionFlowWeight * stiffnessWeight * downAzm;
    
    vec2 zeroRef = vec2(0.5, 0.5) - 0.5 * vec2(cos(azm), sin(azm));
    linearAngleDistortion *= min(1.0, max(0.0, distanceInDirection(vTextureCoord, zeroRef, -downAzm))) * 5.0;
    //linearAngleDistortion *= smoothstep(0.0, 1.0, distanceInDirection(textureCoord, zeroRef, -downAzm)) * 5.0;

    vec2 offset = forceDistortion + linearMovDistortion + compressMovDistortion + linearAngleDistortion + compressAngleDistortion;
    //vec2 offset = forceDistortion + linearMovDistortion + compressMovDistortion + compressAngleDistortion;
	//highp vec2 offset = forceDistortion + linearMovDistortion + compressMovDistortion;
	//highp vec2 offset = forceDistortion + compressMovDistortion + compressAngleDistortion;
	//highp vec2 offset = forceDistortion + compressDistortion;

	float maxOffset = 0.3;
	//offset *= maxOffset;

	//offset = max(vec2(-0.9), min(vec2(0.9), offset));

	float dX = offset.x;
	float dY = offset.y;

	//highp vec2 textureCoord = vec2(textureCoord.x + dX, textureCoord.y + dY);
	textureCoord += offset;

	//textureCoord = (textureCoord - vec2(0.5, 0.5)) * vScaleFactor + vec2(0.5, 0.5);

	vec4 texColor = texture2D(texture, textureCoord);

	float dryness = 1.0; //fD(textureCoord, center, bristleLength);

	gl_FragColor = vec4(1.0, 1.0, 1.0, texColor.a * dryness);

	vec2 vTextureCoordSc = (vTextureCoord - vec2(0.5, 0.5)) * vScaleFactor + vec2(0.5, 0.5);

	//markCenter(vTextureCoordSc, centers(0), vec3(1.0, 0.0, 0.0));
	//markCenter(vTextureCoordSc, centers(1), vec3(0.0, 0.0, 1.0));
	//markCenter(vTextureCoordSc, centers(2), vec3(0.8, 0.8, 0.0));

	bool showNoise = false;

	if (showNoise) {

		
		gl_FragColor = vec4(vec3(colorAmountNoise(textureCoord, frameNum)), 1.0);
		//vec4(vec3(colorAmountNoise(textureCoord, frameNum)), 1.0);
		
		//gl_FragColor.a *= colorAmountNoise(textureCoord, frameNum);
		
		//gl_FragColor.a *= avgColorAmountNoise(textureCoord, frameNum);
	}

	/*if (textureCoord.x > 1.0 || textureCoord.x < 0.0 || textureCoord.y > 1.0 || textureCoord.y < 0.0) {
		gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
	}*/
	if (textureCoord.x >= 1.0 || textureCoord.x <= 0.0 || textureCoord.y >= 1.0 || textureCoord.y <= 0.0) {
		gl_FragColor.a = 0.0;
	}

	/*if (distance(zeroRef, vTextureCoord) < 0.01) {
		gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	}*/

	//gl_FragColor = vec4(vec3(fP(textureCoord, center)), 1.0);
	//gl_FragColor.a *= fP(textureCoord, center);
}










