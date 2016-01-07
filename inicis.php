<?php

//REQUEST ************************************
$P_STATUS = $_POST[‘P_STATUS’];
$P_REQ_URL = $_POST[‘P_REQ_URL’];
$P_TID = $_POST[‘P_TID’];
$P_MID = $_POST[‘P_MID’];

echo 'Hello';

$string = "Hello World ! <br/>"
echo $string

function makeParam($P_TID, $P_MID){
  return "P_TID=".$P_TID."&P_MID=".$P_MID;
}
function parseData($receiveMsg) { //승인결과 Parse
	$returnArr = explode(“&”,$receiveMsg);
	foreach($returnArr as $value){
		$tmpArr = explode(“=”,$value);
		$returnArr[] = $tmpArr;
	}
}
function chkTid($P_TID);
function saveTid($P_TID);
function setSocket($host, $port);
function connectSocket($sock);
function requestSocket($sock,$param); //데이터 송신
function responseSocket(); //데이터 수신

if($P_STATUS==”00” && chkTid($P_TID)){
	$sock = setSocket($P_REQ_URL,443); //https connection
	connectSocket($sock);
	requestSocket($sock,makeParam($P_TID, $P_MID));
	$returnData = responseSocket();
	$returnDataArr = parseData($returnData); //$returnDataArr 에 승인결과 저장
	saveTid($P_TID);
}
?>