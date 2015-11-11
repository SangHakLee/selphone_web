/**
* @ajaxRequest.js selphone api server로 ajax요청하는 기능 관련
*
* @author david Lim
* @version 1.1
* @logs
* 2015.07.28 : 왜그런지 모르겠지만 서버 response 형식이 다 바뀜
*/


//DEV
var sAddress = 'http://54.178.140.51';
// console.log('현재 ip', sAddress);
//PRD
// var sAddress = 'http://api.selphone.co.kr';
var EMPLOYEE = '/employees';
var session = {};

$(document).ready(function(){
	console.log('ajaxRequest ready');

	/**
	  *
	*/
	$('select#model-select').click(function(e){
		console.log('e : ', e.target.value);
		console.log('option : ', $(this));

		$('#select-textbox').val(e.target.value);

	});

});

/*
	ajaxLogin 로그인 요청용
	@submitform : submit form
	@eve : form을 submit할 때 event
	@endPoint : request end-point
	@callback : response handling callback
*/
function ajaxLogin(submitform, eve, endPoint, callback){
	console.log('start ajaxLogin');

	var ajaxOption = {

		header:{
			"Accept":"application/json; text/javascript; */*; q=0.01",
			"Content-Type":"application/x-www-form-urlencoded; charset=utf-8"
		}
		,data:submitform
	 	,url: sAddress + endPoint
	 	,type:"POST"
	 	,crossDomain: true //multidomain option
	 	,cache:false
	 	,processData:false
	 	,xhrFields: {withCredentials: true} //use cookie
	 	,beforeSend: function(xhr){
		 	xhr.setRequestHeader('Content-Type', "application/x-www-form-urlencoded; charset=utf-8");
		}
		,complete:function(response, isSuccess){
			callback(response);
		}

	};

	$.ajax(ajaxOption);

	eve.preventDefault(); //post요청 시 default 동작 방지
};

/*
	ajaxForm 이미지+데이터
	@eachPost : form data
	@eve : form을 submit할 때 event
	@endPoint : request end-point
	@callback : response handling callback
*/
function ajaxForm(eachPost, eve, endPoint, callback){
	var formData = new FormData(eachPost);
	console.log('start ajaxForm');

	$.ajax({
	 	url: sAddress + endPoint,
	 	type:"POST",
		data: formData,
	 	crossDomain: true,
	 	cache: false,
	 	contentType: false,
	 	processData:false,
	 	xhrFields: {withCredentials: true},
		success: function(response, isSuccess, status){
			callback(response, isSuccess, status.status, eachPost);
		},
		error: function(response, isSuccess, status){
			if(response.status == 404){
				alert("서버 error : 담당자에게 문의");
				return;
			}else{
				console.log('error');
				callback(response, isSuccess, status);
			}

		}
	});

	eve.preventDefault();
};

/*
	ajaxRequest 판매완료 요청시 사용
	@reqType : HTTP request method type
	@eachPost : form data
	@eve : form을 submit할 때 event
	@endPoint : request end-point
	@callback : response handling callback
*/
function ajaxRequest(reqType, endPoint, callback, del_data){
	console.log('start ajaxRequest');
	var ajaxOption = {
		type:reqType,
		url:sAddress + endPoint,
		crossDomain:true,
		//cache:false,
		xhrFields:{withCredentials: true},
		success: function(response, isSuccess, status){
			callback(response, isSuccess, status.status);
		},
		error: function(response, isSuccess, status){
			console.log('response : ', response);
			console.log('isSuccess : ', isSuccess);
			console.log('status : ', status);

			if(isSuccess == 'error'){
				alert("error : 서버 통신 실패");
				return;
			}else{
				callback(response, isSuccess, status);
			}

		}
	};

	if(del_data){
		ajaxOption.data = {'user_id' : del_data};
	}

	$.ajax(ajaxOption);
};

/*
	formCheck 제시한 form 유효성 체크
	@form : 체크할 form
*/
function formCheck(form){
	console.log('form : ', form);
	var inputCount = form.elements.length;

	for(var i = 0; i<inputCount; i++){
		if(form.elements[i].type != 'button'){
			console.log('data : ', form.elements[i]);
			if(form.elements[i].value == ""){
				alert('빈 칸이 있습니다 : [' + form.elements[i].title + ']');
				return false;
			}
		}
	}

	if(form.name == 'postform'){
		if(form['post_pictures'] == undefined){
			alert('이미지가 하나도 없습니다.');
			return false;
		}else if($(form['post_pictures']).length < 2){
			alert('이미지는 최소 2개를 등록해야 합니다.')
			return false;
		}
	}

	return true;
};
