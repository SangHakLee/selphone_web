/**
* @file_upload.js 중고나라 카페 판매글 기능 관련
*
* @version 1.1
* @logs 
* 2015.07.28 : 왜그런지 모르겠지만 서버 response 형식이 다 바뀜
*/

/*
  validate 숫자만 입력 가능하도록 하는 함수
  @evt : keyboard 입력 event
*/
function validate(evt) {
  var theEvent = evt || window.event;
  var key = theEvent.keyCode || theEvent.which;
  key = String.fromCharCode( key );
  var regex = /[0-9]|\./;
  if( !regex.test(key) ) {
    theEvent.returnValue = false;
    if(theEvent.preventDefault) theEvent.preventDefault();
  }
}

/*
  filterByText select option 검색기능 jQuery함수
  @textbox : 검색표본 selectbox
  @selectSingleMatch : option요소 선택 옵션
*/
jQuery.fn.filterByText = function(textbox, selectSingleMatch) {
  return this.each(function() {
    var select = this;
    var options = [];
    $(select).find('option').each(function() {
      options.push({value: $(this).val(), text: $(this).text()});
    });
    $(select).data('options', options);
    $(textbox).bind('change keyup', function() {
      var options = $(select).empty().scrollTop(0).data('options');
      var search = $.trim($(this).val());
      var regex = new RegExp(search,'gi');

      $.each(options, function(i) {
        var option = options[i];
        if(option.text.match(regex) !== null) {
          $(select).append(
             $('<option>').text(option.text).val(option.value)
          );
        }
      });
      if (selectSingleMatch === true && 
          $(select).children().length === 1) {
        $(select).children().get(0).selected = true;
      }
    });
  });
};

/*
  document load callback event
*/
$(document).ready(function(){
  
  $('select#model-select').click(function(e){
    console.log('e : ', e.target.value);
    console.log('option : ', $(this));

    $('#select-textbox').val(e.target.value);

  });

});

/*
  getModelOptions 등록 가능한 제품 모델명 요청
*/
function getModelOptions(){
  ajaxRequest('GET', '/products-all', getModelOptionsRes);
};

/*
  getModelOptions 등록 가능한 제품 모델명 요청
  @response : server response ( results [Array] )
  @statusCode : status code
*/
function getModelOptionsRes(response, statusCode){
  if(statusCode == 200){

    var appendOptions = "";
    for(i in response.results){
      appendOptions += '<option value="' + response.results[i].product_model +'">'+response.results[i].product_name+'</option>';
    }

    $('#model-select').append(appendOptions);

    //select 태그의 option목록을 filter대상으로 등록
    $(function(){
      $('#model-select').filterByText($('#select-textbox'), true);
    });
    
  }else{
    alert('서버 error : 취급 모델 전체리스트');
  }

};

/*
  addPicture 중고나라 이미지url input box 추가
*/
function addPicture(){
  var postPicture = '<span><label>URL:</label><input type="text" name="post_pictures" title="이미지URL" required><label id="btn_delPicture" onclick="javascript:delPicture(this)">제거</label></span>';
  $('#menu-image').append(postPicture);
};

/*
  delPicture 중고나라 이미지url input box 삭제
  @thisElem : 제거버튼 눌린 그녀석
*/
function delPicture(thisElem){
  $(thisElem.parentNode).remove();
  //$(thisElem).remove();
};

/*
  postEach 중고나라 판매글 업로드 요청
  @thisElem : submitform이 있는 submit button 요소
*/
function postEach(thisElem, e){
  var check = formCheck(thisElem.form);
  if(!check){
    return;
  }
  
  ajaxForm(thisElem.form, e, EMPLOYEE + '/posts' ,postEachRes);
};

/*
  postEachRes 중고나라 판매글 업로드 응답
  @thisElem : submitform이 있는 submit button 요소
*/
function postEachRes(response, isSuccess, status){

  if(isSuccess != "success"){
    alert('업로드 실패');
    return;
  }

  alert('업로드 성공');
  location.reload();

};