var username;
var password;
var token;

var id;
var store_name;
var product_name;
var model;
var price;
var address_si;
var address_gu;
var address_dong;
var address_etc;
var store_url;
var lat;
var lon;
var deliver;
var chat;
var message;
var is_visible;

var update_date; 

/** Baas.IO 설정 * */
var io = new Baas.IO({
	orgName : 'cca3e537-1dfa-11e4-a50e-06530c0000b4', // Your baas.io
	appName : 'ff090c61-1dfa-11e4-a50e-06530c0000b4' // Your baas.io app name
});

/** 로그인 업체용 * */
function login() {

	// ID,PASSWORD 값을 가져온다
	
	username = document.getElementById("login_id").value;
	password = document.getElementById("login_password").value;
	
	
	// 해당 정보를 가지고 로그인 시도
	io.login(username, password, function(errorFlag, responseData, userEntity) {
		console.log(responseData)

		if (errorFlag) {
			
			document.getElementById("result_login").innerHTML = "로그인오류<br>"
					+ responseData.error_description;

			console.log('오류')

		} else {

			
		
			document.getElementById("result_login").innerHTML = '로그인 성공';

			//로그인 성공시 결과창을 보여준다
			document.getElementById("form_login").style.display = "none"
			document.getElementById("form_info").style.visibility = "visible"

			
			token = responseData.access_token
			var store_id = responseData.user.store_id
			console.log('id: ' + store_id)
			var store_id_array = store_id.split(",");
			var size = store_id_array.length;

			
			if(size >0){
				
				document.getElementById("form_get_store_id").style.visibility = "visible"
			
					for(i = 0; i< size ; i++){
						console.log("store_id_array["+i+"]: "+store_id_array[i]);
						document.form_get_store_id.sl_store_id.options[i] = new Option(store_id_array[i],store_id_array[i]);
								
						
					}
				
				if(size==1){
					
				
					document.form_get_store_id.btn_send.style.visibility = "hidden";
					
				}
				
				get_store_id();
			}

		}
	})

}

function get_store_id(){
	id = document.form_get_store_id.sl_store_id.options[document.form_get_store_id.sl_store_id.selectedIndex].value;
	getStore(id)
}



/** 업체정보 조회 * */
function getStore(id) {

	// 업체ID에 해당하는 정보 조회
	var options = {
		'client' : io,
		'type' : 'store',
		'qs' : {
			'ql' : 'select * where id=\'' + id + '\' '
		}
	}

	var callback = function(errorFlag, collectionData) {

		console.log(collectionData)

		if (errorFlag) {

			document.getElementById("result_storeinfo").innerHTML = "업체정보 오류<br>"
					+ collectionData.error_description;

			console.log("실패")
		} else {
			
			
			var size = collectionData.entities.length
			
			if(size==0){
				document.getElementById("result_storeinfo").innerHTML = id+"에 대한 업체정보 없음";

				
			}else{
				
				document.getElementById("result_storeinfo").innerHTML = "업체정보 가져오기 성공";

				// Store 정보 가져오고 변수들을 세팅

				var store = collectionData.entities[0]

				store_name = store.store_name
				
				address_si = store.address_si
				
				store_url = store.store_url
				
				address_gu = store.address_gu
				if(address_gu ==null){
					address_gu=""
					
				}
				
				address_dong = store.address_dong
				
				address_etc = store.address_etc
				deliver = store.deliver
				lat = store.lat
				lon = store.lon
				chat = store.chat


				message=store.message
	if(message ==null){
					message=""
					
				}
				document.getElementById("store_name").innerHTML = store_name;
				document.getElementById("address").innerHTML = address_si + " "
						+ address_gu + " " + address_dong + " " + address_etc;

				
/*
				
					var nday = new Date() ;    // 오늘의 날짜와 시간을 구함
					var t_year = nday.getFullYear();
					var t_mon = nday.getMonth()+1;     // 0부터 시작해서 1월이다.
					var t_day = nday.getDate();
					// 날짜 포맷 맞추기
					if(t_mon < 10)
					t_mon = "0" + t_mon;
					if(t_day < 10)
					t_day = "0" + t_day;

					update_date =  ""+t_year + "" + t_mon + "" + t_day;
					
					console.log('update_date: ' + update_date)
					*/
			
				
				console.log('store_name: ' + store_name)
				console.log('address_si: ' + address_si)

			
			}
			

		}
	}

	var animals = new Baas.Collection(options, callback);

}

