var ajax = function(type, url, data, callback){
  $.ajax({
    type : type,
    url : url,
    crossDomain: true ,//multidomain option
    dataType: 'json',
    data : data,
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

var http = function($http, method, url, data, callback){
  $http({
    method : method,
    url : url,
    data : data,
    headers: {'Content-Type': 'application/json; charset=utf-8'}
  })
  .success(function(data, status, headers, config) {
    // console.log('success data :', data);
    // console.log('success status :', status);
    // console.log('success headers :', headers);
    // console.log('success config :', config);
    if(data) {
      console.log('success?');
      callback(true, data)
    }
    else {
      console.log('error? 통신한 URL에서 데이터가 넘어오지 않았을 때 처리');
      callback(false, 'error? 통신한 URL에서 데이터가 넘어오지 않았을 때 처리')
      /* 통신한 URL에서 데이터가 넘어오지 않았을 때 처리 */
    }
  })
  .error(function(data, status, headers, config) {
    /* 서버와의 연결이 정상적이지 않을 때 처리 */
    // console.log('error data :', data);
    // console.log('error status :', status);
    // console.log('error headers :', headers);
    // console.log('error config :', config);
    callback(false, status)
  });
}