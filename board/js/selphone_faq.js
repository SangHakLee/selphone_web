$(document).ready(function() {
  $('.collapse.in').prev('.panel-heading').addClass('active');
  $('#accordion, #bs-collapse')
    .on('show.bs.collapse', function(a) {
      $(a.target).prev('.panel-heading').addClass('active');
    })
    .on('hide.bs.collapse', function(a) {
      $(a.target).prev('.panel-heading').removeClass('active');
    });

  $.ajax({
    method : 'GET',
    // url : 'http://54.178.140.51/faqs',
    url : 'http://api.selphone.co.kr/faqs',
    crossDomain : true ,
    dataType : 'json'
  }).done(function(results){
    appendFaqs(results.results)
  }).fail(function(err){
    console.log(err);
  })

  var appendFaqs = function(faqs){
    for(i in faqs){
      var apppend =''
        apppend += '<div class="panel">';
        apppend += '  <div class="panel-heading" role="tab" id="heading'+i+'">'
        apppend += '    <h4 class="panel-title">'
        apppend += '      <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse'+i+'" aria-expanded="true" aria-controls="collapse'+i+'">'
        apppend +=          faqs[i].title
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