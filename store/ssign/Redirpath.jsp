<%@ page language="java" import="java.net.*" contentType="text/html; charset=euc-kr" pageEncoding="EUC-KR"%>

<%
	/*
	동의창 종료, 회원(이용자) 동의 결과 확인 페이지(RESULT 페이지)를 호출하기 위한 페이지 입니다.
	(동의 완료 -> DBPATH 결과전송 -> REDIRPATH 페이지 -> 동의창 종료 -> RESULT 페이지)
	*/

	String RESULTPATH		= "/Result.jsp";	 // 결과 확인 페이지의 페이지명과 경로를 설정합니다.
	String CLOSETYPE		= "OFF"; // 창을 여기서 닫을 것인지 다음 페이지에서 닫을 것인지. (일반적으로 OFF)
	// 공통
	String result_msg		= new String(request.getParameter("result_msg").getBytes("8859_1"), "euc-kr");
	String result_yn		= request.getParameter("result_yn");
	String mx_issue_no		= request.getParameter("mx_issue_no");
	String mx_issue_date	= request.getParameter("mx_issue_date");
	String ret_param2		= new String(request.getParameter("ret_param2").getBytes("8859_1"), "euc-kr");
	String mem_id			= request.getParameter("mem_id");
	String mem_nm			= new String(request.getParameter("mem_nm").getBytes("8859_1"), "euc-kr");
	String mx_hash			= "";
	String auth_key			= request.getParameter("auth_key");
	// 실시간CMS 전용
	String pay_flag			= request.getParameter("pay_flag");
	String pay_result_yn	= request.getParameter("pay_result_yn");
	String pay_result_msg	= new String(request.getParameter("pay_result_msg").getBytes("8859_1"), "euc-kr");
	String pay_result_amount= request.getParameter("pay_result_amount");
	String pay_fee			= request.getParameter("pay_fee");
		
%>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=euc-kr" />
<script language="javascript">
<!--//

	function proceed() {
		opener.document.ssignform.result_yn.value = "<%=result_yn%>";
		opener.document.ssignform.result_msg.value = "<%=result_msg%>";
		opener.document.ssignform.mx_issue_no.value = "<%=mx_issue_no%>";
		opener.document.ssignform.mx_issue_date.value = "<%=mx_issue_date%>";		
		opener.document.ssignform.ret_param2.value = "<%=ret_param2%>";
		opener.document.ssignform.mem_id.value = "<%=mem_id%>";
		opener.document.ssignform.mem_nm.value = "<%=mem_nm%>";
		opener.document.ssignform.auth_key.value = "<%=auth_key%>";

		opener.document.ssignform.pay_flag.value = "<%=pay_flag%>";
		opener.document.ssignform.pay_result_yn.value = "<%=pay_result_yn%>";
		opener.document.ssignform.pay_result_msg.value = "<%=pay_result_msg%>";
		opener.document.ssignform.pay_result_amount.value = "<%=pay_result_amount%>";
		opener.document.ssignform.pay_fee.value = "<%=pay_fee%>";

		opener.document.ssignform.action = "<%=RESULTPATH%>";
		opener.document.ssignform.method = "post";
		opener.document.ssignform.target = "_self";
		opener.document.ssignform.submit(); //전송
<% if (CLOSETYPE.equals("OFF")) { %>
		self.close(); //창닫기!
<% } %>
	}

proceed();

//-->
</script>
</head>
<body>
</body>
</html>