/** 해당업체와 관련된 휴대폰정보들 조회 * */
function getpriceInfo() {

	if(confirm("가격조회를 하시겠습니까??")==true){
	
	
	document.getElementById('form_info').innerHTML +="	<input type='button' id='btn_send'  value='입력완료' onclick='send()'><br>"
	
	// 입력폼 200개를 생성해준다
	// 휴대폰이름 / 모델명 / 가격 순서
	for (i = 0; i < 200; i++) {
		var obj = document.getElementsByName('model');
		// alert(obj[0].id);
		var i = obj.length;
		// alert("i:" +i);
		document.getElementById('form_info').innerHTML += "<input type='text' id='product_name' name='product_name' placeholder='모델이름'>"
				+ "<input type='text' id='model' name='model' placeholder='모델명'>"
				+ "<input type='text' id='price' name='price' placeholder='가격' tabindex = "+i+" ><br>";
	}

	// 해당 ID가 취급하는 휴대폰정보를 휴대폰이름순으로 조회하는 쿼리
	// Limit 200개
	var options = {
		'client' : io,
		'type' : 'priceinfo',

		'qs' : {

			//'ql' : 'select * where id=\'' + id + '\' order by product_name ASC',
			'ql' : 'select * where id=\'' + id + '\' ',
			'limit' : 300
		}
	}

	var callback_priceinfo = function(errorFlag, collectionData) {
		console.log(collectionData)

		if (errorFlag) {

			document.getElementById("result_priceinfo").innerHTML = "가격정보 오류<br>"
					+ collectionData.error_description;

			console.log("실패")
		} else {
			
		// 가져온 가격정보를 개수만큼 세팅한다
			
			document.getElementById("result_priceinfo").innerHTML = "가격정보 가져오기 성공";

			var entities = collectionData.entities
			var size = entities.length
			console.log("size: " + size)

			for (i = 0; i < size; i++) {

				document.form_info.product_name[i].value = entities[i].product_name
				document.form_info.model[i].value = entities[i].model
				document.form_info.price[i].value = entities[i].price

			}

		}
	}

	new Baas.Collection(options, callback_priceinfo);
	
	
	}else{
		return;
	}

}

var total_count
var success_count
var error_count
var error_message = ""

/** [입력완료]실행시 수행 * */
function send() {
	total_count = 0
	success_count = 0
	error_count = 0

	
	// 가격범위 체크 1000원~999999원 사이값이어야함
	var checkprice=1
	for (i = 0; i < 200; i++) {

		var inputprice =document.form_info.price[i].value
		
		
		if(inputprice != null && inputprice !=0){
			
			
			if(inputprice < 1000 || inputprice > 999999){
			
				checkprice = 0
				alert(i+"번째 입력하신 가격을 확인하세요")
				return
			}
			
		}
		

	}
	
	
	

	
	update_date =  document.getElementById("input_date").value;
	
	var date_length = update_date.length;
	if(date_length !=6){
		
		alert("입력 날짜를 확인하세요( 예) 140801")
		return
		
	}
	
	
	if(checkprice==1){
	for (i = 0; i < 200; i++) {

		// 입력폼중에서 3개입력칸이 모두 빈칸이 아니어야 실행한다
		if (document.form_info.product_name[i].value != ""
				&& document.form_info.model[i].value != ""
				&& document.form_info.price[i].value != "") {
			total_count++
			startupdata(i)
		} else {

		}

	}
	
	console.log("total input count: " + total_count)
	
	}
	
}

