var messageApi = new MessageApi();
$(function() {
	//createChatDatabase();
	//socket_connect();
});
var salt = '';

function socket_connect() {
	var id = CHAT_SENDER_USERID,
		salt = CHATSALT;
	messageApi.connect(id, salt, function(err, res) {
		//alert('CONNECT Error!');
	}, function(err, res) {
		setTimeout(function() {
			get_ofline_messages();
			setTimeout(function() {
				//addAllChats();
			}, 3000);
		}, 1000);
	});
	messageApi.connectToPersonalMessage(function(message) {
		get_personal_msg(message);
		connect_toInfoList();
	});
}

function disconnect_socket() {
	var id = '',
		salt = '';
	printLog(id + '----' + salt);
	messageApi.connect(id, salt, function(err, res) {
		printLog('Error!');
	}, function(err, res) {
		printLog('Connected!');
	});
}
var ChatTiming = '';

function connect_toInfoList() {
	messageApi.connectToInfoList(function(message) {
		clearTimeout(ChatTiming);
		//console.log(JSON.stringify(message));
		$('#userTyping').show();
		ChatTiming = setTimeout(function() {
			$('#userTyping').hide();
		}, 5000);
	});
}

function typing_user_on() {
	var ids = CHAT_receverID;
	//CHAT_SENDER_USERID+'--------'+CHAT_receverID);
	var str = $(".comment textarea").val();
	var srows = str.split(/\r\n|\r|\n/).length;
	var container = $('.comment textarea');
	var scrollHeight = container[0].scrollHeight;
	if (scrollHeight > 45 && str.length > 20) {
		var srows = parseInt(parseInt(scrollHeight) / parseInt(19));
		var txtHgt = parseInt(parseInt(30) + parseInt((parseInt(srows) * parseInt(10))));
		$(".comment textarea").height(txtHgt);
	} else {
		$(".comment textarea").height(30);
	}
	messageApi.typing(ids, function(err, res) {
		if (err) {
			printLog("Error: Go to browser console!");
			// console.log(err);
		} else {}
	});
	//var lines = $(".comment textarea").val().split("\n");  
	//alert(lines.length);
}

function get_ofline_messages() {
	url = 'Message/getAllChatData';
	jsonData = {
		'UserId': CHAT_SENDER_USERID
	};
	callAjaxFunction(url, jsonData, get_ofline_messagesSuccess);
}

function get_ofline_messagesSuccess(response) {
	alert(JSON.stringify(response));
	var queries = {};
	var c = 0;
	if (response.C == 100) {
		var result = response.R;
		var counts = {};
		$.each(result, function(index, value) {
			var message = value.message;
			var userid = U_ID;
			var friendid = message.sendrID;
			var friendname = message.sendr_name;
			var friendpic = message.sendr_pic;
			var mtime = message.time;
			if (message.picid > 0) {
				var chatPicName = stripslashes(message.post_name);
				var dbmsg = "<span class=\'product_msg_box\'><img class=\'product_img\' src=\'" + message.post_url + "\'><span class=\'product_pricename\'><label class=\'product_name\'>" + chatPicName + "</label><label class=\'product_price\'>" + message.post_price + "</label></span></span>";
			} else {
				var dbmsg = message.value;
			}
			var msg = dbmsg;
			var chat_id = message.uid;
			/*** Add User in DB **/
			var ran = Math.floor(Math.random() * 100000);
			queries[index + ran] = addChatUserQRY(userid, friendid, friendname, friendpic, chat_id);
			var ran = Math.floor(Math.random() * 1000000);
			queries[index + ran] = addUserTableQRY(userid, friendid);
			if (msg != "" && msg != null && msg != 'null') {
				counts[friendid] = (counts[friendid] || 0) + 1;
				var ran = Math.floor(Math.random() * 10000000);
				queries[index + ran] = addUserChatQRY(userid, friendid, msg, 'r', mtime);
				var ran = Math.floor(Math.random() * 100000000);
				queries[index + ran] = addUserLastChatQRY(userid, friendid, msg, mtime);
			}
		});
		$.each(counts, function(fid, unread) {
			var userid = U_ID;
			var ran = Math.floor(Math.random() * 1000000000);
			queries[fid + ran] = updateUnreadCountQRY(userid, fid, unread);
		});
		addBackupMsg(queries);
	}
}

