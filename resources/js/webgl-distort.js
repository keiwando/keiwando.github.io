main();

var pencilInputs = {
	force: 0.5,
	altitude: 90,
	azimuth: 300,
	movement: 45,
	speed: 0.5,
	bristleStiffness: 0.4,
	bristleLength: 0.4
};

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

		attribute vec4 position;
		attribute vec2 textureCoord;

		uniform mat4 modelViewMat;
		uniform mat4 projectionMat;

		varying vec2 vTextureCoord;

		void main() {

			float distortion = min(abs(position.x), abs(position.y)) * 5.5 + 1.0;// + abs(max(-position.x, 0.0)) * 20.5;

			gl_Position = projectionMat * modelViewMat * distortion * position;

			//gl_Position.a = 0.0;

			vTextureCoord = textureCoord;
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

	const vshSource = basicQuadVshSource();
	//const vshSource = distortionShapeVshSource();

	// Fragment shader

	const fshSource = basicQuadFshSource();

	const program = createGLProgram(gl, vshSource, fshSource);

	const programInfo = {
		program: program,
		attribLocations: {
			position: gl.getAttribLocation(program, "position"),
			textureCoord: gl.getAttribLocation(program, "textureCoord")
		},
		uniformLocations: {
			modelViewMat: gl.getUniformLocation(program, "modelViewMat"),
			projectionMat: gl.getUniformLocation(program, "projectionMat"),
			texture: gl.getUniformLocation(program, "texture")
		}
	};

	//const buffers = createBuffers(gl);
	const buffers = createDistortionBuffers(gl);
	const texture = loadTexture(gl, "resources/images/webgl-textures/brush.png");

	function render() {
		drawScene(gl, programInfo, buffers, texture);
		requestAnimationFrame(render);
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

	const modelViewMatrix = mat4.create();

	mat4.translate(modelViewMatrix, 
				   modelViewMatrix, 
				   [-0.0, 0.0, -6.0]);

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

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(programInfo.uniformLocations.texture, 0);

	{
		const offset = 0;
		//const vertexCount = buffers.positions.length / 2;

		//gl.drawArrays(gl.TRIANGLE_STRIP, offset, 4);
		gl.drawArrays(gl.TRIANGLE_FAN, offset, 10);
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
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}
	};
	image.src = url;

	return texture;
}

function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
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
}

function connectSlider(elemId, valueName) {

	var inputElem = document.querySelector(elemId);
	inputElem.onchange = function(event) {
		pencilInputs[valueName] = inputElem.value;
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

	/*var center = document.createElement("div");

	center.style.width = "10px";
	center.style.height = "10px";
	center.style["border-radius"] = "50%"; 
	center.style["background-color"] = "red";
	center.style.position = "absolute";
	center.style.top = 0.5 * (boundingRect.height - 2 * inputBorderWidth) - 5 + "px";
	center.style.left = 0.5 * (boundingRect.width - 2 * inputBorderWidth) - 5 + "px";
	//center.style.top = -5 + "px";
	//center.style.left = -5 + "px";
	angleInput.appendChild(center);
	//document.insertBefore(center, angleInput);*/


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
			pencilInputs[valueName] = -angle * 180 / Math.PI;
			updateLabel(angleLabel, pencilInputs[valueName]);
		}
	});

	setThumbPosition(-pencilInputs[valueName] * Math.PI / 180);
	updateLabel(angleLabel, pencilInputs[valueName]);

	function setThumbPosition(angle) {

			var cX = 0.5 * (Math.cos(-angle) * (inputWidth - 1 * inputBorderWidth) + inputWidth - 2 * inputBorderWidth);
			var cY = 0.5 * (Math.sin(angle) * (inputWidth - 1 * inputBorderWidth) + inputWidth - 2 * inputBorderWidth);
			//console.log("angle: " + angle);

			var newLeft = (cX - thumbWidth / 2);
			var newTop = (cY - thumbHeight / 2);

			thumb.style.left = newLeft + "px";
			thumb.style.top = newTop + "px";
	}

	function updateLabel(label, degrees) {
		label.innerHTML = parseInt(pencilInputs[valueName] + (degrees < 0 ? 360 : 0)) + "°";	
	}
}

function create90AngleInput() {

}

function relativeCoords(event) {
  var bounds = event.target.getBoundingClientRect();
  var x = event.clientX - bounds.left;
  var y = event.clientY - bounds.top;
  return {x: x, y: y};
}






