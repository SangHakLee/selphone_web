// product_list.js



function getProductStore(){
	ajaxRequest('GET', '/products-stores', null, getProductStoreRes);
};

function getProductStoreRes(response, isSuccess){
	var results = response.responseJSON.results;

	var product_list = {
		etc : [],
		samsung : [],
		apple : [],
		lg : [],
		pantech : [],
	  broken : []
	};

	for(i in results){
		switch(results[i].TB_PRODUCT.product_company){

			case 'apple' :
				product_list.apple.push(results[i]);
			break;
			case 'broken' :
				product_list.broken.push(results[i]);
			break;
			case 'etc' :
				product_list.etc.push(results[i]);
			break;
			case 'lg' :
				product_list.lg.push(results[i]);
			break;
			case 'pantech' :
				product_list.pantech.push(results[i]);
			break;
			case 'samsung' :
				product_list.samsung.push(results[i]);
			break;
		}
	}

	var total = product_list.etc.length + product_list.broken.length + product_list.samsung.length + product_list.apple.length + product_list.lg.length + product_list.pantech.length;

	productStoresList(product_list);


};

//product-store요청
getProductStore();


function productStoresList(product_list){

	var allCompany = Object.keys(product_list);

	for(j in allCompany){

		var ul = $('<ul>');

		//리스트목록
		ul.attr({
			'class':'list-group'
			, 'id' : 'id_' + allCompany[j]
		}).css({
			height:'460px'
			, overflow:'auto'
			, display:'none'
		});

		var targetProductsList = product_list[ ''+allCompany[j] ] ;

		for(i in targetProductsList ){
			//각 리스트의 외형
			var	li = $('<li>'); //
					img = $('<img>'); //

					div_eachwrap = $('<div>'); //각 리스트 하나를 둘러싸는 div
					div_imgwrap = $('<div>'); //각 리스트의 기종이미지를 둘러싸는 div
					div_textwrap = $('<div>'); //각 리스트의 텍스트를 둘러싸는 div
					div_storewrap = $('<div>'); //
					div_spwrap = $('<div>');

					pmodel = $('<b>'); //각 리스트의 모델명
					pname = $('<b>'); //각 리스트의 기종명

					span_store = $('<span>'); //매입업체 매입가격
					span_sp = $('<span>'); //셀폰등록 거래가격

					span_store_price = $('<span>');
					span_sp_price = $('<span>');

			//각 리스트 속성
			li.attr({
				'data-value':targetProductsList[i].TB_PRODUCT.product_model,
				'class':'list-group-item col-md-10 col-md-offset-1'
			});

			//각 리스트 기종 이미지 속성
			img.attr({
				'class':'media-object custom_postimg'
				,'src':targetProductsList[i].TB_PRODUCT.product_picture
				,'alt':targetProductsList[i].TB_PRODUCT.product_name

			});

			//각 리스트를 둘러싸는 div
			div_eachwrap.attr({ 'class':'media text-center' });

			//이미지를 둘러싸는 div
			div_imgwrap.attr({ 'class':'media-left media-middle' }).css({'width':'30%'});

			//텍스트를 둘러싼 div
			pmodel.attr({ 'class':'custom_font-pmodel' }).text(targetProductsList[i].TB_PRODUCT.product_model);
			pname.attr({ 'class':'custom_font-pname' }).text(targetProductsList[i].TB_PRODUCT.product_name);

			//이미지 옆 내용부분
			div_textwrap.attr({ 'class': 'media-body media-middle' })
			.append(pname).append(pmodel);

			//매입업체 라벨
			span_store.attr({	'class':'label label-primary'	}).text('매입업체가');

			//매입업체 가격범위
			span_store_price.text(targetProductsList[i].product_price_low + '원 ~ ' + targetProductsList[i].product_price_high + '원');

			div_storewrap.append(span_store).append(span_store_price);

			//셀폰 라벨
			span_sp.attr({ 'class':'label label-info' }).text('셀폰거래가');

			//셀폰 등록 판매글 가격범위
			span_sp_price.text(targetProductsList[i].product_price_low + '원 ~ ' + targetProductsList[i].product_price_high + '원');

			div_spwrap.append(span_sp).append(span_sp_price);

			div_imgwrap.append(img);
			div_textwrap.append(div_storewrap).append(div_spwrap);
			div_eachwrap.append(div_imgwrap).append(div_textwrap)
			li.append(div_eachwrap);
			ul.append(li);
			
		}

		//만들어진 제조사별 기종 리스트는 각 제조사리스트 아래에 append
		$('#'+allCompany[j]).append(ul);
		
	}

};

$(window).ready(function(){

	console.log('start timing');

	$('ul#list_searchstore > li > div').click(function(e){
		$($(this).parent()).find('ul').toggle();
	});

});