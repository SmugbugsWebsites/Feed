function showError(msg, type){
	alert(msg);
}

function getStarted(){
	route_section("feed03");
}

function aside(){
	if(!$('aside#feed03-dropmenu').hasClass('show')) {
		$('aside#feed03-dropmenu').addClass('show');
		$('.milkytransparent_layer').show();
		$('section').addClass('aside');
		$('section').addClass('right');
	} else {
		$('aside#feed03-dropmenu').removeClass('show');
		$('.milkytransparent_layer').hide();
		$('section').removeClass('aside');
		$('section').removeClass('right');
	}
	event.stopPropagation();
}

function SignInUser(){
	route_section("feed08");
	$('input[type=text]').val('');
	$('input[type=email]').val('');
	$('input[type=tel]').val('');
	$('input[type=password]').val('');
}

function RegisterUser(){
	route_section("feed09");
	$('input[type=text]').val('');
	$('input[type=email]').val('');
	$('input[type=tel]').val('');
	$('input[type=password]').val('');
}

function ComingSoon(type){
	alert(type);
}

function LogOutUser(){
	loader();
	RETRYAJAXURL  = '';
	RETRYAJAXDATA = '';
	RETRYAJAXASYNC = 0;
	RETRYAJAXFUNCTION = '';
	url;
	jsonData;
	FbId = '';
	FbName = '';
	FbEmail = '';
	FbToken = '';
	GoogleId = '';
	GoogleName = '';
	GoogleEmail = '';
	GoogleId = '';
	ImgUser = '';
	loginVia = '';
	userID = '';
	userName = '';
	userEmail = '';
	userImage = '';
	userNature = '';
	notificationstart = '';
	notificationend = '';
	route_section('feed08');
	window.localStorage.removeItem("loginCache");
	$('input[type=text]').val('');
	$('input[type=email]').val('');
	$('input[type=tel]').val('');
	$('input[type=password]').val('');
	loader();
}

function SignInDirect(type){
	loader();
	jsonData = '';
	var id = '';
	if (type == 'fb'){
		id = FbId;
		var jsonData = {
			'name': FbName,
			'fbId': FbId,
			'pimg': ImgUser,
			'email': FbEmail
		};
	} else if (type == 'google'){
		id = GoogleId;
		var jsonData = {
			'name': GoogleName,
			'googleid': GoogleId,
			'pimg': ImgUser,
			'email': GoogleEmail
		};
	}
	jsonData['id'] = id;
	jsonData['type'] = type;
	var url = "Users/chkUserExistences";
	
	var response = callAjax(url,jsonData);
	
	loader();
	//alert(JSON.stringify(response));
	if(response.C == 100){
		//NEW USERS CREATE
		var url = "Users/createUser";
		var response = callAjax(url,jsonData);
		if(response.C == 100){
			//user create
			userID = response.R;
			completeProfile();
		} else {
			//insert error
			showError('Try to signUp again later.',0);
			return false;
		}		
	} else if(response.C == 101) {
		//NEW USERS ALREADY CREATE
		var result = response.R;
		userID = result.id;
		if(result.profilestatus == 0){
			//profile incomplete
			completeProfile();	
		} else if(result.profilestatus == 1){
			if(result.usersProfile == 1){
				//users is manager
				userNature = 1;
			} else if(result.usersProfile == 2){
				//users is DJ
				userNature = 2;
			} else {
				//normal users
				userNature = 0;
			}
			//profile complete to dashboard
			setUserdashboard();
		} else if(result.profilestatus == 2){
			//users block
		} else{
			completeProfile();
		}
	} else {
		//NO DATA GET
	}
}

function completeProfile(){
	loader();
	var url = "Users/getUser";
	var jsonData = {'usersID':userID};
	var response = callAjax(url,jsonData);
	loader();
	if(response.C == 100){
		route_section("feed09");
		$('input[type=text]').val('');
		$('input[type=email]').val('');
		$('input[type=tel]').val('');
		$('input[type=password]').val('');
		var result = response.R;
		$('#username').val(result.name);
		if(result.contact == 0){
			$('#usercontact').val('');
		} else {
			$('#usercontact').val(result.contact);
		}
		
		if(result.email != ''){
			$('#useremail').attr('readonly','readonly');
			$('#useremail').val(result.email);
		} else {
			$('#useremail').removeAttr('readonly');
			$('#useremail').val('');
		}
		
		$('#userpassword').val('');
		$('#usercpassword').val('');
	}
}

