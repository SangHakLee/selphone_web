'use strict';

// app.controller('loginModalCtrl', ['$scope', '$uibModal', function($scope, $uibModal){
app.controller('loginModalCtrl', ['$scope', 'ngDialog', function($scope, ngDialog){ // 세가지 sns 로그인 버튼 있는 모달 띄우기
	console.log('loginModalCtrl');
/*
	$scope.clickLoginBtn = function(){
		var modalInstance = $uibModal.open({
	      templateUrl: '../views/login.html',
	      controller: 'ModalInstanceCtrl'
	    });
		
		modalInstance.result.then(function () {
	      
	    }, function () {
	      
	    });
		
	}
*/
	$scope.clickLoginBtn = function(){
		ngDialog.open({ template: '../views/login.html' });
	};
	
	

}]);


app.controller('loginCtrl', ['$scope', '$window', '$compile', '$element',  function($scope, $window, $compile, $element){  
	console.log('loginCtrl');

	$scope.loginWithKakaoBtn = function(){
		$scope.window = $window.open('../views/loginKakao.html', '_blank', 'width=500,height=400');

	}
	
	
	
	$scope.loginWithGoogleBtn = function(){
		$window.open('../views/loginGoogle.html', '_blank', 'width=500,height=400');
	}
	$scope.loginWithNaverBtn = function(){

		$window.open('../views/loginNaver.html', '_blank', 'width=500,height=400');
	}
}]);



/*
app.controller('ModalInstanceCtrl', function ($scope, $modalInstance) {


  $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});
*/