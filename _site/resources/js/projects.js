$(document).ready(function() {

	var filterDict = {
		'all-filter' : 'All',
		'multiplatform-filter' : 'Multiplatform',
		'ios-filter' : 'iOS',
		'android-filter' : 'Android',
		'web-filter' : 'Web',
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
	document.getElementById("multiplatform-filter").onclick = filterProjects("multiplatform-filter");
	document.getElementById("ios-filter").onclick = filterProjects("ios-filter");
	document.getElementById("android-filter").onclick = filterProjects("android-filter");
	document.getElementById("web-filter").onclick = filterProjects("web-filter");
	document.getElementById("other-filter").onclick = filterProjects("other-filter");

});