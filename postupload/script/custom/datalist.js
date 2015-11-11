/**
* @datalist.js post_delete.html 관련 Data Table 사용
*
* @author david Lim
* @version 1.1
* @logs
* 2015.07.24 : 시간 표시 수정
*/

//var lastMessage = '<p><b><a href="http://selphone.co.kr/googleplay_naver_blog_upload.html" target="_blank" class="tx-link"><span style="color: rgb(0, 85, 255); font-size: 12pt;">중고폰 판매글 더보기</span></a></b></p><p><br /></p><p><a href="http://selphone.co.kr/googleplay_naver_blog_upload.html" target="_blank" class="tx-link"><img src="https://s3-ap-northeast-1.amazonaws.com/selphone-storage/naver_upload/naver_upload_1.jpg" width="600"></a></p><p><br /></p>';
//var EMPLOYEE = "employees";

$(document).ready(function(){
	console.log('are you ready?');

	// dataTable 준비
	$('#example').dataTable();

	// GET LIST 버튼 클릭 event
	$('#get_selected_posts').click(function(){

		var sDate = $('#date-start').val(); // 판매글 createdAt 시작일
		var eDate = $('#date-end').val(); // 판매글 createdAt 마지막일

		var targetUrl = EMPLOYEE; //employees로 수정해야됨
		var selectType = $('#post_select_type').val();
		var productModel = $('#product_model').val();

		// request 체크
		selectType !='empty' ? targetUrl += '/' + selectType : alert('리스트 조회 조건을 선택하세요');
		productModel.length > 0 ? targetUrl += '&product_model=' + productModel : targetUrl;
		sDate && eDate ? targetUrl += '&startDate=' + sDate + '&endDate=' + eDate : alert('날짜를 선택하세요');

		ajaxRequest('GET', targetUrl, res_UserPosts, null);
	});

	//HTML dialog 띄워서 x를 누르면 dialog 없애기
	$(".ui-dialog-titlebar-close").click(function(){
		$('#favDialog').destroy();
		return;
	});

});

function convertUTCDateToLocalDate(date){
	var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);
	console.log('newDate', newDate);

  var offset = date.getTimezoneOffset() / 60;
  console.log('offset : ', offset);
  var hours = date.getHours();
  console.log('hours : ', hours);

  newDate.setHours(hours);

  return newDate;
}

// function req_tempUsersPosts(){
// 	console.log('req_tempUserPosts start');
// 	ajaxRequest('/employee/posts', res_TmpUserPosts);
// };

var dataList;

/*
	res_UserPosts 조건에 맞는 판매글 가져온것 dataTable에 뿌리는 함수
	@response, isSuccess, status
*/
function res_UserPosts(response, isSuccess, status){



	dataList = "";
	dataList = response.results;

	if(dataList.length<1){
		alert('해당 조건으로 게시글이 없습니다.');
	}

	var t = $('#example').DataTable();
	t.clear().draw(); // table 초기화

	for(i in dataList){

		var appendData = [];
		console.log(dataList[i]);
		appendData.push(dataList[i].TB_USER.user_name);
		appendData.push(dataList[i].TB_USER.user_number);
		appendData.push(dataList[i].id);
		appendData.push(dataList[i].user_id);
		appendData.push(dataList[i].sell_price);
		appendData.push(dataList[i].product_model);
		appendData.push(dataList[i].post_description);
		dataList[i].post_origin_url ? appendData.push('<a href=' + dataList[i].post_origin_url + ' target=\'_blank\'>' + dataList[i].post_origin_url + '</a>') : appendData.push('셀폰에서 올린 글입니다');

		var timeformat = $.format.date( Date.parse(dataList[i].createdAt), "yyyy-MM-dd a hh:mm:ss" )
		//appendData.push(makeTimeFormat);
		appendData.push(timeformat);
		appendData.push('<input type="button" value="보기" onclick="javascript:postHtmlGenerate('+ i +', this)" />');
		appendData.push('<input type="button" value="판매완료" onclick="javascript:req_postDelete(' + dataList[i].id + ', \'' +dataList[i].user_id + '\', this)" />');

		t.row.add(appendData).draw();
	}

};

/*
req_postDelete 클릭한 판매글 판매완료 요청
*/
var currentDeleteRow;
function req_postDelete(post_id, user_id, thisElem){
	var confirmResult = confirm(user_id + '님의 ' + post_id + '번 게시글을 삭제하시겠습니까?');
	if(confirmResult){
		currentDeleteRow = thisElem; // 판매완료 클릭한 rorw
		// var t = $('#example').DataTable();
		// var row = t.row( $(thisElem).parents('tr') );
		// row.remove().draw();
		ajaxRequest('PUT', '/posts/' + post_id + '/0', res_postDelete, user_id);
	}else{
		alert('작업 취소');
		return;
	}
};

/*
res_postDelete 클릭한 판매글 판매완료 응답
판매완료 success response가 오면 해당 판매글을 dataTable에서 삭제
*/
function res_postDelete(response, isSuccess, status){
	console.log('isSuccess :', isSuccess);
	if(isSuccess == "success"){

		//DataTable jQuery object
		var t = $('#example').DataTable();
		//DataTable 판매완료 눌렀던 row
		var row = t.row( $(currentDeleteRow).parents('tr') );
		row.remove().draw(); //해당 row를 DataTable에서 삭제
		alert('삭제했습니다.');

	}else{
		alert('판매완료 실패했습니다.')
	}
	return;
};

