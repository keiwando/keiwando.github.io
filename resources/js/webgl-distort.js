main();

var pencilInputs = {
	force: 0.0,
	altitude: 90,
	azimuth: 300,
	movement: 45,
	speed: 0.0,
	bristleStiffness: 0.0,
	bristleLength: 0.0
};

var frameNum = 1;

function basicQuadVshSource() {
	return `
		attribute vec4 position;
		attribute vec2 textureCoord;

		uniform mat4 modelViewMat;
		uniform mat4 projectionMat;

		varying vec2 vTextureCoord;

		void main() {
			gl_Position = projectionMat * modelViewMat * position;

			vTextureCoord = textureCoord;
		}
	`;
}

function basicQuadFshSource() {
	return `
		precision highp float;

		uniform sampler2D texture;

		varying vec2 vTextureCoord;

		void main() {

			highp vec4 texColor = texture2D(texture, vTextureCoord);

			gl_FragColor = vec4(1.0, 1.0, 1.0, texColor.a);
		}
	`;
}

function distortionShapeVshSource() {
	return `
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

			float distortion = min(abs(position.x), abs(position.y)) * 5.5 * force + 1.0 + abs(max(-position.x, 0.0)) * 20.5 * sin(force);

			vTextureCoord = textureCoord;
			vScaleFactor = (1.5 + 1.0 * force);

			//vScaleFactor = 1.0;

			//gl_Position = projectionMat * modelViewMat * distortion * (position + offset);
			gl_Position = projectionMat * modelViewMat * (vec4(position.xy * vScaleFactor, 0.0, 1.0) + offset);
		}
	`;
}

