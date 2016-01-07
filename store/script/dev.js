
var store_info = {};
var myProduct = [];
var candidateProduct = [];

/*form 체크*/
var documentUrl = document.URL;
var tmpUrl = documentUrl.split('/');
var sAddress = tmpUrl[0] + "//" + tmpUrl[2];

//로그인 요청 성공
function loginRes(request){
		console.log('loginRes request : ',request);
		console.log('state : '+ request.readyState);
	if(request.readyState == 4){
		if(request.status == 200){
		
			
			var getData = parseResponse(request);

			store_info.store_id = getData.result.store_id;
			
			console.log("resText type + " + typeof(stringToJSON));

			var isLogin = document.getElementById('result_login');
			isLogin.innerHTML = "성공";
			
			var storename = document.getElementById('result_storename');
			storename.innerHTML = getData.result.store_name;

			var storeAddress = document.getElementById('result_storeaddress');
			storeAddress.innerHTML = getData.result.store_address;

			document.getElementById("store_summary").style.visibility = "visible";
			document.getElementById('store_plist').style.visibility = "visible";
			document.getElementById("store_login").style.display = "none";
		
		}else{
			alert('로그인 실패 : ' + request.status);
		}
	}
};

/*매입업체 로그인요청 -> 매입업체 정보 받음*/
function requestStore(){
	var param = serializing("form_login");
	console.log("param", param);

	httpRequest("POST", sAddress+'/login', loginRes, param);	
};

//매입가격 리스트요청 성공
function priceInfosRes(request){
	if(request.readyState == 4){
		if(request.status == 200){			
			document.getElementById('plist_form').style.visibility = "visible";
			var listForm = document.getElementById('form_info');

			var appendList = "";
			var getData = parseResponse(request);
			//alert('getData : ' + getData.results);
			var store_pcount = document.getElementById('store_pcount');
			store_pcount.innerHTML = getData.results.length;

			//total_count = getData.results.length;
			
			
			for(var i =0; i <getData.results.length ; i++){
				myProduct.push(getData.results[i]);
				appendList += "<div name='eachmodel'><input type='text' id='product_name' name='product_name' placeholder='모델이름' value='" + getData.results[i].product_name + "' readonly/>"
				+ "<input type='text' id='product_model' name='product_model' placeholder='모델명' value='" + getData.results[i].product_model + "'readonly/>"
				+ "<input type='number' id='product_price' name='product_price' placeholder='가격' onkeypress='validate(event)' onkeyup='validate(event)' value='" + getData.results[i].product_price+ "' tabindex = "+i+" ></div>"
			}
			
			listForm.innerHTML = appendList;
		}else{
			alert('매입가격 리스트 요청 실패 : ' + request.status);
		}

	}
};

/*매입가격 리스트 요청*/
function requestPriceInfo(){
	document.getElementById("form_info").style.visibility = "visible"
	
	var targetUrl = sAddress + "/stores-prices?store_id=" + store_info.store_id;
	httpRequest("GET", targetUrl, priceInfosRes,null);
		
};

var total_count; //폼에 있는 품목 갯수
var success_count; //성공횟수
var fail_count; //실패횟수

function updateRes(request){
	console.log('updateRes ');
	console.log('updateRes state : ' +  request.readyState);
	if(request.readyState == 4){

		console.log('updateRes state 4');
		if(request.status == 200){			
				
			

			success_count++;
			console.log('updateRes success: ' + success_count);
			checkFinish();
			
		}else{
			
			fail_count++;
			console.log('updateRes fail: ' + fail_count);
			checkFinish();
		}
		
	}
};

function checkFinish(){
	var process = document.getElementById("result_priceUpdateInfo");
	process.innerHTML = success_count+"/"+total_count;
	console.log('check total : ' + total_count);
	console.log('check fail : ' + fail_count);
	console.log('check success : ' + success_count);
	

	if( (success_count+fail_count) >=total_count  ){
		alert(total_count + '개 성공');
	}

};