function chat_section(frndName, frndImg) {
	FRND_NAME = frndName;
	FRND_PIC = frndImg;
	console.log(frndName + '==' + frndImg);
	$("#chat_person_msgs").removeAttr('class');
	route_section('chat_person_msgs');
	$('#FrndName').html(frndName);
	$('#PersnName').html(frndName);
	$('#frndImg').attr('src', frndImg);
	/*** Add User in DB **/
	addChatUser(U_ID, FRND_ID, FRND_NAME, FRND_PIC, CHAT_receverID);
	setTimeout(function() {
		getFriendChat(U_ID, FRND_ID);
		setTimeout(function() {
			var comment_Resize = document.querySelector('.comment textarea');
			//autosize(comment_Resize);
		}, 300);
	}, 300);
}

function changeChatArea() {
	var lines = $(".comment textarea").val().split("\n");
	alert(lines.length);
}
var chatPicImageName = '';
var chatPicImageUrl = '';
var chatPicImagePrice = '';
var chatPicImageId = 0;

function proChat_section(frndName, frndImg, isSale, imgChatId, imgChatPrice, imgChatName, imgChatSrc) {
	chatPicImageName = imgChatName;
	chatPicImageUrl = imgChatSrc;
	chatPicImagePrice = imgChatPrice;
	chatPicImageId = imgChatId;
	FRND_NAME = frndName;
	FRND_PIC = frndImg;
	console.log(frndName + '==' + frndImg);
	route_section('chat_person_msgs');
	$('#FrndName').html(frndName);
	$('#PersnName').html(frndName);
	$('#frndImg').attr('src', frndImg);
	/*** Add User in DB **/
	addChatUser(U_ID, FRND_ID, FRND_NAME, FRND_PIC, CHAT_receverID);
	setTimeout(function() {
		send_message_Frnd();
	}, 1000);
	setTimeout(function() {
		getFriendChat(U_ID, FRND_ID);
	}, 500);
}

function sendNotification(sendrID, recverID, message, Type, postURL, picid) {
	var chat_mesg = {
		'Sid': recverID,
		'sendr_pic': U_IMG,
		'sendr_name': U_NAME,
		'mesg': message,
		'sendrID': U_ID,
		'type': Type,
		'post_url': postURL,
		'picid': picid
	};
	id = recverID;
	/* messageApi.sendMessage(chat_mesg, id, 'personal', 'jgiwejfio', 1, 2, 3, 4, function (err, res) {
			if(err) {
				printLog(err);
			}else {
				printLog(res);
			}	 
			
		}); */
}

