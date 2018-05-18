
var BRUSH_REF_FOLDER = "resources/images/brush-reference/";
var folders = [
	"round_natural",
	"flat_natural",
	"filbert_natural"
];

images = [];

function createImageObj(brushName, strokeNumber, force, movement, altitude, azimuth, speed) {

	return {
		brushName: brushName,
		strokeNumber: strokeNumber,
		force: force,
		movement: movement,
		altitude: altitude,
		azimuth: azimuth,
		speed: speed
	}
}

function createImageElem(brushName, strokeNumber) {

	switch(strokeNumber) {
		case 1: return createImageObj(brushName, strokeNumber, "low", "-", "90°", "-", "zero");
		case 2: return createImageObj(brushName, strokeNumber, "med", "-", "90°", "-", "zero");
		case 3: return createImageObj(brushName, strokeNumber, "high", "-", "90°", "-", "zero");
		case 4: return createImageObj(brushName, strokeNumber, "med", "-", "45°", "-", "zero");
		case 5: return createImageObj(brushName, strokeNumber, "high", "-", "45°", "-", "zero");
		case 6: return createImageObj(brushName, strokeNumber, "med", "-", "10°", "-", "zero");
		case 7: return createImageObj(brushName, strokeNumber, "high", "-", "10°", "-", "zero");

		case 8: return createImageObj(brushName, strokeNumber, "low", "straight", "90°", "-", "med");
		case 9: return createImageObj(brushName, strokeNumber, "med", "straight", "90°", "-", "med");
		case 10: return createImageObj(brushName, strokeNumber, "med", "straight", "90°", "-", "high");
		case 11: return createImageObj(brushName, strokeNumber, "high", "straight", "90°", "-", "med");
		case 12: return createImageObj(brushName, strokeNumber, "high", "straight", "90°", "-", "high");

		case 13: return createImageObj(brushName, strokeNumber, "low", "straight", "45°", "0°", "med");
		case 14: return createImageObj(brushName, strokeNumber, "med", "straight", "45°", "0°", "med");
		case 15: return createImageObj(brushName, strokeNumber, "med", "straight", "45°", "0°", "high");
		case 16: return createImageObj(brushName, strokeNumber, "high", "straight", "45°", "0°", "med");
		case 17: return createImageObj(brushName, strokeNumber, "high", "straight", "45°", "0°", "high");
		case 18: return createImageObj(brushName, strokeNumber, "high", "straight", "45°", "0°", "varying");

		case 19: return createImageObj(brushName, strokeNumber, "med", "straight", "45°", "90°", "high");
		case 20: return createImageObj(brushName, strokeNumber, "high", "straight", "45°", "90°", "med");
		case 21: return createImageObj(brushName, strokeNumber, "high", "straight", "45°", "90°", "varying");

		case 22: return createImageObj(brushName, strokeNumber, "med", "straight", "45°", "180°", "high");
		case 23: return createImageObj(brushName, strokeNumber, "high", "straight", "45°", "180°", "med");
		case 24: return createImageObj(brushName, strokeNumber, "high", "straight", "45°", "180°", "high");
		case 25: return createImageObj(brushName, strokeNumber, "high", "straight", "45°", "180°", "varying");
		case 26: return createImageObj(brushName, strokeNumber, "high", "straight", "10°", "180°", "varying");

		case 27: return createImageObj(brushName, strokeNumber, "varying", "~", "90°", "-", "med");
		case 28: return createImageObj(brushName, strokeNumber, "varying", "~", "45°", "0°", "high");
		case 29: return createImageObj(brushName, strokeNumber, "high", "~", "45°", "90°", "high");
		case 30: return createImageObj(brushName, strokeNumber, "high", "~", "45°", "180°", "high");

		case 31: return createImageObj(brushName, strokeNumber, "varying", "o", "90°", "-", "med");
		case 32: return createImageObj(brushName, strokeNumber, "varying", "o", "45°", "0°", "high");
		case 33: return createImageObj(brushName, strokeNumber, "high", "o", "45°", "90°", "high");

		default: throw `Invalid stroke number: ${strokeNumber}! Must be between 1 and 33!`;
	}
}

function populateCollectionView(collectionView) {

	for (var fI = 0; fI < 3; fI++) {
		for (var i = 1; i <= 33; i++) {
			
			var imgSrc = BRUSH_REF_FOLDER + folders[fI] + "/" + i + ".jpg";

			var img = document.createElement("img");
			img.src = imgSrc;
			collectionView.appendChild(img);

			var imgElem = createImageElem(folders[fI], i);
			imgElem.img = img;
			images.push(imgElem);
		}	
	}
}

function filterString(elem) {
	return `${elem.brushName} id:${elem.strokeNumber} ${elem.force}-force ${elem.movement}-movement ${elem.altitude}-alt ${elem.azimuth}-azm ${elem.speed}-speed`;
}

function filter(filterStr) {

	for (var imgElem of images) {

		var compStr = filterString(imgElem).toLowerCase();
		var compArr = compStr.split(" ");
		console.log(filterStr.split(" "));

		//if (filterStr.trim() == "" || filterStr.toLowerCase().split(" ").every(x => compArr.includes(x))) {
		if (filterStr.trim() == "" || filterStr.toLowerCase().split(" ").every(x => compArr.some(e => e.includes(x)))) {
			imgElem.img.classList.remove("hidden");
		} else {
			imgElem.img.classList.add("hidden");
		}
	}
}

function main() {

	var collectionView = document.querySelector("#image-collection-view");
	var filterInput = document.querySelector("#filter-input");

	populateCollectionView(collectionView);

	filterInput.oninput = function() {
		filter(filterInput.value);
	}
}

main();