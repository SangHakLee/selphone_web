/**
* @logincheck.js selphone api server's whether employee account or not login.
*
* @author david Lim
* @version 1.1
* @doc path script/custom/logincheck.js
*/

var TARGET_EMPLOYEE = '/employees';

function sessionCheckReq(){
	// console.log('loading loginCheck ');

	/*
	$.holdReady([true/false])
	true면 DOM load를 멈추고 script 실행
	*/
	$.holdReady(true);
	var sAddress = 'http://54.178.140.51';
	// var sAddress = 'http://api.selphone.co.kr';
	$.ajax({
		//type:'GET',
		url: sAddress + TARGET_EMPLOYEE+ '/check_isLogin',
		crossDomain: true,
	 	cache: false,
	 	contentType: 'json',
	 	processData:false,
	 	xhrFields: {withCredentials: true},
		complete:function(response, isSuccess){
			// console.log('response : ', response);
			// console.log('isSuccess : ', isSuccess);

			if(response.status == 200){ //response not fail,

				if(typeof(response) == 'object'){
					//login.html assert function
					assert(response.responseJSON.is_login, response.responseJSON.user_id);

				}
				//IE low version의 경우 application/json header parsing을 못하므로
				else{
					var fucktheie = $.parseJSON(response);
					assert(fucktheie.responseJSON.is_login, response.responseJSON.user_id);
				}

			}else{
				alert('서버 error : 담당자에게 문의');
			}

		}
	});

}

