var SERVICE_PATH = "http://www.websitenapptest.com/feedquest/index.php/";
var IMAGE_URL = "http://www.websitenapptest.com/feedquest/QR/";
var RETRYAJAXURL  = '';
var RETRYAJAXDATA = '';
var RETRYAJAXASYNC = 0;
var RETRYAJAXFUNCTION = '';
var LatiTude = '';
var LongiTude = '';
var url;
var jsonData;
var FbId = '';
var FbName = '';
var FbEmail = '';
var FbToken = '';
var GoogleId = '';
var GoogleName = '';
var GoogleEmail = '';
var GoogleId = '';
var ImgUser = '';
var loginVia = '';
var userID = '';
var userName = '';
var userEmail = '';
var userImage = '';
var userContact = '';
var userNature = '';
var notificationstart = '';
var notificationend = '';
var placeLat = '';
var placeLng = '';
var placeUid = '';
var managerId = '';
/* 
	1 = MANAGER
	2 = DJ
	0 = NORMAL
 */

function callAjax(url, jsonData) {
	
	jsonData['mobile'] = 'mobile';
	
	RETRYAJAXURL  = url;
	RETRYAJAXDATA = jsonData;
	RETRYAJAXASYNC = 0;
	RETRYAJAXFUNCTION = '';
	
	
	
	var result = '';
	$.ajax({
		url: SERVICE_PATH + url,
		type: 'POST',
		async: false,
		data: jsonData,
		dataType: 'json',
		tryCount : 0,
		retryLimit : 1,
		success: function(response) {
			result = response;
		},
		error : function(xhr, textStatus, errorThrown ) {
			return;
		}
	});
	return result;
}

var ASYNC_AJAX_REUEST;

function callAjaxFunction(url, jsonData, funcToExecute) {
	
	jsonData['mobile'] = 'mobile';
	
	if(ASYNC_AJAX_REUEST !='' && ASYNC_AJAX_REUEST != undefined && ASYNC_AJAX_REUEST != null){
		ASYNC_AJAX_REUEST.abort();
	}
	
	RETRYAJAXURL  = url;
	RETRYAJAXDATA = jsonData;
	RETRYAJAXASYNC = 1;
	RETRYAJAXFUNCTION = funcToExecute;
	var result = '';
	
	setTimeout(function(){
		ASYNC_AJAX_REUEST = $.ajax({
			url: SERVICE_PATH + url,
			type: 'POST',
			data: jsonData,
			dataType: 'json',
			tryCount : 0,
			retryLimit : 1,
			success: function(response) {
				result = response;
				funcToExecute(result);
			},
			error : function(xhr, textStatus, errorThrown ) {
				return;
			}
		});
		return result;
	},300);	
}

function retryAjax(){
	setTimeout(function(){
		if(RETRYAJAXASYNC == 1){
			callAjaxFunction(RETRYAJAXURL, RETRYAJAXDATA,RETRYAJAXFUNCTION);
		} else {
			callAjax(RETRYAJAXURL, RETRYAJAXDATA);
		}
	},1000);
}

function printLog(arg){
	//forge.logging.log(arg);
}