<?
    /*
    REDIRPATH ���������� redirection �Ǵ� ó�� ��� ���� Ȯ�� ������ �Դϴ�.
    */

    if (phpversion() >= 4.2) { // POST, GET ��Ŀ� ���� ���� ����ϱ� ���ؼ�
        if (count($_POST)) extract($_POST, EXTR_PREFIX_SAME, 'VARS_');
        if (count($_GET)) extract($_GET, EXTR_PREFIX_SAME, '_GET');
    }


    /*
    �Ʒ��� ���� ���� ���۵˴ϴ�. �ڼ��� ������ �Ŵ����� ����ٶ��ϴ�.

	// ����
	$result_yn			// ó�� �������� ����['Y':����/'N':����]
	$result_msg			// ó���޽���
	$mx_issue_no		// ó����ȣ
	$mx_issue_date		// ó������
	$ret_param2			// �̿����� ��
	$mem_id				// ȸ����ȣ
	$mem_nm				// �̿����� ȸ������
	$auth_key			// ȿ������key
	// �ǽð�CMS ����
	$pay_flag			// ���� �� ��ð��� ó������(�ǽð�CMS ����)
	$pay_result_yn		// ��� ���� ���� ����(�ǽð�CMS ����)
	$pay_result_msg		// ��� ��� �޽���(�ǽð�CMS ����)
	$pay_result_amount	// ��� ��� �ݾ�(�ǽð�CMS ����)
	$pay_fee			// ��� ������(�ǽð�CMS ����)
    */
?>

<html>
<head>
<title>::::: ���� ��� Ȯ��(PHP) :::::</title>
<meta http-equiv="Content-Type" content="text/html; charset=euc-kr"/>
</head>
<body>
	<b>���� ��� :</b>
	<? if($result_yn!=null && ($result_yn) == "Y"){ ?>
		<b>&nbsp;���� �����߽��ϴ�.(PHP)</b><br/>
	<? }else{ ?>
		<b>&nbsp;���� �����߽��ϴ�.(PHP)</b><br/>
	<? } ?>
	<br/>
	<br/>
	<p>���� ���� Ȯ��</p>
	�̸� :&nbsp;<?=$mem_nm!=null ? $mem_nm : "" ?><br/>
	ó����ȣ :&nbsp;<?=$mx_issue_no!=null ? $mx_issue_no : "" ?><br/>
	�������� :&nbsp;<?=$mx_issue_date!=null ? $mx_issue_date : "" ?><br/>
	ȸ������ :&nbsp;<?=$mem_id!=null ? $mem_id : "" ?><br/>
	������� :&nbsp;<?=$result_yn!=null ? $result_yn : "" ?><br/>
	����޽��� :&nbsp;<?=$result_msg!=null ? $result_msg : "" ?><br/>
	����Ű :&nbsp;<?=$auth_key!=null ? $auth_key : "" ?><br/>



</body>
</html>