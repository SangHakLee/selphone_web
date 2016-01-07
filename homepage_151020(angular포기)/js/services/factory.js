'use strict';


app.factory('selphonePostsFactory', function($http){
   	var factory = {
      	getSelphonePosts : function(callback){
        	factory.selphonePosts = $http.get("http://54.178.140.51/selphone-posts").success(callback);
    	},
	    selphonePosts : null
	}
   return factory;
});