function distortionShapeFshSource() {
	return `
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

		highp float fD(highp vec2 pos, highp vec2 center, float dryness) {

			float x = (pos.x - center.x) * 15.0; // * dryness;
			float y = (pos.y - center.y) * 15.0; // * dryness;

			float val = pow(0.5 * (cos(x * sqrt(x * x + y * y)) * cos(y * sqrt(x * x + y * y)) + 1.0), 7.0 * dryness);

			//val = pow(0.5 * (cos(x * 3.0) * cos(y * 3.0) + 1.0), 20.0 * dryness);
			//val = pow(0.5 * (cos(x * pow(x * x + y * y, 0.25) * 3.0) * cos(y * pow(x * x + y * y, 0.25) * 3.0) + 1.0), 7.0 * dryness);

			//return val * 2.0 - 1.0;
			return val;
		}

		highp float parabola(highp vec2 x, highp vec2 center, float multiply) {

			return pow(min(0.8, length(center - x)), 1.4) * multiply * 1.2;
			//return length(center - x) * multiply;
		}

		float linearFlow(highp vec2 x, highp vec2 center, highp vec2 relativeDirection, float multiply) {

			float dist = length(dot(center - x, relativeDirection) / length(relativeDirection));
			return pow(dist, 2.0) * multiply;
		}

		float compressionFlow(highp vec2 x, highp vec2 center, highp vec2 relativeDirection, highp vec2 rel2, float multiply) {

			highp vec2 dX = center - x;

			float dist = length(dot(dX, relativeDirection) / length(relativeDirection));

			float dist2 = length(dot(dX, rel2) / length(rel2)) * 10.0 + 0.4;

			float angle = asin(dot(dX, relativeDirection)) / (length(dX) * length(relativeDirection));

			if (angle < 0.0) {
				return pow(dist, 1.0) * multiply * 5.0;
			}
			return pow(dist, 1.0) * multiply * 2.0;
		}

		void markCenter(highp vec2 texturePos, highp vec3 center, highp vec3 color) {

			if (center.z == 0.0) return;

			if (length(texturePos - center.xy) < 0.01) {
				gl_FragColor = vec4(color, 1.0);
			}
		}

		float PHI = 1.61803398874989484820459 * 00000.1; // Golden Ratio
		float PI_2  = 3.14159265358979323846264 * 00000.1; // PI
		float SQ2 = 1.41421356237309504880169 * 10000.0; // Square Root of Two

		float gold_noise(vec2 coordinate, float seed){
		    
		    return pow(fract((sin(dot(coordinate*(seed+PHI), vec2(PHI, PI_2))) + 1.0) * 0.5 * SQ2), 4.0);
		    //return fract(sin(dot(coordinate*(seed+PHI), vec2(PHI, PI_2)))*SQ2);
		}

		float rand(vec2 co){
		    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
		}

		float avg_noise(vec2 coord, float seed){
		    
		    float n1 = gold_noise(vec2(coord[0] - 1.0, coord[1] - 1.0), seed);
		    float n2 = gold_noise(vec2(coord[0], coord[1] - 1.0), seed);
		    float n3 = gold_noise(vec2(coord[0] + 1.0, coord[1] - 1.0), seed);
		    float n4 = gold_noise(vec2(coord[0] - 1.0, coord[1]), seed);
		    float n5 = gold_noise(vec2(coord[0], coord[1]), seed);
		    float n6 = gold_noise(vec2(coord[0] + 1.0, coord[1]), seed);
		    float n7 = gold_noise(vec2(coord[0] - 1.0, coord[1] + 1.0), seed);
		    float n8 = gold_noise(vec2(coord[0], coord[1] + 1.0), seed);
		    float n9 = gold_noise(vec2(coord[0] + 1.0, coord[1] + 1.0), seed);
		    
		    //return (n1 + n2 + n3 + n4 + n5 + n6 + n7 + n8 + n9) / 4.0;
		    return (n1 + n2 + n3 + n4 + n5 + n6 + n7 + n8 + n9) / 8.0;
		    //return (n2 + n4 + n5 + n6 + n8) / 5.0;
		    //return n5;
		}

		float colorAmount(float frameNum) {
    
		    float minAmount = 0.01;
		    
		    return max(1.0 - 0.8 * (1.0 / (1.0 + exp(-(frameNum / 100.0 - 4.0)))) - 0.00001 * frameNum, minAmount);
		}

		/*float colorAmountNoise(vec2 coord, float frameNum) {
    
			float period = 300.0 * rand(floor(coord * 64.0)) + 300.0;

		    //float res = 256.0;
		    //float res = 64.0 * rand(floor(coord * 10.0 + (frameNum / 30.0))) + 2.0;
		    float res = 64.0 * rand(floor(coord * 10.0)) + 2.0;
		    //float res = 64.0 * rand(floor(coord * 10.0 + floor((frameNum / period) * 2.0 * PI))) + 1.0;

		    //res = 64.0 * rand(floor(vec2(0) + floor((frameNum / period) * 2.0 * PI))) + 1.0;
		    
		    float periodDuration = 300.0 * rand(floor(coord * res)) + 300.0;
		    float t = (frameNum / periodDuration) * 2.0 * PI + rand(floor(coord * res)) * 500.0;
		    
		    float ampl = rand(floor(coord * res) + floor(t / (2.0 * PI)));
		    
		    float noiseVal = ampl * sin(t);// + rand(floor(coord * res));
		    
		    return noiseVal;
		    //return res/65.0;
		}*/

		float baseOffset(vec2 coord, float frameNum) {

			//float res = 128.0;
			float res = 256.0 * rand(floor(coord * 20.0)) + 4.0;

			return 0.5 * (1.0 + sin(coord.x * res) * sin(coord.y * res) * sin(frameNum * 2.0 * PI / 300.0 + res));
		}

		float colorAmountNoise(vec2 coord, float frameNum) {
    
		    //float res = 128.0;
		    float res = 256.0 * rand(floor(coord * 20.0)) + 4.0;
		    highp vec2 flr = floor(coord * res) / res;
		    
		    float periodDuration = 1000.0 * rand(flr + floor(frameNum / 300.0) / 400.0) + 50.0;
		    float t = (frameNum / periodDuration) * 2.0 * PI + rand(flr) * 500.0;
		    
		    highp vec2 center = (floor(coord * res) + 0.5) / res;
		    float dMult = min(1.0, distance(coord, center) * res * 2.0);
		    
		    float ampl = rand(flr + floor(t / (2.0 * PI)));// * pow((1.0 - dMult), 1.5);
		    
		    float bOffs = baseOffset(coord, frameNum);
		    float offset = 0.01 + colorAmount(frameNum) * 0.1;
		    float noiseVal = ampl * sin(t) + offset;
		    
		    /*if (distance(center, coord) < 0.01) {
		        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
		    } else if (abs(flr.x - (coord).x) < 0.005 || abs(flr.y - (coord).y) < 0.005) {
		        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
		    }*/
		    
		    return bOffs;
		    return noiseVal;
		}

		float avgColorAmountNoise(vec2 coord, float frameNum) {

			float n1 = colorAmountNoise(vec2(coord[0] - 1.0, coord[1] - 1.0), frameNum);
		    float n2 = colorAmountNoise(vec2(coord[0], coord[1] - 1.0), frameNum);
		    float n3 = colorAmountNoise(vec2(coord[0] + 1.0, coord[1] - 1.0), frameNum);
		    float n4 = colorAmountNoise(vec2(coord[0] - 1.0, coord[1]), frameNum);
		    float n5 = colorAmountNoise(vec2(coord[0], coord[1]), frameNum);
		    float n6 = colorAmountNoise(vec2(coord[0] + 1.0, coord[1]), frameNum);
		    float n7 = colorAmountNoise(vec2(coord[0] - 1.0, coord[1] + 1.0), frameNum);
		    float n8 = colorAmountNoise(vec2(coord[0], coord[1] + 1.0), frameNum);
		    float n9 = colorAmountNoise(vec2(coord[0] + 1.0, coord[1] + 1.0), frameNum);
		    
		    return (n1 + n2 + n3 + n4 + n5 + n6 + n7 + n8 + n9) / 5.0;
		}

		void main() {

			//highp vec2 textureCoord = vTextureCoord;
			highp vec2 textureCoord = (vTextureCoord - vec2(0.5, 0.5)) * vScaleFactor + vec2(0.5, 0.5);

			float r = 1.0 - abs(textureCoord.x - 0.5) * 2.0;
			float g = 1.0 - abs(textureCoord.y - 0.5) * 2.0;
			//gl_FragColor = vec4(r, g, 0.0, max(r, g));
			//return;
			// DEBUG Markings
			if (min(vTextureCoord.x, vTextureCoord.y) < 0.002 || max(vTextureCoord.x, vTextureCoord.y) > 0.998) {
				//gl_FragColor = vec4(1,1,1,1);
				//return;
			}

			float forceDistWeight = 0.4;
			float linearFlowWeight = 1.0;
			float compressionFlowWeight = 0.04;

			float upAngle = (movementDirection + 180.0) * PI / 180.0;
			float rightAngle = upAngle + PI / 2.0;
			float downAngle = rightAngle + PI / 2.0;

			highp vec2 center = vec2(0.5, 0.5);

			highp vec2 right = vec2(cos(-rightAngle), sin(-rightAngle));
			highp vec2 down = vec2(cos(-downAngle), sin(-downAngle)); 

			highp vec2 forceDistortion = normalize(center.xy - textureCoord) * parabola(textureCoord, center, force) * forceDistWeight;
			highp vec2 linearDistortion = linearFlow(textureCoord, center, right, max(0.0, speed - stiffness)) * linearFlowWeight * down;
			highp vec2 compressDistortion = compressionFlow(textureCoord, center, down, right, max(0.0, speed - stiffness)) * compressionFlowWeight * down;

			highp vec2 offset = forceDistortion + linearDistortion + compressDistortion;
			//highp vec2 offset = forceDistortion + compressDistortion;

			float dX = offset.x;
			float dY = offset.y;

			//highp vec2 textureCoord = vec2(textureCoord.x + dX, textureCoord.y + dY);
			textureCoord += offset;

			//textureCoord = (textureCoord - vec2(0.5, 0.5)) * vScaleFactor + vec2(0.5, 0.5);

			highp vec4 texColor = texture2D(texture, textureCoord);

			float dryness = 1.0; //fD(textureCoord, center, bristleLength);

			gl_FragColor = vec4(1.0, 1.0, 1.0, texColor.a * dryness);

			highp vec2 vTextureCoordSc = (vTextureCoord - vec2(0.5, 0.5)) * vScaleFactor + vec2(0.5, 0.5);

			//markCenter(vTextureCoordSc, centers(0), vec3(1.0, 0.0, 0.0));
			//markCenter(vTextureCoordSc, centers(1), vec3(0.0, 0.0, 1.0));
			//markCenter(vTextureCoordSc, centers(2), vec3(0.8, 0.8, 0.0));

			bool showNoise = true;

			if (showNoise) {

				//vec4(vec3(colorAmountNoise(textureCoord, frameNum)), 1.0);
				gl_FragColor = vec4(vec3(colorAmountNoise(textureCoord, frameNum)), 1.0);
				
				//gl_FragColor.a *= colorAmountNoise(textureCoord, frameNum);
				//gl_FragColor.a *= avgColorAmountNoise(textureCoord, frameNum);
			}
		}
	`;
}

