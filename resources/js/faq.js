
window.addEventListener('load', 
function setupFaq() {

	var containers = document.getElementsByClassName('faq-item-container');

	[].forEach.call(containers, function(container) {

		var question = container.getElementsByClassName('faq-item-question')[0];
		var answer = container.getElementsByClassName('faq-item-answer')[0];

		let qHeight = question.offsetHeight;
		let aHeight = answer.offsetHeight;

		function fold() {
			container.style.height = `${qHeight}px`;
		}

		function unfold() {
			container.style.height = `${qHeight + aHeight}px`;	
		}

		question.onclick = function() {
			if (container.classList.contains('faq-unfolded')) {
				container.classList.remove('faq-unfolded');
				fold();
			} else {
				container.classList.add('faq-unfolded');
				unfold();
			}
		}

		fold();
	});
}, false);