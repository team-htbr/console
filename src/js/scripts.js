(function() {

    'use strict';

    const serverKey = 'key=AAAAJrMVIEw:APA91bEmBIZ3u8kEiKSAh6QOsnpvux9tYPobyRKILZwDT3B4q3eaOOa4Y_zD6kWbAQRojgySBT3j_5Vu9XCn7drTlSClYOGyXrnqtTc3qVG3lAQJzSLpspsw-eccBEvqP8pUsWaPog7d';
    // HOW TO GET phoneKey
    // 1. Connect device with Android Studio
    // 2. Run app on device
    // 3. Toggle 'Android moinitoring at the bottom of Android Studio and press the 'SHOW TOKEN' button
    // 4. Copy string after 'Token: ' 
    // 5. Paste token in constant 'phoneKey'
    const phoneKey = '';
    const jsonString = { "notification": { "title": "Bloeddonatie", "body": "Notification for specific device" }, "to" : phoneKey };

    var sendNotification = function() {
        $.ajax({
            headers: { 'Authorization': serverKey },
            type: 'POST',
            url : 'https://fcm.googleapis.com/fcm/send',
            contentType : 'application/json',
            data : JSON.stringify(jsonString),
            dataType : 'json',
            succes : function(data) {
                console.log(data);
            }
        })
    };

    $(document).ready(function() {
        $('#button').on('click', function() {
            sendNotification()
        });
    });

})();