/*
	postHtmlGenerate 자체카페 업로드 양식을 보는 dialog 설정
	@objIdx : DataTable row number
	@thieElem : click event가 발생한 요소
*/
function postHtmlGenerate(objIdx, thisElem){
	var postHTML = makeContentHtmlGenerator(objIdx);

	var favDialog = $('#favDialog');
	favDialog.attr('open', 'open');

	$('#text_subject').val(postHTML.subject);

	var append_imgurl = ""
	for(i in postHTML.img_urls){

		append_imgurl += "이미지"+i+1+": <a href='" + postHTML.img_urls[i] + "'>"+ postHTML.img_urls[i] +"</a><br/>";
	}
	console.log('append url : ', append_imgurl);
	$('#post_pictures').html(append_imgurl);

	$('#text_html').text(postHTML.content);

	favDialog.dialog({
		modal:true
		, resizable:true
		, title:"복사해서 쓰세요. (수정, 입력 불가능)"
		, width:750

	});

};

var changeText = function(text){
	var number = null;
	if(text.match(/\d{3}-\d{3,4}-\d{4}/g)){
		number = text.match(/\d{3}-\d{3,4}-\d{4}/g);
		text = text.replace(number.toString(), "xxx-xxxx-xxxx")
	}else if(text.match(/\d{3} \d{3,4} \d{4}/g)){
		number = text.match(/\d{3} \d{3,4} \d{4}/g);
		text = text.replace(number.toString(), "xxx-xxxx-xxxx")
	}else if(text.match(/\d{3}\d{3,4}\d{4}/g)){
		number = text.match(/\d{3}\d{3,4}\d{4}/g);
		text = text.replace(number.toString(), "xxx-xxxx-xxxx")
	}else if(text.match(/\d{3}.\d{3,4}.\d{4}/g)){
		number = text.match(/\d{3}\d{3,4}\d{4}/g);
		text = text.replace(number.toString(), "xxx-xxxx-xxxx")
	}else{
	}
	//0714 - replace <br/> to carriage code and new line code
	return text;
}



var randomNumber = Math.floor(Math.random()*4)+1;
var message1 = "<p><img src='https://s3-ap-northeast-1.amazonaws.com/selphone-storage/naver_upload/naver_upload_" + randomNumber + ".jpg' width=\"600\"></p>";
var message2 = '<p><b><a href="http://selphone.co.kr/googleplay_naver_blog_upload.html" target="_blank" class="tx-link"><span style="color: rgb(0, 85, 255); font-size: 15pt;">셀폰 앱에 올라온 개인 판매 공기계입니다.<br/>셀폰 다운로드 후 연락 가능합니다.<br/>기변 가능한 중고폰 판매글 더보기</span></a></b></p><p><br /></p><p><a href="http://selphone.co.kr/googleplay_naver_blog_upload.html" target="_blank" class="tx-link"><img src="https://s3-ap-northeast-1.amazonaws.com/selphone-storage/naver_upload/naver_upload_' + randomNumber + '.jpg" width="600"></a></p><p><br /></p>';

/*
	makeContentHtmlGenerator 판매글 자체 카페 업로드용 양식 생성
	@i : DataTable index number
*/
function makeContentHtmlGenerator(i){
	console.log('datas : ', dataList[i]);
   //중고나가 게시글제목 합성 : [모델이름] ([모델명]) [가격] 에 팝니다.
    var subject="";
    		subject += "[";
    		subject += dataList[i].TB_PRODUCT.product_name + "][";
    		subject += dataList[i].TB_PRODUCT.product_model + "]중고폰 ";
    		subject += dataList[i].sell_price + " 원에 팝니다";

	 // var content = "<p>"
  //  var post_pictures = dataList[i].post_pictures;
  //  var imgFiles = dataList[i].post_pictures.split(',');

  //  for( j in imgFiles){
  //     content += "<br> <div style='width:600px;'><img src='" + imgFiles[j] +"' style='max-width:100%; height:auto;'/> </div>";
  //  }

  //  content += "<br><br>";
  //  content += "<span  style='font-size:11pt; color: rgb(0,0,0)'>";
  //  content += changeText(dataList[i].post_description);
  //  content += "</span>";
  //  content += "<br><br>"; //글 본문 : 일단은 post_description부터
  //  content += "</p>"

  //  //content +="<h4> 가격 : "+ dataList[i].sell_price +"</h4>"
  //  //content += lastMessage;
  //  content += message2;

  var content = changeText(dataList[i].post_description);

  var img_urls = dataList[i].post_pictures.split(',');

  return {"subject":subject, "content":content, "img_urls" : img_urls};
  //callback(subject, content);
  /*common.reverseGeocode( post_location_lat, post_location_lon, function(result){
    //content += "<h3> 직거래 가능 지역 : "+result+"</h3>"
  });*/

};