function send_message_Frnd() {
	var messge = $('#chatTextarea').val();
	//alert(CHAT_SENDER_USERID+'--------'+CHAT_receverID);
	id = CHAT_receverID;
	if (chatPicImageId > 0) {
		var picid = chatPicImageId;
		var post_url = chatPicImageUrl;
		var post_name = chatPicImageName;
		var post_price = chatPicImagePrice;
	} else {
		var picid = 0;
		var post_url = "";
		var post_name = "";
		var post_price = "";
	}
	if ($('#chatTextarea').val().trim() == '' && chatPicImageId == 0) {
		//alert('message cant be blank');
		return false;
	} else {
		var type = "chat";
		$('#chat_none').hide();
		var mtime = new Date().getTime();
		var chatTyme = chatTimeFormat(mtime);
		if (chatPicImageId > 0) {
			var slashchatPicImageName = stripslashes(chatPicImageName);
			var send_msg = '<div class="receive_user_right chat_bubble">\
				<a href="javascript:void(0);"> <img id="' + U_ID + '" src="' + U_IMG + '" onerror="onImageError(' + U_ID + ');"/> </a>\ <p class="tooltips"><span class="product_msg_box"><img class="product_img" src="' + chatPicImageUrl + '"><span class="product_pricename"><label class="product_name">' + slashchatPicImageName + '</label>\
				<label class="product_price">' + chatPicImagePrice + '</label></span></span>\
                </p><span class="chattme"> <label>' + chatTyme + '</label> </span>\
			</div>';
		} else {
			var send_msg = '<div class="receive_user_right chat_bubble">\
				<a href="javascript:void(0);"> <img id="' + U_ID + '" src="' + U_IMG + '" onerror="onImageError(' + U_ID + ');"/> </a>\ <p class="tooltips"> ' + $('#chatTextarea').val() + ' </p><span class="chattme"> <label>' + chatTyme + '</label> </span>\
			</div>';
		}
		$('#chatContainer').append(send_msg);
		$('#userTyping').hide();
		var chgt = $('#chatContainer').height();
		$("#chat_person_msgs article").scrollTop(chgt);
		var cmsg = $('#chatTextarea').val();
		$('#chatTextarea').val('');
		var chat_mesg = {
			'Sid': CHAT_receverID,
			'sendr_pic': U_IMG,
			'sendr_name': U_NAME,
			'mesg': messge,
			'sendrID': U_ID,
			'type': type,
			'picid': picid,
			'post_url': post_url,
			'post_name': post_name,
			'post_price': post_price
		};
		messageApi.sendMessage(chat_mesg, id, 'personal', 'jgiwejfio', 1, 2, 3, 4, function(err, res) {
			if (err) {
				printLog(err);
				$('.chat_under_mantain').show();
				setTimeout(function() {
					$('.chat_under_mantain').hide();
				}, 3000);
				$('#chatTextarea').val('');
			} else {
				if (chat_mesg.uid != CHAT_receverID) {
					if (cmsg.length > 20) {
						cmsg = cmsg.substring(0, 20) + '...';
					}
					var chatRowid = "#chat_row_" + FRND_ID;
					$(chatRowid + " .person_msgs").html(cmsg);
					if (res.status != 200) {
						sendChatinPush(U_ID, FRND_ID);
					}
				}
				$('#chat_none').hide();
				$('#chatTextarea').val('');
				if (chatPicImageId > 0) {
					messge = "<span class=\'product_msg_box\'><img class=\'product_img\' src=\'" + chatPicImageUrl + "\'><span class=\'product_pricename\'><label class=\'product_name\'>" + chatPicImageName + "</label><label class=\'product_price\'>" + chatPicImagePrice + "</label></span></span>";
					chatPicImageName = '';
					chatPicImageUrl = '';
					chatPicImagePrice = '';
					chatPicImageId = 0;
				}
				/**** Store message in DB ***/
				addUserChat(U_ID, FRND_ID, messge, 's', mtime);
				removeFriendOldChat(U_ID, FRND_ID);
			}
		});
	}
}
var oldMsgId = '';

