var selectedProduct={};
//var selectedProductName;

$(window).ready(function(){

  getRecentPosts();
	getProductUsers();

});

/*Product_Users 데이터 가져오기*/
function getProductUsers(){
	console.log('getProductUsers start');
	ajaxRequest('GET', '/products-users', null, getProductUsersRes);
};

function getProductUsersRes(response, isSuccess){
	isSuccess ? productUsersDatas(response.responseJSON.results) : alert('요청 실패');
};

function productUsersDatas(response){

	//Autocomplete에서 사용하는 source 배열
	var product_users_list = [];

	for(i in response){
		var eachProduct = {};
		eachProduct.value = response[i].TB_PRODUCT.product_name;
		eachProduct.label = response[i].TB_PRODUCT.product_name;
		eachProduct.model = response[i].TB_PRODUCT.product_model;
		eachProduct.desc =  response[i].product_price_low + "원 ~ " + response[i].product_price_high + "원";
		eachProduct.count = response[i].product_count;
		eachProduct.icon = response[i].TB_PRODUCT.product_picture;

		product_users_list.push(eachProduct);
	}

	var inputProduct = $('#product_name');

	var models = {};
	var modelLabels = [];

	inputProduct.autocomplete({
		minLength:0,
		source : product_users_list,
		max:10,
		focus: function( event, ui ){
			//The value when mouse cusor overed each item
			inputProduct.val( ui.item.value );
			selectedProduct.price_range = ui.item.desc;
			selectedProduct.product_count = ui.item.count;
			selectedProduct.product_model = ui.item.model;
			selectedProduct.product_name = ui.item.value;
			//selectedProduct.product_picture = ui.item.picture;
			// console.log('test : ', selectedProductPriceRange);
			console.log('selectedProduct : ', selectedProduct);
		},
		select:function(event, ui){
			//$('#product_name').val('시퓨ㅏㄹ');
		}
	});

	/*
	autocomplite의 메뉴옵션 생성 API: _renderItem
	ul : li로 생성되는 각 메뉴가 append됨
	item : each menu information 
	  -label : string
	  -value : The value to insert when the item is selected
	*/
	inputProduct.data( "ui-autocomplete" )._renderItem = function( ul, item ){

		var li = $('<li>');
				span_img = $('<span>');
				span_text = $('<span>');
				img = $('<img>');

				img.attr({
					src: item.icon,
      		alt: item.label,
      		width:'40px',
      		height:'40px',
      		margin:'0px 10px'
				}).css({
					'margin-right':'20px'
				});;

				span_img.append(img);
				span_text.append('<a>', item.label);

				li.attr({
					'onclick' : 'getProductStores("' + item.model + '", this)'
				});

				li.append(span_img).append(span_text);

				return li.appendTo(ul);
	};

};

/*최신 판매글 가져오기*/
function getRecentPosts(){

	//var inputProductModel = $('#product_name').val();
	ajaxRequest('GET', '/posts', null, getRecentPostsRes);
};

function getRecentPostsRes(response, isSuccess){
	isSuccess ? recentPostList(response.responseJSON.results) : alert('최근 판매글 가져오기 실패');
};

function recentPostList(posts){
	//6개 테스트
	for(var i = 0; i<6; i++){

		var anchor_download = $('<a>');

		var div_row = $('<div>'); //bootstrap class row
				div_wrap = $('<div>'); //전체영역
				div_created = $('<div>');
				div_img = $('<div>'); //판매글 이미지 영역
				div_description = $('<div>');
				div_content = $('<div>'); //본문내용 전체영역
				div_like = $('<div>'); //좋아요버튼 이미지 영역
				div_comment = $('<div>'); //댓글버튼 이미지 영역
				div_price = $('<div>'); //가격영역

		var post_img = $('<img>');
				headTitle = $('<h5>');
				post_description = $('<div>');
				like_img = $('<img>');
				like_count = $('<span>');
				comment_img = $('<img>');
				comment_count = $('<span>');
				sell_price = $('<b>');

		/*selphone download anchor activation*/
		anchor_download.attr({
			'href' : 'http://selphone.co.kr/googleplay_naver_blog_upload.html'
			,'target' : '_blank'
		}).css({ 'text-decoration' : 'none' });

		/*div elements attributes and style options*/
		div_row.attr({ 'class':'row' })

		div_wrap.attr({'class': 'media col-md-8 col-md-offset-2 custom_wrappost'});
		
		/*Each Post image*/
		div_img.attr({'class':'media-left media-middle'}); 
		/*Each Post description*/
		div_description.attr({'class':'media-body media-middle text-left'});
		/*Bottom element : Favorite img, Comment img, Sell price*/
		div_content.attr({ 'id':'post_bottom', 'class':'post_bottom'});
		/*Wrap division Each post created time*/
		div_created.css({ 'width':'100%' });

		div_like.attr({ 'class':'custom_smallsize btn', 'role':'button'}).css({'float':'left'});
		div_comment.attr({ 'class':'custom_smallsize btn', 'role':'button'}).css({'float':'left'});
		div_price.attr({ 'class':'btn media-right'}).css({'float':'right'});

		/*Other elements attributes and style options*/
		var postPictures = posts[i].post_pictures.split(',');
		post_img.attr({
			'class':'media-object post_img'
			,'src':postPictures[0]
			,'alt':'더보기'
		});

		//UTC timeformat을 두번 parse하면 timestamp를 얻을 수 있음
		var timeformat = new Date( Date.parse( new Date( Date.parse(posts[i].createdAt)) ) ).format("yyyy.MM.dd");

		headTitle.attr({ 'class':'text-right custom_recentpost_time'	}).text(timeformat);

		post_description.attr({ 'class':'media-middle', 'id':'post_description' }).text(posts[i].post_description);

		like_img.attr({
			'id' : 'img_like'
			,'src':'./homepage/img/icon/ic_favorite_check_grey.png'
		});

		like_count.text(posts[i].TB_POSTS_FAVORITEs.length);

		comment_img.attr({
			'id' : 'img_comment'
			,'src':'./homepage/img/icon/ic_comment_grey_5.png'
		});

		comment_count.text(posts[i].TB_POSTS_COMMENTs.length);

		sell_price.attr({ 'class':'custom_sellprice' }).text(posts[i].sell_price + '원');

		/*Elemets contain definition*/
		div_like.append(like_img).append(like_count);
		div_comment.append(comment_img).append(comment_count);
		div_price.append(sell_price);
		div_content.append(div_like).append(div_comment).append(div_price);

		div_created.append(headTitle);

		div_description.append(div_created).append(post_description).append(div_content);

		div_img.append(post_img);
		div_wrap.append(div_img).append(div_description);

		anchor_download.append(div_wrap);

		div_row.append(anchor_download)

		$('#box_postlist').append(div_row);
	}
};


