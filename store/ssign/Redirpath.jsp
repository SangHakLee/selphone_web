<%@ page language="java" import="java.net.*" contentType="text/html; charset=euc-kr" pageEncoding="EUC-KR"%>

<%
	/*
	����â ����, ȸ��(�̿���) ���� ��� Ȯ�� ������(RESULT ������)�� ȣ���ϱ� ���� ������ �Դϴ�.
	(���� �Ϸ� -> DBPATH ������� -> REDIRPATH ������ -> ����â ���� -> RESULT ������)
	*/

	String RESULTPATH		= "/Result.jsp";	 // ��� Ȯ�� �������� ��������� ��θ� �����մϴ�.
	String CLOSETYPE		= "OFF"; // â�� ���⼭ ���� ������ ���� ���������� ���� ������. (�Ϲ������� OFF)
	// ����
	String result_msg		= new String(request.getParameter("result_msg").getBytes("8859_1"), "euc-kr");
	String result_yn		= request.getParameter("result_yn");
	String mx_issue_no		= request.getParameter("mx_issue_no");
	String mx_issue_date	= request.getParameter("mx_issue_date");
	String ret_param2		= new String(request.getParameter("ret_param2").getBytes("8859_1"), "euc-kr");
	String mem_id			= request.getParameter("mem_id");
	String mem_nm			= new String(request.getParameter("mem_nm").getBytes("8859_1"), "euc-kr");
	String mx_hash			= "";
	String auth_key			= request.getParameter("auth_key");
	// �ǽð�CMS ����
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
		opener.document.ssignform.submit(); //����
<% if (CLOSETYPE.equals("OFF")) { %>
		self.close(); //â�ݱ�!
<% } %>
	}

proceed();

//-->
</script>
</head>
<body>
</body>
</html>
