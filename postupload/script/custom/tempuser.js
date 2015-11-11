/**
* @tempuser.js 임시계정 생성 관련
*
* @version 1.1
* @logs 
* 2015.07.28 : 왜그런지 모르겠지만 서버 response 형식이 다 바뀜.
* express body paser를 건드리면 express의 res object configuration이 바뀜.
*/

/*
	getTempUser 임시계정 생성 요청
	@thisElem : submit form의 submit button 요소
*/
function getTempUser(thisElem, e){
	var check = formCheck(thisElem.form);
	if(!check){
		return;
	}
	ajaxForm(thisElem.form, e, EMPLOYEE + '/check_user', getTempUserRes);
};

/*
	getTempUserRes 임시계정 생성 요청
	@thisElem : submit form의 submit button 요소
*/
function getTempUserRes(response, isSuccess, statusCode){

	if(!isSuccess){
		alert('서버가 안줬습니다.');
		return;
	}

	//생성된 임시계정 summary
	$('#form_userName').val(response.result.user_id);
	$('#summary_userName').text(response.result.user_id);
	$('#summary_userNumber').text(response.result.user_number);

	var time_string = response.result.createdAt; // 임시계정 최초 생성날짜

	// var timeparse = Date.parse( new Date( Date.parse(response.result.createdAt)) )
	// var timeformat = new Date(Date.parse(timeparse)).format("yyyy.MM.dd");
	// console.log('timeformat : ', timeformat);
	// return;

	var time_slice = time_string.split('T'); // 생성날짜 필요없는거 없앰
	var year_date = time_slice[0].split('-'); // 년, 월
	var hour_time = time_slice[1].split(':'); //시간

	var cUser_year = year_date[0]; // 년
	var cUser_month = year_date[1]; // 월
	var cUser_day = year_date[2]; // 일
	var cUser_hour = hour_time[0]*1 + 9; // 시간
	var cUser_minute = hour_time[1]; // 분

	// 임시계정 생성 날짜
	$('#summary_created').text(cUser_year + "년 " + cUser_month +"월 " +cUser_day + "일 "+ cUser_hour + "시 " +cUser_minute+ "분");

	// isNewRecord true : 새로 생성된 임시계쩡
	if(response.result.isNewRecord){
		$('#summary_isNewRecord').text('최초 등록');	
	}else{
		$('#summary_isNewRecord').text('기 등록');	
	}

	$('#tmpuser_summary').attr('class', 'redisplay_block');
	$('#data_form').attr('class', 'redisplay_block');

	getModelOptions();

};