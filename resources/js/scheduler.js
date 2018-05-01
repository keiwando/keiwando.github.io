
var Scheduler = (function(){

	var grammar = `

		FullInput
		  = day:Day _ start:Time _? "-" _? end:Time _ title:Title important:Important? {

		  	  return {
			  	day: day,
			  	startTime: start,
			  	endTime: end,
			  	title:title,
			  	important: important ? true : false
			  };
		  }

		  / day:Day { 

		  	return {
		  		day: day
		  	};
		  }

		  / start:Time _? "-" _? end:Time _ title:Title important:Important? {

		  	  return {
			  	day: -1,
			  	startTime: start,
			  	endTime: end,
			  	title:title,
			  	important: important ? true : false
			  };
		  }

		  / DeleteCommand

		DeleteCommand
		  = ("Clear"i / "Del"i"ete"i?) _ day:(Day _)? startTime:Time {

		  	return {
		  		delete: true,
		  		day: day == null ? -1 : day[0],
		  		startTime: startTime
		  	}
		  }

		Important 
		  = "!!"

		Title
		  = ([A-Za-z0-9 ]+) { return text(); }

		Time 
		  = hour:Hour [,.:]? minute:Minute? {

		  	return {
		  		hour: hour,
		  		minute: minute | 0
		  	}
		  }

		Hour 
		  = ([2][0-4] / [1][0-9] / [0]?[0-9] / [0-9]) { 
		  	return parseInt(text(), 10);
		  }

		Minute 
		  = ([0-5]?[0-9]) { 
		  	return parseInt(text(), 10);
		  }

		Day
		  = Monday / Tuesday / Wednesday / Thursday / Friday / Saturday / Sunday

		Monday
		  = "Mon"i"day"i? { return 1; }

		Tuesday
		  = "Tue"i"sday"i? { return 2; }

		Wednesday
		  = "Wed"i"nesday"i? { return 3; }

		Thursday
		  = "Thu"i"rsday"i? { return 4; }

		Friday
		  = "Fri"i"day"i? { return 5; }

		Saturday
		  = "Sat"i"urday"i? { return 6; }

		Sunday
		  = "Sun"i"day"i? { return 7; }

		Integer "integer"
		  = _ [0-9]+ { return parseInt(text(), 10); }

		_ "whitespace"
		  = [ \\t\\n\\r]*
	`;

	var parser = peg.generate(grammar);

	var elem;
	var schedule;

	var days = {
		1 : "Monday",
		2 : "Tuesday",
		3 : "Wednesday",
		4 : "Thursday",
		5 : "Friday",
		6 : "Saturday",
		7 : "Sunday"
	}

	var context = {
		selectedDay: 1,
		selectedDayContainer: undefined
	}

	var settings = {
		timeCellHeight: 40,
		dTime: 30,
		startHour: 8,
		endHour: 18,
		minEventDuration: 30
	}

	var events = [];

	let refreshContainerSizes;

	var refreshCurrentDay = function(day) {

		context.selectedDay = day;

		for (dayContainer of elem.dayContainers) {
			if (dayContainer.id == days[context.selectedDay] + "-container") {
				dayContainer.classList.add("current");
				context.selectedDayContainer = dayContainer;
			} else {
				dayContainer.classList.remove("current");
			}
		}
	}

	function placeEvent(eventInfo) {

		var titleHeight = elem.timeContainer.querySelector("h3").getBoundingClientRect().height;

		var height = (eventInfo.endTime.minute + eventInfo.endTime.hour * 60 - eventInfo.startTime.minute - eventInfo.startTime.hour * 60) / settings.dTime * settings.timeCellHeight + 2;
		var top = (eventInfo.startTime.minute + (eventInfo.startTime.hour - settings.startHour) * 60) / settings.dTime * settings.timeCellHeight + titleHeight + 8;

		eventInfo.cell.style.top = `${top}px`;
		eventInfo.cell.style.height = `${height}px`;

		if (eventInfo.important) {
			eventInfo.cell.classList.add("important");
		}
	}

	function clampInputTimes(parsed) {

		if (!("startTime" in parsed)) {
			return parsed;
		}

		let startInMins = parsed.startTime.hour * 60 + parsed.startTime.minute;
		startInMins = Math.max(0, startInMins);

		parsed.startTime.hour = Math.floor(startInMins / 60);
		parsed.startTime.minute = startInMins % 60;

		if ("endTime" in parsed) {
			let endInMins = Math.min(60 * 24, Math.max(startInMins + settings.minEventDuration, parsed.endTime.hour * 60 + parsed.endTime.minute)); 

			parsed.endTime.hour = Math.floor(endInMins / 60);
			parsed.endTime.minute = endInMins % 60;	
		}

		return parsed;
	}

	schedule = {

		elements: {
			dslInput: document.querySelector("input[name=dsl-cmd-input]"),
			syntaxErrorDisplay: document.querySelector(".syntax-error-display"),
			scheduleContainer: document.querySelector("#schedule-container"),
			timeContainer: document.querySelector(".time-container"),
			dayContainers: document.getElementsByClassName("day-container")
		},

		init: function() {
			
			elem = this.elements;
			this.bindUIActions();
			this.setupTimeContainer();
			refreshContainerSizes = this.refreshContainers;
			let currentDay = new Date().getDay();
			refreshCurrentDay(currentDay == 0 ? 7 : currentDay);
			this.runTestCommands();
			return this;
		},

		bindUIActions: function() {

			var inp = elem.dslInput;
			var inpHandler = this.handleInputChange;
			var submitHandler = this.handleInputSubmit;

			inp.oninput = function() {
				
				inpHandler(inp.value);
			}

			inp.onchange = function() {
				if (submitHandler(inp.value)) {
					inp.value = "";
					// TODO: Save input for undo
				}
			}
		},

		setupTimeContainer: function() {

			function minsToHoursMins(mins) {
			  	let h = Math.floor(mins / 60);
			  	let m = mins % 60;
			  	h = h < 10 ? '0' + h : h;
			  	m = m < 10 ? '0' + m : m;
			  	return `${h}:${m}`;
			}

			var dTime = settings.dTime;
			var startHour = settings.startHour;
			var numOfCells = (settings.endHour - startHour) * 60 / dTime;

			var cellHeight;

			for (var i = 0; i < numOfCells; i++) {

				var start = minsToHoursMins((i + startHour * 60 / dTime) * dTime);
				var end = minsToHoursMins((i + 1 + startHour * 60 / dTime) * dTime);
				var cell = document.createElement("h5");
				cell.innerHTML = `${start} - ${end}`;
				elem.timeContainer.appendChild(cell);
				cellHeight = cell.getBoundingClientRect().height;
			}

			var titleHeight = elem.timeContainer.querySelector("h3").getBoundingClientRect().height;
			var containerHeight = titleHeight + numOfCells * (cellHeight + 0.2);

			for (var container of elem.dayContainers) {
				container.style.height = `${containerHeight}px`;
			}
		},

		refreshContainers: function() {
			
			var labels = [].slice.call(elem.timeContainer.getElementsByTagName("h5"));
		
			for (var label of labels) {
				elem.timeContainer.removeChild(label);
			}

			schedule.setupTimeContainer();

			for (eventInfo of events) {
				placeEvent(eventInfo);
			}
		},

		handleInputChange: function(input) {

			try {

				if (input != "") {
					parser.parse(input);
				}
				
				elem.syntaxErrorDisplay.classList.remove("active");
				elem.syntaxErrorDisplay.innerHTML = "";
					
			} catch (e) {
				elem.syntaxErrorDisplay.classList.add("active");
				elem.syntaxErrorDisplay.innerHTML = e;
			}
		},

		handleInputSubmit: function(input) {

			function createEvent(container, title, day, start, end, important) {

				var eventCell = document.createElement("div");
				container.appendChild(eventCell);
				eventCell.classList.add("event");
				var label = document.createElement("h5");
				eventCell.appendChild(label);
				label.innerHTML = title;

				return {
					cell: eventCell,
					title: title,
					day: day,
					startTime: start,
					endTime: end,
					important: important
				};
			}

			try {

				if (input != "") {

					var parsed = parser.parse(input);
					parsed = clampInputTimes(parsed);

					if ("day" in parsed && parsed["day"] != -1 && parsed["day"] != null) {
						refreshCurrentDay(parsed.day);
					}

					if ("title" in parsed) {

						if (parsed.startTime.hour < settings.startHour || parsed.endTime.hour > settings.endHour) {
							settings.startHour = Math.min(settings.startHour, parsed.startTime.hour);
							settings.endHour = Math.max(settings.endHour, parsed.endTime.hour);
							console.log(settings.startHour);
							console.log(settings.endHour);
							refreshContainerSizes();
						}

						var eventInfo = createEvent(context.selectedDayContainer, parsed.title, context.selectedDay, parsed.startTime, parsed.endTime, parsed.important);
						placeEvent(eventInfo);
						events.push(eventInfo);
					}

					if ("delete" in parsed) {

						let index = events.findIndex(function(e){
							
							return e.day == context.selectedDay && e.startTime.hour == parsed.startTime.hour && e.startTime.minute == parsed.startTime.minute;
						});

						if (index == -1) {
							throw "Event to be deleted unknown"
						}

						var eventInfo = events[index];
						eventInfo.cell.parentElement.removeChild(eventInfo.cell);
						events.splice(index, 1);
					}
				}

				elem.syntaxErrorDisplay.classList.remove("active");
				elem.syntaxErrorDisplay.innerHTML = "";

				return true;

			} catch (e) {
				elem.syntaxErrorDisplay.classList.add("active");
				elem.syntaxErrorDisplay.innerHTML = e;

				return false;
			}
		},

		runTestCommands: function() {

			var commands = [
				"Wed 8-10 Test",
				"Mon 10-11 Meeting !!",
				"11-12 Break",
				"12-14 Lunch",
				"Del Wed 8"
			];

			var input = elem.dslInput;

			for (var cmd of commands) {
				//console.log(cmd);
				input.value = cmd;
				this.handleInputSubmit(input.value);
				input.value = "";
			}
		}

	}.init();

	return schedule;

})();
