<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<html>
<head>
<title> 셀폰 자동결제 전자동의 </title>
<meta name="Author" content="">
<meta name="Keywords" content="">
<meta name="Description" content="">
<meta http-equiv="Content-Type" content="text/html; charset=euc-kr" />
<script charset="euc-kr" src="http://ap.efnc.co.kr/fnpay/ssign/comm/ssign.js"></script>
     <script src="http://selphone.co.kr/baas.io.js"></script>
<script language='javascript'>
<!--
	
String.prototype.trim = function() {
    return this.replace(/(^\s*)|(\s*$)/gi, "");
}

/** Baas.IO 설정 * */
var io = new Baas.IO({
	orgName : 'cca3e537-1dfa-11e4-a50e-06530c0000b4', // Your baas.io
	appName : 'ff090c61-1dfa-11e4-a50e-06530c0000b4' // Your baas.io app name
})




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

		
			
			username = responseData.user.username
			name = responseData.user.name
				console.log('trim전 name: '+name);
			name = name.replace(/(^\s*)|(\s*$)/gi, "");
			name=name.replace(" ","");
							console.log('trim후 name: '+name);
			if(username != 0){
				console.log('id null 아님')

				reqMemberRegister(username,name)
				
			}else{
				console.log('id null')
			}
		

		}
	})

}

	function reqMemberRegister(id,name) {
		setMxValue();


		document.ssignform.mem_id.value=id;
		document.ssignform.mem_nm.value=name;

		//var ssignform = document.getElementById('ssignform');  //FORM
		//SSIGN_REQUEST(ssignform); //창 연동 스크립트
		SSIGN_REQUEST(document.ssignform); //창 연동 스크립트
	}

	/**
		처리시간은 예제 작성 편의상 브라우져 PC 시간을 사용합니다.
		실제로는 웹서버의 시간을 사용해야 합니다.!!
	*/
	function setTxTime() {
		var time = new Date();
		var year = time.getYear() + "";
		var month = time.getMonth()+1;
		var date = time.getDate();
		var hour = time.getHours();
		var min = time.getMinutes();
		var sec = time.getSeconds();
		if(month<10){
			month = "0" + month;
		}
		if(date<10){
			date = "0" + date;
		}
		if(hour<10){
			hour = "0" + hour;
		}
		if(min<10){
			min = "0" + min;
		}
		if(sec<10){
			sec = "0" + sec;
		}
		return year + month + date + hour + min + sec;
	}

	/**
		처리번호(mx_issue_no), 처리일시(mx_issue_date) 생성 예제
		예제에서는 편의상 처리시간을 처리번호로 사용합니다.
		실제로는 이용기관 사이트의 고유 주문번호를 사용해야 합니다.
	*/
	function setMxValue() {
		var tmp = setTxTime();
		document.ssignform.mx_issue_no.value = "M" + tmp;
		document.ssignform.mx_issue_date.value = tmp;
	}

//-->
</script>
</head>

<body>

<!--동의정보용-->
<form name="ssignform" id="ssignform" method="POST">
<!-- 동의 결과 페이지 전송을 위한 parameter 시작 (수정하지 말것) -->
	<input type="hidden" name="result_yn" value="" />
	<input type="hidden" name="result_msg" value="" />

	<!-- 실시간출금 결과를 위한 parameter -->
	<input type="hidden" name="pay_result_yn" value="" />
	<input type="hidden" name="pay_result_msg" value="" />
	<input type="hidden" name="pay_result_amount" value="" />
	<input type="hidden" name="pay_fee" value="" />
<!-- 동의 결과 페이지 전송을 위한 parameter 끝 -->