/** 데이터 수정을 시작 * */
function startupdata(index) {

	var priceinfo_name = id + "_" + document.form_info.model[index].value

	var update = {
		'client' : io,
		'data' : {
			'type' : 'priceinfo',
			'name' : '' + priceinfo_name + ''
		}
	}

	var entity = new Baas.Entity(update)

	var priceinfo_product_name = document.form_info.product_name[index].value
	var priceinfo_model = document.form_info.model[index].value
	var priceinfo_price = document.form_info.price[index].value

	var d = new Date();

	
	entity.set({
		'id' : '' + id + '',
		'price' : '' + priceinfo_price + '',
		'store_name' : '' + store_name + '',
		'product_name' : '' + priceinfo_product_name + '',
		'model' : '' + priceinfo_model + '',
		'address_si' : '' + address_si + '',
		'address_gu' : '' + address_gu + '',
		'address_dong' : '' + address_dong + '',
		'address_etc' : '' + address_etc + '',
		'lat' : '' + lat + '',
		'lon' : '' + lon + '',
		'store_url' : '' + store_url + '',
		'update_date' : '' + update_date + '',
		'message':''+message+'',

		'is_visible':'Y',

		'chat':'' + chat + ''
		
		

	});

	entity.save(function(errorFlag, responseData, entity) {
		console.log(responseData)
		if (errorFlag) {
			// Entity의 정보 추가 및 수정이 실패한 경우
			error_count++
			error_message += responseData.error_description + "\n"

			if ((error_count + success_count) == total_count) {
				showUpdateResult()
			}

		} else {

			// Entity의 정보 추가 및 수정이 성공한 경우
			success_count++
			document.getElementById("result_priceUpdateInfo").innerHTML = '가격정보 갱신상태: '+success_count+"/"+total_count;
			
			if ((error_count + success_count) == total_count) {
				productsUpdate();
				
				
				showUpdateResult();
			}

		}
	});
}

function productsUpdate(){
	
	success_count=0;
	for (i = 0; i < 200; i++) {

		// 입력폼중에서 3개입력칸이 모두 빈칸이 아니어야 실행한다
		if (document.form_info.product_name[i].value != ""
				&& document.form_info.model[i].value != ""
				&& document.form_info.price[i].value != "") {
			
			var priceinfo_model = document.form_info.model[i].value
			requestProductsUpdate(priceinfo_model);
		} 

	}
	
}

var xmlHttp;
function requestProductsUpdate(product_model){
	
	

	
		if(window.ActiveXObject) {
			xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
		} else if(window.XMLHttpRequest) {
			xmlHttp = new XMLHttpRequest();
		}
		
		
		var url = "https://pasta-api.baas.io/cca3e537-1dfa-11e4-a50e-06530c0000b4/ff090c61-1dfa-11e4-a50e-06530c0000b4/pasta/update_product?product_model="+product_model;
		xmlHttp.onreadystatechange = loader();
		xmlHttp.open("GET", url, true);
		xmlHttp.send(null);
	
		
}


function loader() {
	success_count++;
	document.getElementById("result_productsUpdate").innerHTML = '상품정보 업데이트: '+success_count+"/"+total_count;
	
	
	console.log(xmlHttp);
	if(xmlHttp.readyState == 4) {
		if(xmlHttp.status == 200) {
			temp = xmlHttp.responseText;
			
			
		}
	}
}



/** 작업이 완료된후 결과를 보여준다 * */
function showUpdateResult() {

	if (error_count > 0 ) {
		alert(error_message)
	} else {
		alert("모든 입력이 완료되었습니다")
	}

}

/** 숫자만 입력할수있도록 설정 * */
function onlyNum() {
	var keycode = window.event.keyCode;

	if (keycode == 8 || (keycode >= 35 && keycode <= 40)
			|| (keycode >= 46 && keycode <= 57)
			|| (keycode >= 96 && keycode <= 105) || keycode == 110
			|| keycode == 190) {
		window.event.returnValue = true;
		return;
	} else {
		window.event.returnValue = false;
		return;
	}
}