function main() {

	const canvas = document.querySelector('#glCanvas');
	const gl = canvas.getContext("webgl");

	if (!gl) {
		alert("WebGL Unavailable!");
		return;
	}

	gl.clearColor(0.1, 0.1, 0.1, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Vertex shader

	//const vshSource = basicQuadVshSource();
	const vshSource = distortionShapeVshSource();

	// Fragment shader

	//const fshSource = basicQuadFshSource();
	const fshSource = distortionShapeFshSource();

	const program = createGLProgram(gl, vshSource, fshSource);

	const programInfo = {
		program: program,
		attribLocations: {
			position: gl.getAttribLocation(program, "position"),
			textureCoord: gl.getAttribLocation(program, "textureCoord")
		},
		uniformLocations: {
			force: gl.getUniformLocation(program, "force"),
			altitude: gl.getUniformLocation(program, "altitude"),
			azimuth: gl.getUniformLocation(program, "azimuth"),
			movementDirection: gl.getUniformLocation(program, "movementDirection"),
			speed: gl.getUniformLocation(program, "speed"),
			stiffness: gl.getUniformLocation(program, "stiffness"),
			bristleLength: gl.getUniformLocation(program, "bristleLength"),
			modelViewMat: gl.getUniformLocation(program, "modelViewMat"),
			projectionMat: gl.getUniformLocation(program, "projectionMat"),
			texture: gl.getUniformLocation(program, "texture"),
			frameNum: gl.getUniformLocation(program, "frameNum")
		}
	};

	const buffers = createQuadBuffers(gl);
	//const buffers = createDistortionBuffers(gl);
	
	const texture = loadTexture(gl, "resources/images/webgl-textures/brush.png");
	//const texture = loadTexture(gl, "resources/images/webgl-textures/round.png");
	//const texture = loadTexture(gl, "resources/images/webgl-textures/canvas_grain.png");
	//const texture = loadTexture(gl, "resources/images/webgl-textures/grid.png");
	//const texture = loadTexture(gl, "resources/images/webgl-textures/fine-grid.png");
	//const texture = loadTexture(gl, "resources/images/webgl-textures/rays.png");

	function render() {
		drawScene(gl, programInfo, buffers, texture);
		requestAnimationFrame(render);
		frameNum++;
	}
	requestAnimationFrame(render);

	//drawScene(gl, programInfo, buffers);
}

function drawScene(gl, programInfo, buffers, texture) {

	gl.clearColor(0.1, 0.1, 0.1, 1.0);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	const fieldOfView = 45 * Math.PI / 180;
	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	const zNear = 0.1;
	const zFar = 100.0;
	const projectionMatrix = mat4.create();

	mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
	//mat4.ortho(projectionMatrix, 0, gl.canvas.clientWidth, 0, gl.canvas.clientHeight, zNear, zFar);
	mat4.ortho(projectionMatrix, 0, 5, 0, 5, zNear, zFar);

	const modelViewMatrix = mat4.create();

	//mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0]);
	mat4.translate(modelViewMatrix, modelViewMatrix, [2.5, 2.5, -6.0]);

	{
		const numComponents = 2;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positions);
		gl.vertexAttribPointer(programInfo.attribLocations.position, numComponents, type, normalize, stride, offset);
		gl.enableVertexAttribArray(programInfo.attribLocations.positions);
	}

	{
		const num = 2;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoords);
		gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, num, type, normalize, stride, offset);
		gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
	}

	gl.useProgram(programInfo.program);

	gl.uniformMatrix4fv(
		programInfo.uniformLocations.projectionMat,
		false, 
		projectionMatrix
	);
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.modelViewMat,
		false,
		modelViewMatrix
	);

	bindPencilInputs(gl, programInfo);
	gl.uniform1f(programInfo.uniformLocations.frameNum, frameNum);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(programInfo.uniformLocations.texture, 0);

	{
		const offset = 0;
		//const vertexCount = buffers.positions.length / 2;

		gl.drawArrays(gl.TRIANGLE_STRIP, offset, 4);
		//gl.drawArrays(gl.TRIANGLE_FAN, offset, 10);
	}
}

