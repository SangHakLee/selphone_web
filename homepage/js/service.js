app.service('LoginService', function(SessionInfoService, $http){
            // this.isLogin =  return isLogin;
            this.Login = function(callback){
                loginWithKakao(function(isSuccess, result){
                    if(isSuccess){
                        console.log('loginWithKakao isSuccess');
                        console.log('loginWithKakao result',result.result);
						SessionInfoService.checkIsLogin();
//                         SessionInfoService.reset(); 세션의 데이터와 db 데이터가 불일치 하기 때문에
//                         SessionInfoService.setUserInfo(result.result);
                        callback(result.result);
                    }else{
                        console.log('loginWithKakao error');
                    }
                });
            }
            this.Logout = function(callback){
                http($http, "POST", DEV_HOST+"/logout", null, function(isSuccess, result){
                    callback(isSuccess);
                })
            }
            SessionInfoService.checkIsLogin();
        });
		
				
        app.service('SessionInfoService', function($rootScope, $http){
	        this.sessionStorageKey = "__SESSION_INFO";
	        try {
                $rootScope.currentUser = JSON.parse(sessionStorage.getItem(this.sessionStorageKey) || "{}");
            } catch(e) {
                $rootScope.currentUser = {};
            };
            
	        this.checkIsLogin = function(){
				http($http, "GET", DEV_HOST+"/is-login", null, function(isSuccess, result){
				console.log('로그인 체크 ', result.login_info)
				if(result.is_login){
					userInfo(result.login_info); // 코드 정리 필요
				}else{ // 로그인 안됨
					userInfoReset(); // 혹시 남은 웹 세션 제거
				}
// 				console.log('getCurrentUser()', )
//                 callback(isSuccess, result);
	            })
// 	            return this.getCurrentUser();
			};


            this.getCurrentUser = function() {
                return $rootScope.currentUser;
            };
            this.isUserSignedIn = function() {
                if(this.getCurrentUser() && this.getCurrentUser().id) {
                    return true;
                }else {
                    return false;
                }
            };
            var userInfo = function(info){ // this.setUserInfo가 안되서 임시적으로 만듬
	            angular.extend($rootScope.currentUser, info);
                sessionStorage.setItem(this.sessionStorageKey, JSON.stringify($rootScope.currentUser));
            };
            this.setUserInfo = function(info) {
// 	            angular.extend($rootScope.currentUser, info);
//              sessionStorage.setItem(this.sessionStorageKey, JSON.stringify($rootScope.currentUser));
                userInfo(info);
            };
            
			var userInfoReset = function(){
				$rootScope.currentUser = {};
                sessionStorage.setItem(this.sessionStorageKey, JSON.stringify($rootScope.currentUser));
			}
            this.reset = function() {
//                 $rootScope.currentUser = {};
//                 sessionStorage.setItem(this.sessionStorageKey, JSON.stringify($rootScope.currentUser));
				userInfoReset();
            };
        });
