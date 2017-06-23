var MessageApi = function () {
  var self        = this,
      socket      = null,
      credentials = {};

  self.connect = function (_userId, _shaSalt, cbErr, cbSuccess) {
    credentials = {
      userId: _userId,
      shaSalt: _shaSalt
    }

	socket = socketCluster.connect({hostname: 'stylehorn.com',port: 82, secure:true,portocol: 'https'});
	
    socket.on('error', cbErr);

    socket.on('connect', function (status) {
      cbSuccess(status);
    });
  }

  self.typing = function (ids, cb) {
    var compiledMessage = {
          type:     'typing',
          uid:      credentials.userId,
          time:     Date.now()
        };
    for(var i = 0; i < typing; i++) {
        socket.publish(ids[i] + '_info', compiledMessage, cb);
    }
  }

  self.getBackupMessages = function (cb) {
    var params = {
      credentials: credentials
    }
    socket.emit('getBackupMessages', params, cb);
  }

  self.connectToPersonalMessage = function (cb) {
    var ch = socket.subscribe(credentials.userId + "_personal");
        ch.watch(cb);
  };

  self.connectToContactList = function (cb) {
    var ch = socket.subscribe(credentials.userId + "_contacts");
        ch.watch(cb);
  };

  self.connectToInfoList  = function (cb) {
    var ch = socket.subscribe(credentials.userId + "_info");
        ch.watch(cb);
  }

  self.getContactList = function (cb) {
    socket.emit('getContactList', credentials, cb);
  };

  self.getGroupList = function (cb) {
    socket.emit('getGroupList', credentials, cb);
  };

  self.addUserToContactList = function (userId, cb) {
    var params = {
      userId: userId,
      credentials: credentials
    }
    socket.emit('addUserToContactList', params, cb);
  };

  self.creatGroup = function (groupName, gIcon, cb) {
    var params = {
      credentials: credentials,
      groupName:   groupName,
      groupIcon:   gIcon
    }
    socket.emit('creatGroup', params, cb);
  };

  self.addUserToAGroup = function (groupId, userId, cb) {
    var params = {
      credentials: credentials,
      groupId: groupId,
      userId: userId
    }
    socket.emit('addUserToAGroup', params, cb);
  };

  self.findGroup = function (gId, cb) {
    var params = {
      credentials: credentials,
      gId:     gId
    }
    socket.emit('findGroup', params, cb)
  }

  self.removeUserFromAGroup = function (groupId, userId, cb) {
    var params = {
      credentials: credentials,
      groupId: groupId,
      userId: userId
    }
    socket.emit('removeUserFromAGroup', params, cb);
  };


  self.sendMessage = function (message, id, type, upin, fType, mType, flink, pType, cb) {
  /*   if(!['personal', 'group'].contains(type)) {
      throw 'NO SUCH TYPE!';
    } */
	var   params  = {
            credentials: credentials,
            upin:        upin,
            id:          id,
            channelName: id + '_' + type,
            compiledMessage: {
              fType:    fType,
              mType:    mType,
              flink:    flink,
              pType:    pType,
              type:     message.type,
              value:    message.mesg,
              uid:      credentials.userId,
              time:     Date.now(),
			  recever_id: id,
			  sendr_pic:  message.sendr_pic,
			  sendrID :   message.sendrID,
			  post_url	:message.post_url,
			  post_price :message.post_price,
			  post_name	:message.post_name,
			  picid		:message.picid,
			  sendr_name: message.sendr_name,
			  msgId : Date.now() + Math.floor( Math.random() * 100000 )
            }
          }
    socket.publish(params.channelName, params.compiledMessage, function () {
          socket.emit('sendMessage', params, cb);
    });
  }

  self.removeGroup = function (gId, cb) {
    var params = {
      credentials: credentials,
      gId: dId
    }

    socket.emit('removeGroup', params, cb);
  }

  self.subscribe = function (data, cb) {
    var channel = socket.subscribe(data);

    channel.on('subscribeFail', function (err) {
      console.log('Failed to subscribe to ' + channelName + ' channel due to error: ' + err);
    });

    channel.watch(function (message) {
      cb(message);
    });
  }
}
