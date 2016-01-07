'use strict';


app.factory('selphonePostsFactory', function($http){
   	var factory = {
      	getSelphonePosts : function(callback){
        	factory.selphone_posts = $http.get("http://54.178.140.51/selphone-posts").success(callback);
    	},
	    selphone_posts : null
	}
   return factory;
});
