var loginUserInfo={};
//DEV
var sAddress = 'http://54.178.140.51';

// PRD
// var sAddress = 'http://api.selphone.co.kr';

alert("서버 : "+sAddress)

/*store_id, store_name, current_ids, current_name*/
var store_info = {};
var myProduct = [];
var eachProductModels = [];
//Cookies.set('_id', store_info.store_id);

//file loaded event
$(document).ready(function(){
	console.log('dev_jquery ready');

	var current_ids;

	/*
	업체/지점 아이디 value가 변경되는 이벤트
	선택해서 변경된 현재 value를 current_ids에 저장, 사용
	선택 업체가 지점인 경우, 본점의 업체메시지를 변경하지 못하도록 변경
	*/
	$('#managed_ids').change(function(){
		current_ids = $(this).val();
		alert('아이디 [' + current_ids + ']를 선택하셨습니다. 해당 업체 매입가격을 조회하시려면 가격조회를 누르세요');
		store_info.current_ids = current_ids;
		console.log('text : ', this.form);

		/*
		로그인한 업체가 수정하려는 업체와 다른경우 본점의 메시지 변경이 불가능
		*/
		if(store_info.store_id != current_ids){
			//업체메시지 textarea readonly로 변경
			$('#result_message').attr('readonly', 'readonly').css('background', '#dcdcdc');
			//onclick block
			$('#btn_message').attr('onclick', '');
		}else{
			//현재 로그인한 업체라면 textarea의 readonly 속성 제거
			$('#result_message').removeAttr('readonly', 'readonly').css('background', '#FFFFFF');
			//onclick function 부여
			$('#btn_message').attr('onclick', 'javascript:messageReq();');
		}
	});

});


function ajaxRequest(reqType, targetUrl, param, successCallback){
	$.ajax({
		url: sAddress + targetUrl,
		type:reqType,
		dataType:'json',
		crossDomain: true,
		data:param,
		xhrFields: {withCredentials: true},
		beforeSend: function(xhr){
		 	xhr.setRequestHeader('Cookie', store_info.store_id);
		},
		success: function(response, isSuccess, status){
			successCallback(response, isSuccess, status.status);
		},
		error: function(errRes, status, what){
			console.log('errRes : ', errRes);
			console.log('typeof errRes : ', typeof(errRes));
			var stringToJSON = JSON.parse(errRes.responseText);
			failRes(stringToJSON, status);
		}
	});
};

/*
server response error handleling
*/
function failRes(result, statusString){
	switch(result.error_code){
		case 912 :
			alert('없는 ID입니다. 셀폰에 문의해주세요');
		break;
		case 915 :
			alert('오류입니다. 다시 시도해주세요');
		break;
		case 201 :
			//ID, PW error
			alert(result.error_description);
		break;
		default:
			alert('알 수 없는 에러');
		break;
	}
};

/*
loginReq success
*/
function loginRes(result, isSuccess, status){

	var obj = result.result; //result.result에 응답 있음
	store_info.store_id = obj.store_id;  //store_id를 가지고 있자
	store_info.store_name = obj.store_name; //store_name을 가지고 있자

	//원래는 store_manage_ids를 사용
	//var managedIds = (obj.store_manage_ids).split(',');

	/*
	현재는 store_manage_stores 사용
	store_manage_store의 element가 여러개인경우 : 지점 보유 본점/관리자
	current_ids는 지점 선택시 저장
	*/
	if(obj.store_manage_stores.length > 1){
		//로그인 성공 업체 요약정보 표사ㅣ
		$('#store_summary').css('visibility', 'visible');
		$('#result_login').html("성공");
		$('#result_storename').html(obj.store_name);
		$('#result_storeaddress').html(obj.store_address);
		$('#store_login').css('display', 'none');
		$('#store_plist').css('visibility', 'visible');
		$('#result_message').val(obj.store_message);

		// 지점 id select bar에 option으로 부여
		var appendManagedIds = "";
		appendManagedIds = '<option value="">--- 업체/지점을 선택하세요 ---</option>';

		//for(i in managedIds){
		for(i in obj.store_manage_stores){
			//appendManagedIds += '<option value="' + managedIds[i] +'">'+ managedIds[i] +'</option>';

			//보이는건 업체 이름, 값은 업체 ID
			appendManagedIds += '<option value="' + obj.store_manage_stores[i].store_id +'">'+ obj.store_manage_stores[i].store_name +'</option>';
		}

		// 업체/지점아이디 영역 inline level로 활성화
		$('#store_managed_list').css('visibility', 'visible');
		$('#store_managed_list').attr('class', 'inline');
		$('#managed_ids').append(appendManagedIds);

	}
	//store_manage_stores가 1개인 경우 : 보유 지점 없는 개별 업체
	else{
		store_info.current_ids = obj.store_id; //현재 로그인 업체와 선택된 업체 동일
		//로그인 성공 업체 요약정보 표사ㅣ
		$('#store_summary').css('visibility', 'visible');
		$('#result_login').html("성공");
		$('#result_storename').html(obj.store_name);
		$('#result_storeaddress').html(obj.store_address);
		$('#store_login').css('display', 'none');
		$('#store_plist').css('visibility', 'visible');
		$('#result_message').val(obj.store_message);
	}

};

