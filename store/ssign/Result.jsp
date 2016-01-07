<%@ page language="java"
	import="java.net.*"
	contentType="text/html; charset=EUC-KR"
%>
<html>
<head>
<title>::::: 결과 확인(JSP) :::::</title>
<meta http-equiv="Content-Type" content="text/html; charset=EUC-KR"/>



</head>
<body>



<%
	/*
	REDIRPATH 페이지에서 redirection 되는 처리 결과 정보 확인 페이지 입니다.
	
	아래와 같은 값이 전송됩니다. 자세한 설명은 메뉴얼을 참고바랍니다.
	*/

	// 공통
	String result_msg		 = new String(request.getParameter("result_msg").getBytes("8859_1"), "euc-kr");
	String result_yn		 = request.getParameter("result_yn");
	String mx_issue_no		 = request.getParameter("mx_issue_no");
	String mx_issue_date	 = request.getParameter("mx_issue_date");
	String ret_param2		 = new String(request.getParameter("ret_param2").getBytes("8859_1"), "euc-kr");
	String mem_id			 = request.getParameter("mem_id");
	String mem_nm			 = new String(request.getParameter("mem_nm").getBytes("8859_1"), "euc-kr");
	String auth_key			 = request.getParameter("auth_key");
	// 실시간CMS 전용
	String pay_flag			 = request.getParameter("pay_flag");
	String pay_result_yn	 = request.getParameter("pay_result_yn");
	String pay_result_msg	 = new String(request.getParameter("pay_result_msg").getBytes("8859_1"), "euc-kr");
	String pay_result_amount = request.getParameter("pay_result_amount");
	String pay_fee			 = request.getParameter("pay_fee");

%>



	<br/>
	<p>동의 정보 확인</p>
	결과구분 :&nbsp;<%= result_yn!=null?result_yn:"" %><br/>
	결과메시지 :&nbsp;<%= result_msg!=null?result_msg:"" %><br/>
	처리번호 :&nbsp;<%= mx_issue_no!=null ? mx_issue_no : "" %><br/>
	동의일자 :&nbsp;<%= mx_issue_date!=null?mx_issue_date:"" %><br/>
	인증키 :&nbsp;<%= auth_key!=null?auth_key:"" %><br/>
	이용기관 지정값 :&nbsp;<%= ret_param2!=null?ret_param2:"" %><br/>
	회원id :&nbsp;<%= mem_id!=null?mem_id:"" %><br/>
	회원명 :&nbsp;<%= mem_nm!=null?mem_nm:"" %><br/>

	출금 결과 구분 :&nbsp;<%= pay_result_yn!=null?pay_result_yn:"" %><br/>
	출금 결과 메시지 :&nbsp;<%= pay_result_msg!=null?pay_result_msg:"" %><br/>
	출금 결과 금액 :&nbsp;<%= pay_result_amount!=null?pay_result_amount:"0" %><br/>
	출금 수수료 :&nbsp;<%= pay_fee!=null?pay_fee:"0" %><br/>


</body>
</html>