function loadTexture(gl, url) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// Put a single pixel in the texture until the image finishes loading
	const pixel = new Uint8Array([0, 0, 0, 0]);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

	const image = new Image();
	image.onload = function() {
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

		if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}
	};
	image.src = url;

	return texture;
}

function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

function bindPencilInputs(gl, program) {

	gl.uniform1f(program.uniformLocations.force, pencilInputs.force);
	gl.uniform1f(program.uniformLocations.altitude, pencilInputs.altitude);
	gl.uniform1f(program.uniformLocations.azimuth, pencilInputs.azimuth);
	gl.uniform1f(program.uniformLocations.movementDirection, pencilInputs.movement);
	//console.log("movement: " + pencilInputs.movement);
	gl.uniform1f(program.uniformLocations.speed, pencilInputs.speed);
	gl.uniform1f(program.uniformLocations.stiffness, pencilInputs.bristleStiffness);
	gl.uniform1f(program.uniformLocations.bristleLength, pencilInputs.bristleLength);
}

function createDistortionBuffers(gl) {

	//  9/1	2 3
	//	  8 0 4
	//    7 6 5
	const positions = [
		 0.0,  0.0,
		-1.0,  1.0,
		 0.0,  1.0,
		 1.0,  1.0,
		 1.0,  0.0,
		 1.0, -1.0,
		 0.0, -1.0,
		-1.0, -1.0,
		-1.0,  0.0,
		-1.0,  1.0
	];

	const textureCoords = [
		0.5, 0.5,
		0.0, 0.0,
		0.5, 0.0,
		1.0, 0.0,
		1.0, 0.5,
		1.0, 1.0,
		0.5, 1.0,
		0.0, 1.0,
		0.0, 0.5, 
		0.0, 0.0
	];

	return createBuffers(gl, positions, textureCoords);
}

