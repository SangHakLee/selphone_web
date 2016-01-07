//selphone.js

//selphone 계정이 로그인했을 때 
function storeAllReq(obj){
	console.log('start storeAllReq');
	
	//selphone 계정 로그인 성공 처리	
	$('#store_summary').css('visibility', 'visible');
	$('#result_login').html("성공");
	$('#result_storename').html(obj.store_name);
	$('#result_storeaddress').html(obj.store_address);
	$('#store_login').css('display', 'none');
	$('#store_plist').css('visibility', 'visible');
	$('#result_message').val(obj.store_message);

	//All stores data request 
	testReq();
	
};

function testReq(){
	ajaxRequest("GET", '/stores', null, testRes);
}

function testRes(results, isSuccess, status){
	var allStoreIds = results.results;

	var appendManagedIds = ""; 
	appendManagedIds = '<option value="">--- 업체를 선택하세요 ---</option>';

	for(i in allStoreIds){
		appendManagedIds += '<option value="' + allStoreIds[i].store_id +'">'+ allStoreIds[i].store_id + ' - ' + allStoreIds[i].store_name +'</option>';
	}

	$('#store_managed_list').css('visibility', 'visible');
	$('#store_managed_list').attr('class', 'inline');
	$('#managed_ids').append(appendManagedIds);

}