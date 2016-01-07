function generateState() {
		// CSRF 방지를 위한 state token 생성 코드
		// state token은 추후 검증을 위해 세션에 저장 되어야 합니다.
		var oDate = new Date();
		return oDate.getTime();
	}
function saveState(state) {

	$.removeCookie("state_token");
	$.cookie("state_token", state);
}

// 아래 정보는 개발자 센터에서 애플리케이션 등록을 통해 발급 받을 수 있습니다.
var naver = NaverAuthorize({

	// 코다리
	redirect_uri : "http://54.178.140.51/login/web/naver",
	client_id : "TKbzJlQrljxRzCmvFs7f"

});

//공식 블로그
// $("#NaverIdLoginBTN").click( function () {
// 	alert('네아버 로그인 ')
// 	var state = generateState();
// 	saveState(state);
// 	naver.login(state);
// });
//

function loginWithNaver(callback){
	var data = {
		response_type : "code",
		client_id : "TKbzJlQrljxRzCmvFs7f",
		// redirect_uri : "http://54.65.224.177",
		state : generateState()
	}
	$.ajax({
    url: "https://nid.naver.com/oauth2.0/authorize",
    type : "GET",
    data : data,
    crossDomain : true,
    xhrFields: {withCredentials: true}, // 이게 세션 유지하는거
    success: function(res) {
    	console.log('성공', res);
      callback(true, res)

    },
    error: function(res) {
      callback(false, res.responseText)
      alert("로그인 실패"+res.responseText);
    }
  });
	// var state = generateState();
	// saveState(state);
	// naver.login(state);

}
