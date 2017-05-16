
(function() {

	'use strict';

	const serverKey = 'key=AAAAJrMVIEw:APA91bEmBIZ3u8kEiKSAh6QOsnpvux9tYPobyRKILZwDT3B4q3eaOOa4Y_zD6kWbAQRojgySBT3j_5Vu9XCn7drTlSClYOGyXrnqtTc3qVG3lAQJzSLpspsw-eccBEvqP8pUsWaPog7d';

	let bloodButtonsActive = [];
	let notification;
	
	Polymer({
		is: 'my-notifications-blood',
		sendNotification: function(e) {

			let form = this.$.notificationForm;
			let bloodButtonsActive = [];
			let bloodButtons = this.$.buttonsContainer.children;
			let title = this.$.title.value;
			let body = this.$.body.value;
			let container = this.$.toastContainer;
			let toastSuccess = this.$.toastSuccess;
			let toastFail = this.$.toastFail;
			let toastIncomplete = this.$.toastIncomplete;

			for (let i = 0; i < bloodButtons.length; i++) {
				if (bloodButtons[i].hasAttribute('active')) {
					bloodButtonsActive.push(bloodButtons[i]);
				}
			}

			if ((bloodButtonsActive.length !== 0) && (title.length !== 0) && (body.length !== 0)) {
				for (let i = 0; i < bloodButtonsActive.length; i++) {
					let to = bloodButtonsActive[i].getAttribute('value');
					notification =
						{
							'notification':
								{
									'title': title,
									'body': body
								},
							'to': '/topics/' + to
						};
					
					$.ajax({
						headers: { 'Authorization': serverKey },
						type: 'POST',
						url : 'https://fcm.googleapis.com/fcm/send',
						contentType : 'application/json',
						data : JSON.stringify(notification),
						dataType : 'json',
						success : function(data) {
							console.log("Success!");
							toastSuccess.fitInto = container;
							toastSuccess.open();
							setTimeout(function() {
								form.reset();
								bloodButtonsActive[i].removeAttribute("active");
								bloodButtonsActive[i].setAttribute("area-pressed", false);
								bloodButtonsActive[i].setAttribute("elevation", 1);
							}, 1400);
						},
						error : function() {
							console.log("Error");
							/*toastFail.fitInto = container;
							toastFail.open();*/
						}
					})
				}
			}

			/*else {
				toastIncomplete.fitInto = container;
				toastIncomplete.open();
			}*/	

		}

	});

})();