<%@ page language="java" contentType="text/html; charset=EUC-KR" pageEncoding="EUC-KR"%>

<%@ page import="java.io.*" %>
<%@ page import="java.util.*" %>
<%@ page import="java.net.*" %>
<%@ page import="java.security.MessageDigest" %>
<%@ page import="java.lang.*" %>
<%
	
	/*
	DBPATH �������µ��ǰ� �Ϸ�Ǹ�, ����� ���� �޾Ƽ�  DB�� ���� �մϴ�.
	���� �Ϸ�� ���ÿ� DBPATH�� ����� �����ϰ�, DBPATH�� ���� return �޽�����
	Ȯ���� �Ǹ�, ���� ���̴� ���� â�� ����  �Ϸ� �������� ����մϴ�.
	����, DBPATH�� �� �������� ��쿡�� ������ ������ �� �� �ֽ��ϴ�.
	�Ʒ��� ���� ���� POST ������� ���۵˴ϴ�. �ڼ��� ������ �޴����� ����ٶ��ϴ�.
	*/
	
	// ����
	String result_msg		 = new String(request.getParameter("result_msg").getBytes("8859_1"), "euc-kr");
	String result_yn		 = request.getParameter("result_yn");
	String mx_issue_no		 = request.getParameter("mx_issue_no");
	String mx_issue_date	 = request.getParameter("mx_issue_date");
	String ret_param		 = new String(request.getParameter("ret_param").getBytes("8859_1"), "euc-kr");
	String mem_id			 = request.getParameter("mem_id");
	String mem_nm			 = new String(request.getParameter("mem_nm").getBytes("8859_1"), "euc-kr");
	String mx_hash			 = request.getParameter("mx_hash");
	String auth_key			 = request.getParameter("auth_key");
	// �ǽð�CMS ����
	String pay_flag			 = request.getParameter("pay_flag");
	String pay_result_yn	 = request.getParameter("pay_result_yn");
	String pay_result_msg	 = new String(request.getParameter("pay_result_msg").getBytes("8859_1"), "euc-kr");
	String pay_result_amount = request.getParameter("pay_result_amount");
	String pay_fee			 = request.getParameter("pay_fee");

	
	/*
	���� ������ ��/���� ���θ� Ȯ���ϱ� ����, 
	�ֿ� ���� ������ MD5 ��ȣȭ �˰������� HASH ó���� MxHASH ���� �޾�
	������ ��Ģ���� DBPATH���� ������ ��(output)�� ���մϴ�.
    */
	MessageDigest md	= MessageDigest.getInstance("MD5");
	byte[] input		= ("F&" + mem_id + mx_issue_no + mx_issue_date).getBytes();
	byte[] output1		= md.digest(input);
	StringBuffer strBuf	= new StringBuffer();
	for (int i=0; i<output1.length; i++) {
		int c = output1[i] & 0xff;
		if (c <= 15) {
			strBuf.append("0");
		}
		strBuf.append(Integer.toHexString(c));
	}
	String output = strBuf.toString(); // HASH �� ����
	int isOK = 0;
	String returnMsg = "ACK=400FAIL";
	/*
	MxHASH ���� output ���� ���� ���ؼ� ��ġ�ϴ� ��쿡�� ��� ����
	*/
	if(mx_hash!=null && mx_hash.equals(output)) {  // ��ġ�ϴ� ���
        if(result_yn.equals("Y")){
 			/*
			�� �κп��� DB�� ����� �����ϴ� �ҽ� �ڵ� �ʿ�
			��) isOK = (DB ������Ʈ ���);
			*/
			isOK = 1;
			if(isOK==1){	// DB ���� �����̸�
				returnMsg = "ACK=200OKOK";
			}
        }else{
			/*
			�� �κп��� DB�� ����� �����ϴ� �ҽ� �ڵ� �ʿ�
			(���� ���� ��� �ʿ��)
			*/
			isOK = 1;
        	if(isOK==1){	// DB ���� �����̸�
				returnMsg = "ACK=200OKOK";
			}
        }
	}else{
		returnMsg = "ACK=400FAIL";
	}
%>
<%=returnMsg%>