function createQuadBuffers(gl) {

	/*const positions = [
		 1.0,  1.0,
		-1.0,  1.0,
		 1.0, -1.0,
		-1.0, -1.0
	];*/

	const positions = [
		 1.0,  1.0,
		-1.0,  1.0,
		 1.0, -1.0,
		-1.0, -1.0
	];

	const textureCoords = [
		1.0, 0.0,
		0.0, 0.0,
		1.0, 1.0,
		0.0, 1.0
	];

	return createBuffers(gl, positions, textureCoords);
}

function createBuffers(gl, positions, textureCoords) {

	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	const textureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);

	return {
		positions: positionBuffer, 
		textureCoords: textureCoordBuffer
	};
}

function createGLProgram(gl, vshSource, fshSource) {

	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshSource);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshSource);

	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		alert("Unable to link the program: " + gl.getProgramInfoLog(program));
		return null;
	}

	return program;
}

function loadShader(gl, type, source) {

	const shader = gl.createShader(type);

	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

// MARK: UI Elements

connectInputs();

function connectInputs() {

	connectSlider("#force-input", "force");
	connectSlider("#speed-input", "speed");
	connectSlider("#stiffness-input", "bristleStiffness");
	connectSlider("#bristle-length-input", "bristleLength");

	create360AngleInput("#azimuth-input", "azimuth");
	create360AngleInput("#movement-direction-input", "movement");
	create90AngleInput("#altitude-input", "altitude");
}

function connectSlider(elemId, valueName) {

	var inputElem = document.querySelector(elemId);
	inputElem.oninput = function(event) {
		pencilInputs[valueName] = parseFloat(inputElem.value);
	}
	inputElem.value = pencilInputs[valueName];
}

function create360AngleInput(elemId, valueName) {

	var angleInput = document.querySelector(elemId);
	var thumb = angleInput.getElementsByClassName("thumb")[0];
	var angleLabel = angleInput.getElementsByTagName("h2")[0];
	var boundingRect = angleInput.getBoundingClientRect();
	var inputStyles = getComputedStyle(angleInput);
	var inputWidth = boundingRect.width;
	var inputBorderWidth = parseInt(inputStyles.getPropertyValue("border-left-width"), 10);
	var thumbWidth = thumb.getBoundingClientRect().width;
	var thumbHeight = thumb.getBoundingClientRect().height;
	var centerX = boundingRect.left + boundingRect.width / 2;
	var centerY = boundingRect.top + boundingRect.height / 2;

	var isDragging = false;	

	thumb.addEventListener("mousedown", function(event) {
		isDragging = true;
	});

	document.addEventListener("mouseup", function(event) {
		isDragging = false;
	});

	document.addEventListener("mousemove", function(event) {

		if (isDragging) {

			var angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
			setThumbPosition(angle);
			pencilInputs[valueName] = -angle * 180 / Math.PI  + (angle > 0 ? 360 : 0);
			updateLabel(angleLabel, pencilInputs[valueName]);
		}
	});

	setThumbPosition(-pencilInputs[valueName] * Math.PI / 180);
	updateLabel(angleLabel, pencilInputs[valueName]);

	function setThumbPosition(angle) {

			var cX = 0.5 * (Math.cos(-angle) * (inputWidth - 1 * inputBorderWidth) + inputWidth - 2 * inputBorderWidth);
			var cY = 0.5 * (Math.sin(angle) * (inputWidth - 1 * inputBorderWidth) + inputWidth - 2 * inputBorderWidth);

			var newLeft = (cX - thumbWidth / 2);
			var newTop = (cY - thumbHeight / 2);

			thumb.style.left = newLeft + "px";
			thumb.style.top = newTop + "px";
	}

	function updateLabel(label, degrees) {
		label.innerHTML = parseInt(pencilInputs[valueName] + (degrees < 0 ? 360 : 0)) + "°";	
	}
}

function create90AngleInput(elemId, valueName) {

	var angleInput = document.querySelector(elemId);
	var thumb = angleInput.getElementsByClassName("thumb")[0];
	var angleLabel = angleInput.getElementsByTagName("h2")[0];
	var boundingRect = angleInput.getBoundingClientRect();
	var inputStyles = getComputedStyle(angleInput);
	var inputWidth = boundingRect.width;
	var inputBorderWidth = parseInt(inputStyles.getPropertyValue("border-right-width"), 10);
	var thumbWidth = thumb.getBoundingClientRect().width;
	var thumbHeight = thumb.getBoundingClientRect().height;
	var pivotX = boundingRect.left + inputBorderWidth / 2;
	var pivotY = boundingRect.top + inputWidth - inputBorderWidth / 2;

	var isDragging = false;	

	thumb.addEventListener("mousedown", function(event) {
		isDragging = true;
	});

	document.addEventListener("mouseup", function(event) {
		isDragging = false;
	});

	document.addEventListener("mousemove", function(event) {

		if (isDragging) {

			var angle = Math.max(-Math.PI/2, Math.min(0, Math.atan2(event.clientY - pivotY, event.clientX - pivotX)));
			setThumbPosition(angle);
			pencilInputs[valueName] = -angle * 180 / Math.PI;
			updateLabel(angleLabel, pencilInputs[valueName]);
		}
	});

	setThumbPosition(-pencilInputs[valueName] * Math.PI / 180);
	updateLabel(angleLabel, pencilInputs[valueName]);

	function setThumbPosition(angle) {

			var cX = (Math.cos(-angle) * (inputWidth - 0.5 * inputBorderWidth));
			var cY = (Math.sin(angle)  * (inputWidth - 0.5 * inputBorderWidth));

			var newLeft = cX - inputBorderWidth / 2;
			var newTop = cY + inputWidth - inputBorderWidth / 2;

			newLeft = cX - 0.5 * thumbWidth;
			newTop = cY + inputWidth - 1 * inputBorderWidth - 0.5 * thumbWidth;

			thumb.style.left = newLeft + "px";
			thumb.style.top = newTop + "px";
	}

	function updateLabel(label, degrees) {
		label.innerHTML = parseInt(pencilInputs[valueName] + (degrees < 0 ? 360 : 0)) + "°";	
	}
}







