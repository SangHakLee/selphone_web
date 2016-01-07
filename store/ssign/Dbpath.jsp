<%@ page language="java" contentType="text/html; charset=EUC-KR" pageEncoding="EUC-KR"%>

<%@ page import="java.io.*" %>
<%@ page import="java.util.*" %>
<%@ page import="java.net.*" %>
<%@ page import="java.security.MessageDigest" %>
<%@ page import="java.lang.*" %>
<%
	
	/*
	DBPATH 페이지는동의가 완료되면, 결과를 전송 받아서  DB에 저장 합니다.
	동의 완료와 동시에 DBPATH로 결과를 전송하고, DBPATH로 부터 return 메시지가
	확인이 되면, 진행 중이던 동의 창은 최종  완료 페이지를 출력합니다.
	따라서, DBPATH가 비 정상적인 경우에는 지연의 원인이 될 수 있습니다.
	아래와 같은 값이 POST 방식으로 전송됩니다. 자세한 설명은 메뉴얼을 참고바랍니다.
	*/
	
	// 공통
	String result_msg		 = new String(request.getParameter("result_msg").getBytes("8859_1"), "euc-kr");
	String result_yn		 = request.getParameter("result_yn");
	String mx_issue_no		 = request.getParameter("mx_issue_no");
	String mx_issue_date	 = request.getParameter("mx_issue_date");
	String ret_param		 = new String(request.getParameter("ret_param").getBytes("8859_1"), "euc-kr");
	String mem_id			 = request.getParameter("mem_id");
	String mem_nm			 = new String(request.getParameter("mem_nm").getBytes("8859_1"), "euc-kr");
	String mx_hash			 = request.getParameter("mx_hash");
	String auth_key			 = request.getParameter("auth_key");
	// 실시간CMS 전용
	String pay_flag			 = request.getParameter("pay_flag");
	String pay_result_yn	 = request.getParameter("pay_result_yn");
	String pay_result_msg	 = new String(request.getParameter("pay_result_msg").getBytes("8859_1"), "euc-kr");
	String pay_result_amount = request.getParameter("pay_result_amount");
	String pay_fee			 = request.getParameter("pay_fee");

	
	/*
	결제 정보의 위/변조 여부를 확인하기 위해, 
	주요 결제 정보를 MD5 암호화 알고리즘으로 HASH 처리한 MxHASH 값을 받아
	동일한 규칙으로 DBPATH에서 생성한 값(output)과 비교합니다.
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
	String output = strBuf.toString(); // HASH 값 생성
	int isOK = 0;
	String returnMsg = "ACK=400FAIL";
	/*
	MxHASH 값과 output 생성 값을 비교해서 일치하는 경우에만 결과 저장
	*/
	if(mx_hash!=null && mx_hash.equals(output)) {  // 일치하는 경우
        if(result_yn.equals("Y")){
 			/*
			이 부분에서 DB에 결과를 저장하는 소스 코딩 필요
			예) isOK = (DB 업데이트 결과);
			*/
			isOK = 1;
			if(isOK==1){	// DB 저장 성공이면
				returnMsg = "ACK=200OKOK";
			}
        }else{
			/*
			이 부분에서 DB에 결과를 저장하는 소스 코딩 필요
			(실패 내용 기록 필요시)
			*/
			isOK = 1;
        	if(isOK==1){	// DB 저장 성공이면
				returnMsg = "ACK=200OKOK";
			}
        }
	}else{
		returnMsg = "ACK=400FAIL";
	}
%>
<%=returnMsg%>