
var Scheduler = (function(){

	var grammar = `

		FullInput
		  = head:Day start:Time _? "-" _? end:Time { return {
		  	day: head,
		  	startTime: start,
		  	endTime: end
		  }; 
		}

		Expression
		  = head:Term tail:(_ ("+" / "-") _ Term)* {
		      return tail.reduce(function(result, element) {
		        if (element[1] === "+") { return result + element[3]; }
		        if (element[1] === "-") { return result - element[3]; }
		      }, head);
		    }

		Term
		  = head:Factor tail:(_ ("*" / "/") _ Factor)* {
		      return tail.reduce(function(result, element) {
		        if (element[1] === "*") { return result * element[3]; }
		        if (element[1] === "/") { return result / element[3]; }
		      }, head);
		    }

		Factor
		  = "(" _ expr:Expression _ ")" { return expr; }
		  / Integer

		Time 
		  = head:Integer([,.:]Integer)? {
		  	return parseFloat(head.replace(",",".").replace(":","."));
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
	return {

		elements: {
			dslInput: document.querySelector("input[name=dsl-cmd-input]"),
			scheduleContainer: document.querySelector("#schedule-container")
		},

		init: function() {
			
			elem = this.elements;
			this.bindUIActions();
			return this;
		},

		bindUIActions: function() {

			var inp = elem.dslInput;
			var handler = this.handleInputChange;

			inp.oninput = function(){
				
				handler(inp.value);
				//elem.scheduleContainer.innerHTML = parser.parse(inp.value);
			}
		},

		handleInputChange: function(input) {

			try {

				elem.scheduleContainer.innerHTML = parser.parse(input);
					
			} catch (e) {
				//console.log(e);
				elem.scheduleContainer.innerHTML = e;
			}
		}

	}.init();

})();
