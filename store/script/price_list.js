//price_list.js

/*
validate 숫자만 입력
keyboard 입력 event가 숫자 입력인지 판단
*/
function validate(evt) {
  var theEvent = evt || window.event;
  var key = theEvent.keyCode || theEvent.which;
  key = String.fromCharCode( key );
  var regex = /[0-9]|\./;
  if( !regex.test(key) ) {
    theEvent.returnValue = false;
    if(theEvent.preventDefault) theEvent.preventDefault();
  }
};

var blank="";
var store_prices;
var storesPricesTarget = '/stores-prices';

var total_count; //총 가격수정 대상 총 개수
var success_count; //가격수정 성공 횟수
var fail_count; //가격수정 실패 횟수
var process_count; //가격수정 진행 count
var updating; //가격수정 건당 post요청 json

/*
updateRes 모델 가격수정 성공
*/
function updateRes(response, isSuccess, status){
	console.log('updateRes status : ', status);
	if(status == 200){
		success_count++;
		console.log('updateRes fail : ' + fail_count);
		checkFinish();
	}else{
		fail_count++;
		console.log('updateRes fail : ' + fail_count);
		checkFinish();
	}
};

/*
checkFinish : 다음 업데이트 품목이 있으면 계속 업로드, 아니면 성공메시지
*/
function checkFinish(){
	// 업로드 성공 개수 / 총 업로드 대상 개수
	$('#result_priceUpdateInfo').html(success_count + '/' + total_count);

	//성공 횟수 + 실패 횟수가 총 개수보다 크거나 같으면 가격수정 완료
	if((success_count + fail_count) >= total_count){
		alert(success_count + '개 성공');
		return;
	}

	process_count++;
	updatePrices();

};

/*
추가할 수 있는 기종 리스트 가져오기
addData : 팝업창에서 취급품목 추가한 기종 정보
*/
function updatePrices(){
	// updating = {};

	// updating.store_id = store_info.current_ids;
	// updating[blank + store_prices[process_count].children[1].name] = store_prices[process_count].children[1].value;
	// updating[blank + store_prices[process_count].children[2].name] = store_prices[process_count].children[2].value;

	// ajaxRequest("PUT", storesPricesTarget, updating, updateRes);

	/*
	가격수정요청 parameter 만듬
	ex) obj.objkey == obj[objkey] : key를 string 리터럴로 넣는 방법 "" + [문자열]
	*/
	updating = {}; //post 각 요청 parameter json
	updating.store_id = store_info.current_ids; //수정하는 업체 id
	updating[blank + store_prices[process_count].children[1].name] = store_prices[process_count].children[1].value; //수정하려는 품목 model
	updating[blank + store_prices[process_count].children[2].name] = store_prices[process_count].children[2].value; //수정하려는 품목 가격

	ajaxRequest("PUT", storesPricesTarget, updating, updateRes);

}

/*
추가할 수 있는 기종 리스트 가져오기
addData : 팝업창에서 취급품목 추가한 기종 정보
*/
function startUpdate (){

	if(confirm("[확인] 지점아이디 : " + store_info.current_ids + "를 선택하셨습니다. \n 해당 지정 가격 수정하시겠습니까?") == true){
		//모든 취급품목 리스트
		store_prices = document.getElementsByName('eachmodel');
		total_count = store_prices.length;
		process_count = 0;
		success_count = 0;
		fail_count = 0;

		//가격 수정 전 form check
		for(var i = 0; i < total_count; i++){
			if(store_prices[i].children[2].value == ""){
				alert(store_prices[i].children[0].value + '의 가격이 비어있습니다.');
				return;
			}
		}

		process_count=0;
		updatePrices();

	}else{
		// 해당 지점아이디로 업로드 취소하는 경우
		alert('가격 수정을 수행하지 않습니다.');
		return;
	}
};

/*
추가할 수 있는 기종 리스트 가져오기
addData : 팝업창에서 취급품목 추가한 기종 정보
*/
function addList(addData){

	//var eachdiv = $(document.createElement("div"));
	console.log('addData : ', addData);

	//각 취급품목 정보, 가격을 둘러싸는 row
	var eachdiv = $("<div>");
	eachdiv.attr('name', 'eachmodel');

	//var nameInput = $(document.createElement('input'));
	var nameInput = $("<input>");
	nameInput.attr({
		'type':'text'
		,'id':'product_name'
		,'name':'product_name'
		,'readonly':'readonly'
	}).val(addData.add_product_name);
	// nameInput.attr('id', 'product_name');
	// nameInput.attr('name', 'product_name');
	// nameInput.attr('readonly', 'readonly');
	// nameInput.val(addData.add_product_name);
	// nameInput.placeholder = "모델이름";


	//var modelInput = $(document.createElement('input'));
	var modelInput = $("<input>");
	modelInput.attr({
		'type':'text'
		,'id':'product_model'
		,'name':'product_model'
		,'readonly':'readonly'
	}).val(addData.add_product_model);
	// modelInput.attr('id', 'product_model');
	// modelInput.attr('name', 'product_model');
	// modelInput.attr('readonly', 'readonly');
	// modelInput.val(addData.add_product_model);
	// modelInput.placeholder = "모델";

	//var priceInput = $(document.createElement('input'));
	var priceInput = $("<input>");
	priceInput.attr({
		'type':'number'
		,'id':'product_price'
		,'name':'product_price'
		,'onkeypress':'validate(event)'
		,'onkeyup':'validate(event)'
	}).val(addData.add_product_price);
	// priceInput.attr('id', 'product_price');
	// priceInput.attr('name', 'product_price');
	// priceInput.attr('onkeypress', 'validate(event)');
	// priceInput.attr('onkeyup', 'validate(event)');
	// priceInput.val(addData.add_product_price);
	// priceInput.placeholder = "가격";

	//var cancelInput = $(document.createElement('input'));
	var cancelInput = $("<input>");
	cancelInput.attr({
		'type':'button'
		,'id':'product_price'
		,'name':'product_price'
		,'onclick':'javascript:cancelModel(this)'
	}).val("취소");
	// cancelInput.attr('id', 'product_price');
	// cancelInput.attr('name', 'product_price');
	// cancelInput.val("취소");
	// cancelInput.attr('onclick', 'javascript:cancelModel(this)');

	eachdiv.append(nameInput);
	eachdiv.append(modelInput);
	eachdiv.append(priceInput);
	eachdiv.append(cancelInput);

	$('#form_info').append(eachdiv);

	priceInput.focus(); //추가한 기종 가격 input에 focus
	total_count++; //현재 취급중인 기종 총 개수 +1
	totalCountCheck(); //현재 취급중인 기종 개수 최신화하는 함수
};

/*현재 목록 갯수 갱신*/
function totalCountCheck(){
	console.log('total_count : ' + total_count);
	var total_count = $('div[name=eachmodel]').length;
	var store_pcount = $('#store_pcount');
	store_pcount.html(total_count);
};

/*추가한모델 취소하기*/
function cancelModel(row){
	var rowParent = row.parentElement;

	rowParent.parentElement.removeChild(rowParent);
	total_count--;
	totalCountCheck();
};



