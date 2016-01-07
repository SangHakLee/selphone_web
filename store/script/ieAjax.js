//ieAjax.js
console.log('ieAjax ready');
//DEV
var sAddress = 'http://54.178.140.51';

// PRD
// var sAddress = 'http://api.selphone.co.kr';

var store_info = {};
var myProduct = [];
//Cookies.set('_id', store_info.store_id);
$(document).ready(function(){
	//window.opener = 'mother';

  console.log("ieAjax ready");

});

function ajaxRequest(reqType, targetUrl, param, successCallback){
	console.log('what??');
	$.ajax(sAddress + targetUrl, {
    	type:reqType,
        data: param,
        //data:$(this).serializeArray(),
        //contentType:"text/plain",
        dataType:'text/html',
        iframe: true,
        processData: false,
        cache:false
    }).complete(function(data) {
    	//console.log('aaa')
        //console.log(data.responseText);
        //alert(data.responseText);
        //var jsonToString = $.parseJSON(data.responseText);
        console.log('type : ', typeof(data.responseText));
        var jsonToString = eval("(" + data.responseText + ")");
        console.log('type : ', typeof(jsonToString));
        var resultJson = {};
        resultJson.result = jsonToString;

        //console.log('jsonToString : ', jsonToString);

        successCallback(resultJson, 'success', '200');
    });
};

//loginHandler.js

function loginRes(result, isSuccess, status){
	var obj = result.result;
	console.log('loginRes');
	store_info.store_id = obj.store_id;
	console.log('store_id : ' + store_info.store_id);
	$('#store_summary').css('visibility', 'visible');
	$('#result_login').html("성공");
	$('#result_storename').html(obj.store_name);
	$('#result_storeaddress').html(obj.store_address);
	$('#store_login').css('display', 'none');
	$('#store_plist').css('visibility', 'visible');
	$('#result_message').val(obj.store_message);

};

function loginReq (){
	console.log('clieck loginReq');
	var target = '/login';
	var param = $('#form_login').serializeArray();
	// var param ={};
	// param.store_id = $('#login_id').val();
	// param.store_password = $('#login_password').val();
	// param.type = "store_web";

	ajaxRequest("POST", target, param, loginRes);
};

function logoutRes(result, isSuccess, status){
	console.log('logout은 된거');
	$('#store_summary').css('visibility', 'hidden');
	$('#store_plist').css('visibility', 'hidden');
	$('#form_info').empty().css('visibility', 'hidden');

	$('#plist_form').css('visibility', 'hidden');
	$('#login_id').val("");
	$('#login_password').val("");
	$('#store_login').css('display', 'block');
};

function logoutReq(){
	var target = '/logout';
	ajaxRequest('POST', target, null, logoutRes);
};

function messageRes(result, isSuccess, status){
	if(status.status = 200){
		alert('업체 메시지가 변경되었습니다.');
	}else{
		alert('실패');
	}
};

function messageReq(){
	console.log('왜??');
	var target = '/stores'
	var message = {};
	message.store_message = $('#result_message').val();
	console.log('store_message : ', message.store_message);
	ajaxRequest('PUT', target, message, messageRes);
};

function storeRes(result, isSuccess, status){
	var obj = result.results
	var resLength = obj.length;
	var appendList = "";
	$('#form_info').css('visibility', 'visible');
	$('#plist_form').css('visibility', 'visible');
	$('#store_pcount').html(resLength);

	for(var i =0; i <resLength ; i++){

		myProduct.push(obj[i]);
		appendList += "<div name='eachmodel'><input type='text' id='product_name' name='product_name' placeholder='모델이름' value='" + obj[i].product_name + "' readonly/>"
		+ "<input type='text' id='product_model' name='product_model' placeholder='모델명' value='" + obj[i].product_model + "'readonly/>"
		+ "<input type='number' id='product_price' name='product_price' placeholder='가격' onkeypress='validate(event)' onkeyup='validate(event)' value='" + obj[i].product_price+ "' tabindex = "+i+" ></div>"
	}

	$('#form_info').append(appendList);
	window.opener,myProduct = myProduct;
	console.log('myProduct : ', myProduct);
};

function storeReq (){
	console.log('clieck storeReq');
	var target = '/stores-prices?store_id='+store_info.store_id;


	ajaxRequest("GET", target, null, storeRes);
};

function openList(){
	//var newWindow = window.open('./list.html', myProduct, 'dialogHeight=320px; dialogWidth=280px; status=yes; help=no; center=yes', '');

	var newWindow = window.open('./list.html', 'myProduct', "_parent", "scrollbars=1, resizable=yes, top=500, left=500, width=400, height=400");

	newWindow.focus();

};