function registerUser(){
	var uname = $('#username').val();
	var ucontact = $('#usercontact').val();
	var uemail = $('#useremail').val();
	var upass = $('#userpassword').val();
	var ucpass = $('#usercpassword').val();
	if(uname == ''){
		$('#username').focus();
		showError('Enter name',0);
		return false;
	} else if(ucontact == ''){
		$('#usercontact').focus();
		showError('Enter contact number',0);
		return false;
	} else if(ucontact.length != 10){
		$('#usercontact').focus();
		showError('Enter correct contact number',0);
		return false;
	} else if(uemail == ''){
		$('#useremail').focus();
		showError('Enter email',0);
		return false;
	} else if(!(isValidEmailAddress(uemail))){
		$('#useremail').focus();
		showError('Enter valid email',0);
		return false;
	} else if(upass == ''){
		$('#userpassword').focus();
		showError('Enter password',0);
		return false;
	} else if(upass <= 5){
		$('#userpassword').focus();
		showError('Enter password length less tha 6',0);
		return false;
	} else if(ucpass == ''){
		$('#usercpassword').focus();
		showError('Enter confirm password',0);
		return false;
	} else if(ucpass !== upass){
		$('#usercpassword').focus();
		showError('Password not match',0);
		return false;
	} else {
		loader();
		var url = "Users/userCreate";
		var jsonData = {'usersID':userID,'uname':uname,'ucontact':ucontact,'uemail':uemail,'upass':upass};
		var response = callAjax(url,jsonData);
		loader();
		if(response.C == 100){
			userID = response.R;
			setUserdashboard();
		} else if(response.C == 106){
			// contact already register
			$('#usercontact').focus();
			showError('Enter contact number already register with us.',0);
			return false;
		} else if(response.C == 105){
			// email already register
			$('#useremail').focus();
			showError('Enter email already register with us.',0);
			return false;
		} else {
			// error while registration or when update already register user
			showError('Try to register again, there is some error in your connection or something else.',0);
			return false;
		}
	}
}

function getuserdetailId(id){
	var url = "Users/getUserInfo";
	var jsonData = {'usersID':userID};
	callAjaxFunction(url,jsonData,getuserdetailIdASYNC);
}

var getuserdetailIdASYNC = function(response){
	window.localStorage.removeItem("loginCache");
	if(response.C == 100){
		var result = response.R;
		userID = result.id;
		userName = result.name;
		userEmail = result.email;
		userImage = result.pimage;
		userContact = result.contact;
		userNature = result.usersProfile;
		var data = {'userNature':userNature,'userContact':userContact,'userImage':userImage,'userEmail':userEmail,'userName':userName,'userID':userID};
		window.localStorage.setItem("loginCache", JSON.stringify(data));
	} else {
		showError('Session expire. Login again');
		LogOutUser();
	}
}

function isValidEmailAddress(emailAddress) {
    var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    return pattern.test(emailAddress);
}

function setUserdashboard(){
	if(userID != ''){
		getuserdetailId(userID);
		push_register();
	}
	route_section("feed03");
	seTmenu();
}

