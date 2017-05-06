
(function() {

	'use strict';

	const serverKey = 'key=AAAAJrMVIEw:APA91bEmBIZ3u8kEiKSAh6QOsnpvux9tYPobyRKILZwDT3B4q3eaOOa4Y_zD6kWbAQRojgySBT3j_5Vu9XCn7drTlSClYOGyXrnqtTc3qVG3lAQJzSLpspsw-eccBEvqP8pUsWaPog7d';

	let bloodButtonsActive = [];
	let notification;

	Polymer({
		is: 'my-notifications-blood',
		sendNotification: function(e) {
			let bloodButtonsActive = [];
			let bloodButtons = this.$.buttonsContainer.children;
			let title = this.$.title.value;
			let body = this.$.body.value;
			for (let i = 0; i < bloodButtons.length; i++) {
				if (bloodButtons[i].hasAttribute('active')) {
					bloodButtonsActive.push(bloodButtons[i]);
				}
			}
		  
			for (let i = 0; i < bloodButtonsActive.length; i++) {
				let to = bloodButtonsActive[i].getAttribute('value');
				notification =
					{
						'notification':
							{
								'title': title,
								'body': body
							},
						'to': '/topics/'+to
					}
				
				$.ajax({
					headers: { 'Authorization': serverKey },
					type: 'POST',
					url : 'https://fcm.googleapis.com/fcm/send',
					contentType : 'application/json',
					data : JSON.stringify(msg),
					dataType : 'json',
					succes : function(data) {
						console.log(data);
					}
				})
			}

		}

	});

})();