/*
loginReq : 업체 로그인 요청
*/
function loginReq (){
	var targetUrl = '/login';
	var param ={};

	var loginId = $('#login_id').val();
	var loginPw = $('#login_password').val();

	if(loginId == ""){
		alert('ID가 비었습니다.');
		return;
	}else if(loginPw == ""){
		alert('비밀번호가 비었습니다.');
		return;
	}else{
		param.store_id = $('#login_id').val();
		param.store_password = $('#login_password').val();
		param.type = "store_web";
		//loginUserInfo.userid = param.store_id;

		ajaxRequest("POST", targetUrl, param, loginRes);
	}

};

/*
logoutRes : logoutReq성공시
*/
function logoutRes(result, isSuccess, status){
	// 업체 요약 영역 숨기기
	$('#store_summary').css('visibility', 'hidden');
	//지점아이디 선택버튼 숨기기
	$('#store_managed_list').css('visibility', 'hidden');
	//가격조회버튼 숨기기
	$('#store_plist').css('visibility', 'hidden');
	//업체 취급 기종리스트 없애기
	$('#form_info').empty().css('visibility', 'hidden');
	//업체 취급 기종리스트 영역 숨기기
	$('#plist_form').css('visibility', 'hidden');
	$('#login_id').val("");
	$('#login_password').val("");
	$('#store_login').css('display', 'block');
	//지점 목록 초기화
	$('#store_managed_list').html('');

	location.reload();

};

/*
logoutReq 로그아웃 요청
*/
function logoutReq(){
	var target = '/logout';
	ajaxRequest('POST', target, null, logoutRes);
};

/*
messageRes 업체메시지 수정 성공
*/
function messageRes(result, isSuccess, status){
	if(status.status = 200){
		alert('업체 메시지가 변경되었습니다.');
	}else{
		alert('실패');
	}
};

/*
messageReq 업체메시지 수정 요청
*/
function messageReq(){
	var target = '/stores'
	var message = {};
	message.store_message = $('#result_message').val();
	console.log('store_message : ', message.store_message);
	ajaxRequest('PUT', target, message, messageRes);
};

/*
storeRes 업체 취급 기종 리스트 요청 성공
*/
function storeRes(result, isSuccess, status){
	myProduct = []; //매입업체 취급 품목 저장
	$('#form_info').html(''); //이전 리스트가 있다면 영역 초기화

	var obj = result.results
	var resLength = obj.length;
	var appendList = "";

	/*해당업체 취급기종 리스트 만들기*/
	$('#form_info').css('visibility', 'visible');
	$('#plist_form').css('visibility', 'visible');
	$('#store_pcount').html(resLength);

	//해당 매입업체가 취급하는 기종 숫자 만큼
	for(var i =0; i <resLength ; i++){
		// 모델이름, 모델명, 가격
		myProduct.push(obj[i]);
		appendList += "<div name='eachmodel'><input type='text' id='product_name' name='product_name' placeholder='모델이름' value='" + obj[i].product_name + "' readonly/>"
		+ "<input type='text' id='product_model' name='product_model' placeholder='모델명' value='" + obj[i].product_model + "'readonly/>"
		+ "<input type='number' id='product_price' name='product_price' placeholder='가격' onkeypress='validate(event)' onkeyup='validate(event)' value='" + obj[i].product_price+ "' tabindex = "+i+" ></div>"
	}

	$('#form_info').append(appendList);
};

/*
storeReq 업체 취급 기종 리스트 요청
*/
function storeReq (){
	console.log('현재 지점 / 선택된 지점 : ', store_info.current_ids + ' / ' + $('#managed_ids').val());

	if($('#managed_ids').val() == "" || store_info.current_ids == undefined){
		alert('지점 아이디를 선택하세요');
		return;
	}

	var target = '/stores-prices?store_id='+store_info.current_ids;

	ajaxRequest("GET", target, null, storeRes);

};

/*
storeRes 업체 취급 기종 리스트 요청 성공
*/
function openList(){
	eachProductModels = []; //현재 수정중인 각 기종 매입가격 리스트

	var eachModels = $('div[name=eachmodel] > #product_model');
	var eachModelsCount = $('div[name=eachmodel]').length;

	for(var i = 0; i<eachModelsCount; i++){
		eachProductModels.push(eachModels[i].value); ///현재 수정중인 모든 기종 정보 배열에 push
	}
	//관리하지 않는매입기종
	var newWindow = window.open('./list.html', "_blank", "overflow=scroll; scrollbars=yes, resizable=yes, top=500, left=300, width=500, height=800");
	newWindow.focus();

};



