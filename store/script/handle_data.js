//가격은 숫자만 입력받도록
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

/*ajax가 가져온걸 JSON으로 파싱*/
function parseResponse(httpRequest){
	console.log('parse httpRequest ' + httpRequest);
	var resText = httpRequest.responseText;
	var stringToJSON = JSON.parse(resText);
	return stringToJSON;
};


/*POST parameter serializing*/
function serializing(fName){
	var f = document.forms[fName];
	var numberElements = f.elements.length;
	var param = "";
	for(var i = 0; i < numberElements; i++){
		if(i < numberElements -1){
			param += f.elements[i].name + "=" + encodeURIComponent(f.elements[i].value) + "&";
		}else{
			param += f.elements[i].name + "=" + encodeURIComponent(f.elements[i].value);
		}
	}

	return param;
};

