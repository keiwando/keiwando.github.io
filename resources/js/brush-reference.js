
var BRUSH_REF_FOLDER = "resources/images/brush-reference/";
var folders = [
	"round_natural",
	"flat_natural",
	"filbert_natural",
	"round_synthetic",
	"filbert_synthetic",
	"fan_natural"
];

var atlasNames = [
	"round_natural_1.jpg",
	"round_natural_2.jpg",
	"flat_natural_1.jpg",
	"flat_natural_2.jpg",
	"filbert_natural_1.jpg",
	"filbert_natural_2.jpg",
	"round_synthetic.jpg",
	"filbert_synthetic_1.jpg",
	"filbert_synthetic_2.jpg",
	"fan_natural_1.jpg",
	"fan_natural_2.jpg"
];

var strokes = [];
var brushTips = [];
var atlases = [];

var filtered = [];

var fullscreenImageView = {
	container: document.querySelector("#fullscreen-container"),
	closeButton: document.querySelector("#fullscreen-close-button"),
	img: document.querySelector("#fullscreen-image"),
	label: document.querySelector("#fullscreen-title-label"),
	selectedIndex: 0
};

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
		case 1: return createImageObj(brushName, strokeNumber, "low", "no", "90°", "-", "zero");
		case 2: return createImageObj(brushName, strokeNumber, "med", "no", "90°", "-", "zero");
		case 3: return createImageObj(brushName, strokeNumber, "high", "no", "90°", "-", "zero");
		case 4: return createImageObj(brushName, strokeNumber, "med", "no", "45°", "-", "zero");
		case 5: return createImageObj(brushName, strokeNumber, "high", "no", "45°", "-", "zero");
		case 6: return createImageObj(brushName, strokeNumber, "med", "no", "10°", "-", "zero");
		case 7: return createImageObj(brushName, strokeNumber, "high", "no", "10°", "-", "zero");

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

function createImageContainer(src, title) {

	var container = document.createElement("div");
	container.classList.add("img-container");

	var img = document.createElement("img");
	img.src = src;
	container.appendChild(img);

	var label = document.createElement("h5");
	label.innerHTML = title;
	container.appendChild(label);

	hide(label);

	container.onclick = function(){
		
		var index = filtered.findIndex(e => e.src == src);
		fullscreenImageView.selectedIndex = index;

		showInFullscreen(index);
	}

	return container;
}

function showInFullscreen(index) {

	var elem = filtered[index];

	show(fullscreenImageView.container);
	fullscreenImageView.img.style["background-image"] = `url(${elem.src}`;
	fullscreenImageView.label.innerHTML = elem.title;
}

function populateCollectionView(collectionView) {

	// Add the strokes
	for (var fI = 0; fI < folders.length; fI++) {
		for (var i = 1; i <= 33; i++) {
			
			var imgSrc = BRUSH_REF_FOLDER + folders[fI] + "/" + i + ".jpg";

			var imgElem = createImageElem(folders[fI], i);
			strokes.push(imgElem);

			var title = labelString(imgElem);

			var imgContainer = createImageContainer(imgSrc, title);
			collectionView.appendChild(imgContainer);

			imgElem.container = imgContainer;
			imgElem.src = imgSrc;
			imgElem.title = title;
		}	
	}

	// Add the brush tips
	for (var fI = 0; fI < folders.length; fI++) {
		var brushName = folders[fI];
		
		var src = BRUSH_REF_FOLDER + "tips/" + brushName + ".jpg";

		var title = `${brushName}`;
		var container = createImageContainer(src, title);
		collectionView.appendChild(container);

		brushTips.push({
			name: brushName,
			src: src,
			container: container,
			filterString: `tip::${brushName}:: `,
			title: title
		});
	}

	// Add the full atlases
	for (var aI = 0; aI < atlasNames.length; aI++) {

		var name = atlasNames[aI];

		var src = BRUSH_REF_FOLDER + "atlases/" + name;

		var title = `atlas ${name}`.replace(".jpg", "");
		var container = createImageContainer(src, title);
		collectionView.appendChild(container);

		atlases.push({
			name: name,
			src: src,
			container: container,
			filterString: `atlas::${name}:: `,
			title: title
		});
	}

}

