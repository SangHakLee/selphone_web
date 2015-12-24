var DEV_URL = 'http://54.178.140.51'
var PRD_URL = 'http://api.selphone.co.kr'
var URL = DEV_URL;


var User = function(user){
  var user;
  return {
    getUser : function(){
      return user;
    },
    setUser : function(_user){
      this.user = _user
    }
  }
}



var ajax = function(_type, _url, _data, _options, callback){
  var defaults = {
    type : _type,
    url : URL+_url,
    crossDomain : true , // multidomain option
    dataType : 'json',
    data : _data, // body에 보낼 데이터
    // processData: false, // processData false 해야만 formData 갈수 있다 Illegal invocation
    // contentType : false, // contentType false 해야만 body 내용이 이상하게 안간다(formData 일때)
    // cache : false, // false이면 caching을 하지 않기 위해 _=  값을 보낸다.
    processData : false,
    xhrFields : {withCredentials: true}, // 세션 사용할때 필수
    // success: function(data, textStatus, jqXHR) {
    //   callback(true, data)
    // },
    // error: function(jqXHR, textStatus, errorThrown) {
    //   callback(false, jqXHR.responseText)
    // }
  }
  var settings = defaults; // 기본 셋팅
  settings = $.extend({}, defaults, _options); // 추가 옵션 확장
  var ajax = $.ajax(settings)
  return ajax;
}

var logout = function(){
  console.log('logout');
  ajax("POST", "/logout", null, {})
  .done(function(data){
    location.href="./login.html";
  })
  .fail(function(e){
    alert(e.responseText);
  })
}

var loginCheck = function(){ //즉시 실행함수
  $.holdReady(true); //true면 DOM load를 멈추고 script 실행
  return ajax("GET", "/employees/check_isLogin", null, {})
  .done(function(data){
    if(data.is_login){
      var user = User(data.user_id);
      $("#userIdNav").text(user.getUser())
      console.log('로그인');
    }else{
      console.log('안로그린');
    }
  })
  .fail(function(e){
    alert(e.responseText); return;
  })
};

$("#logoutBtn").click(function(){
  logout();
})

