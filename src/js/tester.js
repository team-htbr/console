(function() {

	'use strict';

	let bloodButtonsActive = [];

    Polymer({
      is: 'my-notifications-blood',
      sendNotification: function(e) {
      	let bloodButtons = this.$.buttonsContainer.children;
        for (let i = 0; i < bloodButtons.length; i++) {
        	if (bloodButtons[i].hasAttribute('active')) {
        		bloodButtonsActive.push(bloodButtons[i]);
        	}
        }
        console.log(bloodButtonsActive);
      }
    });

})();