function seTmenu(){
	if(userID != ''){
		if(userNature == 1){
			html = '<li><a href="javascript:setUserdashboard();">Home <span></span></a></li>\
			<li><a href="javascript:eventsCreated(0);">My Events <span></span></a></li>\
			<li><a href="javascript:eventsCreated(1);">Create Events <span></span></a></li>\
			<li><a href="javascript:ComingSoon(\'terms\');">Terms <span></span></a></li>\
			<li><a href="javascript:ComingSoon(\'faq\');">FAQ <span></span></a></li>\
			<li><a href="javascript:ComingSoon(\'about\');">About <span></span></a></li>\
			<li><a href="javascript:ComingSoon(\'help\');">Help <span></span></a></li>\
			<li><a href="javascript:LogOutUser();">LOGOUT <span></span></a></li>';
		} else if(userNature == 2){
			html = '<li><a href="javascript:setUserdashboard();">Home <span></span></a></li>\
			<li><a href="javascript:eventsCreated(0);">My Events <span></span></a></li>\
			<li><a href="javascript:eventsCreated(1);">Create Events <span></span></a></li>\
			<li><a href="javascript:ComingSoon(\'terms\');">Terms <span></span></a></li>\
			<li><a href="javascript:ComingSoon(\'faq\');">FAQ <span></span></a></li>\
			<li><a href="javascript:ComingSoon(\'about\');">About <span></span></a></li>\
			<li><a href="javascript:ComingSoon(\'help\');">Help <span></span></a></li>\
			<li><a href="javascript:LogOutUser();">LOGOUT <span></span></a></li>';
		} else {
			html = '<li><a href="javascript:setUserdashboard();">Home <span></span></a></li>\
			<li><a href="javascript:ComingSoon(\'terms\');">Terms <span></span></a></li>\
			<li><a href="javascript:ComingSoon(\'faq\');">FAQ <span></span></a></li>\
			<li><a href="javascript:ComingSoon(\'about\');">About <span></span></a></li>\
			<li><a href="javascript:ComingSoon(\'help\');">Help <span></span></a></li>\
			<li><a href="javascript:LogOutUser();">LOGOUT <span></span></a></li>';
		}
	} else {
		html = '<li><a href="javascript:setUserdashboard();">Home <span></span></a></li>\
		<li><a href="javascript:SignInUser();">Login <span></span></a></li>\
		<li><a href="javascript:RegisterUser();">Register <span></span></a></li>\
		<li><a href="javascript:ComingSoon(\'terms\');">Terms <span></span></a></li>\
		<li><a href="javascript:ComingSoon(\'faq\');">FAQ <span></span></a></li>\
		<li><a href="javascript:ComingSoon(\'about\');">About <span></span></a></li>\
		<li><a href="javascript:ComingSoon(\'help\');">Help <span></span></a></li>';
		
	}
	$('#menuOption').html(html);
}

function loginUser(){
	loader();
	var email  = $('#uemail').val();
	var upass = $('#upass').val();
	var url = 'Users/loginuser';
	var jsonData = {'uemail':email,'upass':upass};
	var response = callAjax(url,jsonData);
	loader();
	if(response.C == 100){
		var result = response.R;
		userID = result.id;
		if(result.profilestatus == 1){
			//profile complete to dashboard
			if(result.usersProfile == 1){
				//users is manager
				userNature = 1;
			} else if(result.usersProfile == 2){
				//users is DJ
				userNature = 2;
			} else {
				//normal users
				userNature = 0;
			}
			setUserdashboard();
		} else if(result.profilestatus == 2){
			//users block
		} else{
			completeProfile();
		}
	} else {
		showError('Username or password is wrong.',0);
		return false;
	}
}

function scan(){
	cordova.plugins.barcodeScanner.scan(
		function (result) {
			QrData(result.text);
		},function (error) {
			//alert("Scanning failed: " + error);
		},{
			// preferFrontCamera : false, iOS and Android
			// torchOn: false, Android, launch with the torch switched on (if available)
			showFlipCameraButton : true,// iOS and Android
			prompt : " ", // Android
			showTorchButton : true, // iOS and Android
			resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
			formats : "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
			orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
			disableAnimations : true, // iOS
			disableSuccessBeep: false // iOS
		}
	);
}

function QrData(txt){
	var scanData = JSON.parse(txt);
	if (isRealValue(scanData)) {
		route_section('feed04');
		setTimeout(function(){
			$('#placeqr').val(scanData.placename);
			placeLat = scanData.lat;
			placeLng = scanData.lng;
			placeUid = scanData.placeid;
			managerId = scanData.managerId;
			if(scanData.DJ == 0){
				$('#requestuser').hide();
			} else {
				$('#requestuser').show();
			}
		},200);
	} else {
		showError('Scan QR again. their is problem in scaning QR');
	}
}

function feedQrplace(){
	verfiyLocation();
	setTimeout(function(){
		route_section('feed06');
	},500);
}

