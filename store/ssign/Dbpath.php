<?
	/*
	DBPATH 페이지는 동의가 완료되면, 결과를 전송 받아서 이용기관의 DB에 저장 합니다.
	동의 완료와 동시에 DBPATH로 결과를 전송하고, DBPATH로 부터 return 메시지가
	확인이 되면, 처리 진행 중이던 동의 창은 최종 처리 완료 페이지를 출력합니다.
	따라서, DBPATH가 비 정상적인 경우에는 지연의 원인이 될 수 있습니다.
	*/

	if (phpversion() >= 4.2) { // POST, GET 방식에 관계 없이 사용하기 위해서
		if (count($_POST)) extract($_POST, EXTR_PREFIX_SAME, 'VARS_');
		if (count($_GET)) extract($_GET, EXTR_PREFIX_SAME, '_GET');
	}

	/*
		아래와 같은 값이 POST 방식으로 전송됩니다. 자세한 설명은 매뉴얼을 참고바랍니다.
	// 공통
	$result_yn		// 처리 성공실패 여부['Y':성공/'N':실패]
	$result_msg		// 처리메시지
	$mx_issue_no	// 처리번호
	$mx_issue_date	// 처리일자
	$ret_param		// 이용기관용 값
	$mem_id			// 회원번호
	$mem_nm			// 이용기관용 회원정보
	$mx_hash		// 해쉬값
	$auth_key		// 효성인증key
	// 실시간CMS 전용
	$pay_flag			// 동의 후 즉시결제 처리유무(실시간CMS 전용)
	$pay_result_yn		// 출금 성공 실패 여부(실시간CMS 전용)
	$pay_result_msg		// 출금 결과 메시지(실시간CMS 전용)
	$pay_result_amount	// 출금 결과 금액(실시간CMS 전용)
	$pay_fee			// 출금 수수료(실시간CMS 전용)

	*/
	/*
	처리 정보의 위/변조 여부를 확인하기 위해,
	주요 처리 정보를 MD5 암호화 알고리즘으로 HASH 처리한 mx_hash 값을 받아
	동일한 규칙으로 DBPATH에서 생성한 값(output)과 비교합니다.
	*/

	/*
	MD5 알고리즘을 이용한 HASH 값 생성
	*/
	$output = md5("F&" . $mem_id . $mx_issue_no . $mx_issue_date);

	$isOK = 0;
	$returnMsg = "ACK=200OKOK";

	/*
	mx_hash 값과 output 생성 값을 비교해서 일치하는 경우에만 결과 저장
	*/

//return 메시지('ACK=200OKOK' or 'ACK=400FAIL')를 출력해야 정상 처리됩니다.
echo $returnMsg; 
?>
<? echo $returnMsg;?>
<? //return 메시지('ACK=200OKOK' or 'ACK=400FAIL')를 출력해야 정상 처리됩니다. ?>

