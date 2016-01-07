'use strict';

app.controller('selphonePostsCtrl', ['$scope','selphonePostsFactory',  function($scope, selphonePostsFactory){
	
	var selphonePosts = {} // 셀폰 보증폰 정보가 담길 객체 선언

	if(!selphonePostsFactory.selphone_posts){
// 		console.log('가져와야지')
		selphonePostsFactory.getSelphonePosts(function(results){
			results = results.results;
			console.log('results', results);
			$scope.selphone_posts = results;
			$scope.test = "test!!!";
			// angular.forEach(results, function(value , key) {
   //      console.log(value+"--"+key)
   //    })
		});
	}
}]);