function submitFeedback(){
	var name = $('#usersfeedname').val();
	var email = $('#usersfeedemail').val();
	var contact = $('#usersfeedcontact').val();
	var feed = $('textarea#usersfeedtext').val();
	
	if(email != ''){
		if(!(isValidEmailAddress(email))){
			$('#usersfeedemail').focus();
			showError('Enter valid email',0);
			return false;
		}
	}
	document.getElementById("closepopup").addEventListener("click", closefeedbackdone);
	$('#msghead').html("Feedback");
	$('#msgbody').html("You feedback successsfully sent to event manager and contact you very soon.");
	$('.popupmsg').show();
	var url = 'Users/sendFeed';
	var jsonData = {'feed':feed,'placeUid':placeUid,'contact':contact,'name':name,'userId':userID,'managerId':managerId,'email':email};
	callAjaxFunction(url,jsonData,submitFeedbackASYNC);
}

var submitFeedbackASYNC = function(){
	slide_back_remove('feed06');
}

function closefeedbackdone(){
	$('.popupmsg').hide();
	$('#msghead').html("");
	$('#msgbody').html("");
}

function songPush(){
	verfiyLocation();
	setTimeout(function(){
		route_section('feed11');
	},500);
}

function submitSongRequest(){
	var name = $('#userssongname').val();
	var email = $('#userssongemail').val();
	var contact = $('#userssongcontact').val();
	var song = $('#userssong').val();
	var artist = $('#userssongartist').val();
	
	
	var url = 'Users/sendSong';
	var jsonData = {'song':song,'artist':artist,'placeUid':placeUid,'contact':contact,'name':name,'userId':userID,'managerId':managerId,'email':email};
	//alert(JSON.stringify(jsonData));
	callAjaxFunction(url,jsonData,submitSongRequestASYNC);
}

var submitSongRequestASYNC = function(){
	route_section('feed04');
}

function deg2rad(deg) {
	return deg * (Math.PI / 180)
}

var verf;
function verfiyLocation(){
	/* var width = 0;
	clearInterval(verf);
	$('#loationMsg').removeClass('error');
	$('#loationMsg').html('We are verifying your location');
	$('#feed05').show();
	var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(LatiTude - placeLat); // deg2rad below
    var dLon = deg2rad(LongiTude - placeLng);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(placeLat)) * Math.cos(deg2rad(placeLng)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = (R * c).toFixed(1); // Distance in km
	if ($.isNumeric(d) == false) {
		d = 1001;
	}
	verf = setInterval(function() {
		if (width == 101) {
			clearInterval(verf);
			if ($.isNumeric(d)) {
				if (d <= 0.3) {
					$('#feed05').hide();
				} else (d > 0.3) {
					$('#loationMsg').addClass('error');
					$('#loationMsg').html('We are not verifying your location.');
				}
			}
		} else {
			$('#loaderVerifying').css('width', width + '%');
		}
		width += 1;
	}, 100); */
}

function feedbacks(){
	//
}

function eventsCreated(type){
	if(type == 1){
		route_section('feed12');
	} else if(type == 0) {
		getAllevent();
	}
	
}

function createEventQR(){
	var name = $('#Ceventname').val();
	var date = $('#Ceventdate').val();
	var time = $('#Ceventtime').val();
	var address1 = $('#Ceventaddress1').val();
	var address2 = $('#Ceventaddress2').val();
	var city = $('#Ceventcity').val();
	var state = $('#Ceventstate').val();
	var ctry = $('#Ceventcntry').val();
	var isDJ = $("input[name='Ceventradio']:checked").val();
	
	if(name == ''){
		$('#Ceventname').focus();
		showError('Enter event name',0);
		return false;
	} else if(date == ''){
		$('#Ceventdate').focus();
		showError('Enter event date',0);
		return false;
	} else if(time == ''){
		$('#Ceventtime').focus();
		showError('Enter event time',0);
		return false;
	} else if(address1 == ''){
		$('#Ceventaddress1').focus();
		showError('Enter event address',0);
		return false;
	} else if(city == ''){
		$('#Ceventcity').focus();
		showError('Enter event city',0);
		return false;
	} else if(state == ''){
		$('#Ceventstate').focus();
		showError('Enter event state',0);
		return false;
	} else if(ctry == ''){
		$('#Ceventcntry').focus();
		showError('Enter event country',0);
		return false;
	}
	
	
	if(isDJ == undefined){
		var isDJ = '0';
		var imDJ = '';
		var djname = '';
		var djemail = '';
	} else {
		var isDJ = '1';
		var imDJ = $("input[name='Ceventradio']:checked").val();
		var djname = $('#Ceventdjname').val();
		var djemail = $('#Ceventdjemail').val();
		if(imDJ != 'iam'){
			if(djname == ''){
				$('#Ceventdjname').focus();
				showError('Enter DJ name',0);
				return false;
			}
			if(djemail == ''){
				$('#Ceventdjemail').focus();
				showError('Enter DJ email',0);
				return false;
			}
			if(!(isValidEmailAddress(djemail))){
				$('#Ceventdjemail').focus();
				showError('Enter valid email',0);
				return false;
			}
		}
	}
	loader();
	var url = "Users/getLatLng";
	var jsonData = {"managerId":userID,"eventname":name,"address1":address1,"address2":address2,"city":city,"state":state,"ctry":ctry,"imDJ":imDJ,"isDJ":isDJ,"djname":djname,"djemail":djemail,'time':time,'date':date};
	callAjaxFunction(url,jsonData,createEventQRASYNC);
	
}