//검색 모델 선택 후 결과 처리
function getProductStores(product_model, thisElem){
	console.log('product_model : ', product_model);
	//var inputProductModel = $('#product_name').val();
	// $('#product_name').val( '시발' );
	// var inputProductModel = $(thisElem)[0].dataset.value;
	//inputProductModel ? ajaxRequest('GET', '/products-stores?product_model='+inputProductModel, null, getProductStoresRes) : alert('기종명을 다시 입력해주세요')
	product_model ? ajaxRequest('GET', '/products-stores?product_model='+product_model, null, getProductStoresRes) : alert('기종명을 다시 입력해주세요')
};

function getProductStoresRes(response, isSuccess){
	isSuccess ? productRange(response.responseJSON.results) : alert('실패');

};

function productRange(results){
	console.log('results : ', results);

	var appendData = '<ul class="list-group">';

	appendData += '<li class="list-group-item col-md-12" >';
	appendData += '<div class="col-md-8 col-md-offset-2">';
	appendData += '<div class="media text-center">';
	appendData += '<div class="media-left media-middle"><img src="' + results[0].TB_PRODUCT.product_picture + '" class="media-object custom_postimg"/></div>';
	appendData += '<div class="media-body media-middle"><h5 class="text-center">' + selectedProduct.product_name + ' [' + selectedProduct.product_model + '] ' + '</h5></div>';
	appendData += '</div></div></li>';
	//appendData += '<li class="list-group-item">';

	appendData += '<div class="custom_list-item col-lg-12">';
	appendData += '<div class="col-lg-6">'
	appendData += '<div class="label label-primary" style="margin-right:10px;">전문매입업체</div>';
	
	if(results.length < 1){
		appendData += '현재 취급하는 매입업체가 없습니다.';
		appendData += '</div>';
		//appendData += '<span class="badge">0개</span></label>';
		appendData += '<div class="col-lg-6">';
		appendData += '<div class="col-lg-9"></div>';
		appendData += '<div class="col-lg-3" ><a href="http://selphone.co.kr/googleplay_naver_blog_upload.html" target="_blank"><b class="custom_seemore">더보기</b></a></div>';
	}else{
		appendData += results[0].product_price_low + '원 ~ ' + results[0].product_price_high + '원';
		appendData += '</div>';

		appendData += '<div class="col-lg-6">';
		appendData += '<div class="col-lg-9">현재 취급하는 업체 ' + results[0].product_count + '</div>';
		appendData += '<div class="col-lg-3"><a href="http://selphone.co.kr/googleplay_naver_blog_upload.html" target="_blank"><b class="custom_seemore">더보기</b></a></div>';
	}

	appendData += '</div>';
	appendData += '</div>';
	appendData += '</li>';

	//appendData += '<li class="list-group-item">';
	appendData += '<div class="custom_list-item col-lg-12">';
	appendData += '<div class="col-lg-6">';
	appendData += '<div class="label label-info" style="margin-right:10px; word-break:break-all" >셀폰등록거래</div>';
	
	if(!selectedProduct.product_count){
		appendData += '현재 등록된 판매 물품이 없습니다.';
		appendData += '</div>';
		//appendData += '<span class="badge">0개</span>';
		appendData += '<div class="col-lg-6">';
		appendData += '<div class="col-lg-9"></div>';
		appendData += '<div class="col-lg-3" ><a href="http://selphone.co.kr/googleplay_naver_blog_upload.html" target="_blank"><b class="custom_seemore">더보기</b></a></div>';
	}else{
		appendData += selectedProduct.price_range;
		appendData += '</div>';

		appendData += '<div class="col-lg-6">';
		appendData += '<div class="col-lg-9"><span>현재 판매 중인 매물 ' + selectedProduct.product_count + '개</span></div>';
		appendData += '<div class="col-lg-3"><a href="http://selphone.co.kr/googleplay_naver_blog_upload.html" target="_blank"><b class="custom_seemore">더보기</b></a></div>';
	}

	appendData += '</div>';
	appendData += '</div>';
	appendData += '</li>';

	appendData += '</ul>';

	$('#box_searchmodel').html(appendData);

};