function get_personal_msg(message) {
	if (message.type == "chat") {
		/******* Stre Chat DB ******
		if(oldMsgId != message.msgId){
			oldMsgId = message.msgId*/
		var mtime = message.time;
		addChatUser(U_ID, message.sendrID, message.sendr_name, message.sendr_pic, message.uid);
		if (message.picid > 0) {
			var chatPicName = stripslashes(message.post_name);
			var dbmsg = "<span class=\'product_msg_box\'><img class=\'product_img\' src=\'" + message.post_url + "\'><span class=\'product_pricename\'><label class=\'product_name\'>" + chatPicName + "</label><label class=\'product_price\'>" + message.post_price + "</label></span></span>";
		} else {
			var dbmsg = message.value;
		}
		addUserChat(U_ID, message.sendrID, dbmsg, 'r', mtime);
		if (IsAppInBackground == 1) {
			sendChatinPush(message.sendrID, U_ID);
		}
		var frndChatClass = "chat_" + message.sendrID;
		var frndChatrow = "chat_row_" + message.sendrID;
		if ($("#style_chat").hasClass('show')) {
			updateUnreadCount(U_ID, message.sendrID);
			if ($("#" + frndChatrow).length > 0) {
				var urmsg = $("#" + frndChatrow + " .unread_count").text();
				if (urmsg != '' && urmsg != 'null' && urmsg != null) {
					urmsg = parseInt(urmsg) + parseInt(1);
				} else {
					urmsg = 1;
				}
				$("#" + frndChatrow + " .unread_count").html(urmsg);
				$("#" + frndChatrow + " .unread_count").removeClass('display_none');
				$("#" + frndChatrow + " .unread_count").addClass('display_inline_block');
				$("#" + frndChatrow + " .unread_count").addClass('scale');
			} else {
				addAllChats();
			}
		} else if ($("#chat_person_msgs").hasClass(frndChatClass)) {
			var userid = U_ID;
			var friendid = message.sendrID;
			var chatTyme = chatTimeFormat(mtime);
			if (message.picid > 0) {
				var chatPicName = stripslashes(message.post_name);
				var dbmsg = "<span class=\'product_msg_box\'><img class=\'product_img\' src=\'" + message.post_url + "\'><span class=\'product_pricename\'><label class=\'product_name\'>" + chatPicName + "</label><label class=\'product_price\'>" + message.post_price + "</label></span></span>";
			} else {
				var dbmsg = message.value;
			}
			var replyTouser = '<div class="sender_user_left chat_bubble"><a href="javascript:void(0);"> <img src="' + message.sendr_pic + '"/></a>\<p class="tooltips">' + dbmsg + '</p><span class="chattme"> <label>' + chatTyme + '</label> </span>\</div>';
			var chatRowid = "#chat_row_" + friendid;
			var cmsg = message.value;
			if (cmsg.length > 20) {
				cmsg = cmsg.substring(0, 20) + '...';
			}
			$(chatRowid + " .person_msgs").html(cmsg);
			$('#chatContainer').append(replyTouser);
			var chgt = $('#chatContainer').height();
			$("#chat_person_msgs article").scrollTop(chgt);
			$('#chat_none').hide();
		} else {
			updateUnreadCount(U_ID, message.sendrID);
			var cmsg = message.value;
			if (cmsg.length > 45) {
				cmsg = cmsg.substring(0, 45) + '...';
			}
			var notificationCounts = $('#chatNotiCount').text();
			if (notificationCounts != "") {
				notificationCounts = parseInt(notificationCounts) + parseInt(1);
			} else if (notificationCounts == "9+") {
				notificationCounts = '9+';
			} else {
				notificationCounts = 1;
			}
			var counts = '';
			if (notificationCounts > 0) {
				counts = notificationCounts;
				if (counts > 9) {
					counts = '9+';
				}
				$('#chatNotiCount').html(counts);
				$('#chatNotiCount').show();
			}
			setTimeout(function() {
				addAllChats();
				var onclick = 'showFriendChat(' + message.sendrID + ',\'' + message.sendr_name + '\',\'' + message.sendr_pic + '\',\'' + message.uid + '\')';
				var topHtml = '<div class="push_noti_msg" onclick="' + onclick + '">\
											<a href="javascript:void(0);" class="user_img">\
												<img src="' + message.sendr_pic + '"/>\
											</a>\
											<label class="user_name">' + message.sendr_name + '</label>\
											<label class="action_msg">' + cmsg + '</label>\
										</div>';
				$("#topheaderNotification").html(topHtml);
				$("#topheaderNotification").show();
				$("#topheaderNotification").animate({
					'top': '0px'
				});
				setTimeout(function() {
					$("#topheaderNotification").animate({
						'top': '-120px'
					});
					$("#topheaderNotification").hide();
				}, 4000);
			}, 300);
		}
		//}
	} else {
		//
	}
}

