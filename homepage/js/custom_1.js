var sAddress = 'http://api.selphone.co.kr';
//var sAddress = 'http://54.178.140.51';

function ajaxRequest(reqType, targetUrl, product_name, sCallback){
	jQuery.support.cors = true;
	var ajaxOption = {
		url: sAddress + targetUrl,
		type: reqType,
		crossDomain: true,
		dataType:'json',

		complete:function(response, isSuccess){
			sCallback(response, isSuccess);
		}

	};

	if(reqType == 'POST'){
		console.log('request type POST');
		
		ajaxOption.data = { "product_name" : product_name };

		ajaxOption.header = {
			Accept : "application/json; text/javascript; */*; q=0.01", 
			"Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
		};
		ajaxOption.cache = false;
	 	ajaxOption.contentType = false;
	 	ajaxOption.processData = false;
	}

	$.ajax(ajaxOption);

};
