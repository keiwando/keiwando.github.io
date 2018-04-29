//alert(parser.parse("5 + 5"));

var Scheduler = {

	elements: {
		dslInput: document.querySelector("input[name=dsl-cmd-input]"),
		scheduleContainer: document.querySelector("#schedule-container")
	},

	init: function() {
		this.bindUIActions();
	},

	bindUIActions: function() {

		var inp = this.elements.dslInput;
		var container = this.elements.scheduleContainer;

		inp.oninput = function(){
			
			container.innerHTML = parser.parse(inp.value);
		}
	}
};

Scheduler.init();