function timeToDate(ts) {
	var d = new Date(ts);
	var mnths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	var dt = d.getDate();
	var m = mnths[d.getMonth()];
	var y = d.getFullYear();
	var datest = m + '-' + dt + '-' + y;
	return datest;
}

function chatTimeFormat(ts) {
	var d = new Date(ts);
	var mnths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	var Daysarr = ["Sun", "Mon", "Tue", "Wed", "Tur", "Fri", "Sat"];
	var seconds = Math.floor((new Date() - d) / 1000);
	var days = Math.floor(seconds / 86400);
	var day = Daysarr[d.getDay()];
	var dt = d.getDate();
	var m = mnths[d.getMonth()];
	var y = d.getFullYear();
	var hours = d.getHours();
	var minutes = d.getMinutes();
	var ampm = hours >= 12 ? 'PM' : 'AM';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0' + minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	var output = "";
	if (days > 0) {
		if (days > 7) {
			output = dt + ' ' + m + ' ' + strTime;
		} else {
			output = day + ' ' + strTime;
		}
	} else {
		output = strTime;
	}
	return output;
}

function pushNotified(data) {
	var msgtype = data.additionalData.custom.type;
	var foreground = data.additionalData.foreground;
	var picid = data.additionalData.custom.id;
	var fid = data.additionalData.custom.userid;
	var title = data.title;
	var message = data.message;
	if (msgtype == "horn" || msgtype == "comment" || msgtype == "ad") {
		var sendfid = fid;
	} else {
		var sendfid = picid;
	}
	if (sendfid != U_ID) {
		if (msgtype == "horn") {
			if (foreground) {
				updateNotifyCount();
				showTopNotificationWindow(fid, title, message, msgtype, picid);
			} else {
				setTimeout(function() {
					ImageDetaIl(picid);
				}, 500);
			}
		} else if (msgtype == "comment") {
			if (foreground) {
				updateNotifyCount();
				showTopNotificationWindow(fid, title, message, msgtype, picid);
			} else {
				setTimeout(function() {
					ImageDetaIl(picid);
				}, 500);
			}
		} else if (msgtype == "ad") {
			if (foreground) {
				//showTopNotificationWindow(fid,title,message,msgtype,picid);
			} else {
				setTimeout(function() {
					ImageDetaIl(picid);
				}, 500);
			}
		} else if (msgtype == "Join") {
			if (foreground) {
				showTopNotificationWindow(sendfid, title, message, msgtype, picid);
			} else {
				setTimeout(function() {
					ShowFriendsProfile(sendfid);
				}, 500);
			}
		} else if (msgtype == "follow") {
			if (foreground) {
				updateNotifyCount();
				showTopNotificationWindow(fid, title, message, msgtype, picid);
			} else {
				var userid = U_ID;
				setTimeout(function() {
					userProfile(userid);
				}, 500);
			}
		} else if (msgtype == "chat") {
			if (foreground) {
				get_ofline_messages();
				var frndChatClass = "chat_" + picid;
				var frndChatrow = "chat_row_" + picid;
				if ($("#style_chat").hasClass('show')) {
					if ($("#" + frndChatrow).length > 0) {
						var urmsg = $("#" + frndChatrow + " .unread_count").text();
						if (urmsg != '' && urmsg != 'null' && urmsg != null) {
							urmsg = parseInt(urmsg) + parseInt(1);
						} else {
							urmsg = 1;
						}
						$("#" + frndChatrow + " .unread_count").html(urmsg);
						$("#" + frndChatrow + " .unread_count").removeClass('display_none');
						$("#" + frndChatrow + " .unread_count").addClass('display_inline_block');
						$("#" + frndChatrow + " .unread_count").addClass('scale');
					} else {
						addAllChats();
					}
				} else if ($("#chat_person_msgs").hasClass(frndChatClass)) {
					var userid = U_ID;
					var friendid = picid;
					getFriendChat(userid, friendid);
				} else {
					var notificationCounts = $('#chatNotiCount').text();
					if (notificationCounts != "") {
						notificationCounts = parseInt(notificationCounts) + parseInt(1);
					} else if (notificationCounts == "9+") {
						notificationCounts = '9+';
					} else {
						notificationCounts = 1;
					}
					var counts = '';
					if (notificationCounts > 0) {
						counts = notificationCounts;
						if (counts > 9) {
							counts = '9+';
						}
						$('#chatNotiCount').html(counts);
						$('#chatNotiCount').show();
					}
					setTimeout(function() {
						addAllChats();
						showTopNotificationWindow(0, title, message, msgtype, picid);
					}, 500);
				}
			} else {
				setTimeout(function() {
					get_ofline_messages();
					setTimeout(function() {
						updateTotalUnreadCounts();
						AllChatsWindow();
					}, 1200);
				}, 300);
			}
		}
	}
}

