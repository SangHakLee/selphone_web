var ajax = function(type, url, data, callback){
  $.ajax({
    type : type,
    url : url,
    crossDomain: true ,//multidomain option
    dataType: 'json',
    data : data,
    // contentType: false, // contentType false 해야만 body 내용이 이상하게 안간다
    // cache:false,
    processData:false,
    xhrFields: {withCredentials: true}, //use cookie
    success: function(data, textStatus, jqXHR) {
      // console.log('ajax success data :', data);
      // console.log('ajax success textStatus :', textStatus);
      // console.log('ajax success jqXHR :', jqXHR);
      callback(true, data)
    },
    error: function(jqXHR, textStatus, errorThrown) {
      // console.log('ajax error jqXHR :', jqXHR);
      // console.log('ajax error textStatus :', textStatus);
      // console.log('ajax error errorThrown :', errorThrown);
      callback(false, jqXHR.responseText)
    }
  })
}