var createEventQRASYNC = function(response){
	loader();
	if(response.C == 114){
		showError('Enter valid Address',0);
		return false;
	} else if(response.C == 115){
		showError('their is an error while creating event, Try again later',0);
		return false;
	} else {
		document.getElementById("closepopup").addEventListener("click", closeeventpoup);
		$('#msghead').html("Event Created Successfull");
		$('#msgbody').html("Event Created Successfull. QR code will sent on email and you will see your event QR in my events.");
		$('.popupmsg').show();
		slide_back_remove('feed12');
	}
}

function closeeventpoup(){
	$('.popupmsg').hide();
	$('#msghead').html("");
	$('#msgbody').html("");
}

function loader(){
	if($('#loader').is(":visible")){
		$('#loader').css('display','none');
	} else {
		$('#loader').css('display','block');
	}
}

function setDjinfo(){
	if($(".djInfo").is(":visible")){
		$(".djInfo").hide();
	} else {
		$(".djInfo").show();
	}
}

function setDjdetail(type){
	if(type == 1){
		$(".djDetail").show();
	} else if(type == 0){
		$(".djDetail").hide();
	}
}

function getAllevent(){
	loader();
	var url = "Users/getAllevent";
	var jsonData = {"userId":userID};
	callAjaxFunction(url,jsonData,getAlleventASYNC);
}

var getAlleventASYNC = function(response){
	var html = '';
	route_section("feed13");
	var result = response.R;
	if(response.C == 100){
		$.each(result,function(index,value){
			html += "<li onclick='getEventDetail(\""+value.id+"\");'>\
			   <div class='songpart'>\
				  <span class='boldheading'>"+value.eventName+"</span> \
				  <span class='organiser'>by "+value.ManagerName+"</span>\
				  <span class=''>"+value.eventAddress+"</span>\
			   </div>\
			   <label><img src='images/arrow-right.svg'></label>\
			</li>";
		});
	} else {
		html += "<li>\
		   <div class='songpart'>\
			  <span class='boldheading'>There is no events</span> \
		   </div>\
		</li>";
	}
	
	$('#eventsList').html(html);
	loader();
}

function getEventDetail(id){
	loader();
	var url = "Users/eventdetail";
	var jsonData = {"userId":userID,"eveID":id};
	callAjaxFunction(url,jsonData,getEventDetailASYNC);
}

var getEventDetailASYNC = function(response){
	route_section('feed16');
	if(response.C == 100){
		var result = response.R;
		$("#Eventname").html(result.eventName);
		$("#Eventdate").html(result.eventdate);
		$("#EventTime").html(result.eventtime);
		$("#EventQr img").attr('src',result.QRpath);
		$("#EventShare").attr('onclick','shareQR(\''+result.QRpath+'\');');
		var EventDate = new Date(result.date);
		var currentDate = new Date();
		var html = '';
		if(EventDate > currentDate){
			html = "<div class='single'>Comming Soon</div>";
		} else if(EventDate <= currentDate){
			EventDate.setHours(EventDate.getHours()+10);
			if(currentDate > EventDate){
				html = "<div class='single' onclick='getAllfeedback(\""+result.id+"\")'>Feeds</div>";
			} else{
				if(result.isDJ == 1){
					html = "<div class='double first' onclick='getAllfeedback(\""+result.id+"\")'>Feeds</div><div class='double second' onclick='getAllSongRequest(\""+result.id+"\");'>Songs</div>";
				} else {
					html = "<div class='single' onclick='getAllfeedback(\""+result.id+"\")'>Feeds</div>";
				}
			}
		}
		$('#eventoptions').html(html);
	}
	
	loader();
}

