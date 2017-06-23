var SQLSQLDB;
var databaseName = "ChatAppDatabase"; 
var databasedetails = "Chat App Database"; 
var CHATUSERID;
var CHATFRIENDID;
var CHATFRIENDNAME;
var CHATFRIENDPIC;
var FRIENDSCHATID;
var CHATMSG;
var CHATMTYP;
var CHATTIME;
function createChatDatabase(){
	SQLDB = window.openDatabase(databaseName, "1.0", databasedetails, 2000000);
	SQLDB.transaction(createTables, errorChat, successChat);
}

function createTables(tx){
	tx.executeSql('CREATE TABLE IF NOT EXISTS users_chats (id INTEGER PRIMARY KEY   AUTOINCREMENT, user_id, friend_id unique, friend_name, friend_pic, friend_chatid, ctime, last_msg, unread)');
}

function errorChat(tx, err){ alert("Error!"); alert(JSON.stringify(err)); }
function successChat(){ alert("success!"); }
 
function addChatUser(userid,friendid, friendname, friendpic, friendchatid){
	CHATUSERID = userid;
	CHATFRIENDID = friendid;
	CHATFRIENDNAME = friendname;
	CHATFRIENDPIC = friendpic;
	FRIENDSCHATID = friendchatid;
	SQLDB.transaction(addUserinSQLDB, errorChat, successUserSQLDB);
}

function addChatUserQRY(userid,friendid, friendname, friendpic, friendchatid){
	var ctime 	= new Date().getTime();
	var query   =  'INSERT INTO users_chats (user_id, friend_id, friend_name, friend_pic, friend_chatid, ctime,last_msg,unread) VALUES ("'+userid+'", "'+friendid+'", "'+friendname+'", "'+friendpic+'", "'+friendchatid+'", "'+ctime+'","",0)';
	return query;
}

function addUserinSQLDB(tx){
	var ctime 	= new Date().getTime();
	
	tx.executeSql('INSERT INTO users_chats (user_id, friend_id, friend_name, friend_pic, friend_chatid, ctime,last_msg,unread) VALUES ("'+CHATUSERID+'", "'+CHATFRIENDID+'", "'+CHATFRIENDNAME+'", "'+CHATFRIENDPIC+'", "'+FRIENDSCHATID+'", "'+ctime+'","",0)');
	
	var tablename = 'chat_'+CHATUSERID+'_'+CHATFRIENDID;
	var query = 'CREATE TABLE IF NOT EXISTS '+tablename+' (mid INTEGER PRIMARY KEY   AUTOINCREMENT, msg, mtype, mtime)';
	tx.executeSql(query);
}

function successUserSQLDB() {
	/*alert("successUserSQLDB!");*/
}

var CHATMSGPRO = 0;
function addUserChat(userid, friendid, msg, mtype,mtime,pro){
	CHATUSERID		= userid;
	CHATFRIENDID	= friendid;
	CHATMSG			= msg;
	CHATMTYP		= mtype;
	CHATTIME		= mtime;
	CHATMSGPRO 		= pro;
	SQLDB.transaction(addUserChatDB, errorChat, successUserSQLDB);
}

function addUserTableQRY(userid, friendid){
	var tablename = 'chat_' + userid + '_' + friendid;
	var query = 'CREATE TABLE IF NOT EXISTS '+tablename+' (mid INTEGER PRIMARY KEY   AUTOINCREMENT, msg, mtype, mtime)';
	return query;
}

function addUserChatQRY(userid, friendid, msg, mtype,mtime){
	var tablename = 'chat_' + userid + '_' + friendid;
	var query = 'INSERT INTO '+tablename+' (msg, mtype, mtime) VALUES ("'+msg+'", "'+mtype+'", "'+mtime+'")';
	return query;
}

function addUserChatDB(tx){
	var tablename = 'chat_' + CHATUSERID + '_' + CHATFRIENDID;
	var query = 'CREATE TABLE IF NOT EXISTS '+tablename+' (mid INTEGER PRIMARY KEY   AUTOINCREMENT, msg, mtype, mtime)';
	tx.executeSql(query);
	
	if(CHATMSG !='' && CHATMSG != null && CHATMSG != 'null' ){
		var query = 'INSERT INTO '+tablename+' (msg, mtype, mtime) VALUES ("'+CHATMSG+'", "'+CHATMTYP+'", "'+CHATTIME+'")';
		tx.executeSql(query);
		
		CHATMSG = strip_tags(CHATMSG);
		CHATMSG = CHATMSG.substring(0, 20) + '...';
		var query = 'UPDATE users_chats SET ctime="'+CHATTIME+'", last_msg="'+CHATMSG+'" WHERE user_id="'+CHATUSERID+'" AND friend_id="'+CHATFRIENDID+'"';
		tx.executeSql(query);
	}
}

