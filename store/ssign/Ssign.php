<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<html>
<head>
<title> ���� �ڵ����� ���ڵ��� </title>
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

/** Baas.IO ���� * */
var io = new Baas.IO({
	orgName : 'cca3e537-1dfa-11e4-a50e-06530c0000b4', // Your baas.io
	appName : 'ff090c61-1dfa-11e4-a50e-06530c0000b4' // Your baas.io app name
})




/** �α��� ��ü�� * */
function login() {

	// ID,PASSWORD ���� �����´�
	
	username = document.getElementById("login_id").value;
	password = document.getElementById("login_password").value;
	
	
	// �ش� ������ ������ �α��� �õ�
	io.login(username, password, function(errorFlag, responseData, userEntity) {
		console.log(responseData)

		if (errorFlag) {
			
			document.getElementById("result_login").innerHTML = "�α��ο���<br>"
					+ responseData.error_description;

			console.log('����')

		} else {

			
		
			document.getElementById("result_login").innerHTML = '�α��� ����';

		
			
			username = responseData.user.username
			name = responseData.user.name
				console.log('trim�� name: '+name);
			name = name.replace(/(^\s*)|(\s*$)/gi, "");
			name=name.replace(" ","");
							console.log('trim�� name: '+name);
			if(username != 0){
				console.log('id null �ƴ�')

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
		//SSIGN_REQUEST(ssignform); //â ���� ��ũ��Ʈ
		SSIGN_REQUEST(document.ssignform); //â ���� ��ũ��Ʈ
	}

	/**
		ó���ð��� ���� �ۼ� ���ǻ� ������ PC �ð��� ����մϴ�.
		�����δ� �������� �ð��� ����ؾ� �մϴ�.!!
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
		ó����ȣ(mx_issue_no), ó���Ͻ�(mx_issue_date) ���� ����
		���������� ���ǻ� ó���ð��� ó����ȣ�� ����մϴ�.
		�����δ� �̿��� ����Ʈ�� ���� �ֹ���ȣ�� ����ؾ� �մϴ�.
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

<!--����������-->
<form name="ssignform" id="ssignform" method="POST">
<!-- ���� ��� ������ ������ ���� parameter ���� (�������� ����) -->
	<input type="hidden" name="result_yn" value="" />
	<input type="hidden" name="result_msg" value="" />

	<!-- �ǽð���� ����� ���� parameter -->
	<input type="hidden" name="pay_result_yn" value="" />
	<input type="hidden" name="pay_result_msg" value="" />
	<input type="hidden" name="pay_result_amount" value="" />
	<input type="hidden" name="pay_fee" value="" />
<!-- ���� ��� ������ ������ ���� parameter �� -->

<!-- ���� parameter ���� ���� -->
	<input type="hidden" name="work_kind" value="N" />		<!-- ��ϱ���:N[�ű�] -->
	<input type="hidden" name="pay_type" value="01" />		<!-- �������ܱ���:['01':CMS/'02':CARD/'03':�ǽð�CMS] -->
	<input type="hidden" name="cust_id" value="selphone" />	<!-- �̿��� ID[�ʼ�] -->
	<input type="hidden" name="mx_issue_no" />				<!-- ó�� ��ȣ(�̿��� ����, �ߺ�X) -->
	<input type="hidden" name="mx_issue_date" />				<!-- ó�� ����(�̿��� ����, YYYYMMDDhhmmss) -->
	<input type="hidden" name="job_mode" value="11" />		<!-- ó�� ���('11':�������/00:�׽�Ʈ) -->
	<input type="hidden" name="ret_param" value="" />			<!-- �̿����� ��, DBPATH�� return -->
	<input type="hidden" name="ret_param2" value="" />		<!-- �̿����� ��, REDIRPATH�� return -->
	<input type="hidden" name="host" value="selphone.co.kr" /><!-- �̿��� ���� ������ ���� �Ǵ� ������ ('http://' ����, ��:'www.test.com' ��Ʈ�� ���� ��� www.test.com:8080 �� ���� ���) -->
	<input type="hidden" name="dbpath" value="/store/ssign/Dbpath.php" />			<!-- ��� ���� ���� ���(��:'/regmem/dbpath.asp') -->
	<input type="hidden" name="redirpath" value="/store/ssign/Redirpath.php" />	<!-- ��� ȭ�� ���� ���(��:'/regmem/redirpath.asp') -->
	<input type="hidden" name="pay_flag" value="N" />		<!-- ���� �� ��ð��� ó������(Y, N) -->

	<!-- ȸ�������� parameter ���� ���� -->
	<input type="hidden" name="mem_id" value="01077774796" />		<!-- ȸ����ȣ (��üȸ����ȣ �ڵ��ο� ��, ���õ�) -->
	<input type="hidden" name="auth_key" value="" />	<!-- ȿ������ ���� Key, ����/���� �� �ʼ� -->
	<input type="hidden" name="mem_nm" value="����_�۵���" />		<!-- ȸ����, �̿����� ȸ������ -->
<!-- ���� parameter ���� �� -->

	<!-- ��û paremeter, �ɼ� -->
	<input type="hidden" name="pay_dt" value="25" />			<!-- ������:01��~30�� (������ 01��) -->
	<input type="hidden" name="pay_start" value="" />			<!-- ���������� (������ ����) -->
	<input type="hidden" name="pay_end" value="" />			<!-- ���������� (������ 99991231) -->
	<input type="hidden" name="pay_amount" value="" />		<!-- ȸ���⺻�����ݾ� (������ 0��) -->
	<input type="hidden" name="sms_flag" value="N" />			<!-- SMS���ſ���(Y/N) -->
	<input type="hidden" name="mem_tel" value="" />			<!-- ȸ����ȭ��ȣ(�޴�����ȣ) -->
	<input type="hidden" name="mem_text" value="" />			<!-- ȸ���޸� -->
	<input type="hidden" name="receipt_flag" value="N" />		<!-- ���ݿ�������뿩��(Y/N) -->
	<input type="hidden" name="receipt_key" value="" />		<!-- ���ݿ��������� -->
	<input type="hidden" name="mem_reg_flag" value="N" />		<!-- ����ȸ�� �ڵ����(Y, N) -->
	<input type="hidden" name="join_cert" value="N" />		<!-- ���Ǵ��� ����(Y, N) -->
<!-- ȸ�������� parameter ���� �� -->

</form>
<!--����������,��-->


<p>���� �ڵ����� ���ڵ��������� �Դϴ�</p>
<p>�߱޹��� ���̵�/��й�ȣ�� �α����Ͻø� ���ڵ��� �������� �̵��մϴ�</p>

<!--<p><input type='button' value='���� ����' onClick='reqMemberRegister("0101111","����_��������");'></p> -->

    <form id="form_login">
<input type="text" id="login_id"  name="login_id" size="40" placeholder="ID"><br>
<input type="password" id="login_password" name="login_password" size="40" placeholder="PASSWORD"> <br>


<input type="button" id="btn_login" name="btn_login" value="�α���" onclick='login()'> 
<br> <b id="result_login" name="result_login"></b>
</body>
</html>