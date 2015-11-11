//employee 로그인
console.log('loginjs ready');

/*POST parameter serializing*/
function serializing(fName){
	var f = fName;
	var numberElements = fName.elements.length;
	var param = "";
	for(var i = 0; i < numberElements; i++){
		if(i < numberElements -1){
			param += f.elements[i].name + "=" + encodeURIComponent(f.elements[i].value) + "&";
		}else{
			param += f.elements[i].name + "=" + encodeURIComponent(f.elements[i].value);
		}
	}

	return param;
};

/*
	loginReq 관리자 로그인 요청
	@e : event object
*/
function loginReq(e){
	var formData = $('#form_login').serialize();
	var check = formCheck($('#form_login')[0]);

	if(check){
		ajaxLogin(formData, e, '/login', loginRes);
	}else{
		alert('실패');
		return;
	}
};

/*
	loginRes 관리자 로그인 요청 응답 처리
	@response : 응답
*/
function loginRes(response){
	if(response.status == 200){
		location.href= "./post_jungoform.html";
	}else{

		var error_code = response.responseJSON.error_code;
		var error_description = response.responseJSON.error_description;

		$('#box_summary span').text('[' + error_code +']' + '실패 : ' + error_description);
		return;
	}
};

/*
	logoutReq 관리자 로그아웃 요청
	@thisElem :
*/
function logoutReq(e){
	console.log('logoutReq e', e);
	ajaxLogin(null, e, '/logout', logoutRes);
};

/*
logoutRes 관리자 로그아웃 응답 처리
*/
function logoutRes(response){
	if(response.status == 200 ){
		$('#box_logout').attr('class', 'hidden');
		$('#box_input').attr('class', 'ondisplay');
		$('#box_login').attr('class', 'ondisplay');
		location.href="./login.html";
	}
};

/*
employeeJoin 관리자 등록 요청
*/
function employeeJoin(e){
	var formData = $('#form_join').serialize();
	var check = formCheck($('#form_join')[0]);

	if(check){
		ajaxLogin(formData, e, EMPLOYEE + '/join', loginSuccessRes);
	}else{
		alert('실패');
		return;
	}
}

function employJoin(response){
	if(response.status == 200){
		alert('등록 성공');
	}
};