function show(elem) {
	elem.classList.remove("hidden");
}

function hide(elem) {
	elem.classList.add("hidden");
}

function filterString(elem) {
	return `${elem.brushName} id:${elem.strokeNumber}# ${elem.force}-force ${elem.movement}-movement ${elem.altitude}-alt ${elem.azimuth}-azm ${elem.speed}-speed`;
}

function labelString(elem) {
	return `${elem.brushName} ${elem.force}-force ${elem.movement}-movement ${elem.altitude}-alt ${elem.azimuth.replace("-", "0°")}-azm ${elem.speed}-speed`;
}

function filter(filterStr) {

	filtered.length = 0;

	escapedFilter = filterStr.replace(/ +/, "%");
	var sep = "?filter="
	var newURL = location.href.split(sep)[0] + sep + escapedFilter;
	if (window.history.replaceState) {
	   //prevents browser from storing history with each change:
	   window.history.replaceState({}, "Brush Reference", newURL);
	}

	function shouldShow(elemFilter, userFilter) {

		var compArr = elemFilter.split(" ");
		return userFilter.trim() == "" || userFilter.toLowerCase().split(" ").every(x => compArr.some(e => e.includes(x)));
	}

	for (var imgElem of strokes) {

		var compStr = filterString(imgElem).toLowerCase();

		//if (filterStr.trim() == "" || filterStr.toLowerCase().split(" ").every(x => compArr.includes(x))) {
		if (shouldShow(compStr, filterStr)) {
			show(imgElem.container);
			filtered.push(imgElem);
		} else {
			hide(imgElem.container);
		}
	}

	for (var tip of brushTips) {

		if (shouldShow(tip.filterString, filterStr)) {
			show(tip.container);
			filtered.push(tip);
		} else {
			hide(tip.container);
		}
	}

	for (var atlas of atlases) {

		if (shouldShow(atlas.filterString, filterStr)) {
			show(atlas.container);
			filtered.push(atlas);
		} else {
			hide(atlas.container);
		}
	}

}

function main() {

	var collectionView = document.querySelector("#image-collection-view");
	var filterInput = document.querySelector("#filter-input");

	fullscreenImageView.container.onclick = function() {
		hide(fullscreenImageView.container);
	}

	document.onkeydown = function(evt) {

		function leftKeyDown() {
			fullscreenImageView.selectedIndex = Math.max(0, fullscreenImageView.selectedIndex - 1);
		    showInFullscreen(fullscreenImageView.selectedIndex);
		}

		function rightKeyDown() {
			fullscreenImageView.selectedIndex = Math.min(filtered.length, fullscreenImageView.selectedIndex + 1);
		    showInFullscreen(fullscreenImageView.selectedIndex);
		}

	    evt = evt || window.event;
	    var isEscape = false;
	    if ("key" in evt) {

	    	if (!fullscreenImageView.container.classList.contains("hidden")) {
	    		isEscape = (evt.key == "Escape" || evt.key == "Esc");

		        if (evt.key === "ArrowLeft") {
		        	leftKeyDown();
		        } else if (evt.key === "ArrowRight") {
		        	rightKeyDown();
		        }		
	    	}
	    } else {
	        isEscape = (evt.keyCode == 27);

	        if (evt.keyCode === 37) {
	        	leftKeyDown();
	        } else if (evt.keyCode === 39) {
	        	rightKeyDown();
	        }
	    }
	    if (isEscape) {
	        hide(fullscreenImageView.container);
	    }
	};

	populateCollectionView(collectionView);
	
	var sep = "?filter="
	var parts = location.href.split(sep);
	if (parts.length > 1) {
		var filterStr = parts[1].replace("%", " ");
		filter(filterStr);
		filterInput.value = filterStr;
	} else {
		filter("");
	}

	//filter("");

	filterInput.oninput = function() {
		filter(filterInput.value);
	}
}

main();