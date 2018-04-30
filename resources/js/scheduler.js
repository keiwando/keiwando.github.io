
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
		  = ([2][0-3] / [1][0-9] / [0]?[0-9] / [0-9]) { 
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
		startHour: 7,
		endHour: 20
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

	return {

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
			refreshContainerSizes = this.setupTimeContainer;
			refreshCurrentDay(1);
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
			var containerHeight = titleHeight + numOfCells * (cellHeight + 0.3);

			for (var container of elem.dayContainers) {
				container.style.height = `${containerHeight}px`;
			}
		},

		refreshContainers: function() {
			// TODO:
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

			function createEvent(container, title, day, start, end) {

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
					endTime: end
				};
			}

			function placeEvent(cell, startTime, endTime, important) {

				var titleHeight = elem.timeContainer.querySelector("h3").getBoundingClientRect().height;

				var height = (endTime.minute + endTime.hour * 60 - startTime.minute - startTime.hour * 60) / settings.dTime * settings.timeCellHeight + 2;
				var top = (startTime.minute + (startTime.hour - settings.startHour) * 60) / settings.dTime * settings.timeCellHeight + titleHeight + 8;

				cell.style.top = `${top}px`;
				cell.style.height = `${height}px`;

				if (important) {
					cell.classList.add("important");
				}
			}

			try {

				if (input != "") {

					var parsed = parser.parse(input);

					if ("day" in parsed && parsed["day"] != -1 && parsed["day"] != null) {
						refreshCurrentDay(parsed.day);
					}

					if ("title" in parsed) {

						if (parsed.startTime.hour < settings.startHour) {
							settings.startHour = parsed.startTime.hour;
							refreshContainerSizes();
						}

						var eventInfo = createEvent(context.selectedDayContainer, parsed.title, context.selectedDay, parsed.startTime, parsed.endTime);
						placeEvent(eventInfo.cell, parsed.startTime, parsed.endTime, parsed.important);
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
				console.log(cmd);
				input.value = cmd;
				this.handleInputSubmit(input.value);
				input.value = "";
			}
		}

	}.init();

})();
