<%@ page language="java"
	import="java.net.*"
	contentType="text/html; charset=EUC-KR"
%>
<html>
<head>
<title>::::: ��� Ȯ��(JSP) :::::</title>
<meta http-equiv="Content-Type" content="text/html; charset=EUC-KR"/>



</head>
<body>



<%
	/*
	REDIRPATH ���������� redirection �Ǵ� ó�� ��� ���� Ȯ�� ������ �Դϴ�.
	
	�Ʒ��� ���� ���� ���۵˴ϴ�. �ڼ��� ������ �޴����� ����ٶ��ϴ�.
	*/

	// ����
	String result_msg		 = new String(request.getParameter("result_msg").getBytes("8859_1"), "euc-kr");
	String result_yn		 = request.getParameter("result_yn");
	String mx_issue_no		 = request.getParameter("mx_issue_no");
	String mx_issue_date	 = request.getParameter("mx_issue_date");
	String ret_param2		 = new String(request.getParameter("ret_param2").getBytes("8859_1"), "euc-kr");
	String mem_id			 = request.getParameter("mem_id");
	String mem_nm			 = new String(request.getParameter("mem_nm").getBytes("8859_1"), "euc-kr");
	String auth_key			 = request.getParameter("auth_key");
	// �ǽð�CMS ����
	String pay_flag			 = request.getParameter("pay_flag");
	String pay_result_yn	 = request.getParameter("pay_result_yn");
	String pay_result_msg	 = new String(request.getParameter("pay_result_msg").getBytes("8859_1"), "euc-kr");
	String pay_result_amount = request.getParameter("pay_result_amount");
	String pay_fee			 = request.getParameter("pay_fee");

%>



	<br/>
	<p>���� ���� Ȯ��</p>
	������� :&nbsp;<%= result_yn!=null?result_yn:"" %><br/>
	����޽��� :&nbsp;<%= result_msg!=null?result_msg:"" %><br/>
	ó����ȣ :&nbsp;<%= mx_issue_no!=null ? mx_issue_no : "" %><br/>
	�������� :&nbsp;<%= mx_issue_date!=null?mx_issue_date:"" %><br/>
	����Ű :&nbsp;<%= auth_key!=null?auth_key:"" %><br/>
	�̿��� ������ :&nbsp;<%= ret_param2!=null?ret_param2:"" %><br/>
	ȸ��id :&nbsp;<%= mem_id!=null?mem_id:"" %><br/>
	ȸ���� :&nbsp;<%= mem_nm!=null?mem_nm:"" %><br/>

	��� ��� ���� :&nbsp;<%= pay_result_yn!=null?pay_result_yn:"" %><br/>
	��� ��� �޽��� :&nbsp;<%= pay_result_msg!=null?pay_result_msg:"" %><br/>
	��� ��� �ݾ� :&nbsp;<%= pay_result_amount!=null?pay_result_amount:"0" %><br/>
	��� ������ :&nbsp;<%= pay_fee!=null?pay_fee:"0" %><br/>


</body>
</html>