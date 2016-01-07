// var googleUser = {};
var startApp = function(callback) {
  gapi.load('auth2', function(){
    auth2 = gapi.auth2.init({
      client_id: '175032780584-dtio8mn52t1n2jg97bickkcvfmlftvtk.apps.googleusercontent.com',
      cookiepolicy: 'single_host_origin',
      scope: 'profile'
    });
    attachSignin(document.getElementById('customBtn'), callback);
  });
};

var attachSignin = function(element, callback) {
	auth2.attachClickHandler(
		element,
		{},
		function(googleUser){
			authSuccess(googleUser, callback)
    	},
		function(error){
    		alert(JSON.stringify(error, undefined, 2));
		}
	);
};

var authSuccess = function(googleUser, callback){
  callback(googleUser.getAuthResponse().access_token);
};

function loginWithGoogle(callback){
    startApp(function(accessToken){
	    console.log('access_token', accessToken);
	    var data = {
	        "accessToken":accessToken,
	        "type" : "google",
	        "regId" : "web"
	    };
	    $.ajax({
	        url: "http://54.178.140.51/login",
	        type : "post",
	        data : data,
	        crossDomain : true,
	        xhrFields: {withCredentials: true}, // 이게 세션 유지하는거
	        success: function(res) {
		        console.log('success', res.result);
	          	callback(true, res)
	        },
	        error: function(res) {
	          	callback(false, res.responseText)
	          	alert("로그인 실패"+res.responseText);
	        }
	    });
    });
}
