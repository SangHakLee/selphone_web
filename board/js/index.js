Date.prototype.yyyymmddhhmm = function() {
  var yyyy = this.getFullYear();
  var mm = this.getMonth() < 9 ? "0" + (this.getMonth() + 1) : (this.getMonth() + 1); // getMonth() is zero-based
  var dd  = this.getDate() < 10 ? "0" + this.getDate() : this.getDate();
  var hh = this.getHours() < 10 ? "0" + this.getHours() : this.getHours();
  var min = this.getMinutes() < 10 ? "0" + this.getMinutes() : this.getMinutes();
  // return "".concat(yyyy).concat(mm).concat(dd).concat(hh).concat(min);
  return yyyy+"-"+mm+"-"+dd+" "+hh+":"+min
};

var Request = function(){
  this.getParameter = function( name ){
    var rtnval = "";
    var nowAddress = unescape(location.href);
    var parameters = (nowAddress.slice(nowAddress.indexOf("?")+1,nowAddress.length)).split("&");

    for(var i = 0 ; i < parameters.length ; i++)
    {
        var varName = parameters[i].split("=")[0];
        if(varName.toUpperCase() == name.toUpperCase())
        {
            rtnval = parameters[i].split("=")[1];
            break;
        }
    }
    return rtnval;
  }
}




$(document).ready(function() {
  $('.collapse.in').prev('.panel-heading').addClass('active');
  $('#accordion, #bs-collapse')
    .on('show.bs.collapse', function(a) {
      $(a.target).prev('.panel-heading').addClass('active');
    })
    .on('hide.bs.collapse', function(a) {
      $(a.target).prev('.panel-heading').removeClass('active');
    });


  var type = $('#type').val()
  var request = new Request();
  var url;
  var mode = request.getParameter("mode").toUpperCase()
  // console.log('mode', mode);
  if( mode == 'DEV'){
    url = 'http://54.178.140.51/'
  }else{
    url = 'http://api.selphone.co.kr/'
  }
  var endpoint = ''

  switch($('#type').val()){
    case '1' : endpoint = 'faqs'; //자주묻는 질문
    break;
    case '2' : endpoint = 'selphone-notices'; //셀폰 공지사항
    break;
    case '3' : endpoint = 'manager-notices'; // 매니저 공지사항
    break;
    default  : console.log("url 잘못됨"); return;
  }

  $.ajax({
    method : 'GET',
    // url : 'http://54.178.140.51/'+endpoint,
    url : url+endpoint,
    crossDomain : true ,
    dataType : 'json'
  }).done(function(results){
    appendBoard(results.results)
  }).fail(function(err){
    console.log("err",err);
  })

  var appendBoard = function(faqs){
    for(i in faqs){
      var apppend =''
        apppend += '<div class="panel">';
        apppend += '  <div class="panel-heading" role="tab" id="heading'+i+'">'
        apppend += '    <h4 class="panel-title">'
        apppend += '      <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse'+i+'" aria-expanded="true" aria-controls="collapse'+i+'">'
        apppend +=          faqs[i].title
        if(type > 1) apppend += '        <h6 class="help-block">'+ new Date(faqs[i].createdAt).yyyymmddhhmm()+'</h6>'
        apppend += '      </a>'
        apppend += '    </h4>'
        apppend += '  </div>'
        apppend += '  <div id="collapse'+i+'" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading'+i+'">'
        apppend += '    <div class="panel-body">'
        apppend +=          faqs[i].contents
        apppend += '    </div>'
        apppend += '  </div>'
        apppend += '</div>'
        $('#accordion').append(apppend)
    }
  }
});