function openfriendsChat(friend_id) {
	$("#chat_row_" + friend_id).click();
}

function updateNotifyCount() {
	var notificationCounts = $('#NotiCount').text();
	if (notificationCounts != "") {
		notificationCounts = parseInt(notificationCounts) + parseInt(1);
	} else if (notificationCounts == "9+") {
		notificationCounts = '9+';
	} else {
		notificationCounts = 1;
	}
	var counts = '';
	if (notificationCounts > 0) {
		counts = notificationCounts;
		if (counts > 9) {
			counts = '9+';
		}
		$('#NotiCount').html(counts);
		$('#NotiCount1').html(counts);
		$('#NotiCount').show();
		$('#NotiCount1').show();
	}
}
var NOTIFYTITLE = '';
var NOTIFYMSG = '';
var NOTIFYTYPE = '';
var NOTIFYID = '';

function showTopNotificationWindow(fid, title, message, type, id) {
	NOTIFYTITLE = title;
	NOTIFYMSG = message;
	NOTIFYTYPE = type;
	NOTIFYID = id;
	if (type == "horn" || type == "comment" || type == "ad") {
		fid = fid;
	} else {
		fid = id;
	}
	var url = 'users/getUsersName';
	var jsonData = {
		'ID': fid,
		'type': type
	};
	callAjaxFunction(url, jsonData, showTopNotificationWindowSuccess);
}

function showTopNotificationWindowSuccess(data) {
	if (data.C == 100) {
		var uimg = data.R.pimg;
	} else {
		var uimg = "images/user.png";
	}
	if (NOTIFYTYPE == "horn") {
		var onclick = "ImageDetaIl(" + NOTIFYID + ");";
	} else if (NOTIFYTYPE == "comment") {
		var onclick = "ImageDetaIl(" + NOTIFYID + ");";
	} else if (NOTIFYTYPE == "ad") {
		var onclick = "ImageDetaIl(" + NOTIFYID + ");";
	} else if (NOTIFYTYPE == "follow") {
		var userid = U_ID;
		var onclick = "userProfile(" + userid + ");";
	}
	var topHtml = '<div class="push_noti_msg" onclick="' + onclick + '">\
							<a href="javascript:void(0);" class="user_img">\
								<img src="' + uimg + '"/>\
							</a>\
							<label class="user_name">' + NOTIFYTITLE + '</label>\
							<label class="action_msg">' + NOTIFYMSG + '</label>\
						</div>';
	$("#topheaderNotification").html(topHtml);
	$("#topheaderNotification").show();
	$("#topheaderNotification").animate({
		'top': '0px'
	});
	setTimeout(function() {
		$("#topheaderNotification").animate({
			'top': '-120px'
		});
		$("#topheaderNotification").hide();
	}, 4000);
	NOTIFYTITLE = '';
	NOTIFYMSG = '';
	NOTIFYTYPE = '';
	NOTIFYID = '';
}