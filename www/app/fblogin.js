	function fblogin() {
        loader(1);
		facebookConnectPlugin.logout(fblogoutsuccess, fblogouterror);
		var permissions = [];
		var audience = '';
		permissions[0] = 'email';
		permissions[1] = 'public_profile';
		permissions[2] = 'user_friends';
		facebookConnectPlugin.login(permissions, fbSuccess, fbError);
	}

	function fbSuccess(response) {
		FbId = response.authResponse.userID;
		FbToken = response.authResponse.accessToken;
		$('.facebook').hide();
		$('.black_layer').show();
		facebookConnectPlugin.api("/me?fields=email,first_name,last_name,gender,picture.width(800).height(800)", [], fbData, fbError);
	}

	function fbData(response) {
		FbName = response.first_name + ' ' + response.last_name;
		ImgUser = response.picture.data.url;

		if (response.email) {
			FbEmail = response.email;
		} else {
			FbEmail = '';
		}
		SignInDirect('fb');
	}

	function fbError(response) {
		showNotifications("There is some problem in Facebook Login. Please check your Internet connectivity or Facebook and try again.", 0);
	}
	
	function fblogoutsuccess(response) {
		//alert(JSON.stringify(response));
	}

	function fblogouterror(response) {
		//alert(JSON.stringify(response));
	}

	/* GOOGLE */
	
	var googleapi = {
		authorize: function(options) {
			var deferred = $.Deferred();
			 //Build the OAuth consent page URL
			var authUrl = 'https://accounts.google.com/o/oauth2/auth?' + $.param({
				client_id: options.client_id,
				redirect_uri: options.redirect_uri,
				response_type: 'code',
				scope: options.scope
			});

			//Open the OAuth consent page in the InAppBrowser
			var authWindow = window.open(authUrl, '_blank', 'location=no,toolbar=no');

			//The recommendation is to use the redirect_uri "urn:ietf:wg:oauth:2.0:oob"
			//which sets the authorization code in the browser's title. However, we can't
			//access the title of the InAppBrowser.
			//
			//Instead, we pass a bogus redirect_uri of "http://localhost", which means the
			//authorization code will get set in the url. We can access the url in the
			//loadstart and loadstop events. So if we bind the loadstart event, we can
			//find the authorization code and close the InAppBrowser after the user
			//has granted us access to their data.
			$(authWindow).on('loadstart', function(e) {
				var url = e.originalEvent.url;
				var code = /\?code=(.+)$/.exec(url);
				var error = /\?error=(.+)$/.exec(url);

				if (code || error) {
					//Always close the browser when match is found
					authWindow.close();
				}

				if (code) {
					//Exchange the authorization code for an access token
					$.post('https://accounts.google.com/o/oauth2/token', {
						code: code[1],
						client_id: options.client_id,
						client_secret: options.client_secret,
						redirect_uri: options.redirect_uri,
						grant_type: 'authorization_code'
					}).done(function(data) {
						deferred.resolve(data);

						$("#loginStatus").html('Name: ' + data.given_name);
					}).fail(function(response) {
						deferred.reject(response.responseJSON);
					});
				} else if (error) {
					//The user denied access to the app
					deferred.reject({
						error: error[1]
					});
				}
			});

			return deferred.promise();
		}
	};
	var accessToken;
	var UserData = null;

	function signingoogle() {
        loader(1);
		//  alert('starting');
		googleapi.authorize({
			client_id: '79160522678-3gmiugqlfrs2n860qie3bushtdh4kmfr.apps.googleusercontent.com',
			client_secret: 'tkyWH0ON-VUCfX3KNxcXQ9jp',
			redirect_uri: 'http://localhost',
			scope: 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email'
		}).done(function(data) {
			accessToken = data.access_token;
			// $loginStatus.html('Access Token: ' + data.access_token);
                setTimeout(function(){getDataProfile()},1000);
		});
	}
	
	// This function gets data of user.
	function getDataProfile() {
        loader(1);
        //alert(accessToken);
		var term = null;
		$.ajax({
			url: 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + accessToken,
			type: 'GET',
			data: term,
			dataType: 'json',
			error: function(jqXHR, text_status, strError) {
               //alert(JSON.stringify(jqXHR));
               //alert(JSON.stringify(text_status));
               //alert(JSON.stringify(strError));
               disconnectUser();
			},
			success: function(data) {
				var item;
				console.log(JSON.stringify(data));
				//alert(JSON.stringify(data));
				// Save the userprofile data in your localStorage.
				/* localStorage.gmailLogin = "true";
				localStorage.gmailID = data.id;
				localStorage.gmailEmail = data.email;
				localStorage.gmailFirstName = data.given_name;
				localStorage.gmailLastName = data.family_name;
				localStorage.gmailProfilePicture = data.picture;
				localStorage.gmailGender = data.gender; */
				disconnectUser();
				GoogleName = data.given_name+' '+data.family_name;
				GoogleEmail = data.email;
				GoogleId = data.id;
				ImgUser = data.picture;
				SignInDirect('google');
			}
		});
	}

	function disconnectUser() {
		var revokeUrl = 'https://accounts.google.com/o/oauth2/revoke?token=' + accessToken;
        //alert(accessToken);
		// Perform an asynchronous GET request.
		$.ajax({
			type: 'GET',
			url: revokeUrl,
			async: false,
			contentType: "application/json",
			dataType: 'jsonp',
			success: function(nullResponse) {
				// Do something now that user is disconnected
				// The response is always undefined.
				accessToken = null;
				console.log(JSON.stringify(nullResponse));
				console.log("-----signed out..!!----" + accessToken);
			},
			error: function(e) {
				// Handle the error
				// console.log(e);
				// You could point users to manually disconnect if unsuccessful
				// https://plus.google.com/apps
			}
		});
	}
