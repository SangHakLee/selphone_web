'use strict';

var app = angular.module('selphoneApp', ['ngRoute', 'ui.bootstrap', 'ngCookies', 'ngDialog']);
app.config(function($routeProvider) {
	//주소설정 : when() 이용
	//$routeProvider.when(링크:옵션객체);
	//$routeProvider.when(링크:옵션객체);

	var viewBase = "../views/";
	
	//옵션객체 주요속성 
	// 1) template : 마크업코드를 직접 작성
	// 2) templateUrl : 실제 뷰(View) 페이지의 경로
	//3) controller

	$routeProvider.when("/selphonePosts",{
		templateUrl: viewBase + "selphonePosts.html",
		controller:"selphonePostsCtrl"
	});


	$routeProvider.when("/services",{
		templateUrl: viewBase + "services.html"
// 		controller:"ddayController"
	});
	
	$routeProvider.when("/about",{
		templateUrl: viewBase + "about.html"
	});
	
	$routeProvider.when("/team",{
		templateUrl: viewBase + "team.html"
	});
	
	$routeProvider.when("/contact",{
		templateUrl: viewBase + "contact.html"
	});

	//주소가 없을때 기본페이지 설정
	$routeProvider.otherwise({redirectTo:"/selphonePosts"});


});
