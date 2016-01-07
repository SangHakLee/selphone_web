// Kakao.init('2f5fdf7b90ed0ca2e8dca0db960b1ffd'); // 팀장님키 키
Kakao.init('7e5b0b4eef8e25ee8078f1c2f018b7c6'); // 내 키
function loginWithKakao(callback) {
  // 로그인 창을 띄웁니다.
  Kakao.Auth.login({
    success: function(authObj) {
    	var refreshToken = Kakao.Auth.getRefreshToken();
    	var accessToken = Kakao.Auth.getAccessToken();
    	var data = {
        "accessToken":accessToken,
        "type" : "kakao",
        "regId" : "web"
      };
    	console.log(' Kakao.Auth.login success');
    	console.log('refreshToken', refreshToken);
    	console.log('accessToken', accessToken);
      $.ajax({
        url: "http://54.178.140.51/login",
        type : "post",
        data : data,
        crossDomain : true,
        xhrFields: {withCredentials: true}, // 이게 세션 유지하는거
        success: function(res) {
          callback(true, res)
        },
        error: function(res) {
          callback(false, res.responseText)
          alert("로그인 실패"+res.responseText);
        }
      });
    },
    fail: function(err) {
      console.log('fail');
      alert(JSON.stringify(err))
    }
  });
};