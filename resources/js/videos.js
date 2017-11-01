$(document).ready(function() {

	var filterDict = {
		'all-filter' : 'All',
		'educational-filter' : 'Educational',
		'animation-filter' : 'Animation',
		'short-film-filter' : 'Short Film',
		'german-filter' : 'German',
		'other-filter' : 'Other'
	}

	function filterProjects(filter) {

		return function() {
			
			$('.projects-grid').children().each(function() {

				if (filter.toLowerCase() == "all-filter" || $(this).hasClass(filter)) {
					$(this).removeClass("hidden");
				} else {
					$(this).addClass("hidden");
				}
			});

			$('#selected-filter').text(filterDict[filter]);

			return false;
		}
	}

	document.getElementById("all-filter").onclick = filterProjects("all-filter");
	document.getElementById("educational-filter").onclick = filterProjects("educational-filter");
	document.getElementById("animation-filter").onclick = filterProjects("animation-filter");
	document.getElementById("short-film-filter").onclick = filterProjects("short-film-filter");
	document.getElementById("german-filter").onclick = filterProjects("german-filter");
	document.getElementById("other-filter").onclick = filterProjects("other-filter");

});