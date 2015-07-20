// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};

var Cloud = require('ti.cloud'),
    CloudPush;

var uie = require('indicator');
var Indicator = uie.createIndicatorWindow();
if(Ti.Platform.name == 'android'){
    CloudPush = require('ti.cloudpush');
}else{
    Ti.App.iOS.addEventListener('notification', function(e){
        Ti.API.info('notification event');
        alert(e);
    });
}

registerNotification();

    //Cloud.debug = true;
function subscribeToChannel(channel_name){
 // Subscribe the user and device to the 'test' channel
 // Specify the push type as either 'android' for Android or 'ios' for iOS
 // Check if logged in:
 	var deviceToken = Ti.App.Properties.getString('deviceToken');
 	var subscription = Ti.App.Properties.getString('subscription');
 	if(subscription || !deviceToken){
 		return;
 	}
    Cloud.PushNotifications.subscribe({
        channel: channel_name,
        device_token: deviceToken,
        type: Ti.Platform.name == 'android' ? 'android' : 'ios'
    }, function (e) {
 		if (e.success) {
 			      Ti.App.Properties.setString('subscription',true);
            //TiDialog(L('subscribed'));
        } else {
            alert('Error:\n' +
                ((e.error && e.message) || JSON.stringify(e)));
        }
    });
}

// for future escalataion, like add unsubscribe feature
function unsubscribeToChannel(channel_name){
	var deviceToken = Ti.App.Properties.getString('deviceToken');
 	var subscription = Ti.App.Properties.getString('subscription');
	if(!subscription || !deviceToken){
 		return;
 	}
 // Unsubscribes the user and device from the 'test' channel
    Cloud.PushNotifications.unsubscribe({
        channel: channel_name,
        device_token: deviceToken
    }, function (e) {
 		if (e.success) {
 			Ti.App.Properties.setString('subscription',false);
            TiDialog(L('unsubscribed'));
        } else {
            alert('Error:\n' +
                ((e.error && e.message) || JSON.stringify(e)));
        }
    });
}





function L(text){
    var locale = Ti.App.Properties.getString('SETTING_LANGUAGE');
    if(!locale || locale == 'undefined'){
        if(Ti.Locale.currentCountry == 'CN' || Ti.Locale.currentCountry == 'TW'){
            locale = 'zh_hk';
        }else{
            locale = 'en';
        }  
        Ti.App.Properties.setString('SETTING_LANGUAGE',locale);   
    }
    return Ti.Locale.getString(locale+ '_' + text);
}

//underline of label
function decorateLabel(label,top_p) {
  var decoratedView = Titanium.UI.createView({
    width : Titanium.UI.SIZE, height : Titanium.UI.SIZE, layout : 'vertical',top: top_p,textAlign:Ti.UI.TEXT_ALIGNMENT_CENTER
  });
  decoratedView.add(label);
 
  setTimeout(function() {
    Ti.API.info(JSON.stringify(label));
    var lineView = Titanium.UI.createView({
      width : label.size.width, 
      //width : label.getWidth(),
      //width:40,
      left : label.left, height : 1, 
      backgroundColor : label.color ? label.color : 'white', 
      top : 0, 
      bottom : 0
    });
    Ti.API.info(JSON.stringify(lineView));
    decoratedView.add(lineView);
  }, 100);
  return decoratedView;
}

function TiDialog(msg,title,cb){
	var dialog = Ti.UI.createAlertDialog({
	    buttonNames: ['OK'],
	    message: msg,
	    //title: title || 'Error'
        title: title
	});
	dialog.show();
	if(cb){
		dialog.addEventListener('click',cb);
	}
	
}

function Toast(str){
    var toast = Ti.UI.createNotification({
        message:str,
        duration: Ti.UI.NOTIFICATION_DURATION_LONG
    });
    toast.show();
}






// Get token
function registerNotification(){
    var deviceToken = Ti.App.Properties.getString('deviceToken');
    if(deviceToken){
        return;
    }
    if(Ti.Platform.name == "android"){
        // Android register notification
        CloudPush.retrieveDeviceToken({
            success: function deviceTokenSuccess(e) {
                // Use this device token with Ti.Cloud.PushNotifications calls
                // to subscribe and unsubscribe to push notification channels
                Ti.API.info('Device Token: ' + e.deviceToken);
                Ti.App.Properties.setString('deviceToken',e.deviceToken);
            },
            error: function deviceTokenError(e) {
                alert('Failed to register for push! ' + e.error);
            }
        });
        // ***** Android
        // These events monitor incoming push notifications
        CloudPush.addEventListener('callback', function (evt) {
            alert(evt.payload);
        });
        CloudPush.addEventListener('trayClickLaunchedApp', function (evt) {
            Ti.API.info('Tray Click Launched App (app was not running)');
        });
        CloudPush.addEventListener('trayClickFocusedApp', function (evt) {
            Ti.API.info('Tray Click Focused App (app was already running)');
        });
        return;
    }
    // Check if the device is running iOS 8 or later
    if (Ti.Platform.name == "iPhone OS" && parseInt(Ti.Platform.version.split(".")[0]) >= 8) {
     
     // Wait for user settings to be registered before registering for push notifications
        Ti.App.iOS.addEventListener('usernotificationsettings', function registerForPush() {
            
     // Remove event listener once registered for push notifications
            Ti.App.iOS.removeEventListener('usernotificationsettings', registerForPush); 
     
            Ti.Network.registerForPushNotifications({
                success: deviceTokenSuccess,
                error: deviceTokenError,
                callback: receivePush
            });
        });
     
     // Register notification types to use
        Ti.App.iOS.registerUserNotificationSettings({
            types: [
                Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT,
                Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND,
                Ti.App.iOS.USER_NOTIFICATION_TYPE_BADGE
            ]
        });
    }
     
    // For iOS 7 and earlier
    else {
        Ti.Network.registerForPushNotifications({
     // Specifies which notifications to receive
            types: [
                Ti.Network.NOTIFICATION_TYPE_BADGE,
                Ti.Network.NOTIFICATION_TYPE_ALERT,
                Ti.Network.NOTIFICATION_TYPE_SOUND
            ],
            success: deviceTokenSuccess,
            error: deviceTokenError,
            callback: receivePush
        });
    }
}


// Process incoming push notifications
function receivePush(e) {
    Ti.API.info('receive notification');
    alert('Received push: ' + JSON.stringify(e));
}
// Save the device token for subsequent API calls
function deviceTokenSuccess(e) {
    Ti.API.info('assistant toten success: '+e.deviceToken);
    Ti.App.Properties.setString('deviceToken',e.deviceToken);

}
function deviceTokenError(e) {
    alert('Failed to register for push notifications! ' + e.error);
}

