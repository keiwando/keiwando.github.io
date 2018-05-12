
var Scheduler = (function(){

	var grammar = `

		FullInput
		  = 
		  	ShowEditorCommand
		  / HideEditorCommand
		  / EditEventTimesCommand
		  / CreateEventCommand
		  / ResetCommand
		  / SelectDayCommand
		  / RenameEventCommand
		  / DeleteEventCommand
		  / ClearAllDayEventsCommand
		  / ClearAllCommand
		  / " "*

		ShowEditorCommand 
		  = ("Editor"i / "Show Editor"i / "Open Editor"i) {
		  	return {
		  		commandID: -1
		  	};
		  }

		HideEditorCommand
		  = ("Exit Editor"i / "Close Editor"i / "Hide Editor"i / ":q"i / ":wq"i) {
		  	return {
		  		commandID: -2	
		  	};
		  }

		SelectDayCommand
		  = day:Day { 

		  	return {
		  		commandID: 0, 
		  		day: day
		  	};
		  }

		ResetCommand
		  = "Reset"i {

		  	return {
		  		commandID: 1
		  	}
		  }

		CreateEventCommand
		  = day:Day _ time:TimeRange _ title:Title important:Important? {

		  	  return {
		  	  	commandID: 2,
			  	day: day,
			  	startTime: time.start,
			  	endTime: time.end,
			  	title:title,
			  	important: important ? true : false
			  };
		  }

		  / time:TimeRange _ title:Title important:Important? {

		  	  return {
		  	  	commandID: 2,
			  	day: -1,
			  	startTime: time.start,
			  	endTime: time.end,
			  	title:title,
			  	important: important ? true : false
			  };
		  }

		DeleteEventCommand
		  = ("Clear"i / "Delete"i?) _ day:(Day _)? (_ "event at"i _)? startTime:Time {

		  	return {
		  		commandID: 3,
		  		day: day == null ? -1 : day[0],
		  		startTime: startTime
		  	};
		  }

		ClearAllDayEventsCommand
		  = ("Clear"i / "Delete"i?) _ day:Day {

		  	return {
		  		commandID: 4,
		  		day: day
		  	};
		  }

		ClearAllCommand
		  = ("Clear"i / "Delete"i?) _ "All"i {
		  	return {
		  		commandID: 5
		  	}
		  }

		RenameEventCommand
		  = "Rename"i _ day:(Day _)? ("event at"i _)? startTime:Time title:Title {

		  	return {
		  		commandID: 6,
		  		day: day == null ? -1 : day[0],
		  		startTime: startTime,
		  		title: title
		  	};
		  }

		EditEventTimesCommand
		  = day:(Day _)? ("event at"i _)? startTime:Time _ "new"i " "+ "time"i _ newTime:TimeRange {

		  	return {
		  		commandID: 7,
		  		day: day == null ? -1 : day[0],
		  		startTime: startTime,
		  		newStartTime: newTime.start,
		  		newEndTime: newTime.end
		  	};
		  }


		Important 
		  = "!!"

		Title
		  = ([A-Za-zÄÖÜäöüß0-9() ]+) { return text(); }

		TimeRange 
		  = start:Time _? ("-" / "to"i) _? end:Time {

		  	let startText = text().toLowerCase().split(/-|to/)[0];
		  	let endText = text().toLowerCase().split(/-|to/)[1];

		  	let startIsAM = start.hour < 12 && startText.includes("am");
		  	let startIsPM = startText.includes("pm");
		  	let endIsAM = end.hour < 12 && endText.includes("am");
		  	let endIsPM = endText.includes("pm");

		  	let startInMins = start.hour * 60 + start.minute;
		  	let endInMins = end.hour * 60 + end.minute;

		  	if (endIsPM && !startIsAM) {
		  		let shiftedTime = startInMins + 12 * 60;
		  		if (shiftedTime < Math.min(endInMins, 24 * 60)) {
		  			start.hour = Math.floor(shiftedTime / 60);
		  			start.minute = shiftedTime % 60;
		  		}
		  	}

		  	if (startIsPM && end.hour < startInMins) {

		  		endInMins += 12 * 60;
		  		end.hour = Math.floor(endInMins / 60);
		  		end.minute = endInMins % 60;
		  	}

		  	return {
		  		start: start,
		  		end: end
		  	};
		  }

		Time 
		  = hour:Hour [,.:]? minute:Minute? (_? ("AM"i / "PM"i))? {

		  	return {
		  		hour: hour + (hour <= 12 && text().toLowerCase().includes("pm") ? 12 : 0),
		  		minute: minute || 0
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

		Day "Day"
		  = Monday / Tuesday / Wednesday / Thursday / Friday / Saturday / Sunday / Today

		Monday
		  = ("Monday"i / "Monda"i / "Mond"i / "Mon"i / "Mo"i) { return 1; }
 		  
		Tuesday
		  = ("Tuesday"i / "Tuesda"i / "Tuesd"i / "Tues"i / "Tue"i / "Tu"i) { return 2; }

		Wednesday
		  = ("Wednesday"i / "Wednesda"i / "Wednesd"i / "Wednes"i / "Wedne"i / "Wedn"i / "Wed"i / "We"i) { return 3; }

		Thursday
		  = ("Thursday"i / "Thursda"i / "Thursd"i / "Thurs"i / "Thur"i / "Thu"i / "Th"i) { return 4; }

		Friday
		  = ("Friday"i / "Frida"i / "Frid"i / "Fri"i / "Fr"i) { return 5; }

		Saturday
		  = ("Saturday"i / "Saturda"i / "Saturd"i / "Satur"i / "Satu"i / "Sat"i / "Sa"i) { return 6; }

		Sunday
		  = ("Sunday"i / "Sunda"i / "Sund"i / "Sun"i / "Su"i) { return 7; }

		Today
		  = "Today"i { 
		  	let currentDay = new Date().getDay();
			return currentDay == 0 ? 7 : currentDay;
		  }

		Integer "integer"
		  = _ [0-9]+ { return parseInt(text(), 10); }

		_ "whitespace"
		  = [ \\t\\n\\r]+
	`;

	var parser = peg.generate(grammar);

	//console.log(document.cookie);
	//document.cookie = "TUE 10-12 Test !!";
	let storage = window.localStorage;
	let COMMAND_STORAGE_KEY = "Scheduler_Commands";

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
		editorErrorLine: 1,
		selectedDayContainer: undefined,
		previousCommands: [],
		redoCommands: []
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

		context.selectedDay = parseInt(day);

		for (dayContainer of elem.dayContainers) {
			if (dayContainer.id == days[context.selectedDay] + "-container") {
				dayContainer.classList.add("current");
				context.selectedDayContainer = dayContainer;
			} else {
				dayContainer.classList.remove("current");
			}
		}
	}

	function getCurrentDay() {
		let currentDay = new Date().getDay();
		return currentDay == 0 ? 7 : currentDay;
	}

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
			important: important,

			set Title(value) {
				this.title = value;
				label.innerHTML = value;
			}
		};
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

	function findCurrentDayEventStartingAt(startTime) {

		function formattedNum(num) {
			return ("0" + num).slice(-2);
		}

		let index = events.findIndex(function(e){
			
			return e.day == context.selectedDay && e.startTime.hour == startTime.hour && e.startTime.minute == startTime.minute;
		});

		if (index == -1) {
			throw `There is no event on ${days[context.selectedDay]} starting at ${timeToString(startTime)}`;
		}

		return events[index];
	}

	function selectDayCmd(parsed) {
		refreshCurrentDay(parsed.day);
	}

	function createEventCmd(parsed) {

		if ("day" in parsed && parsed["day"] != -1 && parsed["day"] != null) {
			refreshCurrentDay(parsed.day);
		}

		if (parsed.startTime.hour < settings.startHour || parsed.endTime.hour > settings.endHour) {
			settings.startHour = Math.min(settings.startHour, parsed.startTime.hour);
			settings.endHour = Math.max(settings.endHour, parsed.endTime.hour);
			refreshContainerSizes();
		}

		var overlap = checkOverlap(context.selectedDay, parsed.startTime, parsed.endTime);
		if (overlap.exists) {
			showError(`An event already exists on ${days[context.selectedDay]} from ${timeToString(overlap.event.startTime)} to ${timeToString(overlap.event.endTime)}`, true);
			return;
		}

		var eventInfo = createEvent(context.selectedDayContainer, parsed.title, context.selectedDay, parsed.startTime, parsed.endTime, parsed.important);
		placeEvent(eventInfo);
		events.push(eventInfo);		
	}

	function timeToString(time) {

		function formattedNum(num) {
			return ("0" + num).slice(-2);
		}

		return `${formattedNum(time.hour)}:${formattedNum(time.minute)}`;
	}

	function deleteEventCmd(parsed) {

		if ("day" in parsed && parsed["day"] != -1 && parsed["day"] != null) {
			refreshCurrentDay(parsed.day);
		}

		var eventInfo = findCurrentDayEventStartingAt(parsed.startTime);
		eventInfo.cell.parentElement.removeChild(eventInfo.cell);
		events.splice(events.indexOf(eventInfo), 1);

		refreshDayStartAndEndTimes();
		refreshContainerSizes();
	}

	function clearAllDayEventsCmd(parsed) {

		let eventsToDelete = events.filter(function(ev){
			return ev.day == parsed.day
		});

		console.log(eventsToDelete);

		for (var ev of eventsToDelete) {
			ev.cell.parentElement.removeChild(ev.cell);
		}

		events = events.filter(function(ev){
			return ev.day != parsed.day
		});
		console.log(events);
		refreshDayStartAndEndTimes();
		refreshContainerSizes();
	}

	function clearAllEventsCmd() {

		for (var ev of events) {
			ev.cell.parentElement.removeChild(ev.cell);
		}
		events.length = 0;

		settings.startHour = 8;
		settings.endHour = 18;

		refreshContainerSizes();
	}

	function renameEventCmd(parsed) {

		if ("day" in parsed && parsed["day"] != -1 && parsed["day"] != null) {
			refreshCurrentDay(parsed.day);
		}

		var event = findCurrentDayEventStartingAt(parsed.startTime);

		event.Title = parsed.title;	
	}

	function editEventTimesCmd(parsed) {

		if ("day" in parsed && parsed["day"] != -1 && parsed["day"] != null) {
			refreshCurrentDay(parsed.day);
		}

		var event = findCurrentDayEventStartingAt(parsed.startTime);

		var overlap = checkOverlap(context.selectedDay, parsed.newStartTime, parsed.newEndTime, event);
		if (overlap.exists) {
			showError(`An event already exists on ${days[context.selectedDay]} from ${timeToString(overlap.event.startTime)} to ${timeToString(overlap.event.endTime)}`, true);
			return;
		}

		event.startTime = parsed.newStartTime;
		event.endTime = parsed.newEndTime;

		refreshDayStartAndEndTimes();
		refreshContainerSizes();
	}

	function checkOverlap(day, startTime, endTime, eventToIgnore = undefined) {

		function timeToMins(time) {
			return time.hour * 60 + time.minute;
		}

		function isBetween(t, start, end) {
			return start < t && t < end;
		}

		var start = timeToMins(startTime);
		var end = timeToMins(endTime);

		for (event of events) {

			var evtStart = timeToMins(event.startTime);
			var evtEnd = timeToMins(event.endTime);

			if (event.day != day || (eventToIgnore != undefined && eventToIgnore === event)) {
				continue;
			}

			if ((evtStart == start || evtEnd == end) || isBetween(evtStart, start, end) || isBetween(evtEnd, start, end)
				|| isBetween(start, evtStart, evtEnd) || isBetween(end, evtStart, evtEnd)) {

				return {
					exists: true,
					event: event
				};
			}
		}

		return {
			exists: false
		}
	}

	function refreshDayStartAndEndTimes() {

		settings.startHour = Math.min(8, Math.min(...events.map(ev => ev.startTime.hour)));
		settings.endHour = Math.max(18, Math.min(24, Math.max(...events.map(ev => ev.endTime.hour + (ev.endTime.minute > 0 ? 1 : 0)))));
	}

	function reset() {

		clearAllEventsCmd();
		events.length = 0;
		localStorage.removeItem(COMMAND_STORAGE_KEY);

		context = {
			selectedDay: 1,
			editorErrorLine: 1,
			selectedDayContainer: undefined,
			previousCommands: [],
			redoCommands: []
		}

		settings = {
			timeCellHeight: 40,
			dTime: 30,
			startHour: 8,
			endHour: 18,
			minEventDuration: 30
		}

		refreshCurrentDay(getCurrentDay());
	}

	function undo() {

		if (context.previousCommands.length > 0) {
			let undoCommand = context.previousCommands.pop();
			context.redoCommands.unshift(undoCommand);
			let commands = context.previousCommands.slice(0);
			context.previousCommands.length = 0;
			clearAllEventsCmd();
			schedule.runCommands(commands);
		}
	}

	function redo() {

		if (context.redoCommands.length > 0) {
			var redoCommand = context.redoCommands.shift();
			schedule.runCommands([redoCommand]);
		}
	}

	(function registerKeyboardInputHandler(){

		function onKeyDown(e) {

			var evtobj = window.event? event : e
      		if (evtobj.keyCode == 90 && evtobj.ctrlKey) {
      			undo();
      		} else if (evtobj.keyCode == 89 && evtobj.ctrlKey) {
      			redo();
      		} 
		}

		document.onkeydown = onKeyDown;

	})();

	function handleInputChange(input) {

		try {

			elem.syntaxErrorDisplay.classList.remove("active");
			elem.syntaxErrorDisplay.innerHTML = "";

			if (input.replace(" ", "") != "") {
				parser.parse(input);
			}
				
		} catch (e) {
			showError(e);
		}
	}

	function chooseCommand(parsed) {
		//console.log(JSON.stringify(parsed));
		switch (parsed.commandID) {
			case -2: hideEditor(); break;
			case -1: showEditor(); break;
			case 0: selectDayCmd(parsed); break;
			case 1: reset(); break;
			case 2: createEventCmd(parsed); break;
			case 3: deleteEventCmd(parsed); break;
			case 4: clearAllDayEventsCmd(parsed); break;
			case 5: clearAllEventsCmd(); break;
			case 6: renameEventCmd(parsed); break;
			case 7: editEventTimesCmd(parsed); break;
		}
	}

	function runParsedCommand(parsed, input) {

		chooseCommand(parsed);

		// Replace Today with the actual day
		if (input.toLowerCase().includes("today")) {
			input = input.replace(/today/ig, days[getCurrentDay()]);
		}

		context.previousCommands.push(input);
		
		if (parsed.commandID >= 0 && parsed.commandID != 1) {
			localStorage.setItem(COMMAND_STORAGE_KEY, context.previousCommands.join("\n"));	
		}
	}

	function rememberCommand(cmd) {

		contex.previousCommands.push(cmd);
		localStorage.setItem(COMMAND_STORAGE_KEY, context.previousCommands.join("\n"));	
	}

	function handleInputSubmit(input) {

		try {

			elem.syntaxErrorDisplay.classList.remove("active");
			elem.syntaxErrorDisplay.innerHTML = "";

			if (input.replace(" ", "") != "") {

				var parsed = parser.parse(input);
				parsed = clampInputTimes(parsed);

				runParsedCommand(parsed, input);

				let previousCommands = storage.getItem(COMMAND_STORAGE_KEY);
				if (previousCommands != null) {

					elem.editorTextarea.value = previousCommands;
				}
			} else {
				console.log("empty input");
				rememberCommand(input);
			}

			return true;

		} catch (e) {

			showError(e);

			return false;
		}
	}


	function handleEditorUpdate(input) {

		// Execute the commands if there are not errors
		handleEditorSubmit(input);
	}

	function handleEditorSubmit(input) {

		var parsedCommands = new Array();
		var currentLine = 1;
		// Try to parse all lines first
		for (cmd of input.split("\n")) {

			try {
				var parsed = parser.parse(cmd);
				parsed = clampInputTimes(parsed);

				parsedCommands.push({
					parsed: parsed,
					cmd: cmd
				});

				hideEditorErrorIndicator();
				currentLine++;
			} catch (e) {
				indicateEditorErrorOnLine(currentLine);
				showError(e);
				return;
			}
		}

		hideEditorErrorIndicator();
		hideErrorDisplay();

		reset();
		console.log(parsedCommands);
		for (var parsed of parsedCommands) {
			runParsedCommand(parsed.parsed, parsed.cmd);
		}
	}

	function showError(error, forced = false) {

		if (forced) {
			elem.syntaxErrorDisplay.classList.add("active");
			elem.syntaxErrorDisplay.innerHTML = error.toString();
			return;			
		}

		var errorText = error.toString();
		console.log(errorText);

		// Make parser errors more user friendly
		if (errorText.includes("or [A-Za-zÄÖÜäöüß0-9 ]")) {
			errorText = "Missing event name";
		} /*else if (errorText.toLowerCase().includes("syntaxerror")) {
			//errorText = "SyntaxError";
		}*/ else if (error.name != "ReferenceError") {
			errorText = "Invalid Command";
		}

		elem.syntaxErrorDisplay.classList.add("active");
		elem.syntaxErrorDisplay.innerHTML = errorText;
	}

	function hideErrorDisplay() {
		elem.syntaxErrorDisplay.classList.remove("active");
		elem.syntaxErrorDisplay.innerHTML = "";	
	}

	function showEditor() {
		elem.mainContainer.classList.add("editor-visible");
		editor.classList.add("visible");
	}

	function hideEditor() {

		elem.mainContainer.classList.remove("editor-visible");
		editor.classList.remove("visible");
	}

	function indicateEditorErrorOnLine(line) {

		var marginTop = 30 - elem.editorTextarea.scrollTop;
		var lineHeight = 28;

		context.editorErrorLine = line;

		var top = marginTop + (line - 1) * lineHeight;

		elem.editorErrorIndicator.classList.remove("hidden");
		elem.editorErrorIndicator.style.top = `${top}px`;

	}

	function refreshEditorErrorIndicator(scrollOffset) {

		var marginTop = 30 - scrollOffset;
		var lineHeight = 28;

		var top = marginTop + (context.editorErrorLine - 1) * lineHeight;

		elem.editorErrorIndicator.style.top = `${top}px`;
	}

	function hideEditorErrorIndicator() {
		elem.editorErrorIndicator.classList.add("hidden");
	}

	schedule = {

		elements: {
			dslInput: document.querySelector("input[name=dsl-cmd-input]"),
			syntaxErrorDisplay: document.querySelector(".syntax-error-display"),
			scheduleContainer: document.querySelector("#schedule-container"),
			timeContainer: document.querySelector(".time-container"),
			dayContainers: document.getElementsByClassName("day-container"),
			editor: document.querySelector("#editor"),
			mainContainer: document.querySelector("#main-container"),
			editorTextarea: document.querySelector("textarea"),
			editorErrorIndicator: document.querySelector("#error-indicator")
		},

		init: function() {
			
			elem = this.elements;
			this.bindUIActions();
			this.setupTimeContainer();
			refreshContainerSizes = this.refreshContainers;
			let currentDay = new Date().getDay();
			refreshCurrentDay(currentDay == 0 ? 7 : currentDay);
			//this.runTestCommands();
			return this;
		},

		bindUIActions: function() {

			var inp = elem.dslInput;
			
			inp.oninput = function() {
				
				handleInputChange(inp.value.trim());
			}

			inp.onchange = function() {
				if (handleInputSubmit(inp.value.trim())) {
					inp.value = "";
					context.redoCommands.length = 0;
				}
			}

			var textarea = elem.editorTextarea;

			/*textarea.onkeyup = function(e){
			  	e = e || event;
			  	
			  	if (e.keyCode === 13) {
			    	handleEditorSubmit(textarea.value);
					context.redoCommands.length = 0;
			  	}
			  	return true;
			}*/

			textarea.oninput = function() {
				handleEditorUpdate(textarea.value);
			}

			textarea.onscroll = function(){

				refreshEditorErrorIndicator(textarea.scrollTop);
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

		runTestCommands: function() {

			var commands = [
				"Wed 8-10 Test",
				"Mon 10-11 Meeting !!",
				"11-12 Break",
				"12-14 Lunch",
				"Del Wed 8",
				"Wed 8-10 Test",
				"Fri 10-11 Test"
			];

			this.runCommands(commands);
		},

		runCommands: function(commands) {

			var input = elem.dslInput;

			for (var cmd of commands) {
				//console.log(cmd);
				input.value = cmd;
				handleInputSubmit(input.value);
				input.value = "";
			}
		}

	}.init();

	let previousCommands = storage.getItem(COMMAND_STORAGE_KEY);
	if (previousCommands != null) {
		
		elem.editorTextarea.value = previousCommands;
		handleEditorSubmit(previousCommands);
	}

	hideEditorErrorIndicator();

	return schedule;

})();