<!-- 공통 parameter 설정 시작 -->
	<input type="hidden" name="work_kind" value="N" />		<!-- 등록구분:N[신규] -->
	<input type="hidden" name="pay_type" value="01" />		<!-- 결제수단구분:['01':CMS/'02':CARD/'03':실시간CMS] -->
	<input type="hidden" name="cust_id" value="selphone" />	<!-- 이용기관 ID[필수] -->
	<input type="hidden" name="mx_issue_no" />				<!-- 처리 번호(이용기관 생성, 중복X) -->
	<input type="hidden" name="mx_issue_date" />				<!-- 처리 일자(이용기관 생성, YYYYMMDDhhmmss) -->
	<input type="hidden" name="job_mode" value="11" />		<!-- 처리 모드('11':실제등록/00:테스트) -->
	<input type="hidden" name="ret_param" value="" />			<!-- 이용기관용 값, DBPATH로 return -->
	<input type="hidden" name="ret_param2" value="" />		<!-- 이용기관용 값, REDIRPATH로 return -->
	<input type="hidden" name="host" value="selphone.co.kr" /><!-- 이용기관 서버 도메인 네임 또는 아이피 ('http://' 제외, 예:'www.test.com' 포트가 있을 경우 www.test.com:8080 과 같이 기술) -->
	<input type="hidden" name="dbpath" value="/store/ssign/Dbpath.php" />			<!-- 결과 저장 파일 경로(예:'/regmem/dbpath.asp') -->
	<input type="hidden" name="redirpath" value="/store/ssign/Redirpath.php" />	<!-- 결과 화면 파일 경로(예:'/regmem/redirpath.asp') -->
	<input type="hidden" name="pay_flag" value="N" />		<!-- 동의 후 즉시결제 처리유무(Y, N) -->

	<!-- 회원정보용 parameter 설정 시작 -->
	<input type="hidden" name="mem_id" value="01077774796" />		<!-- 회원번호 (업체회원번호 자동부여 시, 무시됨) -->
	<input type="hidden" name="auth_key" value="" />	<!-- 효성발행 인증 Key, 수정/해지 시 필수 -->
	<input type="hidden" name="mem_nm" value="셀폰_송도점" />		<!-- 회원명, 이용기관용 회원정보 -->
<!-- 공통 parameter 설정 끝 -->

	<!-- 요청 paremeter, 옵션 -->
	<input type="hidden" name="pay_dt" value="25" />			<!-- 약정일:01일~30일 (생략시 01일) -->
	<input type="hidden" name="pay_start" value="" />			<!-- 결제시작일 (생략시 오늘) -->
	<input type="hidden" name="pay_end" value="" />			<!-- 결제종료일 (생략시 99991231) -->
	<input type="hidden" name="pay_amount" value="" />		<!-- 회원기본결제금액 (생략시 0원) -->
	<input type="hidden" name="sms_flag" value="N" />			<!-- SMS수신여부(Y/N) -->
	<input type="hidden" name="mem_tel" value="" />			<!-- 회원전화번호(휴대폰번호) -->
	<input type="hidden" name="mem_text" value="" />			<!-- 회원메모 -->
	<input type="hidden" name="receipt_flag" value="N" />		<!-- 현금영수증사용여부(Y/N) -->
	<input type="hidden" name="receipt_key" value="" />		<!-- 현금영수증정보 -->
	<input type="hidden" name="mem_reg_flag" value="N" />		<!-- 결제회원 자동등록(Y, N) -->
	<input type="hidden" name="join_cert" value="N" />		<!-- 동의대행 접근(Y, N) -->
<!-- 회원정보용 parameter 설정 끝 -->

</form>
<!--동의정보용,끝-->


<p>셀폰 자동결제 전자동의페이지 입니다</p>
<p>발급받은 아이디/비밀번호로 로그인하시면 전자동의 페이지로 이동합니다</p>

<!--<p><input type='button' value='서명 동의' onClick='reqMemberRegister("0101111","셀폰_낙성대점");'></p> -->

    <form id="form_login">
<input type="text" id="login_id"  name="login_id" size="40" placeholder="ID"><br>
<input type="password" id="login_password" name="login_password" size="40" placeholder="PASSWORD"> <br>


<input type="button" id="btn_login" name="btn_login" value="로그인" onclick='login()'> 
<br> <b id="result_login" name="result_login"></b>
</body>
</html>