function strip_tags(input) {
  allowed = '';	
  allowed = (((allowed || '') + '')
      .toLowerCase()
      .match(/<[a-z][a-z0-9]*>/g) || [])
    .join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
  var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
    commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
  return input.replace(commentsAndPhpTags, '')
    .replace(tags, function($0, $1) {
      return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
}

function addUserLastChatQRY(userid, friendid, msg, mtime){
	var query = 'UPDATE users_chats SET ctime="'+mtime+'", last_msg="'+msg+'" WHERE user_id="'+userid+'" AND friend_id="'+friendid+'"';
	return query;
}

function updateUnreadCount(userid, friendid){
	CHATUSERID   = userid;	
	CHATFRIENDID = friendid
	SQLDB.transaction(updateUnreadCountDB, errorChat, successChat);
}

function updateUnreadCountQRY(userid, friendid,unreadcounts){
	var query = 'UPDATE users_chats SET unread="'+unreadcounts+'" WHERE user_id="'+userid+'" AND friend_id="'+friendid+'"';
	return query;
}

function updateUnreadCountDB(tx){
	var query = 'SELECT unread FROM  users_chats WHERE user_id="'+CHATUSERID+'" AND friend_id="'+CHATFRIENDID+'"';
	tx.executeSql(query, [], updateUnreadCountDBSuccess, errorChat);
}

function updateUnreadCountDBSuccess(tx, results){
	var dbChats = {};
	var len = results.rows.length;
	for (var i=0; i<len; i++){
		var unreadcount = results.rows.item(i).unread;
	}
	if(unreadcount !='' && unreadcount != null && unreadcount != 'null' ){
		unreadcount = parseInt(unreadcount) + parseInt(1);
	} else {
		unreadcount = 1;
	}
	var query = 'UPDATE users_chats SET unread="'+unreadcount+'" WHERE user_id="'+CHATUSERID+'" AND friend_id="'+CHATFRIENDID+'"';
	tx.executeSql(query);
}	

function getChatList(userid){
	CHATUSERID = userid;	
	SQLDB.transaction(getUserChatsDB, errorChat, successChat);
}

function getUserChatsDB(tx){
	var query = 'SELECT * FROM  users_chats WHERE user_id="'+CHATUSERID+'" ORDER BY ctime DESC';
	tx.executeSql(query, [], getUserChatsDBSuccess, errorChat);
}

function getUserChatsDBSuccess(tx, results){
	var dbChats = {};
	var len = results.rows.length;
	for (var i=0; i<len; i++){
		
		var chatMSG = {
						"friendid":results.rows.item(i).friend_id,
						"friendname":results.rows.item(i).friend_name,
						"friendpic":results.rows.item(i).friend_pic,
						"friend_chatid":results.rows.item(i).friend_chatid,
						"last_msg":results.rows.item(i).last_msg,
						"ctime":results.rows.item(i).ctime,
						"unread":results.rows.item(i).unread
					};
		dbChats[results.rows.item(i).friend_id] = chatMSG;
	}
	
	showChatList(dbChats);
}


function getFriendChat(userid,friendid){
	CHATUSERID = userid;
	CHATFRIENDID = friendid;
	SQLDB.transaction(getFriendChatsDB, errorChat, successChat);
	removeFriendOldChat(userid,friendid);
}

function getFriendChatsDB(tx){
	var tablename = 'chat_'+CHATUSERID+'_'+CHATFRIENDID;
	var query = 'SELECT * FROM  '+tablename+' ORDER BY mid DESC';
	tx.executeSql(query, [], getFriendChatsDBSuccess, errorChat);
}

function getFriendChatsDBSuccess(tx, results){
	var dbChats = {};
	var len = results.rows.length;
	for (var i=0; i<len; i++){
		var chatMSG = {
						"msg":results.rows.item(i).msg,
						"mtype":results.rows.item(i).mtype,
						"mtime":results.rows.item(i).mtime
					};
		dbChats[results.rows.item(i).mid] = chatMSG;
	}
	showFriendChatgMsg(dbChats);
	var query = 'UPDATE users_chats SET unread="'+unreadcount+'" WHERE user_id="'+CHATUSERID+'" AND friend_id="'+CHATFRIENDID+'"';
	tx.executeSql(query);
}

function removeFriendChat(userid, friendid){
	CHATUSERID = userid;
	CHATFRIENDID = friendid;
	SQLDB.transaction(removeFriendChatsDB, errorChat, successChat);
}

function removeFriendChatsDB(tx){
	var tablename = 'chat_'+CHATUSERID+'_'+CHATFRIENDID;
	var query = 'DROP TABLE '+tablename;
	tx.executeSql(query);
	
	var query = 'DELETE FROM users_chats WHERE user_id="'+CHATUSERID+'" AND friend_id="'+CHATFRIENDID+'"';
	tx.executeSql(query);
}
var SQLQUERIES = {};
function addBackupMsg(queries){
	SQLQUERIES = queries;
	SQLDB.transaction(addBackupMsgDB, errorChat, successChat);
}

function addBackupMsgDB(tx){
	if(isRealValue(SQLQUERIES)){
		$.each(SQLQUERIES, function(i,query){
			tx.executeSql(query);
		});
	}
}

function updateTotalUnreadCounts(){
	SQLDB.transaction(updateTotalUnreadCountsDB, errorChat, successChat);
}

function updateTotalUnreadCountsDB(tx){
	var query = 'SELECT SUM(unread) AS totals FROM  users_chats';
	tx.executeSql(query, [], updateTotalUnreadCountsDBSuccess, errorChat);
}

function updateTotalUnreadCountsDBSuccess(tx, results){
	var dbChats = {};
	var len = results.rows.length;
	var totals = 0;
	for (var i=0; i<len; i++){
		totals = results.rows.item(i).totals;
	}
	
	if(totals > 0){
		if(totals > 9){
			totals = "9+";
		}
		$('#chatNotiCount').html(totals);
		$('#chatNotiCount').show();
	} else {
		$('#chatNotiCount').html('');
		$('#chatNotiCount').hide();
	}
}

function removeFriendOldChat(userid, friendid){
	CHATUSERID = userid;
	CHATFRIENDID = friendid;
	SQLDB.transaction(removeFriendOldChatDB, errorChat, successChat);
}

function removeFriendOldChatDB(tx){
	var tablename = 'chat_'+CHATUSERID+'_'+CHATFRIENDID;
	var query = 'DELETE FROM '+tablename+' WHERE mid NOT IN (SELECT mid FROM '+tablename+' order by mid DESC limit 0, 500)';
	tx.executeSql(query);
}
