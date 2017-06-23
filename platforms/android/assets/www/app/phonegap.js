var DevicePlatform;
var PushRegisterCode;
var isAppInbackground;
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
	checkNetworkStatus();
	document.addEventListener("pause", onPause, false);
	document.addEventListener("resume", onResume, false);
	DevicePlatform = device.platform;
	isAppInbackground = 0;
	chkGps();
}

function printlog(msg){
    alert(msg);
}

function isfingerprintavail(){
    window.plugins.touchid.isAvailable(
        function() {
            window.plugins.touchid.verifyFingerprint(
                'Scan your fingerprint please', // this will be shown in the native scanner popup
                function(msg) {
                    //printlog('ok: ' + JSON.stringify(msg));
                }, // success handler: fingerprint accepted
                function(msg) {
                    showError('Session expire. Login again');
                    LogOutUser();
                    //navigator.app.exitApp();
                    //printlog('Something is wrong: ' + JSON.stringify(msg));
                } // error handler with errorcode and localised reason
            );
        }, // success handler: TouchID available
        function(msg) {
            //printlog("First configer the touch id,");
        } // error handler: no TouchID available
    );
}

function chkGps(){
	cordova.plugins.diagnostic.isGpsLocationEnabled(function(enabled){
		enabled ? getlocation() : openloaction();
	}, function(error){
		alert("The following error occurred: "+error);
	});
}

function alertDismissed() {
	if(DevicePlatform == 'Android'){
		cordova.plugins.diagnostic.switchToLocationSettings();
	} else {
		cordova.plugins.diagnostic.switchToSettings();
	}
}

function openloaction(){
	navigator.notification.alert(
		'Enable your location service to continue.',  // message
		alertDismissed,         // callback
		'ENABLE LOCATION',            // title
		'Setting'                  // buttonName
	);
}

function getlocation(){
    var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 10000,enableHighAccuracy: true });
}

function onSuccess(position) {
	LatiTude = position.coords.latitude;
	LongiTude = position.coords.longitude;
	//alert(LatiTude+'--------'+LongiTude);
}

function onError(error) {
	chkGps();
}

function onPause(){
	isAppInbackground = 1;
}

function onResume(){
	checkNetworkStatus();
	isAppInbackground = 0;
	chkGps();
}

function push_register() {
	FCMPlugin.getToken(function(token) {
		PushRegisterCode = token;
		var url = "Users/pushToken";
		var jsonData = {'userID':userID,'token':PushRegisterCode,'platform':DevicePlatform};
		callAjaxFunction(url,jsonData,tokenASYNC);
	}, function(err) {
		console.log('error retrieving token: ' + err);
	});
	
	FCMPlugin.onNotification(function(data) {
		if (data.wasTapped) {
			var foreground = false;
		} else {
			var foreground = true;
		}
		var pushData = {
			"additionalData": {
				"foreground": foreground,
				"custom": {
					"type": data.type,
					"id": data.ActionID
				}
			}
		};
		notifyListener(pushData);
		//alert(JSON.stringify(data));
	}, function(msg) {
		//alert('onNotification callback successfully registered: ' + msg);
	}, function(err) {
		//alert('Error registering onNotification callback: ' + err);
	});
}

var tokenASYNC = function (response){
	//alert(JSON.stringify(response));
}

function dateTime(type){
	var options = {
		mode: type,         // 'date' or 'time', required 
		date: new Date(),     // date or timestamp, default: current date 
		minDate: new Date()
	};
	 
	datePicker.show(options, function (timestamp) {
		var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
		var d = new Date(timestamp*1);
		if(type == 'date'){
			var formattedDate = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
			var date = months[d.getMonth()]+' '+d.getDate() + ", " +d.getFullYear();
			$('#Ceventdate').val(date);
		} else if(type == 'time'){
			var hours = d.getHours();
			var minutes = d.getMinutes();
			var ampm = hours >= 12 ? 'pm' : 'am';
			hours = hours % 12;
			hours = hours ? hours : 12; // the hour '0' should be '12'
			minutes = minutes < 10 ? '0'+minutes : minutes;
			var strTime = hours + ':' + minutes + ' ' + ampm;
			$('#Ceventtime').val(strTime);
		}
	});
}

function notifyListener(data) {
	if(data.additionalData.foreground == true){
		
	} else {
		var type = data.additionalData.custom.type;
		if(type == 'qrready'){
			route_section('feed16');
			getAllevent();
		} else if(type == 'Feedback'){
			route_section('feed15');
			getAllfeedback();
		} else if(type == 'SongRequest'){
			route_section('feed13');
			getAllSongRequest();
		}
	}
}

/* CHECK NETWORK */

function checkNetworkStatus(){
	var networkState = navigator.connection.type;
    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';
	if(states[networkState] == 'No network connection'){
		$('.network_error').show();
	} else {
		$('.network_error').hide();
	}
}

/* END CHECK NETWORK */