function shareQR(path){
	var options = {
		message: 'Qr code to scan, send song request and feedback for the events', // not supported on some apps (Facebook, Instagram)
		subject: 'QR CODE', // fi. for email
		files: [path], // an array of filenames either locally or remotely
		url: 'https://www.websiteanpptest.com/feedquest',
		chooserTitle: 'QR SCAN' // Android only, you can override the default share sheet title
	}

	window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
}

var onSuccess = function(result) {
  console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
  console.log("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
}

var onError = function(msg) {
  console.log("Sharing failed with message: " + msg);
}

function getAllfeedback(id){
	loader();
	var url = "Users/getAllfeedback";
	var jsonData = {"userId":userID,"eveID":id};
	callAjaxFunction(url,jsonData,getAllfeedbackASYNC);
}

var getAllfeedbackASYNC = function(response){
	route_section("feed17");
	var html = '';
	if(response.C == 100){
		var result = response.R;
		$.each(result, function(index,value){
			html += "<li>\
			   <div class=\"songpart\">\
				  <div class=\"imgfeed\">\
					 <img src=\""+value.userImage+"\">\
				  </div>\
				  <span class=\"boldheading\">"+value.username+"</span> \
				  <span>"+value.feed+"</span>\
			   </div>\
			   <label><img src=\"images/arrow-right.svg\"></label>\
			</li>";
		});
	} else {
		html = "<li>\
		   <div class=\"songpart\">\
			  <span class=\"boldheading\">No feeds for this event</span>\
		   </div>\
		</li>";
	}
	$("#feedeventslist").html(html);
	loader();
}

function getAllSongRequest(id){
	loader();
	var url = "Users/getAllSongRequest";
	var jsonData = {"userId":userID,"eventId":id};
	callAjaxFunction(url,jsonData,getAllSongRequestASYNC);
}

var getAllSongRequestASYNC = function(response){
	var html = '';
	route_section("feed15");
	var result = response.R;
	if(response.C == 100){
		$.each(result,function(index,value){
			html += "<li>\
			   <div class=\"songpart\">\
				  <span class=\"boldheading\">"+value.song+"</span> \
				  <span>Artist : "+value.artist+"</span>\
				  <span>by "+value.username+"</span>\
			   </div>\
			   <div class=\"arrowdecline\">\
				  <a href=\"javascript:void(0);\" onclick=\"acceptSong('"+value.id+"',2);\" class=\"dec\"><img src=\"images/decline.svg\"></a>\
				  <a href=\"javascript:void(0);\" onclick=\"acceptSong('"+value.id+"',1);\" class=\"acc\"><img src=\"images/accept.svg\"></a>\
			   </div>\
			   <label><img src=\"images/arrow-right.svg\"></label>\
			</li>";
			
		});
	} else {
		html += "<li>\
		   <div class=\"songpart\">\
			  <span class=\"boldheading\">There is no songs request</span> \
		   </div>\
		</li>";
	}
	$('#songRequest').html(html);
	loader();
	
	$("ul.songrequest li").click(function(){
		if($(this).hasClass("songright")){
			$(this).removeClass("songright");
		} else {
			$("ul.songrequest li").removeClass('songright');
			$(this).addClass("songright");
		}
	});
}

function acceptSong(Requestid,type){
	var url = "Users/songsAccept";
	var jsonData = {"userId":userID,"Requestid":Requestid,"type":type};
	callAjaxFunction(url,jsonData,acceptSongASYNC);
	$("ul.songrequest li").removeClass('songright');
	event.stopPropagation();
}

var acceptSongASYNC = function(response){
	//alert(JSON.stringify(response));
}