//업데이트 요청
function startUpdate(){
	var targetUrl = sAddress + '/stores-prices';
	var f = document.getElementsByName('eachmodel');
	total_count = f.length;
	var updating = "";
	console.log('수정대상 리스트 : '+ total_count);
	
	
  success_count = 0; //성공횟수
  fail_count = 0; //실패횟수

	
	for(var i = 0; i < total_count; i++){
		if(f[i].children[2].value == ""){
			
			alert(f[i].children[0].value+'의 가격이 비어있습니다');
			return;
		}
	}

	for(var j = 0; j < total_count; j++){
		updating = "";
		updating += "store_id=" + store_info.store_id + "&";
		updating += f[j].children[1].name + "=" + f[j].children[1].value + "&"; //모델명
		updating += f[j].children[2].name + "=" + f[j].children[2].value; //매입가격

		console.log('request param : ' + updating);

		httpRequest("PUT", targetUrl, updateRes, updating);	
		
	}
};

/*모델추가하기*/
function addList(addData){
	var listForm = document.getElementById('form_info');
	
	var division = document.createElement('div');
	division.setAttribute("name", "eachmodel");
	
	var nameInput = document.createElement('input');
	
	nameInput.type = "text";
	nameInput.setAttribute('readonly', 'readonly');
	nameInput.id = "product_name";
	nameInput.name = "product_name";
	nameInput.value = addData.add_product_name;
	nameInput.placeholder = "모델이름";

	var modelInput = document.createElement('input');
	
	modelInput.type = "text";
	modelInput.setAttribute('readonly', 'readonly');
	modelInput.id = "product_model";
	modelInput.name = "product_model";
	modelInput.value = addData.add_product_model;
	modelInput.placeholder = "모델이름";

	var priceInput = document.createElement('input');
	
	priceInput.type = "text";
	priceInput.id = "product_price";
	priceInput.name = "product_price";
	priceInput.setAttribute('onkeypress', 'validate(event)');
	priceInput.setAttribute('onkeyup', 'validate(event)');
	priceInput.placeholder = "가격";

	var cancelInput = document.createElement('input');

	cancelInput.type = "button";
	cancelInput.id = "product_cancel";
	cancelInput.name = "product_cancel";
	cancelInput.value = "취소";
	cancelInput.setAttribute('onclick', 'javascript:cancelModel(this)');

	division.appendChild(nameInput);
	division.appendChild(modelInput);
	division.appendChild(priceInput);
	division.appendChild(cancelInput);

	listForm.appendChild(division);

	priceInput.focus();
	total_count++;
	totalCountCheck();
	
};

/*현재 목록 갯수 갱신*/
function totalCountCheck(){
	var total_count = document.getElementsByName("eachmodel").length;
	var store_pcount = document.getElementById('store_pcount');
	store_pcount.innerHTML = total_count;
};

/*추가한모델 취소하기*/
function cancelModel(row){
	var rowParent = row.parentElement;

	rowParent.parentElement.removeChild(rowParent);
	total_count--;
	totalCountCheck();
};

//팝업창 열기
function openList(){
	//console.log('list' + list);
	
	var newWindow = window.open('./list.htm', myProduct, 'dialogHeight=320px; dialogWidth=280px; status=yes; help=no; center=yes');
	newWindow.focus();	

};

function logoutRes(request){
	if(request.readyState == 4){
		if(request.status == 200){
			document.getElementById('store_summary').style.visibility = "hidden";
			document.getElementById('store_plist').style.visibility = "hidden";
			document.getElementById('form_info').style.visibility = "hidden";
			document.getElementById('plist_form').style.visibility = "hidden";
			document.getElementById('login_id').value="";
			document.getElementById('login_password').value="";
			var loginbox = document.getElementById('store_login').style.display = "block";
			
			
		}

	}
};

function logout(){
	httpRequest('POST', sAddress + '/logout', logoutRes, null);
};
