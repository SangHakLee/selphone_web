/*
* Jindo
* @type desktop
* @version 2.11.0
*
* NAVER Corp; JindoJS JavaScript Framework
* http://jindo.dev.naver.com/
*
* Released under the LGPL v2 license
* http://www.gnu.org/licenses/old-licenses/lgpl-2.0.html
*
* Customized: Core,$$,$Agent,$H,$Fn,$Event,$Element,$Json,$Ajax
*/

var nv = window.nv||{};

nv._p_ = {};
nv._p_.nvName = "nv";

!function() {
    if(window[nv._p_.nvName]) {
        var __old_j = window[nv._p_.nvName];
        for(var x in __old_j) {
            nv[x] = __old_j[x];
        }
    }
}();

/**
	@fileOverview polyfill �뚯씪
	@name polyfill.js
	@author NAVER Ajax Platform
*/
function _settingPolyfill(target,objectName,methodName,polyfillMethod,force){
    if(force||!target[objectName].prototype[methodName]){
        target[objectName].prototype[methodName] = polyfillMethod;
    }
}

function polyfillArray(global){
    function checkCallback(callback){
        if (typeof callback !== 'function') {
            throw new TypeError("callback is not a function.");
        }
    }
    _settingPolyfill(global,"Array","forEach",function(callback, ctx){
        checkCallback(callback);
        var thisArg = arguments.length >= 2 ? ctx : void 0;
        for(var i = 0, l = this.length; i < l; i++){
            callback.call(thisArg, this[i], i, this);
        }
    });
    _settingPolyfill(global,"Array","every",function(callback, ctx){
        checkCallback(callback);
        var thisArg = arguments.length >= 2 ? ctx : void 0;
        for(var i = 0, l = this.length; i < l; i++){
            if(!callback.call(thisArg, this[i], i, this)) return false;
        }
        return true;
    });
}

if(!window.__isPolyfillTestMode){
    polyfillArray(window);
}

//  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
if (!Function.prototype.bind) {
    Function.prototype.bind = function (target) {
        if (typeof this !== "function") {
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var arg = Array.prototype.slice.call(arguments, 1),
        bind = this,
        nop = function () {},
        wrap = function () {
            return bind.apply(
                nop.prototype && this instanceof nop && target ? this : target,
                arg.concat(Array.prototype.slice.call(arguments))
            );
        };

        nop.prototype = this.prototype;
        wrap.prototype = new nop();
        return wrap;
    };
}

function polyfillTimer(global){
    var agent = global.navigator.userAgent, isIOS = /i(Pad|Phone|Pod)/.test(agent), iOSVersion;

    if(isIOS){
        var matchVersion =  agent.match(/OS\s(\d)/);
        if(matchVersion){
            iOSVersion = parseInt(matchVersion[1],10);
        }
    }

    var raf = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame|| global.msRequestAnimationFrame,
        caf = global.cancelAnimationFrame || global.webkitCancelAnimationFrame|| global.mozCancelAnimationFrame|| global.msCancelAnimationFrame;

    if(raf&&!caf){
        var keyInfo = {}, oldraf = raf;

        raf = function(callback){
            function wrapCallback(){
                if(keyInfo[key]){
                    callback();
                }
            }
            var key = oldraf(wrapCallback);
            keyInfo[key] = true;
            return key;
        };

        caf = function(key){
            delete keyInfo[key];
        };

    } else if(!(raf&&caf)) {
        raf = function(callback) { return global.setTimeout(callback, 16); };
        caf = global.clearTimeout;
    }

    global.requestAnimationFrame = raf;
    global.cancelAnimationFrame = caf;


    // Workaround for iOS6+ devices : requestAnimationFrame not working with scroll event
    if(iOSVersion >= 6){
        global.requestAnimationFrame(function(){});
    }

    // for iOS6 - reference to https://gist.github.com/ronkorving/3755461
    if(iOSVersion == 6){
        var timerInfo = {},
            SET_TIMEOUT = "setTimeout",
            CLEAR_TIMEOUT = "clearTimeout",
            SET_INTERVAL = "setInterval",
            CLEAR_INTERVAL = "clearInterval",
            orignal = {
                "setTimeout" : global.setTimeout.bind(global),
                "clearTimeout" : global.clearTimeout.bind(global),
                "setInterval" : global.setInterval.bind(global),
                "clearInterval" : global.clearInterval.bind(global)
            };

        [[SET_TIMEOUT,CLEAR_TIMEOUT],[SET_INTERVAL,CLEAR_INTERVAL]].forEach(function(v){
            global[v[0]] = (function(timerName,clearTimerName){
                return function(callback,time){
                    var timer = {
                        "key" : "",
                        "isCall" : false,
                        "timerType" : timerName,
                        "clearType" : clearTimerName,
                        "realCallback" : callback,
                        "callback" : function(){
                            var callback = this.realCallback;
                            callback();
                            if(this.timerType === SET_TIMEOUT){
                                this.isCall = true;
                                 delete timerInfo[this.key];
                            }
                        },
                        "delay" : time,
                        "createdTime" : global.Date.now()
                    };
                    timer.key = orignal[timerName](timer.callback.bind(timer),time);
                    timerInfo[timer.key] = timer;

                    return timer.key;
                };
            })(v[0],v[1]);

            global[v[1]] = (function(clearTimerName){
                return function(key){
                    if(key&&timerInfo[key]){
                        orignal[clearTimerName](timerInfo[key].key);
                        delete timerInfo[key];
                    }
                };
            })(v[1]);

        });

        function restoreTimer(){
            var currentTime = global.Date.now();
            var newTimerInfo = {},gap;
            for(var  i in timerInfo){
                var timer = timerInfo[i];
                orignal[timer.clearType](timerInfo[i].key);
                delete timerInfo[i];

                if(timer.timerType == SET_TIMEOUT){
                    gap = currentTime - timer.createdTime;
                    timer.delay = (gap >= timer.delay)?0:timer.delay-gap;
                }

                if(!timer.isCall){
                    timer.key = orignal[timer.timerType](timer.callback.bind(timer),timer.delay);
                    newTimerInfo[i] = timer;
                }


            }
            timerInfo = newTimerInfo;
            newTimerInfo = null;
        }

        global.addEventListener("scroll",function(e){
            restoreTimer();
        });
    }

    return global;
}

if(!window.__isPolyfillTestMode){
    polyfillTimer(window);
}

//-!namespace.default start!-//
/**
	@fileOverview $() �⑥닔, nv.$Jindo() 媛앹껜, nv.$Class() 媛앹껜瑜� 占쏙옙占쎌쓽�� �뚯씪.
	@name core.js
	@author NAVER Ajax Platform
 */
/**
 	agent�� dependency瑜� �놁븷湲� �꾪빐 蹂꾨룄濡� �ㅼ젙.

	@ignore
 **/
nv._p_._j_ag = navigator.userAgent;
nv._p_._JINDO_IS_IE = /(MSIE|Trident)/.test(nv._p_._j_ag);  // IE
nv._p_._JINDO_IS_FF = nv._p_._j_ag.indexOf("Firefox") > -1;  // Firefox
nv._p_._JINDO_IS_OP = nv._p_._j_ag.indexOf("Opera") > -1;  // Presto engine Opera
nv._p_._JINDO_IS_SP = /Version\/[\d\.]+\s(?=Safari)/.test(nv._p_._j_ag);  // Safari
nv._p_._JINDO_IS_CH = /Chrome\/[\d\.]+\sSafari\/[\d\.]+$/.test(nv._p_._j_ag);  // Chrome
nv._p_._JINDO_IS_WK = nv._p_._j_ag.indexOf("WebKit") > -1;
nv._p_._JINDO_IS_MO = /(iPhone|iPod|Mobile|Tizen|Android|Nokia|webOS|BlackBerry|Opera Mobi|Opera Mini)/.test(nv._p_._j_ag);

nv._p_.trim = function(str){
    var sBlank = "\\s|\\t|"+ String.fromCharCode(12288), re = new RegExp(["^(?:", ")+|(?:", ")+$"].join(sBlank), "g");
    return str.replace(re, "");
};
//-!namespace.default end!-//

//-!nv.$Jindo.default start!-//
/**
	nv.$Jindo() 媛앹껜�� �꾨젅�꾩썙�ъ뿉 ���� �뺣낫�� �좏떥由ы떚 �⑥닔瑜� �쒓났�쒕떎.

	@class nv.$Jindo
	@keyword core, 肄붿뼱, $Jindo
 */
/**
	nv.$Jindo() 媛앹껜瑜� �앹꽦�쒕떎. nv.$Jindo() 媛앹껜�� Jindo �꾨젅�꾩썙�ъ뿉 ���� �뺣낫�� �좏떥由ы떚 �⑥닔瑜� �쒓났�쒕떎.

	@constructor
	@remark �ㅼ쓬�� Jindo �꾨젅�꾩썙�� �뺣낫瑜� �닿퀬 �덈뒗 媛앹껜�� �띿꽦�� �ㅻ챸�� �쒖씠��.<br>
		<h5>Jindo �꾨젅�꾩썙�� �뺣낫 媛앹껜 �띿꽦</h5>
		<table class="tbl_board">
			<caption class="hide">Jindo �꾨젅�꾩썙�� �뺣낫 媛앹껜 �띿꽦</caption>
			<thead>
				<tr>
					<th scope="col" style="width:15%">�대쫫</th>
					<th scope="col" style="width:15%">����</th>
					<th scope="col">�ㅻ챸</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="txt bold">version</td>
					<td>Number</td>
					<td class="txt">Jindo �꾨젅�꾩썙�ъ쓽 踰꾩쟾�� ���ν븳��.</td>
				</tr>
		</table>
 */
nv.$Jindo = function() {
    //-@@$Jindo.default-@@//
    var cl=arguments.callee;
    var cc=cl._cached;

    if (cc) return cc;
    if (!(this instanceof cl)) return new cl();
    if (!cc) cl._cached = this;
};

nv._p_.addExtension = function(sClass,sMethod,fpFunction){
    // if(nv[sClass]){
    if(nv[sClass][sMethod]){
        nv.$Jindo._warn(sClass+"."+sMethod+" was overwrite.");
    }else{
        if(/^x/.test(sMethod)){
            nv[sClass][sMethod] = fpFunction;
        }else{
            nv.$Jindo._warn("The Extension Method("+sClass+"."+sMethod+") must be used with x prefix.");
        }
    }
};
/**
	�명솚 紐⑤뱶瑜� �ㅼ젙�섍퀬 諛섑솚�섎뒗 �⑥닔.

	@method compatible
	@ignore
	@param {Boolean} bType
	@return {Boolean} [true | false]
 */
nv.$Jindo.compatible = function(){
    return false;
};

/**
	�ㅻ툕�앺듃瑜� mixin�� �� �ъ슜.(source�� �띿꽦以� �ㅻ툕�앺듃�� �섏뼱媛�.)

	@method mixin
	@static
	@param {Hash} oDestination
	@param {Hash} oSource
	@return {Hash} oNewObject
	@since 2.2.0
	@example
		var oDestination = {
			"foo" :1,
			"test" : function(){}
		};
		var oSource = {
			"bar" :1,
			"obj" : {},
			"test2" : function(){}
		};

		var  oNewObject = nv.$Jindo.mixin(oDestination,oSource);

		oNewObject == oDestination //false

		// oNewObject => {
		// "foo" :1,
		// "test" : function(){},
		//
		// "bar" :1,
		// "obj" : {},
		// "test2" : function(){}
		// };
 */
nv.$Jindo.mixin = function(oDestination, oSource){
    g_checkVarType(arguments, {
        'obj' : [ 'oDestination:Hash+', 'oSource:Hash+' ]
    },"<static> $Jindo#mixin");

    var oReturn = {};

    for(var i in oDestination){
        oReturn[i] = oDestination[i];
    }

    for (i in oSource) if (oSource.hasOwnProperty(i)&&!nv.$Jindo.isHash(oSource[i])) {
        oReturn[i] = oSource[i];
    }
    return oReturn;
};

nv._p_._objToString = Object.prototype.toString;

nv.$Error = function(sMessage,sMethod){
    this.message = "\tmethod : "+sMethod+"\n\tmessage : "+sMessage;
    this.type = "Jindo Custom Error";
    this.toString = function(){
        return this.message+"\n\t"+this.type;
    };
};

nv.$Except = {
    CANNOT_USE_OPTION:"�대떦 �듭뀡�� �ъ슜�� �� �놁뒿�덈떎.",
    CANNOT_USE_HEADER:"type�� jsonp �먮뒗 �곗뒪�ы깙 �섍꼍�먯꽌 CORS �몄텧�� XDomainRequest(IE8,9) 媛앹껜媛� �ъ슜�섎뒗 寃쎌슦 header硫붿꽌�쒕뒗 �ъ슜�� �� �놁뒿�덈떎.",
    PARSE_ERROR:"�뚯떛以� �먮윭媛� 諛쒖깮�덉뒿�덈떎.",
    NOT_FOUND_ARGUMENT:"�뚮씪誘명꽣媛� �놁뒿�덈떎.",
    NOT_STANDARD_QUERY:"css���됲꽣媛� �뺤긽�곸씠吏� �딆뒿�덈떎.",
    INVALID_DATE:"�좎쭨 �щĸ�� �꾨떃�덈떎.",
    REQUIRE_AJAX:"媛� �놁뒿�덈떎.",
    NOT_FOUND_ELEMENT:"�섎━癒쇳듃媛� �놁뒿�덈떎.",
    HAS_FUNCTION_FOR_GROUP:"洹몃９�쇰줈 吏��곗� �딅뒗 寃쎌슦 detach�� �⑥닔媛� �덉뼱�� �⑸땲��.",
    NONE_ELEMENT:"�� �대떦�섎뒗 �섎━癒쇳듃媛� �놁뒿�덈떎.",
    NOT_SUPPORT_SELECTOR:"�� 吏��먰븯吏� �딅뒗 selector�낅땲��.",
	NOT_SUPPORT_CORS:"�꾩옱 釉뚮씪�곗��� CORS瑜� 吏��먰븯吏� �딆뒿�덈떎.",
    NOT_SUPPORT_METHOD:"desktop�먯꽌 吏��먰븯吏� �딅뒗 硫붿꽌�� �낅땲��.",
    JSON_MUST_HAVE_ARRAY_HASH:"get硫붿꽌�쒕뒗 json���낆씠 hash�� array���낅쭔 媛��ν빀�덈떎.",
    MUST_APPEND_DOM : "document�� 遺숈� �딆� �섎━癒쇳듃瑜� 湲곗� �섎━癒쇳듃濡� �ъ슜�� �� �놁뒿�덈떎.",
    NOT_USE_CSS : "�� css瑜� �ъ슜 �좎닔 �놁뒿�덈떎.",
    NOT_WORK_DOMREADY : "domready�대깽�몃뒗 iframe�덉뿉�� �ъ슜�� �� �놁뒿�덈떎.",
    CANNOT_SET_OBJ_PROPERTY : "�띿꽦�� �ㅻ툕�앺듃�낅땲��.\n�대옒�� �띿꽦�� �ㅻ툕�앺듃�대㈃ 紐⑤뱺 �몄뒪�댁뒪媛� 怨듭쑀�섍린 �뚮Ц�� �꾪뿕�⑸땲��.",
    NOT_FOUND_HANDLEBARS : "{{not_found_handlebars}}",
    INVALID_MEDIA_QUERY : "{{invalid_media_query}}"
};

/**
 * @ignore
 */
nv._p_._toArray = function(aArray){
    return Array.prototype.slice.apply(aArray);
};

try{
    Array.prototype.slice.apply(document.documentElement.childNodes);
}catch(e){
    nv._p_._toArray = function(aArray){
        var returnArray = [];
        var leng = aArray.length;
        for ( var i = 0; i < leng; i++ ) {
            returnArray.push( aArray[i] );
        }
        return returnArray;
    };
}


/**
	�뚮씪誘명꽣媛� Function�몄� �뺤씤�섎뒗 �⑥닔.

	@method isFunction
	@static
	@param {Variant} oObj
	@return {Boolean} [true | false]
	@since 2.0.0
 */

/**
	�뚮씪誘명꽣媛� Array�몄� �뺤씤�섎뒗 �⑥닔.

	@method isArray
	@static
	@param {Variant} oObj
	@return {Boolean} [true | false]
	@since 2.0.0
 */

/**
	�뚮씪誘명꽣媛� String�몄� �뺤씤�섎뒗 �⑥닔.

	@method isString
	@static
	@param {Variant} oObj
	@return {Boolean} [true | false]
	@since 2.0.0
 */

/**
	�뚮씪誘명꽣媛� Numeric�몄� �뺤씤�섎뒗 �⑥닔.

	@method isNumeric
	@static
	@param {Variant} oObj
	@return {Boolean} [true | false]
	@since 2.0.0
 */
nv.$Jindo.isNumeric = function(nNum){
    return !isNaN(parseFloat(nNum)) && !nv.$Jindo.isArray(nNum) &&isFinite( nNum );
};
/**
	�뚮씪誘명꽣媛� Boolean�몄� �뺤씤�섎뒗 �⑥닔.

	@method isBoolean
	@static
	@param {Variant} oObj
	@return {Boolean} [true | false]
	@since 2.0.0
 */
/**
	�뚮씪誘명꽣媛� Date�몄� �뺤씤�섎뒗 �⑥닔.

	@method isDate
	@static
	@param {Variant} oObj
	@return {Boolean} [true | false]
	@since 2.0.0
 */
/**
	�뚮씪誘명꽣媛� Regexp�몄� �뺤씤�섎뒗 �⑥닔.

	@method isRegexp
	@static
	@param {Variant} oObj
	@return {Boolean} [true | false]
	@since 2.0.0
 */
/**
	�뚮씪誘명꽣媛� Element�몄� �뺤씤�섎뒗 �⑥닔.

	@method isElement
	@static
	@param {Variant} oObj
	@return {Boolean} [true | false]
	@since 2.0.0
 */
/**
	�뚮씪誘명꽣媛� Document�몄� �뺤씤�섎뒗 �⑥닔.

	@method isDocument
	@static
	@param {Variant} oObj
	@return {Boolean} [true | false]
	@since 2.0.0
 */
(function(){
    var oType = {"Element" : 1,"Document" : 9};
    for(var i in oType){
        nv.$Jindo["is"+i] = (function(sType,nNodeNumber){
            return function(oObj){
                if(new RegExp(sType).test(nv._p_._objToString.call(oObj))){
                    return true;
                }else if(nv._p_._objToString.call(oObj) == "[object Object]"&&oObj !== null&&oObj !== undefined&&oObj.nodeType==nNodeNumber){
                    return true;
                }
                return false;
            };
        })(i,oType[i]);
    }
    var _$type = ["Function","Array","String","Boolean","Date","RegExp"];
    for(var i = 0, l = _$type.length; i < l ;i++){
        nv.$Jindo["is"+_$type[i]] = (function(type){
            return function(oObj){
                return nv._p_._objToString.call(oObj) == "[object "+type+"]";
            };
        })(_$type[i]);
    }
})();

/**
	�뚮씪誘명꽣媛� Node�몄� �뺤씤�섎뒗 �⑥닔.

	@method isNode
	@static
	@param {Variant} oObj
	@return {Boolean} [true | false]
	@since 2.0.0
 */
nv.$Jindo.isNode = function(eEle){
    try{
        return !!(eEle&&eEle.nodeType);
    }catch(e){
        return false;
    }
};

/**
	�뚮씪誘명꽣媛� Hash�몄� �뺤씤�섎뒗 �⑥닔.

	@method isHash
	@static
	@param {Variant} oObj
	@return {Boolean} [true | false]
	@since 2.0.0
 */
nv.$Jindo.isHash = function(oObj){
    return nv._p_._objToString.call(oObj) == "[object Object]"&&oObj !== null&&oObj !== undefined&&!!!oObj.nodeType&&!nv.$Jindo.isWindow(oObj);
};

/**
	�뚮씪誘명꽣媛� Null�몄� �뺤씤�섎뒗 �⑥닔.

	@method isNull
	@static
	@param {Variant} oObj
	@return {Boolean} [true | false]
	@since 2.0.0
 */
nv.$Jindo.isNull = function(oObj){
    return oObj === null;
};
/**
	�뚮씪誘명꽣媛� Undefined�몄� �뺤씤�섎뒗 �⑥닔.

	@method isUndefined
	@static
	@param {Variant} oObj
	@return {Boolean} [true | false]
	@since 2.0.0
 */
nv.$Jindo.isUndefined = function(oObj){
    return oObj === undefined;
};

/**
	�뚮씪誘명꽣媛� Window�몄� �뺤씤�섎뒗 �⑥닔.

	@method isWindow
	@static
	@param {Variant} oObj
	@return {Boolean} [true | false]
	@since 2.0.0
 */
nv.$Jindo.isWindow = function(oObj){
    return oObj && (oObj == window.top || oObj == oObj.window);
};
/**
 * @ignore
 */
nv.$Jindo.Break = function(){
    if (!(this instanceof arguments.callee)) throw new arguments.callee;
};
/**
 * @ignore
 */
nv.$Jindo.Continue = function(){
    if (!(this instanceof arguments.callee)) throw new arguments.callee;
};

/**
	�⑥닔 �뚮씪誘명꽣媛� �먰븯�� 洹쒖튃�� 留욌뒗吏� 寃��ы븳��.

	@method checkVarType
	@ignore
	@param {Array} aArgs �뚮씪誘명꽣 紐⑸줉
	@param {Hash} oRules 洹쒖튃 紐⑸줉
	@param {String} sFuncName �먮윭硫붿떆吏�瑜� 蹂댁뿬以꾨븣 �ъ슜�� �⑥닔紐�
	@return {Object}
 */
nv.$Jindo._F = function(sKeyType) {
    return sKeyType;
};

nv.$Jindo._warn = function(sMessage){
    window.console && ( (console.warn && console.warn(sMessage), true) || (console.log && console.log(sMessage), true) );
};

nv.$Jindo._maxWarn = function(nCurrentLength, nMaxLength, sMessage) {
    if(nCurrentLength > nMaxLength) {
        nv.$Jindo._warn('異붽��곸씤 �뚮씪誘명꽣媛� �덉뒿�덈떎. : '+sMessage);
    }
};

nv.$Jindo.checkVarType = function(aArgs, oRules, sFuncName) {
    var sFuncName = sFuncName || aArgs.callee.name || 'anonymous';
    var $Jindo = nv.$Jindo;
    var bCompat = $Jindo.compatible();

    var fpChecker = aArgs.callee['_checkVarType_' + bCompat];
    if (fpChecker) { return fpChecker(aArgs, oRules, sFuncName); }

    var aPrependCode = [];
    aPrependCode.push('var nArgsLen = aArgs.length;');
    aPrependCode.push('var $Jindo = '+nv._p_.nvName+'.$Jindo;');

    if(bCompat) {
        aPrependCode.push('var nMatchScore;');
        aPrependCode.push('var nMaxMatchScore = -1;');
        aPrependCode.push('var oFinalRet = null;');
    }

    var aBodyCode = [];
    var nMaxRuleLen = 0;

    for(var sType in oRules) if (oRules.hasOwnProperty(sType)) {
        nMaxRuleLen = Math.max(oRules[sType].length, nMaxRuleLen);
    }

    for(var sType in oRules) if (oRules.hasOwnProperty(sType)) {
        var aRule = oRules[sType];
        var nRuleLen = aRule.length;

        var aBodyPrependCode = [];
        var aBodyIfCode = [];
        var aBodyThenCode = [];

        if(!bCompat) {
            if (nRuleLen < nMaxRuleLen) { aBodyIfCode.push('nArgsLen === ' + nRuleLen); }
            else { aBodyIfCode.push('nArgsLen >= ' + nRuleLen); }
        }

        aBodyThenCode.push('var oRet = new $Jindo._varTypeRetObj();');

        var nTypeCount = nRuleLen;

        for (var i = 0; i < nRuleLen; ++i) {
            /^([^:]+):([^\+]*)(\+?)$/.test(aRule[i]);

            var sVarName = RegExp.$1,
                sVarType = RegExp.$2,
                bAutoCast = RegExp.$3 ? true : false;

            // if accept any type
            if (sVarType === 'Variant') {
                if (bCompat) {
                    aBodyIfCode.push(i + ' in aArgs');
                }

                aBodyThenCode.push('oRet["' + sVarName + '"] = aArgs[' + i + '];');
                nTypeCount--;

            // user defined type only
            } else if ($Jindo._varTypeList[sVarType]) {
                var vVar = 'tmp' + sVarType + '_' + i;

                aBodyPrependCode.push('var ' + vVar + ' = $Jindo._varTypeList.' + sVarType + '(aArgs[' + i + '], ' + bAutoCast + ');');
                aBodyIfCode.push(vVar + ' !== '+nv._p_.nvName+'.$Jindo.VARTYPE_NOT_MATCHED');
                aBodyThenCode.push('oRet["' + sVarName + '"] = ' + vVar + ';');

            // Jiindo wrapped type
            } else if (/^\$/.test(sVarType) && nv[sVarType]) {
                var sOR = '', sNativeVarType;

                if (bAutoCast) {
                    sNativeVarType = ({ $Fn : 'Function', $S : 'String', $A : 'Array', $H : 'Hash', $ElementList : 'Array' })[sVarType] || sVarType.replace(/^\$/, '');
                    if (nv.$Jindo['is' + sNativeVarType]) {
                        sOR = ' || $Jindo.is' + sNativeVarType + '(vNativeArg_' + i + ')';
                    }
                }

                aBodyIfCode.push('(aArgs[' + i + '] instanceof '+nv._p_.nvName+'.' + sVarType + sOR + ')');
                aBodyThenCode.push('oRet["' + sVarName + '"] = '+nv._p_.nvName+'.' + sVarType + '(aArgs[' + i + ']);');

            // any native type
            } else if (nv.$Jindo['is' + sVarType]) {
                var sOR = '', sWrapedVarType;

                if (bAutoCast) {
                    sWrapedVarType = ({ 'Function' : '$Fn', 'String' : '$S', 'Array' : '$A', 'Hash' : '$H' })[sVarType] || '$' + sVarType;
                    if (nv[sWrapedVarType]) {
                        sOR = ' || aArgs[' + i + '] instanceof '+nv._p_.nvName+'.' + sWrapedVarType;
                    }
                }

                aBodyIfCode.push('($Jindo.is' + sVarType + '(aArgs[' + i + '])' + sOR + ')');
                aBodyThenCode.push('oRet["' + sVarName + '"] = vNativeArg_' + i + ';');

            // type which doesn't exist
            } else {
                throw new Error('VarType(' + sVarType + ') Not Found');
            }
        }

        aBodyThenCode.push('oRet.__type = "' + sType + '";');

        if (bCompat) {
            aBodyThenCode.push('nMatchScore = ' + (nRuleLen * 1000 + nTypeCount * 10) + ' + (nArgsLen === ' + nRuleLen + ' ? 1 : 0);');
            aBodyThenCode.push('if (nMatchScore > nMaxMatchScore) {');
            aBodyThenCode.push('    nMaxMatchScore = nMatchScore;');
            aBodyThenCode.push('    oFinalRet = oRet;');
            aBodyThenCode.push('}');
        } else {
            aBodyThenCode.push('return oRet;');
        }

        aBodyCode.push(aBodyPrependCode.join('\n'));

        if (aBodyIfCode.length) { aBodyCode.push('if (' + aBodyIfCode.join(' && ') + ') {'); }
        aBodyCode.push(aBodyThenCode.join('\n'));
        if (aBodyIfCode.length) { aBodyCode.push('}'); }

    }

    aPrependCode.push(' $Jindo._maxWarn(nArgsLen,'+nMaxRuleLen+',"'+sFuncName+'");');

    for (var i = 0; i < nMaxRuleLen; ++i) {
        var sArg = 'aArgs[' + i + ']';
        aPrependCode.push([ 'var vNativeArg_', i, ' = ', sArg, ' && ', sArg, '.$value ? ', sArg, '.$value() : ', sArg + ';' ].join(''));
    }

    if (!bCompat) {
        aBodyCode.push('$Jindo.checkVarType._throwException(aArgs, oRules, sFuncName);');
    }

    aBodyCode.push('return oFinalRet;');

    // if (bCompat) { console.log(aPrependCode.join('\n') + aBodyCode.join('\n')); }
    aArgs.callee['_checkVarType_' + bCompat] = fpChecker = new Function('aArgs,oRules,sFuncName', aPrependCode.join('\n') + aBodyCode.join('\n'));
    return fpChecker(aArgs, oRules, sFuncName);

};

var g_checkVarType = nv.$Jindo.checkVarType;

// type check return type object
nv.$Jindo._varTypeRetObj = function() {};
nv.$Jindo._varTypeRetObj.prototype.toString = function(){ return this.__type; };

nv.$Jindo.checkVarType._throwException = function(aArgs, oRules, sFuncName) {
    var fpGetType = function(vArg) {

        for (var sKey in nv) if (nv.hasOwnProperty(sKey)) {
            var oConstructor = nv[sKey];
            if (typeof oConstructor !== 'function') { continue; }
            if (vArg instanceof oConstructor) { return sKey; }
        }

        var $Jindo = nv.$Jindo;

        for (var sKey in $Jindo) if ($Jindo.hasOwnProperty(sKey)) {
            if (!/^is(.+)$/.test(sKey)) { continue; }
            var sType = RegExp.$1;
            var fpMethod = $Jindo[sKey];
            if (fpMethod(vArg)) { return sType; }
        }

        return 'Unknown';

    };

    var fpErrorMessage = function(sUsed, aSuggs, sURL) {

        var aMsg = [ '�섎せ�� �뚮씪誘명꽣�낅땲��.', '' ];

        if (sUsed) {
            aMsg.push('�몄텧�� �뺥깭 :');
            aMsg.push('\t' + sUsed);
            aMsg.push('');
        }

        if (aSuggs.length) {
            aMsg.push('�ъ슜 媛��ν븳 �뺥깭 :');
            for (var i = 0, nLen = aSuggs.length; i < nLen; i++) {
                aMsg.push('\t' + aSuggs[i]);
            }
            aMsg.push('');
        }

        if (sURL) {
            aMsg.push('留ㅻ돱�� �섏씠吏� :');
            aMsg.push('\t' + sURL);
            aMsg.push('');
        }

        aMsg.unshift();

        return aMsg.join('\n');

    };

    var aArgName = [];

    for (var i = 0, ic = aArgs.length; i < ic; ++i) {
        try { aArgName.push(fpGetType(aArgs[i])); }
        catch(e) { aArgName.push('Unknown'); }
    }

    var sUsed = sFuncName + '(' + aArgName.join(', ') + ')';
    var aSuggs = [];

    for (var sKey in oRules) if (oRules.hasOwnProperty(sKey)) {
        var aRule = oRules[sKey];
        aSuggs.push('' + sFuncName + '(' + aRule.join(', ').replace(/(^|,\s)[^:]+:/g, '$1') + ')');
    }

    var sURL;

    if (/(\$\w+)#(\w+)?/.test(sFuncName)) {
        sURL = 'http://jindo.dev.naver.com/docs/jindo/2.11.0/desktop/ko/classes/jindo.' + encodeURIComponent(RegExp.$1) + '.html' + "#method_"+RegExp.$2;
    }

    throw new TypeError(fpErrorMessage(sUsed, aSuggs, sURL));

};

var _getElementById = function(doc,id){
    // Modified because on IE6/7 can be selected elements using getElementById by name
    var docEle = doc.documentElement;
    var sCheckId = "nv"+ (new Date()).getTime();
    var eDiv = doc.createElement("div");
    eDiv.style.display =  "none";
    if(typeof MSApp != "undefined"){
        MSApp.execUnsafeLocalFunction(function(){
            eDiv.innerHTML = "<input type='hidden' name='"+sCheckId+"'/>";
        });
    }else{
        eDiv.innerHTML = "<input type='hidden' name='"+sCheckId+"'/>";
    }
    docEle.insertBefore( eDiv, docEle.firstChild );
    if(doc.getElementById(sCheckId)){
        _getElementById = function(doc,id){
            var eId = doc.getElementById(id);
            if(eId == null) return eId;
            if(eId.attributes['id'] && eId.attributes['id'].value == id){
                return eId;
            }
            var aEl = doc.all[id];
            for(var i=1; i<aEl.length; i++){
                if(aEl[i].attributes['id'] && aEl[i].attributes['id'].value == id){
                    return aEl[i];
                }
            }
        };
    }else{
        _getElementById = function(doc,id){
            return doc.getElementById(id);
        };
    }

    docEle.removeChild(eDiv);
    return _getElementById(doc,id);
};
/**
	checkVarType 瑜� �섑뻾�좊븣 �ъ슜�섍퀬 �덈뒗 ���낆쓣 �삳뒗��.

	@method varType
	@ignore
	@param {String+} sTypeName ���� �대쫫
	@return {Function} ���낆쓣 寃��ы븯�� 洹쒖튃�� 援ы쁽�섎뒗 �⑥닔
 */
/**
	checkVarType 瑜� �섑뻾�좊븣 �ъ슜�� ���낆쓣 �ㅼ젙�쒕떎.

	@method varType
	@ignore
	@syntax sTypeName, fpFunc
	@syntax oTypeLists
	@param {String+} sTypeName ���� �대쫫
	@param {Function+} fpFunc ���낆쓣 寃��ы븯�� 洹쒖튃�� 援ы쁽�섎뒗 �⑥닔
	@param {Hash+} oTypeLists ���� 洹쒖튃�� �댁� 媛앹껜, �� �듭뀡�� �ъ슜�섎㈃ checkVarType 瑜� �섑뻾�좊븣 �ъ슜�� �щ윭媛쒖쓽 ���낅뱾�� �쒕쾲�� �ㅼ젙�� �� �덈떎.
	@return {this} �몄뒪�댁뒪 �먯떊
 */
nv.$Jindo.varType = function() {

    var oArgs = this.checkVarType(arguments, {
        's4str' : [ 'sTypeName:String+', 'fpFunc:Function+' ],
        's4obj' : [ 'oTypeLists:Hash+' ],
        'g' : [ 'sTypeName:String+' ]
    });

    var sDenyTypeListComma = nv.$Jindo._denyTypeListComma;

    switch (oArgs+"") {
    case 's4str':
        var sTypeNameComma = ',' + oArgs.sTypeName.replace(/\+$/, '') + ',';
        if (sDenyTypeListComma.indexOf(sTypeNameComma) > -1) {
            throw new Error('Not allowed Variable Type');
        }

        this._varTypeList[oArgs.sTypeName] = oArgs.fpFunc;
        return this;

    case 's4obj':
        var oTypeLists = oArgs.oTypeLists, fpFunc;
        for (var sTypeName in oTypeLists) if (oTypeLists.hasOwnProperty(sTypeName)) {
            fpFunc = oTypeLists[sTypeName];
            arguments.callee.call(this, sTypeName, fpFunc);
        }
        return this;

    case 'g':
        return this._varTypeList[oArgs.sTypeName];
    }

};

/**
	varType �� �깅줉�� ���� 泥댄겕 �⑥닔�먯꽌 ���낆씠 留ㅼ묶�섏� �딆쓬�� �뚮━怨� �띠쓣�� �ъ슜�쒕떎.

	@constant VARTYPE_NOT_MATCHED
	@static
	@ignore
 */
nv.$Jindo.VARTYPE_NOT_MATCHED = {};

(function() {

    var oVarTypeList = nv.$Jindo._varTypeList = {};
    var cache = nv.$Jindo;
    var ___notMatched = cache.VARTYPE_NOT_MATCHED;
    oVarTypeList['Numeric'] = function(v) {
        if (cache.isNumeric(v)) { return v * 1; }
        return ___notMatched;
    };

    oVarTypeList['Hash'] = function(val, bAutoCast){
        if (bAutoCast && nv.$H && val instanceof nv.$H) {
            return val.$value();
        } else if (cache.isHash(val)) {
            return val;
        }
        return ___notMatched;
    };

    oVarTypeList['$Class'] = function(val, bAutoCast){
        if ((!cache.isFunction(val))||!val.extend) {
            return ___notMatched;
        }
        return val;
    };

    var aDenyTypeList = [];

    for (var sTypeName in cache) if (cache.hasOwnProperty(sTypeName)) {
        if (/^is(.+)$/.test(sTypeName)) { aDenyTypeList.push(RegExp.$1); }
    }

    cache._denyTypeListComma = aDenyTypeList.join(',');

    cache.varType("ArrayStyle",function(val, bAutoCast){
        if(!val) { return ___notMatched; }
        if (
            /(Arguments|NodeList|HTMLCollection|global|Window)/.test(nv._p_._objToString.call(val)) ||
            /Object/.test(nv._p_._objToString.call(val))&&cache.isNumeric(val.length)) {
            return nv._p_._toArray(val);
        }
        return ___notMatched;
    });

    cache.varType("Form",function(val, bAutoCast){
        if(!val) { return ___notMatched; }
        if(bAutoCast&&val.$value){
            val = val.$value();
        }
        if (val.tagName&&val.tagName.toUpperCase()=="FORM") {
            return val;
        }
        return ___notMatched;
    });
})();

nv._p_._createEle = function(sParentTag,sHTML,oDoc,bWantParent){
    //-@@_createEle.hidden-@@//
    var sId = 'R' + new Date().getTime() + parseInt(Math.random() * 100000,10);

    var oDummy = oDoc.createElement("div");
    switch (sParentTag) {
        case 'select':
        case 'table':
        case 'dl':
        case 'ul':
        case 'fieldset':
        case 'audio':
            oDummy.innerHTML = '<' + sParentTag + ' class="' + sId + '">' + sHTML + '</' + sParentTag + '>';
            break;
        case 'thead':
        case 'tbody':
        case 'col':
            oDummy.innerHTML = '<table><' + sParentTag + ' class="' + sId + '">' + sHTML + '</' + sParentTag + '></table>';
            break;
        case 'tr':
            oDummy.innerHTML = '<table><tbody><tr class="' + sId + '">' + sHTML + '</tr></tbody></table>';
            break;
        default:
            oDummy.innerHTML = '<div class="' + sId + '">' + sHTML + '</div>';
    }
    var oFound;
    for (oFound = oDummy.firstChild; oFound; oFound = oFound.firstChild){
        if (oFound.className==sId) break;
    }

    return bWantParent? oFound : oFound.childNodes;
};

//-!nv.$Jindo.default end!-//

/**
	Built-In Namespace _global_

	@class nv
	@static
 */
//-!nv.$ start!-//
/**
	$() �⑥닔�� �뱀젙 �붿냼瑜� �앹꽦�쒕떎. "&lt;tagName&gt;" 怨� 媛숈� �뺤떇�� 臾몄옄�댁쓣 �낅젰�섎㈃ tagName �붿냼瑜� 媛�吏��� 媛앹껜瑜� �앹꽦�쒕떎.

	@method $
	@param {String+} elDomElement �앹꽦�� DOM �붿냼
	@return {Variant} �붿냼瑜� �앹꽦�섍퀬 媛앹껜(Object) �뺥깭濡� 諛섑솚�쒕떎.
	@throws {nv.$Except.NOT_FOUND_ARGUMENT} �뚮씪誘명꽣媛� �놁쓣 寃쎌슦.
	@remark Jindo 1.4.6 踰꾩쟾遺��� 留덉�留� �뚮씪誘명꽣�� document �붿냼瑜� 吏��뺥븷 �� �덈떎.
	@example
		// tagName怨� 媛숈� �뺤떇�� 臾몄옄�댁쓣 �댁슜�섏뿬 媛앹껜瑜� �앹꽦�쒕떎.
		var el = $("<DIV>");
		var els = $("<DIV id='div1'><SPAN>hello</SPAN></DIV>");

		// IE�� iframe�� 異붽��� �섎━癒쇳듃瑜� �앹꽦�섎젮怨� �� �뚮뒗 document瑜� 諛섎뱶�� 吏��뺥빐�� �쒕떎.(1.4.6 遺��� 吏���)
		var els = $("<div>" , iframe.contentWindow.document);
		// �꾩� 媛숈쓣 寃쎌슦 div�쒓렇媛� iframe.contentWindow.document湲곗��쇰줈 �앷�.
 */
/**
	$() �⑥닔�� DOM�먯꽌 �뱀젙 �붿냼瑜� 議곗옉�� �� �덇쾶 媛��몄삩��. ID瑜� �ъ슜�섏뿬 DOM �붿냼(Element)瑜� 媛��몄삩��. �뚮씪誘명꽣瑜� �� 媛� �댁긽 吏��뺥븯硫� DOM �붿냼瑜� �먯냼濡쒗븯�� 諛곗뿴�� 諛섑솚�쒕떎.

	@method $
	@param {String+} sID* 媛��몄삱 泥�~N 踰덉㎏ DOM �붿냼�� ID �먮뒗 �앹꽦�� DOM �붿냼
	@return {Variant} ID 媛믪쑝濡� 吏��뺥븳 DOM �붿냼(Element) �뱀� DOM �붿냼瑜� �먯냼濡� 媛�吏��� 諛곗뿴(Array)�� 諛섑솚�쒕떎. 留뚯빟 ID�� �대떦�섎뒗 �붿냼媛� �놁쑝硫� null 媛믪쓣 諛섑솚�쒕떎.
	@throws {nv.$Except.NOT_FOUND_ARGUMENT} �뚮씪誘명꽣媛� �놁쓣 寃쎌슦.
	@remark Jindo 1.4.6 踰꾩쟾遺��� 留덉�留� �뚮씪誘명꽣�� document �붿냼瑜� 吏��뺥븷 �� �덈떎.
	@example
		// ID瑜� �댁슜�섏뿬 媛앹껜瑜� 由ы꽩�쒕떎.
		<div id="div1"></div>

		var el = $("div1");

		// ID瑜� �댁슜�섏뿬 �щ윭媛쒖쓽 媛앹껜瑜� 由ы꽩�쒕떎.
		<div id="div1"></div>
		<div id="div2"></div>

		var els = $("div1","div2"); // [$("div1"),$("div2")]�� 媛숈� 寃곌낵瑜� 由ы꽩�쒕떎.
 */
nv.$ = function(sID/*, id1, id2*/) {
    //-@@$-@@//

    if(!arguments.length) throw new nv.$Error(nv.$Except.NOT_FOUND_ARGUMENT,"$");

    var ret = [], arg = arguments, nArgLeng = arg.length, lastArgument = arg[nArgLeng-1],doc = document,el  = null;
    var reg = /^<([a-z]+|h[1-5])>$/i;
    var reg2 = /^<([a-z]+|h[1-5])(\s+[^>]+)?>/i;
    if (nArgLeng > 1 && typeof lastArgument != "string" && lastArgument.body) {
        /*
         留덉�留� �몄옄媛� document�쇰븣.
         */
        arg = Array.prototype.slice.apply(arg,[0,nArgLeng-1]);
        doc = lastArgument;
    }

    for(var i=0; i < nArgLeng; i++) {
        el = arg[i] && arg[i].$value ? arg[i].$value() : arg[i];
        if (nv.$Jindo.isString(el)||nv.$Jindo.isNumeric(el)) {
            el += "";
            el = el.replace(/^\s+|\s+$/g, "");
            el = el.replace(/<!--(.|\n)*?-->/g, "");

            if (el.indexOf("<")>-1) {
                if(reg.test(el)) {
                    el = doc.createElement(RegExp.$1);
                } else if (reg2.test(el)) {
                    var p = { thead:'table', tbody:'table', tr:'tbody', td:'tr', dt:'dl', dd:'dl', li:'ul', legend:'fieldset',option:"select" ,source:"audio"};
                    var tag = RegExp.$1.toLowerCase();
                    var ele = nv._p_._createEle(p[tag],el,doc);

                    for(var i=0,leng = ele.length; i < leng ; i++) {
                        ret.push(ele[i]);
                    }

                    el = null;
                }
            }else {
                el = _getElementById(doc,el);
            }
        }
        if (el&&el.nodeType) ret[ret.length] = el;
    }
    return ret.length>1?ret:(ret[0] || null);
};

//-!nv.$ end!-//


//-!nv.$Class start!-//
/**
	nv.$Class() 媛앹껜�� Jindo �꾨젅�꾩썙�щ� �ъ슜�섏뿬 媛앹껜 吏��� �꾨줈洹몃옒諛� 諛⑹떇�쇰줈 �좏뵆由ъ��댁뀡�� 援ы쁽�� �� �덈룄濡� 吏��먰븳��.

	@class nv.$Class
	@keyword class, �대옒��
 */
/**
	�대옒��(nv.$Class() 媛앹껜)瑜� �앹꽦�쒕떎. �뚮씪誘명꽣濡� �대옒�ㅽ솕�� 媛앹껜瑜� �낅젰�쒕떎. �대떦 媛앹껜�� $init �대쫫�쇰줈 硫붿꽌�쒕� �깅줉�섎㈃ �대옒�� �몄뒪�댁뒪瑜� �앹꽦�섎뒗 �앹꽦�� �⑥닔瑜� �뺤쓽�� �� �덈떎. �먰븳  �ㅼ썙�쒕� �ъ슜�섎㈃ �몄뒪�댁뒪瑜� �앹꽦�섏� �딆븘�� �ъ슜�� �� �덈뒗 硫붿꽌�쒕� �깅줉�� �� �덈떎.

	@constructor
	@param {Hash+} oDef �대옒�ㅻ� �뺤쓽�섎뒗 媛앹껜. �대옒�ㅼ쓽 �앹꽦��, �띿꽦, 硫붿꽌�� �깆쓣 �뺤쓽�쒕떎.
	@return {nv.$Class} �앹꽦�� �대옒��(nv.$Class() 媛앹껜).
	@example
		var CClass = $Class({
		    prop : null,
		    $init : function() {
		         this.prop = $Ajax();
		         ...
		    },
			$static : {
				static_method : function(){ return 1;}
			}
		});

		var c1 = new CClass();
		var c2 = new CClass();

		// c1怨� c2�� �쒕줈 �ㅻⅨ nv.$Ajax() 媛앹껜瑜� 媛곴컖 媛�吏꾨떎.
		CClass.static_method(); // 1
 */
/**
	$autoBind�띿꽦�� true�� �깅줉�섎㈃ _媛� �ㅼ뼱媛� 硫붿꽌�쒕뒗 �먮룞�쇰줈 bind�쒕떎.

	@property $autoBind
	@type boolean
	@example
		// $autoBind �덉젣
		var OnAutoBind = $Class({
			$autoBind : true,
			num : 1,
			each : function(){
				$A([1,1]).forEach(this._check);
			},
			_check : function(v){
				// this === OnScope �몄뒪�댁뒪
				value_of(v).should_be(this.num);
			}
		});

		new OnScope().each();
	@filter desktop
 */
/**
	$static�쇰줈 �깅줉�� 硫붿꽌�쒕뒗 $Class�� �몄뒪�댁꽌�� �섏� �딆븘�� �ъ슜�� �� �덈떎.

	@property $static
	@type Object
	@example
		// $static �덉젣
		var Static = $Class({
			$static : {
				"do" : function(){
					console.log("static method");
				}

			}
		});

		Static.do();
		//static method
	@filter desktop
 */
nv.$Class = function(oDef) {
    //-@@$Class-@@//
    var oArgs = g_checkVarType(arguments, {
        '4obj' : [ 'oDef:Hash+' ]
    },"$Class");

    function typeClass() {
        var t = this;
        var a = [];

        var superFunc = function(m, superClass, func) {
            if(m!='constructor' && func.toString().indexOf("$super")>-1 ) {
                var funcArg = func.toString().replace(/function\s*\(([^\)]*)[\w\W]*/g,"$1").split(",");
                var funcStr = func.toString().replace(/function[^{]*{/,"").replace(/(\w|\.?)(this\.\$super|this)/g,function(m,m2,m3) {
                        if(!m2) { return m3+".$super"; }
                        return m;
                });
                funcStr = funcStr.substr(0,funcStr.length-1);
                func = superClass[m] = eval("false||function("+funcArg.join(",")+"){"+funcStr+"}");
            }

            return function() {
                var f = this.$this[m];
                var t = this.$this;
                var r = (t[m] = func).apply(t, arguments);
                t[m] = f;

                return r;
            };
        };

        while(t._$superClass !== undefined) {
            t.$super = new Object;
            t.$super.$this = this;

            for(var x in t._$superClass.prototype) {
                if (t._$superClass.prototype.hasOwnProperty(x)) {
                    if (this[x] === undefined && x !="$init") this[x] = t._$superClass.prototype[x];

                    if (x!='constructor' && x!='_$superClass' && typeof t._$superClass.prototype[x] == "function") {
                        t.$super[x] = superFunc(x, t._$superClass, t._$superClass.prototype[x]);
                    } else {
                        t.$super[x] = t._$superClass.prototype[x];
                    }
                }
            }

            if (typeof t.$super.$init == "function") a[a.length] = t;
            t = t.$super;
        }

        for(var i=a.length-1; i > -1; i--){
            a[i].$super.$init.apply(a[i].$super, arguments);
        }

        if(this.$autoBind) {
            for(var i in this){
                if(/^\_/.test(i) && typeof this[i] == "function") {
                    this[i] = nv.$Fn(this[i],this).bind();
                }
            }
        }

        if(typeof this.$init == "function") this.$init.apply(this,arguments);
    }

    if (oDef.$static !== undefined) {
        var i=0, x;
        for(x in oDef){
            if (oDef.hasOwnProperty(x)) {
                x=="$static"||i++;
            }
        }
        for(x in oDef.$static){
            if (oDef.$static.hasOwnProperty(x)) {
                typeClass[x] = oDef.$static[x];
            }
        }

        if (!i) return oDef.$static;
        delete oDef.$static;
    }

    typeClass.prototype = oDef;
    typeClass.prototype.constructor = typeClass;
    typeClass.prototype.kindOf = function(oClass){
        return nv._p_._kindOf(this.constructor.prototype, oClass.prototype);
    };
    typeClass.extend = nv.$Class.extend;

    return typeClass;
};

/**
	�먯떊�� �대뼡 �대옒�ㅼ쓽 醫낅쪟�몄� �뺤씤�섎뒗 硫붿꽌��.

	@method kindOf
	@param {nv.$Class} oClass �뺤씤�� �대옒��(nv.$Class() 媛앹껜)
	@return {Boolean} true | false
	@since 2.0.0
	@example
		var Parent = $Class ({});
		var Parent2 = $Class ({});
		var Child = $Class ({}).extend(Parent);

		var child = new Child();
		child.kindOf(Parent);// true
		child.kindOf(Parent2);// false
 */
nv._p_._kindOf = function(oThis, oClass){
    if(oThis != oClass){
        if(oThis._$superClass) {
            return nv._p_._kindOf(oThis._$superClass.prototype,oClass);
        } else {
            return false;
        }
    } else {
        return true;
    }
};
 /**
	extend() 硫붿꽌�쒕뒗 �뱀젙 �대옒��(nv.$Class() 媛앹껜)瑜� �곸냽�쒕떎. �곸냽�� 遺�紐� �대옒��(Super Class)瑜� 吏��뺥븳��.

	@method extend
	@param {nv.$Class} superClass �곸냽�� 遺�紐� �대옒��(nv.$Class() 媛앹껜).
	@return {this} �곸냽�� �몄뒪�댁뒪 �먯떊
	@example
		var ClassExt = $Class(classDefinition);
		ClassExt.extend(superClass);
		// ClassExt�� SuperClass瑜� �곸냽諛쏅뒗��.
 */
nv.$Class.extend = function(superClass) {
    var oArgs = g_checkVarType(arguments, {
        '4obj' : [ 'oDef:$Class' ]
    },"<static> $Class#extend");

    this.prototype._$superClass = superClass;


    // inherit static methods of parent
    var superProto = superClass.prototype;
    for(var prop in superProto){
        if(nv.$Jindo.isHash(superProto[prop])) nv.$Jindo._warn(nv.$Except.CANNOT_SET_OBJ_PROPERTY);
    }
    for(var x in superClass) {
        if (superClass.hasOwnProperty(x)) {
            if (x == "prototype") continue;
            this[x] = superClass[x];
        }
    }
    return this;
};
/**
	$super �띿꽦�� 遺�紐� �대옒�ㅼ쓽 硫붿꽌�쒖뿉 �묎렐�� �� �ъ슜�쒕떎. �섏쐞 �대옒�ㅻ뒗 this.$super.method 濡� �곸쐞 �대옒�ㅼ쓽 硫붿꽌�쒖뿉 �묎렐�� �� �덉쑝��, this.$super.$super.method �� 媛숈씠 �� �④퀎 �댁긽�� �곸쐞 �대옒�ㅻ뒗 �묎렐�� �� �녿떎. �먰븳 遺�紐� �대옒�ㅼ� �먯떇�대옒�ㅺ� 媛숈� �대쫫�� 硫붿꽌�쒕� 媛�吏�怨� �덉쓣 �� �먯떇�대옒�ㅼ뿉�� $super濡� 媛숈� �대쫫�� 硫붿꽌�쒕� �몄텧�섎㈃, 遺�紐� �대옒�ㅼ쓽 硫붿꽌�쒕� �몄텧�쒕떎.

	@property $super
	@type $Class
	@example
		var Parent = $Class ({
			a: 100,
			b: 200,
			c: 300,
			sum2: function () {
				var init = this.sum();
				return init;
			},
			sum: function () {
				return this.a + this.b
			}
		});

		var Child = $Class ({
			a: 10,
			b: 20,
			sum2 : function () {
				var init = this.sum();
				return init;
			},
			sum: function () {
				return this.b;
			}
		}).extend (Parent);

		var oChild = new Child();
		var oParent = new Parent();

		oChild.sum();           // 20
		oChild.sum2();          // 20
		oChild.$super.sum();    // 30 -> 遺�紐� �대옒�ㅼ쓽 100(a)怨� 200(b)���� �먯떇 �대옒�ㅼ쓽 10(a)怨� 20(b)�� �뷀븳��.
		oChild.$super.sum2();   // 20 -> 遺�紐� �대옒�ㅼ쓽 sum2 硫붿꽌�쒖뿉�� 遺�紐� �대옒�ㅼ쓽 sum()�� �꾨땶 �먯떇 �대옒�ㅼ쓽 sum()�� �몄텧�쒕떎.
*/
//-!nv.$Class end!-//

/**
    nv�� 踰꾩쟾怨� ���� �띿꽦

    nv.VERSION; // 踰꾩쟾�뺣낫 臾몄옄�� - ex. "2.9.2"
    nv.TYPE;    // 踰꾩쟾 ���� 臾몄옄�� (desktop|mobile) - ex. "desktop"
*/
nv.VERSION = "2.11.0";
nv.TYPE = "desktop";

/**
 	@fileOverview CSS ���됲꽣瑜� �ъ슜�� �섎━癒쇳듃 �좏깮 �붿쭊
	@name cssquery.js
	@author  AjaxUI lab
 */
//-!nv.cssquery start(nv.$Element)!-//
/**
 	Built-In Namespace _global_

	@class nv
	@static
 */
/**
 	$$() �⑥닔(cssquery)�� CSS �좏깮��(CSS Selector)瑜� �ъ슜�섏뿬 媛앹껜瑜� �먯깋�쒕떎. $$() �⑥닔 ���� cssquery() �⑥닔瑜� �ъ슜�대룄 �쒕떎.

	@method $$
	@syntax sSelector, elBaseElement
	@syntax sSelector, sBaseElement
	@param {String+} sSelector CSS �좏깮��.
	@param {Element+} [elBaseElement] �먯깋 ���곸씠 �섎뒗 DOM �붿냼. 吏��뺥븳 �붿냼�� �섏쐞 �몃뱶�먯꽌留� 媛앹껜瑜� �먯깋�쒕떎.
	@param {String+} sBaseElement �먯깋 ���곸씠 �섎뒗 DOM �붿냼�� ID 臾몄옄��. 吏��뺥븳 �붿냼�� �섏쐞 �몃뱶�먯꽌留� 媛앹껜瑜� �먯깋�쒕떎.
	@return {Array} 議곌굔�� �대떦�섎뒗 �붿냼瑜� 諛곗뿴 �뺥깭濡� 諛섑솚�쒕떎.
	@remark CSS �좏깮�먮줈 �ъ슜�� �� �덈뒗 �⑦꽩�� �쒖� �⑦꽩怨� 鍮꾪몴以� �⑦꽩�� �덈떎. �쒖� �⑦꽩�� CSS Level3 紐낆꽭�쒖뿉 �덈뒗 �⑦꽩�� 吏��먰븳��. �좏깮�먯쓽 �⑦꽩�� ���� �ㅻ챸�� �ㅼ쓬 �쒖� See Also ��ぉ�� 李멸퀬�쒕떎.<br>
		<h5>�붿냼, ID, �대옒�� �좏깮��</h5>
		<table class="tbl_board">
			<caption class="hide">�붿냼, ID, �대옒�� �좏깮��</caption>
			<thead>
				<tr>
					<th scope="col" style="width:20%">�⑦꽩</th>
					<th scope="col">�ㅻ챸</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="txt bold">*</td>
					<td class="txt">紐⑤뱺 �붿냼.
<pre class="code "><code class="prettyprint linenums">
	$$("*");
	// 臾몄꽌�� 紐⑤뱺 �붿냼.
</code></pre>
					</td>
				</tr>
				<tr>
					<td class="txt bold">HTML Tagname</td>
					<td class="txt">吏��뺣맂 HTML �쒓렇 �붿냼.
<pre class="code "><code class="prettyprint linenums">
	$$("div");
	// 臾몄꽌�� 紐⑤뱺 &lt;div&gt; �붿냼.
</code></pre>
					</td>
				</tr>
				<tr>
					<td class="txt bold">#id</td>
					<td class="txt">ID媛� 吏��뺣맂 �붿냼.
<pre class="code "><code class="prettyprint linenums">
	$$("#application");
	// ID媛� application�� �붿냼.
</code></pre>
					</td>
				</tr>
				<tr>
					<td class="txt bold">.classname</td>
					<td class="txt">�대옒�ㅺ� 吏��뺣맂 �붿냼.
<pre class="code "><code class="prettyprint linenums">
	$$(".img");
	// �대옒�ㅺ� img�� �붿냼.
</code></pre>
					</td>
				</tr>
			</tbody>
		</table>
		<h5>�띿꽦 �좏깮��</h5>
		<table class="tbl_board">
			<caption class="hide">�띿꽦 �좏깮��</caption>
			<thead>
				<tr>
					<th scope="col" style="width:20%">�⑦꽩</th>
					<th scope="col">�ㅻ챸</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="txt bold">[type]</td>
					<td class="txt">吏��뺣맂 �띿꽦�� 媛뽮퀬 �덈뒗 �붿냼.
<pre class="code "><code class="prettyprint linenums">
	$$("input[type]");
	// type �띿꽦�� 媛뽯뒗 &lt;input&gt; �붿냼.
</code></pre>
					</td>
				</tr>
				<tr>
					<td class="txt bold">[type=value]</td>
					<td class="txt">�띿꽦怨� 媛믪씠 �쇱튂�섎뒗 �붿냼.
<pre class="code "><code class="prettyprint linenums">
	$$("input[type=text]");
	// type �띿꽦 媛믪씠 text�� &lt;input&gt; �붿냼.
</code></pre>
					</td>
				</tr>
				<tr>
					<td class="txt bold">[type^=value]</td>
					<td class="txt">�띿꽦�� 媛믪씠 �뱀젙 媛믪쑝濡� �쒖옉�섎뒗 �붿냼.
<pre class="code "><code class="prettyprint linenums">
	$$("input[type^=hid]");
	//type �띿꽦 媛믪씠 hid濡� �쒖옉�섎뒗 &lt;input&gt; �붿냼.
</code></pre>
					</td>
				</tr>
				<tr>
					<td class="txt bold">[type$=value]</td>
					<td class="txt">�띿꽦�� 媛믪씠 �뱀젙 媛믪쑝濡� �앸굹�� �붿냼.
<pre class="code "><code class="prettyprint linenums">
	$$("input[type$=en]");
	//type �띿꽦 媛믪씠 en�쇰줈 �앸굹�� &lt;input&gt; �붿냼.
</code></pre>
					</td>
				</tr>
				<tr>
					<td class="txt bold">[type~=value]</td>
					<td class="txt">�띿꽦 媛믪뿉 怨듬갚�쇰줈 援щ텇�� �щ윭 媛쒖쓽 媛믪씠 議댁옱�섎뒗 寃쎌슦, 媛곴컖�� 媛� 以� �쒓�吏� 媛믪쓣 媛뽯뒗 �붿냼.
<pre class="code "><code class="prettyprint linenums">
	&lt;img src="..." alt="welcome to naver"&gt;
	$$("img[alt~=welcome]"); // �덉쓬.
	$$("img[alt~=naver]"); // �덉쓬.
	$$("img[alt~=wel]"); // �놁쓬.
</code></pre>
					</td>
				</tr>
				<tr>
					<td class="txt bold">[type*=value]</td>
					<td class="txt">�띿꽦 媛� 以묒뿉 �쇱튂�섎뒗 媛믪씠 �덈뒗 �붿냼.
<pre class="code "><code class="prettyprint linenums">
	$$("img[alt*=come]"); // �덉쓬.
	$$("img[alt*=nav]"); // �덉쓬.
</code></pre>
					</td>
				</tr>
				<tr>
					<td class="txt bold">[type!=value]</td>
					<td class="txt">媛믪씠 吏��뺣맂 媛믨낵 �쇱튂�섏� �딅뒗 �붿냼.
<pre class="code "><code class="prettyprint linenums">
	$$("input[type!=text]");
	// type �띿꽦 媛믪씠 text媛� �꾨땶 �붿냼.
</code></pre>
					</td>
				</tr>
				<tr>
					<td class="txt bold">[@type]</td>
					<td class="txt">cssquery �꾩슜�쇰줈 �ъ슜�섎뒗 �좏깮�먮줈�� �붿냼�� �띿꽦�� �꾨땶 �붿냼�� �ㅽ��� �띿꽦�� �ъ슜�쒕떎. CSS �띿꽦 �좏깮�먯쓽 �뱀꽦�� 紐⑤몢 �곸슜�� �ъ슜�� �� �덈떎.
<pre class="code "><code class="prettyprint linenums">
	$$("div[@display=block]");
	// &lt;div&gt; �붿냼 以묒뿉 display �ㅽ��� �띿꽦�� 媛믪씠 block�� �붿냼.
</code></pre>
					</td>
				</tr>
			</tbody>
		</table>
		<h5>媛��� �대옒�� �좏깮��</h5>
		<table class="tbl_board">
			<caption class="hide">媛��� �대옒�� �좏깮��</caption>
			<thead>
				<tr>
					<th scope="col" style="width:20%">�⑦꽩</th>
					<th scope="col">�ㅻ챸</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="txt bold">:nth-child(n)</td>
					<td class="txt">n踰덉㎏ �먯떇�몄� �щ�濡� �대떦 �붿냼瑜� �좏깮�쒕떎.
<pre class="code "><code class="prettyprint linenums">
	$$("div:nth-child(2)");
	// �� 踰덉㎏ �먯떇 �붿냼�� &lt;div&gt; �붿냼.

	$$("div:nth-child(2n)");
	$$("div:nth-child(even)");
	// 吏앹닔 踰덉㎏ �먯떇 �붿냼�� 紐⑤뱺 &lt;div&gt; �붿냼.

	$$("div:nth-child(2n+1)");
	$$("div:nth-child(odd)");
	// ���� 踰덉㎏ �먯떇 �붿냼�� 紐⑤뱺 &lt;div&gt; �붿냼.

	$$("div:nth-child(4n)");
	// 4�� 諛곗닔 踰덉㎏ �먯떇 �붿냼�� 紐⑤뱺 &lt;div&gt; �붿냼.
</code></pre>
					</td>
				</tr>
				<tr>
					<td class="txt bold">:nth-last-child(n)</td>
					<td class="txt">nth-child�� �숈씪�섎굹, �ㅼ뿉�쒕��� �붿냼瑜� �좏깮�쒕떎.
<pre class="code "><code class="prettyprint linenums">
	$$("div:nth-last-child(2)");
	// �ㅼ뿉�� �� 踰덉㎏ �먯떇 �붿냼�� 紐⑤뱺 &lt;div&gt; �붿냼.
</code></pre>
					</td>
				</tr>
				<tr>
					<td class="txt bold">:last-child</td>
					<td class="txt">留덉�留� �먯떇�몄� �щ�濡� �붿냼瑜� �좏깮�쒕떎.
<pre class="code "><code class="prettyprint linenums">
	$$("div:last-child");
	// 留덉�留� �먯떇 �붿냼�� 紐⑤뱺 &lt;div&gt; �붿냼.
</code></pre>
					</td>
				</tr>
				<tr>
					<td class="txt bold">:nth-of-type(n)</td>
					<td class="txt">n踰덉㎏濡� 諛쒓껄�� �붿냼瑜� �좏깮�쒕떎.
<pre class="code "><code class="prettyprint linenums">
	&lt;div&gt;
		&lt;p&gt;1&lt;/p&gt;
		&lt;span&gt;2&lt;/span&gt;
		&lt;span&gt;3&lt;/span&gt;
	&lt;/div&gt;
</code></pre>
						�꾩� 媛숈� DOM�� �덉쓣 ��, $$("span:nth-child(1)")�� &lt;span&gt; �붿냼媛� firstChild�� �붿냼�� �녾린 �뚮Ц�� 寃곌낵 媛믪쓣 諛섑솚�섏� �딅뒗�� �섏�留� $$("span:nth-of-type(1)")�� &lt;span&gt; �붿냼 以묒뿉�� 泥� 踰덉㎏ &lt;span&gt; �붿냼�� &lt;span&gt;2&lt;/span&gt;瑜� �살뼱�ㅺ쾶 �쒕떎.<br>nth-child�� 留덉갔媛�吏�濡� 吏앹닔/���� �깆쓽 �섏떇�� �ъ슜�� �� �덈떎.
					</td>
				</tr>
				<tr>
					<td class="txt bold">:first-of-type</td>
					<td class="txt">媛숈� �쒓렇 �대쫫�� 媛뽯뒗 �뺤젣 �붿냼 以묒뿉�� 泥� 踰덉㎏ �붿냼瑜� �좏깮�쒕떎.<br>nth-of-type(1)怨� 媛숈� 寃곌낵 媛믪쓣 諛섑솚�쒕떎.</td>
				</tr>
				<tr>
					<td class="txt bold">:nth-last-of-type</td>
					<td class="txt">nth-of-type怨� �숈씪�섎굹, �ㅼ뿉�쒕��� �붿냼瑜� �좏깮�쒕떎.</td>
				</tr>
				<tr>
					<td class="txt bold">:last-of-type</td>
					<td class="txt">媛숈� �쒓렇 �대쫫�� 媛뽯뒗 �뺤젣 �붿냼 以묒뿉�� 留덉�留� �붿냼瑜� �좏깮�쒕떎.<br>nth-last-of-type(1)怨� 媛숈� 寃곌낵 媛믪쓣 諛섑솚�쒕떎.</td>
				</tr>
				<tr>
					<td class="txt bold">:contains</td>
					<td class="txt">�띿뒪�� �몃뱶�� �뱀젙 臾몄옄�댁쓣 �ы븿�섍퀬 �덈뒗吏� �щ�濡� �대떦 �붿냼瑜� �좏깮�쒕떎.
<pre class="code "><code class="prettyprint linenums">
	$$("span:contains(Jindo)");
	// "Jindo" 臾몄옄�대� �ы븿�섍퀬 �덈뒗 &lt;span&gt; �붿냼.
</code></pre>
					</td>
				</tr>
				<tr>
					<td class="txt bold">:only-child</td>
					<td class="txt">�뺤젣媛� �녿뒗 �붿냼瑜� �좏깮�쒕떎.
<pre class="code "><code class="prettyprint linenums">
	&lt;div&gt;
		&lt;p&gt;1&lt;/p&gt;
		&lt;span&gt;2&lt;/span&gt;
		&lt;span&gt;3&lt;/span&gt;
	&lt;/div&gt;
</code></pre>
						�꾩쓽 DOM�먯꽌 $$("div:only-child")留� 諛섑솚 媛믪씠 �덇퀬, $$("p:only-child") �먮뒗 $$("span:only-child")�� 諛섑솚 媛믪씠 �녿떎. 利�, �뺤젣 �몃뱶媛� �녿뒗 &lt;div&gt; �붿냼留� �좏깮�쒕떎.
					</td>
				</tr>
				<tr>
					<td class="txt bold">:empty</td>
					<td class="txt">鍮꾩뼱�덈뒗 �붿냼瑜� �좏깮�쒕떎.
<pre class="code "><code class="prettyprint linenums">
	$$("span:empty");
	// �띿뒪�� �몃뱶 �먮뒗 �섏쐞 �몃뱶媛� �녿뒗 &lt;span&gt; �붿냼.
</code></pre>
					</td>
				</tr>
				<tr>
					<td class="txt bold">:not</td>
					<td class="txt">�좏깮�먯쓽 議곌굔怨� 諛섎��� �붿냼瑜� �좏깮�쒕떎.
<pre class="code "><code class="prettyprint linenums">
	$$("div:not(.img)");
	// img �대옒�ㅺ� �녿뒗 &lt;div&gt; �붿냼.
</code></pre>
					</td>
				</tr>
			</tbody>
		</table>
		<h5>肄ㅻ퉬�ㅼ씠�� �좏깮��</h5>
		<table class="tbl_board">
			<caption class="hide">肄ㅻ퉬�ㅼ씠�� �좏깮��</caption>
			<thead>
				<tr>
					<th scope="col" style="width:20%">�⑦꽩</th>
					<th scope="col">�ㅻ챸</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="txt bold">怨듬갚 (space)</td>
					<td class="txt">�섏쐞�� 紐⑤뱺 �붿냼瑜� �섎��쒕떎.
<pre class="code "><code class="prettyprint linenums">
	$$("body div");
	// &lt;body&gt; �붿냼 �섏쐞�� �랁븳 紐⑤뱺 &lt;div&gt; �붿냼.
</code></pre>
					</td>
				</tr>
				<tr>
					<td class="txt bold">&gt;</td>
					<td class="txt">�먯떇 �몃뱶�� �랁븯�� 紐⑤뱺 �붿냼瑜� �섎��쒕떎.
<pre class="code "><code class="prettyprint linenums">
	$$("div &gt; span");
	// &lt;div&gt; �붿냼�� �먯떇 �붿냼 以� 紐⑤뱺 &lt;span&gt; �붿냼.
</code></pre>
					</td>
				</tr>
				<tr>
					<td class="txt bold">+</td>
					<td class="txt">吏��뺥븳 �붿냼�� 諛붾줈 �ㅼ쓬 �뺤젣 �몃뱶�� �랁븯�� 紐⑤뱺 �붿냼瑜� �섎��쒕떎.
<pre class="code "><code class="prettyprint linenums">
	$$("div + p");
	// &lt;div&gt; �붿냼�� nextSibling�� �대떦�섎뒗 紐⑤뱺 &lt;p&gt; �붿냼.
</code></pre>
					</td>
				</tr>
				<tr>
					<td class="txt bold">~</td>
					<td class="txt">+ �⑦꽩怨� �숈씪�섎굹, 諛붾줈 �ㅼ쓬 �뺤젣 �몃뱶肉먮쭔 �꾨땲�� 吏��뺣맂 �몃뱶 �댄썑�� �랁븯�� 紐⑤뱺 �붿냼瑜� �섎��쒕떎.
<pre class="code "><code class="prettyprint linenums">
	$$("div ~ p");
	// &lt;div&gt; �붿냼 �댄썑�� �뺤젣 �몃뱶�� �랁븯�� 紐⑤뱺 &lt;p&gt; �붿냼.
</code></pre>
					</td>
				</tr>
				<tr>
					<td class="txt bold">!</td>
					<td class="txt">cssquery �꾩슜�쇰줈, 肄ㅻ퉬�ㅼ씠�곗쓽 諛섎� 諛⑺뼢�쇰줈 �먯깋�� �쒖옉�� �붿냼瑜� 寃��됲븳��.
<pre class="code "><code class="prettyprint linenums">
	$$("span ! div");
	// &lt;span&gt; �붿냼�� �곸쐞�� �덈뒗 紐⑤뱺 &lt;div&gt; �붿냼.
</code></pre>
					</td>
				</tr>
			</tbody>
		</table>
	@see nv.$Document#queryAll
	@see http://www.w3.org/TR/css3-selectors/ CSS Level3 紐낆꽭�� - W3C
	@history 2.4.0 Support mobile踰꾩쟾 JindoJS�먯꽌 ! 肄ㅻ퉬�ㅼ씠�� 吏���(!, !>, !~, !+)
	@example
		// 臾몄꽌�먯꽌 IMG �쒓렇瑜� 李얜뒗��.
		var imgs = $$('IMG');

		// div �붿냼 �섏쐞�먯꽌 IMG �쒓렇瑜� 李얜뒗��.
		var imgsInDiv = $$('IMG', $('div'));

		// 臾몄꽌�먯꽌 IMG �쒓렇 以� 媛��� 泥� �붿냼瑜� 李얜뒗��.
		var firstImg = $$.getSingle('IMG');
 */
nv.$$ = nv.cssquery = (function() {
    /*
     querySelector �ㅼ젙.
     */
    var sVersion = '3.0';

    var debugOption = { repeat : 1 };

    /*
     鍮좊Ⅸ 泥섎━瑜� �꾪빐 �몃뱶留덈떎 �좎씪�� 媛� �뗮똿
     */
    var UID = 1;

    var cost = 0;
    var validUID = {};

    var bSupportByClassName = document.getElementsByClassName ? true : false;
    var safeHTML = false;

    var getUID4HTML = function(oEl) {

        var nUID = safeHTML ? (oEl._cssquery_UID && oEl._cssquery_UID[0]) : oEl._cssquery_UID;
        if (nUID && validUID[nUID] == oEl) return nUID;

        nUID = UID++;
        oEl._cssquery_UID = safeHTML ? [ nUID ] : nUID;

        validUID[nUID] = oEl;
        return nUID;

    };
    function GEBID(oBase,sId,oDoc) {
        if(oBase.nodeType === 9 || oBase.parentNode && oBase.parentNode.tagName) {
            return _getElementById(oDoc,sId);
        } else {
            var aEle = oBase.getElementsByTagName("*");

            for(var i = 0,l = aEle.length; i < l; i++){
                if(aEle[i].id === sId) {
                    return aEle[i];
                }
            }
        }
    }
    var getUID4XML = function(oEl) {
        var oAttr = oEl.getAttribute('_cssquery_UID');
        var nUID = safeHTML ? (oAttr && oAttr[0]) : oAttr;

        if (!nUID) {
            nUID = UID++;
            oEl.setAttribute('_cssquery_UID', safeHTML ? [ nUID ] : nUID);
        }

        return nUID;

    };

    var getUID = getUID4HTML;

    var uniqid = function(sPrefix) {
        return (sPrefix || '') + new Date().getTime() + parseInt(Math.random() * 100000000,10);
    };

    function getElementsByClass(searchClass,node,tag) {
        var classElements = [];

        if(node == null) node = document;
        if(tag == null) tag = '*';

        var els = node.getElementsByTagName(tag);
        var elsLen = els.length;
        var pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)");

        for(var i=0,j=0; i < elsLen; i++) {
            if(pattern.test(els[i].className)) {
                classElements[j] = els[i];
                j++;
            }
        }
        return classElements;
    }

    var getChilds_dontShrink = function(oEl, sTagName, sClassName) {
        if (bSupportByClassName && sClassName) {
            if(oEl.getElementsByClassName)
                return oEl.getElementsByClassName(sClassName);
            if(oEl.querySelectorAll)
                return oEl.querySelectorAll(sClassName);
            return getElementsByClass(sClassName, oEl, sTagName);
        }else if (sTagName == '*') {
            return oEl.all || oEl.getElementsByTagName(sTagName);
        }
        return oEl.getElementsByTagName(sTagName);
    };

    var clearKeys = function() {
         backupKeys._keys = {};
    };

    var oDocument_dontShrink = document;

    var bXMLDocument = false;

    /*
     �곗샂��, [] �� �뚯떛�� 臾몄젣媛� �� �� �덈뒗 遺�遺� replace �쒖폒�볤린
     */
    var backupKeys = function(sQuery) {

        var oKeys = backupKeys._keys;

        /*
         �묒� �곗샂�� 嫄룹뼱�닿린
         */
        sQuery = sQuery.replace(/'(\\'|[^'])*'/g, function(sAll) {
            var uid = uniqid('QUOT');
            oKeys[uid] = sAll;
            return uid;
        });

        /*
         �� �곗샂�� 嫄룹뼱�닿린
         */
        sQuery = sQuery.replace(/"(\\"|[^"])*"/g, function(sAll) {
            var uid = uniqid('QUOT');
            oKeys[uid] = sAll;
            return uid;
        });

        /*
         [ ] �뺥깭 嫄룹뼱�닿린
         */
        sQuery = sQuery.replace(/\[(.*?)\]/g, function(sAll, sBody) {
            if (sBody.indexOf('ATTR') == 0) return sAll;
            var uid = '[' + uniqid('ATTR') + ']';
            oKeys[uid] = sAll;
            return uid;
        });

        /*
        ( ) �뺥깭 嫄룹뼱�닿린
         */
        var bChanged;

        do {

            bChanged = false;

            sQuery = sQuery.replace(/\(((\\\)|[^)|^(])*)\)/g, function(sAll, sBody) {
                if (sBody.indexOf('BRCE') == 0) return sAll;
                var uid = '_' + uniqid('BRCE');
                oKeys[uid] = sAll;
                bChanged = true;
                return uid;
            });

        } while(bChanged);

        return sQuery;

    };

    /*
     replace �쒖폒�볦� 遺�遺� 蹂듦뎄�섍린
     */
    var restoreKeys = function(sQuery, bOnlyAttrBrace) {

        var oKeys = backupKeys._keys;

        var bChanged;
        var rRegex = bOnlyAttrBrace ? /(\[ATTR[0-9]+\])/g : /(QUOT[0-9]+|\[ATTR[0-9]+\])/g;

        do {

            bChanged = false;

            sQuery = sQuery.replace(rRegex, function(sKey) {

                if (oKeys[sKey]) {
                    bChanged = true;
                    return oKeys[sKey];
                }

                return sKey;

            });

        } while(bChanged);

        /*
        ( ) �� �쒓볼��留� 踰쀪꺼�닿린
         */
        sQuery = sQuery.replace(/_BRCE[0-9]+/g, function(sKey) {
            return oKeys[sKey] ? oKeys[sKey] : sKey;
        });

        return sQuery;

    };

    /*
     replace �쒖폒�볦� 臾몄옄�댁뿉�� Quot �� �쒖쇅�섍퀬 由ы꽩
     */
    var restoreString = function(sKey) {

        var oKeys = backupKeys._keys;
        var sOrg = oKeys[sKey];

        if (!sOrg) return sKey;
        return eval(sOrg);

    };

    var wrapQuot = function(sStr) {
        return '"' + sStr.replace(/"/g, '\\"') + '"';
    };

    var getStyleKey = function(sKey) {

        if (/^@/.test(sKey)) return sKey.substr(1);
        return null;

    };

    var getCSS = function(oEl, sKey) {

        if (oEl.currentStyle) {

            if (sKey == "float") sKey = "styleFloat";
            return oEl.currentStyle[sKey] || oEl.style[sKey];

        } else if (window.getComputedStyle) {

            return oDocument_dontShrink.defaultView.getComputedStyle(oEl, null).getPropertyValue(sKey.replace(/([A-Z])/g,"-$1").toLowerCase()) || oEl.style[sKey];

        }

        if (sKey == "float" && nv._p_._JINDO_IS_IE) sKey = "styleFloat";
        return oEl.style[sKey];

    };

    var oCamels = {
        'accesskey' : 'accessKey',
        'cellspacing' : 'cellSpacing',
        'cellpadding' : 'cellPadding',
        'class' : 'className',
        'colspan' : 'colSpan',
        'for' : 'htmlFor',
        'maxlength' : 'maxLength',
        'readonly' : 'readOnly',
        'rowspan' : 'rowSpan',
        'tabindex' : 'tabIndex',
        'valign' : 'vAlign'
    };

    var getDefineCode = function(sKey) {
        var sVal;
        var sStyleKey;

        if (bXMLDocument) {

            sVal = 'oEl.getAttribute("' + sKey + '",2)';

        } else {

            if (sStyleKey = getStyleKey(sKey)) {

                sKey = '$$' + sStyleKey;
                sVal = 'getCSS(oEl, "' + sStyleKey + '")';

            } else {

                switch (sKey) {
                case 'checked':
                    sVal = 'oEl.checked + ""';
                    break;

                case 'disabled':
                    sVal = 'oEl.disabled + ""';
                    break;

                case 'enabled':
                    sVal = '!oEl.disabled + ""';
                    break;

                case 'readonly':
                    sVal = 'oEl.readOnly + ""';
                    break;

                case 'selected':
                    sVal = 'oEl.selected + ""';
                    break;

                default:
                    if (oCamels[sKey]) {
                        sVal = 'oEl.' + oCamels[sKey];
                    } else {
                        sVal = 'oEl.getAttribute("' + sKey + '",2)';
                    }
                }

            }

        }

        return '_' + sKey.replace(/\-/g,"_") + ' = ' + sVal;
    };

    var getReturnCode = function(oExpr) {

        var sStyleKey = getStyleKey(oExpr.key);

        var sVar = '_' + (sStyleKey ? '$$' + sStyleKey : oExpr.key);
        sVar = sVar.replace(/\-/g,"_");
        var sVal = oExpr.val ? wrapQuot(oExpr.val) : '';

        switch (oExpr.op) {
        case '~=':
            return '(' + sVar + ' && (" " + ' + sVar + ' + " ").indexOf(" " + ' + sVal + ' + " ") > -1)';
        case '^=':
            return '(' + sVar + ' && ' + sVar + '.indexOf(' + sVal + ') == 0)';
        case '$=':
            return '(' + sVar + ' && ' + sVar + '.substr(' + sVar + '.length - ' + oExpr.val.length + ') == ' + sVal + ')';
        case '*=':
            return '(' + sVar + ' && ' + sVar + '.indexOf(' + sVal + ') > -1)';
        case '!=':
            return '(' + sVar + ' != ' + sVal + ')';
        case '=':
            return '(' + sVar + ' == ' + sVal + ')';
        }

        return '(' + sVar + ')';

    };

    var getNodeIndex = function(oEl) {
        var nUID = getUID(oEl);
        var nIndex = oNodeIndexes[nUID] || 0;

        /*
         �몃뱶 �몃뜳�ㅻ� 援ы븷 �� �놁쑝硫�
         */
        if (nIndex == 0) {

            for (var oSib = (oEl.parentNode || oEl._IE5_parentNode).firstChild; oSib; oSib = oSib.nextSibling) {

                if (oSib.nodeType != 1){
                    continue;
                }
                nIndex++;

                setNodeIndex(oSib, nIndex);

            }

            nIndex = oNodeIndexes[nUID];

        }

        return nIndex;

    };

    /*
     紐뉖쾲吏� �먯떇�몄� �ㅼ젙�섎뒗 遺�遺�
     */
    var oNodeIndexes = {};

    var setNodeIndex = function(oEl, nIndex) {
        var nUID = getUID(oEl);
        oNodeIndexes[nUID] = nIndex;
    };

    var unsetNodeIndexes = function() {
        setTimeout(function() { oNodeIndexes = {}; }, 0);
    };

    /*
     媛��� �대옒��
     */
    var oPseudoes_dontShrink = {

        'contains' : function(oEl, sOption) {
            return (oEl.innerText || oEl.textContent || '').indexOf(sOption) > -1;
        },

        'last-child' : function(oEl, sOption) {
            for (oEl = oEl.nextSibling; oEl; oEl = oEl.nextSibling){
                if (oEl.nodeType == 1)
                    return false;
            }


            return true;
        },

        'first-child' : function(oEl, sOption) {
            for (oEl = oEl.previousSibling; oEl; oEl = oEl.previousSibling){
                if (oEl.nodeType == 1)
                    return false;
            }


            return true;
        },

        'only-child' : function(oEl, sOption) {
            var nChild = 0;

            for (var oChild = (oEl.parentNode || oEl._IE5_parentNode).firstChild; oChild; oChild = oChild.nextSibling) {
                if (oChild.nodeType == 1) nChild++;
                if (nChild > 1) return false;
            }

            return nChild ? true : false;
        },

        'empty' : function(oEl, _) {
            return oEl.firstChild ? false : true;
        },

        'nth-child' : function(oEl, nMul, nAdd) {
            var nIndex = getNodeIndex(oEl);
            return nIndex % nMul == nAdd;
        },

        'nth-last-child' : function(oEl, nMul, nAdd) {
            var oLast = (oEl.parentNode || oEl._IE5_parentNode).lastChild;
            for (; oLast; oLast = oLast.previousSibling){
                if (oLast.nodeType == 1) break;
            }


            var nTotal = getNodeIndex(oLast);
            var nIndex = getNodeIndex(oEl);

            var nLastIndex = nTotal - nIndex + 1;
            return nLastIndex % nMul == nAdd;
        },
        'checked' : function(oEl){
            return !!oEl.checked;
        },
        'selected' : function(oEl){
            return !!oEl.selected;
        },
        'enabled' : function(oEl){
            return !oEl.disabled;
        },
        'disabled' : function(oEl){
            return !!oEl.disabled;
        }
    };

    /*
     �⑥씪 part �� body �먯꽌 expression 戮묒븘��
     */
    var getExpression = function(sBody) {

        var oRet = { defines : '', returns : 'true' };

        var sBody = restoreKeys(sBody, true);

        var aExprs = [];
        var aDefineCode = [], aReturnCode = [];
        var sId, sTagName;

        /*
         �좎궗�대옒�� 議곌굔 �살뼱�닿린
         */
        var sBody = sBody.replace(/:([\w-]+)(\(([^)]*)\))?/g, function(_1, sType, _2, sOption) {
            switch (sType) {
                case 'not':
                    /*
                     愿꾪샇 �덉뿉 �덈뒗嫄� �ш��뚯떛�섍린
                     */
                    var oInner = getExpression(sOption);

                    var sFuncDefines = oInner.defines;
                    var sFuncReturns = oInner.returnsID + oInner.returnsTAG + oInner.returns;

                    aReturnCode.push('!(function() { ' + sFuncDefines + ' return ' + sFuncReturns + ' })()');
                    break;

                case 'nth-child':
                case 'nth-last-child':
                    sOption =  restoreString(sOption);

                    if (sOption == 'even'){
                        sOption = '2n';
                    }else if (sOption == 'odd') {
                        sOption = '2n+1';
                    }

                    var nMul, nAdd;
                    var matchstr = sOption.match(/([0-9]*)n([+-][0-9]+)*/);
                    if (matchstr) {
                        nMul = matchstr[1] || 1;
                        nAdd = matchstr[2] || 0;
                    } else {
                        nMul = Infinity;
                        nAdd = parseInt(sOption,10);
                    }
                    aReturnCode.push('oPseudoes_dontShrink[' + wrapQuot(sType) + '](oEl, ' + nMul + ', ' + nAdd + ')');
                    break;

                case 'first-of-type':
                case 'last-of-type':
                    sType = (sType == 'first-of-type' ? 'nth-of-type' : 'nth-last-of-type');
                    sOption = 1;
                    // 'break' statement was intentionally omitted.
                case 'nth-of-type':
                case 'nth-last-of-type':
                    sOption =  restoreString(sOption);

                    if (sOption == 'even') {
                        sOption = '2n';
                    }else if (sOption == 'odd'){
                        sOption = '2n+1';
                    }

                    var nMul, nAdd;

                    if (/([0-9]*)n([+-][0-9]+)*/.test(sOption)) {
                        nMul = parseInt(RegExp.$1,10) || 1;
                        nAdd = parseInt(RegExp.$2,20) || 0;
                    } else {
                        nMul = Infinity;
                        nAdd = parseInt(sOption,10);
                    }

                    oRet.nth = [ nMul, nAdd, sType ];
                    break;

                default:
                    sOption = sOption ? restoreString(sOption) : '';
                    aReturnCode.push('oPseudoes_dontShrink[' + wrapQuot(sType) + '](oEl, ' + wrapQuot(sOption) + ')');
            }

            return '';
        });

        /*
         [key=value] �뺥깭 議곌굔 �살뼱�닿린
         */
        var sBody = sBody.replace(/\[(@?[\w-]+)(([!^~$*]?=)([^\]]*))?\]/g, function(_1, sKey, _2, sOp, sVal) {
            sKey = restoreString(sKey);
            sVal = restoreString(sVal);

            if (sKey == 'checked' || sKey == 'disabled' || sKey == 'enabled' || sKey == 'readonly' || sKey == 'selected') {

                if (!sVal) {
                    sOp = '=';
                    sVal = 'true';
                }

            }
            aExprs.push({ key : sKey, op : sOp, val : sVal });
            return '';

        });

        var sClassName = null;

        /*
         �대옒�� 議곌굔 �살뼱�닿린
         */
        var sBody = sBody.replace(/\.([\w-]+)/g, function(_, sClass) {
            aExprs.push({ key : 'class', op : '~=', val : sClass });
            if (!sClassName) sClassName = sClass;
            return '';
        });

        /*
         id 議곌굔 �살뼱�닿린
         */
        var sBody = sBody.replace(/#([\w-]+)/g, function(_, sIdValue) {
            if (bXMLDocument) {
                aExprs.push({ key : 'id', op : '=', val : sIdValue });
            }else{
                sId = sIdValue;
            }
            return '';
        });

        sTagName = sBody == '*' ? '' : sBody;

        /*
         match �⑥닔 肄붾뱶 留뚮뱾�� �닿린
         */
        var oVars = {};

        for (var i = 0, oExpr; oExpr = aExprs[i]; i++) {

            var sKey = oExpr.key;

            if (!oVars[sKey]) aDefineCode.push(getDefineCode(sKey));
            /*
             �좎궗�대옒�� 議곌굔 寃��ш� 留� �ㅻ줈 媛��꾨줉 unshift �ъ슜
             */
            aReturnCode.unshift(getReturnCode(oExpr));
            oVars[sKey] = true;

        }

        if (aDefineCode.length) oRet.defines = 'var ' + aDefineCode.join(',') + ';';
        if (aReturnCode.length) oRet.returns = aReturnCode.join('&&');

        oRet.quotID = sId ? wrapQuot(sId) : '';
        oRet.quotTAG = sTagName ? wrapQuot(bXMLDocument ? sTagName : sTagName.toUpperCase()) : '';

        if (bSupportByClassName) oRet.quotCLASS = sClassName ? wrapQuot(sClassName) : '';

        oRet.returnsID = sId ? 'oEl.id == ' + oRet.quotID + ' && ' : '';
        oRet.returnsTAG = sTagName && sTagName != '*' ? 'oEl.tagName == ' + oRet.quotTAG + ' && ' : '';

        return oRet;

    };

    /*
     荑쇰━瑜� �곗궛�� 湲곗��쇰줈 �섎씪��
     */
    var splitToParts = function(sQuery) {

        var aParts = [];
        var sRel = ' ';

        var sBody = sQuery.replace(/(.*?)\s*(!?[+>~ ]|!)\s*/g, function(_, sBody, sRelative) {

            if (sBody) aParts.push({ rel : sRel, body : sBody });

            sRel = sRelative.replace(/\s+$/g, '') || ' ';
            return '';

        });

        if (sBody) aParts.push({ rel : sRel, body : sBody });

        return aParts;

    };

    var isNth_dontShrink = function(oEl, sTagName, nMul, nAdd, sDirection) {

        var nIndex = 0;
        for (var oSib = oEl; oSib; oSib = oSib[sDirection]){
            if (oSib.nodeType == 1 && (!sTagName || sTagName == oSib.tagName))
                    nIndex++;
        }


        return nIndex % nMul == nAdd;

    };

    /*
     �섎씪�� part 瑜� �⑥닔濡� 而댄뙆�� �섍린
     */
    var compileParts = function(aParts) {
        var aPartExprs = [];
        /*
         �섎씪�� 遺�遺꾨뱾 議곌굔 留뚮뱾湲�
         */
        for (var i=0,oPart; oPart = aParts[i]; i++)
            aPartExprs.push(getExpression(oPart.body));

        //////////////////// BEGIN

        var sFunc = '';
        var sPushCode = 'aRet.push(oEl); if (oOptions.single) { bStop = true; }';

        for(var i=aParts.length-1, oPart; oPart = aParts[i]; i--) {

            var oExpr = aPartExprs[i];
            var sPush = (debugOption.callback ? 'cost++;' : '') + oExpr.defines;


            var sReturn = 'if (bStop) {' + (i == 0 ? 'return aRet;' : 'return;') + '}';

            if (oExpr.returns == 'true') {
                sPush += (sFunc ? sFunc + '(oEl);' : sPushCode) + sReturn;
            }else{
                sPush += 'if (' + oExpr.returns + ') {' + (sFunc ? sFunc + '(oEl);' : sPushCode ) + sReturn + '}';
            }

            var sCheckTag = 'oEl.nodeType != 1';
            if (oExpr.quotTAG) sCheckTag = 'oEl.tagName != ' + oExpr.quotTAG;

            var sTmpFunc =
                '(function(oBase' +
                    (i == 0 ? ', oOptions) { var bStop = false; var aRet = [];' : ') {');

            if (oExpr.nth) {
                sPush =
                    'if (isNth_dontShrink(oEl, ' +
                    (oExpr.quotTAG ? oExpr.quotTAG : 'false') + ',' +
                    oExpr.nth[0] + ',' +
                    oExpr.nth[1] + ',' +
                    '"' + (oExpr.nth[2] == 'nth-of-type' ? 'previousSibling' : 'nextSibling') + '")) {' + sPush + '}';
            }

            switch (oPart.rel) {
            case ' ':
                if (oExpr.quotID) {

                    sTmpFunc +=
                        // 'var oEl = oDocument_dontShrink.getElementById(' + oExpr.quotID + ');' +
                        'var oEl = GEBID(oBase,' + oExpr.quotID + ',oDocument_dontShrink);' +
                        'var oCandi = oEl;' +
                        'for (; oCandi; oCandi = (oCandi.parentNode || oCandi._IE5_parentNode)) {' +
                            'if (oCandi == oBase) break;' +
                        '}' +
                        'if (!oCandi || ' + sCheckTag + ') return aRet;' +
                        sPush;

                } else {

                    sTmpFunc +=
                        'var aCandi = getChilds_dontShrink(oBase, ' + (oExpr.quotTAG || '"*"') + ', ' + (oExpr.quotCLASS || 'null') + ');' +
                        'for (var i = 0, oEl; oEl = aCandi[i]; i++) {' +
                            (oExpr.quotCLASS ? 'if (' + sCheckTag + ') continue;' : '') +
                            sPush +
                        '}';

                }

                break;

            case '>':
                if (oExpr.quotID) {

                    sTmpFunc +=
                        // 'var oEl = oDocument_dontShrink.getElementById(' + oExpr.quotID + ');' +
                        'var oEl = GEBID(oBase,' + oExpr.quotID + ',oDocument_dontShrink);' +
                        'if ((oEl.parentNode || oEl._IE5_parentNode) != oBase || ' + sCheckTag + ') return aRet;' +
                        sPush;

                } else {

                    sTmpFunc +=
                        'for (var oEl = oBase.firstChild; oEl; oEl = oEl.nextSibling) {' +
                            'if (' + sCheckTag + ') { continue; }' +
                            sPush +
                        '}';

                }

                break;

            case '+':
                if (oExpr.quotID) {

                    sTmpFunc +=
                        // 'var oEl = oDocument_dontShrink.getElementById(' + oExpr.quotID + ');' +
                        'var oEl = GEBID(oBase,' + oExpr.quotID + ',oDocument_dontShrink);' +
                        'var oPrev;' +
                        'for (oPrev = oEl.previousSibling; oPrev; oPrev = oPrev.previousSibling) { if (oPrev.nodeType == 1) break; }' +
                        'if (!oPrev || oPrev != oBase || ' + sCheckTag + ') return aRet;' +
                        sPush;

                } else {

                    sTmpFunc +=
                        'for (var oEl = oBase.nextSibling; oEl; oEl = oEl.nextSibling) { if (oEl.nodeType == 1) break; }' +
                        'if (!oEl || ' + sCheckTag + ') { return aRet; }' +
                        sPush;

                }

                break;

            case '~':

                if (oExpr.quotID) {

                    sTmpFunc +=
                        // 'var oEl = oDocument_dontShrink.getElementById(' + oExpr.quotID + ');' +
                        'var oEl = GEBID(oBase,' + oExpr.quotID + ',oDocument_dontShrink);' +
                        'var oCandi = oEl;' +
                        'for (; oCandi; oCandi = oCandi.previousSibling) { if (oCandi == oBase) break; }' +
                        'if (!oCandi || ' + sCheckTag + ') return aRet;' +
                        sPush;

                } else {

                    sTmpFunc +=
                        'for (var oEl = oBase.nextSibling; oEl; oEl = oEl.nextSibling) {' +
                            'if (' + sCheckTag + ') { continue; }' +
                            'if (!markElement_dontShrink(oEl, ' + i + ')) { break; }' +
                            sPush +
                        '}';

                }

                break;

            case '!' :

                if (oExpr.quotID) {

                    sTmpFunc +=
                        // 'var oEl = oDocument_dontShrink.getElementById(' + oExpr.quotID + ');' +
                        'var oEl = GEBID(oBase,' + oExpr.quotID + ',oDocument_dontShrink);' +
                        'for (; oBase; oBase = (oBase.parentNode || oBase._IE5_parentNode)) { if (oBase == oEl) break; }' +
                        'if (!oBase || ' + sCheckTag + ') return aRet;' +
                        sPush;

                } else {

                    sTmpFunc +=
                        'for (var oEl = (oBase.parentNode || oBase._IE5_parentNode); oEl; oEl = oEl && (oEl.parentNode || oEl._IE5_parentNode)) {'+
                            'if (' + sCheckTag + ') { continue; }' +
                            sPush +
                        '}';

                }

                break;

            case '!>' :

                if (oExpr.quotID) {

                    sTmpFunc +=
                        // 'var oEl = oDocument_dontShrink.getElementById(' + oExpr.quotID + ');' +
                        'var oEl = GEBID(oBase,' + oExpr.quotID + ',oDocument_dontShrink);' +
                        'var oRel = (oBase.parentNode || oBase._IE5_parentNode);' +
                        'if (!oRel || oEl != oRel || (' + sCheckTag + ')) return aRet;' +
                        sPush;

                } else {

                    sTmpFunc +=
                        'var oEl = (oBase.parentNode || oBase._IE5_parentNode);' +
                        'if (!oEl || ' + sCheckTag + ') { return aRet; }' +
                        sPush;

                }

                break;

            case '!+' :

                if (oExpr.quotID) {

                    sTmpFunc +=
                        // 'var oEl = oDocument_dontShrink.getElementById(' + oExpr.quotID + ');' +
                        'var oEl = GEBID(oBase,' + oExpr.quotID + ',oDocument_dontShrink);' +
                        'var oRel;' +
                        'for (oRel = oBase.previousSibling; oRel; oRel = oRel.previousSibling) { if (oRel.nodeType == 1) break; }' +
                        'if (!oRel || oEl != oRel || (' + sCheckTag + ')) return aRet;' +
                        sPush;

                } else {

                    sTmpFunc +=
                        'for (oEl = oBase.previousSibling; oEl; oEl = oEl.previousSibling) { if (oEl.nodeType == 1) break; }' +
                        'if (!oEl || ' + sCheckTag + ') { return aRet; }' +
                        sPush;

                }

                break;

            case '!~' :

                if (oExpr.quotID) {

                    sTmpFunc +=
                        // 'var oEl = oDocument_dontShrink.getElementById(' + oExpr.quotID + ');' +
                        'var oEl = GEBID(oBase,' + oExpr.quotID + ',oDocument_dontShrink);' +
                        'var oRel;' +
                        'for (oRel = oBase.previousSibling; oRel; oRel = oRel.previousSibling) { ' +
                            'if (oRel.nodeType != 1) { continue; }' +
                            'if (oRel == oEl) { break; }' +
                        '}' +
                        'if (!oRel || (' + sCheckTag + ')) return aRet;' +
                        sPush;

                } else {

                    sTmpFunc +=
                        'for (oEl = oBase.previousSibling; oEl; oEl = oEl.previousSibling) {' +
                            'if (' + sCheckTag + ') { continue; }' +
                            'if (!markElement_dontShrink(oEl, ' + i + ')) { break; }' +
                            sPush +
                        '}';

                }

            }

            sTmpFunc +=
                (i == 0 ? 'return aRet;' : '') +
            '})';

            sFunc = sTmpFunc;

        }

        var fpCompiled;
        eval('fpCompiled=' + sFunc + ';');
        return fpCompiled;

    };

    /*
     荑쇰━瑜� match �⑥닔濡� 蹂���
     */
    var parseQuery = function(sQuery) {
        var sCacheKey = sQuery;

        var fpSelf = arguments.callee;
        var fpFunction = fpSelf._cache[sCacheKey];

        if (!fpFunction) {

            sQuery = backupKeys(sQuery);

            var aParts = splitToParts(sQuery);

            fpFunction = fpSelf._cache[sCacheKey] = compileParts(aParts);
            fpFunction.depth = aParts.length;

        }

        return fpFunction;

    };

    parseQuery._cache = {};

    /*
     test 荑쇰━瑜� match �⑥닔濡� 蹂���
     */
    var parseTestQuery = function(sQuery) {

        var fpSelf = arguments.callee;

        var aSplitQuery = backupKeys(sQuery).split(/\s*,\s*/);
        var aResult = [];

        var nLen = aSplitQuery.length;
        var aFunc = [];

        for (var i = 0; i < nLen; i++) {

            aFunc.push((function(sQuery) {

                var sCacheKey = sQuery;
                var fpFunction = fpSelf._cache[sCacheKey];

                if (!fpFunction) {

                    sQuery = backupKeys(sQuery);
                    var oExpr = getExpression(sQuery);

                    eval('fpFunction = function(oEl) { ' + oExpr.defines + 'return (' + oExpr.returnsID + oExpr.returnsTAG + oExpr.returns + '); };');

                }

                return fpFunction;

            })(restoreKeys(aSplitQuery[i])));

        }
        return aFunc;

    };

    parseTestQuery._cache = {};

    var distinct = function(aList) {

        var aDistinct = [];
        var oDummy = {};

        for (var i = 0, oEl; oEl = aList[i]; i++) {

            var nUID = getUID(oEl);
            if (oDummy[nUID]) continue;

            aDistinct.push(oEl);
            oDummy[nUID] = true;
        }

        return aDistinct;

    };

    var markElement_dontShrink = function(oEl, nDepth) {

        var nUID = getUID(oEl);
        if (cssquery._marked[nDepth][nUID]) return false;

        cssquery._marked[nDepth][nUID] = true;
        return true;

    };

    var getParentElement = function(oParent){
        if(!oParent) {
            return document;
        }

        var nParentNodeType;

        oParent = oParent.$value ? oParent.$value() : oParent;

        //-@@cssquery-@@//
        if(nv.$Jindo.isString(oParent)){
            try{
                oParent = document.getElementById(oParent);
            }catch(e){
                oParent = document;
            }
        }

        nParentNodeType = oParent.nodeType;

        if(nParentNodeType != 1 && nParentNodeType != 9 && nParentNodeType != 10 && nParentNodeType != 11){
            oParent = oParent.ownerDocument || oParent.document;
        }

        return oParent || oParent.ownerDocument || oParent.document;
    };

    var oResultCache = null;
    var bUseResultCache = false;
    var bExtremeMode = false;

    var old_cssquery = function(sQuery, oParent, oOptions) {
        var oArgs = g_checkVarType(arguments, {
            '4str'   : [ 'sQuery:String+'],
            '4var'  : [ 'sQuery:String+', 'oParent:Variant' ],
            '4var2' : [ 'sQuery:String+', 'oParent:Variant', 'oOptions:Variant' ]
        },"cssquery");

        oParent = getParentElement(oParent);
        oOptions = oOptions && oOptions.$value ? oOptions.$value() : oOptions;

        if (typeof sQuery == 'object') {

            var oResult = {};

            for (var k in sQuery){
                if(sQuery.hasOwnProperty(k))
                    oResult[k] = arguments.callee(sQuery[k], oParent, oOptions);
            }

            return oResult;
        }

        cost = 0;

        var executeTime = new Date().getTime();
        var aRet;

        for (var r = 0, rp = debugOption.repeat; r < rp; r++) {

            aRet = (function(sQuery, oParent, oOptions) {

                if(oOptions){
                    if(!oOptions.oneTimeOffCache){
                        oOptions.oneTimeOffCache = false;
                    }
                }else{
                    oOptions = {oneTimeOffCache:false};
                }
                cssquery.safeHTML(oOptions.oneTimeOffCache);

                if (!oParent) oParent = document;

                /*
                 ownerDocument �≪븘二쇨린
                 */
                oDocument_dontShrink = oParent.ownerDocument || oParent.document || oParent;

                /*
                 釉뚮씪�곗� 踰꾩쟾�� IE5.5 �댄븯
                 */
                if (/\bMSIE\s([0-9]+(\.[0-9]+)*);/.test(nv._p_._j_ag) && parseFloat(RegExp.$1) < 6) {
                    try { oDocument_dontShrink.location; } catch(e) { oDocument_dontShrink = document; }

                    oDocument_dontShrink.firstChild = oDocument_dontShrink.getElementsByTagName('html')[0];
                    oDocument_dontShrink.firstChild._IE5_parentNode = oDocument_dontShrink;
                }

                /*
                 XMLDocument �몄� 泥댄겕
                 */
                bXMLDocument = (typeof XMLDocument !== 'undefined') ? (oDocument_dontShrink.constructor === XMLDocument) : (!oDocument_dontShrink.location);
                getUID = bXMLDocument ? getUID4XML : getUID4HTML;

                clearKeys();
                /*
                 荑쇰━瑜� �쇳몴濡� �섎늻湲�
                 */
                var aSplitQuery = backupKeys(sQuery).split(/\s*,\s*/);
                var aResult = [];

                var nLen = aSplitQuery.length;

                for (var i = 0; i < nLen; i++)
                    aSplitQuery[i] = restoreKeys(aSplitQuery[i]);

                /*
                 �쇳몴濡� �섎닠吏� 荑쇰━ 猷⑦봽
                 */
                for (var i = 0; i < nLen; i++) {

                    var sSingleQuery = aSplitQuery[i];
                    var aSingleQueryResult = null;

                    var sResultCacheKey = sSingleQuery + (oOptions.single ? '_single' : '');

                    /*
                     寃곌낵 罹먯떆 �ㅼ쭚
                     */
                    var aCache = bUseResultCache ? oResultCache[sResultCacheKey] : null;
                    if (aCache) {

                        /*
                         罹먯떛�섏뼱 �덈뒗寃� �덉쑝硫� parent 媛� 媛숈�嫄댁� 寃��ы븳�� aSingleQueryResult �� ����
                         */
                        for (var j = 0, oCache; oCache = aCache[j]; j++) {
                            if (oCache.parent == oParent) {
                                aSingleQueryResult = oCache.result;
                                break;
                            }
                        }

                    }

                    if (!aSingleQueryResult) {

                        var fpFunction = parseQuery(sSingleQuery);

                        cssquery._marked = [];
                        for (var j = 0, nDepth = fpFunction.depth; j < nDepth; j++)
                            cssquery._marked.push({});

                        aSingleQueryResult = distinct(fpFunction(oParent, oOptions));

                        /*
                         寃곌낵 罹먯떆瑜� �ъ슜以묒씠硫� 罹먯떆�� ����
                         */
                        if (bUseResultCache&&!oOptions.oneTimeOffCache) {
                            if (!(oResultCache[sResultCacheKey] instanceof Array)) oResultCache[sResultCacheKey] = [];
                            oResultCache[sResultCacheKey].push({ parent : oParent, result : aSingleQueryResult });
                        }

                    }

                    aResult = aResult.concat(aSingleQueryResult);

                }
                unsetNodeIndexes();

                return aResult;

            })(sQuery, oParent, oOptions);

        }

        executeTime = new Date().getTime() - executeTime;

        if (debugOption.callback) debugOption.callback(sQuery, cost, executeTime);

        return aRet;

    };
    var cssquery;
    if (document.querySelectorAll) {
        function _isNonStandardQueryButNotException(sQuery){
            return /\[\s*(?:checked|selected|disabled)/.test(sQuery);
        }
        function _commaRevise (sQuery,sChange) {
            return sQuery.replace(/\,/gi,sChange);
        }
        function _startCombinator (sQuery) {
            return /^[~>+]/.test(sQuery);
        }
        function _addQueryId(el, sIdName){
            var sQueryId, sValue;

            if(/^\w+$/.test(el.id)){
                sQueryId = "#" + el.id;
            }else{
                sValue = "C" + new Date().getTime() + Math.floor(Math.random() * 1000000);
                el.setAttribute(sIdName, sValue);
                sQueryId = "[" + sIdName + "=" + sValue + "]";
            }

            return sQueryId;
        }
        function _getSelectorMethod(sQuery, bDocument) {
            var oRet = { method : null, query : null };

            if(/^\s*[a-z]+\s*$/i.test(sQuery)) {
                oRet.method = "getElementsByTagName";
            } else if(/^\s*([#\.])([\w\-]+)\s*$/i.test(sQuery)) {
                oRet.method = RegExp.$1 == "#" ? "getElementById" : "getElementsByClassName";
                oRet.query = RegExp.$2;
            }

            if(!document[oRet.method] || RegExp.$1 == "#" && !bDocument) {
                oRet.method = oRet.query = null;
            }

            return oRet;
        }

        var _div = document.createElement("div");

        /**
          @lends $$
         */
        cssquery = function(sQuery, oParent, oOptions){
            var oArgs = g_checkVarType(arguments, {
                '4str'   : [ 'sQuery:String+'],
                '4var'  : [ 'sQuery:String+', 'oParent:Variant' ],
                '4var2' : [ 'sQuery:String+', 'oParent:Variant', 'oOptions:Variant' ]
            },"cssquery"),
            sTempId, aRet, nParentNodeType, bUseQueryId, oOldParent, queryid, _clone, sTagName, _parent, vSelectorMethod, sQueryAttrName = "queryid";

            oParent = getParentElement(oParent);
            oOptions = oOptions && oOptions.$value ? oOptions.$value() : oOptions;

            /*
            	[key=val]�� �� val媛� �レ옄�대㈃  ''濡� 臾띠뼱二쇰뒗 濡쒖쭅
            */
            var re = /\[(.*?)=([\w\d]*)\]/g;

            if(re.test(sQuery)) {
                sQuery = sQuery.replace(re, "[$1='$2']");
            }

            nParentNodeType = oParent.nodeType;

            try{
                if(_isNonStandardQueryButNotException(sQuery)){
                    return old_cssquery(sQuery, oParent, oOptions);
                }
                sTagName = (oParent.tagName||"").toUpperCase();

                vSelectorMethod = _getSelectorMethod(sQuery, nParentNodeType == 9);

                if(vSelectorMethod.query) {
                    sQuery = vSelectorMethod.query;
                }

                vSelectorMethod = vSelectorMethod.method;

                if(nParentNodeType!==9&&sTagName!="HTML"){
                    if(nParentNodeType === 11){
                        /*
                        	documentFragment�� �� �� 蹂듭궗�댁꽌 李얠쓬.
                        */
                        oParent = oParent.cloneNode(true);
                        _clone = _div.cloneNode(true);
                        _clone.appendChild(oParent);
                        oParent = _clone;
                        _clone = null;
                    }

                    if(!vSelectorMethod) {
                        bUseQueryId = true;
                        queryid = _addQueryId(oParent, sQueryAttrName);
                        sQuery = _commaRevise(queryid+" "+ sQuery,", "+queryid+" ");
                    }

                    if((_parent = oParent.parentNode) || sTagName === "BODY" || nv.$Element._contain((oParent.ownerDocument || oParent.document).body,oParent)) {
                        /*
                        	�붿씠 遺숈� 寃쎌슦�� �곸쐞 �섎━癒쇳듃瑜� 湲곗��쇰줈
                        */
                        if(!vSelectorMethod) {
                            oOldParent = oParent;
                            oParent = _parent;
                        }

                    } else if(!vSelectorMethod) {
                        /*
                        	�붿씠 �⑥뼱吏� 寃쎌슦�먮뒗 �곸쐞 �섎━癒쇳듃瑜� 留뚮뱾�댁꽌 �먯깋.
                        */
                        _clone = _div.cloneNode(true);
                        // id = oParent.id;
                        oOldParent = oParent;
                        _clone.appendChild(oOldParent);
                        oParent = _clone;
                    }

                } else {
                    oParent = (oParent.ownerDocument || oParent.document||oParent);
                    if(_startCombinator(sQuery)) return [];
                }

                if(oOptions&&oOptions.single) {
                    if(vSelectorMethod) {
                        aRet = oParent[vSelectorMethod](sQuery);
                        aRet = [ vSelectorMethod == "getElementById" ? aRet : aRet[0] ];
                    } else {
                        aRet = [ oParent.querySelector(sQuery) ];
                    }

                } else {
                    if(vSelectorMethod) {
                        aRet = oParent[vSelectorMethod](sQuery);

                        if(vSelectorMethod == "getElementById") {
                            aRet = aRet ? [aRet] : [];
                        }
                    } else {
                        aRet = oParent.querySelectorAll(sQuery);
                    }

                    aRet = nv._p_._toArray(aRet);
                }

            } catch(e) {
                aRet =  old_cssquery(sQuery, oParent, oOptions);
            }

            if(bUseQueryId){
                oOldParent.removeAttribute(sQueryAttrName);
                _clone = null;
            }
            return aRet;
        };
    }else{
        cssquery = old_cssquery;
    }
    /**
     	test() 硫붿꽌�쒕뒗 �뱀젙 �붿냼媛� �대떦 CSS �좏깮��(CSS Selector)�� 遺��⑺븯�� �붿냼�몄� �먮떒�섏뿬 Boolean �뺥깭濡� 諛섑솚�쒕떎.

	@method $$.test
	@static
	@param {Element+} element 寃��ы븯怨좎옄 �섎뒗 �붿냼
	@param {String+} sCSSSelector CSS �좏깮��. CSS �좏깮�먮줈 �ъ슜�� �� �덈뒗 �⑦꽩�� �쒖� �⑦꽩怨� 鍮꾪몴以� �⑦꽩�� �덈떎. �쒖� �⑦꽩�� CSS Level3 紐낆꽭�쒖뿉 �덈뒗 �⑦꽩�� 吏��먰븳��.
	@return {Boolean} 議곌굔�� 遺��⑺븯硫� true, 遺��⑺븯吏� �딆쑝硫� false瑜� 諛섑솚�쒕떎.
	@remark
		<ul class="disc">
			<li>CSS �좏깮�먯뿉 �곌껐�먮뒗 �ъ슜�� �� �놁쓬�� �좎쓽�쒕떎.</li>
			<li>�좏깮�먯쓽 �⑦꽩�� ���� �ㅻ챸�� $$() �⑥닔�� See Also ��ぉ�� 李멸퀬�쒕떎.</li>
		</ul>
	@see nv.$$
	@see http://www.w3.org/TR/css3-selectors/ CSS Level3 紐낆꽭�� - W3C
	@example
		// oEl �� div �쒓렇 �먮뒗 p �쒓렇, �먮뒗 align �띿꽦�� center濡� 吏��뺣맂 �붿냼�몄� 寃��ы븳��.
		if (cssquery.test(oEl, 'div, p, [align=center]'))
		alert('�대떦 議곌굔 留뚯”');
     */
    cssquery.test = function(oEl, sQuery) {
        clearKeys();
        try{
            var oArgs = g_checkVarType(arguments, {
                '4ele' : [ 'oEl:Element+', 'sQuery:String+' ],
                '4doc' : [ 'oEl:Document+', 'sQuery:String+' ]
            },"<static> cssquery#test");
            oEl = oArgs.oEl;
            sQuery = oArgs.sQuery;
        }catch(e){
            return false;
        }

        var aFunc = parseTestQuery(sQuery);

        for (var i = 0, nLen = aFunc.length; i < nLen; i++){
            if (aFunc[i](oEl)) return true;
        }

        return false;
    };

    /**
     	useCache() 硫붿꽌�쒕뒗 $$() �⑥닔(cssquery)瑜� �ъ슜�� �� 罹먯떆瑜� �ъ슜�� 寃껋씤吏� �ㅼ젙�쒕떎. 罹먯떆瑜� �ъ슜�섎㈃ �숈씪�� �좏깮�먮줈 �먯깋�섎뒗 寃쎌슦 �먯깋�섏� �딄퀬 湲곗〈 �먯깋 寃곌낵瑜� 諛섑솚�쒕떎. �곕씪�� �ъ슜�먭� 蹂��� 罹먯떆瑜� �좉꼍�곗� �딄퀬 �명븯怨� 鍮좊Ⅴ寃� �ъ슜�� �� �덈뒗 �μ젏�� �덉�留� �좊ː�깆쓣 �꾪빐 DOM 援ъ“媛� �숈쟻�쇰줈 蹂��섏� �딆쓣 �뚮쭔 �ъ슜�댁빞 �쒕떎.

	@method $$.useCache
	@static
	@param {Boolean} [bFlag] 罹먲옙占쏙옙 �ъ슜 �щ�瑜� 吏��뺥븳��. �� �뚮씪誘명꽣瑜� �앸왂�섎㈃ 罹먯떆 �ъ슜 �곹깭留� 諛섑솚�쒕떎.
	@return {Boolean} 罹먯떆 �ъ슜 �곹깭瑜� 諛섑솚�쒕떎.
	@see nv.$$.clearCache
     */
    cssquery.useCache = function(bFlag) {

        if (bFlag !== undefined) {
            bUseResultCache = bFlag;
            cssquery.clearCache();
        }

        return bUseResultCache;

    };

    /**
     	clearCache() 硫붿꽌�쒕뒗 $$() �⑥닔(cssquery)�먯꽌 罹먯떆瑜� �ъ슜�� �� 罹먯떆瑜� 鍮꾩슱 �� �ъ슜�쒕떎. DOM 援ъ“媛� �숈쟻�쇰줈 諛붽뺨 湲곗〈�� 罹먯떆 �곗씠�곌� �좊ː�깆씠 �놁쓣 �� �ъ슜�쒕떎.

	@method $$.clearCache
	@static
	@see nv.$$.useCache
     */
    cssquery.clearCache = function() {
        oResultCache = {};
    };

    /**
     	getSingle() 硫붿꽌�쒕뒗 CSS �좏깮�먮� �ъ슜�먯꽌 議곌굔�� 留뚯”�섎뒗 泥� 踰덉㎏ �붿냼瑜� 媛��몄삩��. 諛섑솚�섎뒗 媛믪� 諛곗뿴�� �꾨땶 媛앹콈 �먮뒗 null�대떎. 議곌굔�� 留뚯”�섎뒗 �붿냼瑜� 李얠쑝硫� 諛붾줈 �먯깋 �묒뾽�� 以묐떒�섍린 �뚮Ц�� 寃곌낵媛� �섎굹�쇰뒗 蹂댁옣�� �덉쓣 �� 鍮좊Ⅸ �띾룄濡� 寃곌낵瑜� 媛��몄삱 �� �덈떎.

	@method $$.getSingle
	@static
	@syntax sSelector, oBaseElement, oOption
	@syntax sSelector, sBaseElement, oOption
	@param {String+} sSelector CSS �좏깮��(CSS Selector). CSS �좏깮�먮줈 �ъ슜�� �� �덈뒗 �⑦꽩�� �쒖� �⑦꽩怨� 鍮꾪몴以� �⑦꽩�� �덈떎. �쒖� �⑦꽩�� CSS3 Level3 紐낆꽭�쒖뿉 �덈뒗 �⑦꽩�� 吏��먰븳��. �좏깮�먯쓽 �⑦꽩�� ���� �ㅻ챸�� $$() �⑥닔�� See Also ��ぉ�� 李멸퀬�쒕떎.
	@param {Element+} [oBaseElement] �먯깋 ���곸씠 �섎뒗 DOM �붿냼. 吏��뺥븳 �붿냼�� �섏쐞 �몃뱶�먯꽌留� 媛앹껜瑜� �먯깋�쒕떎. �앸왂�� 寃쎌슦 臾몄꽌瑜� ���곸쑝濡� 李얜뒗��.
	@param {Hash+} [oOption] �듭뀡 媛앹껜�� oneTimeOffCache �띿꽦�� true濡� �ㅼ젙�섎㈃ �먯깋�� �� 罹먯떆瑜� �ъ슜�섏� �딅뒗��.
	@param {String+} [sBaseElement] �먯깋 ���곸씠 �섎뒗 DOM �붿냼�� ID. 吏��뺥븳 �붿냼�� �섏쐞 �몃뱶�먯꽌留� 媛앹껜瑜� �먯깋�쒕떎. �앸왂�� 寃쎌슦 臾몄꽌瑜� ���곸쑝濡� 李얜뒗��.  ID瑜� �ｌ쓣 �� �덈떎.
	@return {Element | Boolean} �좏깮�� �붿냼. 寃곌낵媛� �놁쑝硫� null�� 諛섑솚�쒕떎.
	@see nv.$Document#query
	@see nv.$$.useCache
	@see nv.$$
	@see http://www.w3.org/TR/css3-selectors/ CSS Level3 紐낆꽭�� - W3C
     */
    cssquery.getSingle = function(sQuery, oParent, oOptions) {

        oOptions = oOptions && oOptions.$value ? oOptions.$value() : oOptions;

        return cssquery(sQuery, oParent, {
            single : true ,
            oneTimeOffCache:oOptions?(!!oOptions.oneTimeOffCache):false
        })[0] || null;
    };


    /**
     	xpath() 硫붿꽌�쒕뒗 XPath 臾몃쾿�� 留뚯”�섎뒗 �붿냼瑜� 媛��몄삩��. 吏��먰븯�� 臾몃쾿�� �쒗븳�곸씠誘�濡� �뱀닔�� 寃쎌슦�먮쭔 �ъ슜�� 寃껋쓣 沅뚯옣�쒕떎.

	@method $$.xpath
	@static
	@param {String+} sXPath XPath 媛�.
	@param {Element} [elBaseElement] �먯깋 ���곸씠 �섎뒗 DOM �붿냼. 吏��뺥븳 �붿냼�� �섏쐞 �몃뱶�먯꽌留� 媛앹껜瑜� �먯깋�쒕떎.
	@return {Array | Boolean} XPath 臾몃쾿�� 留뚯”�섎뒗 �붿냼瑜� �먯냼濡� �섎뒗 諛곗뿴. 寃곌낵媛� �놁쑝硫� null�� 諛섑솚�쒕떎.
	@filter desktop
	@see nv.$Document#xpathAll
	@see http://www.w3.org/standards/techs/xpath#w3c_all XPath 臾몄꽌 - W3C
     */
    cssquery.xpath = function(sXPath, oParent) {
        sXPath = sXPath && sXPath.$value ? sXPath.$value() : sXPath;

        sXPath = sXPath.replace(/\/(\w+)(\[([0-9]+)\])?/g, function(_1, sTag, _2, sTh) {
            sTh = sTh || '1';
            return '>' + sTag + ':nth-of-type(' + sTh + ')';
        });

        return old_cssquery(sXPath, oParent);
    };

    /**
     	debug() 硫붿꽌�쒕뒗 $$() �⑥닔(cssquery)瑜� �ъ슜�� �� �깅뒫�� 痢≪젙�섍린 �꾪븳 湲곕뒫�� �쒓났�섎뒗 �⑥닔�대떎. �뚮씪誘명꽣濡� �낅젰�� 肄쒕갚 �⑥닔瑜� �ъ슜�섏뿬 �깅뒫�� 痢≪젙�쒕떎.

	@method $$.debug
	@static
	@param {Function} fCallback �좏깮�� �ㅽ뻾�� �뚯슂�� 鍮꾩슜怨� �쒓컙�� �먭��섎뒗 �⑥닔. �� �뚮씪誘명꽣�� �⑥닔 ���� false瑜� �낅젰�섎㈃ �깅뒫 痢≪젙 紐⑤뱶(debug)瑜� �ъ슜�섏� �딅뒗��.
	@param {Numeric} [nRepeat] �섎굹�� �좏깮�먮� 諛섎났 �섑뻾�� �잛닔. �몄쐞�곸쑝濡� �ㅽ뻾 �띾룄瑜� ��텛湲� �꾪빐 �ъ슜�� �� �덈떎.
	@filter desktop
	@remark 肄쒕갚 �⑥닔 fCallback�� �뚮씪誘명꽣濡� query, cost, executeTime�� 媛뽯뒗��.<br>
		<ul class="disc">
			<li>query�� �ㅽ뻾�� �ъ슜�� �좏깮�먯씠��.</li>
			<li>index�� �먯깋�� �ъ슜�� 鍮꾩슜�대떎(猷⑦봽 �잛닔).</li>
			<li>executeTime �먯깋�� �뚯슂�� �쒓컙�대떎.</li>
		</ul>
	@example
		cssquery.debug(function(sQuery, nCost, nExecuteTime) {
			if (nCost > 5000)
				console.warn('5000�� �섎뒗 鍮꾩슜��? �뺤씤 -> ' + sQuery + '/' + nCost);
			else if (nExecuteTime > 200)
				console.warn('0.2珥덇� �섍쾶 �ㅽ뻾��? �뺤씤 -> ' + sQuery + '/' + nExecuteTime);
		}, 20);

		....

		cssquery.debug(false);
     */
    cssquery.debug = function(fpCallback, nRepeat) {

        var oArgs = g_checkVarType(arguments, {
            '4fun'   : [ 'fpCallback:Function+'],
            '4fun2'  : [ 'fpCallback:Function+', 'nRepeat:Numeric' ]
        },"<static> cssquery#debug");

        debugOption.callback = oArgs.fpCallback;
        debugOption.repeat = oArgs.nRepeat || 1;

    };

    /**
     	safeHTML() 硫붿꽌�쒕뒗 �명꽣�� �듭뒪�뚮줈�ъ뿉�� innerHTML �띿꽦�� �ъ슜�� �� _cssquery_UID 媛믪씠 �섏삤吏� �딄쾶 �섎뒗 �⑥닔�대떎. true濡� �ㅼ젙�섎㈃ �먯깋�섎뒗 �몃뱶�� innerHTML �띿꽦�� _cssquery_UID媛� �섏삤吏� �딄쾶 �� �� �덉�留� �먯깋 �띾룄�� �먮젮吏� �� �덈떎.

	@method $$.safeHTML
	@static
	@param {Boolean} bFlag _cssquery_UID�� �쒖떆 �щ�瑜� 吏��뺥븳��. true濡� �ㅼ젙�섎㈃ _cssquery_UID媛� �섏삤吏� �딅뒗��.
	@return {Boolean} _cssquery_UID �쒖떆 �щ� �곹깭瑜� 諛섑솚�쒕떎. _cssquery_UID瑜� �쒖떆�섎뒗 �곹깭�대㈃ true瑜� 諛섑솚�섍퀬 洹몃젃吏� �딆쑝硫� false瑜� 諛섑솚�쒕떎.
	@filter desktop
     */
    cssquery.safeHTML = function(bFlag) {

        if (arguments.length > 0)
            safeHTML = bFlag && nv._p_._JINDO_IS_IE;

        return safeHTML || !nv._p_._JINDO_IS_IE;

    };

    /**
     	version �띿꽦�� cssquery�� 踰꾩쟾 �뺣낫瑜� �닿퀬 �덈뒗 臾몄옄�댁씠��.

	@property $$.version
	@type String
	@field
	@static
	@filter desktop
     */
    cssquery.version = sVersion;

    /**
     	IE�먯꽌 validUID,cache瑜� �ъ슜�덉쓣�� 硫붾え由� �됱씠 諛쒖깮�섏뿬 ��젣�섎뒗 紐⑤뱢 異붽�.x
     */
    cssquery.release = function() {
        if(nv._p_._JINDO_IS_IE) {
            delete validUID;
            validUID = {};

            if(bUseResultCache){
                cssquery.clearCache();
            }
        }
    };
    /**
     	cache媛� ��젣媛� �섎뒗吏� �뺤씤�섍린 �꾪빐 �꾩슂�� �⑥닔

	@method $$._getCacheInfo
	@filter desktop
	@ignore
     */
    cssquery._getCacheInfo = function(){
        return {
            uidCache : validUID,
            eleCache : oResultCache
        };
    };
    /**
     	�뚯뒪�몃� �꾪빐 �꾩슂�� �⑥닔

	@method $$._resetUID
	@filter desktop
	@ignore
     */
    cssquery._resetUID = function(){
        UID = 0;
    };
    /**
     	querySelector媛� �덈뒗 釉뚮씪�곗졇�먯꽌 extreme�� �ㅽ뻾�쒗궎硫� querySelector�� �ъ슜�좎닔 �덈뒗 而ㅻ쾭由ъ�媛� �믪븘�� �꾩껜�곸쑝濡� �띾룄媛� 鍮⑤━吏꾨떎.
	�섏�留� ID媛� �녿뒗 �섎━癒쇳듃瑜� 湲곗� �섎━癒쇳듃濡� �ｌ뿀�� �� 湲곗� �섎━癒쇳듃�� �꾩쓽�� �꾩씠�붽� �ㅼ뼱媛꾨떎.

	@method $$.extreme
	@static
	@ignore
	@param {Boolean} bExtreme true
     */
    cssquery.extreme = function(bExtreme){
        if(arguments.length == 0){
            bExtreme = true;
        }
        bExtremeMode = bExtreme;
    };

    return cssquery;

})();
//-!nv.cssquery end!-//
//-!nv.$$.hidden start(nv.cssquery)!-//
//-!nv.$$.hidden end!-//

/**
 *
	@fileOverview nv.$Agent() 媛앹껜�� �앹꽦�� 諛� 硫붿꽌�쒕� �뺤쓽�� �뚯씪
	@name core.js
	@author NAVER Ajax Platform
 */

//-!nv.$Agent start!-//
/**
	nv.$Agent() 媛앹껜�� �댁쁺泥댁젣, 釉뚮씪�곗�瑜� 鍮꾨’�� �ъ슜�� �쒖뒪�� �뺣낫瑜� �쒓났�쒕떎.

	@class nv.$Agent
	@keyword agent, �먯씠�꾪듃
 */
/**
	nv.$Agent() 媛앹껜瑜� �앹꽦�쒕떎. nv.$Agent() 媛앹껜�� �ъ슜�� �쒖뒪�쒖쓽 �댁쁺 泥댁젣 �뺣낫�� 釉뚮씪�곗� �뺣낫瑜� �쒓났�쒕떎.

	@constructor
 */
nv.$Agent = function() {
	//-@@$Agent-@@//
	var cl = arguments.callee;
	var cc = cl._cached;

	if (cc) return cc;
	if (!(this instanceof cl)) return new cl;
	if (!cc) cl._cached = this;

	this._navigator = navigator;
	this._dm = document.documentMode;
};
//-!nv.$Agent end!-//

//-!nv.$Agent.prototype.navigator start!-//
/**
	navigator() 硫붿꽌�쒕뒗 �ъ슜�� 釉뚮씪�곗� �뺣낫瑜� �닿퀬 �덈뒗 媛앹껜瑜� 諛섑솚�쒕떎.

	@method navigator
	@return {Object} 釉뚮씪�곗� �뺣낫瑜� ���ν븯�� 媛앹껜.
	@remark
		<ul class="disc">
			<li>1.4.3 踰꾩쟾遺��� mobile,msafari,mopera,mie �ъ슜 媛���.</li>
			<li>1.4.5 踰꾩쟾遺��� ipad�먯꽌 mobile�� false瑜� 諛섑솚�쒕떎.</li>
		</ul><br>
		釉뚮씪�곗� �뺣낫瑜� ���ν븯�� 媛앹껜�� 釉뚮씪�곗� �대쫫怨� 踰꾩쟾�� �띿꽦�쇰줈 媛�吏꾨떎. 釉뚮씪�곗� �대쫫�� �곸뼱 �뚮Ц�먮줈 �쒖떆�섎ŉ, �ъ슜�먯쓽 釉뚮씪�곗��� �쇱튂�섎뒗 釉뚮씪�곗� �띿꽦�� true 媛믪쓣 媛�吏꾨떎.
		�먰븳, �ъ슜�먯쓽 釉뚮씪�곗� �대쫫�� �뺤씤�� �� �덈룄濡� 硫붿꽌�쒕� �쒓났�쒕떎. �ㅼ쓬�� �ъ슜�� 釉뚮씪�곗� �뺣낫瑜� �닿퀬 �덈뒗 媛앹껜�� �띿꽦怨� 硫붿꽌�쒕� �ㅻ챸�� �쒖씠��.<br>
		<h5>釉뚮씪�곗� �뺣낫 媛앹껜 �띿꽦</h5>
		<table class="tbl_board">
			<caption class="hide">釉뚮씪�곗� �뺣낫 媛앹껜 �띿꽦</caption>
			<thead>
				<tr>
					<th scope="col" style="width:15%">�대쫫</th>
					<th scope="col" style="width:15%">����</th>
					<th scope="col">�ㅻ챸</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="txt bold">camino</td>
					<td>Boolean</td>
					<td class="txt">移대���(Camino) 釉뚮씪�곗� �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
				</tr>
				<tr>
					<td class="txt bold">chrome</td>
					<td>Boolean</td>
					<td class="txt">援ш� �щ＼(Chrome) 釉뚮씪�곗� �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
				</tr>
				<tr>
					<td class="txt bold">firefox</td>
					<td>Boolean</td>
					<td class="txt">�뚯씠�댄룺��(Firefox) 釉뚮씪�곗� �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��. </td>
				</tr>
				<tr>
					<td class="txt bold">icab</td>
					<td>Boolean</td>
					<td class="txt">iCab 釉뚮씪�곗� �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
				</tr>
				<tr>
					<td class="txt bold">ie</td>
					<td>Boolean</td>
					<td class="txt">�명꽣�� �듭뒪�뚮줈��(Internet Explorer) �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
				</tr>
				<tr>
					<td class="txt bold">konqueror</td>
					<td>Boolean</td>
					<td class="txt">Konqueror 釉뚮씪�곗� �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
				</tr>
				<tr>
					<td class="txt bold">mie</td>
					<td>Boolean</td>
					<td class="txt">�명꽣�� �듭뒪�뚮줈�� 紐⑤컮��(Internet Explorer Mobile) 釉뚮씪�곗� �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
				</tr>
				<tr>
					<td class="txt bold">mobile</td>
					<td>Boolean</td>
					<td class="txt">紐⑤컮�� 釉뚮씪�곗� �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
				</tr>
				<tr>
					<td class="txt bold">mozilla</td>
					<td>Boolean</td>
					<td class="txt">紐⑥쭏��(Mozilla) 怨꾩뿴�� 釉뚮씪�곗� �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
				</tr>
				<tr>
					<td class="txt bold">msafari</td>
					<td>Boolean</td>
					<td class="txt">Mobile 踰꾩쟾 Safari �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
				</tr>
				<tr>
					<td class="txt bold">nativeVersion</td>
					<td>Number</td>
					<td class="txt">�명꽣�� �듭뒪�뚮줈�� �명솚 紐⑤뱶�� 釉뚮씪�곗�瑜� �ъ슜�� 寃쎌슦 �ㅼ젣 釉뚮씪�곗�瑜� ���ν븳��.</td>
				</tr>
				<tr>
					<td class="txt bold">netscape</td>
					<td>Boolean</td>
					<td class="txt">�룹뒪耳��댄봽(Netscape) 釉뚮씪�곗� �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
				</tr>
				<tr>
					<td class="txt bold">omniweb</td>
					<td>Boolean</td>
					<td class="txt">OmniWeb 釉뚮씪�곗� �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
				</tr>
				<tr>
					<td class="txt bold">opera</td>
					<td>Boolean</td>
					<td class="txt">�ㅽ럹��(Opera) 釉뚮씪�곗� �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
				</tr>
				<tr>
					<td class="txt bold">safari</td>
					<td>Boolean</td>
					<td class="txt">Safari 釉뚮씪�곗� �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
				</tr>
				<tr>
					<td class="txt bold">webkit</td>
					<td>Number</td>
					<td class="txt">WebKit 怨꾩뿴 遺��쇱슦�� �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��. </td>
				</tr>
				<tr>
					<td class="txt bold">version</td>
					<td>Number</td>
					<td class="txt">�ъ슜�먭� �ъ슜�섍퀬 �덈뒗 釉뚮씪�곗��� 踰꾩쟾 �뺣낫瑜� ���ν븳��. �ㅼ닔(Float) �뺥깭濡� 踰꾩쟾 �뺣낫瑜� ���ν븯硫� 踰꾩쟾 �뺣낫媛� �놁쑝硫� -1 媛믪쓣 媛�吏꾨떎.</td>
				</tr>
			</tbody>
		</table>
		<h5>釉뚮씪�곗� �뺣낫 媛앹껜 硫붿꽌��</h5>
		<table class="tbl_board">
			<caption class="hide">釉뚮씪�곗� �뺣낫 媛앹껜 硫붿꽌��</caption>
			<thead>
				<tr>
					<th scope="col" style="width:15%">�대쫫</th>
					<th scope="col" style="width:15%">諛섑솚 ����</th>
					<th scope="col">�ㅻ챸</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="txt bold">getName()</td>
					<td>String</td>
					<td class="txt">�ъ슜�먭� �ъ슜�섍퀬 �덈뒗 釉뚮씪�곗��� �대쫫�� 諛섑솚�쒕떎. 諛섑솚�섎뒗 釉뚮씪�곗��� �대쫫�� �띿꽦 �대쫫怨� �숈씪�섎떎.</td>
				</tr>
			</tbody>
		</table>
	@example
		oAgent = $Agent().navigator(); // �ъ슜�먭� �뚯씠�댄룺�� 3瑜� �ъ슜�쒕떎怨� 媛��뺥븳��.

		oAgent.camino  // false
		oAgent.firefox  // true
		oAgent.konqueror // false
		oAgent.mozilla  //true
		oAgent.netscape  // false
		oAgent.omniweb  //false
		oAgent.opera  //false
		oAgent.webkit  /false
		oAgent.safari  //false
		oAgent.ie  //false
		oAgent.chrome  //false
		oAgent.icab  //false
		oAgent.version  //3
		oAgent.nativeVersion // -1 (1.4.2遺��� �ъ슜 媛���, IE8�먯꽌 �명솚 紐⑤뱶 �ъ슜�� nativeVersion�� 8濡� �섏샂.)

		oAgent.getName() // firefox
 */
nv.$Agent.prototype.navigator = function() {
	//-@@$Agent.navigator-@@//
	var info = {},
		ver = -1,
		nativeVersion = -1,
		u = this._navigator.userAgent,
		v = this._navigator.vendor || "",
		dm = this._dm;

	function f(s,h){
		return ((h || "").indexOf(s) > -1);
	}

	info.getName = function(){
		var name = "";
		for(var x in info){
			if(x !=="mobile" && typeof info[x] == "boolean" && info[x] && info.hasOwnProperty(x))
				name = x;
		}
		return name;
	};

	info.webkit = f("WebKit", u);
	info.opera = (window.opera !== undefined) || f("Opera", u) || f("OPR", u);
	info.ie = !info.opera && (f("MSIE", u)||f("Trident", u));
	info.chrome = info.webkit && !info.opera && f("Chrome", u) || f("CriOS", u);
	info.safari = info.webkit && !info.chrome && !info.opera && f("Apple", v);
	info.firefox = f("Firefox", u);
	info.mozilla = f("Gecko", u) && !info.safari && !info.chrome && !info.firefox && !info.ie;
	info.camino = f("Camino", v);
	info.netscape = f("Netscape", u);
	info.omniweb = f("OmniWeb", u);
	info.icab = f("iCab", v);
	info.konqueror = f("KDE", v);
	info.mobile = (f("Mobile", u) || f("Android", u) || f("Nokia", u) || f("webOS", u) || f("Opera Mini", u) || f("Opera Mobile", u) || f("BlackBerry", u) || (f("Windows", u) && f("PPC", u)) || f("Smartphone", u) || f("IEMobile", u)) && !(f("iPad", u) || f("Tablet", u));
	info.msafari = ((!f("IEMobile", u) && f("Mobile", u)) || (f("iPad", u) && f("Safari", u))) && !info.chrome && !info.opera && !info.firefox;
	info.mopera = f("Opera Mini", u);
	info.mie = f("PPC", u) || f("Smartphone", u) || f("IEMobile", u);

	try{
		if(info.ie){
			if(dm > 0){
				ver = dm;
				if(u.match(/(?:Trident)\/([\d.]+)/)){
					var nTridentNum = parseFloat(RegExp.$1, 10);

					if(nTridentNum > 3){
						nativeVersion = nTridentNum + 4;
					}
				}else{
					nativeVersion = ver;
				}
			}else{
				nativeVersion = ver = u.match(/(?:MSIE) ([\d.]+)/)[1];
			}
		}else if(info.safari || info.msafari){
			ver = parseFloat(u.match(/Safari\/([\d.]+)/)[1]);

			if(ver == 100){
				ver = 1.1;
			}else{
				if(u.match(/Version\/([\d.]+)/)){
					ver = RegExp.$1;
				}else{
					ver = [1.0, 1.2, -1, 1.3, 2.0, 3.0][Math.floor(ver / 100)];
				}
			}
        } else if(info.mopera) {
            ver = u.match(/(?:Opera\sMini)\/([\d.]+)/)[1];
        } else if(info.opera) {
            ver = u.match(/(?:Version|OPR|Opera)[\/\s]?([\d.]+)(?!.*Version)/)[1];
		}else if(info.firefox||info.omniweb){
			ver = u.match(/(?:Firefox|OmniWeb)\/([\d.]+)/)[1];
		}else if(info.mozilla){
			ver = u.match(/rv:([\d.]+)/)[1];
		}else if(info.icab){
			ver = u.match(/iCab[ \/]([\d.]+)/)[1];
		}else if(info.chrome){
			ver = u.match(/(?:Chrome|CriOS)[ \/]([\d.]+)/)[1];
		}

		info.version = parseFloat(ver);
		info.nativeVersion = parseFloat(nativeVersion);

		if(isNaN(info.version)){
			info.version = -1;
		}
	}catch(e){
		info.version = -1;
	}

	this.navigator = function(){
		return info;
	};

	return info;
};
//-!nv.$Agent.prototype.navigator end!-//

//-!nv.$Agent.prototype.os start!-//
/**
	os() 硫붿꽌�쒕뒗 �ъ슜�� �댁쁺泥댁젣 �뺣낫瑜� �닿퀬 �덈뒗 媛앹껜瑜� 諛섑솚�쒕떎.

	@method os
	@return {Object} �댁쁺泥댁젣 �뺣낫瑜� ���ν븯�� 媛앹껜.
	@remark
		<ul class="disc">
			<li>1.4.3 踰꾩쟾遺��� iphone, android, nokia, webos, blackberry, mwin �ъ슜 媛���.</li>
			<li>1.4.5 踰꾩쟾遺��� ipad �ъ슜 媛���.</li>
			<li>2.3.0 踰꾩쟾遺��� ios, symbianos, version, win8 �ъ슜 媛���</li>
		</ul><br>
		�댁쁺泥댁젣 �뺣낫瑜� ���ν븯�� 媛앹껜�� �댁쁺泥댁젣 �대쫫�� �띿꽦�쇰줈 媛�吏꾨떎. �댁쁺 泥댁젣 �띿꽦�� �곸뼱 �뚮Ц�먮줈 �쒖떆�섎ŉ, �ъ슜�먯쓽 �댁쁺泥댁젣�� �쇱튂�섎뒗 �댁쁺泥댁젣�� �띿꽦�� true 媛믪쓣 媛�吏꾨떎.<br>
		�먰븳 �ъ슜�먯쓽 �댁쁺泥댁젣 �대쫫�� �뺤씤�� �� �덈룄濡� 硫붿꽌�쒕� �쒓났�쒕떎. �ㅼ쓬�� �ъ슜�� �댁쁺泥댁젣 �뺣낫瑜� �닿퀬 �덈뒗 媛앹껜�� �띿꽦怨� 硫붿꽌�쒕� �ㅻ챸�� �쒖씠��.<br>
		<h5>�댁쁺泥댁젣 �뺣낫 媛앹껜 �띿꽦</h5>
		<table class="tbl_board">
			<caption class="hide">�댁쁺泥댁젣 �뺣낫 媛앹껜 �띿꽦</caption>
			<thead>
				<tr>
					<th scope="col" style="width:15%">�대쫫</th>
					<th scope="col" style="width:15%">����</th>
					<th scope="col">�ㅻ챸</th>
					<th scope="col" style="width:25%">湲고�</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="txt bold">android</td>
					<td>Boolean</td>
					<td class="txt">Android �댁쁺泥댁젣 �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
					<td class="txt">1.4.3 踰꾩쟾遺��� �ъ슜 媛���</td>
				</tr>
				<tr>
					<td class="txt bold">blackberry</td>
					<td>Boolean</td>
					<td class="txt">Blackberry �댁쁺泥댁젣 �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��. </td>
					<td class="txt">1.4.3 踰꾩쟾遺��� �ъ슜 媛���</td>
				</tr>
				<tr>
					<td class="txt bold">ios</td>
					<td>Boolean</td>
					<td class="txt">iOS �댁쁺泥댁젣 �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
					<td class="txt">2.3.0 踰꾩쟾遺��� �ъ슜 媛���</td>
				</tr>
				<tr>
					<td class="txt bold">ipad</td>
					<td>Boolean</td>
					<td class="txt">iPad �μ튂 �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
					<td class="txt">1.4.5 踰꾩쟾遺��� �ъ슜媛���/�먯� �덉젙</td>
				</tr>
				<tr>
					<td class="txt bold">iphone</td>
					<td>Boolean</td>
					<td class="txt">iPhone �μ튂�몄� �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
					<td class="txt">1.4.3 踰꾩쟾遺��� �ъ슜媛���/�먯� �덉젙</td>
				</tr>
				<tr>
					<td class="txt bold">linux</td>
					<td>Boolean</td>
					<td class="txt">Linux�댁쁺泥댁젣 �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
					<td class="txt"></td>
				</tr>
				<tr>
					<td class="txt bold">mac</td>
					<td>Boolean</td>
					<td class="txt">Mac�댁쁺泥댁젣 �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
					<td class="txt"></td>
				</tr>
				<tr>
					<td class="txt bold">mwin</td>
					<td>Boolean</td>
					<td class="txt">Window Mobile �댁쁺泥댁젣 �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
					<td class="txt">1.4.3 踰꾩쟾遺��� �ъ슜 媛���</td>
				</tr>
				<tr>
					<td class="txt bold">nokia</td>
					<td>Boolean</td>
					<td class="txt">Nokia �댁쁺泥댁젣 �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
					<td class="txt">1.4.3 踰꾩쟾遺��� �ъ슜 媛��� / �먯� �덉젙</td>
				</tr>
				<tr>
					<td class="txt bold">symbianos</td>
					<td>Boolean</td>
					<td class="txt">SymbianOS �댁쁺泥댁젣 �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
					<td class="txt">2.3.0 踰꾩쟾遺��� �ъ슜 媛���</td>
				</tr>
				<tr>
					<td class="txt bold">vista</td>
					<td>Boolean</td>
					<td class="txt">Windows Vista �댁쁺泥댁젣 �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
					<td class="txt">�먯� �덉젙</td>
				</tr>
				<tr>
					<td class="txt bold">webos</td>
					<td>Boolean</td>
					<td>webOS �댁쁺泥댁젣 �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
					<td>1.4.3 踰꾩쟾遺��� �ъ슜 媛���</td>
				</tr>
				<tr>
					<td class="txt bold">win</td>
					<td>Boolean</td>
					<td class="txt">Windows怨꾩뿴 �댁쁺泥댁젣 �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
					<td class="txt"></td>
				</tr>
				<tr>
					<td class="txt bold">win2000</td>
					<td>Boolean</td>
					<td class="txt">Windows 2000�댁쁺泥댁젣 �ъ슜 �щ� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
					<td class="txt">�먯� �덉젙</td>
				</tr>
				<tr>
					<td class="txt bold">win7</td>
					<td>Boolean</td>
					<td class="txt">Windows 7 �댁쁺泥댁젣 �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
					<td class="txt">�먯� �덉젙</td>
				</tr>
				<tr>
					<td class="txt bold">win8</td>
					<td>Boolean</td>
					<td class="txt">Windows 8 �댁쁺泥댁젣 �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
					<td class="txt">2.3.0 遺��� �ъ슜 媛���/�먯� �덉젙</td>
				</tr>
				<tr>
					<td class="txt bold">winxp</td>
					<td>Boolean</td>
					<td class="txt">Windows XP �댁쁺泥댁젣 �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
					<td class="txt">�먯� �덉젙</td>
				</tr>
				<tr>
					<td class="txt bold">xpsp2</td>
					<td>Boolean</td>
					<td class="txt">Windows XP SP 2 �댁쁺泥댁젣 �ъ슜 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
					<td class="txt">�먯� �덉젙</td>
				</tr>
				<tr>
					<td class="txt bold">version</td>
					<td>String</td>
					<td class="txt">�댁쁺泥댁젣�� 踰꾩쟾 臾몄옄��. 踰꾩쟾�� 李얠� 紐삵븳 寃쎌슦 null�� 吏��뺣맂��.</td>
					<td class="txt">2.3.0 踰꾩쟾遺��� �ъ슜 媛���</td>
				</tr>
			</tbody>
		</table>
		<h5>�댁쁺泥댁젣 �뺣낫 媛앹껜 硫붿꽌��</h5>
		<table class="tbl_board">
			<caption class="hide">�댁쁺泥댁젣 �뺣낫 媛앹껜 硫붿꽌��</caption>
			<thead>
				<tr>
					<th scope="col" style="width:15%">�대쫫</th>
					<th scope="col" style="width:15%">諛섑솚 ����</th>
					<th scope="col">�ㅻ챸</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="txt bold">getName()</td>
					<td>String</td>
					<td class="txt">�ъ슜�먭� �ъ슜�섍퀬 �덈뒗 �댁쁺泥댁젣�� �대쫫�� 諛섑솚�쒕떎. 諛섑솚�섎뒗 �댁쁺泥댁젣�� �대쫫�� �띿꽦 �대쫫怨� �숈씪�섎떎.</td>
				</tr>
			</tbody>
		</table>
		<h5>�댁쁺泥댁젣蹂� 踰꾩쟾 �뺣낫</h5>
		<table class="tbl_board">
			<caption class="hide">�댁쁺泥댁젣蹂� 踰꾩쟾 �뺣낫</caption>
			<thead>
				<tr>
					<th scope="col" style="width:60%">�댁쁺泥댁젣 �대쫫</th>
					<th scope="col">踰꾩쟾 媛�</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="txt bold">Windows 2000</td>
					<td>5.0</td>
				</tr>
				<tr>
					<td class="txt bold">Windows XP</td>
					<td>5.1</td>
				</tr>
				<tr>
					<td class="txt bold">Windows VISTA</td>
					<td>6.0</td>
				</tr>
				<tr>
					<td class="txt bold">Windows 7</td>
					<td>6.1</td>
				</tr>
				<tr>
					<td class="txt bold">Windows 8</td>
					<td>6.2</td>
				</tr>
				<tr>
					<td class="txt bold">Windows 8.1</td>
					<td>6.3</td>
				</tr>
				<tr>
					<td class="txt bold">OS X Tiger</td>
					<td>10.4</td>
				</tr>
				<tr>
					<td class="txt bold">OS X Leopard</td>
					<td>10.5</td>
				</tr>
				<tr>
					<td class="txt bold">OS X Snow Leopard</td>
					<td>10.6</td>
				</tr>
				<tr>
					<td class="txt bold">OS X Lion</td>
					<td>10.7</td>
				</tr>
				<tr>
					<td class="txt bold">OS X Mountain Lion</td>
					<td>10.8</td>
				</tr>
			</tbody>
		</table>
	@example
		var oOS = $Agent().os();  // �ъ슜�먯쓽 �댁쁺泥댁젣媛� Windows XP�쇨퀬 媛��뺥븳��.
		oOS.linux  // false
		oOS.mac  // false
		oOS.vista  // false
		oOS.win  // true
		oOS.win2000  // false
		oOS.winxp  // true
		oOS.xpsp2  // false
		oOS.win7  // false
		oOS.getName() // winxp
	@example
		var oOS = $Agent().os();  // �⑤쭚湲곌� iPad�닿퀬 踰꾩쟾�� 5.0 �대씪怨� 媛��뺥븳��.
		info.ipad; // true
		info.ios; // true
		info.version; // "5.0"

		info.win; // false
		info.mac; // false
		info.linux; // false
		info.win2000; // false
		info.winxp; // false
		info.xpsp2; // false
		info.vista; // false
		info.win7; // false
		info.win8; // false
		info.iphone; // false
		info.android; // false
		info.nokia; // false
		info.webos; // false
		info.blackberry; // false
		info.mwin; // false
		info.symbianos; // false
 */
nv.$Agent.prototype.os = function() {
	//-@@$Agent.os-@@//
	var info = {},
		u = this._navigator.userAgent,
		p = this._navigator.platform,
		f = function(s, h) {
			return (h.indexOf(s) > -1);
		},
		aMatchResult = null;

	info.getName = function(){
		var name = "";

		for(var x in info){
			if(info[x] === true && info.hasOwnProperty(x)){
				name = x;
			}
		}

		return name;
	};

	info.win = f("Win", p);
	info.mac = f("Mac", p);
	info.linux = f("Linux", p);
	info.win2000 = info.win && (f("NT 5.0", u) || f("Windows 2000", u));
	info.winxp = info.win && f("NT 5.1", u);
	info.xpsp2 = info.winxp && f("SV1", u);
	info.vista = info.win && f("NT 6.0", u);
	info.win7 = info.win && f("NT 6.1", u);
	info.win8 = info.win && f("NT 6.2", u);
	info.ipad = f("iPad", u);
	info.iphone = f("iPhone", u) && !info.ipad;
	info.android = f("Android", u);
	info.nokia =  f("Nokia", u);
	info.webos = f("webOS", u);
	info.blackberry = f("BlackBerry", u);
	info.mwin = f("PPC", u) || f("Smartphone", u) || f("IEMobile", u) || f("Windows Phone", u);
	info.ios = info.ipad || info.iphone;
	info.symbianos = f("SymbianOS", u);
	info.version = null;

	if(info.win){
		aMatchResult = u.match(/Windows NT ([\d|\.]+)/);
		if(aMatchResult != null && aMatchResult[1] != undefined){
			info.version = aMatchResult[1];
		}
	}else if(info.mac){
		aMatchResult = u.match(/Mac OS X ([\d|_]+)/);
		if(aMatchResult != null && aMatchResult[1] != undefined){
			info.version = String(aMatchResult[1]).split("_").join(".");
		}

	}else if(info.android){
		aMatchResult = u.match(/Android ([\d|\.]+)/);
		if(aMatchResult != null && aMatchResult[1] != undefined){
			info.version = aMatchResult[1];
		}
	}else if(info.ios){
		aMatchResult = u.match(/(iPhone )?OS ([\d|_]+)/);
		if(aMatchResult != null && aMatchResult[2] != undefined){
			info.version = String(aMatchResult[2]).split("_").join(".");
		}
	}else if(info.blackberry){
		aMatchResult = u.match(/Version\/([\d|\.]+)/); // 6 or 7
		if(aMatchResult == null){
			aMatchResult = u.match(/BlackBerry\s?\d{4}\/([\d|\.]+)/); // 4.2 to 5.0
		}
		if(aMatchResult != null && aMatchResult[1] != undefined){
			info.version = aMatchResult[1];
		}
	}else if(info.symbianos){
		aMatchResult = u.match(/SymbianOS\/(\d+.\w+)/); // exist 7.0s
		if(aMatchResult != null && aMatchResult[1] != undefined){
			info.version = aMatchResult[1];
		}
	}else if(info.webos){
		aMatchResult = u.match(/webOS\/([\d|\.]+)/);
		if(aMatchResult != null && aMatchResult[1] != undefined){
			info.version = aMatchResult[1];
		}
	}else if(info.mwin){
		aMatchResult = u.match(/Windows CE ([\d|\.]+)/);
		if(aMatchResult != null && aMatchResult[1] != undefined){
			info.version = aMatchResult[1];
		}
		if(!info.version && (aMatchResult = u.match(/Windows Phone (OS )?([\d|\.]+)/))){
			info.version = aMatchResult[2];
		}
	}

	this.os = function() {
		return info;
	};

	return info;
};
//-!nv.$Agent.prototype.os end!-//

//-!nv.$Agent.prototype.flash start!-//
/**
	flash() 硫붿꽌�쒕뒗 �ъ슜�먯쓽 Flash Player �뺣낫瑜� �닿퀬 �덈뒗 媛앹껜瑜� 諛섑솚�쒕떎.

	@method flash
	@return {Object} Flash Player �뺣낫瑜� ���ν븯�� 媛앹껜.
	@filter desktop
	@remark Flash Player �뺣낫瑜� ���ν븯�� 媛앹껜�� Flash Player �ㅼ튂 �щ��� �ㅼ튂�� Flash Player�� 踰꾩쟾 �뺣낫瑜� �쒓났�쒕떎. 	�ㅼ쓬�� Flash Player�� �뺣낫瑜� �닿퀬 �덈뒗 媛앹껜�� �띿꽦�� �ㅻ챸�� �쒖씠��.<br>
		<h5>Flash Player �뺣낫 媛앹껜 �띿꽦</h5>
		<table class="tbl_board">
			<caption class="hide">Flash Player �뺣낫 媛앹껜 �띿꽦</caption>
			<thead>
				<tr>
					<th scope="col" style="width:15%">�대쫫</th>
					<th scope="col" style="width:15%">����</th>
					<th scope="col">�ㅻ챸</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="txt bold">installed</td>
					<td>Boolean</td>
					<td class="txt">Flash Player �ㅼ튂 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
				</tr>
				<tr>
					<td class="txt bold">version</td>
					<td>Number</td>
					<td class="txt">�ъ슜�먭� �ъ슜�섍퀬 �덈뒗 Flash Player�� 踰꾩쟾 �뺣낫瑜� ���ν븳��. �ㅼ닔(Float) �뺥깭濡� 踰꾩쟾 �뺣낫瑜� ���ν븯硫�, Flash Player媛� �ㅼ튂�섏� �딆� 寃쎌슦 -1�� ���ν븳��. </td>
				</tr>
			</tbody>
		</table>
	@see http://www.adobe.com/products/flashplayer/ Flash Player 怨듭떇 �섏씠吏�
	@example
		var oFlash = $Agent().flash();
		oFlash.installed  // �뚮옒�� �뚮젅�댁뼱瑜� �ㅼ튂�덈떎硫� true
		oFlash.version  // �뚮옒�� �뚮젅�댁뼱�� 踰꾩쟾.
 */
nv.$Agent.prototype.flash = function() {
	//-@@$Agent.flash-@@//
	var info = {};
	var p    = this._navigator.plugins;
	var m    = this._navigator.mimeTypes;
	var f    = null;

	info.installed = false;
	info.version   = -1;

	if (!nv.$Jindo.isUndefined(p)&& p.length) {
		f = p["Shockwave Flash"];
		if (f) {
			info.installed = true;
			if (f.description) {
				info.version = parseFloat(f.description.match(/[0-9.]+/)[0]);
			}
		}

		if (p["Shockwave Flash 2.0"]) {
			info.installed = true;
			info.version   = 2;
		}
	} else if (!nv.$Jindo.isUndefined(m) && m.length) {
		f = m["application/x-shockwave-flash"];
		info.installed = (f && f.enabledPlugin);
	} else {
		try {
			info.version   = parseFloat(new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').match(/(.\d?),/)[1]);
			info.installed = true;
		} catch(e) {}
	}

	this.flash = function() {
		return info;
	};
    /*
    �섏쐞�명솚�� �꾪빐 �쇰떒 �④꺼�붾떎.
     */
	this.info = this.flash;

	return info;
};
//-!nv.$Agent.prototype.flash end!-//

//-!nv.$Agent.prototype.silverlight start!-//
/**
	silverlight() 硫붿꽌�쒕뒗 �ъ슜�먯쓽 �ㅻ쾭�쇱씠��(Silverlight) �뺣낫瑜� �닿퀬 �덈뒗 媛앹껜瑜� 諛섑솚�쒕떎.

	@method silverlight
	@return {Object} �ㅻ쾭�쇱씠�� �뺣낫瑜� ���ν븯�� 媛앹껜.
	@filter desktop
	@remark �ㅻ쾭�쇱씠�� �뺣낫瑜� ���ν븯�� 媛앹껜�� �ㅻ쾭�쇱씠�� �ㅼ튂 �щ��� �ㅼ튂�� �ㅻ쾭�쇱씠�몄쓽 踰꾩쟾 �뺣낫瑜� �쒓났�쒕떎. �ㅼ쓬�� �ㅻ쾭�쇱씠�� �뺣낫瑜� �닿퀬 �덈뒗 媛앹껜�� �띿꽦�� �ㅻ챸�� �쒖씠��.<br>
		<h5>�ㅻ쾭�쇱씠�� �뺣낫 媛앹껜 �띿꽦</h5>
		<table class="tbl_board">
			<caption class="hide">�ㅻ쾭�쇱씠�� �뺣낫 媛앹껜 �띿꽦</caption>
			<thead>
				<tr>
					<th scope="col" style="width:15%">�대쫫</th>
					<th scope="col" style="width:15%">����</th>
					<th scope="col">�ㅻ챸</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="txt bold">installed</td>
					<td>Boolean</td>
					<td class="txt">�ㅻ쾭�쇱씠�� �ㅼ튂 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.</td>
				</tr>
				<tr>
					<td class="txt bold">version</td>
					<td>Number</td>
					<td class="txt">�ъ슜�먭� �ъ슜�섍퀬 �덈뒗 �ㅻ쾭�쇱씠�몄쓽 踰꾩쟾 �뺣낫瑜� ���ν븳��. �ㅼ닔(Float) �뺥깭濡� 踰꾩쟾 �뺣낫瑜� ���ν븯硫�, �ㅻ쾭�쇱씠�멸� �ㅼ튂�섏� �딆� 寃쎌슦 -1�� ���ν븳��. </td>
				</tr>
			</tbody>
		</table>
	@see http://www.microsoft.com/silverlight �ㅻ쾭�쇱씠�� 怨듭떇 �섏씠吏�
	@example
		var oSilver = $Agent.silverlight();
		oSilver.installed  // Silverlight �뚮젅�댁뼱瑜� �ㅼ튂�덈떎硫� true
		oSilver.version  // Silverlight �뚮젅�댁뼱�� 踰꾩쟾.
 */
nv.$Agent.prototype.silverlight = function() {
	//-@@$Agent.silverlight-@@//
	var info = new Object;
	var p    = this._navigator.plugins;
	var s    = null;

	info.installed = false;
	info.version   = -1;

	if (!nv.$Jindo.isUndefined(p) && p.length) {
		s = p["Silverlight Plug-In"];
		if (s) {
			info.installed = true;
			info.version = parseInt(s.description.split(".")[0],10);
			if (s.description == "1.0.30226.2") info.version = 2;
		}
	} else {
		try {
			s = new ActiveXObject("AgControl.AgControl");
			info.installed = true;
			if(s.isVersionSupported("3.0")){
				info.version = 3;
			}else if (s.isVersionSupported("2.0")) {
				info.version = 2;
			} else if (s.isVersionSupported("1.0")) {
				info.version = 1;
			}
		} catch(e) {}
	}

	this.silverlight = function() {
		return info;
	};

	return info;
};
//-!nv.$Agent.prototype.silverlight end!-//

/**
 	@fileOverview nv.$H() 媛앹껜�� �앹꽦�� 諛� 硫붿꽌�쒕� �뺤쓽�� �뚯씪
	@name hash.js
	@author NAVER Ajax Platform
 */
//-!nv.$H start!-//
/**
 	nv.$H() 媛앹껜�� ��(key)�� 媛�(value)�� �먯냼濡� 媛�吏��� �닿굅�� 諛곗뿴�� �댁떆(Hash)瑜� 援ы쁽�섍퀬, �댁떆瑜� �ㅻ（湲� �꾪븳 �щ윭 媛�吏� �꾪븳 硫붿꽌�쒕� �쒓났�쒕떎.

	@class nv.$H
	@keyword hash, �댁떆
 */
/**
 	nv.$H() 媛앹껜瑜� �앹꽦�쒕떎.

	@constructor
	@param {Hash+} oHashObject �댁떆濡� 留뚮뱾 媛앹껜.
	@example
		var h = $H({one:"first", two:"second", three:"third"});
 */
nv.$H = function(hashObject) {
	//-@@$H-@@//
	var cl = arguments.callee;
	if (hashObject instanceof cl) return hashObject;

	if (!(this instanceof cl)){
		try {
			nv.$Jindo._maxWarn(arguments.length, 1,"$H");
			return new cl(hashObject||{});
		} catch(e) {
			if (e instanceof TypeError) { return null; }
			throw e;
		}
	}

	var oArgs = g_checkVarType(arguments, {
		'4obj' : ['oObj:Hash+'],
		'4vod' : []
	},"$H");

	this._table = {};
	for(var k in hashObject) {
		if(hashObject.hasOwnProperty(k)){
			this._table[k] = hashObject[k];
		}
	}
};
//-!nv.$H end!-//

//-!nv.$H.prototype.$value start!-//
/**
 	$value() 硫붿꽌�쒕뒗 �댁떆(Hash)瑜� 媛앹껜濡� 諛섑솚�쒕떎.

	@method $value
	@return {Object} �댁떆媛� ���λ맂 媛앹껜.
 */
nv.$H.prototype.$value = function() {
	//-@@$H.$value-@@//
	return this._table;
};
//-!nv.$H.prototype.$value end!-//

//-!nv.$H.prototype.$ start!-//
/**
 	$() 硫붿꽌�쒕뒗 ��(key)�� �대떦�섎뒗 媛�(value)�� 諛섑솚�쒕떎.

	@method $
	@param {String+|Numeric} sKey �댁떆�� ��.
	@return {Variant} �ㅼ뿉 �대떦�섎뒗 媛�.
	@example
		var woH = $H({one:"first", two:"second", three:"third"});

		// 媛믪쓣 諛섑솚�� ��
		var three = woH.$("three");
		// 寃곌낵 : three = "third"
 */
/**
 	$() 硫붿꽌�쒕뒗 ��(key)�� 媛�(value)�� 吏��뺥븳 媛믪쑝濡� �ㅼ젙�쒕떎.

	@method $
	@syntax sKey, vValue
	@syntax oKeyAndValue
	@param {String+ | Numeric} sKey �댁떆�� ��.
	@param {Variant} vValue �ㅼ젙�� 媛�.
	@param {Hash+} oKeyAndValue key�� value濡쒕맂 �ㅻ툕�앺듃
	@return {this} �몄뒪�댁뒪 �먯떊
	@example
		var woH = $H({one:"first", two:"second"});

		// 媛믪쓣 �ㅼ젙�� ��
		woH.$("three", "third");
		// 寃곌낵 : woH => {one:"first", two:"second", three:"third"}
 */
nv.$H.prototype.$ = function(key, value) {
	//-@@$H.$-@@//
	var oArgs = g_checkVarType(arguments, {
		's4var' : [ nv.$Jindo._F('key:String+'), 'value:Variant' ],
		's4var2' : [ 'key:Numeric', 'value:Variant' ],
		'g4str' : [ 'key:String+' ],
		's4obj' : [ 'oObj:Hash+'],
		'g4num' : [ 'key:Numeric' ]
	},"$H#$");

	switch(oArgs+""){
		case "s4var":
		case "s4var2":
			this._table[key] = value;
			return this;
		case "s4obj":
			var obj = oArgs.oObj;
			for(var i in obj){
			    if(obj.hasOwnProperty(i)){
    				this._table[i] = obj[i];
			    }
			}
			return this;
		default:
			return this._table[key];
	}

};
//-!nv.$H.prototype.$ end!-//

//-!nv.$H.prototype.length start!-//
/**
 	length() 硫붿꽌�쒕뒗 �댁떆 媛앹껜�� �ш린瑜� 諛섑솚�쒕떎.

	@method length
	@return {Numeric} �댁떆�� �ш린.
	@example
		var woH = $H({one:"first", two:"second"});
		woH.length(); // 寃곌낵 : 2
 */
nv.$H.prototype.length = function() {
	//-@@$H.length-@@//
	var index = 0;
	var sortedIndex = this["__nv_sorted_index"];
	if(sortedIndex){
	    return sortedIndex.length;
	}else{
    	for(var k in this._table) {
    		if(this._table.hasOwnProperty(k)){
    			if (Object.prototype[k] !== undefined && Object.prototype[k] === this._table[k]) continue;
    			index++;
    		}
    	}

	}
	return index;
};
//-!nv.$H.prototype.length end!-//

//-!nv.$H.prototype.forEach start(nv.$H.Break,nv.$H.Continue)!-//
/**
 	forEach() 硫붿꽌�쒕뒗 �댁떆�� 紐⑤뱺 �먯냼瑜� �쒗쉶�섎㈃�� 肄쒕갚 �⑥닔瑜� �ㅽ뻾�쒕떎. �대븣 �댁떆 媛앹껜�� �ㅼ� 媛� 洹몃━怨� �먮낯 �댁떆 媛앹껜媛� 肄쒕갚 �⑥닔�� �뚮씪誘명꽣濡� �낅젰�쒕떎. nv.$A() 媛앹껜�� forEach() 硫붿꽌�쒖� �좎궗�섎떎. $H.Break()�� $H.Continue()�� �ъ슜�� �� �덈떎.

	@method forEach
	@param {Function+} fCallback �댁떆瑜� �쒗쉶�섎㈃�� �ㅽ뻾�� 肄쒕갚 �⑥닔. 肄쒕갚 �⑥닔�� �뚮씪誘명꽣濡� key, value, object瑜� 媛뽯뒗��.<br>
		<ul class="disc">
			<li>value�� �대떦 �먯냼�� 媛믪씠��.</li>
			<li>key�� �대떦 �먯냼�� �ㅼ씠��.</li>
			<li>object�� �댁떆 洹� �먯껜瑜� 媛�由ы궓��.</li>
		</ul>
	@param {Variant} [oThis] 肄쒕갚 �⑥닔媛� 媛앹껜�� 硫붿꽌�쒖씪 �� 肄쒕갚 �⑥닔 �대��먯꽌 this �ㅼ썙�쒖쓽 �ㅽ뻾 臾몃㎘(Execution Context)�쇰줈 �ъ슜�� 媛앹껜.
	@return {this} �몄뒪�댁뒪 �먯떊
	@see nv.$H#map
	@see nv.$H#filter
	@see nv.$A#forEach
	@example
		function printIt(value, key, object) {
		   document.write(key+" => "+value+" <br>");
		}
		$H({one:"first", two:"second", three:"third"}).forEach(printIt);
 */
nv.$H.prototype.forEach = function(callback, scopeObject) {
	//-@@$H.forEach-@@//
	var oArgs = g_checkVarType(arguments, {
		'4fun' : [ 'callback:Function+'],
		'4obj' : [ 'callback:Function+', "thisObject:Variant"]
	},"$H#forEach");
	var t = this._table;
	var h = this.constructor;
	var sortedIndex = this["__nv_sorted_index"];

	if(sortedIndex){
	    for(var i = 0, l = sortedIndex.length; i < l ; i++){

	        try {
	            var k = sortedIndex[i];
                callback.call(scopeObject||this, t[k], k, t);
            } catch(e) {
                if (e instanceof h.Break) break;
                if (e instanceof h.Continue) continue;
                throw e;
            }
	    }
	}else{
    	for(var k in t) {
    		if (t.hasOwnProperty(k)) {
    			if (!t.propertyIsEnumerable(k)){
    			    continue;
    			}
    			try {
                    callback.call(scopeObject||this, t[k], k, t);
                } catch(e) {
                    if (e instanceof h.Break) break;
                    if (e instanceof h.Continue) continue;
                    throw e;
                }
    		}
    	}
	}

	return this;
};
//-!nv.$H.prototype.forEach end!-//

//-!nv.$H.prototype.filter start(nv.$H.prototype.forEach)!-//
/**
 	filter() 硫붿꽌�쒕뒗 �댁떆�� 紐⑤뱺 �먯냼瑜� �쒗쉶�섎㈃�� 肄쒕갚 �⑥닔瑜� �ㅽ뻾�섍퀬 肄쒕갚 �⑥닔媛� true 媛믪쓣 諛섑솚�섎뒗 �먯냼留� 紐⑥븘 �덈줈�� nv.$H() 媛앹껜瑜� 諛섑솚�쒕떎. nv.$A() 媛앹껜�� filter() 硫붿꽌�쒖� �좎궗�섎떎. $H.Break()�� $H.Continue()�� �ъ슜�� �� �덈떎.

	@method filter
	@param {Function+} fCallback �댁떆瑜� �쒗쉶�섎㈃�� �ㅽ뻾�� 肄쒕갚 �⑥닔. 肄쒕갚 �⑥닔�� Boolean �뺥깭濡� 媛믪쓣 諛섑솚�댁빞 �쒕떎. true 媛믪쓣 諛섑솚�섎뒗 �먯냼�� �덈줈�� �댁떆�� �먯냼媛� �쒕떎. 肄쒕갚 �⑥닔�� �뚮씪誘명꽣濡� value, key, object瑜� 媛뽯뒗��.<br>
		<ul class="disc">
			<li>value�� �대떦 �먯냼�� 媛믪씠��.</li>
			<li>key�� �대떦 �먯냼�� �ㅼ씠��.</li>
			<li>object�� �댁떆 洹� �먯껜瑜� 媛�由ы궓��.</li>
		</ul>
	@param {Variant} [oThis] 肄쒕갚 �⑥닔媛� 媛앹껜�� 硫붿꽌�쒖씪 �� 肄쒕갚 �⑥닔 �대��먯꽌 this �ㅼ썙�쒖쓽 �ㅽ뻾 臾몃㎘(Execution Context) �ъ슜�� 媛앹껜.
	@return {nv.$H} 肄쒕갚 �⑥닔�� 諛섑솚 媛믪씠 true�� �먯냼濡� �대（�댁쭊 �덈줈�� nv.$H() 媛앹껜.
	@see nv.$H#forEach
	@see nv.$H#map
	@see nv.$A#filter
	@example
		var ht=$H({one:"first", two:"second", three:"third"})

		ht.filter(function(value, key, object){
			return value.length < 5;
		})

		// 寃곌낵
		// one:"first", three:"third"
 */
nv.$H.prototype.filter = function(callback, thisObject) {
	//-@@$H.filter-@@//
	var oArgs = g_checkVarType(arguments, {
		'4fun' : [ 'callback:Function+'],
		'4obj' : [ 'callback:Function+', "thisObject:Variant"]
	},"$H#filter");
	var h = nv.$H();
	var t = this._table;
	var hCon = this.constructor;

	for(var k in t) {
		if (t.hasOwnProperty(k)) {
			if (!t.propertyIsEnumerable(k)) continue;
			try {
				if(callback.call(thisObject||this, t[k], k, t)){
					h.add(k,t[k]);
				}
			} catch(e) {
				if (e instanceof hCon.Break) break;
				if (e instanceof hCon.Continue) continue;
				throw e;
			}
		}
	}
	return h;
};
//-!nv.$H.prototype.filter end!-//

//-!nv.$H.prototype.map start(nv.$H.prototype.forEach)!-//
/**
 	map() 硫붿꽌�쒕뒗 �댁떆�� 紐⑤뱺 �먯냼瑜� �쒗쉶�섎㈃�� 肄쒕갚 �⑥닔瑜� �ㅽ뻾�섍퀬 肄쒕갚 �⑥닔�� �ㅽ뻾 寃곌낵瑜� 諛곗뿴�� �먯냼�� �ㅼ젙�쒕떎. nv.$A() 媛앹껜�� map() 硫붿꽌�쒖� �좎궗�섎떎. $H.Break()�� $H.Continue()�� �ъ슜�� �� �덈떎.

	@method map
	@param {Function+} fCallback �댁떆瑜� �쒗쉶�섎㈃�� �ㅽ뻾�� 肄쒕갚 �⑥닔. 肄쒕갚 �⑥닔�먯꽌 諛섑솚�섎뒗 媛믪쓣 �대떦 �먯냼�� 媛믪쑝濡� �ъ꽕�뺥븳��. 肄쒕갚 �⑥닔�� �뚮씪誘명꽣濡� value, key, object瑜� 媛뽯뒗��.<br>
		<ul class="disc">
			<li>value�� �대떦 �먯냼�� 媛믪씠��.</li>
			<li>key�� �대떦 �먯냼�� �ㅼ씠��.</li>
			<li>object�� �댁떆 洹� �먯껜瑜� 媛�由ы궓��.</li>
		</ul>
	@param {Variant} [oThis] 肄쒕갚 �⑥닔媛� 媛앹껜�� 硫붿꽌�쒖씪 �� 肄쒕갚 �⑥닔 �대��먯꽌 this �ㅼ썙�쒖쓽 �ㅽ뻾 臾몃㎘(Execution Context) �ъ슜�� 媛앹껜.
	@return {nv.$H} 肄쒕갚 �⑥닔�� �섑뻾 寃곌낵瑜� 諛섏쁺�� �덈줈�� nv.$H() 媛앹껜.
	@see nv.$H#forEach
	@see nv.$H#filter
	@see nv.$H#map
	@example
		function callback(value, key, object) {
		   var r = key+"_"+value;
		   document.writeln (r + "<br />");
		   return r;
		}

		$H({one:"first", two:"second", three:"third"}).map(callback);
 */

nv.$H.prototype.map = function(callback, thisObject) {
	//-@@$H.map-@@//
	var oArgs = g_checkVarType(arguments, {
		'4fun' : [ 'callback:Function+'],
		'4obj' : [ 'callback:Function+', "thisObject:Variant"]
	},"$H#map");
	var h = nv.$H();
	var t = this._table;
	var hCon = this.constructor;

	for(var k in t) {
		if (t.hasOwnProperty(k)) {
			if (!t.propertyIsEnumerable(k)) continue;
			try {
				h.add(k,callback.call(thisObject||this, t[k], k, t));
			} catch(e) {
				if (e instanceof hCon.Break) break;
				if (e instanceof hCon.Continue){
					h.add(k,t[k]);
				}else{
					throw e;
				}
			}
		}
	}

	return h;
};
//-!nv.$H.prototype.map end!-//

//-!nv.$H.prototype.add start!-//
/**
 	add() 硫붿꽌�쒕뒗 �댁떆�� 媛믪쓣 異붽��쒕떎. �뚮씪誘명꽣濡� 媛믪쓣 異붽��� �ㅻ� 吏��뺥븳��. 吏��뺥븳 �ㅼ뿉 �대� 媛믪씠 �덈떎硫� 吏��뺥븳 媛믪쑝濡� 蹂�寃쏀븳��.

	@method add
	@param {String+ | Numeric} sKey 媛믪쓣 異붽��섍굅�� 蹂�寃쏀븷 ��.
	@param {Variant} vValue �대떦 �ㅼ뿉 異붽��� 媛�.
	@return {this} 媛믪쓣 異붽��� �몄뒪�댁뒪 �먯떊
	@see nv.$H#remove
	@example
		var woH = $H();
		// �ㅺ� 'foo'�닿퀬 媛믪씠 'bar'�� �먯냼瑜� 異붽�
		woH.add('foo', 'bar');

		// �ㅺ� 'foo'�� �먯냼�� 媛믪쓣 'bar2'濡� 蹂�寃�
		woH.add('foo', 'bar2');
 */
nv.$H.prototype.add = function(key, value) {
	//-@@$H.add-@@//
	var oArgs = g_checkVarType(arguments, {
		'4str' : [ 'key:String+',"value:Variant"],
		'4num' : [ 'key:Numeric',"value:Variant"]
	},"$H#add");
	var sortedIndex = this["__nv_sorted_index"];
    if(sortedIndex && this._table[key]==undefined ){
        this["__nv_sorted_index"].push(key);
    }
	this._table[key] = value;

	return this;
};
//-!nv.$H.prototype.add end!-//

//-!nv.$H.prototype.remove start!-//
/**
 	remove() 硫붿꽌�쒕뒗 吏��뺥븳 �ㅼ쓽 �먯냼瑜� �쒓굅�쒕떎. �대떦�섎뒗 �먯냼媛� �놁쑝硫� �꾨Т �쇰룄 �섑뻾�섏� �딅뒗��.

	@method remove
	@param {String+ | Numeric} sKey �쒓굅�� �먯냼�� ��.
	@return {Variant} �쒓굅�� 媛�.
	@see nv.$H#add
	@example
		var h = $H({one:"first", two:"second", three:"third"});
		h.remove ("two");
		// h�� �댁떆 �뚯씠釉붿� {one:"first", three:"third"}
 */
nv.$H.prototype.remove = function(key) {
	//-@@$H.remove-@@//
	var oArgs = g_checkVarType(arguments, {
		'4str' : [ 'key:String+'],
		'4num' : [ 'key:Numeric']
	},"$H#remove");

	if (this._table[key] === undefined) return null;
	var val = this._table[key];
	delete this._table[key];


	var sortedIndex = this["__nv_sorted_index"];
	if(sortedIndex){
    	var newSortedIndex = [];
    	for(var i = 0, l = sortedIndex.length ; i < l ; i++){
    	    if(sortedIndex[i] != key){
    	        newSortedIndex.push(sortedIndex[i]);
    	    }
    	}
    	this["__nv_sorted_index"] = newSortedIndex;
	}
	return val;
};
//-!nv.$H.prototype.remove end!-//

//-!nv.$H.prototype.search start!-//
/**
 	search() 硫붿꽌�쒕뒗 �댁떆�먯꽌 �뚮씪誘명꽣濡� 吏��뺥븳 媛믪쓣 媛�吏��� �먯냼�� �ㅻ� 諛섑솚�쒕떎.

	@method search
	@param {Variant} sValue 寃��됲븷 媛�.
	@return {Variant} �대떦 媛믪쓣 媛�吏�怨� �덈뒗 �먯냼�� ��(String). 吏��뺥븳 媛믪쓣 媛�吏� �먯냼媛� �녿떎硫� false瑜� 諛섑솚�쒕떎.
	@example
		var h = $H({one:"first", two:"second", three:"third"});
		h.search ("second"); // two
		h.search ("fist"); // false
 */
nv.$H.prototype.search = function(value) {
	//-@@$H.search-@@//
	var oArgs = g_checkVarType(arguments, {
		'4str' : [ 'value:Variant']
	},"$H#search");
	var result = false;
	var t = this._table;

	for(var k in t) {
		if (t.hasOwnProperty(k)) {
			if (!t.propertyIsEnumerable(k)) continue;
			var v = t[k];
			if (v === value) {
				result = k;
				break;
			}
		}
	}

	return result;
};
//-!nv.$H.prototype.search end!-//

//-!nv.$H.prototype.hasKey start!-//
/**
 	hasKey() 硫붿꽌�쒕뒗 �댁떆�� �뚮씪誘명꽣濡� �낅젰�� �ㅺ� �덈뒗吏� �뺤씤�쒕떎.

	@method hasKey
	@param {String+|Numeric} sKey 寃��됲븷 ��.
	@return {Boolean} �ㅼ쓽 議댁옱 �щ�. 議댁옱�섎㈃ true �놁쑝硫� false瑜� 諛섑솚�쒕떎.
	@example
		var h = $H({one:"first", two:"second", three:"third"});
		h.hasKey("four"); // false
		h.hasKey("one"); // true
 */
nv.$H.prototype.hasKey = function(key) {
	//-@@$H.hasKey-@@//
	var oArgs = g_checkVarType(arguments, {
		'4str' : [ 'key:String+'],
		'4num' : [ 'key:Numeric']
	},"$H#hasKey");
	return this._table[key] !== undefined;
};
//-!nv.$H.prototype.hasKey end!-//

//-!nv.$H.prototype.hasValue start(nv.$H.prototype.search)!-//
/**
 	hasValue() 硫붿꽌�쒕뒗 �댁떆�� �뚮씪誘명꽣濡쒕줈 �낅젰�� 媛믪씠 �덈뒗吏� �뺤씤�쒕떎.

	@method hasValue
	@param {Variant} vValue �댁떆�먯꽌 寃��됲븷 媛�.
	@return {Boolean} 媛믪쓽 議댁옱 �щ�. 議댁옱�섎㈃ true �놁쑝硫� false瑜� 諛섑솚�쒕떎.
 */
nv.$H.prototype.hasValue = function(value) {
	//-@@$H.hasValue-@@//
	var oArgs = g_checkVarType(arguments, {
		'4str' : [ 'value:Variant']
	},"$H#hasValue");
	return (this.search(value) !== false);
};
//-!nv.$H.prototype.hasValue end!-//



//-!nv.$H.prototype.sort start(nv.$H.prototype.search)!-//
nv._p_.defaultSort = function(oArgs,that,type){
    var aSorted = [];
    var fpSort = oArgs.fpSort;
    for(var k in that._table) {
        if(that._table.hasOwnProperty(k)){
          (function(k,v){
            aSorted.push({
                "key" : k,
                "val" : v
            });
          })(k,that._table[k]);
        }
    }

    if(oArgs+"" === "vo"){
        fpSort = function (a,b){
            return a === b ? 0 : a > b ? 1 : -1;
        };
    }

    aSorted.sort(function(beforeVal,afterVal){
        return fpSort.call(that, beforeVal[type], afterVal[type]);
    });

    var sortedKey = [];
    for(var i = 0, l = aSorted.length; i < l; i++){
        sortedKey.push(aSorted[i].key);
    }

    return sortedKey;
};
/**
 	sort() 硫붿꽌�쒕뒗 媛믪쓣 湲곗��쇰줈 �댁떆�� �먯냼瑜� �ㅻ쫫李⑥닚 �뺣젹�쒕떎.
	�ㅻ쭔, �ㅼ젣 媛믪씠 蹂�寃쎈릺�� 寃껋씠 �꾨땲�� $H#forEach�� �ъ슜�댁빞吏�留�
	�뺣젹�� 寃곌낵瑜� �ъ슜�� �� �덈떎.

	@method sort
	@param {Function} [sortFunc] 吏곸젒 �뺣젹�� �� �덈룄濡� �⑥닔瑜� �ｌ쓣 �� �덈떎.
		@param {Variant} [sortFunc.preVal] �욎쓽 媛�
		@param {Variant} [sortFunc.foreVal] �ㅼ쓽 媛�

	@return {this} �먯냼瑜� �뺣젹�� �몄뒪�댁뒪 �먯떊
	@see nv.$H#ksort
	@see nv.$H#forEach
	@example
		var h = $H({one:"�섎굹", two:"��", three:"��"});
		h.sort ();
		h.forEach(function(v){
			//��
			//��
			//�섎굹
		});
	@example
		var h = $H({one:"�섎굹", two:"��", three:"��"});
		h.sort(function(val, val2){
			return val === val2 ? 0 : val < val2 ? 1 : -1;
		});
		h.forEach(function(v){
			//�섎굹
			//��
			//��
		});
 */

nv.$H.prototype.sort = function(fpSort) {
	//-@@$H.sort-@@//
	var oArgs = g_checkVarType(arguments, {
	    'vo'  : [],
        '4fp' : [ 'fpSort:Function+']
    },"$H#sort");

	this["__nv_sorted_index"] = nv._p_.defaultSort(oArgs,this,"val");
	return this;
};
//-!nv.$H.prototype.sort end!-//

//-!nv.$H.prototype.ksort start(nv.$H.prototype.keys)!-//
/**
 	ksort() 硫붿꽌�쒕뒗 �ㅻ� 湲곗��쇰줈 �댁떆�� �먯냼瑜� �ㅻ쫫李⑥닚 �뺣젹�쒕떎.
	�ㅻ쭔, �ㅼ젣 媛믪씠 蹂�寃쎈릺�� 寃껋씠 �꾨땲�� $H#forEach�� �ъ슜�댁빞吏�留�
	�뺣젹�� 寃곌낵瑜� �ъ슜�� �� �덈떎.

	@method ksort
	@param {Function} [sortFunc] 吏곸젒 �뺣젹�� �� �덈룄濡� �⑥닔瑜� �ｌ쓣 �� �덈떎.
		@param {Variant} [sortFunc.preKey] �욎쓽 ��
		@param {Variant} [sortFunc.foreKey] �ㅼ쓽 ��
	@return {this} �먯냼瑜� �뺣젹�� �몄뒪�댁뒪 �먯떊
	@see nv.$H#sort
	@see nv.$H#forEach
	@example
		var h = $H({one:"�섎굹", two:"��", three:"��"});
		h.ksort ();
		h.forEach(function(v){
			//�섎굹
			//��
			//��
		});
	@example
		var h = $H({one:"�섎굹", two:"��", three:"��"});
		h.ksort (function(key, key2){
			return key === key2 ? 0 : key < key2 ? 1 : -1;
		});
		h.forEach(function(v){
			//��
			//��
			//�섎굹
		});
 */
nv.$H.prototype.ksort = function(fpSort) {
	//-@@$H.ksort-@@//
	var oArgs = g_checkVarType(arguments, {
        'vo'  : [],
        '4fp' : [ 'fpSort:Function+']
    },"$H#ksort");

    this["__nv_sorted_index"] = nv._p_.defaultSort(oArgs,this,"key");
	return this;
};
//-!nv.$H.prototype.ksort end!-//

//-!nv.$H.prototype.keys start!-//
/**
 	keys() 硫붿꽌�쒕뒗 �댁떆�� �ㅻ� 諛곗뿴濡� 諛섑솚�쒕떎.

	@method keys
	@return {Array} �댁떆 �ㅼ쓽 諛곗뿴.
	@see nv.$H#values
	@example
		var h = $H({one:"first", two:"second", three:"third"});
		h.keys ();
		// ["one", "two", "three"]
 */
nv.$H.prototype.keys = function() {
	//-@@$H.keys-@@//
	var keys = this["__nv_sorted_index"];

	if(!keys){
	    keys = [];
    	for(var k in this._table) {
    		if(this._table.hasOwnProperty(k))
    			keys.push(k);
    	}
	}

	return keys;
};
//-!nv.$H.prototype.keys end!-//

//-!nv.$H.prototype.values start!-//
/**
 	values() 硫붿꽌�쒕뒗 �댁떆�� 媛믪쓣 諛곗뿴濡� 諛섑솚�쒕떎.

	@method values
	@return {Array} �댁떆 媛믪쓽 諛곗뿴.
	@example
		var h = $H({one:"first", two:"second", three:"third"});
		h.values();
		// ["first", "second", "third"]
 */
nv.$H.prototype.values = function() {
	//-@@$H.values-@@//
	var values = [];
	for(var k in this._table) {
		if(this._table.hasOwnProperty(k))
			values[values.length] = this._table[k];
	}

	return values;
};
//-!nv.$H.prototype.values end!-//

//-!nv.$H.prototype.toQueryString start!-//
/**
 	toQueryString() 硫붿꽌�쒕뒗 �댁떆瑜� 荑쇰━ �ㅽ듃留�(Query String) �뺥깭濡� 留뚮뱺��.

	@method toQueryString
	@return {String} �댁떆瑜� 蹂��섑븳 荑쇰━ �ㅽ듃留�.
	@see http://en.wikipedia.org/wiki/Querystring Query String - Wikipedia
	@example
		var h = $H({one:"first", two:"second", three:"third"});
		h.toQueryString();
		// "one=first&two=second&three=third"
 */
nv.$H.prototype.toQueryString = function() {
	//-@@$H.toQueryString-@@//
	var buf = [], val = null, idx = 0;

	for(var k in this._table) {
		if(this._table.hasOwnProperty(k)) {
			val = this._table[k];

			if(nv.$Jindo.isArray(val)) {
				for(var i=0; i < val.length; i++) {
					buf[buf.length] = encodeURIComponent(k)+"[]="+encodeURIComponent(val[i]+"");
				}
			} else {
				buf[buf.length] = encodeURIComponent(k)+"="+encodeURIComponent(this._table[k]+"");
			}
		}
	}

	return buf.join("&");
};
//-!nv.$H.prototype.toQueryString end!-//

//-!nv.$H.prototype.empty start!-//
/**
 	empty() 硫붿꽌�쒕뒗 �댁떆瑜� 鍮꾩슫��.

	@method empty
	@return {this} 鍮꾩썙吏� �몄뒪�댁뒪 �먯떊
	@example
		var hash = $H({a:1, b:2, c:3});
		// hash => {a:1, b:2, c:3}

		hash.empty();
		// hash => {}
 */
nv.$H.prototype.empty = function() {
	//-@@$H.empty-@@//
	this._table = {};
	delete this["__nv_sorted_index"];

	return this;
};
//-!nv.$H.prototype.empty end!-//

//-!nv.$H.Break start!-//
/**
 	Break() 硫붿꽌�쒕뒗 forEach(), filter(), map() 硫붿꽌�쒖쓽 猷⑦봽瑜� 以묐떒�쒕떎. �대��곸쑝濡쒕뒗 媛뺤젣濡� �덉쇅瑜� 諛쒖깮�쒗궎�� 援ъ“�대�濡�, try - catch �곸뿭�먯꽌 �� 硫붿꽌�쒕� �ㅽ뻾�섎㈃ �뺤긽�곸쑝濡� �숈옉�섏� �딆쓣 �� �덈떎.

	@method Break
	@static
	@see nv.$H#Continue
	@see nv.$H#forEach
	@see nv.$H#filter
	@see nv.$H#map
	@example
		$H({a:1, b:2, c:3}).forEach(function(v,k,o) {
		  ...
		  if (k == "b") $H.Break();
		   ...
		});
 */
nv.$H.Break = nv.$Jindo.Break;
//-!nv.$H.Break end!-//

//-!nv.$H.Continue start!-//
/**
 	Continue() 硫붿꽌�쒕뒗 forEach(), filter(), map() 硫붿꽌�쒖쓽 猷⑦봽�먯꽌 �섎㉧吏� 紐낅졊�� �ㅽ뻾�섏� �딄퀬 �ㅼ쓬 猷⑦봽濡� 嫄대꼫�대떎. �대��곸쑝濡쒕뒗 媛뺤젣濡� �덉쇅瑜� 諛쒖깮�쒗궎�� 援ъ“�대�濡�, try - catch �곸뿭�먯꽌 �� 硫붿꽌�쒕� �ㅽ뻾�섎㈃ �뺤긽�곸쑝濡� �숈옉�섏� �딆쓣 �� �덈떎.

	@method Continue
	@static
	@see nv.$H#Break
	@see nv.$H#forEach
	@see nv.$H#filter
	@see nv.$H#map
	@example
		$H({a:1, b:2, c:3}).forEach(function(v,k,o) {
		   ...
		   if (v % 2 == 0) $H.Continue();
		   ...
		});
 */
nv.$H.Continue  = nv.$Jindo.Continue;
//-!nv.$H.Continue end!-//


/**
 	@fileOverview nv.$Fn() 媛앹껜�� 占쏙옙占쎌꽦�� 諛� 硫붿꽌�쒕� �뺤쓽�� �뚯씪
	@name function.js
	@author NAVER Ajax Platform
 */
//-!nv.$Fn start!-//
/**
 	nv.$Fn() 媛앹껜�� Function 媛앹껜瑜� �섑븨(wrapping)�섏뿬 �⑥닔�� 愿��⑤맂 �뺤옣 湲곕뒫�� �쒓났�쒕떎.

	@class nv.$Fn
	@keyword function, �⑥닔
 */
/**
 	nv.$Fn() 媛앹껜()瑜� �앹꽦�쒕떎. �앹꽦�먯쓽 �뚮씪誘명꽣濡� �뱀젙 �⑥닔瑜� 吏��뺥븷 �� �덈떎. �� ��, �⑥닔�� �④퍡 this �ㅼ썙�쒕� �곹솴�� 留욊쾶 �ъ슜�� �� �덈룄濡� �ㅽ뻾 臾몃㎘(Execution Context)�� �④퍡 吏��뺥븷 �� �덈떎. �먰븳 �앹꽦�먯쓽 �뚮씪誘명꽣濡� �섑븨�� �⑥닔�� �뚮씪誘명꽣�� 紐몄껜瑜� 媛곴컖 �낅젰�섏뿬 nv.$Fn() 媛앹껜瑜� �앹꽦�� �� �덈떎.

	@constructor
	@syntax fpFunction, vExeContext
	@syntax sFuncArgs, sFuncBody
	@param {Function+} fpFunction �⑺븨�� �⑥닔
	@param {Variant} [vExeContext] �⑥닔�� �ㅽ뻾 臾몃㎘�� �� 媛앹껜
	@param {String} sFuncArgs �⑥닔�� �뚮씪誘명꽣瑜� �섑��대뒗 臾몄옄��
	@param {String} sFuncBody �⑥닔�� 紐몄껜瑜� �섑��대뒗 臾몄옄��
	@return {nv.$Fn} nv.$Fn() 媛앹껜
	@see nv.$Fn#toFunction
	@example
		func : function() {
		       // code here
		}

		var fn = $Fn(func, this);
	@example
		var someObject = {
		    func : function() {
		       // code here
		   }
		}

		var fn = $Fn(someObject.func, someObject);
	@example
		var fn = $Fn("a, b", "return a + b;");
		var result = fn.$value()(1, 2) // result = 3;

		// fn�� �⑥닔 由ы꽣�댁씤 function(a, b){ return a + b;}�� �숈씪�� �⑥닔瑜� �섑븨�쒕떎.
 */
nv.$Fn = function(func, thisObject) {
	//-@@$Fn-@@//
	var cl = arguments.callee;
	if (func instanceof cl) return func;

	if (!(this instanceof cl)){
		try {
			nv.$Jindo._maxWarn(arguments.length, 2,"$Fn");
			return new cl(func, thisObject);
		} catch(e) {
			if (e instanceof TypeError) { return null; }
			throw e;
		}
	}

	var oArgs = g_checkVarType(arguments, {
		'4fun' : ['func:Function+'],
		'4fun2' : ['func:Function+', "thisObject:Variant"],
		'4str' : ['func:String+', "thisObject:String+"]
	},"$Fn");

	this._tmpElm = null;
	this._key    = null;

	switch(oArgs+""){
		case "4str":
			this._func = eval("false||function("+func+"){"+thisObject+"}");
			break;
		case "4fun":
		case "4fun2":
			this._func = func;
			this._this = thisObject;

	}

};

/**
 * @ignore
 */
nv.$Fn._commonPram = function(oPram,sMethod){
	return g_checkVarType(oPram, {
		'4ele' : ['eElement:Element+',"sEvent:String+"],
		'4ele2' : ['eElement:Element+',"sEvent:String+","bUseCapture:Boolean"],
		'4str' : ['eElement:String+',"sEvent:String+"],
		'4str2' : ['eElement:String+',"sEvent:String+","bUseCapture:Boolean"],
		'4arr' : ['aElement:Array+',"sEvent:String+"],
		'4arr2' : ['aElement:Array+',"sEvent:String+","bUseCapture:Boolean"],
		'4doc' : ['eElement:Document+',"sEvent:String+"],
		'4win' : ['eElement:Window+',"sEvent:String+"],
		'4doc2' : ['eElement:Document+',"sEvent:String+","bUseCapture:Boolean"],
		'4win2' : ['eElement:Window+',"sEvent:String+","bUseCapture:Boolean"]
	},sMethod);
};
//-!nv.$Fn end!-//

//-!nv.$Fn.prototype.$value start!-//
/**
 	$value() 硫붿꽌�쒕뒗 �먮낯 Function 媛앹껜瑜� 諛섑솚占쏙옙占쎈떎.

	@method $value
	@return {Function} �먮낯 Function 媛앹껜
	@example
		func : function() {
			// code here
		}

		var fn = $Fn(func, this);
		fn.$value(); // �먮옒�� �⑥닔媛� 由ы꽩�쒕떎.
 */
nv.$Fn.prototype.$value = function() {
	//-@@$Fn.$value-@@//
	return this._func;
};
//-!nv.$Fn.prototype.$value end!-//

//-!nv.$Fn.prototype.bind start!-//
/**
 	bind() 硫붿꽌�쒕뒗 �앹꽦�먭� 吏��뺥븳 媛앹껜�� 硫붿꽌�쒕줈 �숈옉�섎룄濡� 臾띠� Function 媛앹껜瑜� 諛섑솚�쒕떎. �대븣 �대떦 硫붿꽌�쒖쓽 �ㅽ뻾 臾몃㎘(Execution Context)�� 吏��뺥븳 媛앹껜濡� �ㅼ젙�쒕떎.

	@method bind
	@param {Variant} [vParameter*] �앹꽦�� �⑥닔�� 湲곕낯�곸쑝濡� �낅젰�� 泥�~N 踰덉㎏ �뚮씪誘명꽣.
	@return {Function} �ㅽ뻾 臾몃㎘�� 硫붿꽌�쒕줈 臾띠씤 Function 媛앹껜
	@see nv.$Fn
	@see nv.$Class
	@example
		var sName = "OUT";
		var oThis = {
		    sName : "IN"
		};

		function getName() {
		    return this.sName;
		}

		oThis.getName = $Fn(getName, oThis).bind();

		alert( getName() );       	  //  OUT
		alert( oThis.getName() ); //   IN
	@example
		 // 諛붿씤�쒗븳 硫붿꽌�쒖뿉 �몄닔瑜� �낅젰�� 寃쎌슦
		var b = $Fn(function(one, two, three){
			console.log(one, two, three);
		}).bind(true);

		b();	// true, undefined, undefined
		b(false);	// true, false, undefined
		b(false, "1234");	// true, false, "1234"
	@example
		// �⑥닔瑜� 誘몃━ �좎뼵�섍퀬 �섏쨷�� �ъ슜�� �� �⑥닔�먯꽌 李몄“�섎뒗 媛믪� �대떦 �⑥닔瑜�
		// �앹꽦�� �뚯쓽 媛믪씠 �꾨땲�� �⑥닔 �ㅽ뻾 �쒖젏�� 媛믪씠 �ъ슜�섎�濡� �대븣 bind() 硫붿꽌�쒕� �댁슜�쒕떎.
		for(var i=0; i<2;i++){
			aTmp[i] = function(){alert(i);}
		}

		for(var n=0; n<2;n++){
			aTmp[n](); // �レ옄 2留� �먮쾲 alert�쒕떎.
		}

		for(var i=0; i<2;i++){
		aTmp[i] = $Fn(function(nTest){alert(nTest);}, this).bind(i);
		}

		for(var n=0; n<2;n++){
			aTmp[n](); // �レ옄 0, 1�� alert�쒕떎.
		}
	@example
		//�대옒�ㅻ� �앹꽦�� �� �⑥닔瑜� �뚮씪誘명꽣濡� �ъ슜�섎㈃, scope瑜� 留욎텛湲� �꾪빐 bind() 硫붿꽌�쒕� �ъ슜�쒕떎.
		var MyClass = $Class({
			fFunc : null,
			$init : function(func){
				this.fFunc = func;

				this.testFunc();
			},
			testFunc : function(){
				this.fFunc();
			}
		})
		var MainClass = $Class({
			$init : function(){
				var oMyClass1 = new MyClass(this.func1);
				var oMyClass2 = new MyClass($Fn(this.func2, this).bind());
			},
			func1 : function(){
				alert(this);// this�� MyClass 瑜� �섎��쒕떎.
			},
			func2 : function(){
				alert(this);// this�� MainClass 瑜� �섎��쒕떎.
			}
		})
		function init(){
			var a = new MainClass();
		}
*/
nv.$Fn.prototype.bind = function() {
	//-@@$Fn.bind-@@//
	var a = nv._p_._toArray(arguments);
	var f = this._func;
	var t = this._this||this;
	var b;
	if(f.bind){
	    a.unshift(t);
	    b = Function.prototype.bind.apply(f,a);
	}else{

    	b = function() {
    		var args = nv._p_._toArray(arguments);
    		// fix opera concat bug
    		if (a.length) args = a.concat(args);

    		return f.apply(t, args);
    	};
	}
	return b;
};
//-!nv.$Fn.prototype.bind end!-//

//-!nv.$Fn.prototype.attach start(nv.$Fn.prototype.bind, nv.$Element.prototype.attach, nv.$Element.prototype.detach)!-//
/**
 {{attach}}
 */
nv.$Fn.prototype.attach = function(oElement, sEvent, bUseCapture) {
	//-@@$Fn.attach-@@//
	var oArgs = nv.$Fn._commonPram(arguments,"$Fn#attach");
	var fn = null, l, ev = sEvent, el = oElement, ua = nv._p_._j_ag;

	if (bUseCapture !== true) {
		bUseCapture = false;
	}

	this._bUseCapture = bUseCapture;

	switch(oArgs+""){
		case "4arr":
		case "4arr2":
			var el = oArgs.aElement;
			var ev = oArgs.sEvent;
			for(var i=0, l= el.length; i < l; i++) this.attach(el[i], ev, !!bUseCapture);
			return this;
	}
	fn = this._bind = this._bind?this._bind:this.bind();
	nv.$Element(el).attach(ev,fn);

	return this;
};
//-!nv.$Fn.prototype.attach end!-//

//-!nv.$Fn.prototype.detach start!-//
/**
 {{detach}}
 */
nv.$Fn.prototype.detach = function(oElement, sEvent, bUseCapture) {
	//-@@$Fn.detach-@@//
	var oArgs = nv.$Fn._commonPram(arguments,"$Fn#detach");

	var fn = null, l, el = oElement, ev = sEvent, ua = nv._p_._j_ag;

	switch(oArgs+""){
		case "4arr":
		case "4arr2":
			var el = oArgs.aElement;
			var ev = oArgs.sEvent;
			for(var i=0, l= el.length; i < l; i++) this.detach(el[i], ev, !!bUseCapture);
			return this;

	}
	fn = this._bind = this._bind?this._bind:this.bind();
	nv.$Element(oArgs.eElement).detach(oArgs.sEvent, fn);

	return this;
};
//-!nv.$Fn.prototype.detach end!-//

//-!nv.$Fn.prototype.delay start(nv.$Fn.prototype.bind)!-//
/**
 	delay() 硫붿꽌�쒕뒗 �섑븨�� �⑥닔瑜� 吏��뺥븳 �쒓컙 �댄썑�� �몄텧�쒕떎.

	@method delay
	@param {Numeric} nSec �⑥닔瑜� �몄텧�� �뚭퉴吏� ��湲고븷 �쒓컙(珥� �⑥쐞).
	@param {Array+} [aArgs] �⑥닔瑜� �몄텧�� �� �ъ슜�� �뚮씪誘명꽣瑜� �댁� 諛곗뿴.
	@return {nv.$Fn} �앹꽦�� nv.$Fn() 媛앹껜.
	@see nv.$Fn#bind
	@see nv.$Fn#setInterval
	@example
		function func(a, b) {
			alert(a + b);
		}

		$Fn(func).delay(5, [3, 5]); // 5珥� �댄썑�� 3, 5 媛믪쓣 留ㅺ컻蹂��섎줈 �섎뒗 �⑥닔 func瑜� �몄텧�쒕떎.
 */
nv.$Fn.prototype.delay = function(nSec, args) {
	//-@@$Fn.delay-@@//
	var oArgs = g_checkVarType(arguments, {
		'4num' : ['nSec:Numeric'],
		'4arr' : ['nSec:Numeric','args:Array+']
	},"$Fn#delay");
	switch(oArgs+""){
		case "4num":
			args = args || [];
			break;
		case "4arr":
			args = oArgs.args;

	}
	this._delayKey = setTimeout(this.bind.apply(this, args), nSec*1000);
	return this;
};
//-!nv.$Fn.prototype.delay end!-//

//-!nv.$Fn.prototype.setInterval start(nv.$Fn.prototype.bind)!-//
/**
 	setInterval() 硫붿꽌�쒕뒗 �섑븨�� �⑥닔瑜� 吏��뺥븳 �쒓컙 媛꾧꺽留덈떎 �몄텧�쒕떎.

	@method setInterval
	@param {Numeric} nSec �⑥닔瑜� �몄텧�� �쒓컙 媛꾧꺽(珥� �⑥쐞).
	@param {Array+} [aArgs] �⑥닔瑜� �몄텧�� �� �ъ슜�� �뚮씪誘명꽣瑜� �댁� 諛곗뿴.
	@return {nv.$Fn} �앹꽦�� nv.$Fn() 媛앹껜.
	@see nv.$Fn#bind
	@see nv.$Fn#delay
	@example
		function func(a, b) {
			alert(a + b);
		}

		$Fn(func).setInterval(5, [3, 5]); // 5珥� 媛꾧꺽�쇰줈 3, 5 媛믪쓣 留ㅺ컻蹂��섎줈 �섎뒗 �⑥닔 func瑜� �몄텧�쒕떎.
 */
nv.$Fn.prototype.setInterval = function(nSec, args) {
	//-@@$Fn.setInterval-@@//
	//-@@$Fn.repeat-@@//
	var oArgs = g_checkVarType(arguments, {
		'4num' : ['nSec:Numeric'],
		'4arr' : ['nSec:Numeric','args:Array+']
	},"$Fn#setInterval");
	switch(oArgs+""){
		case "4num":
			args = args || [];
			break;
		case "4arr":
			args = oArgs.args;

	}
	this._repeatKey = setInterval(this.bind.apply(this, args), nSec*1000);
	return this;
};
//-!nv.$Fn.prototype.setInterval end!-//

//-!nv.$Fn.prototype.repeat start(nv.$Fn.prototype.setInterval)!-//
/**
 	repeat() 硫붿꽌�쒕뒗 setInterval() 硫붿꽌�쒖� �숈씪�섎떎.

	@method repeat
	@param {Numeric} nSec �⑥닔瑜� �몄텧�� �쒓컙 媛꾧꺽(珥� �⑥쐞).
	@param {Array+} [aArgs] �⑥닔瑜� �몄텧�� �� �ъ슜�� �뚮씪誘명꽣占쏙옙占� �댁� 諛곗뿴.
	@return {nv.$Fn} �앹꽦�� nv.$Fn() 媛앹껜.
	@see nv.$Fn#setInterval
	@see nv.$Fn#bind
	@see nv.$Fn#delay
	@example
		function func(a, b) {
			alert(a + b);
		}

		$Fn(func).repeat(5, [3, 5]); // 5珥� 媛꾧꺽�쇰줈 3, 5 媛믪쓣 留ㅺ컻蹂��섎줈 �섎뒗 �⑥닔 func瑜� �몄텧�쒕떎.
 */
nv.$Fn.prototype.repeat = nv.$Fn.prototype.setInterval;
//-!nv.$Fn.prototype.repeat end!-//

//-!nv.$Fn.prototype.stopDelay start!-//
/**
 	stopDelay() 硫붿꽌�쒕뒗 delay() 硫붿꽌�쒕줈 吏��뺥븳 �⑥닔 �몄텧�� 以묒��� �� �ъ슜�쒕떎.

	@method stopDelay
	@return {this} �몄뒪�댁뒪 �먯떊
	@see nv.$Fn#delay
	@example
		function func(a, b) {
			alert(a + b);
		}

		var fpDelay = $Fn(func);
		fpDelay.delay(5, [3, 5]);
		fpDelay.stopDelay();
 */
nv.$Fn.prototype.stopDelay = function(){
	//-@@$Fn.stopDelay-@@//
	if(this._delayKey !== undefined){
		window.clearTimeout(this._delayKey);
		delete this._delayKey;
	}
	return this;
};
//-!nv.$Fn.prototype.stopDelay end!-//

//-!nv.$Fn.prototype.stopRepeat start!-//
/**
 	stopRepeat() 硫붿꽌�쒕뒗 repeat() 硫붿꽌�쒕줈 吏��뺥븳 �⑥닔 �몄텧�� 硫덉텧 �� �ъ슜�쒕떎.

	@method stopRepeat
	@return {this} �몄뒪�댁뒪 �먯떊
	@see nv.$Fn#repeat
	@example
		function func(a, b) {
			alert(a + b);
		}

		var fpDelay = $Fn(func);
		fpDelay.repeat(5, [3, 5]);
		fpDelay.stopRepeat();
 */
nv.$Fn.prototype.stopRepeat = function(){
	//-@@$Fn.stopRepeat-@@//
	if(this._repeatKey !== undefined){
		window.clearInterval(this._repeatKey);
		delete this._repeatKey;
	}
	return this;
};
//-!nv.$Fn.prototype.stopRepeat end!-//

/**
 	@fileOverview nv.$Event() 媛앹껜�� �앹꽦�� 諛� 硫붿꽌�쒕� �뺤쓽�� �뚯씪
	@name event.js
	@author NAVER Ajax Platform
 */
//-!nv.$Event start!-//
/**
 	nv.$Event() 媛앹껜�� Event 媛앹껜瑜� �섑븨�섏뿬 �대깽�� 泥섎━�� 愿��⑤맂 �뺤옣 湲곕뒫�� �쒓났�쒕떎. �ъ슜�먮뒗 nv.$Event() 媛앹껜瑜� �ъ슜�섏뿬 諛쒖깮�� �대깽�몄뿉 ���� �뺣낫瑜� �뚯븙�섍굅�� �숈옉�� 吏��뺥븷 �� �덈떎.

	@class nv.$Event
	@keyword event, �대깽��
 */
/**
 	Event 媛앹껜瑜� �섑븨�� nv.$Event() 媛앹껜瑜� �앹꽦�쒕떎.

	@constructor
	@param {Event} event Event 媛앹껜.
 */
/**
 	�대깽�몄쓽 醫낅쪟

	@property type
	@type String
 */
/**
 {{element}}
 */
/**
 	�대깽�멸� 諛쒖깮�� �섎━癒쇳듃

	@property srcElement
	@type Element
 */
/**
 	�대깽�멸� �뺤쓽�� �섎━癒쇳듃

	@property currentElement
	@type Element
 */
/**
 	�대깽�몄쓽 �곌� �섎━癒쇳듃

	@property relatedElement
	@type Element
 */
/**
 	delegate瑜� �ъ슜�� 寃쎌슦 delegate�� �섎━癒쇳듃

	@property delegatedElement
	@type Element
	@example
		<div id="sample">
			<ul>
					<li><a href="#">1</a></li>
					<li>2</li>
			</ul>
		</div>
		$Element("sample").delegate("click","li",function(e){
			//li 諛묒뿉 a瑜� �대┃�� 寃쎌슦.
			e.srcElement -> a
			e.currentElement -> div#sample
			e.delegatedElement -> li
		});
 */
nv.$Event = (function(isMobile) {
	if(isMobile){
		return function(e){
			//-@@$Event-@@//
			var cl = arguments.callee;
			if (e instanceof cl) return e;
			if (!(this instanceof cl)) return new cl(e);

			this._event = this._posEvent = e;
			this._globalEvent = window.event;
			this.type = e.type.toLowerCase();
			if (this.type == "dommousescroll") {
				this.type = "mousewheel";
			} else if (this.type == "domcontentloaded") {
				this.type = "domready";
			}
			this.realType = this.type;

			this.isTouch = false;
			if(this.type.indexOf("touch") > -1){
				this._posEvent = e.changedTouches[0];
				this.isTouch = true;
			}

			this.canceled = false;

			this.srcElement = this.element = e.target || e.srcElement;
			this.currentElement = e.currentTarget;
			this.relatedElement = null;
			this.delegatedElement = null;

			if (!nv.$Jindo.isUndefined(e.relatedTarget)) {
				this.relatedElement = e.relatedTarget;
			} else if(e.fromElement && e.toElement) {
				this.relatedElement = e[(this.type=="mouseout")?"toElement":"fromElement"];
			}
		};
	}else{
		return function(e){
			//-@@$Event-@@//
			var cl = arguments.callee;
			if (e instanceof cl) return e;
			if (!(this instanceof cl)) return new cl(e);

			if (e === undefined) e = window.event;
			if (e === window.event && document.createEventObject) e = document.createEventObject(e);


			this.isTouch = false;
			this._event = this._posEvent = e;
			this._globalEvent = window.event;

			this.type = e.type.toLowerCase();
			if (this.type == "dommousescroll") {
				this.type = "mousewheel";
			} else if (this.type == "domcontentloaded") {
				this.type = "domready";
			}
		    this.realType = this.type;
			this.canceled = false;

			this.srcElement = this.element = e.target || e.srcElement;
			this.currentElement = e.currentTarget;
			this.relatedElement = null;
			this.delegatedElement = null;

			if (e.relatedTarget !== undefined) {
				this.relatedElement = e.relatedTarget;
			} else if(e.fromElement && e.toElement) {
				this.relatedElement = e[(this.type=="mouseout")?"toElement":"fromElement"];
			}
		};
	}
})(nv._p_._JINDO_IS_MO);

//-!nv.$Event end!-//

/**
 	hook() 硫붿꽌�쒕뒗 �대깽�� 紐낆쓣 議고쉶�쒕떎.
	@method hook
	@syntax vName
	@static
	@param {String+} vName �대깽�몃챸(String)
	@remark 2.5.0遺��� �ъ슜媛��ν븯��.
	@return {Variant} �대깽�몃� �섑��대뒗 媛� �뱀� �⑥닔.
	@example
		$Event.hook("pointerDown");
		//MsPointerDown
 	hook() 硫붿꽌�쒕뒗 媛쒕컻�먭� �대깽�몃� 留뚮뱾硫� 吏꾨룄�먯꽌 �대떦 �대깽�멸� �ㅼ뼱�붿쓣 �� 蹂�寃쏀븯�� �ъ슜�쒕떎.
	@method hook
	@syntax vName, vValue
	@syntax oList
	@static
	@param {String+} vName �대깽�몃챸(String)
	@param {Variant} vValue 蹂�寃쏀븷 �대깽�몃챸(String|Function)
	@param {Hash+} oList �섎굹 �댁긽�� �대깽�� 紐낃낵 媛믪쓣 媛�吏��� 媛앹껜(Object) �먮뒗 �댁떆 媛앹껜(nv.$H() 媛앹껜).
	@remark 2.5.0遺��� �ъ슜媛��ν븯��.
	@return {$Event} $Event


	@example
		$Event.hook("pointerDown","MsPointerDown");

		$Element("some").attach("pointerDown",function(){});
		//媛쒕컻�먭� hook�쇰줈 �깅줉�섎㈃ 吏꾨룄�� �대깽�몃� �좊떦�� �� �대쫫�� 蹂�寃쏀븳��.
		//pointerDown -> MsPointerDown
	@example
		//�⑥닔�� �좊떦�� �� �덈떎.
		$Event.hook("pointerDown",function(){
			if(isWindow8&&isIE){
				return "MsPointerDown";
			}else if(isMobile){
				return "touchdown";
			}else{
				return "mousedown";
			}
		});

		$Element("some").attach("pointerDown",function(){});
		//�덈룄��8�닿퀬 IE10�� 寃쎌슦�� MsPointerDown
		//紐⑤컮�쇱씤 寃쎌슦�� touchdown
		//湲고��� mousedown
 */


//-!nv.$Event.nv._p_.customEvent start!-//
/**
 {{nv._p_.customEvent}}
 */

nv._p_.customEvent = {};
nv._p_.customEventStore = {};
nv._p_.normalCustomEvent = {};

nv._p_.hasCustomEvent = function(sName){
    return !!(nv._p_.getCustomEvent(sName)||nv._p_.normalCustomEvent[sName]);
};

nv._p_.getCustomEvent = function(sName){
    return nv._p_.customEvent[sName];
};

nv._p_.addCustomEventListener = function(eEle, sElementId, sEvent, vFilter,oCustomInstance){
    if(!nv._p_.customEventStore[sElementId]){
        nv._p_.customEventStore[sElementId] = {};
        nv._p_.customEventStore[sElementId].ele = eEle;
    }
    if(!nv._p_.customEventStore[sElementId][sEvent]){
        nv._p_.customEventStore[sElementId][sEvent] = {};
    }
    if(!nv._p_.customEventStore[sElementId][sEvent][vFilter]){
        nv._p_.customEventStore[sElementId][sEvent][vFilter] = {
            "custom" : oCustomInstance
        };
    }
};

nv._p_.setCustomEventListener = function(sElementId, sEvent, vFilter, aNative, aWrap){
    nv._p_.customEventStore[sElementId][sEvent][vFilter].real_listener = aNative;
    nv._p_.customEventStore[sElementId][sEvent][vFilter].wrap_listener = aWrap;
};

nv._p_.getCustomEventListener = function(sElementId, sEvent, vFilter){
    var store = nv._p_.customEventStore[sElementId];
    if(store&&store[sEvent]&&store[sEvent][vFilter]){
        return store[sEvent][vFilter];
    }
    return {};
};

nv._p_.getNormalEventListener = function(sElementId, sEvent, vFilter){
    var store = nv._p_.normalCustomEvent[sEvent];
    if(store&&store[sElementId]&&store[sElementId][vFilter]){
        return store[sElementId][vFilter];
    }
    return {};
};

nv._p_.hasCustomEventListener = function(sElementId, sEvent, vFilter){
    var store = nv._p_.customEventStore[sElementId];
    if(store&&store[sEvent]&&store[sEvent][vFilter]){
        return true;
    }
    return false;
};

//-!nv.$Event.customEvent start!-//
nv.$Event.customEvent = function(sName, oEvent) {
    var oArgs = g_checkVarType(arguments, {
        's4str' : [ 'sName:String+'],
        's4obj' : [ 'sName:String+', "oEvent:Hash+"]
    },"$Event.customEvent");


    switch(oArgs+""){
        case "s4str":
            if(nv._p_.hasCustomEvent(sName)){
                throw new nv.$Error("The Custom Event Name have to unique.");
            }else{
                nv._p_.normalCustomEvent[sName] = {};
            }

            return this;
        case "s4obj":
            if(nv._p_.hasCustomEvent(sName)){
                throw new nv.$Error("The Custom Event Name have to unique.");
            }else{
                nv._p_.normalCustomEvent[sName] = {};
                nv._p_.customEvent[sName] = function(){
                    this.name = sName;
                    this.real_listener = [];
                    this.wrap_listener = [];
                };
                var _proto = nv._p_.customEvent[sName].prototype;
                _proto.events = [];
                for(var i in oEvent){
                    _proto[i] = oEvent[i];
                    _proto.events.push(i);
                }

                nv._p_.customEvent[sName].prototype.fireEvent = function(oCustomEvent){
                    for(var i = 0, l = this.wrap_listener.length; i < l; i ++){
                        this.wrap_listener[i](oCustomEvent);
                    }
                };
            }
            return this;
    }
};
//-!nv.$Event.customEvent end!-//


//-!nv.$Event.prototype.mouse start!-//
/**
 	mouse() 硫붿꽌�쒕뒗 留덉슦�� �대깽�� �뺣낫瑜� �닿퀬 �덈뒗 媛앹껜瑜� 諛섑솚�쒕떎.

	@method mouse
	@param {Boolean} [bIsScrollbar=false] true�대㈃ scroll�띿꽦�� �� �� �덈떎. (2.0.0 踰꾩쟾遺��� 吏���).
	@return {Object} 留덉슦�� �대깽�� �뺣낫瑜� 媛뽯뒗 媛앹껜.
		@return {Number} .delta 留덉슦�� �좎쓣 援대┛ �뺣룄瑜� �뺤닔濡� ���ν븳��. 留덉슦�� �좎쓣 �꾨줈 援대┛ �뺣룄�� �묒닔 媛믪쑝濡�, �꾨옒濡� 援대┛ �뺣룄�� �뚯닔 媛믪쑝濡� ���ν븳��.
		@return {Boolean} .left 留덉슦�� �쇱そ 踰꾪듉 �대┃ �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.
		@return {Boolean} .middle 留덉슦�� 媛��대뜲 踰꾪듉 �대┃ �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.
		@return {Boolean} .right 留덉슦�� �ㅻⅨ履� 踰꾪듉 �대┃ �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.
		@return {Boolean} .scroll �대깽�멸� �ㅽ겕濡ㅼ뿉�� 諛쒖깮�덈뒗吏�瑜� �� �� �덈떎.
	@filter desktop
	@example
		function eventHandler(evt) {
		   var mouse = evt.mouse();

		   mouse.delta;   // Number. �좎씠 ��吏곸씤 �뺣룄. �좎쓣 �꾨줈 援대━硫� �묒닔, �꾨옒濡� 援대━硫� �뚯닔.
		   mouse.left;    // 留덉슦�� �쇱そ 踰꾪듉�� �낅젰�� 寃쎌슦 true, �꾨땲硫� false
		   mouse.middle;  // 留덉슦�� 以묎컙 踰꾪듉�� �낅젰�� 寃쎌슦 true, �꾨땲硫� false
		   mouse.right;   // 留덉슦�� �ㅻⅨ履� 踰꾪듉�� �낅젰�� 寃쎌슦 true, �꾨땲硫� false
		}
 */
nv.$Event.prototype.mouse = function(bIsScrollbar) {
	//-@@$Event.mouse-@@//
	g_checkVarType(arguments,{
		"voi" : [],
		"bol" : ["bIsScrollbar:Boolean"]
	});
	var e    = this._event;
	var ele  = this.srcElement;
	var delta = 0;
	var left = false,mid = false,right = false;

	var left  = e.which ? e.button==0 : !!(e.button&1);
	var mid   = e.which ? e.button==1 : !!(e.button&4);
	var right = e.which ? e.button==2 : !!(e.button&2);
	var ret   = {};

	if (e.wheelDelta) {
		delta = e.wheelDelta / 120;
	} else if (e.detail) {
		delta = -e.detail / 3;
	}
	var scrollbar;
	if(bIsScrollbar){
		scrollbar = _event_isScroll(ele,e);
	}


	ret = {
		delta  : delta,
		left   : left,
		middle : mid,
		right  : right,
		scrollbar : scrollbar
	};
	// replace method
	this.mouse = function(bIsScrollbar){
		if(bIsScrollbar){
			ret.scrollbar = _event_isScroll(this.srcElement,this._event);
			this.mouse = function(){return ret;};
		}
		return ret;
	};

	return ret;
};
/**
 * @ignore
 */
function _event_getScrollbarSize() {

	var oScrollbarSize = { x : 0, y : 0 };

	var elDummy = nv.$([
		'<div style="',
		[
			'overflow:scroll',
			'width:100px',
			'height:100px',
			'position:absolute',
			'left:-1000px',
			'border:0',
			'margin:0',
			'padding:0'
		].join(' !important;'),
		' !important;">'
	].join(''));

	document.body.insertBefore(elDummy, document.body.firstChild);

	oScrollbarSize = {
		x : elDummy.offsetWidth - elDummy.scrollWidth,
		y : elDummy.offsetHeight - elDummy.scrollHeight
	};

	document.body.removeChild(elDummy);
	elDummy = null;

	_event_getScrollbarSize = function() {
		return oScrollbarSize;
	};

	return oScrollbarSize;

}
/**
 * @ignore
 */
function _ie_check_scroll(ele,e) {
    var iePattern = nv._p_._j_ag.match(/(?:MSIE) ([0-9.]+)/);
    if(document.body.componentFromPoint&&iePattern&& parseInt(iePattern[1],10) == 8){
        _ie_check_scroll = function(ele,e) {
            return !/HTMLGenericElement/.test(ele+"") &&
                    /(scrollbar|outside)/.test(ele.componentFromPoint(e.clientX, e.clientY)) &&
                    ele.clientHeight !== ele.scrollHeight;
        };
    }else{
        _ie_check_scroll = function(ele,e){
            return /(scrollbar|outside)/.test(ele.componentFromPoint(e.clientX, e.clientY));
        };
    }
    return _ie_check_scroll(ele,e);
}


function _event_isScroll(ele,e){
	/**
	 	// IE �� 寃쎌슦 componentFromPoint 硫붿꽌�쒕� �쒓났�섎�濡� �닿구 �쒖슜
	 */
	if (ele.componentFromPoint) {
		return _ie_check_scroll(ele,e);
	}

	/**
	 	// �뚯씠�댄룺�ㅻ뒗 �ㅽ겕濡ㅻ컮 �대┃�� XUL 媛앹껜濡� 吏���
	 */
	if (nv._p_._JINDO_IS_FF) {

		try {
			var name = e.originalTarget.localName;
			return (
				name === 'thumb' ||
				name === 'slider' ||
				name === 'scrollcorner' ||
				name === 'scrollbarbutton'
			);
		} catch(ex) {
			return true;
		}

	}

	var sDisplay = nv.$Element(ele).css('display');
	if (sDisplay === 'inline') { return false; }

	/**
	 	// �섎━癒쇳듃 �댁뿉�� �대┃�� �꾩튂 �산린
	 */
	var oPos = {
		x : e.offsetX || 0,
		y : e.offsetY || 0
	};

	/**
	 	// Webkit �� 寃쎌슦 border �� �ъ씠利덇� �뷀빐�몄꽌 �섏샂
	 */
	if (nv._p_._JINDO_IS_WK) {
		oPos.x -= ele.clientLeft;
		oPos.y -= ele.clientTop;
	}

	var oScrollbarSize = _event_getScrollbarSize();

	/**
	 	// �ㅽ겕濡ㅻ컮媛� �덈뒗 �곸뿭
	 */
	var oScrollPos = {
		x : [ ele.clientWidth, ele.clientWidth + oScrollbarSize.x ],
		y : [ ele.clientHeight, ele.clientHeight + oScrollbarSize.y ]
	};

	return (
		(oScrollPos.x[0] <= oPos.x && oPos.x <= oScrollPos.x[1]) ||
		(oScrollPos.y[0] <= oPos.y && oPos.y <= oScrollPos.y[1])
	);
}
//-!nv.$Event.prototype.mouse end!-//

//-!nv.$Event.prototype.key start!-//
/**
 	key() 硫붿꽌�쒕뒗 �ㅻ낫�� �대깽�� �뺣낫瑜� �닿퀬 �덈뒗 媛앹껜瑜� 諛섑솚�쒕떎.

	@method key
	@return {Object} �ㅻ낫�� �대깽�� �뺣낫瑜� 媛뽯뒗 媛앹껜.
		@return {Boolean} .alt ALT �� �낅젰 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.
		@return {Boolean} .ctrl CTRL �� �낅젰 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.
		@return {Boolean} .down �꾨옒履� 諛⑺뼢�� �낅젰 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.
		@return {Boolean} .enter �뷀꽣(enter)�� �낅젰 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.
		@return {Boolean} .esc ESC �� �낅젰 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.
		@return {Boolean} .keyCode �낅젰�� �ㅼ쓽 肄붾뱶 媛믪쓣 �뺤닔 �뺥깭濡� ���ν븳��.
		@return {Boolean} .left �쇱そ 諛⑺뼢�� �낅젰 �щ�瑜� 遺덈━�� �뺥깭 ���ν븳��.
		@return {Boolean} .meta META��(Mac �� �ㅻ낫�쒖쓽 Command ��) �낅젰 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.
		@return {Boolean} .right �ㅻⅨ履� 諛⑺뼢�� �낅젰 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.
		@return {Boolean} .shift Shift�� �낅젰 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.
		@return {Boolean} .up �꾩そ 諛⑺뼢�� �낅젰 �щ�瑜� 遺덈━�� �뺥깭濡� ���ν븳��.
	@example
		function eventHandler(evt) {
		   var key = evt.key();

		   key.keyCode; // Number. �ㅻ낫�쒖쓽 �ㅼ퐫��
		   key.alt;     // Alt �ㅻ� �낅젰�� 寃쎌슦 true.
		   key.ctrl;    // Ctrl �ㅻ� �낅젰�� 寃쎌슦 true.
		   key.meta;    // Meta �ㅻ� �낅젰�� 寃쎌슦 true.
		   key.shift;   // Shift �ㅻ� �낅젰�� 寃쎌슦 true.
		   key.up;      // �꾩そ �붿궡�� �ㅻ� �낅젰�� 寃쎌슦 true.
		   key.down;    // �꾨옒履� �붿궡�� �ㅻ� �낅젰�� 寃쎌슦 true.
		   key.left;    // �쇱そ �붿궡�� �ㅻ� �낅젰�� 寃쎌슦 true.
		   key.right;   // �ㅻⅨ履� �붿궡�� �ㅻ� �낅젰�� 寃쎌슦 true.
		   key.enter;   // 由ы꽩�ㅻ� �뚮��쇰㈃ true
		   key.esc;   // ESC�ㅻ� �뚮��쇰㈃ true
		}
 */
nv.$Event.prototype.key = function() {
	//-@@$Event.key-@@//
	var e     = this._event;
	var k     = e.keyCode || e.charCode;
	var ret   = {
		keyCode : k,
		alt     : e.altKey,
		ctrl    : e.ctrlKey,
		meta    : e.metaKey,
		shift   : e.shiftKey,
		up      : (k == 38),
		down    : (k == 40),
		left    : (k == 37),
		right   : (k == 39),
		enter   : (k == 13),
		esc   : (k == 27)
	};

	this.key = function(){ return ret; };

	return ret;
};
//-!nv.$Event.prototype.key end!-//

//-!nv.$Event.prototype.pos start(nv.$Element.prototype.offset)!-//
/**
 	pos() 硫붿꽌�쒕뒗 留덉슦�� 而ㅼ꽌�� �꾩튂 �뺣낫瑜� �닿퀬 �덈뒗 媛앹껜瑜� 諛섑솚�쒕떎.

	@method pos
	@param {Boolean} [bGetOffset] �대깽�멸� 諛쒖깮�� �붿냼�먯꽌 留덉슦�� 而ㅼ꽌�� �곷� �꾩튂�� offsetX, offsetY 媛믪쓣 援ы븷 寃껋씤吏�瑜� 寃곗젙�� �뚮씪誘명꽣. bGetOffset 媛믪씠 true硫� 媛믪쓣 援ы븳��.
	@return {Object} 留덉슦�� 而ㅼ꽌�� �꾩튂 �뺣낫.
		@return {Number} .clientX �붾㈃�� 湲곗��쇰줈 留덉슦�� 而ㅼ꽌�� X醫뚰몴瑜� ���ν븳��.
		@return {Number} .clientY �붾㈃�� 湲곗��쇰줈 留덉슦�� 而ㅼ꽌�� Y醫뚰몴瑜� ���ν븳��.
		@return {Number} .offsetX DOM �붿냼瑜� 湲곗��쇰줈 留덉슦�� 而ㅼ꽌�� �곷��곸씤 X醫뚰몴瑜� ���ν븳��.
		@return {Number} .offsetY DOM �붿냼瑜� 湲곗��쇰줈 留덉슦�� 而ㅼ꽌�� �곷��곸씤 Y醫뚰몴瑜� ���ν븳��.
		@return {Number} .pageX 臾몄꽌瑜� 湲곗��쇰줈 留덉슦�� 而ㅼ꽌�� X 醫뚰몴瑜� ���ν븳��.
		@return {Number} .pageY 臾몄꽌瑜� 湲곗��쇰줈 留덉슦�� 而ㅼ꽌�� Y醫뚰몴瑜� ���ν븳��.
	@remark
		<ul class="disc">
			<li>pos() 硫붿꽌�쒕� �ъ슜�섎젮硫� Jindo �꾨젅�꾩썙�ъ뿉 $Element() 媛앹껜媛� �ы븿�섏뼱 �덉뼱�� �쒕떎.</li>
		</ul>
	@example
		function eventHandler(evt) {
		   var pos = evt.pos();

		   pos.clientX;  // �꾩옱 �붾㈃�� ���� X 醫뚰몴
		   pos.clientY;  // �꾩옱 �붾㈃�� ���� Y 醫뚰몴
		   pos.offsetX; // �대깽�멸� 諛쒖깮�� �섎━癒쇳듃�� ���� 留덉슦�� 而ㅼ꽌�� �곷��곸씤 X醫뚰몴 (1.2.0 �댁긽)
		   pos.offsetY; // �대깽�멸� 諛쒖깮�� �섎━癒쇳듃�� ���� 留덉슦�� 而ㅼ꽌�� �곷��곸씤 Y醫뚰몴 (1.2.0 �댁긽)
		   pos.pageX;  // 臾몄꽌 �꾩껜�� ���� X 醫뚰몴
		   pos.pageY;  // 臾몄꽌 �꾩껜�� ���� Y 醫뚰몴
		}
 */
nv.$Event.prototype.pos = function(bGetOffset) {
	//-@@$Event.pos-@@//
	g_checkVarType(arguments,{
		"voi" : [],
		"bol" : ["bGetOffset:Boolean"]
	});

	var e = this._posEvent;
	var doc = (this.srcElement.ownerDocument||document);
	var b = doc.body;
	var de = doc.documentElement;
	var pos = [b.scrollLeft || de.scrollLeft, b.scrollTop || de.scrollTop];
	var ret = {
		clientX: e.clientX,
		clientY: e.clientY,
		pageX: 'pageX' in e ? e.pageX : e.clientX+pos[0]-b.clientLeft,
		pageY: 'pageY' in e ? e.pageY : e.clientY+pos[1]-b.clientTop
	};

    /*
     �ㅽ봽�뗭쓣 援ы븯�� 硫붿꽌�쒖쓽 鍮꾩슜�� �щ�濡�, �붿껌�쒖뿉留� 援ы븯�꾨줉 �쒕떎.
     */
	if (bGetOffset && nv.$Element) {
		var offset = nv.$Element(this.srcElement).offset();
		ret.offsetX = ret.pageX - offset.left;
		ret.offsetY = ret.pageY - offset.top;
	}

	return ret;
};
//-!nv.$Event.prototype.pos end!-//

//-!nv.$Event.prototype.stop start!-//
/**
 	stop() 硫붿꽌�쒕뒗 �대깽�몄쓽 踰꾨툝留곴낵 湲곕낯 �숈옉�� 以묒��쒗궓��. 踰꾨툝留곸� �뱀젙 HTML �섎━癒쇳듃�먯꽌 �대깽�멸� 諛쒖깮�덉쓣 �� �대깽�멸� �곸쐞 �몃뱶濡� �꾪뙆�섎뒗 �꾩긽�대떎. �덈� �ㅼ뼱, &lt;div&gt; �붿냼瑜� �대┃�� �� &lt;div&gt; �붿냼�� �④퍡 �곸쐞 �붿냼�� document �붿냼�먮룄 onclick �대깽�멸� 諛쒖깮�쒕떎. stop() 硫붿꽌�쒕뒗 吏��뺥븳 媛앹껜�먯꽌留� �대깽�멸� 諛쒖깮�섎룄濡� 踰꾨툝留곸쓣 李⑤떒�쒕떎.

	@method stop
	@param {Numeric} [nCancelConstant=$Event.CANCEL_ALL] $Event() 媛앹껜�� �곸닔. 吏��뺥븳 �곸닔�� �곕씪 �대깽�몄쓽 踰꾨툝留곴낵 湲곕낯 �숈옉�� �좏깮�섏뿬 以묒��쒗궓��. (1.1.3 踰꾩쟾遺��� 吏���).
		@param {Numeric} [nCancelConstant.$Event.CANCEL_ALL] 踰꾨툝留곴낵 湲곕낯 �숈옉�� 紐⑤몢 以묒�
		@param {Numeric} nCancelConstant.$Event.CANCEL_BUBBLE 踰꾨툝留곸쓣 以묒�
		@param {Numeric} nCancelConstant.$Event.CANCEL_DEFAULT 湲곕낯 �숈옉�� 以묒�
	@return {this} 李쎌쓽 踰꾨툝留곴낵 湲곕낯 �숈옉�� 以묒��� �몄뒪�댁뒪 �먯떊
	@see nv.$Event.CANCEL_ALL
	@see nv.$Event.CANCEL_BUBBLE
	@see nv.$Event.CANCEL_DEFAULT
	@example
		// 湲곕낯 �숈옉留� 以묒��쒗궎怨� �띠쓣 �� (1.1.3踰꾩쟾 �댁긽)
		function stopDefaultOnly(evt) {
			// Here is some code to execute

			// Stop default event only
			evt.stop($Event.CANCEL_DEFAULT);
		}
 */
nv.$Event.prototype.stop = function(nCancel) {
	//-@@$Event.stop-@@//
	g_checkVarType(arguments,{
		"voi" : [],
		"num" : ["nCancel:Numeric"]
	});
	nCancel = nCancel || nv.$Event.CANCEL_ALL;

	var e = (window.event && window.event == this._globalEvent)?this._globalEvent:this._event;
	var b = !!(nCancel & nv.$Event.CANCEL_BUBBLE); // stop bubbling
	var d = !!(nCancel & nv.$Event.CANCEL_DEFAULT); // stop default event
	var type = this.realType;
	if(b&&(type==="focusin"||type==="focusout")){
	    nv.$Jindo._warn("The "+type +" event can't stop bubble.");
	}

	this.canceled = true;

	if(d){
	    if(e.preventDefault !== undefined){
	        e.preventDefault();
	    }else{
	        e.returnValue = false;
	    }
	}

	if(b){
	    if(e.stopPropagation !== undefined){
	        e.stopPropagation();
	    }else{
	        e.cancelBubble = true;
	    }
	}

	return this;
};

/**
 	stopDefault() 硫붿꽌�쒕뒗 �대깽�몄쓽 湲곕낯 �숈옉�� 以묒��쒗궓��. stop() 硫붿꽌�쒖쓽 �뚮씪誘명꽣濡� CANCEL_DEFAULT 媛믪쓣 �낅젰�� 寃껉낵 媛숇떎.

	@method stopDefault
	@return {this} �대깽�몄쓽 湲곕낯 �숈옉�� 以묒��� �몄뒪�댁뒪 �먯떊
	@see nv.$Event#stop
	@see nv.$Event.CANCEL_DEFAULT
 */
nv.$Event.prototype.stopDefault = function(){
	return this.stop(nv.$Event.CANCEL_DEFAULT);
};

/**
 	stopBubble() 硫붿꽌�쒕뒗 �대깽�몄쓽 踰꾨툝留곸쓣 以묒��쒗궓��. stop() 硫붿꽌�쒖쓽 �뚮씪誘명꽣濡� CANCEL_BUBBLE 媛믪쓣 �낅젰�� 寃껉낵 媛숇떎.

	@method stopBubble
	@return {this} �대깽�몄쓽 踰꾨툝留곸쓣 以묒��� �몄뒪�댁뒪 �먯떊
	@see nv.$Event#stop
	@see nv.$Event.CANCEL_BUBBLE
 */
nv.$Event.prototype.stopBubble = function(){
	return this.stop(nv.$Event.CANCEL_BUBBLE);
};

/**
 	CANCEL_BUBBLE�� stop() 硫붿꽌�쒖뿉�� 踰꾨툝留곸쓣 以묒��쒗궗 �� �ъ슜�섎뒗 �곸닔�대떎.

	@property CANCEL_BUBBLE
	@static
	@constant
	@type Number
	@default 1
	@see nv.$Event#stop
	@final
 */
nv.$Event.CANCEL_BUBBLE = 1;

/**
 	CANCEL_DEFAULT�� stop() 硫붿꽌�쒖뿉�� 湲곕낯 �숈옉�� 以묒��쒗궗 �� �ъ슜�섎뒗 �곸닔�대떎.

	@property CANCEL_DEFAULT
	@static
	@constant
	@type Number
	@default 2
	@see nv.$Event#stop
	@final
 */
nv.$Event.CANCEL_DEFAULT = 2;

/**
 	CANCEL_ALL�� stop() 硫붿꽌�쒖뿉�� 踰꾨툝留곴낵 湲곕낯 �숈옉�� 紐⑤몢 以묒��쒗궗 �� �ъ슜�섎뒗 �곸닔�대떎.

	@property CANCEL_ALL
	@static
	@constant
	@type Number
	@default 3
	@see nv.$Event#stop
	@final
 */
nv.$Event.CANCEL_ALL = 3;
//-!nv.$Event.prototype.stop end!-//

//-!nv.$Event.prototype.$value start!-//
/**
 	$value 硫붿꽌�쒕뒗 �먮낯 Event 媛앹껜瑜� 由ы꽩�쒕떎

	@method $value
	@return {Event} �먮낯 Event 媛앹껜
	@example
		function eventHandler(evt){
			evt.$value();
		}
 */
nv.$Event.prototype.$value = function() {
	//-@@$Event.$value-@@//
	return this._event;
};
//-!nv.$Event.prototype.$value end!-//

//-!nv.$Event.prototype.changedTouch start(nv.$Event.prototype.targetTouch,nv.$Event.prototype.touch)!-//
/**
 	紐⑤컮�쇱뿉�� touch愿��� �대깽�몃� �ъ슜�� changeTouches媛앹껜瑜� 醫� �� �쎄쾶 �ъ슜�섎룄濡� �쒕떎.

	@method changedTouch
	@param {Numeric} [nIndex] �몃뜳�� 踰덊샇, �� �듭뀡�� 吏��뺥븯吏� �딆쑝硫� 媛곸쥌 �뺣낫 �곗씠�곌� �ㅼ뼱�덈뒗 諛곗뿴�� 由ы꽩�쒕떎.
	@return {Array | Hash} 媛곸쥌 �뺣낫 �곗씠�곌� �ㅼ뼱�덈뒗 諛곗뿴 �먮뒗 媛곸쥌 �뺣낫 �곗씠��
	@throws {$Except.NOT_SUPPORT_METHOD} �곗뒪�ы깙�먯꽌 �ъ슜�� �� �덉쇅�곹솴 諛쒖깮.
	@filter mobile
	@since 2.0.0
	@see nv.$Event#targetTouch
	@see nv.$Event#pos
	@example
		$Element("only_mobile").attach("touchstart",function(e){
			e.changedTouch(0);
			{
			   "id" : "123123",// identifier
			   "event" : $Event,// $Event
			   "element" : element, // �대떦 �섎━癒쇳듃
			   "pos" : function(){}//  硫붿꽌�� (Pos硫붿꽌�쒓낵 媛숈쓬)
			}

		 	e.changedTouch();
			[
				{
				   "id" : "123123",
				   "event" : $Event,
				   "element" : element,
				   "pos" : function(){}
				},
				{
				   "id" : "123123",
				   "event" : $Event,
				   "element" : element,
				   "pos" : function(){}
				}
			]
		 });
 */
(function(aType){
	var sTouches = "Touch", sMethod = "";

	for(var i=0, l=aType.length; i < l; i++) {
        sMethod = aType[i]+sTouches;
        if(!aType[i]) { sMethod = sMethod.toLowerCase(); }

		nv.$Event.prototype[sMethod] = (function(sType) {
			return function(nIndex) {
				if(this.isTouch) {
					var oRet = [];
					var ev = this._event[sType+"es"];
					var l = ev.length;
					var e;
					for(var i = 0; i < l; i++){
						e = ev[i];
						oRet.push({
							"id" : e.identifier,
							"event" : this,
							"element" : e.target,
							"_posEvent" : e,
							"pos" : nv.$Event.prototype.pos
						});
					}
					this[sType] = function(nIndex) {
						var oArgs = g_checkVarType(arguments, {
							'void' : [  ],
							'4num' : [ 'nIndex:Numeric' ]
						},"$Event#"+sType);
						if(oArgs+"" == 'void') return oRet;

						return oRet[nIndex];
					};
				} else {
					this[sType] = function(nIndex) {
						throw new nv.$Error(nv.$Except.NOT_SUPPORT_METHOD,"$Event#"+sType);
					};
				}

				return this[sType].apply(this,nv._p_._toArray(arguments));
			};
		})(sMethod);
	}
})(["changed","target",""]);
//-!nv.$Event.prototype.changedTouch end!-//

//-!nv.$Event.prototype.targetTouch start(nv.$Event.prototype.changedTouch)!-//
/**
 	紐⑤컮�쇱뿉�� touch愿��� �대깽�몃� �ъ슜�� targetTouches媛앹껜瑜� 醫� �� �쎄쾶 �ъ슜�섎룄濡� �쒕떎.

	@method targetTouch
	@param {Numeric} [nIndex] �몃뜳�� 踰덊샇, �� �듭뀡�� 吏��뺥븯吏� �딆쑝硫� 媛곸쥌 �뺣낫 �곗씠�곌� �ㅼ뼱�덈뒗 諛곗뿴�� 由ы꽩�쒕떎.
	@return {Array | Hash} 媛곸쥌 �뺣낫 �곗씠�곌� �ㅼ뼱�덈뒗 諛곗뿴 �먮뒗 媛곸쥌 �뺣낫 �곗씠��
	@throws {$Except.NOT_SUPPORT_METHOD} �곗뒪�ы깙�먯꽌 �ъ슜�� �� �덉쇅�곹솴 諛쒖깮.
	@filter mobile
	@since 2.0.0
	@see nv.$Event#changedTouch
	@see nv.$Event#pos
	@example
		$Element("only_mobile").attach("touchstart",function(e){
			e.targetTouch(0);
			{
			   "id" : "123123",// identifier
			   "event" : $Event,// $Event
			   "element" : element, // �대떦 �섎━癒쇳듃
			   "pos" : function(){}//  硫붿꽌�� (Pos硫붿꽌�쒓낵 媛숈쓬)
			}

			e.targetTouch();
			[
				{
				   "id" : "123123",
				   "event" : $Event,
				   "element" : element,
				   "pos" : function(){}
				},
				{
				   "id" : "123123",
				   "event" : $Event,
				   "element" : element,
				   "pos" : function(){}
				}
			]
		 });
 */
//-!nv.$Event.prototype.targetTouch end!-//

//-!nv.$Event.prototype.touch start(nv.$Event.prototype.changedTouch)!-//
/**
 	紐⑤컮�쇱뿉�� touch愿��� �대깽�몃� �ъ슜�� touches媛앹껜瑜� 醫� �� �쎄쾶 �ъ슜�섎룄濡� �쒕떎.

	@method touch
	@param {Numeric} [nIndex] �몃뜳�� 踰덊샇, �� �듭뀡�� 吏��뺥븯吏� �딆쑝硫� 媛곸쥌 �뺣낫 �곗씠�곌� �ㅼ뼱�덈뒗 諛곗뿴�� 由ы꽩�쒕떎.
	@return {Array | Hash} 媛곸쥌 �뺣낫 �곗씠�곌� �ㅼ뼱�덈뒗 諛곗뿴 �먮뒗 媛곸쥌 �뺣낫 �곗씠��
	@throws {$Except.NOT_SUPPORT_METHOD} �곗뒪�ы깙�먯꽌 �ъ슜�� �� �덉쇅�곹솴 諛쒖깮.
	@filter mobile
	@since 2.0.0
	@see nv.$Event#changedTouch
	@see nv.$Event#pos
	@example
		$Element("only_mobile").attach("touchstart",function(e){
			e.touch(0);
			{
			   "id" : "123123",// identifier
			   "event" : $Event,// $Event
			   "element" : element, // �대떦 �섎━癒쇳듃
			   "pos" : function(){}//  硫붿꽌�� (Pos硫붿꽌�쒓낵 媛숈쓬)
			}

			e.touch();
			[
				{
				   "id" : "123123",
				   "event" : $Event,
				   "element" : element,
				   "pos" : function(){}
				},
				{
				   "id" : "123123",
				   "event" : $Event,
				   "element" : element,
				   "pos" : function(){}
				}
			]
		 });
 */
//-!nv.$Event.prototype.touch end!-//

/**
 	@fileOverview $Element�� �앹꽦�� 諛� 硫붿꽌�쒕� �뺤쓽�� �뚯씪
	@name element.js
	@author NAVER Ajax Platform
 */
//-!nv.$Element start(nv.$)!-//
/**
 	nv.$Element() 媛앹껜�� HTML �붿냼瑜� �섑븨(wrapping)�섎ŉ, �대떦 �붿냼瑜� 醫� �� �쎄쾶 �ㅻ０ �� �덈뒗 湲곕뒫�� �쒓났�쒕떎.

	@class nv.$Element
	@keyword element, �섎━癒쇳듃
 */
/**
 	nv.$Element() 媛앹껜瑜� �앹꽦�쒕떎.

	@constructor
	@param {Variant} vElement nv.$Element() 媛앹껜 �앹꽦�먮뒗 臾몄옄��(String), HTML �붿냼(Element+|Node|Document+|Window+), �먮뒗 nv.$Element() 媛앹껜瑜� �뚮씪誘명꽣濡� 吏��뺥븷 �� �덈떎.<br>
		<ul class="disc">
			<li>�뚮씪誘명꽣媛� 臾몄옄�댁씠硫� �� 媛�吏� 諛⑹떇�쇰줈 �숈옉�쒕떎.
				<ul class="disc">
					<li>留뚯씪 "&lt;tagName&gt;"怨� 媛숈� �뺤떇�� 臾몄옄�댁씠硫� tagName�� 媛�吏��� 媛앹껜瑜� �앹꽦�쒕떎.</li>
					<li>洹� �댁쇅�� 寃쎌슦 吏��뺥븳 臾몄옄�댁쓣 ID濡� 媛뽯뒗 HTML �붿냼瑜� �ъ슜�섏뿬 nv.$Element() 媛앹껜瑜� �앹꽦�쒕떎.</li>
				</ul>
			</li>
			<li>�뚮씪誘명꽣媛� HTML �붿냼�대㈃ �대떦 �붿냼瑜� �섑븨�섏뿬 $Element() 瑜� �앹꽦�쒕떎.</li>
			<li>�뚮씪誘명꽣媛� $Element()�대㈃ �꾨떖�� �뚮씪誘명꽣瑜� 洹몃�濡� 諛섑솚�쒕떎.</li>
			<li>�뚮씪誘명꽣媛� undefined �뱀� null�� 寃쎌슦 null�� 諛섑솚�쒕떎.</li>
		</ul>
	@return {nv.$Element} �앹꽦�� nv.$Element() 媛앹껜.
	@example
		var element = $Element($("box")); // HTML �붿냼瑜� �뚮씪誘명꽣濡� 吏���
		var element = $Element("box"); // HTML �붿냼�� id瑜� �뚮씪誘명꽣濡� 吏���
		var element = $Element("<div>"); // �쒓렇瑜� �뚮씪誘명꽣濡� 吏���, DIV �섎━癒쇳듃瑜� �앹꽦�섏뿬 �섑븨��
 */
nv.$Element = function(el) {
    //-@@$Element-@@//
    var cl = arguments.callee;
    if (el && el instanceof cl) return el;

    if (!(this instanceof cl)){
        try {
            nv.$Jindo._maxWarn(arguments.length, 1,"$Element");
            return new cl(el);
        } catch(e) {
            if (e instanceof TypeError) { return null; }
            throw e;
        }
    }
    var cache = nv.$Jindo;
    var oArgs = cache.checkVarType(arguments, {
        '4str' : [ 'sID:String+' ],
        '4nod' : [ 'oEle:Node' ],
        '4doc' : [ 'oEle:Document+' ],
        '4win' : [ 'oEle:Window+' ]
    },"$Element");
    switch(oArgs + ""){
        case "4str":
            el = nv.$(el);
            break;
        default:
            el = oArgs.oEle;
    }

    this._element = el;
    if(this._element != null){
        if(this._element.__nv__id){
            this._key = this._element.__nv__id;
        }else{
            try{
                this._element.__nv__id = this._key = nv._p_._makeRandom();
            }catch(e){}
        }
        // tagname
        this.tag = (this._element.tagName||'').toLowerCase();
    }else{
        throw new TypeError("{not_found_element}");
    }

};
nv._p_.NONE_GROUP = "_nv_event_none";
nv._p_.splitEventSelector = function(sEvent){
    var matches = sEvent.match(/^([a-z_]*)(.*)/i);
    var eventName = nv._p_.trim(matches[1]);
    var selector = nv._p_.trim(matches[2].replace("@",""));
    return {
        "type"      : selector?"delegate":"normal",
        "event"     : eventName,
        "selector"  : selector
    };
};
nv._p_._makeRandom = function(){
    return "e"+ new Date().getTime() + parseInt(Math.random() * 100000000,10);
};

nv._p_.releaseEventHandlerForAllChildren = function(wel){
	var children = wel._element.all || wel._element.getElementsByTagName("*"),
		nChildLength = children.length,
		elChild = null,
		i;

	for(i = 0; i < nChildLength; i++){
		elChild = children[i];

		if(elChild.nodeType == 1 && elChild.__nv__id){
			nv.$Element.eventManager.cleanUpUsingKey(elChild.__nv__id, true);
		}
	}

	children = elChild = null;
};

nv._p_.canUseClassList = function(){
    var result = "classList" in document.body&&"classList" in document.createElementNS("http://www.w3.org/2000/svg", "g");
    nv._p_.canUseClassList = function(){
        return result;
    };
    return nv._p_.canUseClassList();
};

nv._p_.vendorPrefixObj = {
    "-moz" : "Moz",
    "-ms" : "ms",
    "-o" : "O",
    "-webkit" : "webkit"
};

nv._p_.cssNameToJavaScriptName = function(sName){
    if(/^(\-(?:moz|ms|o|webkit))/.test(sName)){
        var vandorPerfix = RegExp.$1;
        sName = sName.replace(vandorPerfix,nv._p_.vendorPrefixObj[vandorPerfix]);
    }

    return sName.replace(/(:?-(\w))/g,function(_,_,m){
       return m.toUpperCase();
    });
};

//-!nv.$Element._getTransition.hidden start!-//
/**
 {{sign_getTransition}}
 */

nv._p_.getStyleIncludeVendorPrefix = function(_test){
    var styles = ["Transition","Transform","Animation","Perspective"];
    var vendors = ["webkit","-","Moz","O","ms"];

    // when vender prefix is not present,  the value will be taken from  prefix
    var style  = "";
    var vendor = "";
    var vendorStyle = "";
    var result = {};

    var styleObj = _test||document.body.style;
    for(var i = 0, l = styles.length; i < l; i++){
        style = styles[i];

        for(var j = 0, m = vendors.length; j < m; j++ ){
            vendor = vendors[j];
            vendorStyle = vendor!="-"?(vendor+style):style.toLowerCase();
            if(typeof styleObj[vendorStyle] !== "undefined"){
                result[style.toLowerCase()] = vendorStyle;
                break;
            }
            result[style.toLowerCase()] = false;
        }
    }

    if(_test){
        return result;
    }

    nv._p_.getStyleIncludeVendorPrefix = function(){
        return result;
    };

    return nv._p_.getStyleIncludeVendorPrefix();
};

nv._p_.getTransformStringForValue = function(_test){
    var info = nv._p_.getStyleIncludeVendorPrefix(_test);
    var transform = info.transform ;
    if(info.transform === "MozTransform"){
        transform = "-moz-transform";
    }else if(info.transform === "webkitTransform"){
        transform = "-webkit-transform";
    }else if(info.transform === "OTransform"){
        transform = "-o-transform";
    }else if(info.transform === "msTransform"){
        transform = "-ms-transform";
    }

    if(_test){
        return transform;
    }

    nv._p_.getTransformStringForValue = function(){
        return transform;
    };

    return nv._p_.getTransformStringForValue();
};
/*
 {{disappear_1}}
 */
// To prevent blink issue on Android 4.0.4 Samsung Galaxy 2 LTE model, calculate offsetHeight first
nv._p_.setOpacity = function(ele,val){
    ele.offsetHeight;
    ele.style.opacity = val;
};
//-!nv.$Element._getTransition.hidden end!-//

/**
 	@method _eventBind
	@ignore
 */
nv.$Element._eventBind = function(oEle,sEvent,fAroundFunc,bUseCapture){
    if(oEle.addEventListener){
        if(document.documentMode == 9){
            nv.$Element._eventBind = function(oEle,sEvent,fAroundFunc,bUseCapture){
                if(/resize/.test(sEvent) ){
                    oEle.attachEvent("on"+sEvent,fAroundFunc);
                }else{
                    oEle.addEventListener(sEvent, fAroundFunc, !!bUseCapture);
                }
            };
        }else{
            nv.$Element._eventBind = function(oEle,sEvent,fAroundFunc,bUseCapture){
                oEle.addEventListener(sEvent, fAroundFunc, !!bUseCapture);
            };
        }
    }else{
        nv.$Element._eventBind = function(oEle,sEvent,fAroundFunc){
            oEle.attachEvent("on"+sEvent,fAroundFunc);
        };
    }
    nv.$Element._eventBind(oEle,sEvent,fAroundFunc,bUseCapture);
};

/**
 	@method _unEventBind
	@ignore
 */
nv.$Element._unEventBind = function(oEle,sEvent,fAroundFunc){
    if(oEle.removeEventListener){
        if(document.documentMode == 9){
            nv.$Element._unEventBind = function(oEle,sEvent,fAroundFunc){
                if(/resize/.test(sEvent) ){
                    oEle.detachEvent("on"+sEvent,fAroundFunc);
                }else{
                    oEle.removeEventListener(sEvent,fAroundFunc,false);
                }
            };
        }else{
            nv.$Element._unEventBind = function(oEle,sEvent,fAroundFunc){
                oEle.removeEventListener(sEvent,fAroundFunc,false);
            };
        }
    }else{
        nv.$Element._unEventBind = function(oEle,sEvent,fAroundFunc){
            oEle.detachEvent("on"+sEvent,fAroundFunc);
        };
    }
    nv.$Element._unEventBind(oEle,sEvent,fAroundFunc);
};
//-!nv.$Element end!-//


//-!nv.$Element.prototype.$value start!-//
/**
 	$value() 硫붿꽌�쒕뒗 �먮옒�� HTML �붿냼瑜� 諛섑솚�쒕떎.

	@method $value
	@return {Element} nv.$Element() 媛앹껜媛� 媛먯떥怨� �덈뒗 �먮낯 �붿냼.
	@see nv.$Element
	@example
		var element = $Element("sample_div");
		element.$value(); // �먮옒�� �섎━癒쇳듃媛� 諛섑솚�쒕떎.
 */
nv.$Element.prototype.$value = function() {
    //-@@$Element.$value-@@//
    return this._element;
};
//-!nv.$Element.prototype.$value end!-//

//-!nv.$Element.prototype.visible start(nv.$Element.prototype._getCss,nv.$Element.prototype.show,nv.$Element.prototype.hide)!-//
/**
 	visible() 硫붿꽌�쒕뒗 HTML �붿냼�� display �띿꽦�� 議고쉶�쒕떎.

	@method visible
	@return {Boolean} display �щ�. display �띿꽦�� none�대㈃ false 媛믪쓣 諛섑솚�쒕떎.
	@example
		<div id="sample_div" style="display:none">Hello world</div>

		// 議고쉶
		$Element("sample_div").visible(); // false
 */
/**
 	visible() 硫붿꽌�쒕뒗 HTML �붿냼�� display �띿꽦�� �ㅼ젙�쒕떎.

	@method visible
	@param {Boolean} bVisible �대떦 �붿냼�� �쒖떆 �щ�.<br>�낅젰�� �뚮씪誘명꽣媛� true�� 寃쎌슦 display �띿꽦�� �ㅼ젙�섍퀬, false�� 寃쎌슦�먮뒗 display �띿꽦�� none�쇰줈 蹂�寃쏀븳��. Boolean�� �꾨땶 媛믪씠 �ㅼ뼱�� 寃쎌슦�� ToBoolean�� 寃곌낵瑜� 湲곗��쇰줈 蹂�寃쏀븳��.
	@param {String+} sDisplay �대떦 �붿냼�� display �띿꽦 媛�.<br>bVisible �뚮씪誘명꽣媛� true �대㈃ sDisplay 媛믪쓣 display �띿꽦�쇰줈 �ㅼ젙�쒕떎.
	@return {this} display �띿꽦�� 蹂�寃쏀븳 �몄뒪�댁뒪 �먯떊
	@remark
		<ul class="disc">
			<li>1.1.2 踰꾩쟾遺��� bVisible �뚮씪誘명꽣瑜� �ъ슜�� �� �덈떎.</li>
			<li>1.4.5 踰꾩쟾遺��� sDisplay �뚮씪誘명꽣瑜� �ъ슜�� �� �덈떎.</li>
		</ul>
	@see http://www.w3.org/TR/2008/REC-CSS2-20080411/visuren.html#display-prop display �띿꽦 - W3C CSS2 Specification
	@see nv.$Element#show
	@see nv.$Element#hide
	@see nv.$Element#toggle
	@example
		// �붾㈃�� 蹂댁씠�꾨줉 �ㅼ젙
		$Element("sample_div").visible(true, 'block');

		//Before
		<div id="sample_div" style="display:none">Hello world</div>

		//After
		<div id="sample_div" style="display:block">Hello world</div>
 */
nv.$Element.prototype.visible = function(bVisible, sDisplay) {
    //-@@$Element.visible-@@//
    var oArgs = g_checkVarType(arguments, {
        'g' : [  ],
        's4bln' : [ nv.$Jindo._F('bVisible:Boolean') ],
        's4str' : [ 'bVisible:Boolean', "sDisplay:String+"]
    },"$Element#visible");
    switch(oArgs+""){
        case "g":
            return (this._getCss(this._element,"display") != "none");

        case "s4bln":
            this[bVisible?"show":"hide"]();
            return this;

        case "s4str":
            this[bVisible?"show":"hide"](sDisplay);
            return this;

    }
};
//-!nv.$Element.prototype.visible end!-//

//-!nv.$Element.prototype.show start!-//
/**
 	show() 硫붿꽌�쒕뒗 HTML �붿냼媛� �붾㈃�� 蹂댁씠�꾨줉 display �띿꽦�� 蹂�寃쏀븳��.

	@method show
	@param {String+} [sDisplay] display �띿꽦�� 吏��뺥븷 媛�.<br>�뚮씪誘명꽣瑜� �앸왂�섎㈃ �쒓렇蹂꾨줈 誘몃━ 吏��뺣맂 湲곕낯媛믪씠 �띿꽦 媛믪쑝濡� �ㅼ젙�쒕떎. 誘몃━ 吏��뺣맂 湲곕낯媛믪씠 �놁쑝硫� "inline"�쇰줈 �ㅼ젙�쒕떎. �먮윭媛� 諛쒖깮�� 寃쎌슦�� "block"�쇰줈 �ㅼ젙�쒕떎.
	@return {this} display �띿꽦�� 蹂�寃쏀븳 �몄뒪�댁뒪 �먯떊
	@remark 1.4.5 踰꾩쟾遺��� sDisplay �뚮씪誘명꽣瑜� �ъ슜�� �� �덈떎.
	@see http://www.w3.org/TR/2008/REC-CSS2-20080411/visuren.html#display-prop display �띿꽦 - W3C CSS2 Specification
	@see nv.$Element#hide
	@see nv.$Element#toggle
	@see nv.$Element#visible
	@example
		// �붾㈃�� 蹂댁씠�꾨줉 �ㅼ젙
		$Element("sample_div").show();

		//Before
		<div id="sample_div" style="display:none">Hello world</div>

		//After
		<div id="sample_div" style="display:block">Hello world</div>
 */
nv.$Element.prototype.show = function(sDisplay) {
    //-@@$Element.show-@@//
    var oArgs = g_checkVarType(arguments, {
        '4voi' : [  ],
        '4str' : ["sDisplay:String+"]
    },"$Element#show");


    var s = this._element.style;
    var b = "block";
    var c = { p:b,div:b,form:b,h1:b,h2:b,h3:b,h4:b,ol:b,ul:b,fieldset:b,td:"table-cell",th:"table-cell",
              li:"list-item",table:"table",thead:"table-header-group",tbody:"table-row-group",tfoot:"table-footer-group",
              tr:"table-row",col:"table-column",colgroup:"table-column-group",caption:"table-caption",dl:b,dt:b,dd:b};
    try {
        switch(oArgs+""){
            case "4voi":
                var type = c[this.tag];
                s.display = type || "inline";
                break;
            case "4str":
                s.display = sDisplay;

        }
    } catch(e) {
        /*
         IE�먯꽌 sDisplay媛믪씠 鍮꾩젙�곸쟻�쇰븣 block濡� �뗮똿�쒕떎.
         */
        s.display = "block";
    }

    return this;
};
//-!nv.$Element.prototype.show end!-//

//-!nv.$Element.prototype.hide start!-//
/**
 	hide() 硫붿꽌�쒕뒗 HTML �붿냼媛� �붾㈃�� 蹂댁씠吏� �딅룄濡� display �띿꽦�� none�쇰줈 蹂�寃쏀븳��.

	@method hide
	@return {this} display �띿꽦�� none�쇰줈 蹂�寃쏀븳 �몄뒪�댁뒪 �먯떊
	@see http://www.w3.org/TR/2008/REC-CSS2-20080411/visuren.html#display-prop display �띿꽦 - W3C CSS2 Specification
	@see nv.$Element#show
	@see nv.$Element#toggle
	@see nv.$Element#visible
	@example
		// �붾㈃�� 蹂댁씠吏� �딅룄濡� �ㅼ젙
		$Element("sample_div").hide();

		//Before
		<div id="sample_div" style="display:block">Hello world</div>

		//After
		<div id="sample_div" style="display:none">Hello world</div>
 */
nv.$Element.prototype.hide = function() {
    //-@@$Element.hide-@@//
    this._element.style.display = "none";

    return this;
};
//-!nv.$Element.prototype.hide end!-//

//-!nv.$Element.prototype.toggle start(nv.$Element.prototype._getCss,nv.$Element.prototype.show,nv.$Element.prototype.hide)!-//
/**
 	toggle() 硫붿꽌�쒕뒗 HTML �붿냼�� display �띿꽦�� 蹂�寃쏀븯�� �대떦 �붿냼瑜� �붾㈃�� 蹂댁씠嫄곕굹, 蹂댁씠吏� �딄쾶 �쒕떎. �� 硫붿꽌�쒕뒗 留덉튂 �ㅼ쐞移섎� 耳쒓퀬 �꾨뒗 寃껉낵 媛숈씠 �붿냼�� �쒖떆 �щ�瑜� 諛섏쟾�쒗궓��.

	@method toggle
	@param {String+} [sDisplay] �대떦 �붿냼媛� 蹂댁씠�꾨줉 蹂�寃쏀븷 �� display �띿꽦�� 吏��뺥븷 媛�. �뚮씪誘명꽣瑜� �앸왂�섎㈃ �쒓렇蹂꾨줈 誘몃━ 吏��뺣맂 湲곕낯媛믪씠 �띿꽦 媛믪쑝濡� �ㅼ젙�쒕떎. 誘몃━ 吏��뺣맂 湲곕낯媛믪씠 �놁쑝硫� "inline"�쇰줈 �ㅼ젙�쒕떎.
	@return {this} display �띿꽦�� 蹂�寃쏀븳 �몄뒪�댁뒪 �먯떊
	@remark 1.4.5 踰꾩쟾遺��� 蹂댁씠�꾨줉 �ㅼ젙�� �� sDisplay 媛믪쑝濡� display �띿꽦 媛� 吏��뺤씠 媛��ν븯��.
	@see http://www.w3.org/TR/2008/REC-CSS2-20080411/visuren.html#display-prop display �띿꽦 - W3C CSS2 Specification
	@see nv.$Element#show
	@see nv.$Element#hide
	@see nv.$Element#visible
	@example
		// �붾㈃�� 蹂댁씠嫄곕굹, 蹂댁씠吏� �딅룄濡� 泥섎━
		$Element("sample_div1").toggle();
		$Element("sample_div2").toggle();

		//Before
		<div id="sample_div1" style="display:block">Hello</div>
		<div id="sample_div2" style="display:none">Good Bye</div>

		//After
		<div id="sample_div1" style="display:none">Hello</div>
		<div id="sample_div2" style="display:block">Good Bye</div>
 */
nv.$Element.prototype.toggle = function(sDisplay) {
    //-@@$Element.toggle-@@//
    var oArgs = g_checkVarType(arguments, {
        '4voi' : [  ],
        '4str' : ["sDisplay:String+"]
    },"$Element#toggle");

    this[this._getCss(this._element,"display")=="none"?"show":"hide"].apply(this,arguments);
    return this;
};
//-!nv.$Element.prototype.toggle end!-//

//-!nv.$Element.prototype.opacity start!-//
/**
 	opacity() 硫붿꽌�쒕뒗 HTML �붿냼�� �щ챸��(opacity �띿꽦) 媛믪쓣 媛��몄삩��.

	@method opacity
	@return {Numeric} opacity媛믪쓣 諛섑솚�쒕떎.
	@example
		<div id="sample" style="background-color:#2B81AF; width:20px; height:20px;"></div>

		// 議고쉶
		$Element("sample").opacity();	// 1
 */
/**
 	opacity() 硫붿꽌�쒕뒗 HTML �붿냼�� �щ챸��(opacity �띿꽦) 媛믪쓣 �ㅼ젙�쒕떎.

	@method opacity
	@param {Variant} vValue �ㅼ젙�� �щ챸�� 媛�(String|Numeric). �щ챸�� 媛믪� 0�먯꽌 1 �ъ씠�� �ㅼ닔 媛믪쑝濡� 吏��뺥븳��. 吏��뺥븳 �뚮씪誘명꽣�� 媛믪씠 0蹂대떎 �묒쑝硫� 0��, 1蹂대떎 �щ㈃ 1�� �ㅼ젙�쒕떎. 鍮덈Ц�먯뿴�� 寃쎌슦, �ㅼ젙�� opacity �띿꽦�� �쒓굅�쒕떎.
	@return {this} opacity �띿꽦�� 蹂�寃쏀븳 �몄뒪�댁뒪 �먯떊
	@example
		// �щ챸�� 媛� �ㅼ젙
		$Element("sample").opacity(0.4);

		//Before
		<div style="background-color: rgb(43, 129, 175); width: 20px; height: 20px;" id="sample"></div>

		//After
		<div style="background-color: rgb(43, 129, 175); width: 20px; height: 20px; opacity: 0.4;" id="sample"></div>
 */
nv.$Element.prototype.opacity = function(value) {
    //-@@$Element.opacity-@@//
    var oArgs = g_checkVarType(arguments, {
                'g' : [  ],
                's' : ["nOpacity:Numeric"],
                'str' : ['sOpacity:String']
            },"$Element#opacity"),
        e = this._element,
        b = (this._getCss(e,"display") != "none"), v;

    switch(oArgs+""){
        case "g":
            if(typeof e.style.opacity != 'undefined' && (v = e.style.opacity).length || (v = this._getCss(e,"opacity"))) {
                v = parseFloat(v);
                if (isNaN(v)) v = b?1:0;
            } else {
                v = typeof e.filters.alpha == 'undefined'?(b?100:0):e.filters.alpha.opacity;
                v = v / 100;
            }
            return v;

        case "s":
             /*
             IE�먯꽌 layout�� 媛�吏�怨� �덉� �딆쑝硫� opacity媛� �곸슜�섏� �딆쓬.
             */
            value = oArgs.nOpacity;
            e.style.zoom = 1;
            value = Math.max(Math.min(value,1),0);

            if (typeof e.style.opacity != 'undefined') {
                e.style.opacity = value;
            } else {
                value = Math.ceil(value*100);

                if (typeof e.filters != 'unknown' && typeof e.filters.alpha != 'undefined') {
                    e.filters.alpha.opacity = value;
                } else {
                    e.style.filter = (e.style.filter + " alpha(opacity=" + value + ")");
                }
            }
            return this;

        case "str":
             /*
             �뚮씪誘명꽣 媛믪씠 鍮꾩뼱�덈뒗 臾몄옄�� 寃쎌슦, opacity �띿꽦�� �쒓굅�쒕떎.
             */
            if(value === "") {
                e.style.zoom = e.style.opacity = "";
            }
            return this;
    }

};
//-!nv.$Element.prototype.opacity end!-//

//-!nv.$Element.prototype.css start(nv.$Element.prototype.opacity,nv.$Element.prototype._getCss,nv.$Element.prototype._setCss)!-//
/**
 	css() 硫붿꽌�쒕뒗 HTML �붿냼�� CSS �띿꽦 媛믪쓣 議고쉶�쒕떎.
	@method css
	@param {String+} vName CSS �띿꽦 �대쫫(String)
	@return {String} CSS �띿꽦 媛믪쓣 諛섑솚�쒕떎.
	@throws {nv.$Except.NOT_USE_CSS} css�� �ъ슜�� �� �녿뒗 �섎━癒쇳듃 �� ��.
	@remark
		<ul class="disc">
			<li>CSS �띿꽦�� 移대찞 �쒓린踰�(Camel Notation)�� �ъ슜�쒕떎. �덈� �ㅻ㈃ border-width-bottom �띿꽦�� borderWidthBottom�쇰줈 吏��뺥븷 �� �덈떎.</li>
			<li>2.6.0 �댁긽�먯꽌�� �쇰컲�곸� �ㅽ��� 臾몃쾿怨� 移대찞 �쒓린踰� 紐⑤몢 �ъ슜媛��ν븯��.�덈� �ㅻ㈃ border-width-bottom, borderWidthBottom 紐⑤몢 媛��ν븯��.</li>
			<li>float �띿꽦�� JavaScript�� �덉빟�대줈 �ъ슜�섎�濡� css() 硫붿꽌�쒖뿉�쒕뒗 float ���� cssFloat�� �ъ슜�쒕떎(Internet Explorer�먯꽌�� styleFloat, 洹� �몄쓽 釉뚮씪�곗��먯꽌�� cssFloat瑜� �ъ슜�쒕떎.).</li>
		</ul>
	@see nv.$Element#attr
	@example
		<style type="text/css">
			#btn {
				width: 120px;
				height: 30px;
				background-color: blue;
			}
		</style>

		<span id="btn"></span>

		// CSS �띿꽦 媛� 議고쉶
		$Element('btn').css('backgroundColor');		// rgb (0, 0, 255)
 */
/**
 	css() 硫붿꽌�쒕뒗 HTML �붿냼�� CSS �띿꽦 媛믪쓣 �ㅼ젙�쒕떎.

	@method css
	@syntax vName, vValue
	@syntax oList
	@param {String+} vName CSS �띿꽦 �대쫫(String)
	@param {String+ | Numeric} vValue CSS �띿꽦�� �ㅼ젙�� 媛�. �レ옄(Number) �뱀� �⑥쐞瑜� �ы븿�� 臾몄옄��(String)�� �ъ슜�쒕떎.
	@param {Hash+} oList �섎굹 �댁긽�� CSS �띿꽦怨� 媛믪쓣 媛�吏��� 媛앹껜(Object) �먮뒗 �댁떆 媛앹껜(nv.$H() 媛앹껜).
	@return {this} CSS �띿꽦 媛믪쓣 諛섏쁺�� �몄뒪�댁뒪 �먯떊
	@throws {nv.$Except.NOT_USE_CSS} css�� �ъ슜�� �� �녿뒗 �섎━癒쇳듃 �� ��.
	@remark
		<ul class="disc">
			<li>CSS �띿꽦�� 移대찞 �쒓린踰�(Camel Notation)�� �ъ슜�쒕떎. �덈� �ㅻ㈃ border-width-bottom �띿꽦�� borderWidthBottom�쇰줈 吏��뺥븷 �� �덈떎.</li>
			<li>2.6.0 �댁긽�먯꽌�� �쇰컲�곸� �ㅽ��� 臾몃쾿怨� 移대찞 �쒓린踰� 紐⑤몢 �ъ슜媛��ν븯��.�덈� �ㅻ㈃ border-width-bottom, borderWidthBottom 紐⑤몢 媛��ν븯��.</li>
			<li>float �띿꽦�� JavaScript�� �덉빟�대줈 �ъ슜�섎�濡� css() 硫붿꽌�쒖뿉�쒕뒗 float ���� cssFloat�� �ъ슜�쒕떎(Internet Explorer�먯꽌�� styleFloat, 洹� �몄쓽 釉뚮씪�곗��먯꽌�� cssFloat瑜� �ъ슜�쒕떎.).</li>
		</ul>
	@see nv.$Element#attr
	@example
		// CSS �띿꽦 媛� �ㅼ젙
		$Element('btn').css('backgroundColor', 'red');

		//Before
		<span id="btn"></span>

		//After
		<span id="btn" style="background-color: red;"></span>
	@example
		// �щ윭媛쒖쓽 CSS �띿꽦 媛믪쓣 �ㅼ젙
		$Element('btn').css({
			width: "200px",		// 200
			height: "80px"  	// 80 �쇰줈 �ㅼ젙�섏뿬�� 寃곌낵�� 媛숈쓬
		});

		//Before
		<span id="btn" style="background-color: red;"></span>

		//After
		<span id="btn" style="background-color: red; width: 200px; height: 80px;"></span>
 */

/**
 	hook() 硫붿꽌�쒕뒗 CSS紐낆쓣 議고쉶�쒕떎.
	@method hook
	@syntax vName
	@static
	@param {String+} vName CSS紐�(String)
	@remark 2.7.0遺��� �ъ슜媛��ν븯��.
	@return {Variant} CSS瑜� �섑��대뒗 媛� �뱀� �⑥닔.
	@example
		$Element.hook("textShadow");
		//webkitTextShadow
 */

/**
 	hook() 硫붿꽌�쒕뒗 媛쒕컻�먭� CSS瑜� 留뚮뱾硫� 吏꾨룄�먯꽌 �대떦 CSS媛� �ㅼ뼱�붿쓣 �� 蹂�寃쏀븯�� �ъ슜�쒕떎.
	@method hook
	@syntax vName, vValue
	@syntax oList
	@static
	@param {String+} vName CSS紐�(String)
	@param {Variant} vValue 蹂�寃쏀븷 CSS紐�(String|Function)
	@param {Hash+} oList �섎굹 �댁긽�� CSS 紐낃낵 媛믪쓣 媛�吏��� 媛앹껜(Object) �먮뒗 �댁떆 媛앹껜(nv.$H() 媛앹껜).
	@remark 2.7.0遺��� �ъ슜媛��ν븯��.
	@return {$Element} $Element


	@example
		$Element.hook("textShadow","webkitTextShadow");

		$Element("some").css("textShadow");
		//�대젃寃� �섎㈃ 吏꾨룄�먯꽌�� webkitTextShadow�� 媛믪쓣 諛섑솚.
	@example
		//�⑥닔�� �좊떦�� �� �덈떎.
		$Element.hook("textShadow",function(){
			if(isIE&&version>10){
				return "MsTextShadow";
			}else if(isSafari){
				return "webkitTextShadow";
			}else{
				return "textShadow";
			}
		});

		$Element("some").css("textShadow");
		///IE�닿퀬 踰꾩쟾�� 10�댁긽�� 寃쎌슦�� MsTextShadow媛믪쓣 媛��몄샂
		//Safari�� 寃쎌슦 webkitTextShadow媛믪쑝濡� 媛��몄샂
 */

nv._p_._revisionCSSAttr = function(name,vendorPrefix){
    var custumName = nv.$Element.hook(name);
    if(custumName){
        name = custumName;
    }else{
        name = nv._p_.cssNameToJavaScriptName(name).replace(/^(animation|perspective|transform|transition)/i,function(_1){
            return vendorPrefix[_1.toLowerCase()];
        });
    }
    return name;
};

nv._p_.changeTransformValue = function(name,_test){
    return  (name+"").replace(/([\s|-]*)(?:transform)/,function(_,m1){
        return nv._p_.trim(m1).length > 0 ? _ : m1+nv._p_.getTransformStringForValue(_test);
    });
};

nv.$Element.prototype.css = function(sName, sValue) {
    //-@@$Element.css-@@//
    var oArgs = g_checkVarType(arguments, {
        'g'     : [ 'sName:String+'],
        's4str' : [ nv.$Jindo._F('sName:String+'), nv.$Jindo._F('vValue:String+') ],
        's4num' : [ 'sName:String+', 'vValue:Numeric' ],
        's4obj' : [ 'oObj:Hash+']
    },"$Element#css");

    var e = this._element;

    switch(oArgs+"") {
        case 's4str':
        case 's4num':
            var obj = {};
            sName = nv._p_._revisionCSSAttr(sName,nv._p_.getStyleIncludeVendorPrefix());
            obj[sName] = sValue;
            sName = obj;
            break;
        case 's4obj':
            sName = oArgs.oObj;
            var obj = {};
            var vendorPrefix = nv._p_.getStyleIncludeVendorPrefix();
            for (var i in sName) if (sName.hasOwnProperty(i)){
                obj[nv._p_._revisionCSSAttr(i,vendorPrefix)] = sName[i];
            }
            sName = obj;
            break;
        case 'g':
            var vendorPrefix = nv._p_.getStyleIncludeVendorPrefix();
            sName = nv._p_._revisionCSSAttr(sName,vendorPrefix);
            var _getCss = this._getCss;

            if(sName == "opacity"){
                return this.opacity();
            }
            if((nv._p_._JINDO_IS_FF||nv._p_._JINDO_IS_OP)&&(sName=="backgroundPositionX"||sName=="backgroundPositionY")){
                var bp = _getCss(e, "backgroundPosition").split(/\s+/);
                return (sName == "backgroundPositionX") ? bp[0] : bp[1];
            }
            if ((!window.getComputedStyle) && sName == "backgroundPosition") {
                return _getCss(e, "backgroundPositionX") + " " + _getCss(e, "backgroundPositionY");
            }
            if ((!nv._p_._JINDO_IS_OP && window.getComputedStyle) && (sName=="padding"||sName=="margin")) {
                var top     = _getCss(e, sName+"Top");
                var right   = _getCss(e, sName+"Right");
                var bottom  = _getCss(e, sName+"Bottom");
                var left    = _getCss(e, sName+"Left");
                if ((top == right) && (bottom == left)) {
                    return top;
                }else if (top == bottom) {
                    if (right == left) {
                        return top+" "+right;
                    }else{
                        return top+" "+right+" "+bottom+" "+left;
                    }
                }else{
                    return top+" "+right+" "+bottom+" "+left;
                }
            }
            return _getCss(e, sName);

    }
    var v, type;

    for(var k in sName) {
        if(sName.hasOwnProperty(k)){
            v    = sName[k];
            if (!(nv.$Jindo.isString(v)||nv.$Jindo.isNumeric(v))) continue;
            if (k == 'opacity') {
                this.opacity(v);
                continue;
            }
            if (k == "cssFloat" && nv._p_._JINDO_IS_IE) k = "styleFloat";

            if((nv._p_._JINDO_IS_FF||nv._p_._JINDO_IS_OP)&&( k =="backgroundPositionX" || k == "backgroundPositionY")){
                var bp = this.css("backgroundPosition").split(/\s+/);
                v = k == "backgroundPositionX" ? v+" "+bp[1] : bp[0]+" "+v;
                this._setCss(e, "backgroundPosition", v);
            }else{
                this._setCss(e, k, /transition/i.test(k) ? nv._p_.changeTransformValue(v):v);
            }
        }
    }

    return this;
};
//-!nv.$Element.prototype.css end!-//

//-!nv.$Element.prototype._getCss.hidden start!-//
/**
 	css�먯꽌 �ъ슜�섎뒗 �⑥닔

	@method _getCss
	@ignore
	@param {Element} e
	@param {String} sName
 */
nv.$Element.prototype._getCss = function(e, sName){
    var fpGetCss;
    if (window.getComputedStyle) {
        fpGetCss = function(e, sName){
            try{
                if (sName == "cssFloat") sName = "float";
                var d = e.ownerDocument || e.document || document;
                var sVal = e.style[sName];
                if(!e.style[sName]){
                    var computedStyle = d.defaultView.getComputedStyle(e,null);
                    sName = sName.replace(/([A-Z])/g,"-$1").replace(/^(webkit|ms)/g,"-$1").toLowerCase();
                    sVal =  computedStyle.getPropertyValue(sName);
                    sVal =  sVal===undefined?computedStyle[sName]:sVal;
                }
                if (sName == "textDecoration") sVal = sVal.replace(",","");
                return sVal;
            }catch(ex){
                throw new nv.$Error((e.tagName||"document") + nv.$Except.NOT_USE_CSS,"$Element#css");
            }
        };

    }else if (e.currentStyle) {
        fpGetCss = function(e, sName){
            try{
                if (sName == "cssFloat") sName = "styleFloat";
                var sStyle = e.style[sName];
                if(sStyle){
                    return sStyle;
                }else{
                    var oCurrentStyle = e.currentStyle;
                    if (oCurrentStyle) {
                        return oCurrentStyle[sName];
                    }
                }
                return sStyle;
            }catch(ex){
                throw new nv.$Error((e.tagName||"document") + nv.$Except.NOT_USE_CSS,"$Element#css");
            }
        };
    } else {
        fpGetCss = function(e, sName){
            try{
                if (sName == "cssFloat" && nv._p_._JINDO_IS_IE) sName = "styleFloat";
                return e.style[sName];
            }catch(ex){
                throw new nv.$Error((e.tagName||"document") + nv.$Except.NOT_USE_CSS,"$Element#css");
            }
        };
    }
    nv.$Element.prototype._getCss = fpGetCss;
    return fpGetCss(e, sName);

};
//-!nv.$Element.prototype._getCss.hidden end!-//

//-!nv.$Element.prototype._setCss.hidden start!-//
/**
 	css�먯꽌 css瑜� �명똿�섍린 �꾪븳 �⑥닔

	@method _setCss
	@ignore
	@param {Element} e
	@param {String} k
 */
nv.$Element.prototype._setCss = function(e, k, v){
    if (("#top#left#right#bottom#").indexOf(k+"#") > 0 && (typeof v == "number" ||(/\d$/.test(v)))) {
        e.style[k] = parseInt(v,10)+"px";
    }else{
        e.style[k] = v;
    }
};
//-!nv.$Element.prototype._setCss.hidden end!-//

//-!nv.$Element.prototype.attr start!-//
/**
 	attr() 硫붿꽌�쒕뒗 HTML �붿냼�� �띿꽦�� 媛��몄삩��. �섎굹�� �뚮씪誘명꽣留� �ъ슜�섎㈃ 吏��뺥븳 �띿꽦�� 媛믪쓣 諛섑솚�섍퀬 �대떦 �띿꽦�� �녿떎硫� null�� 諛섑솚�쒕떎.

	@method attr
	@param {String+} sName �띿꽦 �대쫫(String)
	@return {String+} �띿꽦 媛믪쓣 諛섑솚.
	@remark 2.2.0 踰꾩쟾 遺��� &lt;select&gt; �섎━癒쇳듃�� �ъ슜��, �듭뀡媛믪쓣 媛��몄삱 �� �덈떎.
	@example
		<a href="http://www.naver.com" id="sample_a" target="_blank">Naver</a>

		$Element("sample_a").attr("href"); // http://www.naver.com
 */
/**
 	attr() 硫붿꽌�쒕뒗 HTML �붿냼�� �띿꽦�� �ㅼ젙�쒕떎.

	@method attr
	@syntax sName, vValue
	@syntax oList
	@param {String+} sName �띿꽦 �대쫫(String).
	@param {Variant} vValue �띿꽦�� �ㅼ젙�� 媛�. �レ옄(Number) �뱀� �⑥쐞瑜� �ы븿�� 臾몄옄��(String)�� �ъ슜�쒕떎. �먰븳 �띿꽦�� 媛믪쓣 null濡� �ㅼ젙�섎㈃ �대떦 HTML �띿꽦�� ��젣�쒕떎.
	@param {Hash+} oList �섎굹 �댁긽�� �띿꽦怨� 媛믪쓣 媛�吏��� 媛앹껜(Object) �먮뒗 �댁떆 媛앹껜(nv.$H() 媛앹껜).
	@return {this} �띿꽦 媛믪쓣 諛섏쁺�� �몄뒪�댁뒪 �먯떊
	@throws {nv.$Except.NOT_USE_CSS} sName�� 臾몄옄,�ㅻ툕�앺듃 �� $Hash�ъ빞 �쒕떎.
	@remark 2.2.0 踰꾩쟾 遺��� &lt;select&gt; �섎━癒쇳듃�� �ъ슜��, �듭뀡媛믪쓣 �ㅼ젙�� �� �덈떎.
	@see nv.$Element#css
	@example
		$Element("sample_a").attr("href", "http://www.hangame.com/");

		//Before
		<a href="http://www.naver.com" id="sample_a" target="_blank">Naver</a>

		//After
		<a href="http://www.hangame.com" id="sample_a" target="_blank">Naver</a>
	@example
		$Element("sample_a").attr({
		    "href" : "http://www.hangame.com",
		    "target" : "_self"
		})

		//Before
		<a href="http://www.naver.com" id="sample_a" target="_blank">Naver</a>

		//After
		<a href="http://www.hangame.com" id="sample_a" target="_self">Naver</a>
	@example
		<select id="select">
			<option value="naver">�ㅼ씠踰�</option>
			<option value="hangame">�쒓쾶��</option>
			<option>伊щ땲踰�</option>
		</select>
		<script type="text/javascript">
			var wel = $Element("select");
			wel.attr("value"); // "naver"
			wel.attr("value", null).attr("value"); // null
			wel.attr("value", "�쒓쾶��").attr("value"); // "hangame"
			wel.attr("value", "伊щ땲踰�").attr("value"); // "伊щ땲踰�"
			wel.attr("value", "naver").attr("value"); // "naver"
			wel.attr("value", ["hangame"]).attr("value"); // null
		</script>
	@example
		<select id="select" multiple="true">
			<option value="naver">�ㅼ씠踰�</option>
			<option value="hangame">�쒓쾶��</option>
			<option>伊щ땲踰�</option>
		</select>
		<script type="text/javascript">
			var wel = $Element("select");
			wel.attr("value"); // null
			wel.attr("value", "naver").attr("value"); // ["naver"]
			wel.attr("value", null).attr("value"); // null
			wel.attr("value", ["�쒓쾶��"]).attr("value"); // ["hangame"]
			wel.attr("value", []).attr("value"); // null
			wel.attr("value", ["�ㅼ씠踰�", "hangame"]).attr("value"); // ["naver", "hangame"]
			wel.attr("value", ["伊щ땲踰�", "me2day"]).attr("value"); // ["伊щ땲踰�"]
			wel.attr("value", ["naver", "�댄뵾鍮�"]).attr("value"); // ["naver"]
		</script>
 */
nv.$Element.prototype.attr = function(sName, sValue) {
    //-@@$Element.attr-@@//
    var oArgs = g_checkVarType(arguments, {
        'g'     : [ 'sName:String+'],
        's4str' : [ 'sName:String+', 'vValue:String+' ],
        's4num' : [ 'sName:String+', 'vValue:Numeric' ],
        's4nul' : [ 'sName:String+', 'vValue:Null' ],
        's4bln' : [ 'sName:String+', 'vValue:Boolean' ],
        's4arr' : [ 'sName:String+', 'vValue:Array+' ],
        's4obj' : [ nv.$Jindo._F('oObj:Hash+')]
    },"$Element#attr");

    var e = this._element,
        aValue = null,
        i,
        length,
        nIndex,
        fGetIndex,
        elOption,
        wa;

    switch(oArgs+""){
        case "s4str":
        case "s4nul":
        case "s4num":
        case "s4bln":
        case "s4arr":
            var obj = {};
            obj[sName] = sValue;
            sName = obj;
            break;
        case "s4obj":
            sName = oArgs.oObj;
            break;
        case "g":
            if (sName == "class" || sName == "className"){
                return e.className;
            }else if(sName == "style"){
                return e.style.cssText;
            }else if(sName == "checked"||sName == "disabled"){
                return !!e[sName];
            }else if(sName == "value"){
                if(this.tag == "button"){
                    return e.getAttributeNode('value').value;
                }else if(this.tag == "select"){
                    if(e.multiple){
                        for(i = 0, length = e.options.length; i < length; i++){
                            elOption = e.options[i];

                            if(elOption.selected){
                                if(!aValue){
                                    aValue = [];
                                }

                                sValue = elOption.value;

                                if(sValue == ""){
                                    sValue = elOption.text;
                                }

                                aValue.push(sValue);
                            }
                        }
                        return aValue;
                    }else{
                        if(e.selectedIndex < 0){
                            return null;
                        }

                        sValue = e.options[e.selectedIndex].value;
                        return (sValue == "") ? e.options[e.selectedIndex].text : sValue;
                    }
                }else{
                    return e.value;
                }
            }else if(sName == "href"){
                return e.getAttribute(sName,2);
            }
            return e.getAttribute(sName);
    }

    fGetIndex = function(oOPtions, vValue){
        var nIndex = -1,
            i,
            length,
            elOption;

        for(i = 0, length = oOPtions.length; i < length; i++){
            elOption = oOPtions[i];
            if(elOption.value === vValue || elOption.text === vValue){
                nIndex = i;
                break;
            }
        }

        return nIndex;
    };

    for(var k in sName){
        if(sName.hasOwnProperty(k)){
            var v = sName[k];
            // when remove property
            if(nv.$Jindo.isNull(v)){
                if(this.tag == "select"){
                    if(e.multiple){
                        for(i = 0, length = e.options.length; i < length; i++){
                            e.options[i].selected = false;
                        }
                    }else{
                        e.selectedIndex = -1;
                    }
                }else{
                    e.removeAttribute(k);
                }
            }else{
                if(k == "class"|| k == "className"){
                    e.className = v;
                }else if(k == "style"){
                    e.style.cssText = v;
                }else if(k == "checked"||k == "disabled"){
                    e[k] = v;
                }else if(k == "value"){
                    if(this.tag == "select"){
                        if(e.multiple){
                            if(nv.$Jindo.isArray(v)){
                                wa = nv.$A(v);
                                for(i = 0, length = e.options.length; i < length; i++){
                                    elOption = e.options[i];
                                    elOption.selected = wa.has(elOption.value) || wa.has(elOption.text);
                                }
                            }else{
                                e.selectedIndex = fGetIndex(e.options, v);
                            }
                        }else{
                            e.selectedIndex = fGetIndex(e.options, v);
                        }
                    }else{
                        e.value = v;
                    }
                }else{
                    e.setAttribute(k, v);
                }
            }
        }
    }

    return this;
};
//-!nv.$Element.prototype.attr end!-//

//-!nv.$Element.prototype.width start!-//
/**
 	width() 硫붿꽌�쒕뒗 HTML �붿냼�� �ㅼ젣 �덈퉬瑜� 媛��몄삩��.

	@method width
	@return {Number} HTML �붿냼�� �ㅼ젣 �덈퉬(Number)瑜�  諛섑솚�쒕떎.
	@remark 釉뚮씪�곗�留덈떎 Box 紐⑤뜽�� �ш린 怨꾩궛 諛⑸쾿�� �ㅻⅤ誘�濡� CSS�� width �띿꽦 媛믨낵 width 硫붿꽌��()�� 諛섑솚 媛믪� �쒕줈 �ㅻ� �� �덈떎.
	@see nv.$Element#height
	@example
		<style type="text/css">
			div { width:70px; height:50px; padding:5px; margin:5px; background:red; }
		</style>

		<div id="sample_div"></div>

		// 議고쉶
		$Element("sample_div").width();	// 80
 */
/**
 	width() 硫붿꽌�쒕뒗 HTML �붿냼�� �덈퉬瑜� �ㅼ젙�쒕떎.

	@method width
	@param {Numeric} nWidth	�ㅼ젙�� �덈퉬 媛�. �⑥쐞�� �쎌�(px)�대ŉ �뚮씪誘명꽣�� 媛믪� �レ옄濡� 吏��뺥븳��.
	@return {this} width �띿꽦 媛믪쓣 諛섏쁺�� �몄뒪�댁뒪 �먯떊
	@remark 釉뚮씪�곗�留덈떎 Box 紐⑤뜽�� �ш린 怨꾩궛 諛⑸쾿�� �ㅻⅤ誘�濡� CSS�� width �띿꽦 媛믨낵 width 硫붿꽌��()�� 諛섑솚 媛믪� �쒕줈 �ㅻ� �� �덈떎.
	@see nv.$Element#height
	@example
		// HTML �붿냼�� �덈퉬 媛믪쓣 �ㅼ젙
		$Element("sample_div").width(200);

		//Before
		<style type="text/css">
			div { width:70px; height:50px; padding:5px; margin:5px; background:red; }
		</style>

		<div id="sample_div"></div>

		//After
		<div id="sample_div" style="width: 190px"></div>
 */
nv.$Element.prototype.width = function(width) {
    //-@@$Element.width-@@//
    var oArgs = g_checkVarType(arguments, {
        'g' : [  ],
        's' : ["nWidth:Numeric"]
    },"$Element#width");

    switch(oArgs+""){
        case "g" :

            return this._element.offsetWidth;

        case "s" :

            width = oArgs.nWidth;
            var e = this._element;
            e.style.width = width+"px";
            var off = e.offsetWidth;
            if (off != width && off!==0) {
                var w = (width*2 - off);
                if (w>0)
                    e.style.width = w + "px";
            }
            return this;

    }

};
//-!nv.$Element.prototype.width end!-//

//-!nv.$Element.prototype.height start!-//
/**
 	height() 硫붿꽌�쒕뒗 HTML �붿냼�� �ㅼ젣 �믪씠瑜� 媛��몄삩��.

	@method height
	@return {Number} HTML �붿냼�� �ㅼ젣 �믪씠(Number)瑜� 諛섑솚�쒕떎.
	@remark 釉뚮씪�곗�留덈떎 Box 紐⑤뜽�� �ш린 怨꾩궛 諛⑸쾿�� �ㅻⅤ誘�濡� CSS�� height �띿꽦 媛믨낵 height() 硫붿꽌�쒖쓽 諛섑솚 媛믪� �쒕줈 �ㅻ� �� �덈떎.
	@see nv.$Element#width
	@example
		<style type="text/css">
			div { width:70px; height:50px; padding:5px; margin:5px; background:red; }
		</style>

		<div id="sample_div"></div>

		// 議고쉶
		$Element("sample_div").height(); // 60
 */
/**
 	height() 硫붿꽌�쒕뒗 HTML �붿냼�� �ㅼ젣 �믪씠瑜� �ㅼ젙�쒕떎.

	@method height
	@param {Number} nHeight �ㅼ젙�� �믪씠 媛�. �⑥쐞�� �쎌�(px)�대ŉ �뚮씪誘명꽣�� 媛믪� �レ옄濡� 吏��뺥븳��.
	@return {this} height �띿꽦 媛믪쓣 諛섏쁺�� �몄뒪�댁뒪 �먯떊
	@remark 釉뚮씪�곗�留덈떎 Box 紐⑤뜽�� �ш린 怨꾩궛 諛⑸쾿�� �ㅻⅤ誘�濡� CSS�� height �띿꽦 媛믨낵 height() 硫붿꽌�쒖쓽 諛섑솚 媛믪� �쒕줈 �ㅻ� �� �덈떎.
	@see nv.$Element#width
	@example
		// HTML �붿냼�� �믪씠 媛믪쓣 �ㅼ젙
		$Element("sample_div").height(100);

		//Before
		<style type="text/css">
			div { width:70px; height:50px; padding:5px; margin:5px; background:red; }
		</style>

		<div id="sample_div"></div>

		//After
		<div id="sample_div" style="height: 90px"></div>
 */
nv.$Element.prototype.height = function(height) {
    //-@@$Element.height-@@//
    var oArgs = g_checkVarType(arguments, {
        'g' : [  ],
        's' : ["nHeight:Numeric"]
    },"$Element#height");

    switch(oArgs+""){
        case "g" :
            return this._element.offsetHeight;

        case "s" :
            height = oArgs.nHeight;
            var e = this._element;
            e.style.height = height+"px";
            var off = e.offsetHeight;
            if (off != height && off!==0) {
                var height = (height*2 - off);
                if(height>0)
                    e.style.height = height + "px";
            }
            return this;

    }
};
//-!nv.$Element.prototype.height end!-//

//-!nv.$Element.prototype.className start!-//
/**
 	className() 硫붿꽌�쒕뒗 HTML �붿냼�� �대옒�� �대쫫�� �뺤씤�쒕떎.

	@method className
	@return {String} �대옒�� �대쫫�� 諛섑솚. �섎굹 �댁긽�� �대옒�ㅺ� 吏��뺣맂 寃쎌슦 怨듬갚�쇰줈 援щ텇�� 臾몄옄�댁씠 諛섑솚�쒕떎.
	@see nv.$Element#hasClass
	@see nv.$Element#addClass
	@see nv.$Element#removeClass
	@see nv.$Element#toggleClass
	@example
		<style type="text/css">
		p { margin: 8px; font-size:16px; }
		.selected { color:#0077FF; }
		.highlight { background:#C6E746; }
		</style>

		<p>Hello and <span id="sample_span" class="selected">Goodbye</span></p>

		// �대옒�� �대쫫 議고쉶
		$Element("sample_span").className(); // selected
 */
/**
 	className() 硫붿꽌�쒕뒗 HTML �붿냼�� �대옒�� �대쫫�� �ㅼ젙�쒕떎.

	@method className
	@param {String+} sClass �ㅼ젙�� �대옒�� �대쫫. �섎굹 �댁긽�� �대옒�ㅻ� 吏��뺥븯�ㅻ㈃ 怨듬갚�쇰줈 援щ텇�섏뿬 吏��뺥븷 �대옒�� �대쫫�� �섏뿴�쒕떎.
	@return {this} 吏��뺥븳 �대옒�ㅻ� 諛섏쁺�� �몄뒪�댁뒪 �먯떊
	@throws {nv.$Except.NOT_FOUND_ARGUMENT} �뚮씪誘명꽣媛� �녿뒗 寃쎌슦.
	@see nv.$Element#hasClass
	@see nv.$Element#addClass
	@see nv.$Element#removeClass
	@see nv.$Element#toggleClass
	@example
		// HTML �붿냼�� �대옒�� �대쫫 �ㅼ젙
		$Element("sample_span").className("highlight");

		//Before
		<style type="text/css">
		p { margin: 8px; font-size:16px; }
		.selected { color:#0077FF; }
		.highlight { background:#C6E746; }
		</style>

		<p>Hello and <span id="sample_span" class="selected">Goodbye</span></p>

		//After
		<p>Hello and <span id="sample_span" class="highlight">Goodbye</span></p>
 */
nv.$Element.prototype.className = function(sClass) {
    //-@@$Element.className-@@//
    var oArgs = g_checkVarType(arguments, {
        'g' : [  ],
        's' : [nv.$Jindo._F("sClass:String+")]
    },"$Element#className");
    var e = this._element;
    switch(oArgs+"") {
        case "g":
            return e.className;
        case "s":
            e.className = sClass;
            return this;

    }

};
//-!nv.$Element.prototype.className end!-//

//-!nv.$Element.prototype.hasClass start!-//
/**
 	hasClass() 硫붿꽌�쒕뒗 HTML �붿냼�먯꽌 �뱀젙 �대옒�ㅻ� �ъ슜�섍퀬 �덈뒗吏� �뺤씤�쒕떎.

	@method hasClass
	@param {String+} sClass �뺤씤�� �대옒�� �대쫫.
	@return {Boolean} 吏��뺥븳 �대옒�ㅼ쓽 �ъ슜 �щ�.
	@see nv.$Element#className
	@see nv.$Element#addClass
	@see nv.$Element#removeClass
	@see nv.$Element#toggleClass
	@example
		<style type="text/css">
			p { margin: 8px; font-size:16px; }
			.selected { color:#0077FF; }
			.highlight { background:#C6E746; }
		</style>

		<p>Hello and <span id="sample_span" class="selected highlight">Goodbye</span></p>

		// �대옒�ㅼ쓽 �ъ슜�щ�瑜� �뺤씤
		var welSample = $Element("sample_span");
		welSample.hasClass("selected"); 			// true
		welSample.hasClass("highlight"); 			// true
 */
nv.$Element.prototype.hasClass = function(sClass) {
    //-@@$Element.hasClass-@@//
    var ___checkVarType = g_checkVarType;

    if(nv._p_.canUseClassList()){
        nv.$Element.prototype.hasClass = function(sClass){
            var oArgs = ___checkVarType(arguments, {
                '4str' : ["sClass:String+"]
            },"$Element#hasClass");
            return this._element.classList.contains(sClass);
        };
    } else {
        nv.$Element.prototype.hasClass = function(sClass){
            var oArgs = ___checkVarType(arguments, {
                '4str' : ["sClass:String+"]
            },"$Element#hasClass");
            return (" "+this._element.className+" ").indexOf(" "+sClass+" ") > -1;
        };
    }
    return this.hasClass.apply(this,arguments);
};
//-!nv.$Element.prototype.hasClass end!-//

//-!nv.$Element.prototype.addClass start!-//
/**
 	addClass() 硫붿꽌�쒕뒗 HTML �붿냼�� �대옒�ㅻ� 異붽��쒕떎.

	@method addClass
	@param {String+} sClass 異붽��� �대옒�� �대쫫. �� �댁긽�� �대옒�ㅻ� 異붽��섎젮硫� �대옒�� �대쫫�� 怨듬갚�쇰줈 援щ텇�섏뿬 �섏뿴�쒕떎.
	@return {this} 吏��뺥븳 �대옒�ㅻ� 異붽��� �몄뒪�댁뒪 �먯떊
	@see nv.$Element#className
	@see nv.$Element#hasClass
	@see nv.$Element#removeClass
	@see nv.$Element#toggleClass
	@example
		// �대옒�� 異붽�
		$Element("sample_span1").addClass("selected");
		$Element("sample_span2").addClass("selected highlight");

		//Before
		<p>Hello and <span id="sample_span1">Goodbye</span></p>
		<p>Hello and <span id="sample_span2">Goodbye</span></p>

		//After
		<p>Hello and <span id="sample_span1" class="selected">Goodbye</span></p>
		<p>Hello and <span id="sample_span2" class="selected highlight">Goodbye</span></p>
 */
nv.$Element.prototype.addClass = function(sClass) {
    //-@@$Element.addClass-@@//
    if(this._element.classList){
        nv.$Element.prototype.addClass = function(sClass) {
            if(this._element==null) return this;
            var oArgs = g_checkVarType(arguments, {
                '4str' : ["sClass:String+"]
            },"$Element#addClass");

            var aClass = (sClass+"").split(/\s+/);
            var flistApi = this._element.classList;
            for(var i = aClass.length ; i-- ;) {
                aClass[i]!=""&&flistApi.add(aClass[i]);
            }
            return this;
        };
    } else {
        nv.$Element.prototype.addClass = function(sClass) {
            var oArgs = g_checkVarType(arguments, {
                '4str' : ["sClass:String+"]
            },"$Element#addClass");
            var e = this._element;
            var sClassName = e.className;
            var aClass = (sClass+"").split(" ");
            var sEachClass;
            for (var i = aClass.length - 1; i >= 0 ; i--){
                sEachClass = aClass[i];
                if ((" "+sClassName+" ").indexOf(" "+sEachClass+" ") == -1) {
                    sClassName = sClassName+" "+sEachClass;
                }
            }
            e.className = sClassName.replace(/\s+$/, "").replace(/^\s+/, "");
            return this;
        };
    }
    return this.addClass.apply(this,arguments);
};
//-!nv.$Element.prototype.addClass end!-//

//-!nv.$Element.prototype.removeClass start!-//
/**
 	removeClass() 硫붿꽌�쒕뒗 HTML �붿냼�먯꽌 �뱀젙 �대옒�ㅻ� �쒓굅�쒕떎.

	@method removeClass
	@param {String+} sClass �쒓굅�� �대옒�� �대쫫. �� �댁긽�� �대옒�ㅻ� �쒓굅�섎젮硫� �대옒�� �대쫫�� 怨듬갚�쇰줈 援щ텇�섏뿬 �섏뿴�쒕떎.
	@return {this} 吏��뺥븳 �대옒�ㅻ� �쒓굅�� �몄뒪�댁뒪 �먯떊
	@see nv.$Element#className
	@see nv.$Element#hasClass
	@see nv.$Element#addClass
	@see nv.$Element#toggleClass
	@example
		// �대옒�� �쒓굅
		$Element("sample_span").removeClass("selected");

		//Before
		<p>Hello and <span id="sample_span" class="selected highlight">Goodbye</span></p>

		//After
		<p>Hello and <span id="sample_span" class="highlight">Goodbye</span></p>
	@example
		// �щ윭媛쒖쓽 �대옒�ㅻ� �쒓굅
		$Element("sample_span").removeClass("selected highlight");
		$Element("sample_span").removeClass("highlight selected");

		//Before
		<p>Hello and <span id="sample_span" class="selected highlight">Goodbye</span></p>

		//After
		<p>Hello and <span id="sample_span" class="">Goodbye</span></p>
 */
nv.$Element.prototype.removeClass = function(sClass) {
    //-@@$Element.removeClass-@@//
 	if(this._element.classList) {
        nv.$Element.prototype.removeClass = function(sClass){
            var oArgs = g_checkVarType(arguments, {
                '4str' : ["sClass:String+"]
            },"$Element#removeClass");
            if(this._element==null) return this;
            var flistApi = this._element.classList;
            var aClass = (sClass+"").split(" ");
            for(var i = aClass.length ; i-- ;){
                aClass[i]!=""&&flistApi.remove(aClass[i]);
            }
            return this;
        };
 	} else {
        nv.$Element.prototype.removeClass = function(sClass) {
            var oArgs = g_checkVarType(arguments, {
                '4str' : ["sClass:String+"]
            },"$Element#removeClass");
            var e = this._element;
            var sClassName = e.className;
            var aClass = (sClass+"").split(" ");
            var sEachClass;

            for (var i = aClass.length - 1; i >= 0; i--){
                if(/\W/g.test(aClass[i])) {
                     aClass[i] = aClass[i].replace(/(\W)/g,"\\$1");
                }

                sClassName = (" "+sClassName+" ").replace(new RegExp("\\s+"+ aClass[i] +"(?=\\s+)","g")," ");
            }

            e.className = sClassName.replace(/\s+$/, "").replace(/^\s+/, "");

            return this;
        };
 	}
	return this.removeClass.apply(this,arguments);
};
//-!nv.$Element.prototype.removeClass end!-//

//-!nv.$Element.prototype.toggleClass start(nv.$Element.prototype.addClass,nv.$Element.prototype.removeClass,nv.$Element.prototype.hasClass)!-//
/**
 	toggleClass() 硫붿꽌�쒕뒗 HTML �붿냼�� �뚮씪誘명꽣濡� 吏��뺥븳 �대옒�ㅺ� �대� �곸슜�섏뼱 �덉쑝硫� �쒓굅�섍퀬 留뚯빟 �놁쑝硫� 異붽��쒕떎.<br>
	�뚮씪誘명꽣瑜� �섎굹留� �낅젰�� 寃쎌슦 �뚮씪誘명꽣濡� 吏��뺥븳 �대옒�ㅺ� �ъ슜�섍퀬 �덉쑝硫� �쒓굅�섍퀬 �ъ슜�섍퀬 �덉� �딆쑝硫� 異붽��쒕떎. 留뚯빟 �� 媛쒖쓽 �뚮씪誘명꽣瑜� �낅젰�� 寃쎌슦 �� �대옒�� 以묒뿉�� �ъ슜�섍퀬 �덈뒗 寃껋쓣 �쒓굅�섍퀬 �섎㉧吏� �대옒�ㅻ� 異붽��쒕떎.

	@method toggleClass
	@param {String+} sClass 異붽� �뱀� �쒓굅�� �대옒�� �대쫫1.
	@param {String+} [sClass2] 異붽� �뱀� �쒓굅�� �대옒�� �대쫫2.
	@return {this} 吏��뺥븳 �대옒�ㅻ� 異붽� �뱀� �쒓굅�� �몄뒪�댁뒪 �먯떊
	@import core.$Element[hasClass,addClass,removeClass]
	@see nv.$Element#className
	@see nv.$Element#hasClass
	@see nv.$Element#addClass
	@see nv.$Element#removeClass
	@example
		// �뚮씪誘명꽣媛� �섎굹�� 寃쎌슦
		$Element("sample_span1").toggleClass("highlight");
		$Element("sample_span2").toggleClass("highlight");

		//Before
		<p>Hello and <span id="sample_span1" class="selected highlight">Goodbye</span></p>
		<p>Hello and <span id="sample_span2" class="selected">Goodbye</span></p>

		//After
		<p>Hello and <span id="sample_span1" class="selected">Goodbye</span></p>
		<p>Hello and <span id="sample_span2" class="selected highlight">Goodbye</span></p>
	@example
		// �뚮씪誘명꽣媛� �� 媛쒖씤 寃쎌슦
		$Element("sample_span1").toggleClass("selected", "highlight");
		$Element("sample_span2").toggleClass("selected", "highlight");

		//Before
		<p>Hello and <span id="sample_span1" class="highlight">Goodbye</span></p>
		<p>Hello and <span id="sample_span2" class="selected">Goodbye</span></p>

		//After
		<p>Hello and <span id="sample_span1" class="selected">Goodbye</span></p>
		<p>Hello and <span id="sample_span2" class="highlight">Goodbye</span></p>
 */
nv.$Element.prototype.toggleClass = function(sClass, sClass2) {
    //-@@$Element.toggleClass-@@//
    var ___checkVarType = g_checkVarType;
    if(nv._p_.canUseClassList()){
        nv.$Element.prototype.toggleClass = function(sClass, sClass2){
            var oArgs = ___checkVarType(arguments, {
                '4str'  : ["sClass:String+"],
                '4str2' : ["sClass:String+", "sClass2:String+"]
            },"$Element#toggleClass");

            switch(oArgs+"") {
                case '4str':
                    this._element.classList.toggle(sClass+"");
                    break;
                case '4str2':
                    sClass = sClass+"";
                    sClass2 = sClass2+"";
                    if(this.hasClass(sClass)){
                        this.removeClass(sClass);
                        this.addClass(sClass2);
                    }else{
                        this.addClass(sClass);
                        this.removeClass(sClass2);
                    }

            }
            return this;
        };
    } else {
        nv.$Element.prototype.toggleClass = function(sClass, sClass2){
            var oArgs = ___checkVarType(arguments, {
                '4str'  : ["sClass:String+"],
                '4str2' : ["sClass:String+", "sClass2:String+"]
            },"$Element#toggleClass");

            sClass2 = sClass2 || "";
            if (this.hasClass(sClass)) {
                this.removeClass(sClass);
                if (sClass2) this.addClass(sClass2);
            } else {
                this.addClass(sClass);
                if (sClass2) this.removeClass(sClass2);
            }

            return this;
        };
    }
    return this.toggleClass.apply(this,arguments);
};
//-!nv.$Element.prototype.toggleClass end!-//

//-!nv.$Element.prototype.cssClass start(nv.$Element.prototype.addClass,nv.$Element.prototype.removeClass,nv.$Element.prototype.hasClass)!-//
/**
 	cssClass�� �대옒�ㅼ쓽 �좊Т瑜� �뺤씤�쒕떎.

	@method cssClass
	@param {String+} sName class紐�
	@return {Boolean} �대떦 �대옒�ㅺ� �덈뒗吏� �щ��� 遺덈┛ 媛믪쓣 諛섑솚�쒕떎.
	@since 2.0.0
	@see nv.$Element#addClass
	@see nv.$Element#removeClass
	@example
		// 泥� 踰덉㎏ �뚮씪誘명꽣留� �ｌ� 寃쎌슦
		<div id="sample_span1"/>
		$Element("sample_span1").cssClass("highlight");// false
 */
/**
 	cssClass�� �대옒�ㅻ� 異붽�, ��젣�� �� �덈떎.

	@method cssClass
	@syntax sName, bClassType
	@syntax oList
	@param {String+} sName class紐�,
	@param {Boolean} bClassType true�� 寃쎌슦�� �대옒�ㅻ� 異붽��섍퀬 false�� 寃쎌슦�� �대옒�ㅻ� ��젣�쒕떎.
	@param {Hash+} oList �섎굹 �댁긽�� �띿꽦紐낃낵 遺덈┛媛믪쓣 媛�吏��� 媛앹껜(Object) �먮뒗 �댁떆 媛앹껜(nv.$H() 媛앹껜).
	@return {this} 吏��뺥븳 �대옒�ㅻ� 異붽�/��젣�� �몄뒪�댁뒪 �먯떊
	@since 2.0.0
	@see nv.$Element#addClass
	@see nv.$Element#removeClass
	@example
		// �� 踰덉㎏ �뚮씪誘명꽣�� �ｌ� 寃쎌슦.
		$Element("sample_span1").cssClass("highlight",true);
		-> <div id="sample_span1" class="highlight"/>

		$Element("sample_span1").cssClass("highlight",false);
		-> <div id="sample_span1" class=""/>
	@example
		// 泥� 踰덉㎏ �뚮씪誘명꽣瑜� �ㅻ툕�앺듃濡� �ｌ� 寃쎌슦.
		<div id="sample_span1" class="bar"/>

		$Element("sample_span1").cssClass({
			"foo": true,
			"bar" : false
		});
		-> <div id="sample_span1" class="foo"/>
 */
nv.$Element.prototype.cssClass = function(vClass, bCondition){
    var oArgs = g_checkVarType(arguments, {
        'g'  : ["sClass:String+"],
        's4bln' : ["sClass:String+", "bCondition:Boolean"],
        's4obj' : ["oObj:Hash+"]
    },"$Element#cssClass");

    switch(oArgs+""){
        case "g":
            return this.hasClass(oArgs.sClass);

        case "s4bln":
            if(oArgs.bCondition){
                this.addClass(oArgs.sClass);
            }else{
                this.removeClass(oArgs.sClass);
            }
            return this;

        case "s4obj":
            var e = this._element;
            vClass = oArgs.oObj;
            var sClassName = e.className;
            for(var sEachClass in vClass){
                if (vClass.hasOwnProperty(sEachClass)) {
                    if(vClass[sEachClass]){
                        if ((" " + sClassName + " ").indexOf(" " + sEachClass + " ") == -1) {
                            sClassName = (sClassName+" "+sEachClass).replace(/^\s+/, "");
                        }
                    }else{
                        if ((" " + sClassName + " ").indexOf(" " + sEachClass + " ") > -1) {
                            sClassName = (" "+sClassName+" ").replace(" "+sEachClass+" ", " ").replace(/\s+$/, "").replace(/^\s+/, "");
                        }
                    }
                }
            }
            e.className = sClassName;
            return this;

    }


};

//-!nv.$Element.prototype.cssClass end!-//
//-!nv.$Element.prototype.text start!-//
/**
 	text() 硫붿꽌�쒕뒗 HTML �붿냼�� �띿뒪�� �몃뱶 媛믪쓣 媛��몄삩��.

	@method text
	@return {String} HTML �붿냼�� �띿뒪�� �몃뱶(String)瑜� 諛섑솚.
	@example
		<ul id="sample_ul">
			<li>�섎굹</li>
			<li>��</li>
			<li>��</li>
			<li>��</li>
		</ul>

		// �띿뒪�� �몃뱶 媛� 議고쉶
		$Element("sample_ul").text();
		// 寃곌낵
		//	�섎굹
		//	��
		//	��
		//	��
 */
/**
 	text() 硫붿꽌�쒕뒗 HTML �붿냼�� �띿뒪�� �몃뱶瑜� 吏��뺥븳 媛믪쑝濡� �ㅼ젙�쒕떎.

	@method text
	@param {String+} sText 吏��뺥븷 �띿뒪��.
	@return {this} 吏��뺥븳 媛믪쓣 �ㅼ젙�� �몄뒪�댁뒪 �먯떊
	@example
		// �띿뒪�� �몃뱶 媛� �ㅼ젙
		$Element("sample_ul").text('�ㅼ꽢');

		//Before
		<ul id="sample_ul">
			<li>�섎굹</li>
			<li>��</li>
			<li>��</li>
			<li>��</li>
		</ul>

		//After
		<ul id="sample_ul">�ㅼ꽢</ul>
	@example
		// �띿뒪�� �몃뱶 媛� �ㅼ젙
		$Element("sample_p").text("New Content");

		//Before
		<p id="sample_p">
			Old Content
		</p>

		//After
		<p id="sample_p">
			New Content
		</p>
 */
nv.$Element.prototype.text = function(sText) {
    //-@@$Element.text-@@//
    var oArgs = g_checkVarType(arguments, {
        'g'  : [],
        's4str' : ["sText:String+"],
        's4num' : [nv.$Jindo._F("sText:Numeric")],
        's4bln' : ["sText:Boolean"]
    },"$Element#text"),
        ele = this._element,
        tag = this.tag,
        prop,
        oDoc;

    switch(oArgs+""){
        case "g":
            prop = (ele.textContent !== undefined) ? "textContent" : "innerText";

            if(tag == "textarea" || tag == "input"){
                prop = "value";
            }

            return ele[prop];
        case "s4str":
        case "s4num":
        case "s4bln":
            try{
                /*
                  * Opera 11.01�먯꽌 textContext媛� Get�쇰븣 �뺤긽�곸쑝濡� �숈옉�섏� �딆쓬. 洹몃옒�� get�� �뚮뒗 innerText�� �ъ슜�섍퀬 set�섎뒗 寃쎌슦�� textContent�� �ъ슜�쒕떎.(http://devcafe.nhncorp.com/ajaxui/295768)
                 */
                if (tag == "textarea" || tag == "input"){
                    ele.value = sText + "";
                }else{
                    var oDoc = ele.ownerDocument || ele.document || document;
                    this.empty();
                    ele.appendChild(oDoc.createTextNode(sText));
                }
            }catch(e){
                return ele.innerHTML = (sText + "").replace(/&/g, '&amp;').replace(/</g, '&lt;');
            }

            return this;
    }
};
//-!nv.$Element.prototype.text end!-//

//-!nv.$Element.prototype.html start!-//
/**
 	html() 硫붿꽌�쒕뒗 HTML �붿냼�� �대� HTML 肄붾뱶(innerHTML)瑜� 媛��몄삩��.

	@method html
	@return {String} �대� HTML(String)�� 諛섑솚.
	@see https://developer.mozilla.org/en/DOM/element.innerHTML element.innerHTML - MDN Docs
	@see nv.$Element#outerHTML
	@example
		<div id="sample_container">
			<p><em>Old</em> content</p>
		</div>

		// �대� HTML 議고쉶
		$Element("sample_container").html(); // <p><em>Old</em> content</p>
 */
/**
 	html() 硫붿꽌�쒕뒗 HTML �붿냼�� �대� HTML 肄붾뱶(innerHTML)瑜� �ㅼ젙�쒕떎. �대븣 紐⑤뱺 �섏쐞 �붿냼�� 紐⑤뱺 �대깽�� �몃뱾�щ� �쒓굅�쒕떎.

	@method html
	@param {String+} sHTML �대� HTML 肄붾뱶濡� �ㅼ젙�� HTML 臾몄옄��.
	@return {this} 吏��뺥븳 媛믪쓣 �ㅼ젙�� �몄뒪�댁뒪 �먯떊
	@remark IE8�먯꽌 colgroup�� col�� �섏젙�섎젮怨� �� �� colgroup�� ��젣�섍퀬 �ㅼ떆 留뚮뱺 �� col�� 異붽��댁빞 �⑸땲��.
	@see https://developer.mozilla.org/en/DOM/element.innerHTML element.innerHTML - MDN Docs
	@see nv.$Element#outerHTML
	@example
		// �대� HTML �ㅼ젙
		$Element("sample_container").html("<p>New <em>content</em></p>");

		//Before
		<div id="sample_container">
		 	<p><em>Old</em> content</p>
		</div>

		//After
		<div id="sample_container">
		 	<p>New <em>content</em></p>
		</div>
 */
nv.$Element.prototype.html = function(sHTML) {
    //-@@$Element.html-@@//
    var isIe = nv._p_._JINDO_IS_IE;
    var isFF = nv._p_._JINDO_IS_FF;
    var _param = {
                'g'  : [],
                's4str' : [nv.$Jindo._F("sText:String+")],
                's4num' : ["sText:Numeric"],
                's4bln' : ["sText:Boolean"]
    };
    var ___checkVarType = g_checkVarType;

    if (isIe) {
        nv.$Element.prototype.html = function(sHTML){
            var oArgs = ___checkVarType(arguments,_param,"$Element#html");
            switch(oArgs+""){
                case "g":
                    return this._element.innerHTML;
                case "s4str":
                case "s4num":
                case "s4bln":
                    sHTML += "";
                    if(nv.cssquery) nv.cssquery.release();
                    var oEl = this._element;

                    while(oEl.firstChild){
                        oEl.removeChild(oEl.firstChild);
                    }
                    /*
                      * IE �� FireFox �� �쇰� �곹솴�먯꽌 SELECT �쒓렇�� TABLE, TR, THEAD, TBODY �쒓렇�� innerHTML �� �뗮똿�대룄
 * 臾몄젣媛� �앷린吏� �딅룄濡� 蹂댁셿 - hooriza
                     */
                    var sId = 'R' + new Date().getTime() + parseInt(Math.random() * 100000,10);
                    var oDoc = oEl.ownerDocument || oEl.document || document;

                    var oDummy;
                    var sTag = oEl.tagName.toLowerCase();

                    switch (sTag) {
                        case 'select':
                        case 'table':
                            oDummy = oDoc.createElement("div");
                            oDummy.innerHTML = '<' + sTag + ' class="' + sId + '">' + sHTML + '</' + sTag + '>';
                            break;
                        case 'tr':
                        case 'thead':
                        case 'tbody':
                        case 'colgroup':
                            oDummy = oDoc.createElement("div");
                            oDummy.innerHTML = '<table><' + sTag + ' class="' + sId + '">' + sHTML + '</' + sTag + '></table>';
                            break;

                        default:
                            oEl.innerHTML = sHTML;

                    }

                    if (oDummy) {

                        var oFound;
                        for (oFound = oDummy.firstChild; oFound; oFound = oFound.firstChild)
                            if (oFound.className == sId) break;

                        if (oFound) {
                            var notYetSelected = true;
                            for (var oChild; oChild = oEl.firstChild;) oChild.removeNode(true); // innerHTML = '';

                            for (var oChild = oFound.firstChild; oChild; oChild = oFound.firstChild){
                                if(sTag=='select'){
                                    /*
                                     * ie�먯꽌 select�뚭렇�� 寃쎌슦 option以� selected媛� �섏뼱 �덈뒗 option�� �덈뒗 寃쎌슦 以묎컙��
* selected媛� �섏뼱 �덉쑝硫� 洹� �ㅼ쓬 遺��곕뒗 怨꾩냽 selected媛� true濡� �섏뼱 �덉뼱
* �닿껐�섍린 �꾪빐 cloneNode瑜� �댁슜�섏뿬 option�� 移댄뵾�� �� selected瑜� 蹂�寃쏀븿. - mixed
                                     */
                                    var cloneNode = oChild.cloneNode(true);
                                    if (oChild.selected && notYetSelected) {
                                        notYetSelected = false;
                                        cloneNode.selected = true;
                                    }
                                    oEl.appendChild(cloneNode);
                                    oChild.removeNode(true);
                                }else{
                                    oEl.appendChild(oChild);
                                }

                            }
                            oDummy.removeNode && oDummy.removeNode(true);

                        }

                        oDummy = null;

                    }

                    return this;

            }
        };
    }else if(isFF){
        nv.$Element.prototype.html = function(sHTML){
            var oArgs = ___checkVarType(arguments,_param,"$Element#html");

            switch(oArgs+""){
                case "g":
                    return this._element.innerHTML;

                case "s4str":
                case "s4num":
                case "s4bln":
                	// nv._p_.releaseEventHandlerForAllChildren(this);

                    sHTML += "";
                    var oEl = this._element;

                    if(!oEl.parentNode){
                        /*
                         {{html_1}}
                         */
                        var sId = 'R' + new Date().getTime() + parseInt(Math.random() * 100000,10);
                        var oDoc = oEl.ownerDocument || oEl.document || document;

                        var oDummy;
                        var sTag = oEl.tagName.toLowerCase();

                        switch (sTag) {
                        case 'select':
                        case 'table':
                            oDummy = oDoc.createElement("div");
                            oDummy.innerHTML = '<' + sTag + ' class="' + sId + '">' + sHTML + '</' + sTag + '>';
                            break;

                        case 'tr':
                        case 'thead':
                        case 'tbody':
                        case 'colgroup':
                            oDummy = oDoc.createElement("div");
                            oDummy.innerHTML = '<table><' + sTag + ' class="' + sId + '">' + sHTML + '</' + sTag + '></table>';
                            break;

                        default:
                            oEl.innerHTML = sHTML;

                        }

                        if (oDummy) {
                            var oFound;
                            for (oFound = oDummy.firstChild; oFound; oFound = oFound.firstChild)
                                if (oFound.className == sId) break;

                            if (oFound) {
                                for (var oChild; oChild = oEl.firstChild;) oChild.removeNode(true); // innerHTML = '';

                                for (var oChild = oFound.firstChild; oChild; oChild = oFound.firstChild){
                                    oEl.appendChild(oChild);
                                }

                                oDummy.removeNode && oDummy.removeNode(true);

                            }

                            oDummy = null;

                        }
                    }else{
                        oEl.innerHTML = sHTML;
                    }


                    return this;

            }
        };
    }else{
        nv.$Element.prototype.html = function(sHTML){
            var oArgs = ___checkVarType(arguments,_param,"$Element#html");

            switch(oArgs+""){
                case "g":
                    return this._element.innerHTML;

                case "s4str":
                case "s4num":
                case "s4bln":
                	// nv._p_.releaseEventHandlerForAllChildren(this);

                    sHTML += "";
                    var oEl = this._element;
                    oEl.innerHTML = sHTML;
                    return this;

            }

        };
    }

    return this.html.apply(this,arguments);
};
//-!nv.$Element.prototype.html end!-//

//-!nv.$Element.prototype.outerHTML start!-//
/**
 	outerHTML() 硫붿꽌�쒕뒗 HTML �붿냼�� �대� 肄붾뱶(innerHTML)�� �대떦�섎뒗 遺�遺꾧낵 �먯떊�� �쒓렇瑜� �ы븿�� HTML 肄붾뱶瑜� 諛섑솚�쒕떎.

	@method outerHTML
	@return {String} HTML 肄붾뱶.
	@see nv.$Element#html
	@example
		<h2 id="sample0">Today is...</h2>

		<div id="sample1">
		  	<p><span id="sample2">Sample</span> content</p>
		</div>

		// �몃� HTML 媛믪쓣 議고쉶
		$Element("sample0").outerHTML(); // <h2 id="sample0">Today is...</h2>
		$Element("sample1").outerHTML(); // <div id="sample1">  <p><span id="sample2">Sample</span> content</p>  </div>
		$Element("sample2").outerHTML(); // <span id="sample2">Sample</span>
 */
nv.$Element.prototype.outerHTML = function() {
    //-@@$Element.outerHTML-@@//
    var e = this._element;
    e = nv.$Jindo.isDocument(e)?e.documentElement:e;
    if (e.outerHTML !== undefined) return e.outerHTML;

    var oDoc = e.ownerDocument || e.document || document;
    var div = oDoc.createElement("div");
    var par = e.parentNode;

    /**
            �곸쐞�몃뱶媛� �놁쑝硫� innerHTML諛섑솚
     */
    if(!par) return e.innerHTML;

    par.insertBefore(div, e);
    div.style.display = "none";
    div.appendChild(e);

    var s = div.innerHTML;
    par.insertBefore(e, div);
    par.removeChild(div);

    return s;
};
//-!nv.$Element.prototype.outerHTML end!-//

//-!nv.$Element.prototype.toString start(nv.$Element.prototype.outerHTML)!-//
/**
 	toString() 硫붿꽌�쒕뒗 �대떦 �붿냼�� 肄붾뱶瑜� 臾몄옄�대줈 蹂��섑븯�� 諛섑솚�쒕떎(outerHTML 硫붿꽌�쒖� �숈씪).

	@method toString
	@return {String} HTML 肄붾뱶.
	@see nv.$Element#outerHTML
 */
nv.$Element.prototype.toString = function(){
    return this.outerHTML()||"[object $Element]";
};
//-!nv.$Element.prototype.toString end!-//

//-!nv.$Element.prototype.attach start(nv.$Element.prototype.isEqual,nv.$Element.prototype.isChildOf,nv.$Element.prototype.detach, nv.$Element.event_etc, nv.$Element.domready, nv.$Element.unload, nv.$Event)!-//
/**
 	attach() 硫붿꽌�쒕뒗 �섎━癒쇳듃�� �대깽�몃� �좊떦�쒕떎.
	@syntax sEvent, fpCallback
	@syntax oList
	@method attach
	@param {String+} sEvent �대깽�� 紐�
		<ul class="disc">
			<li>�대깽�� �대쫫�먮뒗 on �묐몢�대� �ъ슜�섏� �딅뒗��.</li>
			<li>留덉슦�� �� �ㅽ겕濡� �대깽�몃뒗 mousewheel 濡� �ъ슜�쒕떎.</li>
			<li>湲곕낯 �대깽�� �몄뿉 異붽�濡� �ъ슜�� 媛��ν븳 �대깽�몃줈 domready, mouseenter, mouseleave, mousewheel�� �덈떎.</li>
			<li>delegate�� 湲곕뒫�� 異붽��� (@�� 援щ텇�먮줈 selector�� 媛숈씠 �ъ슜�� �� �덈떎.)</li>
		</ul>
	@param {Function+} fpCallback �대깽�멸� 諛쒖깮�덉쓣 �� �ㅽ뻾�섎뒗 肄쒕갚�⑥닔.
	@param {Hash+} oList �섎굹 �댁긽�� �대깽�몃챸怨� �⑥닔瑜� 媛�吏��� 媛앹껜(Object) �먮뒗 �댁떆 媛앹껜(nv.$H() 媛앹껜).
	@return {this} �대깽�몃� �좊떦�� �몄뒪�댁뒪 �먯떊
	@throws {nv.$Except.NOT_WORK_DOMREADY} IE�� 寃쎌슦 �꾨젅�� �덉뿉�쒕뒗 domready�⑥닔瑜� �ъ슜�� ��.
	@since 2.0.0
	@remark 2.2.0 踰꾩쟾遺���, load�� domready�대깽�몃뒗 媛곴컖 Window�� Document�먯꽌 諛쒖깮�섎뒗 �대깽�몄씠吏�留� �쒕줈瑜� 援먯감�댁꽌 �깅줉�섏뿬�� �대깽�멸� �щ컮瑜닿쾶 諛쒖깮�쒕떎.
	@remark 2.5.0 踰꾩쟾遺��� @�� 援щ텇�먮줈 delegate泥섎읆 �ъ슜�� �� �덈떎.
	@see nv.$Element#detach
	@see nv.$Element#delegate
	@see nv.$Element#undelegate
	@example
		function normalEvent(e){
			alert("click");
		}
		function groupEvent(e){
			alert("group click");
		}

		//�쇰컲�곸씤 �대깽�� �좊떦.
		$Element("some_id").attach("click",normalEvent);
	@example
		function normalEvent(e){
			alert("click");
		}

		//delegate泥섎읆 �ъ슜�섍린 �꾪빐�쒕뒗 @�� 援щ텇�먮줈 �ъ슜媛���.
		$Element("some_id").attach("click@.selected",normalEvent);


		$Element("some_id").attach({
			"click@.selected":normalEvent,
			"click@.checked":normalEvent2,
			"click@.something":normalEvent3
		});
	@example
		function loadHandler(e){
			// empty
		}
		function domreadyHandler(e){
			// empty
		}
		var welDoc = $Element(document);
		var welWin = $Element(window);

		// document�� load �대깽�� �몃뱾�� �깅줉
		welDoc.attach("load", loadHandler);
		welDoc.hasEventListener("load"); // true
		welWin.hasEventListener("load"); // true

		// detach�� document, window �대뒓寃껋뿉�� �대룄 �곴��녿떎.
		welDoc.detach("load", loadHandler);
		welDoc.hasEventListener("load"); // false
		welWin.hasEventListener("load"); // false

		// window�� domready �대깽�� �몃뱾�� �깍옙占쏙옙
		welWin.attach("domready", domreadyHandler);
		welWin.hasEventListener("domready"); // true
		welDoc.hasEventListener("domready"); // true

		// detach�� document, window �대뒓寃껋뿉�� �대룄 �곴��녿떎.
		welWin.detach("domready", domreadyHandler);
		welWin.hasEventListener("domready"); // false
		welDoc.hasEventListener("domready"); // false
 */
nv.$Element.prototype.attach = function(sEvent, fpCallback){
    var oArgs = g_checkVarType(arguments, {
        '4str'  : ["sEvent:String+", "fpCallback:Function+"],
        '4obj'  : ["hListener:Hash+"]
    },"$Element#attach"), oSplit, hListener;

    switch(oArgs+""){
       case "4str":
            oSplit = nv._p_.splitEventSelector(oArgs.sEvent);
            this._add(oSplit.type,oSplit.event,oSplit.selector,fpCallback);
            break;
       case "4obj":
            hListener = oArgs.hListener;
            for(var i in hListener){
                this.attach(i,hListener[i]);
            }
            break;
    }
    return this;
};
//-!nv.$Element.prototype.attach end!-//

//-!nv.$Element.prototype.detach start(nv.$Element.prototype.attach)!-//
/**
 	detach() 硫붿꽌�쒕뒗 �섎━癒쇳듃�� �깅줉�� �대깽�� �몃뱾�щ� �깅줉 �댁젣�쒕떎.
	@syntax sEvent, fpCallback
	@syntax oList
	@method detach
	@param {String+} sEvent �대깽�� 紐�
	@param {Function+} fpCallback �대깽�멸� 諛쒖깮�덉쓣 �� �ㅽ뻾�섎뒗 肄쒕갚�⑥닔.
	@param {Hash+} oList �섎굹 �댁긽�� �대깽�몃챸怨� �⑥닔瑜� 媛�吏��� 媛앹껜(Object) �먮뒗 �댁떆 媛앹껜(nv.$H() 媛앹껜).
	@return {this} �대깽�� �몃뱾�щ� �깅줉 �댁젣�� �몄뒪�댁뒪 �먯떊
	@remark 2.2.0 踰꾩쟾遺���, load�� domready�대깽�몃뒗 媛곴컖 Window�� Document�먯꽌 諛쒖깮�섎뒗 �대깽�몄씠吏�留� �쒕줈瑜� 援먯감�댁꽌 �깅줉�섏뿬�� �대깽�멸� �щ컮瑜닿쾶 諛쒖깮�쒕떎.
	@remark 2.5.0 踰꾩쟾遺��� @�� 援щ텇�먮줈 delegate泥섎읆 �ъ슜�� �� �덈떎.
	@see nv.$Element#detach
	@see nv.$Element#delegate
	@see nv.$Element#undelegate
	@since 2.0.0
	@example
		function normalEvent(e){
			alert("click");
		}
		function groupEvent(e){
			alert("group click");
		}
		function groupEvent2(e){
			alert("group2 click");
		}
		function groupEvent3(e){
			alert("group3 click");
		}

		//�쇰컲�곸씤 �대깽�� �좊떦.
		$Element("some_id").attach("click",normalEvent);

		//�쇰컲�곸씤 �대깽�� �댁젣. �쇰컲�곸씤 �대깽�� �댁젣�� 諛섎뱶�� �⑥닔瑜� �ｌ뼱�쇱�留� �댁젣媛� 媛��ν븯��.
		$Element("some_id").detach("click",normalEvent);
   @example
		function normalEvent(e){
			alert("click");
		}

		//undelegate泥섎읆 �ъ슜�섍린 �꾪빐�쒕뒗 @�� 援щ텇�먮줈 �ъ슜媛���.
		$Element("some_id").attach("click@.selected",normalEvent);
		$Element("some_id").detach("click@.selected",normalEvent);
 */
nv.$Element.prototype.detach = function(sEvent, fpCallback){
    var oArgs = g_checkVarType(arguments, {
        // 'group_for_string'  : ["sEvent:String+"],
        '4str'  : ["sEvent:String+", "fpCallback:Function+"],
        '4obj'  : ["hListener:Hash+"]
    },"$Element#detach"), oSplit, hListener;

    switch(oArgs+""){
       case "4str":
            oSplit = nv._p_.splitEventSelector(oArgs.sEvent);
            this._del(oSplit.type,oSplit.event,oSplit.selector,fpCallback);
            break;
       case "4obj":
            hListener = oArgs.hListener;
            for(var i in hListener){
                this.detach(i,hListener[i]);
            }
            break;
    }
    return this;
};
//-!nv.$Element.prototype.detach end!-//

//-!nv.$Element.prototype.delegate start(nv.$Element.prototype.undelegate, nv.$Element.event_etc, nv.$Element.domready, nv.$Element.unload, nv.$Event)!-//
/**
	delegate() 硫붿꽌�쒕뒗 �대깽�� �꾩엫(Event Deligation) 諛⑹떇�쇰줈 �대깽�몃� 泥섎━�쒕떎.<br>
	�대깽�� �꾩엫�대�, �대깽�� 踰꾨툝留곸쓣 �댁슜�섏뿬 �대깽�몃� 愿�由ы븯�� �곸쐞 �붿냼瑜� �곕줈 �먯뼱 �⑥쑉�곸쑝濡� �대깽�몃� 愿�由ы븯�� 諛⑸쾿�대떎.

	@method delegate
	@param {String+} sEvent �대깽�� �대쫫. on �묐몢�대뒗 �앸왂�쒕떎.
	@param {Variant} vFilter �뱀젙 HTML �붿냼�� ���댁꽌留� �대깽�� �몃뱾�щ� �ㅽ뻾�섎룄濡� �섍린 �꾪븳 �꾪꽣.<br>
	�꾪꽣�� CSS �좏깮��(String)�� �⑥닔(Function)�쇰줈 吏��뺥븷 �� �덈떎.
		<ul class="disc">
			<li>臾몄옄�댁쓣 �낅젰�섎㈃ CSS �좏깮�먮줈 �대깽�� �몃뱾�щ� �ㅽ뻾�쒗궗 �붿냼瑜� 吏��뺥븷 �� �덈떎.</li>
			<li>Boolean 媛믪쓣 諛섑솚�섎뒗 �⑥닔瑜� �뚮씪誘명꽣 �낅젰�� �� �덈떎. �� �⑥닔瑜� �ъ슜�� 寃쎌슦 �⑥닔媛� true瑜� 諛섑솚�� �� �ㅽ뻾�� 肄쒕갚 �⑥닔(fCallback)瑜� �뚮씪誘명꽣濡� 異붽� 吏��뺥빐�� �쒕떎.</li>
		</ul>
	@param {Function+} [fCallback] vFilter�� 吏��뺣맂 �⑥닔媛� true瑜� 諛섑솚�섎뒗 寃쎌슦 �ㅽ뻾�� 肄쒕갚 �⑥닔.
	@return {this} �대깽�� �꾩엫�� �곸슜�� �몄뒪�댁뒪 �먯떊
	@remark 2.0.0遺���  domready, mousewheel, mouseleave, mouseenter �대깽�� �ъ슜媛���.
	@since 1.4.6
	@see nv.$Element#attach
	@see nv.$Element#detach
	@see nv.$Element#undelegate
	@example
		<ul id="parent">
			<li class="odd">1</li>
			<li>2</li>
			<li class="odd">3</li>
			<li>4</li>
		</ul>

		// CSS ���됲꽣瑜� �꾪꽣濡� �ъ슜�섎뒗 寃쎌슦
		$Element("parent").delegate("click",
			".odd", 			// �꾪꽣
			function(eEvent){	// 肄쒕갚 �⑥닔
				alert("odd �대옒�ㅻ� 媛�吏� li媛� �대┃ �� �� �ㅽ뻾");
			});
	@example
		<ul id="parent">
			<li class="odd">1</li>
			<li>2</li>
			<li class="odd">3</li>
			<li>4</li>
		</ul>

		// �⑥닔瑜� �꾪꽣濡� �ъ슜�섎뒗 寃쎌슦
		$Element("parent").delegate("click",
			function(oEle,oClickEle){	// �꾪꽣
				return oClickEle.innerHTML == "2"
			},
			function(eEvent){			// 肄쒕갚 �⑥닔
				alert("�대┃�� �붿냼�� innerHTML�� 2�� 寃쎌슦�� �ㅽ뻾");
			});
*/
nv.$Element.prototype.delegate = function(sEvent , vFilter , fpCallback){
    var oArgs = g_checkVarType(arguments, {
        '4str'  : ["sEvent:String+", "vFilter:String+", "fpCallback:Function+"],
        '4fun'  : ["sEvent:String+", "vFilter:Function+", "fpCallback:Function+"]
    },"$Element#delegate");
    return this._add("delegate",sEvent,vFilter,fpCallback);
};
//-!nv.$Element.prototype.delegate end!-//

//-!nv.$Element.prototype.undelegate start(nv.$Element.prototype.delegate)!-//
/**
	undelegate() 硫붿꽌�쒕뒗 delegate() 硫붿꽌�쒕줈 �깅줉�� �대깽�� �꾩엫�� �댁젣�쒕떎.

	@method undelegate
	@param {String+} sEvent �대깽�� �꾩엫�� �깅줉�� �� �ъ슜�� �대깽�� �대쫫. on �묐몢�대뒗 �앸왂�쒕떎.
	@param {Variant} [vFilter] �대깽�� �꾩엫�� �깅줉�� �� 吏��뺥븳 �꾪꽣. �뚮씪誘명꽣瑜� �낅젰�섏� �딆쑝硫� �섎━癒쇳듃�� delegate濡� �좊떦�� �대깽�� 以� �뱀젙 �대깽�몄쓽 紐⑤뱺 議곌굔�� �щ씪吏꾨떎.
	@param {Function+} [fCallback] �대깽�� �꾩엫�� �깅줉�� �� 吏��뺥븳 肄쒕갚 �⑥닔.
	@return {this} �대깽�� �꾩엫�� �댁젣�� �몄뒪�댁뒪 �먯떊
	@since 1.4.6
	@see nv.$Element#attach
	@see nv.$Element#detach
	@see nv.$Element#delegate
	@example
		<ul id="parent">
			<li class="odd">1</li>
			<li>2</li>
			<li class="odd">3</li>
			<li>4</li>
		</ul>

		// 肄쒕갚 �⑥닔
		function fnOddClass(eEvent){
			alert("odd �대옒�ㅻ� 媛�吏� li媛� �대┃ �� �� �ㅽ뻾");
		};
		function fnOddClass2(eEvent){
			alert("odd �대옒�ㅻ� 媛�吏� li媛� �대┃ �� �� �ㅽ뻾2");
		};
		function fnOddClass3(eEvent){
			alert("odd �대옒�ㅻ� 媛�吏� li媛� �대┃ �� �� �ㅽ뻾3");
		};

		// �대깽�� �몃━寃뚯씠�� �ъ슜
		$Element("parent").delegate("click", ".odd", fnOddClass);

		// fnOddClass留� �대깽�� �댁젣
		$Element("parent").undelegate("click", ".odd", fnOddClass);
 */
nv.$Element.prototype.undelegate = function(sEvent , vFilter , fpCallback){
    var oArgs = g_checkVarType(arguments, {
        '4str'  : ["sEvent:String+", "vFilter:String+", "fpCallback:Function+"],
        '4fun'  : ["sEvent:String+", "vFilter:Function+", "fpCallback:Function+"],
        'group_for_string'  : ["sEvent:String+", "vFilter:String+"],
        'group_for_function'  : ["sEvent:String+", "vFilter:Function+"]
    },"$Element#undelegate");
    return this._del("delegate",sEvent,vFilter,fpCallback);
};
//-!nv.$Element.prototype.undelegate end!-//

//-!nv.$Element.event_etc.hidden start!-//
nv._p_.customEventAttach = function(sType,sEvent,vFilter,fpCallback,fpCallbackBind,eEle,fpAdd){
    if(!nv._p_.hasCustomEventListener(eEle.__nv__id,sEvent,vFilter)) {
        var CustomEvent = nv._p_.getCustomEvent(sEvent);
        var customInstance = new CustomEvent();
        var events = customInstance.events;

        customInstance.real_listener.push(fpCallback);
        customInstance.wrap_listener.push(fpCallbackBind);

        for(var i = 0, l = events.length ; i < l ; i++){
            customInstance["_fp"+events[i]] = nv.$Fn(customInstance[events[i]],customInstance).bind();
            fpAdd(sType, events[i], vFilter, customInstance["_fp"+events[i]]);
        }
        nv._p_.addCustomEventListener(eEle,eEle.__nv__id,sEvent,vFilter,customInstance);
    } else {
        var customInstance = nv._p_.getCustomEventListener(eEle.__nv__id, sEvent, vFilter).custom;
        if(customInstance.real_listener){
            customInstance.real_listener.push(fpCallback);
            customInstance.wrap_listener.push(fpCallbackBind);
        }
    }
};

nv._p_.normalCustomEventAttach = function(ele,sEvent,nv_id,vFilter,fpCallback,fpCallbackBind){
    if(!nv._p_.normalCustomEvent[sEvent][nv_id]){
        nv._p_.normalCustomEvent[sEvent][nv_id] = {};
        nv._p_.normalCustomEvent[sEvent][nv_id].ele = ele;
        nv._p_.normalCustomEvent[sEvent][nv_id][vFilter] = {};
        nv._p_.normalCustomEvent[sEvent][nv_id][vFilter].real_listener = [];
        nv._p_.normalCustomEvent[sEvent][nv_id][vFilter].wrap_listener = [];
    }
    nv._p_.normalCustomEvent[sEvent][nv_id][vFilter].real_listener.push(fpCallback);
    nv._p_.normalCustomEvent[sEvent][nv_id][vFilter].wrap_listener.push(fpCallbackBind);
};

/**
	�대깽�몃� 異붽��섎뒗 �대� �⑥닔.

	@method _add
	@ignore
	@param {String} sType delegate�몄� �쇰컲 �대깽�몄씤吏� �뺤씤.
	@param {String} sEvent �대깽�몃챸.
	@param {String | Function} vFilter �꾪꽣 �⑥닔.
	@param {Function} fpCallback �대깽�� 肄쒕갚�⑥닔.
	@return {this} �몄뒪�댁뒪 �먯떊
 */

nv.$Element.prototype._add = function(sType, sEvent , vFilter , fpCallback){
    var oManager = nv.$Element.eventManager;
    var realEvent = sEvent;
    sEvent = sEvent.toLowerCase();
    var oEvent = oManager.splitGroup(sEvent);
    sEvent = oEvent.event;
    var sGroup = oEvent.group;
    var ele = this._element;
    var nv_id = ele.__nv__id;
    var oDoc = ele.ownerDocument || ele.document || document;

    if(nv._p_.hasCustomEvent(sEvent)){
        vFilter = vFilter||"_NONE_";
        var fpCallbackBind = nv.$Fn(fpCallback,this).bind();
        nv._p_.normalCustomEventAttach(ele,sEvent,nv_id,vFilter,fpCallback,fpCallbackBind);
        if(nv._p_.getCustomEvent(sEvent)){
            nv._p_.customEventAttach(sType, sEvent,vFilter,fpCallback,fpCallbackBind,ele,nv.$Fn(this._add,this).bind());
        }
    }else{
        if(sEvent == "domready" && nv.$Jindo.isWindow(ele)){
            nv.$Element(oDoc).attach(sEvent, fpCallback);
            return this;
        }

        if(sEvent == "load" && ele === oDoc){
            nv.$Element(window).attach(sEvent, fpCallback);
            return this;
        }

        if((!document.addEventListener)&&("domready"==sEvent)){
            if(window.top != window) throw  nv.$Error(nv.$Except.NOT_WORK_DOMREADY,"$Element#attach");
            nv.$Element._domready(ele, fpCallback);
            return this;
        }

        sEvent = oManager.revisionEvent(sType, sEvent,realEvent);
        fpCallback = oManager.revisionCallback(sType, sEvent, realEvent, fpCallback);

        if(!oManager.isInit(this._key)){
            oManager.init(this._key, ele);
        }

        if(!oManager.hasEvent(this._key, sEvent,realEvent)){
            oManager.initEvent(this, sEvent,realEvent,sGroup);
        }

        if(!oManager.hasGroup(this._key, sEvent, sGroup)){
            oManager.initGroup(this._key, sEvent, sGroup);
        }

        oManager.addEventListener(this._key, sEvent, sGroup, sType, vFilter, fpCallback);
    }


    return this;
};

nv._p_.customEventDetach = function(sType,sEvent,vFilter,fpCallback,eEle,fpDel) {
    var customObj = nv._p_.getCustomEventListener(eEle.__nv__id, sEvent, vFilter);
    var customInstance = customObj.custom;
    var events = customInstance.events;

    for(var i = 0, l = events.length; i < l; i++) {
        fpDel(sType, events[i], vFilter, customInstance["_fp"+events[i]]);
    }
};

/**
	�대깽�몃� ��젣�� �� �ъ슜�섎뒗 �대� �⑥닔.

	@method _del
	@ignore
	@param {String} sType �대깽�� delegate�몄� �쇰컲 �대깽�몄씤吏� �뺤씤.
	@param {String} sEvent �대깽�몃챸.
	@param {String|Function} vFilter �꾪꽣 �⑥닔.
	@param {Function} fpCallback �대깽�� 肄쒕갚�⑥닔.
	@return {this} �몄뒪�댁뒪 �먯떊
 */
nv.$Element.prototype._del = function(sType, sEvent, vFilter, fpCallback){
    var oManager = nv.$Element.eventManager;
    var realEvent = sEvent;
    sEvent = sEvent.toLowerCase();
    var oEvent = oManager.splitGroup(sEvent);
    sEvent = oEvent.event;
    var sGroup = oEvent.group;
    var oDoc = this._element.ownerDocument || this._element.document || document;
    if(nv._p_.hasCustomEvent(sEvent)){
        var nv_id = this._element.__nv__id;
        vFilter = vFilter||"_NONE_";

        var oNormal = nv._p_.getNormalEventListener(nv_id, sEvent, vFilter);



        var aWrap = oNormal.wrap_listener;
        var aReal = oNormal.real_listener;
        var aNewWrap = [];
        var aNewReal = [];

        for(var i = 0, l = aReal.length; i < l; i++){
            if(aReal[i]!=fpCallback){
                aNewWrap.push(aWrap[i]);
                aNewReal.push(aReal[i]);
            }
        }

        if(aNewReal.length==0){
            var oNormalJindo = nv._p_.normalCustomEvent[sEvent][nv_id];
            var count = 0;
            for(var i in oNormalJindo){
                if(i!=="ele"){
                    count++;
                    break;
                }
            }
            if(count === 0){
                delete nv._p_.normalCustomEvent[sEvent][nv_id];
            }else{
                delete nv._p_.normalCustomEvent[sEvent][nv_id][vFilter];
            }
        }

        if(nv._p_.customEvent[sEvent]){
            // var customInstance = nv._p_.getCustomEventListener(nv__id, sEvent, vFilter).custom;
//
            // var aWrap = customInstance.wrap_listener;
            // var aReal = customInstance.real_listener;
            // var aNewWrap = [];
            // var aNewReal = [];
//
            // for(var i = 0, l = aReal.length; i < l; i++){
                // if(aReal[i]!=fpCallback){
                    // aNewWrap.push(aWrap[i]);
                    // aNewReal.push(aReal[i]);
                // }
            // }
            nv._p_.setCustomEventListener(nv_id, sEvent, vFilter, aNewReal, aNewWrap);
            if(aNewReal.length==0){
                nv._p_.customEventDetach(sType, sEvent,vFilter,fpCallback,this._element,nv.$Fn(this._del,this).bind());
                delete nv._p_.customEventStore[nv_id][sEvent][vFilter];
            }
        }

    }else{
        if(sEvent == "domready" && nv.$Jindo.isWindow(this._element)){
            nv.$Element(oDoc).detach(sEvent, fpCallback);
            return this;
        }

        if(sEvent == "load" && this._element === oDoc){
            nv.$Element(window).detach(sEvent, fpCallback);
            return this;
        }

        sEvent = oManager.revisionEvent(sType, sEvent,realEvent);

        if((!document.addEventListener)&&("domready"==sEvent)){
            var aNewDomReady = [];
            var list = nv.$Element._domready.list;
            for(var i=0,l=list.length; i < l ;i++){
                if(list[i]!=fpCallback){
                    aNewDomReady.push(list[i]);
                }
            }
            nv.$Element._domready.list = aNewDomReady;
            return this;
        }
        // if(sGroup === nv._p_.NONE_GROUP && !nv.$Jindo.isFunction(fpCallback)){
        if(sGroup === nv._p_.NONE_GROUP && !nv.$Jindo.isFunction(fpCallback)&&!vFilter){
            throw new nv.$Error(nv.$Except.HAS_FUNCTION_FOR_GROUP,"$Element#"+(sType=="normal"?"detach":"delegate"));
        }

        oManager.removeEventListener(this._key, sEvent, sGroup, sType, vFilter, fpCallback);
    }

    return this;
};

/**
	$Element�� �대깽�몃� 愿�由ы븯�� 媛앹껜.

	@ignore
 */
nv._p_.mouseTouchPointerEvent = function (sEvent){
    var eventMap = {};

    if(window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints > 0) {
        eventMap = {
            "mousedown":"MSPointerDown",
            "mouseup":"MSPointerUp",
            "mousemove":"MSPointerMove",
            "mouseover":"MSPointerOver",
            "mouseout":"MSPointerOut",
            "touchstart":"MSPointerDown",
            "touchend":"MSPointerUp",
            "touchmove":"MSPointerMove",
            "pointerdown":"MSPointerDown",
            "pointerup":"MSPointerUp",
            "pointermove":"MSPointerMove",
            "pointerover":"MSPointerOver",
            "pointerout":"MSPointerOut",
            "pointercancel":"MSPointerCancel"
        };
    } else if(nv._p_._JINDO_IS_MO) {
        eventMap = {
            "mousedown":"touchstart",
            "mouseup":"touchend",
            "mousemove":"touchmove",
            "pointerdown":"touchstart",
            "pointerup":"touchend",
            "pointermove":"touchmove"
        };
    }

    nv._p_.mouseTouchPointerEvent = function(sEvent) {
        return eventMap[sEvent]?eventMap[sEvent]:sEvent;
    };

    return nv._p_.mouseTouchPointerEvent(sEvent);
};

nv.$Element.eventManager = (function() {
    var eventStore = {};

    function bind(fpFunc, oScope, aPram) {
        return function() {
            var args = nv._p_._toArray( arguments, 0);
            if (aPram.length) args = aPram.concat(args);
            return fpFunc.apply(oScope, args);
        };
    }

    return {
        /**
        	mouseenter�� mouseleave �대깽�멸� �녿뒗 釉뚮씪�곗��먯꽌 �대깽�몃� �좊떦 �� �� �숈옉�섍쾶�� 肄쒕갚�⑥닔瑜� 議곗젙�섎뒗 �⑥닔.<br>
	IE�먯꽌 delegate�� mouseenter�� mouseleave�� �ъ슜�� �뚮룄 �ъ슜.

	@method revisionCallback
	@ignore
	@param {String} sType �대깽�� delegate�몄� �쇰컲 �대깽�몄씤吏� �뺤씤.
	@param {String} sEvent �대깽�몃챸
	@param {Function} fpCallback �대깽�� 肄쒕갚�⑥닔
         */
        revisionCallback : function(sType, sEvent, realEvent, fpCallback){
            if((document.addEventListener||nv._p_._JINDO_IS_IE&&(sType=="delegate"))&&(realEvent=="mouseenter"||realEvent=="mouseleave"))
            // ||(nv._p_._JINDO_IS_IE&&(sType=="delegate")&&(realEvent=="mouseenter"||realEvent=="mouseleave")))
               {
                var fpWrapCallback = nv.$Element.eventManager._fireWhenElementBoundary(sType, fpCallback);
                fpWrapCallback._origin_ = fpCallback;
                fpCallback = fpWrapCallback;
            }
            return fpCallback;
        },
        /**
        	mouseenter�� mouseleave �대깽�멸� �녿뒗 釉뚮씪�곗��먯꽌 �먮��덉씠�섑빐二쇰뒗 �⑥닔.

	@method _fireWhenElementBoundary
	@ignore
	@param {String} sType �대깽�� delegate�몄� �쇰컲 �대깽�몄씤吏� �뺤씤.
	@param {Function} fpCallback �대깽�� 肄쒕갚�⑥닔
         */
        _fireWhenElementBoundary : function(sType, fpCallback){
            return function(oEvent) {
                var woRelatedElement = oEvent.relatedElement?nv.$Element(oEvent.relatedElement):null;
                var eElement = oEvent.currentElement;
                if(sType == "delegate"){
                    eElement = oEvent.element;
                }
                if(woRelatedElement && (woRelatedElement.isEqual(eElement) || woRelatedElement.isChildOf(eElement))) return;

                fpCallback(oEvent);
            };
        },
        /**
        	釉뚮씪�곗�留덈떎 李⑥씠�덈뒗 �대깽�� 紐낆쓣 蹂댁젙�섎뒗 �⑥닔.

	@method revisionEvent
	@ignore
	@param {String} sType �대깽�� delegate�몄� �쇰컲 �대깽�몄씤吏� �뺤씤.
	@param {String} sEvent �대깽�몃챸
         */
        revisionEvent : function(sType, sEvent, realEvent){
            if (document.addEventListener !== undefined) {
                this.revisionEvent = function(sType, sEvent, realEvent){

                    // In IE distinguish upper and lower case and if prefix is 'ms' return as well.
                    if(/^ms/i.test(realEvent)){
                        return realEvent;
                    }
                    var customEvent = nv.$Event.hook(sEvent);

                    if(customEvent){
                        if(nv.$Jindo.isFunction(customEvent)){
                            return customEvent();
                        }else{
                            return customEvent;
                        }
                    }

                    sEvent = sEvent.toLowerCase();

                    if (sEvent == "domready" || sEvent == "domcontentloaded") {
                        sEvent = "DOMContentLoaded";
                    }else if (sEvent == "mousewheel" && !nv._p_._JINDO_IS_WK && !nv._p_._JINDO_IS_OP && !nv._p_._JINDO_IS_IE) {
                        /*
                          * IE9�� 寃쎌슦�� DOMMouseScroll�� �숈옉�섏� �딆쓬.
                         */
                        sEvent = "DOMMouseScroll";
                    }else if (sEvent == "mouseenter" && (!nv._p_._JINDO_IS_IE||sType=="delegate")){
                        sEvent = "mouseover";
                    }else if (sEvent == "mouseleave" && (!nv._p_._JINDO_IS_IE||sType=="delegate")){
                        sEvent = "mouseout";
                    }else if(sEvent == "transitionend"||sEvent == "transitionstart"){
                        var sPostfix = sEvent.replace("transition","");
                        var info = nv._p_.getStyleIncludeVendorPrefix();

                        if(info.transition != "transition"){
                            sPostfix = sPostfix.substr(0,1).toUpperCase() + sPostfix.substr(1);
                        }

                        sEvent = info.transition + sPostfix;
                    }else if(sEvent == "animationstart"||sEvent == "animationend"||sEvent == "animationiteration"){
                        var sPostfix = sEvent.replace("animation","");
                        var info = nv._p_.getStyleIncludeVendorPrefix();

                        if(info.animation != "animation"){
                            sPostfix = sPostfix.substr(0,1).toUpperCase() + sPostfix.substr(1);
                        }

                        sEvent = info.animation + sPostfix;
                    }else if(sEvent === "focusin"||sEvent === "focusout"){
                        sEvent = sEvent === "focusin" ? "focus":"blur";

                    /*
                     * IE�먯꽌 9�� �댄븯 踰꾩쟾�먯꽌�� oninput �대깽�몄뿉 ���� fallback�� �꾩슂. IE9�� 寃쎌슦, oninput �대깽�� 吏��먰븯�� input �붿냼�� �댁슜�� backspace �� �깆쑝濡� ��젣�� 諛붾줈 諛섏쁺�섏� �딅뒗 踰꾧렇媛� �덉쓬.
    �곕씪�� oninput �대깽�몃뒗 �ㅼ쓬怨� 媛숈씠 諛붿씤�� �섎룄濡� 蹂�寃쎈맖. - IE9: keyup, IE9 �댄븯 踰꾩쟾: propertychange
                     */
                    } else if(sEvent == "input" && nv._p_._JINDO_IS_IE && document.documentMode <= 9) {
                        sEvent = "keyup";
                    }
                    return nv._p_.mouseTouchPointerEvent(sEvent);
                };
            }else{
                this.revisionEvent = function(sType, sEvent,realEvent){
                    // In IE distinguish upper and lower case and if prefix is 'ms' return as well.
                    if(/^ms/i.test(realEvent)){
                        return realEvent;
                    }
                    var customEvent = nv.$Event.hook(sEvent);
                    if(customEvent){
                        if(nv.$Jindo.isFunction(customEvent)){
                            return customEvent();
                        }else{
                            return customEvent;
                        }
                    }
                    /*
                     * IE�먯꽌 delegate�� mouseenter�� mouseleave�� �ъ슜�� �뚮뒗 mouseover�� mouseleave�� �댁슜�섏뿬 �먮��덉씠�� �섎룄濡� �섏젙�댁빞 ��.
                     */
                    if(sType=="delegate"&&sEvent == "mouseenter") {
                        sEvent = "mouseover";
                    }else if(sType=="delegate"&&sEvent == "mouseleave") {
                        sEvent = "mouseout";
                    } else if(sEvent == "input") {
                        sEvent = "propertychange";
                    }

                    return nv._p_.mouseTouchPointerEvent(sEvent);
                };
            }
            return this.revisionEvent(sType, sEvent,realEvent);
        },
        /**
        			�뚯뒪�몃� �꾪븳 �⑥닔.

			@method test
			@ignore
         */
        test : function(){
            return eventStore;
        },
        /**
        			�ㅼ뿉 �대떦�섎뒗 �⑥닔媛� 珥덇린�� �섏뿀�붿� �뺤씤�섎뒗 �⑥닔.

			@method isInit
			@ignore
			@param {String} sKey �섎━癒쇳듃 �ㅺ컪
         */
        isInit : function(sKey){
            return !!eventStore[sKey];
        },
        /**
        			珥덇린�� �섎뒗 �⑥닔.

			@method init
			@ignore
			@param {String} sKey �섎━癒쇳듃 �ㅺ컪
			@param {Element} eEle �섎━癒쇳듃
         */
        init : function(sKey, eEle){
            eventStore[sKey] = {
                "ele" : eEle,
                "event" : {}
            };
        },
        /**
        			�ㅺ컪�� �대떦�섎뒗 �뺣낫瑜� 諛섑솚.

			@method getEventConfig
			@ignore
			@param {String} sKey �섎━癒쇳듃 �ㅺ컪
         */
        getEventConfig : function(sKey){
            return eventStore[sKey];
        },
        /**
        			�대떦 �ㅼ뿉 �대깽�멸� �덈뒗吏� �뺤씤�섎뒗 �⑥닔.

			@method  hasEvent
			@ignore
			@param {String} sKey �섎━癒쇳듃 �ㅺ컪
			@param {String} sEvent �대깽�몃챸
         */
        hasEvent : function(sKey, sEvent,realEvent){
            if(!document.addEventListener && sEvent.toLowerCase() == "domready"){
                if(nv.$Element._domready.list){
                    return nv.$Element._domready.list.length > 0 ? true : false;
                }else{
                    return false;
                }
            }

            // sEvent = nv.$Element.eventManager.revisionEvent("", sEvent,realEvent);

            try{
                return !!eventStore[sKey]["event"][sEvent];
            }catch(e){
                return false;
            }
        },
        /**
        			�대떦 洹몃９�� �덈뒗吏� �뺤씤�섎뒗 �⑥닔.

			@method hasGroup
			@ignore
			@param {String} sKey �섎━癒쇳듃 �ㅺ컪
			@param {String} sEvent �대깽�� 紐�
			@param {String} sEvent 洹몃９紐�
         */
        hasGroup : function(sKey, sEvent, sGroup){
            return !!eventStore[sKey]["event"][sEvent]["type"][sGroup];
        },
        createEvent : function(wEvent,realEvent,element,delegatedElement){
            // wEvent = wEvent || window.event;
            if (wEvent.currentTarget === undefined) {
                wEvent.currentTarget = element;
            }
            var weEvent = nv.$Event(wEvent);
            if(!weEvent.currentElement){
                weEvent.currentElement = element;
            }
            weEvent.realType = realEvent;
            weEvent.delegatedElement = delegatedElement;
            return weEvent;
        },
        /**
        			�대깽�몃� 珥덇린�� �섎뒗 �⑥닔

			@method initEvent
			@ignore
			@param {Hash+} oThis this 媛앹껜
			@param {String} sEvent �대깽�� 紐�
			@param {String} sEvent 洹몃９紐�
         */
        initEvent : function(oThis, sEvent, realEvent, sGroup){
            var sKey = oThis._key;
            var oEvent = eventStore[sKey]["event"];
            var that = this;

            var fAroundFunc = bind(function(sEvent,realEvent,scope,wEvent){
                wEvent = wEvent || window.event;
                var oEle = wEvent.target || wEvent.srcElement;
                var oManager = nv.$Element.eventManager;
                var oConfig = oManager.getEventConfig((wEvent.currentTarget||this._element).__nv__id);

                var oType = oConfig["event"][sEvent].type;
                for(var i in oType){
                    if(oType.hasOwnProperty(i)){
                        var aNormal = oType[i].normal;
                        for(var j = 0, l = aNormal.length; j < l; j++){
                            aNormal[j].call(this,scope.createEvent(wEvent,realEvent,this._element,null));
                        }
                        var oDelegate = oType[i].delegate;
                        var aResultFilter;
                        var afpFilterCallback;
                        for(var k in oDelegate){
                            if(oDelegate.hasOwnProperty(k)){
                                aResultFilter = oDelegate[k].checker(oEle);
                                if(aResultFilter[0]){
                                    afpFilterCallback = oDelegate[k].callback;
                                    var weEvent;//.element = aResultFilter[1];
                                    for(var m = 0, leng = afpFilterCallback.length; m < leng ; m++){
                                        weEvent = scope.createEvent(wEvent,realEvent,this._element,aResultFilter[1]);
                                        weEvent.element = aResultFilter[1];
                                        afpFilterCallback[m].call(this, weEvent);
                                    }
                                }
                            }
                        }
                    }

                }
            },oThis,[sEvent,realEvent,this]);

            oEvent[sEvent] = {
                "listener" : fAroundFunc,
                "type" :{}
            }   ;

            nv.$Element._eventBind(oThis._element,sEvent,fAroundFunc,(realEvent==="focusin" || realEvent==="focusout"));

        },
        /**
        			洹몃９�� 珥덇린�� �섎뒗 �⑥닔

			@method initGroup
			@ignore
			@param {String} sKey �섎━癒쇳듃 �ㅺ컪
			@param {String} sEvent �대깽�� 紐�
			@param {String} sEvent 洹몃９紐�
         */
        initGroup : function(sKey, sEvent, sGroup){
            var oType = eventStore[sKey]["event"][sEvent]["type"];
            oType[sGroup] = {
                "normal" : [],
                "delegate" :{}
            };
        },
        /**
        			�대깽�몃� 異붽��섎뒗 �⑥닔

			@method addEventListener
			@ignore
			@param {String} ssKey �섎━癒쇳듃 �� 媛�
			@param {String} sEvent �대깽�몃챸
			@param {String} sGroup 洹몃９紐�
			@param {String} sType delegate�몄� �쇰컲 �대깽�몄씤吏� �뺤씤.
			@param {Function} vFilter �꾪꽣留곹븯�� css�좏깮�� �뱀� �꾪꽣�⑥닔
			@param {Function} fpCallback 肄쒕갚�⑥닔
         */
        addEventListener : function(sKey, sEvent, sGroup, sType, vFilter, fpCallback){

            var oEventInfo = eventStore[sKey]["event"][sEvent]["type"][sGroup];

            if(sType === "normal"){
                oEventInfo.normal.push(fpCallback);
            }else if(sType === "delegate"){
                if(!this.hasDelegate(oEventInfo,vFilter)){
                    this.initDelegate(eventStore[sKey].ele,oEventInfo,vFilter);
                }
                this.addDelegate(oEventInfo,vFilter,fpCallback);
            }

        },
        /**
         			delegate媛� �덈뒗吏� �뺤씤�섎뒗 �⑥닔.

			@method hasDelegate
			@ignore
			@param {Hash+} oEventInfo �대깽�� �뺣낫媛앹껜
			@param {Function} vFilter �꾪꽣留곹븯�� css�좏깮�� �뱀� �꾪꽣�⑥닔
         */
        hasDelegate : function(oEventInfo,vFilter){
            return !!oEventInfo.delegate[vFilter];
        },
        containsElement : function(eOwnEle, eTarget, sCssquery,bContainOwn){
            if(eOwnEle == eTarget&&bContainOwn){
                return nv.$$.test(eTarget,sCssquery);
            }
            var aSelectElement = nv.$$(sCssquery,eOwnEle);
            for(var i = 0, l = aSelectElement.length; i < l; i++){
                if(aSelectElement[i] == eTarget){
                    return true;
                }
            }
            return false;
        },
        /**
        			delegate瑜� 珥덇린�� �섎뒗 �⑥닔.

			@method initDelegate
			@ignore
			@param {Hash+} eOwnEle
			@param {Hash+} oEventInfo �대깽�� �뺣낫媛앹껜
			@param {Function} vFilter �꾪꽣留곹븯�� css�좏깮�� �뱀� �꾪꽣�⑥닔
         */
        initDelegate : function(eOwnEle,oEventInfo,vFilter){
            var fpCheck;
            if(nv.$Jindo.isString(vFilter)){
                fpCheck = bind(function(eOwnEle,sCssquery,oEle){
                    var eIncludeEle = oEle;
                    var isIncludeEle = this.containsElement(eOwnEle, oEle, sCssquery,true);
                    if(!isIncludeEle){
                        var aPropagationElements = this._getParent(eOwnEle,oEle);
                        for(var i = 0, leng = aPropagationElements.length ; i < leng ; i++){
                            eIncludeEle = aPropagationElements[i];
                            if(this.containsElement(eOwnEle, eIncludeEle, sCssquery)){
                                isIncludeEle = true;
                                break;
                            }
                        }
                    }
                    return [isIncludeEle,eIncludeEle];
                },this,[eOwnEle,vFilter]);
            }else{
                fpCheck = bind(function(eOwnEle,fpFilter,oEle){
                    var eIncludeEle = oEle;
                    var isIncludeEle = fpFilter(eOwnEle,oEle);
                    if(!isIncludeEle){
                        var aPropagationElements = this._getParent(eOwnEle,oEle);
                        for(var i = 0, leng = aPropagationElements.length ; i < leng ; i++){
                            eIncludeEle = aPropagationElements[i];
                            if(fpFilter(eOwnEle,eIncludeEle)){
                                isIncludeEle = true;
                                break;
                            }
                        }
                    }
                    return [isIncludeEle,eIncludeEle];
                },this,[eOwnEle,vFilter]);
            }
            oEventInfo.delegate[vFilter] = {
                "checker" : fpCheck,
                "callback" : []
            };
        },
        /**
        			delegate瑜� 異붽��섎뒗 �⑥닔.

			@method addDelegate
			@ignore
			@param {Hash+} oEventInfo �대깽�� �뺣낫媛앹껜
			@param {Function} vFilter �꾪꽣留곹븯�� css�좏깮�� �뱀� �꾪꽣�⑥닔
			@param {Function} fpCallback 肄쒕갚�⑥닔
         */
        addDelegate : function(oEventInfo,vFilter,fpCallback){
            oEventInfo.delegate[vFilter].callback.push(fpCallback);
        },
        /**
        			�대깽�몃� �댁젣�섎뒗 �⑥닔.

			@method removeEventListener
			@ignore
			@param {String} ssKey �섎━癒쇳듃 �� 媛�
			@param {String} sEvent �대깽�몃챸
			@param {String} sGroup 洹몃９紐�
			@param {String} sType delegate�몄� �쇰컲 �대깽�몄씤吏� �뺤씤.
			@param {Function} vFilter �꾪꽣留곹븯�� css�좏깮�� �뱀� �꾪꽣�⑥닔
			@param {Function} fpCallback 肄쒕갚�⑥닔
         */
        removeEventListener : function(sKey, sEvent, sGroup, sType, vFilter, fpCallback){
            var oEventInfo;
            try{
                oEventInfo = eventStore[sKey]["event"][sEvent]["type"][sGroup];
            }catch(e){
                return;
            }
            var aNewCallback = [];
            var aOldCallback;
            if(sType === "normal"){
                aOldCallback = oEventInfo.normal;
            }else{
                // console.log(oEventInfo.delegate,oEventInfo.delegate[vFilter],vFilter);
                aOldCallback  = oEventInfo.delegate[vFilter].callback;
            }
            if (sEvent == nv._p_.NONE_GROUP || nv.$Jindo.isFunction(fpCallback)) {
                for(var i = 0, l = aOldCallback.length; i < l; i++){
                    if((aOldCallback[i]._origin_||aOldCallback[i]) != fpCallback){
                        aNewCallback.push(aOldCallback[i]);
                    }
                }
            }
            if(sType === "normal"){

                delete oEventInfo.normal;
                oEventInfo.normal = aNewCallback;
            }else if(sType === "delegate"){
                delete oEventInfo.delegate[vFilter].callback;
                oEventInfo.delegate[vFilter].callback = aNewCallback;
            }

            this.cleanUp(sKey, sEvent);
        },
        /**
        			紐⑤뱺 �대깽�몃� �댁젣�섎뒗 �⑥닔(�덈� �ъ슜遺덇�.)

			@method cleanUpAll
			@ignore
         */
        cleanUpAll : function(){
            var oEvent;
            for(var sKey in eventStore){
                if (eventStore.hasOwnProperty(sKey)) {
                    this.cleanUpUsingKey(sKey, true);
                }
            }
        },
        /**
        			�섎━癒쇳듃 �ㅻ� �댁슜�섏뿬 紐⑤뱺 �대깽�몃� ��젣�� �� �ъ슜.

			@method cleanUpUsingKey
			@ignore
			@param {String} sKey
         */
        cleanUpUsingKey : function(sKey, bForce){
            var oEvent;

            if(!eventStore[sKey] || !eventStore[sKey].event){
            	return;
            }

            oEvent = eventStore[sKey].event;

            for(var sEvent in oEvent){
                if (oEvent.hasOwnProperty(sEvent)) {
                    this.cleanUp(sKey, sEvent, bForce);
                }
            }
        },
        /**
        			�ㅼ뿉 �대떦�섎뒗 紐⑤뱺 �대깽�몃� �댁젣�섎뒗 �⑥닔(�덈� �ъ슜遺덇�)

			@method cleanUp
			@ignore
			@param {String} ssKey �섎━癒쇳듃 �� 媛�
			@param {String} sEvent �대깽�몃챸
			@param {Boolean} bForce 媛뺤젣濡� �댁젣�� 寃껋씤吏� �щ�
         */
        cleanUp : function(sKey, sEvent, bForce){
            var oTypeInfo;
            try{
                oTypeInfo = eventStore[sKey]["event"][sEvent]["type"];
            }catch(e){
                return;

            }
            var oEventInfo;
            var bHasEvent = false;
            if(!bForce){
                for(var i in oTypeInfo){
                    if (oTypeInfo.hasOwnProperty(i)) {
                        oEventInfo = oTypeInfo[i];
                        if(oEventInfo.normal.length){
                            bHasEvent = true;
                            break;
                        }
                        var oDele = oEventInfo.delegate;
                        for(var j in oDele){
                            if (oDele.hasOwnProperty(j)) {
                                if(oDele[j].callback.length){
                                    bHasEvent = true;
                                    break;
                                }
                            }
                        }
                        if(bHasEvent) break;

                    }
                }
            }
            if(!bHasEvent){
                nv.$Element._unEventBind(eventStore[sKey].ele, sEvent, eventStore[sKey]["event"][sEvent]["listener"]);
                delete eventStore[sKey]["event"][sEvent];
                var bAllDetach = true;
                var oEvent = eventStore[sKey]["event"];
                for(var k in oEvent){
                    if (oEvent.hasOwnProperty(k)) {
                        bAllDetach = false;
                        break;
                    }
                }
                if(bAllDetach){
                    delete eventStore[sKey];
                }
            }
        },
        /**
        			�대깽�� 紐낃낵 洹몃９�� 援щ텇�섎뒗 �⑥닔.

			@method splitGroup
			@ignore
			@param {String} sEvent �대깽�몃챸
         */
        splitGroup : function(sEvent){
            var aMatch = /\s*(.+?)\s*\(\s*(.*?)\s*\)/.exec(sEvent);
            if(aMatch){
                return {
                    "event" : aMatch[1].toLowerCase(),
                    "group" : aMatch[2].toLowerCase()
                };
            }else{
                return {
                    "event" : sEvent.toLowerCase(),
                    "group" : nv._p_.NONE_GROUP
                };
            }
        },
        /**
        			delegate�먯꽌 遺�紐⑤� 李얜뒗 �⑥닔.

			@method _getParent
			@ignore
			@param {Element} oOwnEle �먯떊�� �섎━癒쇳듃
			@param {Element} oEle 鍮꾧탳 �섎━癒쇳듃
         */
        _getParent : function(oOwnEle, oEle){
            var e = oOwnEle;
            var a = [], p = null;
            var oDoc = oEle.ownerDocument || oEle.document || document;
            while (oEle.parentNode && p != e) {
                p = oEle.parentNode;
                if (p == oDoc.documentElement) break;
                a[a.length] = p;
                oEle = p;
            }

            return a;
        }
    };
})();
/*
// $Element�� 蹂닿� 援ъ“.
//
// {
//	"key" : {
//		"ele" : ele,
//		"event" : {
//			"click":{
//				"listener" : function(){},
//				"type":{
//					"-none-" : {
//						"normal" : [],
//						"delegate" :{
//							"vFilter" :{
//								"checker" : function(){},
//								"callback" : [function(){}]
//							}
//
//						}
//					}
//				}
//			}
//		}
//	}
//}
 */
//-!nv.$Element.event_etc.hidden end!-//

//-!nv.$Element.domready.hidden start!-//
/**
	Emulates the domready (=DOMContentLoaded) event in Internet Explorer.

	@method _domready
	@filter desktop
	@ignore
*/
nv.$Element._domready = function(doc, func) {
    if (nv.$Element._domready.list === undefined) {
        var f = null;

        nv.$Element._domready.list = [func];

        // use the trick by Diego Perini
        // http://javascript.nwbox.com/IEContentLoaded/
        var done = false, execFuncs = function(){
            if(!done) {
                done = true;
                var l = nv.$Element._domready.list.concat();
                var evt = {
                    type : "domready",
                    target : doc,
                    currentTarget : doc
                };

                while(f = l.shift()) f(evt);
            }
        };

        (function (){
            try {
                doc.documentElement.doScroll("left");
            } catch(e) {
                setTimeout(arguments.callee, 50);
                return;
            }
            execFuncs();
        })();

        // trying to always fire before onload
        doc.onreadystatechange = function() {
            if (doc.readyState == 'complete') {
                doc.onreadystatechange = null;
                execFuncs();
            }
        };

    } else {
        nv.$Element._domready.list.push(func);
    }
};

//-!nv.$Element.domready.hidden end!-//



/**
 	@fileOverview $Element�� �뺤옣 硫붿꽌�쒕� �뺤쓽�� �뚯씪
	@name element.extend.js
	@author NAVER Ajax Platform
 */

//-!nv.$Element.prototype.appear start(nv.$Element.prototype.opacity,nv.$Element.prototype.show)!-//
/**
 	appear() 硫붿꽌�쒕뒗 HTML �붿냼瑜� �쒖꽌�� �섑��섍쾶 �쒕떎(Fade-in �④낵)

	@method appear
	@param {Numeric} [nDuration] HTML �붿냼媛� �꾩쟾�� �섑��� �뚭퉴吏� 嫄몃━�� �쒓컙. �⑥쐞�� 珥�(second)�대떎.
	@param {Function} [fCallback] HTML �붿냼媛� �꾩쟾�� �섑��� �꾩뿉 �ㅽ뻾�� 肄쒕갚 �⑥닔.
	@return {this} Fade-in �④낵瑜� �곸슜�� �몄뒪�댁뒪 �먯떊
	@remark
		<ul class="disc">
			<li>�명꽣�� �듭뒪�뚮줈�� 6 踰꾩쟾�먯꽌 filter瑜� �ъ슜�섎㈃�� �대떦 �붿냼媛� position �띿꽦�� 媛�吏�怨� �덉쑝硫� �щ씪吏��� 臾몄젣媛� �덈떎. �� 寃쎌슦�먮뒗 HTML �붿냼�� position �띿꽦�� �놁뼱�� �뺤긽�곸쑝濡� �ъ슜�� �� �덈떎.</li>
			<li>Webkit 湲곕컲�� 釉뚮씪�곗�(Safari 5 踰꾩쟾 �댁긽, Mobile Safari, Chrome, Mobile Webkit), Opear 10.60 踰꾩쟾 �댁긽�� 釉뚮씪�곗��먯꽌�� CSS3 transition �띿꽦�� �ъ슜�쒕떎. 洹� �댁쇅�� 釉뚮씪�곗��먯꽌�� �먮컮�ㅽ겕由쏀듃瑜� �ъ슜�쒕떎.</li>
		</ul>
	@see http://www.w3.org/TR/css3-transitions/ CSS Transitions - W3C
	@see nv.$Element#show
	@see nv.$Element#disappear
	@example
		$Element("sample1").appear(5, function(){
			$Element("sample2").appear(3);
		});

		//Before
		<div style="display: none; background-color: rgb(51, 51, 153); width: 100px; height: 50px;" id="sample1">
			<div style="display: none; background-color: rgb(165, 10, 81); width: 50px; height: 20px;" id="sample2">
			</div>
		</div>

		//After(1) : sample1 �붿냼媛� �섑���
		<div style="display: block; background-color: rgb(51, 51, 153); width: 100px; height: 50px; opacity: 1;" id="sample1">
			<div style="display: none; background-color: rgb(165, 10, 81); width: 50px; height: 20px;" id="sample2">
			</div>
		</div>

		//After(2) : sample2 �붿냼媛� �섑���
		<div style="display: block; background-color: rgb(51, 51, 153); width: 100px; height: 50px; opacity: 1;" id="sample1">
			<div style="display: block; background-color: rgb(165, 10, 81); width: 50px; height: 20px; opacity: 1;" id="sample2">
			</div>
		</div>
 */
nv.$Element.prototype.appear = function(duration, callback) {
    //-@@$Element.appear-@@//
    var oTransition = nv._p_.getStyleIncludeVendorPrefix();
    var name = oTransition.transition;
    var endName = name == "transition" ? "end" : "End";

    function appear() {
        var oArgs = g_checkVarType(arguments, {
            '4voi' : [ ],
            '4num' : [ 'nDuration:Numeric'],
            '4fun' : [ 'nDuration:Numeric' ,'fpCallback:Function+']
        },"$Element#appear");
        switch(oArgs+""){
            case "4voi":
                duration = 0.3;
                callback = function(){};
                break;
            case "4num":
                duration = oArgs.nDuration;
                callback = function(){};
                break;
            case "4fun":
                duration = oArgs.nDuration;
                callback = oArgs.fpCallback;

        }
        return [duration, callback];
    }

    if(oTransition.transition) {
        nv.$Element.prototype.appear = function(duration, callback) {
            var aOption = appear.apply(this,nv._p_._toArray(arguments));
            duration = aOption[0];
            callback = aOption[1];
            var self = this;

            if(this.visible()){

                setTimeout(function(){
                    callback.call(self,self);
                },16);

                return this;
            }


            var ele = this._element;
            var name = oTransition.transition;
            var bindFunc = function(){
                self.show();
                ele.style[name + 'Property'] = '';
                ele.style[name + 'Duration'] = '';
                ele.style[name + 'TimingFunction'] = '';
                ele.style.opacity = '';
                callback.call(self,self);
                ele.removeEventListener(name+endName, arguments.callee , false );
            };
            if(!this.visible()){
                ele.style.opacity = ele.style.opacity||0;
                self.show();
            }
            ele.addEventListener( name+endName, bindFunc , false );
            ele.style[name + 'Property'] = 'opacity';
            ele.style[name + 'Duration'] = duration+'s';
            ele.style[name + 'TimingFunction'] = 'linear';

            nv._p_.setOpacity(ele,"1");
            return this;
        };
    } else {
        nv.$Element.prototype.appear = function(duration, callback) {
            var aOption = appear.apply(this,nv._p_._toArray(arguments));
            duration = aOption[0];
            callback = aOption[1];
            var self = this;
            var op   = this.opacity();
            if(this._getCss(this._element,"display")=="none") op = 0;

            if (op == 1) return this;
            try { clearTimeout(this._fade_timer); } catch(e){}

            var step = (1-op) / ((duration||0.3)*100);
            var func = function(){
                op += step;
                self.opacity(op);

                if (op >= 1) {
                    self._element.style.filter="";
                    callback.call(self,self);
                } else {
                    self._fade_timer = setTimeout(func, 10);
                }
            };

            this.show();
            func();
            return this;
        };
    }
    return this.appear.apply(this,arguments);

};
//-!nv.$Element.prototype.appear end!-//

//-!nv.$Element.prototype.disappear start(nv.$Element.prototype.opacity)!-//
/**
 	disappear() 硫붿꽌�쒕뒗 HTML �붿냼瑜� �쒖꽌�� �щ씪吏�寃� �쒕떎(Fade-out �④낵).

	@method disappear
	@param {Numeric} [nDuration] HTML �붿냼 �꾩쟾�� �щ씪吏� �뚭퉴吏� 嫄몃━�� �쒓컙. (�⑥쐞 珥�)
	@param {Function} [fCallback] HTML �붿냼媛� �꾩쟾�� �щ씪吏� �꾩뿉 �ㅽ뻾�� 肄쒕갚 �⑥닔.
	@return {this} Fade-out �④낵瑜� �곸슜�� �몄뒪�댁뒪 �먯떊
	@remark
		<ul class="disc">
			<li>HTML �붿냼媛� �꾩쟾�� �щ씪吏�硫� �대떦 �붿냼�� display �띿꽦�� none�쇰줈 蹂��쒕떎.</li>
			<li>Webkit 湲곕컲�� 釉뚮씪�곗�(Safari 5 踰꾩쟾 �댁긽, Mobile Safari, Chrome, Mobile Webkit), Opear 10.6 踰꾩쟾 �댁긽�� 釉뚮씪�곗��먯꽌�� CSS3 transition �띿꽦�� �ъ슜�쒕떎. 洹� �댁쇅�� 釉뚮씪�곗��먯꽌�� �먮컮�ㅽ겕由쏀듃瑜� �ъ슜�쒕떎.</li>
		</ul>
	@see http://www.w3.org/TR/css3-transitions/ CSS Transitions - W3C
	@see nv.$Element#hide
	@see nv.$Element#appear
	@example
		$Element("sample1").disappear(5, function(){
			$Element("sample2").disappear(3);
		});

		//Before
		<div id="sample1" style="background-color: rgb(51, 51, 153); width: 100px; height: 50px;">
		</div>
		<div id="sample2" style="background-color: rgb(165, 10, 81); width: 100px; height: 50px;">
		</div>

		//After(1) : sample1 �붿냼媛� �щ씪吏�
		<div id="sample1" style="background-color: rgb(51, 51, 153); width: 100px; height: 50px; opacity: 1; display: none;">
		</div>
		<div id="sample2" style="background-color: rgb(165, 10, 81); width: 100px; height: 50px;">
		</div>

		//After(2) : sample2 �붿냼媛� �щ씪吏�
		<div id="sample1" style="background-color: rgb(51, 51, 153); width: 100px; height: 50px; opacity: 1; display: none;">
		</div>
		<div id="sample2" style="background-color: rgb(165, 10, 81); width: 100px; height: 50px; opacity: 1; display: none;">
		</div>
 */
nv.$Element.prototype.disappear = function(duration, callback) {
    //-@@$Element.disappear-@@//
    var oTransition = nv._p_.getStyleIncludeVendorPrefix();
    var name = oTransition.transition;
    var endName = name == "transition" ? "end" : "End";

    function disappear(){
        var oArgs = g_checkVarType(arguments, {
            '4voi' : [ ],
            '4num' : [ 'nDuration:Numeric'],
            '4fun' : [ 'nDuration:Numeric' ,'fpCallback:Function+']
        },"$Element#disappear");
        switch(oArgs+""){
            case "4voi":
                duration = 0.3;
                callback = function(){};
                break;
            case "4num":
                duration = oArgs.nDuration;
                callback = function(){};
                break;
            case "4fun":
                duration = oArgs.nDuration;
                callback = oArgs.fpCallback;

        }
        return [duration, callback];
    }
    if (oTransition.transition) {
        nv.$Element.prototype.disappear = function(duration, callback) {
            var aOption = disappear.apply(this,nv._p_._toArray(arguments));
            duration = aOption[0];
            callback = aOption[1];

            var self = this;

            if(!this.visible()){

                setTimeout(function(){
                    callback.call(self,self);
                },16);

                return this;
            }

            // endName = "End";
            // var name = "MozTransition";
            var name = oTransition.transition;
            var ele = this._element;
            var bindFunc = function(){
                self.hide();
                ele.style[name + 'Property'] = '';
                ele.style[name + 'Duration'] = '';
                ele.style[name + 'TimingFunction'] = '';
                ele.style.opacity = '';
                callback.call(self,self);
                ele.removeEventListener(name+endName, arguments.callee , false );
            };

            ele.addEventListener( name+endName, bindFunc , false );
            ele.style[name + 'Property'] = 'opacity';
            ele.style[name + 'Duration'] = duration+'s';
            ele.style[name + 'TimingFunction'] = 'linear';

            nv._p_.setOpacity(ele,'0');
            return this;
        };
    }else{
        nv.$Element.prototype.disappear = function(duration, callback) {
            var aOption = disappear.apply(this,nv._p_._toArray(arguments));
            duration = aOption[0];
            callback = aOption[1];

            var self = this;
            var op   = this.opacity();

            if (op == 0) return this;
            try { clearTimeout(this._fade_timer); } catch(e){}

            var step = op / ((duration||0.3)*100);
            var func = function(){
                op -= step;
                self.opacity(op);

                if (op <= 0) {
                    self._element.style.display = "none";
                    self.opacity(1);
                    callback.call(self,self);
                } else {
                    self._fade_timer = setTimeout(func, 10);
                }
            };

            func();
            return this;
        };
    }
    return this.disappear.apply(this,arguments);
};
//-!nv.$Element.prototype.disappear end!-//

//-!nv.$Element.prototype.offset start!-//
/**
 	offset() 硫붿꽌�쒕뒗 HTML �붿냼�� �꾩튂瑜� 媛��몄삩��.

	@method offset
	@return {Object} HTML �붿냼�� �꾩튂 媛믪쓣 媛앹껜濡� 諛섑솚�쒕떎.
		@return {Number} .top 臾몄꽌�� 留� �꾩뿉�� HTML �붿냼�� �� 遺�遺꾧퉴吏��� 嫄곕━
		@return {Number} .left 臾몄꽌�� �쇱そ 媛��μ옄由ъ뿉�� HTML �붿냼�� �쇱そ 媛��μ옄由ш퉴吏��� 嫄곕━
	@remark
		<ul class="disc">
			<li>�꾩튂瑜� 寃곗젙�섎뒗 湲곗��먯� 釉뚮씪�곗�媛� �섏씠吏�瑜� �쒖떆�섎뒗 �붾㈃�� �쇱そ �� 紐⑥꽌由ъ씠��.</li>
			<li>HTML �붿냼媛� 蹂댁씠�� �곹깭(display)�먯꽌 �곸슜�댁빞 �쒕떎. �붿냼媛� �붾㈃�� 蹂댁씠吏� �딆쑝硫� �뺤긽�곸쑝濡� �숈옉�섏� �딆쓣 �� �덈떎.</li>
			<li>�쇰� 釉뚮씪�곗��� �쇰� �곹솴�먯꽌 inline �붿냼�� ���� �꾩튂瑜� �щ컮瑜닿쾶 援ы븯吏� 紐삵븯�� 臾몄젣媛� �덉쑝硫�, �� 寃쎌슦 �대떦 �붿냼�� position �띿꽦�� relative 媛믪쑝濡� 諛붽퓭�� �닿껐�� �� �덈떎.</li>
		</ul>
	@example
		<style type="text/css">
			div { background-color:#2B81AF; width:20px; height:20px; float:left; left:100px; top:50px; position:absolute;}
		</style>

		<div id="sample"></div>

		// �꾩튂 媛� 議고쉶
		$Element("sample").offset(); // { left=100, top=50 }
 */
/**
 	offset() 硫붿꽌�쒕뒗 HTML �붿냼�� �꾩튂瑜� �ㅼ젙�쒕떎.

	@method offset
	@param {Numeric} nTop 臾몄꽌�� 留� �꾩뿉�� HTML �붿냼�� �� 遺�遺꾧퉴吏��� 嫄곕━. �⑥쐞�� �쎌�(px)�대떎.
	@param {Numeric} nLeft 臾몄꽌�� �쇱そ 媛��μ옄由ъ뿉�� HTML �붿냼�� �쇱そ 媛��μ옄由ш퉴吏��� 嫄곕━. �⑥쐞�� �쎌�(px)�대떎.
	@return {this} �꾩튂 媛믪쓣 諛섏쁺�� �몄뒪�댁뒪 �먯떊
	@remark
		<ul class="disc">
			<li>�꾩튂瑜� 寃곗젙�섎뒗 湲곗��먯� 釉뚮씪�곗�媛� �섏씠吏�瑜� �쒖떆�섎뒗 �붾㈃�� �쇱そ �� 紐⑥꽌由ъ씠��.</li>
			<li>HTML �붿냼媛� 蹂댁씠�� �곹깭(display)�먯꽌 �곸슜�댁빞 �쒕떎. �붿냼媛� �붾㈃�� 蹂댁씠吏� �딆쑝硫� �뺤긽�곸쑝濡� �숈옉�섏� �딆쓣 �� �덈떎.</li>
			<li>�쇰� 釉뚮씪�곗��� �쇰� �곹솴�먯꽌 inline �붿냼�� ���� �꾩튂瑜� �щ컮瑜닿쾶 援ы븯吏� 紐삵븯�� 臾몄젣媛� �덉쑝硫�, �� 寃쎌슦 �대떦 �붿냼�� position �띿꽦�� relative 媛믪쑝濡� 諛붽퓭�� �닿껐�� �� �덈떎.</li>
		</ul>
	@example
		<style type="text/css">
			div { background-color:#2B81AF; width:20px; height:20px; float:left; left:100px; top:50px; position:absolute;}
		</style>

		<div id="sample"></div>

		// �꾩튂 媛� �ㅼ젙
		$Element("sample").offset(40, 30);

		//Before
		<div id="sample"></div>

		//After
		<div id="sample" style="top: 40px; left: 30px;"></div>
 */
nv.$Element.prototype.offset = function(nTop, nLeft) {
    //-@@$Element.offset-@@//
    var oArgs = g_checkVarType(arguments, {
        'g' : [ ],
        's' : [ 'nTop:Numeric', 'nLeft:Numeric']
    },"$Element#offset");

    switch(oArgs+""){
        case "g":
            return this.offset_get();

        case "s":
            return this.offset_set(oArgs.nTop, oArgs.nLeft);

    }
};

nv.$Element.prototype.offset_set = function(nTop,nLeft) {
    var oEl = this._element;
    var oPhantom = null;

    if (isNaN(parseFloat(this._getCss(oEl,'top')))) oEl.style.top = "0px";
    if (isNaN(parseFloat(this._getCss(oEl,'left')))) oEl.style.left = "0px";

    var oPos = this.offset_get();
    var oGap = { top : nTop - oPos.top, left : nLeft - oPos.left };
    oEl.style.top = parseFloat(this._getCss(oEl,'top')) + oGap.top + 'px';
    oEl.style.left = parseFloat(this._getCss(oEl,'left')) + oGap.left + 'px';

    return this;
};

nv.$Element.prototype.offset_get = function(nTop,nLeft) {
    var oEl = this._element,
        oPhantom = null,
        bIE = nv._p_._JINDO_IS_IE,
        nVer = 0;

    if(bIE) {
        nVer = document.documentMode || nv.$Agent().navigator().version;
    }

    var oPos = { left : 0, top : 0 },
        oDoc = oEl.ownerDocument || oEl.document || document,
        oHtml = oDoc.documentElement,
        oBody = oDoc.body;

    if(oEl.getBoundingClientRect) { // has getBoundingClientRect
        if(!oPhantom) {
            var bHasFrameBorder = (window == top);

            if(!bHasFrameBorder) {
                try {
                    bHasFrameBorder = (window.frameElement && window.frameElement.frameBorder == 1);
                } catch(e){}
            }

            if((bIE && nVer < 8 && window.external) && bHasFrameBorder&&document.body.contains(oEl)) {
                oPhantom = { left: 2, top: 2 };
            } else {
                oPhantom = { left: 0, top: 0 };
            }
        }

        var box;

        try {
            box = oEl.getBoundingClientRect();
        } catch(e) {
            box = { left: 0, top: 0};
        }

        if (oEl !== oHtml && oEl !== oBody) {
            oPos.left = box.left - oPhantom.left;
            oPos.top = box.top - oPhantom.top;
            oPos.left += oHtml.scrollLeft || oBody.scrollLeft;
            oPos.top += oHtml.scrollTop || oBody.scrollTop;

        }

    } else if (oDoc.getBoxObjectFor) { // has getBoxObjectFor
        var box = oDoc.getBoxObjectFor(oEl),
            vpBox = oDoc.getBoxObjectFor(oHtml || oBody);

        oPos.left = box.screenX - vpBox.screenX;
        oPos.top = box.screenY - vpBox.screenY;

    } else {
        for(var o = oEl; o; o = o.offsetParent) {
            oPos.left += o.offsetLeft;
            oPos.top += o.offsetTop;
        }

        for(var o = oEl.parentNode; o; o = o.parentNode) {
            if (o.tagName == 'BODY') break;
            if (o.tagName == 'TR') oPos.top += 2;

            oPos.left -= o.scrollLeft;
            oPos.top -= o.scrollTop;
        }
    }

    return oPos;
};
//-!nv.$Element.prototype.offset end!-//

//-!nv.$Element.prototype.evalScripts start!-//
/**
 	evalScripts() 硫붿꽌�쒕뒗 臾몄옄�댁뿉 �ы븿�� JavaScript 肄붾뱶瑜� �ㅽ뻾�쒕떎.<br>
	&lt;script&gt; �쒓렇媛� �ы븿�� 臾몄옄�댁쓣 �뚮씪誘명꽣濡� 吏��뺥븯硫�, &lt;script&gt; �덉뿉 �덈뒗 �댁슜�� �뚯떛�섏뿬 eval() 硫붿꽌�쒕� �섑뻾�쒕떎.

	@method evalScripts
	@param {String+} sHTML &lt;script&gt; �붿냼媛� �ы븿�� HTML 臾몄옄��.
	@return {this} �몄뒪�댁뒪 �먯떊
	@example
		// script �쒓렇媛� �ы븿�� 臾몄옄�댁쓣 吏���
		var response = "<script type='text/javascript'>$Element('sample').appendHTML('<li>4</li>')</script>";

		$Element("sample").evalScripts(response);

		//Before
		<ul id="sample">
			<li>1</li>
			<li>2</li>
			<li>3</li>
		</ul>

		//After
		<ul id="sample">
			<li>1</li>
			<li>2</li>
			<li>3</li>
		<li>4</li></ul>
 */
nv.$Element.prototype.evalScripts = function(sHTML) {
    //-@@$Element.evalScripts-@@//
    var oArgs = g_checkVarType(arguments, {
        '4str' : [ "sHTML:String+" ]
    },"$Element#evalScripts");
    var aJS = [];
    var leftScript = '<script(\\s[^>]+)*>(.*?)</';
    var rightScript = 'script>';
    sHTML = sHTML.replace(new RegExp(leftScript+rightScript, 'gi'), function(_1, _2, sPart) { aJS.push(sPart); return ''; });
    eval(aJS.join('\n'));

    return this;

};
//-!nv.$Element.prototype.evalScripts end!-//

//-!nv.$Element.prototype.clone start!-//
/**
   	cloneNode�� 媛숈씠 element�� 蹂듭젣�섎뒗 硫붿꽌�쒖씠��.
  	@method clone
  	@since 2.8.0
	@param {Boolean} [bDeep=true] �먯떇�몃뱶源뚯� 蹂듭닔�좎� �щ�(
	@return {nv.$Element} 蹂듭젣�� $Element
	@example

		<div id="sample">
		    <div>Hello</div>
		</div>

		//�먯떇�몃뱶源뚯� 蹂듭젣
		$Element("sample").clone();
		->
		$Element(
			<div id="sample">
	    		<div>Hello</div>
			</div>
		);

		//蹂몄씤�몃뱶留� 蹂듭젣
		$Element("sample").clone(false);
		->
		$Element(
			<div id="sample">
			</div>
		);
 */
nv.$Element.prototype.clone = function(bDeep) {
    var oArgs = g_checkVarType(arguments, {
        'default' : [ ],
        'set' : [ 'bDeep:Boolean' ]
    },"$Element#clone");

    if(oArgs+"" == "default") {
        bDeep = true;
    }

    return nv.$Element(this._element.cloneNode(bDeep));
};
//-!nv.$Element.prototype.clone end!-//

//-!nv.$Element._common.hidden start!-//
/**
 * @ignore
 */
nv.$Element._common = function(oElement,sMethod){

    try{
        return nv.$Element(oElement)._element;
    }catch(e){
        throw TypeError(e.message.replace(/\$Element/g,"$Element#"+sMethod).replace(/Element\.html/g,"Element.html#"+sMethod));
    }
};
//-!nv.$Element._common.hidden end!-//
//-!nv.$Element._prepend.hidden start(nv.$)!-//
/**
 	element瑜� �욎뿉 遺숈씪�� �ъ슜�섎뒗 �⑥닔.

	@method _prepend
	@param {Element} elBase 湲곗� �섎━癒쇳듃
	@param {Element} elAppend 遺숈씪 �섎━癒쇳듃
	@return {nv.$Element} �먮쾲吏� �뚮씪誘명꽣�� �섎━癒쇳듃
	@ignore
 */
nv.$Element._prepend = function(oParent, oChild){
    var nodes = oParent.childNodes;
    if (nodes.length > 0) {
        oParent.insertBefore(oChild, nodes[0]);
    } else {
        oParent.appendChild(oChild);
    }
};
//-!nv.$Element._prepend.hidden end!-//

//-!nv.$Element.prototype.append start(nv.$Element._common)!-//
/**
 	append() 硫붿꽌�쒕뒗 nv.$Element() 媛앹껜�� �덈뒗 �붿냼�� 留덉�留� �먯떇 �몃뱶濡� �뚮씪誘명꽣濡� 吏��뺥븳 HTML �붿냼瑜� 諛곗젙�쒕떎.

	@method append
	@syntax sId
	@syntax vElement
	@param {String+} sId 留덉�留� �먯떇 �몃뱶濡� 諛곗젙�� HTML �붿냼�� ID
	@param {Element+ | Node} vElement 留덉�留� �먯떇 �몃뱶濡� 諛곗젙�� HTML �붿냼(Element) �먮뒗 nv.$Element() 媛앹껜瑜� �뚮씪誘명꽣濡� 吏��뺥븷 �� �덈떎.
	@return {this} �몄뒪�댁뒪 �먯떊
	@see nv.$Element#prepend
	@see nv.$Element#before
	@see nv.$Element#after
	@see nv.$Element#appendTo
	@see nv.$Element#prependTo
	@see nv.$Element#wrap
	@example
		// ID媛� sample1�� HTML �붿냼��
		// ID媛� sample2�� HTML �붿냼瑜� 異붽�
		$Element("sample1").append("sample2");

		//Before
		<div id="sample2">
		    <div>Hello 2</div>
		</div>
		<div id="sample1">
		    <div>Hello 1</div>
		</div>

		//After
		<div id="sample1">
			<div>Hello 1</div>
			<div id="sample2">
				<div>Hello 2</div>
			</div>
		</div>
	@example
		// ID媛� sample�� HTML �붿냼��
		// �덈줈�� DIV �붿냼瑜� 異붽�
		var elChild = $("<div>Hello New</div>");
		$Element("sample").append(elChild);

		//Before
		<div id="sample">
			<div>Hello</div>
		</div>

		//After
		<div id="sample">
			<div>Hello </div>
			<div>Hello New</div>
		</div>
 */
nv.$Element.prototype.append = function(oElement) {
    //-@@$Element.append-@@//
    this._element.appendChild(nv.$Element._common(oElement,"append"));
    return this;
};
//-!nv.$Element.prototype.append end!-//

//-!nv.$Element.prototype.prepend start(nv.$Element._prepend)!-//
/**
 	prepend() 硫붿꽌�쒕뒗 nv.$Element() 媛앹껜�� �덈뒗 �붿냼�� 泥� 踰덉㎏ �먯떇 �몃뱶濡� �뚮씪誘명꽣濡� 吏��뺥븳 HTML �붿냼瑜� 諛곗젙�쒕떎.

	@method prepend
	@syntax sId
	@syntax vElement
	@param {String+} sId 泥� 踰덉㎏ �먯떇 �몃뱶濡� 諛곗젙�� HTML �붿냼�� ID
	@param {Element+ | Node} vElement 泥� 踰덉㎏ �먯떇 �몃뱶濡� 諛곗젙�� HTML �붿냼(Element) �먮뒗 nv.$Element() 媛앹껜瑜� �뚮씪誘명꽣濡� 吏��뺥븷 �� �덈떎.
	@return {this} �몄뒪�댁뒪 �먯떊
	@see nv.$Element#append
	@see nv.$Element#before
	@see nv.$Element#after
	@see nv.$Element#appendTo
	@see nv.$Element#prependTo
	@see nv.$Element#wrap
	@example
		// ID媛� sample1�� HTML �붿냼�먯꽌
		// ID媛� sample2�� HTML �붿냼瑜� 泥� 踰덉㎏ �먯떇 �몃뱶濡� �대룞
		$Element("sample1").prepend("sample2");

		//Before
		<div id="sample1">
		    <div>Hello 1</div>
			<div id="sample2">
			    <div>Hello 2</div>
			</div>
		</div>

		//After
		<div id="sample1">
			<div id="sample2">
			    <div>Hello 2</div>
			</div>
		    <div>Hello 1</div>
		</div>
	@example
		// ID媛� sample�� HTML �붿냼��
		// �덈줈�� DIV �붿냼瑜� 異붽�
		var elChild = $("<div>Hello New</div>");
		$Element("sample").prepend(elChild);

		//Before
		<div id="sample">
			<div>Hello</div>
		</div>

		//After
		<div id="sample">
			<div>Hello New</div>
			<div>Hello</div>
		</div>
 */
nv.$Element.prototype.prepend = function(oElement) {
    //-@@$Element.prepend-@@//
    nv.$Element._prepend(this._element, nv.$Element._common(oElement,"prepend"));

    return this;
};
//-!nv.$Element.prototype.prepend end!-//

//-!nv.$Element.prototype.replace start(nv.$Element._common)!-//
/**
 	replace() 硫붿꽌�쒕뒗 nv.$Element() 媛앹껜 �대��� HTML �붿냼瑜� 吏��뺥븳 �뚮씪誘명꽣�� �붿냼濡� ��泥댄븳��.

	@method replace
	@syntax sId
	@syntax vElement
	@param {String+} sId ��泥댄븷 HTML �붿냼�� ID
	@param {Element+ | Node} vElement ��泥댄븷 HTML �붿냼(Element) �먮뒗 nv.$Element() 媛앹껜瑜� �뚮씪誘명꽣濡� 吏��뺥븷 �� �덈떎.
	@return {this} �몄뒪�댁뒪 �먯떊
	@example
		// ID媛� sample1�� HTML �붿냼�먯꽌
		// ID媛� sample2�� HTML �붿냼濡� ��泥�
		$Element('sample1').replace('sample2');

		//Before
		<div>
			<div id="sample1">Sample1</div>
		</div>
		<div id="sample2">Sample2</div>

		//After
		<div>
			<div id="sample2">Sample2</div>
		</div>
	@example
		// �덈줈�� DIV �붿냼濡� ��泥�
		$Element("btn").replace($("<div>Sample</div>"));

		//Before
		<button id="btn">Sample</button>

		//After
		<div>Sample</div>
 */
nv.$Element.prototype.replace = function(oElement) {
    //-@@$Element.replace-@@//
    oElement = nv.$Element._common(oElement,"replace");
    if(nv.cssquery) nv.cssquery.release();
    var e = this._element;
    var oParentNode = e.parentNode;
    if(oParentNode&&oParentNode.replaceChild){
        oParentNode.replaceChild(oElement,e);
        return this;
    }

    var _o = oElement;

    oParentNode.insertBefore(_o, e);
    oParentNode.removeChild(e);

    return this;
};
//-!nv.$Element.prototype.replace end!-//

//-!nv.$Element.prototype.appendTo start(nv.$Element._common)!-//
/**
 	appendTo() 硫붿꽌�쒕뒗 nv.$Element() 媛앹껜�� �덈뒗 �붿냼瑜� �뚮씪誘명꽣濡� 吏��뺥븳 �붿냼�� 留덉�留� �먯떇 �붿냼濡� 諛곗젙�쒕떎.

	@method appendTo
	@syntax sId
	@syntax vElement
	@param {String+} sId 留덉�留� �먯떇 �몃뱶媛� 諛곗젙 �� HTML �붿냼�� ID
	@param {Element+ | Node} vElement 留덉�留� �먯떇 �몃뱶媛� 諛곗젙 �� HTML �붿냼(Element) �먮뒗 nv.$Element() 媛앹껜瑜� �뚮씪誘명꽣濡� 吏��뺥븷 �� �덈떎.
	@return {this} �몄뒪�댁뒪 �먯떊
	@see nv.$Element#append
	@see nv.$Element#prepend
	@see nv.$Element#before
	@see nv.$Element#after
	@see nv.$Element#prependTo
	@see nv.$Element#wrap
	@example
		// ID媛� sample2�� HTML �붿냼��
		// ID媛� sample1�� HTML �붿냼瑜� 異붽�
		$Element("sample1").appendTo("sample2");

		//Before
		<div id="sample1">
		    <div>Hello 1</div>
		</div>
		<div id="sample2">
		    <div>Hello 2</div>
		</div>

		//After
		<div id="sample2">
		    <div>Hello 2</div>
			<div id="sample1">
			    <div>Hello 1</div>
			</div>
		</div>
 */
nv.$Element.prototype.appendTo = function(oElement) {
    //-@@$Element.appendTo-@@//
    nv.$Element._common(oElement,"appendTo").appendChild(this._element);
    return this;
};
//-!nv.$Element.prototype.appendTo end!-//

//-!nv.$Element.prototype.prependTo start(nv.$Element._prepend, nv.$Element._common)!-//
/**
 	prependTo() 硫붿꽌�쒕뒗 nv.$Element() 媛앹껜�� �덈뒗 �붿냼瑜� �뚮씪誘명꽣濡� 吏��뺥븳 �붿냼�� 泥� 踰덉㎏ �먯떇 �몃뱶濡� 諛곗젙�쒕떎.

	@method prependTo
	@syntax sId
	@syntax vElement
	@param {String+} sId 泥� 踰덉㎏ �먯떇 �몃뱶媛� 諛곗젙 �� HTML �붿냼�� ID
	@param {Element+ | Node} vElement 泥� 踰덉㎏ �먯떇 �몃뱶媛� 諛곗젙 �� HTML �붿냼(Element) �먮뒗 nv.$Element() 媛앹껜瑜� �뚮씪誘명꽣濡� 吏��뺥븷 �� �덈떎.
	@return {this} �몄뒪�댁뒪 �먯떊
	@see nv.$Element#append
	@see nv.$Element#prepend
	@see nv.$Element#before
	@see nv.$Element#after
	@see nv.$Element#appendTo
	@see nv.$Element#wrap
	@example
		// ID媛� sample2�� HTML �붿냼��
		// ID媛� sample1�� HTML �붿냼瑜� 異붽�
		$Element("sample1").prependTo("sample2");

		//Before
		<div id="sample1">
		    <div>Hello 1</div>
		</div>
		<div id="sample2">
		    <div>Hello 2</div>
		</div>

		//After
		<div id="sample2">
			<div id="sample1">
			    <div>Hello 1</div>
			</div>
		    <div>Hello 2</div>
		</div>
 */
nv.$Element.prototype.prependTo = function(oElement) {
    //-@@$Element.prependTo-@@//
    nv.$Element._prepend(nv.$Element._common(oElement,"prependTo"), this._element);
    return this;
};
//-!nv.$Element.prototype.prependTo end!-//

//-!nv.$Element.prototype.before start(nv.$Element._common)!-//
/**
 	before() 硫붿꽌�쒕뒗 nv.$Element() 媛앹껜�� �덈뒗 �붿냼�� �댁쟾 �뺤젣 �몃뱶(previousSibling)濡� �뚮씪誘명꽣濡� 吏��뺥븳 �붿냼瑜� 諛곗젙�쒕떎.

	@method before
	@syntax sId
	@syntax vElement
	@param {String+} sId �댁쟾 �뺤젣 �몃뱶濡� 諛곗젙�� HTML �붿냼�� ID
	@param {Element+ | Node} vElement �댁쟾 �뺤젣 �몃뱶濡� 諛곗젙�� HTML �붿냼(Element) �먮뒗 nv.$Element() 媛앹껜瑜� �뚮씪誘명꽣濡� 吏��뺥븷 �� �덈떎.
	@return {this} �몄뒪�댁뒪 �먯떊
	@see nv.$Element#append
	@see nv.$Element#prepend
	@see nv.$Element#after
	@see nv.$Element#appendTo
	@see nv.$Element#prependTo
	@see nv.$Element#wrap
	@example
		// ID媛� sample1�� HTML �붿냼 �욎뿉
		// ID媛� sample2�� HTML �붿냼瑜� 異붽� ��
		$Element("sample1").before("sample2"); // sample2瑜� �섑븨�� $Element 瑜� 諛섑솚

		//Before
		<div id="sample1">
		    <div>Hello 1</div>
			<div id="sample2">
			    <div>Hello 2</div>
			</div>
		</div>

		//After
		<div id="sample2">
			<div>Hello 2</div>
		</div>
		<div id="sample1">
		  <div>Hello 1</div>
		</div>
	@example
		// �덈줈�� DIV �붿냼瑜� 異붽�
		var elNew = $("<div>Hello New</div>");
		$Element("sample").before(elNew); // elNew �붿냼瑜� �섑븨�� $Element 瑜� 諛섑솚

		//Before
		<div id="sample">
			<div>Hello</div>
		</div>

		//After
		<div>Hello New</div>
		<div id="sample">
			<div>Hello</div>
		</div>
 */
nv.$Element.prototype.before = function(oElement) {
    //-@@$Element.before-@@//
    var o = nv.$Element._common(oElement,"before");

    this._element.parentNode.insertBefore(o, this._element);

    return this;
};
//-!nv.$Element.prototype.before end!-//

//-!nv.$Element.prototype.after start(nv.$Element.prototype.before, nv.$Element._common)!-//
/**
 	after() 硫붿꽌�쒕뒗 nv.$Element() 媛앹껜�� �덈뒗 �붿냼�� �ㅼ쓬 �뺤젣 �몃뱶(nextSibling)濡� �뚮씪誘명꽣濡� 吏��뺥븳 �붿냼瑜� 諛곗젙�쒕떎.

	@method after
	@syntax sId
	@syntax vElement
	@param {String+} sId �ㅼ쓬 �뺤젣 �몃뱶濡� 諛곗젙�� HTML �붿냼�� ID
	@param {Element+ | Node} vElement �ㅼ쓬 �뺤젣 �몃뱶濡� 諛곗젙�� HTML �붿냼(Element) �먮뒗 nv.$Element() 媛앹껜瑜� �뚮씪誘명꽣濡� 吏��뺥븷 �� �덈떎.
	@return {this} �몄뒪�댁뒪 �먯떊
	@see nv.$Element#append
	@see nv.$Element#prepend
	@see nv.$Element#before
	@see nv.$Element#appendTo
	@see nv.$Element#prependTo
	@see nv.$Element#wrap
	@example
		// ID媛� sample1�� HTML �붿냼 �ㅼ뿉
		// ID媛� sample2�� HTML �붿냼瑜� 異붽� ��
		$Element("sample1").after("sample2");  // sample2瑜� �섑븨�� $Element 瑜� 諛섑솚

		//Before
		<div id="sample1">
		    <div>Hello 1</div>
			<div id="sample2">
			    <div>Hello 2</div>
			</div>
		</div>

		//After
		<div id="sample1">
			<div>Hello 1</div>
		</div>
		<div id="sample2">
			<div>Hello 2</div>
		</div>
	@example
		// �덈줈�� DIV �붿냼瑜� 異붽�
		var elNew = $("<div>Hello New</div>");
		$Element("sample").after(elNew); // elNew �붿냼瑜� �섑븨�� $Element 瑜� 諛섑솚

		//Before
		<div id="sample">
			<div>Hello</div>
		</div>

		//After
		<div id="sample">
			<div>Hello</div>
		</div>
		<div>Hello New</div>
 */
nv.$Element.prototype.after = function(oElement) {
    //-@@$Element.after-@@//
    oElement = nv.$Element._common(oElement,"after");
    this.before(oElement);
    nv.$Element(oElement).before(this);

    return this;
};
//-!nv.$Element.prototype.after end!-//

//-!nv.$Element.prototype.parent start!-//
/**
 	parent() 硫붿꽌�쒕뒗 HTML �붿냼�� �곸쐞 �몃뱶�� �대떦�섎뒗 �붿냼瑜� 寃��됲븳��.

	@method parent
	@param {Function+} [fCallback] �곸쐞 �붿냼�� 寃��� 議곌굔�� 吏��뺥븳 肄쒕갚 �⑥닔.<br>�뚮씪誘명꽣瑜� �앸왂�섎㈃ 遺�紐� �붿냼瑜� 諛섑솚�섍퀬, �뚮씪誘명꽣濡� 肄쒕갚 �⑥닔瑜� 吏��뺥븯硫� 肄쒕갚 �⑥닔�� �ㅽ뻾 寃곌낵媛� true瑜� 諛섑솚�섎뒗 �곸쐞 �붿냼瑜� 諛섑솚�쒕떎. �대븣 肄쒕갚 �⑥닔�� 寃곌낵瑜� 諛곗뿴濡� 諛섑솚�쒕떎. 肄쒕갚 �⑥닔�� �뚮씪誘명꽣濡� �먯깋 以묒씤 �곸쐞 �붿냼�� nv.$Element() 媛앹껜媛� �낅젰�쒕떎.
	@param {Numeric} [nLimit] �먯깋�� �곸쐞 �붿냼�� �덈꺼.<br>�뚮씪誘명꽣瑜� �앸왂�섎㈃ 紐⑤뱺 �곸쐞 �붿냼瑜� �먯깋�쒕떎. fCallback �뚮씪誘명꽣瑜� null濡� �ㅼ젙�섍퀬 nLimit �뚮씪誘명꽣瑜� �ㅼ젙�섎㈃ �쒗븳�� �덈꺼�� �곸쐞 �붿냼瑜� 議곌굔�놁씠 寃��됲븳��.
	@return {Variant} 遺�紐� �붿냼媛� �닿릿 nv.$Element() 媛앹껜 �뱀� 議곌굔�� 留뚯”�섎뒗 �곸쐞 �붿냼�� 諛곗뿴(Array).<br>�뚮씪誘명꽣瑜� �앸왂�섏뿬 遺�紐� �붿냼瑜� 諛섑솚�섎뒗 寃쎌슦, nv.$Element() 媛앹껜濡� 諛섑솚�섍퀬 洹� �댁쇅�먮뒗 nv.$Element() 媛앹껜瑜� �먯냼濡� 媛뽯뒗 諛곗뿴濡� 諛섑솚�쒕떎.
	@see nv.$Element#child
	@see nv.$Element#prev
	@see nv.$Element#next
	@see nv.$Element#first
	@see nv.$Element#last
	@see nv.$Element#indexOf
	@example
		<div class="sample" id="div1">
			<div id="div2">
				<div class="sample" id="div3">
					<div id="target">
						Sample
						<div id="div4">
							Sample
						</div>
						<div class="sample" id="div5">
							Sample
						</div>
					</div>
					<div class="sample" id="div6">
						Sample
					</div>
				</div>
			</div>
		</div>

		<script type="text/javascript">
			var welTarget = $Element("target");
			var parent = welTarget.parent();
			// ID媛� div3�� DIV瑜� �섑븨�� $Element瑜� 諛섑솚

			parent = welTarget.parent(function(v){
			        return v.hasClass("sample");
			    });
			// ID媛� div3�� DIV瑜� �섑븨�� $Element��
			// ID媛� div1�� DIV瑜� �섑븨�� $Element瑜� �먯냼濡� �섎뒗 諛곗뿴�� 諛섑솚

			parent = welTarget.parent(function(v){
			        return v.hasClass("sample");
			    }, 1);
			// ID媛� div3�� DIV瑜� �섑븨�� $Element瑜� �먯냼濡� �섎뒗 諛곗뿴�� 諛섑솚
		</script>
 */
nv.$Element.prototype.parent = function(pFunc, limit) {
    //-@@$Element.parent-@@//
    var oArgs = g_checkVarType(arguments, {
        '4voi' : [],
        '4fun' : [ 'fpFunc:Function+' ],
        '4nul' : [ 'fpFunc:Null' ],
        'for_function_number' : [ 'fpFunc:Function+', 'nLimit:Numeric'],
        'for_null_number' : [ 'fpFunc:Null', 'nLimit:Numeric' ]
    },"$Element#parent");

    var e = this._element;

    switch(oArgs+""){
        case "4voi":
            return e.parentNode?nv.$Element(e.parentNode):null;
        case "4fun":
        case "4nul":
             limit = -1;
             break;
        case "for_function_number":
        case "for_null_number":
            if(oArgs.nLimit==0)limit = -1;
    }

    var a = [], p = null;

    while(e.parentNode && limit-- != 0) {
        try {
            p = nv.$Element(e.parentNode);
        } catch(err) {
            p = null;
        }

        if (e.parentNode == document.documentElement) break;
        if (!pFunc || (pFunc && pFunc.call(this,p))) a[a.length] = p;

        e = e.parentNode;
    }

    return a;
};
//-!nv.$Element.prototype.parent end!-//

//-!nv.$Element.prototype.child start!-//
/**
 	child() 硫붿꽌�쒕뒗 HTML �붿냼�� �섏쐞 �몃뱶�� �대떦�섎뒗 �붿냼瑜� 寃��됲븳��.

	@method child
	@param {Function+} [fCallback] �섏쐞 �붿냼�� 寃��� 議곌굔�� 吏��뺥븳 肄쒕갚 �⑥닔.<br>�뚮씪誘명꽣瑜� �앸왂�섎㈃ �먯떇 �붿냼瑜� 諛섑솚�섍퀬, �뚮씪誘명꽣濡� 肄쒕갚 �⑥닔瑜� 吏��뺥븯硫� 肄쒕갚 �⑥닔�� �ㅽ뻾 寃곌낵媛� true瑜� 諛섑솚�섎뒗 �섏쐞 �붿냼瑜� 諛섑솚�쒕떎. �대븣 肄쒕갚 �⑥닔�� 寃곌낵瑜� 諛곗뿴濡� 諛섑솚�쒕떎. 肄쒕갚 �⑥닔�� �뚮씪誘명꽣濡� �먯깋 以묒씤 �섏쐞 �붿냼�� nv.$Element() 媛앹껜媛� �낅젰�쒕떎.
	@param {Numeric} [nLimit] �먯깋�� �섏쐞 �붿냼�� �덈꺼.<br>�뚮씪誘명꽣瑜� �앸왂�섎㈃ 紐⑤뱺 �섏쐞 �붿냼瑜� �먯깋�쒕떎. fCallback �뚮씪誘명꽣瑜� null濡� �ㅼ젙�섍퀬 nLimit �뚮씪誘명꽣瑜� �ㅼ젙�섎㈃ �쒗븳�� �덈꺼�� �섏쐞 �붿냼瑜� 議곌굔�놁씠 寃��됲븳��.
	@return {Variant} �먯떇 �붿냼媛� �닿릿 諛곗뿴(Array) �뱀� 議곌굔�� 留뚯”�섎뒗 �섏쐞 �붿냼�� 諛곗뿴(Array).<br>�섎굹�� �섏쐞 �붿냼瑜� 諛섑솚�� �뚮뒗 nv.$Element() 媛앹껜瑜� 諛섑솚�섍퀬 洹� �댁쇅�먮뒗 nv.$Element() 媛앹껜瑜� �먯냼濡� 媛뽯뒗 諛곗뿴濡� 諛섑솚�쒕떎.
	@see nv.$Element#parent
	@see nv.$Element#prev
	@see nv.$Element#next
	@see nv.$Element#first
	@see nv.$Element#last
	@see nv.$Element#indexOf
	@example
		<div class="sample" id="target">
			<div id="div1">
				<div class="sample" id="div2">
					<div id="div3">
						Sample
						<div id="div4">
							Sample
						</div>
						<div class="sample" id="div5">
							Sample
							<div class="sample" id="div6">
								Sample
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="sample" id="div7">
				Sample
			</div>
		</div>

		<script type="text/javascript">
			var welTarget = $Element("target");
			var child = welTarget.child();
			// ID媛� div1�� DIV瑜� �섑븨�� $Element��
			// ID媛� div7�� DIV瑜� �섑븨�� $Element瑜� �먯냼濡� �섎뒗 諛곗뿴�� 諛섑솚

			child = welTarget.child(function(v){
			        return v.hasClass("sample");
			    });
			// ID媛� div2�� DIV瑜� �섑븨�� $Element��
			// ID媛� div5�� DIV瑜� �섑븨�� $Element��
			// ID媛� div6�� DIV瑜� �섑븨�� $Element��
			// ID媛� div7�� DIV瑜� �섑븨�� $Element瑜� �먯냼濡� �섎뒗 諛곗뿴�� 諛섑솚

			child = welTarget.child(function(v){
			        return v.hasClass("sample");
			    }, 1);
			// ID媛� div7�� DIV瑜� �섑븨�� $Element瑜� �먯냼濡� �섎뒗 諛곗뿴�� 諛섑솚

			child = welTarget.child(function(v){
			        return v.hasClass("sample");
			    }, 2);
			// ID媛� div2�� DIV瑜� �섑븨�� $Element��
			// ID媛� div7�� DIV瑜� �섑븨�� $Element瑜� �먯냼濡� �섎뒗 諛곗뿴�� 諛섑솚
		</script>
 */
nv.$Element.prototype.child = function(pFunc, limit) {
    //-@@$Element.child-@@//
    var oArgs = g_checkVarType(arguments, {
        '4voi' : [],
        '4fun' : [ 'fpFunc:Function+' ],
        '4nul' : [ 'fpFunc:Null' ],
        'for_function_number' : [ 'fpFunc:Function+', 'nLimit:Numeric'],
        'for_null_number' : [ 'fpFunc:Null', 'nLimit:Numeric' ]
    },"$Element#child");
    var e = this._element;
    var a = [], c = null, f = null;

    switch(oArgs+""){
        case "4voi":
            var child = e.childNodes;
            var filtered = [];

            for(var  i = 0, l = child.length; i < l; i++){
                if(child[i].nodeType == 1){
                    try {
                        filtered.push(nv.$Element(child[i]));
                    } catch(err) {
                        filtered.push(null);
                    }
                }
            }
            return filtered;
        case "4fun":
        case "4nul":
             limit = -1;
             break;
        case "for_function_number":
        case "for_null_number":
            if(oArgs.nLimit==0)limit = -1;
    }

    (f = function(el, lim, context) {
        var ch = null, o = null;

        for(var i=0; i < el.childNodes.length; i++) {
            ch = el.childNodes[i];
            if (ch.nodeType != 1) continue;
            try {
                o = nv.$Element(el.childNodes[i]);
            } catch(e) {
                o = null;
            }
            if (!pFunc || (pFunc && pFunc.call(context,o))) a[a.length] = o;
            if (lim != 0) f(el.childNodes[i], lim-1);
        }
    })(e, limit-1,this);

    return a;
};
//-!nv.$Element.prototype.child end!-//

//-!nv.$Element.prototype.prev start!-//
/**
 	prev() 硫붿꽌�쒕뒗 HTML �붿냼�� �댁쟾 �뺤젣 �몃뱶�� �대떦�섎뒗 �붿냼瑜� 寃��됲븳��.

	@method prev
	@param {Function+} [fCallback] �댁쟾 �뺤젣 �붿냼�� 寃��� 議곌굔�� 吏��뺥븳 肄쒕갚 �⑥닔.<br>�뚮씪誘명꽣濡� 肄쒕갚 �⑥닔瑜� 吏��뺥븯硫� 肄쒕갚 �⑥닔�� �ㅽ뻾 寃곌낵媛� true瑜� 諛섑솚�섎뒗 �댁쟾 �뺤젣 �붿냼瑜� 諛섑솚�쒕떎. �대븣 肄쒕갚 �⑥닔�� 寃곌낵瑜� 諛곗뿴濡� 諛섑솚�쒕떎. 肄쒕갚 �⑥닔�� �뚮씪誘명꽣濡� �먯깋 以묒씤 �댁쟾 �뺤젣 �붿냼�� nv.$Element() 媛앹껜媛� �낅젰�쒕떎.
	@return {Variant} 議곌굔�� 留뚯”�섎뒗 �댁쟾 �뺤젣 �붿냼(nv.$Element() 媛앹껜)瑜� �먯냼濡� 媛뽯뒗 諛곗뿴(Array).<br>fCallback�� null�� 寃쎌슦 紐⑤뱺 �댁쟾 �뺤젣 �붿냼�� 諛곗뿴(Array)�� 諛섑솚�쒕떎. �뚮씪誘명꽣瑜� �앸왂�섎㈃ 諛붾줈 �댁쟾 �뺤젣 �붿냼媛� �닿릿 nv.$Element() 媛앹껜. 留뚯빟 �섎━癒쇳듃媛� �놁쑝硫� null�� 諛섑솚�쒕떎.
	@see nv.$Element#parent
	@see nv.$Element#child
	@see nv.$Element#next
	@see nv.$Element#first
	@see nv.$Element#last
	@see nv.$Element#indexOf
	@example
		<div class="sample" id="sample_div1">
			<div id="sample_div2">
				<div class="sample" id="sample_div3">
					Sample1
				</div>
				<div id="sample_div4">
					Sample2
				</div>
				<div class="sample" id="sample_div5">
					Sample3
				</div>
				<div id="sample_div">
					Sample4
					<div id="sample_div6">
						Sample5
					</div>
				</div>
				<div id="sample_div7">
					Sample6
				</div>
				<div class="sample" id="sample_div8">
					Sample7
				</div>
			</div>
		</div>

		<script type="text/javascript">
			var sibling = $Element("sample_div").prev();
			// ID媛� sample_div5�� DIV瑜� �섑븨�� $Element瑜� 諛섑솚

			sibling = $Element("sample_div").prev(function(v){
			    return $Element(v).hasClass("sample");
			});
			// ID媛� sample_div5�� DIV瑜� �섑븨�� $Element��
			// ID媛� sample_div3�� DIV瑜� �섑븨�� $Element瑜� �먯냼濡� �섎뒗 諛곗뿴�� 諛섑솚
		</script>
 */
nv.$Element.prototype.prev = function(pFunc) {
    //-@@$Element.prev-@@//

    var oArgs = g_checkVarType(arguments, {
        '4voi' : [],
        '4fun' : [ 'fpFunc:Function+' ],
        '4nul' : [ 'fpFunc:Null' ]
    },"$Element#prev");

    var e = this._element;
    var a = [];

    switch(oArgs+""){
        case "4voi":
            if (!e) return null;
            do {

                e = e.previousSibling;
                if (!e || e.nodeType != 1) continue;
                try{
                    if(e==null) return null;
                    return nv.$Element(e);
                }catch(e){
                    return null;
                }
            } while(e);
            try{
                if(e==null) return null;
                return nv.$Element(e);
            }catch(e){
                return null;
            }
            // 'break' statement was intentionally omitted.
        case "4fun":
        case "4nul":
            if (!e) return a;
            do {
                e = e.previousSibling;

                if (!e || e.nodeType != 1) continue;
                if (!pFunc||pFunc.call(this,e)) {

                    try{
                        if(e==null) a[a.length]=null;
                        else a[a.length] = nv.$Element(e);
                    }catch(e){
                        a[a.length] = null;
                    }

                }
            } while(e);
            try{
                return a;
            }catch(e){
                return null;
            }
    }
};
//-!nv.$Element.prototype.prev end!-//

//-!nv.$Element.prototype.next start!-//
/**
 	next() 硫붿꽌�쒕뒗 HTML �붿냼�� �ㅼ쓬 �뺤젣 �몃뱶�� �대떦�섎뒗 �붿냼瑜� 寃��됲븳��.

	@method next
	@param {Function+} [fCallback] �ㅼ쓬 �뺤젣 �붿냼�� 寃��� 議곌굔�� 吏��뺥븳 肄쒕갚 �⑥닔.<br>�뚮씪誘명꽣濡� 肄쒕갚 �⑥닔瑜� 吏��뺥븯硫� 肄쒕갚 �⑥닔�� �ㅽ뻾 寃곌낵媛� true瑜� 諛섑솚�섎뒗 �ㅼ쓬 �뺤젣 �붿냼瑜� 諛섑솚�쒕떎. �대븣 肄쒕갚 �⑥닔�� 寃곌낵瑜� 諛곗뿴濡� 諛섑솚�쒕떎. 肄쒕갚 �⑥닔�� �뚮씪誘명꽣濡� �먯깋 以묒씤 �ㅼ쓬 �뺤젣 �붿냼�� nv.$Element() 媛앹껜媛� �낅젰�쒕떎.
	@return {Variant} 議곌굔�� 留뚯”�섎뒗 �ㅼ쓬 �뺤젣 �붿냼(nv.$Element() 媛앹껜)瑜� �먯냼濡� 媛뽯뒗 諛곗뿴(Array).<br>fCallback�� null�� 寃쎌슦 紐⑤뱺 �ㅼ쓬 �뺤젣 �붿냼�� 諛곗뿴(Array)�� 諛섑솚�쒕떎. �뚮씪誘명꽣瑜� �앸왂�섎㈃ 諛붾줈 �ㅼ쓬 �뺤젣 �붿냼媛� �닿릿 nv.$Element() 媛앹껜. 留뚯빟 �섎━癒쇳듃媛� �놁쑝硫� null�� 諛섑솚�쒕떎.
	@see nv.$Element#parent
	@see nv.$Element#child
	@see nv.$Element#prev
	@see nv.$Element#first
	@see nv.$Element#last
	@see nv.$Element#indexOf
	@example
		<div class="sample" id="sample_div1">
			<div id="sample_div2">
				<div class="sample" id="sample_div3">
					Sample1
				</div>
				<div id="sample_div4">
					Sample2
				</div>
				<div class="sample" id="sample_div5">
					Sample3
				</div>
				<div id="sample_div">
					Sample4
					<div id="sample_div6">
						Sample5
					</div>
				</div>
				<div id="sample_div7">
					Sample6
				</div>
				<div class="sample" id="sample_div8">
					Sample7
				</div>
			</div>
		</div>

		<script type="text/javascript">
			var sibling = $Element("sample_div").next();
			// ID媛� sample_div7�� DIV瑜� �섑븨�� $Element瑜� 諛섑솚

			sibling = $Element("sample_div").next(function(v){
			    return $Element(v).hasClass("sample");
			});
			// ID媛� sample_div8�� DIV瑜� �섑븨�� $Element瑜� �먯냼濡� �섎뒗 諛곗뿴�� 諛섑솚
		</script>
 */
nv.$Element.prototype.next = function(pFunc) {
    //-@@$Element.next-@@//
    var oArgs = g_checkVarType(arguments, {
        '4voi' : [],
        '4fun' : [ 'fpFunc:Function+' ],
        '4nul' : [ 'fpFunc:Null' ]
    },"$Element#next");
    var e = this._element;
    var a = [];

    switch(oArgs+""){
        case "4voi":
            if (!e) return null;
            do {
                e = e.nextSibling;
                if (!e || e.nodeType != 1) continue;
                try{
                    if(e==null) return null;
                    return nv.$Element(e);
                }catch(e){
                    return null;
                }
            } while(e);
            try{
                if(e==null) return null;
                return nv.$Element(e);
            }catch(e){
                return null;
            }
            // 'break' statement was intentionally omitted.
        case "4fun":
        case "4nul":
            if (!e) return a;
            do {
                e = e.nextSibling;

                if (!e || e.nodeType != 1) continue;
                if (!pFunc||pFunc.call(this,e)) {

                    try{
                        if(e==null) a[a.length] = null;
                        else a[a.length] = nv.$Element(e);
                    }catch(e){
                        a[a.length] = null;
                    }

                }
            } while(e);
            try{
                return a;
            }catch(e){
                return null;
            }

    }
};
//-!nv.$Element.prototype.next end!-//

//-!nv.$Element.prototype.first start!-//
/**
 	first() 硫붿꽌�쒕뒗 HTML �붿냼�� 泥� 踰덉㎏ �먯떇 �몃뱶�� �대떦�섎뒗 �붿냼瑜� 諛섑솚�쒕떎.

	@method first
	@return {nv.$Element} 泥� 踰덉㎏ �먯떇 �몃뱶�� �대떦�섎뒗 �붿냼. 留뚯빟 �섎━癒쇳듃媛� �놁쑝硫� null�� 諛섑솚.
	@since 1.2.0
	@see nv.$Element#parent
	@see nv.$Element#child
	@see nv.$Element#prev
	@see nv.$Element#next
	@see nv.$Element#last
	@see nv.$Element#indexOf
	@example
		<div id="sample_div1">
			<div id="sample_div2">
				<div id="sample_div">
					Sample1
					<div id="sample_div3">
						<div id="sample_div4">
							Sample2
						</div>
						Sample3
					</div>
					<div id="sample_div5">
						Sample4
						<div id="sample_div6">
							Sample5
						</div>
					</div>
				</div>
			</div>
		</div>

		<script type="text/javascript">
			var firstChild = $Element("sample_div").first();
			// ID媛� sample_div3�� DIV瑜� �섑븨�� $Element瑜� 諛섑솚
		</script>
 */
nv.$Element.prototype.first = function() {
    //-@@$Element.first-@@//
    var el = this._element.firstElementChild||this._element.firstChild;
    if (!el) return null;
    while(el && el.nodeType != 1) el = el.nextSibling;
    try{
        return el?nv.$Element(el):null;
    }catch(e){
        return null;
    }
};
//-!nv.$Element.prototype.first end!-//

//-!nv.$Element.prototype.last start!-//
/**
 	last() 硫붿꽌�쒕뒗 HTML �붿냼�� 留덉�留� �먯떇 �몃뱶�� �대떦�섎뒗 �붿냼瑜� 諛섑솚�쒕떎.

	@method last
	@return {nv.$Element} 留덉�留� �먯떇 �몃뱶�� �대떦�섎뒗 �붿냼. 留뚯빟 �섎━癒쇳듃媛� �놁쑝硫� null�� 諛섑솚.
	@since 1.2.0
	@see nv.$Element#parent
	@see nv.$Element#child
	@see nv.$Element#prev
	@see nv.$Element#next
	@see nv.$Element#first
	@see nv.$Element#indexOf
	@example
		<div id="sample_div1">
			<div id="sample_div2">
				<div id="sample_div">
					Sample1
					<div id="sample_div3">
						<div id="sample_div4">
							Sample2
						</div>
						Sample3
					</div>
					<div id="sample_div5">
						Sample4
						<div id="sample_div6">
							Sample5
						</div>
					</div>
				</div>
			</div>
		</div>

		<script type="text/javascript">
			var lastChild = $Element("sample_div").last();
			// ID媛� sample_div5�� DIV瑜� �섑븨�� $Element瑜� 諛섑솚
		</script>
 */
nv.$Element.prototype.last = function() {
    //-@@$Element.last-@@//
    var el = this._element.lastElementChild||this._element.lastChild;
    if (!el) return null;
    while(el && el.nodeType != 1) el = el.previousSibling;

    try{
        return el?nv.$Element(el):null;
    }catch(e){
        return null;
    }
};
//-!nv.$Element.prototype.last end!-//

//-!nv.$Element._contain.hidden start!-//
/**
 	isChildOf , isParentOf�� 湲곕낯�� �섎뒗 API (IE�먯꽌�� contains,湲고� 釉뚮씪�곗졇�먮뒗 compareDocumentPosition�� �ъ슜�섍퀬 �섎떎 �녿뒗 寃쎌슦�� 湲곗〈 �덇굅�� API�ъ슜.)

	@method _contain
	@param {HTMLElement} eParent	遺�紐⑤끂��
	@param {HTMLElement} eChild	�먯떇�몃뱶
	@ignore
 */
nv.$Element._contain = function(eParent,eChild){
    if (document.compareDocumentPosition) {
        return !!(eParent.compareDocumentPosition(eChild)&16);
    }else if(eParent.contains){
        return (eParent !== eChild)&&(eParent.contains ? eParent.contains(eChild) : true);
    }else if(document.body.contains){
        if(eParent===(eChild.ownerDocument || eChild.document)&&eChild.tagName&&eChild.tagName.toUpperCase()==="BODY"){ return true;}  // when find body in document
        if(eParent.nodeType === 9&&eParent!==eChild){
            eParent = eParent.body;
        }
        try{
            return (eParent !== eChild)&&(eParent.contains ? eParent.contains(eChild) : true);
        }catch(e){
            return false;
        }
    }else{
        var e  = eParent;
        var el = eChild;

        while(e && e.parentNode) {
            e = e.parentNode;
            if (e == el) return true;
        }
        return false;
    }
};
//-!nv.$Element._contain.hidden end!-//

//-!nv.$Element.prototype.isChildOf start(nv.$Element._contain)!-//
/**
 	isChildOf() 硫붿꽌�쒕뒗 �뚮씪誘명꽣濡� 吏��뺥븳 �붿냼媛� HTML �붿냼�� 遺�紐� �몃뱶�몄� 寃��ы븳��.

	@method isChildOf
	@syntax sElement
	@syntax elElement
	@param {String+} sElement 遺�紐� �몃뱶�몄� 寃��ы븷 HTML �붿냼�� ID
	@param {Element+} elElement 遺�紐� �몃뱶�몄� 寃��ы븷 HTML �붿냼
	@return {Boolean} 吏��뺥븳 �붿냼媛� 遺�紐� �붿냼�대㈃ true, 洹몃젃吏� �딆쑝硫� false瑜� 諛섑솚�쒕떎.
	@see nv.$Element#isParentOf
	@example
		<div id="parent">
			<div id="child">
				<div id="grandchild"></div>
			</div>
		</div>
		<div id="others"></div>

		// 遺�紐�/�먯떇 �뺤씤�섍린
		$Element("child").isChildOf("parent");		// 寃곌낵 : true
		$Element("others").isChildOf("parent");		// 寃곌낵 : false
		$Element("grandchild").isChildOf("parent");	// 寃곌낵 : true
 */
nv.$Element.prototype.isChildOf = function(element) {
    //-@@$Element.isChildOf-@@//
    try{
        return nv.$Element._contain(nv.$Element(element)._element,this._element);
    }catch(e){
        return false;
    }
};
//-!nv.$Element.prototype.isChildOf end!-//

//-!nv.$Element.prototype.isParentOf start(nv.$Element._contain)!-//
/**
 	isParentOf() 硫붿꽌�쒕뒗 �뚮씪誘명꽣濡� 吏��뺥븳 �붿냼媛� HTML �붿냼�� �먯떇 �몃뱶�몄� 寃��ы븳��.

	@method isParentOf
	@syntax sElement
	@syntax elElement
	@param {String+} sElement �먯떇 �몃뱶�몄� 寃��ы븷 HTML �붿냼�� ID
	@param {Element+} elElement �먯떇 �몃뱶�몄� 寃��ы븷 HTML �붿냼
	@return {Boolean} 吏��뺥븳 �붿냼媛� �먯떇 �붿냼�대㈃ true, 洹몃젃吏� �딆쑝硫� false瑜� 諛섑솚�쒕떎.
	@see nv.$Element#isChildOf
	@example
		<div id="parent">
			<div id="child"></div>
		</div>
		<div id="others"></div>

		// 遺�紐�/�먯떇 �뺤씤�섍린
		$Element("parent").isParentOf("child");		// 寃곌낵 : true
		$Element("others").isParentOf("child");		// 寃곌낵 : false
		$Element("parent").isParentOf("grandchild");// 寃곌낵 : true
 */
nv.$Element.prototype.isParentOf = function(element) {
    //-@@$Element.isParentOf-@@//
    try{
        return nv.$Element._contain(this._element, nv.$Element(element)._element);
    }catch(e){
        return false;
    }
};
//-!nv.$Element.prototype.isParentOf end!-//

//-!nv.$Element.prototype.isEqual start!-//
/**
 	isEqual() 硫붿꽌�쒕뒗 �뚮씪誘명꽣濡� 吏��뺥븳 �붿냼媛� HTML �붿냼�� 媛숈� �붿냼�몄� 寃��ы븳��.

	@method isEqual
	@syntax sElement
	@syntax vElement
	@param {String+} sElement 媛숈� �붿냼�몄� 鍮꾧탳�� HTML �붿냼�� ID.
	@param {Element+} vElement 媛숈� �붿냼�몄� 鍮꾧탳�� HTML �붿냼.
	@return {Boolean} 吏��뺥븳 �붿냼�� 媛숈� �붿냼�대㈃ true, 洹몃젃吏� �딆쑝硫� false瑜� 諛섑솚�쒕떎.
	@remark
		<ul class="disc">
			<li>DOM Level 3 紐낆꽭�� API 以� isSameNode �⑥닔�� 媛숈� 硫붿꽌�쒕줈 �덊띁�곗뒪源뚯� �뺤씤�쒕떎.</li>
			<li>isEqualNode() 硫붿꽌�쒖��� �ㅻⅨ �⑥닔�닿린 �뚮Ц�� 二쇱쓽�쒕떎.</li>
		</ul>
	@see http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-isSameNode isSameNode - W3C DOM Level 3 Specification
	@see nv.$Element#isEqualnode
	@example
		<div id="sample1"><span>Sample</span></div>
		<div id="sample2"><span>Sample</span></div>

		// 媛숈� HTML �붿냼�몄� �뺤씤
		var welSpan1 = $Element("sample1").first();	// <span>Sample</span>
		var welSpan2 = $Element("sample2").first();	// <span>Sample</span>

		welSpan1.isEqual(welSpan2); // 寃곌낵 : false
		welSpan1.isEqual(welSpan1); // 寃곌낵 : true
 */
nv.$Element.prototype.isEqual = function(element) {
    //-@@$Element.isEqual-@@//
    try {
        return (this._element === nv.$Element(element)._element);
    } catch(e) {
        return false;
    }
};
//-!nv.$Element.prototype.isEqual end!-//

//-!nv.$Element.prototype.fireEvent start!-//
/**
 	fireEvent() 硫붿꽌�쒕뒗 HTML �붿냼�� �대깽�몃� 諛쒖깮�쒗궓��. �뚮씪誘명꽣濡� 諛쒖깮�쒗궗 �대깽�� 醫낅쪟�� �대깽�� 媛앹껜�� �띿꽦�� 吏��뺥븷 �� �덈떎.

	@method fireEvent
	@param {String+} sEvent 諛쒖깮�쒗궗 �대깽�� �대쫫. on �묐몢�щ뒗 �앸왂�쒕떎.
	@param {Hash+} [oProps] �대깽�� 媛앹껜�� �띿꽦�� 吏��뺥븳 媛앹껜. �대깽�몃� 諛쒖깮�쒗궗 �� �띿꽦�� �ㅼ젙�� �� �덈떎.
	@return {nv.$Element} �대깽�멸� 諛쒖깮�� HTML �붿냼�� nv.$Element() 媛앹껜.
	@remark
		<ul class="disc">
			<li>1.4.1 踰꾩쟾遺��� keyCode 媛믪쓣 �ㅼ젙�� �� �덈떎.</li>
			<li>WebKit 怨꾩뿴�먯꽌�� �대깽�� 媛앹껜�� keyCode媛� �쎄린 �꾩슜(read-only)�� 愿�怨꾨줈 key �대깽�몃� 諛쒖깮�쒗궗 寃쎌슦 keyCode 媛믪쓣 �ㅼ젙�� �� �놁뿀��.</li>
		</ul>
	@example
		// click �대깽�� 諛쒖깮
		$Element("div").fireEvent("click", {left : true, middle : false, right : false});

		// mouseover �대깽�� 諛쒖깮
		$Element("div").fireEvent("mouseover", {screenX : 50, screenY : 50, clientX : 50, clientY : 50});

		// keydown �대깽�� 諛쒖깮
		$Element("div").fireEvent("keydown", {keyCode : 13, alt : true, shift : false ,meta : false, ctrl : true});
 */
nv.$Element.prototype.fireEvent = function(sEvent, oProps) {
    //-@@$Element.fireEvent-@@//
    var _oParam = {
            '4str' : [ nv.$Jindo._F('sEvent:String+') ],
            '4obj' : [ 'sEvent:String+', 'oProps:Hash+' ]
    };

    nv._p_.fireCustomEvent = function (ele, sEvent,self,bIsNormalType){
        var oInfo = nv._p_.normalCustomEvent[sEvent];
        var targetEle,oEvent;
        for(var i in oInfo){
            oEvent = oInfo[i];
            targetEle = oEvent.ele;
            var wrap_listener;
            for(var sCssquery in oEvent){
                if(sCssquery==="_NONE_"){
                    if(targetEle==ele || self.isChildOf(targetEle)){
                        wrap_listener = oEvent[sCssquery].wrap_listener;
                        for(var k = 0, l = wrap_listener.length; k < l;k++){
                            wrap_listener[k]();
                        }
                    }
                }else{
                    if(nv.$Element.eventManager.containsElement(targetEle, ele, sCssquery,false)){
                        wrap_listener = oEvent[sCssquery].wrap_listener;
                        for(var k = 0, l = wrap_listener.length; k < l;k++){
                            wrap_listener[k]();
                        }
                    }
                }
            }
        }

    };

    function IE(sEvent, oProps) {
        var oArgs = g_checkVarType(arguments, _oParam,"$Element#fireEvent");
        var ele = this._element;

        if(nv._p_.normalCustomEvent[sEvent]){
            nv._p_.fireCustomEvent(ele,sEvent,this,!!nv._p_.normalCustomEvent[sEvent]);
            return this;
        }

        sEvent = (sEvent+"").toLowerCase();
        var oEvent = document.createEventObject();

        switch(oArgs+""){
            case "4obj":
                oProps = oArgs.oProps;
                for (var k in oProps){
                    if(oProps.hasOwnProperty(k))
                        oEvent[k] = oProps[k];
                }
                oEvent.button = (oProps.left?1:0)+(oProps.middle?4:0)+(oProps.right?2:0);
                oEvent.relatedTarget = oProps.relatedElement||null;

        }

        if(this.tag == "input" && sEvent == "click"){
            if(ele.type=="checkbox"){
                ele.checked = (!ele.checked);
            }else if(ele.type=="radio"){
                ele.checked = true;
            }
        }

        this._element.fireEvent("on"+sEvent, oEvent);
        return this;
    }

    function DOM2(sEvent, oProps) {
        var oArgs = g_checkVarType(arguments, _oParam,"$Element#fireEvent");
        var ele = this._element;

        var oldEvent = sEvent;
        sEvent = nv.$Element.eventManager.revisionEvent("",sEvent,sEvent);
        if(nv._p_.normalCustomEvent[sEvent]){
            nv._p_.fireCustomEvent(ele,sEvent,this,!!nv._p_.normalCustomEvent[sEvent]);
            return this;
        }

        var sType = "HTMLEvents";
        sEvent = (sEvent+"").toLowerCase();


        if (sEvent == "click" || sEvent.indexOf("mouse") == 0) {
            sType = "MouseEvent";
        } else if(oldEvent.indexOf("wheel") > 0){
           sEvent = "DOMMouseScroll";
           sType = nv._p_._JINDO_IS_FF?"MouseEvent":"MouseWheelEvent";
        } else if (sEvent.indexOf("key") == 0) {
            sType = "KeyboardEvent";
        } else if (sEvent.indexOf("pointer") > 0) {
            sType = "MouseEvent";
            sEvent = oldEvent;
        }

        var evt;
        switch (oArgs+"") {
            case "4obj":
                oProps = oArgs.oProps;
                oProps.button = 0 + (oProps.middle?1:0) + (oProps.right?2:0);
                oProps.ctrl = oProps.ctrl||false;
                oProps.alt = oProps.alt||false;
                oProps.shift = oProps.shift||false;
                oProps.meta = oProps.meta||false;
                switch (sType) {
                    case 'MouseEvent':
                        evt = document.createEvent(sType);

                        evt.initMouseEvent( sEvent, true, true, null, oProps.detail||0, oProps.screenX||0, oProps.screenY||0, oProps.clientX||0, oProps.clientY||0,
                                            oProps.ctrl, oProps.alt, oProps.shift, oProps.meta, oProps.button, oProps.relatedElement||null);
                        break;
                    case 'KeyboardEvent':
                        if (window.KeyEvent) {
                            evt = document.createEvent('KeyEvents');
                            evt.initKeyEvent(sEvent, true, true, window,  oProps.ctrl, oProps.alt, oProps.shift, oProps.meta, oProps.keyCode, oProps.keyCode);
                        } else {
                            try {
                                evt = document.createEvent("Events");
                            } catch (e){
                                evt = document.createEvent("UIEvents");
                            } finally {
                                evt.initEvent(sEvent, true, true);
                                evt.ctrlKey  = oProps.ctrl;
                                evt.altKey   = oProps.alt;
                                evt.shiftKey = oProps.shift;
                                evt.metaKey  = oProps.meta;
                                evt.keyCode = oProps.keyCode;
                                evt.which = oProps.keyCode;
                            }
                        }
                        break;
                    default:
                        evt = document.createEvent(sType);
                        evt.initEvent(sEvent, true, true);
                }
            break;
            case "4str":
                evt = document.createEvent(sType);
                evt.initEvent(sEvent, true, true);

        }
        ele.dispatchEvent(evt);
        return this;
    }
    nv.$Element.prototype.fireEvent =  (document.dispatchEvent !== undefined)?DOM2:IE;
    return this.fireEvent.apply(this,nv._p_._toArray(arguments));
};
//-!nv.$Element.prototype.fireEvent end!-//

//-!nv.$Element.prototype.empty start(nv.$Element.prototype.html)!-//
/**
 	empty() 硫붿꽌�쒕뒗 HTML �붿냼�� �먯떇 �붿냼�� 洹� �먯떇 �붿냼�ㅼ뿉 �깅줉�� 紐⑤뱺 �대깽�� �몃뱾�ш퉴吏� �쒓굅�쒕떎.

	@method empty
	@return {this} �먯떇 �몃뱶瑜� 紐⑤몢 �쒓굅�� �몄뒪�댁뒪 �먯떊
	@see nv.$Element#leave
	@see nv.$Element#remove
	@example
		// �먯떇 �몃뱶瑜� 紐⑤몢 �쒓굅
		$Element("sample").empty();

		//Before
		<div id="sample"><span>�몃뱶</span> <span>紐⑤몢</span> ��젣�섍린 </div>

		//After
		<div id="sample"></div>
 */
nv.$Element.prototype.empty = function() {
    //-@@$Element.empty-@@//
    if(nv.cssquery) nv.cssquery.release();
    this.html("");
    return this;
};
//-!nv.$Element.prototype.empty end!-//

//-!nv.$Element.prototype.remove start(nv.$Element.prototype.leave, nv.$Element._common)!-//
/**
 	remove() 硫붿꽌�쒕뒗 HTML �붿냼�� �뱀젙 �먯떇 �몃뱶瑜� �쒓굅�쒕떎. �뚮씪誘명꽣濡� 吏��뺥븳 �먯떇 �붿냼瑜� �쒓굅�섎ŉ �쒓굅�섎뒗 �먯떇 �붿냼�� �대깽�� �몃뱾�ъ� 洹� �먯떇 �붿냼�� 紐⑤뱺 �섏쐞 �붿냼�� 紐⑤뱺 �대깽�� �몃뱾�щ룄 �쒓굅�쒕떎.

	@method remove
	@syntax sElement
	@syntax vElement
	@param {String+} sElement �먯떇 �붿냼�먯꽌 �쒓굅�� HTML �붿냼�� ID.
	@param {Element+} vElement �먯떇 �붿냼�먯꽌 �쒓굅�� HTML �붿냼.
	@return {this} 吏��뺥븳 �먯떇 �몃뱶瑜� �쒓굅�� �몄뒪�댁뒪 �먯떊
	@see nv.$Element#empty
	@see nv.$Element#leave
	@example
		// �뱀젙 �먯떇 �몃뱶瑜� �쒓굅
		$Element("sample").remove("child2");

		//Before
		<div id="sample"><span id="child1">�몃뱶</span> <span id="child2">��젣�섍린</span></div>

		//After
		<div id="sample"><span id="child1">�몃뱶</span> </div>
 */
nv.$Element.prototype.remove = function(oChild) {
    //-@@$Element.remove-@@//
    if(nv.cssquery) nv.cssquery.release();
    var ___element = nv.$Element;
    ___element(___element._common(oChild,"remove")).leave();
    return this;
};
//-!nv.$Element.prototype.remove end!-//

//-!nv.$Element.prototype.leave start(nv.$Element.event_etc)!-//
/**
 	leave() 硫붿꽌�쒕뒗 HTML �붿냼瑜� �먯떊�� 遺�紐� �붿냼�먯꽌 �쒓굅�쒕떎. HTML �붿냼�� �깅줉�� �대깽�� �몃뱾��, 洹몃━怨� 洹� �붿냼�� 紐⑤뱺 �먯떇�붿냼�� 紐⑤뱺 �대깽�� �몃뱾�щ룄 �쒓굅�쒕떎.

	@method leave
	@return {this} 遺�紐� �붿냼�먯꽌 �쒓굅�� �몄뒪�댁뒪 �먯떊
	@see nv.$Element#empty
	@see nv.$Element#remove
	@example
		// 遺�紐� �붿냼 �몃뱶�먯꽌 �쒓굅
		$Element("sample").leave();

		//Before
		<div>
			<div id="sample"><span>�몃뱶</span> <span>紐⑤몢</span> ��젣�섍린 </div>
		</div>

		//After : <div id="sample"><span>�몃뱶</span> <span>紐⑤몢</span> ��젣�섍린 </div>瑜� �섑븨�� $Element媛� 諛섑솚�쒕떎
		<div>

		</div>
 */
nv.$Element.prototype.leave = function() {
    //-@@$Element.leave-@@//
    var e = this._element;

    if(e.parentNode){
        if(nv.cssquery) nv.cssquery.release();
        e.parentNode.removeChild(e);
    }

    /*if(this._element.__nv__id){
        nv.$Element.eventManager.cleanUpUsingKey(this._element.__nv__id, true);
    }

    nv._p_.releaseEventHandlerForAllChildren(this);*/

    return this;
};
//-!nv.$Element.prototype.leave end!-//

//-!nv.$Element.prototype.wrap start(nv.$Element._common)!-//
/**
 	wrap() 硫붿꽌�쒕뒗 HTML �붿냼瑜� 吏��뺥븳 �붿냼濡� 媛먯떬��. HTML �붿냼�� 吏��뺥븳 �붿냼�� 留덉�留� �먯떇 �붿냼媛� �쒕떎.

	@method wrap
	@syntax sElement
	@syntax vElement
	@param {String+} sElement 遺�紐④� �� HTML �붿냼�� ID.
	@param {Element+ | Node} vElement 遺�紐④� �� HTML �붿냼.
	@return {nv.$Element} 吏��뺥븳 �붿냼濡� 媛먯떥吏� nv.$Element() 媛앹껜.
	@example
		$Element("sample1").wrap("sample2");

		//Before
		<div id="sample1"><span>Sample</span></div>
		<div id="sample2"><span>Sample</span></div>

		//After
		<div id="sample2"><span>Sample</span><div id="sample1"><span>Sample</span></div></div>
	@example
		$Element("box").wrap($('<DIV>'));

		//Before
		<span id="box"></span>

		//After
		<div><span id="box"></span></div>
 */
nv.$Element.prototype.wrap = function(wrapper) {
    //-@@$Element.wrap-@@//
    var e = this._element;
    wrapper = nv.$Element._common(wrapper,"wrap");
    if (e.parentNode) {
        e.parentNode.insertBefore(wrapper, e);
    }
    wrapper.appendChild(e);

    return this;
};
//-!nv.$Element.prototype.wrap end!-//

//-!nv.$Element.prototype.ellipsis start(nv.$Element.prototype._getCss,nv.$Element.prototype.text)!-//
/**
 	ellipsis() 硫붿꽌�쒕뒗 HTML �붿냼�� �띿뒪�� �몃뱶媛� 釉뚮씪�곗��먯꽌 �� 以꾨줈 蹂댁씠�꾨줉 湲몄씠瑜� 議곗젅�쒕떎.

	@method ellipsis
	@param {String+} [sTail="..."] 留먯쨪�� �쒖떆��. �뚮씪誘명꽣�� 吏��뺥븳 臾몄옄�댁쓣 �띿뒪�� �몃뱶 �앹뿉 遺숈씠怨� �띿뒪�� �몃뱶�� 湲몄씠瑜� 議곗젅�쒕떎.
	@return {this} �몄뒪�댁뒪 �먯떊
	@remark
		<ul class="disc">
			<li>�� 硫붿꽌�쒕뒗 HTML �붿냼媛� �띿뒪�� �몃뱶留뚯쓣 �ы븿�쒕떎怨� 媛��뺥븯怨� �숈옉�쒕떎. �곕씪��, �� �몄쓽 �곹솴�먯꽌�� �ъ슜�� �먯젣�쒕떎.</li>
			<li>釉뚮씪�곗��먯꽌 HTML �붿냼�� �덈퉬瑜� 湲곗��쇰줈 �띿뒪�� �몃뱶�� 湲몄씠瑜� �뺥븯誘�濡� HTML �붿냼�� 諛섎뱶�� 蹂댁씠�� �곹깭(display)�ъ빞 �쒕떎. �붾㈃�� �꾩껜 �띿뒪�� �몃뱶媛� 蹂댁��ㅺ� 以꾩뼱�쒕뒗 寃쎌슦媛� �덈떎. �� 寃쎌슦, HTML �붿냼�� overflow �띿꽦�� 媛믪쓣 hidden�쇰줈 吏��뺥븯硫� �닿껐�� �� �덈떎.</li>
		</ul>
	@example
		$Element("sample_span").ellipsis();

		//Before
		<div style="width:300px; border:1px solid #ccc padding:10px">
			<span id="sample_span">NHN�� 寃��됯낵 寃뚯엫�� �묒텞�쇰줈 �곸떊�곸씠怨� �몃━�� �⑤씪�� �쒕퉬�ㅻ� 袁몄��� �좊낫�대ŉ �붿��� �쇱씠�꾨� �좊룄�섍퀬 �덉뒿�덈떎.</span>
		</div>

		//After
		<div style="width:300px; border:1px solid #ccc; padding:10px">
			<span id="sample_span">NHN�� 寃��됯낵 寃뚯엫�� �묒텞�쇰줈 �곸떊��...</span>
		</div>
 */
nv.$Element.prototype.ellipsis = function(stringTail) {
    //-@@$Element.ellipsis-@@//

    var oArgs = g_checkVarType(arguments, {
        '4voi' : [ ],
        '4str' : [ 'stringTail:String+' ]
    },"$Element#ellipsis");

    stringTail = stringTail || "...";
    var txt   = this.text();
    var len   = txt.length;
    var padding = parseInt(this._getCss(this._element,"paddingTop"),10) + parseInt(this._getCss(this._element,"paddingBottom"),10);
    var cur_h = this._element.offsetHeight - padding;
    var i     = 0;
    var h     = this.text('A')._element.offsetHeight - padding;

    if (cur_h < h * 1.5) {
        this.text(txt);
        return this;
    }

    cur_h = h;
    while(cur_h < h * 1.5) {
        i += Math.max(Math.ceil((len - i)/2), 1);
        cur_h = this.text(txt.substring(0,i)+stringTail)._element.offsetHeight - padding;
    }

    while(cur_h > h * 1.5) {
        i--;
        cur_h = this.text(txt.substring(0,i)+stringTail)._element.offsetHeight - padding;
    }
    return this;
};
//-!nv.$Element.prototype.ellipsis end!-//

//-!nv.$Element.prototype.indexOf start!-//
/**
 	indexOf() 硫붿꽌�쒕뒗 HTML �붿냼�먯꽌 �뚮씪誘명꽣濡� 吏��뺥븳 �붿냼媛� 紐� 踰덉㎏ �먯떇�몄� �뺤씤�섏뿬 �몃뜳�ㅻ� 諛섑솚�쒕떎.

	@method indexOf
	@syntax sElement
	@syntax vElement
	@param {String+} sElement 紐� 踰덉㎏ �먯떇�몄� 寃��됲븷 �붿냼�� ID
	@param {Element+} vElement 紐� 踰덉㎏ �먯떇�몄� 寃��됲븷 �붿냼.
	@return {Numeric} 寃��� 寃곌낵 �몃뜳��. �몃뜳�ㅻ뒗 0遺��� �쒖옉�섎ŉ, 李얠� 紐삵븳 寃쎌슦�먮뒗 -1 �� 諛섑솚�쒕떎.
	@since 1.2.0
	@see nv.$Element#parent
	@see nv.$Element#child
	@see nv.$Element#prev
	@see nv.$Element#next
	@see nv.$Element#first
	@see nv.$Element#last
	@example
		<div id="sample_div1">
			<div id="sample_div">
				<div id="sample_div2">
					Sample1
				</div>
				<div id="sample_div3">
					<div id="sample_div4">
						Sample2
					</div>
					Sample3
				</div>
				<div id="sample_div5">
					Sample4
					<div id="sample_div6">
						Sample5
					</div>
				</div>
			</div>
		</div>

		<script type="text/javascript">
			var welSample = $Element("sample_div");
			welSample.indexOf($Element("sample_div1"));	// 寃곌낵 : -1
			welSample.indexOf($Element("sample_div2"));	// 寃곌낵 : 0
			welSample.indexOf($Element("sample_div3"));	// 寃곌낵 : 1
			welSample.indexOf($Element("sample_div4"));	// 寃곌낵 : -1
			welSample.indexOf($Element("sample_div5"));	// 寃곌낵 : 2
			welSample.indexOf($Element("sample_div6"));	// 寃곌낵 : -1
		</script>
 */
nv.$Element.prototype.indexOf = function(element) {
    //-@@$Element.indexOf-@@//
    try {
        var e = nv.$Element(element)._element;
        var n = this._element.childNodes;
        var c = 0;
        var l = n.length;

        for (var i=0; i < l; i++) {
            if (n[i].nodeType != 1) continue;

            if (n[i] === e) return c;
            c++;
        }
    }catch(e){}

    return -1;
};
//-!nv.$Element.prototype.indexOf end!-//

//-!nv.$Element.prototype.queryAll start(nv.cssquery)!-//
/**
 	queryAll() 硫붿꽌�쒕뒗 HTML �붿냼�먯꽌 �뱀젙 CSS �좏깮��(CSS Selector)瑜� 留뚯”�섎뒗 �섏쐞 �붿냼瑜� 李얜뒗��.

	@method queryAll
	@param {String+} sSelector CSS �좏깮��. CSS �좏깮�먮줈 �ъ슜�� �� �덈뒗 �⑦꽩�� �쒖� �⑦꽩怨� 鍮꾪몴以� �⑦꽩�� �덈떎. �쒖� �⑦꽩�� CSS Level3 紐낆꽭�쒖뿉 �덈뒗 �⑦꽩�� 吏��먰븳��.
	@return {Array} CSS ���됲꽣 議곌굔�� 留뚯”�섎뒗 HTML �붿냼(nv.$Element() 媛앹껜)瑜� 諛곗뿴濡� 諛섑솚�쒕떎. 留뚯”�섎뒗 HTML �붿냼媛� 議댁옱�섏� �딆쑝硫� 鍮� 諛곗뿴�� 諛섑솚�쒕떎.
	@see nv.$Element#query
	@see nv.$Element#queryAll
	@see http://www.w3.org/TR/css3-selectors/ CSS Level3 紐낆꽭�� - W3C
	@example
		<div id="sample">
			<div></div>
			<div class="pink"></div>
			<div></div>
			<div class="pink"></div>
			<div></div>
			<div class="blue"></div>
			<div class="blue"></div>
		</div>

		<script type="text/javascript">
			$Element("sample").queryAll(".pink");
			// <div class="pink"></div>�� <div class="pink"></div>瑜� �먯냼濡� �섎뒗 諛곗뿴�� 諛섑솚

			$Element("sample").queryAll(".green");
			// [] 鍮� 諛곗뿴�� 諛섑솚
		</script>
 */
nv.$Element.prototype.queryAll = function(sSelector) {
    //-@@$Element.queryAll-@@//
    var oArgs = g_checkVarType(arguments, {
        '4str'  : [ 'sSelector:String+']
    },"$Element#queryAll");

    var arrEle = nv.cssquery(sSelector, this._element);
    var returnArr = [];
    for(var i = 0, l = arrEle.length; i < l; i++){
        returnArr.push(nv.$Element(arrEle[i]));
    }
    return returnArr;
};
//-!nv.$Element.prototype.queryAll end!-//

//-!nv.$Element.prototype.query start(nv.cssquery)!-//
/**
 	query() 硫붿꽌�쒕뒗 HTML �붿냼�먯꽌 �뱀젙 CSS �좏깮��(CSS Selector)瑜� 留뚯”�섎뒗 泥� 踰덉㎏ �섏쐞 �붿냼瑜� 諛섑솚�쒕떎.

	@method query
	@param {String+} sSelector CSS �좏깮��. CSS �좏깮�먮줈 �ъ슜�� �� �덈뒗 �⑦꽩�� �쒖� �⑦꽩怨� 鍮꾪몴以� �⑦꽩�� �덈떎. �쒖� �⑦꽩�� CSS Level3 紐낆꽭�쒖뿉 �덈뒗 �⑦꽩�� 吏��먰븳��.
	@return {nv.$Element} CSS �좏깮�먯쓽 議곌굔�� 留뚯”�섎뒗 泥� 踰덉㎏ HTML �붿냼�� $Element�몄뒪�댁뒪. 留뚯”�섎뒗 HTML �붿냼媛� 議댁옱�섏� �딆쑝硫� null�� 諛섑솚�쒕떎.
	@see nv.$Element#test
	@see nv.$Element#queryAll
	@see http://www.w3.org/TR/css3-selectors/ CSS Level3 紐낆꽭�� - W3C
	@example
		<div id="sample">
			<div></div>
			<div class="pink"></div>
			<div></div>
			<div class="pink"></div>
			<div></div>
			<div class="blue"></div>
			<div class="blue"></div>
		</div>

		<script type="text/javascript">
			$Element("sample").query(".pink");
			// 泥� 踰덉㎏ <div class="pink"></div> DIV �붿냼瑜� 諛섑솚

			$Element("sample").query(".green");
			// null �� 諛섑솚
		</script>
 */
nv.$Element.prototype.query = function(sSelector) {
    //-@@$Element.query-@@//
    var oArgs = g_checkVarType(arguments, {
        '4str'  : [ 'sSelector:String+']
    },"$Element#query");
    var ele =  nv.cssquery.getSingle(sSelector, this._element);
    return ele === null? ele : nv.$Element(ele);
};
//-!nv.$Element.prototype.query end!-//

//-!nv.$Element.prototype.test start(nv.cssquery)!-//
/**
 	test() 硫붿꽌�쒕뒗 HTML �붿냼�먯꽌 �뱀젙 CSS �좏깮��(CSS Selector)瑜� 留뚯”�섎뒗吏� �뺤씤�쒕떎.

	@method test
	@param {String+} sSelector CSS �좏깮��. CSS �좏깮�먮줈 �ъ슜�� �� �덈뒗 �⑦꽩�� �쒖� �⑦꽩怨� 鍮꾪몴以� �⑦꽩�� �덈떎. �쒖� �⑦꽩�� CSS Level3 紐낆꽭�쒖뿉 �덈뒗 �⑦꽩�� 吏��먰븳��.
	@return {Boolean} CSS �좏깮�먯쓽 議곌굔�� 留뚯”�섎㈃ true, 洹몃젃吏� �딆쑝硫� false瑜� 諛섑솚�쒕떎.
	@see nv.$Element#query
	@see nv.$Element#queryAll
	@see http://www.w3.org/TR/css3-selectors/ CSS Level3 紐낆꽭�� - W3C
	@example
		<div id="sample" class="blue"></div>

		<script type="text/javascript">
			$Element("sample").test(".blue");	// 寃곌낵 : true
			$Element("sample").test(".red");	// 寃곌낵 : false
		</script>
 */
nv.$Element.prototype.test = function(sSelector) {
    //-@@$Element.test-@@//
    var oArgs = g_checkVarType(arguments, {
        '4str'  : [ 'sSelector:String+']
    },"$Element#test");
    return nv.cssquery.test(this._element, sSelector);
};
//-!nv.$Element.prototype.test end!-//

//-!nv.$Element.prototype.xpathAll start(nv.cssquery)!-//
/**
 	xpathAll() 硫붿꽌�쒕뒗 HTML �붿냼瑜� 湲곗��쇰줈 XPath 臾몃쾿�� 留뚯”�섎뒗 �붿냼瑜� 媛��몄삩��.

	@method xpathAll
	@param {String+} sXPath XPath 媛�.
	@return {Array} XPath 臾몃쾿�� 留뚯”�섎뒗 �붿냼(nv.$Element() 媛앹껜)瑜� �먯냼濡� �섎뒗 諛곗뿴.
	@remark 吏��먰븯�� 臾몃쾿�� �쒗븳�곸씠誘�濡� �뱀닔�� 寃쎌슦�먮쭔 �ъ슜�� 寃껋쓣 沅뚯옣�쒕떎.
	@see nv.$$
	@example
		<div id="sample">
			<div>
				<div>1</div>
				<div>2</div>
				<div>3</div>
				<div>4</div>
				<div>5</div>
				<div>6</div>
			</div>
		</div>

		<script type="text/javascript">
			$Element("sample").xpathAll("div/div[5]");
			// <div>5</div> �붿냼瑜� �먯냼濡� �섎뒗 諛곗뿴�� 諛섑솚 ��
		</script>
 */
nv.$Element.prototype.xpathAll = function(sXPath) {
    //-@@$Element.xpathAll-@@//
    var oArgs = g_checkVarType(arguments, {
        '4str'  : [ 'sXPath:String+']
    },"$Element#xpathAll");
    var arrEle = nv.cssquery.xpath(sXPath, this._element);
    var returnArr = [];
    for(var i = 0, l = arrEle.length; i < l; i++){
        returnArr.push(nv.$Element(arrEle[i]));
    }
    return returnArr;
};
//-!nv.$Element.prototype.xpathAll end!-//

//-!nv.$Element.prototype.insertAdjacentHTML.hidden start!-//
/**
 	insertAdjacentHTML �⑥닔. 吏곸젒�ъ슜�섏� 紐삵븿.

	@method insertAdjacentHTML
	@ignore
 */
nv.$Element.insertAdjacentHTML = function(ins,html,insertType,type,fn,sType){
    var aArg = [ html ];
    aArg.callee = arguments.callee;
    var oArgs = g_checkVarType(aArg, {
        '4str'  : [ 'sHTML:String+' ]
    },"$Element#"+sType);
    var _ele = ins._element;
    html = html+"";
    if( _ele.insertAdjacentHTML && !(/^<(option|tr|td|th|col)(?:.*?)>/.test(nv._p_.trim(html).toLowerCase()))){
        _ele.insertAdjacentHTML(insertType, html);
    }else{
        var oDoc = _ele.ownerDocument || _ele.document || document;
        var fragment = oDoc.createDocumentFragment();
        var defaultElement;
        var sTag = nv._p_.trim(html);
        var oParentTag = {
            "option" : "select",
            "tr" : "tbody",
            "thead" : "table",
            "tbody" : "table",
            "col" : "table",
            "td" : "tr",
            "th" : "tr",
            "div" : "div"
        };
        var aMatch = /^<(option|tr|thead|tbody|td|th|col)(?:.*?)\>/i.exec(sTag);
        var sChild = aMatch === null ? "div" : aMatch[1].toLowerCase();
        var sParent = oParentTag[sChild] ;
        defaultElement = nv._p_._createEle(sParent,sTag,oDoc,true);
        var scripts = defaultElement.getElementsByTagName("script");

        for ( var i = 0, l = scripts.length; i < l; i++ ){
            scripts[i].parentNode.removeChild( scripts[i] );
        }

        if(_ele.tagName.toLowerCase() == "table" && !_ele.getElementsByTagName("tbody").length && !sTag.match(/<tbody[^>]*>/i)) {
            var elTbody = oDoc.createElement("tbody"),
                bTheadTfoot = sTag.match(/^<t(head|foot)[^>]*>/i);

            if(!bTheadTfoot) {
                fragment.appendChild(elTbody);
                fragment = elTbody;
            }
        }

        while ( defaultElement[ type ]){
            fragment.appendChild( defaultElement[ type ] );
        }

        bTheadTfoot && fragment.appendChild(elTbody);
        fn(fragment.cloneNode(true));
    }
    return ins;
};

//-!nv.$Element.prototype.insertAdjacentHTML.hidden end!-//

//-!nv.$Element.prototype.appendHTML start(nv.$Element.prototype.insertAdjacentHTML)!-//
/**
 	appendHTML() 硫붿꽌�쒕뒗 �대� HTML 肄붾뱶(innerHTML)�� �ㅼ뿉 �뚮씪誘명꽣濡� 吏��뺥븳 HTML 肄붾뱶瑜� �㏓텤�몃떎.

	@method appendHTML
	@param {String+} sHTML �㏓텤�� HTML 臾몄옄��.
	@return {this} �대� HTML 肄붾뱶瑜� 蹂�寃쏀븳 �몄뒪�댁뒪 �먯떊
	@remark 1.4.8 踰꾩쟾遺��� nv.$Element() 媛앹껜瑜� 諛섑솚�쒕떎.
	@since 1.4.6
	@see nv.$Element#prependHTML
	@see nv.$Element#beforeHTML
	@see nv.$Element#afterHTML
	@example
		// �대� HTML 媛��� �ㅼ뿉 �㏓텤�닿린
		$Element("sample_ul").appendHTML("<li>3</li><li>4</li>");

		//Before
		<ul id="sample_ul">
			<li>1</li>
			<li>2</li>
		</ul>

		//After
		<ul id="sample_ul">
			<li>1</li>
			<li>2</li>
			<li>3</li>
			<li>4</li>
		</ul>
 */
nv.$Element.prototype.appendHTML = function(sHTML) {
    //-@@$Element.appendHTML-@@//
    return nv.$Element.insertAdjacentHTML(this,sHTML,"beforeEnd","firstChild",nv.$Fn(function(oEle) {
        var ele = this._element;

        if(ele.tagName.toLowerCase() === "table") {
            var nodes = ele.childNodes;

            for(var i=0,l=nodes.length; i < l; i++) {
                if(nodes[i].nodeType==1){
                    ele = nodes[i];
                    break;
                }
            }
        }
        ele.appendChild(oEle);
    },this).bind(),"appendHTML");
};
//-!nv.$Element.prototype.appendHTML end!-//

//-!nv.$Element.prototype.prependHTML start(nv.$Element.prototype.insertAdjacentHTML,nv.$Element._prepend)!-//
/**
 	prependHTML() 硫붿꽌�쒕뒗 �대� HTML 肄붾뱶(innerHTML)�� �욎뿉 �뚮씪誘명꽣濡� 吏��뺥븳 HTML 肄붾뱶瑜� �쎌엯�쒕떎.

	@method prependHTML
	@param {String+} sHTML �쎌엯�� HTML 臾몄옄��.
	@return {this} �몄뒪�댁뒪 �먯떊
	@remark 1.4.8 踰꾩쟾遺��� nv.$Element() 媛앹껜瑜� 諛섑솚�쒕떎.
	@since 1.4.6
	@see nv.$Element#appendHTML
	@see nv.$Element#beforeHTML
	@see nv.$Element#afterHTML
	@example
		// �대� HTML 媛��� �욎뿉 �쎌엯
		$Element("sample_ul").prependHTML("<li>3</li><li>4</li>");

		//Before
		<ul id="sample_ul">
			<li>1</li>
			<li>2</li>
		</ul>

		//After
		<ul id="sample_ul">
			<li>4</li>
			<li>3</li>
			<li>1</li>
			<li>2</li>
		</ul>
 */
nv.$Element.prototype.prependHTML = function(sHTML) {
    //-@@$Element.prependHTML-@@//
    var ___element = nv.$Element;

    return ___element.insertAdjacentHTML(this,sHTML,"afterBegin","firstChild",nv.$Fn(function(oEle) {
        var ele = this._element;
        if(ele.tagName.toLowerCase() === "table") {
            var nodes = ele.childNodes;
            for(var i=0,l=nodes.length; i < l; i++) {
                if(nodes[i].nodeType==1) {
                    ele = nodes[i];
                    break;
                }
            }
        }
        ___element._prepend(ele,oEle);
    },this).bind(),"prependHTML");
};
//-!nv.$Element.prototype.prependHTML end!-//

//-!nv.$Element.prototype.beforeHTML start(nv.$Element.prototype.insertAdjacentHTML)!-//
/**
 	beforeHTML() 硫붿꽌�쒕뒗 HTML 肄붾뱶(outerHTML)�� �욎뿉 �뚮씪誘명꽣濡� 吏��뺥븳 HTML 肄붾뱶瑜� �쎌엯�쒕떎.

	@method beforeHTML
	@param {String+} sHTML �쎌엯�� HTML 臾몄옄��.
	@return {this} �몄뒪�댁뒪 �먯떊
	@remark 1.4.8 遺��� nv.$Element() 媛앹껜瑜� 諛섑솚�쒕떎.
	@since 1.4.6
	@see nv.$Element#appendHTML
	@see nv.$Element#prependHTML
	@see nv.$Element#afterHTML
	@example
		var welSample = $Element("sample_ul");

		welSample.beforeHTML("<ul><li>3</li><li>4</li></ul>");
		welSample.beforeHTML("<ul><li>5</li><li>6</li></ul>");

		//Before
		<ul id="sample_ul">
			<li>1</li>
			<li>2</li>
		</ul>

		//After
		<ul>
			<li>5</li>
			<li>6</li>
		</ul>
		<ul>
			<li>3</li>
			<li>4</li>
		</ul>
		<ul id="sample_ul">
			<li>1</li>
			<li>2</li>
		</ul>
 */
nv.$Element.prototype.beforeHTML = function(sHTML) {
    //-@@$Element.beforeHTML-@@//
    return nv.$Element.insertAdjacentHTML(this,sHTML,"beforeBegin","firstChild",nv.$Fn(function(oEle){
        this._element.parentNode.insertBefore(oEle, this._element);
    },this).bind(),"beforeHTML");
};
//-!nv.$Element.prototype.beforeHTML end!-//

//-!nv.$Element.prototype.afterHTML start(nv.$Element.prototype.insertAdjacentHTML)!-//
/**
 	afterHTML() 硫붿꽌�쒕뒗 HTML 肄붾뱶(outerHTML)�� �ㅼ뿉 �뚮씪誘명꽣濡� 吏��뺥븳 HTML 肄붾뱶瑜� �쎌엯�쒕떎.

	@method afterHTML
	@param {String+} sHTML �쎌엯�� HTML 臾몄옄��.
	@return {this} �대� HTML 肄붾뱶瑜� 蹂�寃쏀븳 �몄뒪�댁뒪 �먯떊
	@since 1.4.8 踰꾩쟾遺��� nv.$Element() 媛앹껜瑜� 諛섑솚�쒕떎.
	@since 1.4.6
	@see nv.$Element#appendHTML
	@see nv.$Element#prependHTML
	@see nv.$Element#beforeHTML
	@example
		var welSample = $Element("sample_ul");

		welSample.afterHTML("<ul><li>3</li><li>4</li></ul>");
		welSample.afterHTML("<ul><li>5</li><li>6</li></ul>");

		//Before
		<ul id="sample_ul">
			<li>1</li>
			<li>2</li>
		</ul>

		//After
		<ul id="sample_ul">
			<li>1</li>
			<li>2</li>
		</ul>
		<ul>
			<li>3</li>
			<li>4</li>
		</ul>
		<ul>
			<li>5</li>
			<li>6</li>
		</ul>
 */
nv.$Element.prototype.afterHTML = function(sHTML) {
    //-@@$Element.afterHTML-@@//
    return nv.$Element.insertAdjacentHTML(this,sHTML,"afterEnd","firstChild",nv.$Fn(function(oEle){
        this._element.parentNode.insertBefore( oEle, this._element.nextSibling );
    },this).bind(),"afterHTML");
};
//-!nv.$Element.prototype.afterHTML end!-//

//-!nv.$Element.prototype.hasEventListener start(nv.$Element.prototype.attach)!-//
/**
	�섎━癒쇳듃�� �대떦 �대깽�멸� �좊떦�섏뼱 �덈뒗吏�瑜� �뺤씤.

	@method hasEventListener
	@param {String+} sEvent �대깽�몃챸
	@return {Boolean} �대깽�� �좊떦 �좊Т
	@remark 2.2.0 踰꾩쟾遺���, load�� domready�대깽�몃뒗 媛곴컖 Window�� Document�먯꽌 諛쒖깮�섎뒗 �대깽�몄씠吏�留� �쒕줈瑜� 援먯감�댁꽌 �깅줉�섏뿬�� �대깽�멸� �щ컮瑜닿쾶 諛쒖깮�쒕떎.
	@since 2.0.0
	@example
		$Element("test").attach("click",function(){});

		$Element("test").hasEventListener("click"); //true
		$Element("test").hasEventListener("mousemove"); //false
 */
nv.$Element.prototype.hasEventListener = function(sEvent){

    var oArgs = g_checkVarType(arguments, {
        '4str' : [ 'sEvent:String+' ]
    },"$Element#hasEventListener"),
        oDoc,
        bHasEvent = false,
        sLowerCaseEvent = oArgs.sEvent.toLowerCase();

    if(this._key){
        oDoc = this._element.ownerDocument || this._element.document || document;

        if(sLowerCaseEvent == "load" && this._element === oDoc){
            bHasEvent = nv.$Element(window).hasEventListener(oArgs.sEvent);
        }else if(sLowerCaseEvent == "domready" && nv.$Jindo.isWindow(this._element)){
            bHasEvent = nv.$Element(oDoc).hasEventListener(oArgs.sEvent);
        }else{
            var realEvent = nv.$Element.eventManager.revisionEvent("", sEvent);
            bHasEvent = !!nv.$Element.eventManager.hasEvent(this._key, realEvent, oArgs.sEvent);
        }

        return bHasEvent;
    }

    return false;
};
//-!nv.$Element.prototype.hasEventListener end!-//

//-!nv.$Element.prototype.preventTapHighlight start(nv.$Element.prototype.addClass, nv.$Element.prototype.removeClass)!-//
/**
	紐⑤컮�쇱뿉�� �대깽�� �몃━寃뚯씠�몃� �ъ슜�덉쓣�� 遺�紐� �섎━癒쇳듃�� �섏씠�쇱씠�멸� �섎뒗 寃껋쓣 留됰뒗��.

	@method preventTapHighlight
	@param {Boolean} bType �섏씠�쇱씠�몃� 留됱쓣吏� �좊Т
	@return {this} �몄뒪�댁뒪 �먯떊
	@since 2.0.0
	@example
		<ul id="test">
			<li><a href="#nhn">nhn</a></li>
			<li><a href="#naver">naver</a></li>
			<li><a href="#hangame">hangame</a></li>
		</ul>

		$Element("test").preventTapHighlight(true); // �대젃寃� �섎㈃ 紐⑤컮�쇱뿉�� test�� �섏씠�쇱씠�멸� �섎뒗 寃껋쓣 留됰뒗��.
		$Element("test").delegate("click","a",function(e){});
 */
nv.$Element.prototype.preventTapHighlight = function(bFlag){
    if(nv._p_._JINDO_IS_MO){
        var sClassName = 'no_tap_highlight' + new Date().getTime();

        var elStyleTag = document.createElement('style');
        var elHTML = document.getElementsByTagName('html')[0];

        elStyleTag.type = "text/css";

        elHTML.insertBefore(elStyleTag, elHTML.firstChild);
        var oSheet = elStyleTag.sheet || elStyleTag.styleSheet;

        oSheet.insertRule('.' + sClassName + ' { -webkit-tap-highlight-color: rgba(0,0,0,0); }', 0);
        oSheet.insertRule('.' + sClassName + ' * { -webkit-tap-highlight-color: rgba(0,0,0,.25); }', 0);

        nv.$Element.prototype.preventTapHighlight = function(bFlag) {
            return this[bFlag ? 'addClass' : 'removeClass'](sClassName);
        };
    }else{
        nv.$Element.prototype.preventTapHighlight = function(bFlag) { return this; };
    }
    return this.preventTapHighlight.apply(this,nv._p_._toArray(arguments));
};
//-!nv.$Element.prototype.preventTapHighlight end!-//


//-!nv.$Element.prototype.data start(nv.$Json._oldToString)!-//
/**
 	data() 硫붿꽌�쒕뒗 dataset�� �띿꽦�� 媛��몄삩��.

	@method data
	@param {String+} sName dataset �대쫫
	@return {Variant} dataset 媛믪쓣 諛섑솚. set�� �� �ｌ� ���낆쑝濡� 諛섑솚�섍퀬, �대떦 �띿꽦�� �녿떎硫� null�� 諛섑솚�쒕떎. ��, JSON.stringfly�� 諛섑솚 媛믪씠 undefined�� 寃쎌슦�� �ㅼ젙�섏� �딅뒗��.
	@see nv.$Element#attr
 */
/**
 	data() 硫붿꽌�쒕뒗 dataset�� �띿꽦�� �ㅼ젙�쒕떎.

	@method data
	@syntax sName, vValue
	@syntax oList
	@param {String+} sName dataset �대쫫.
	@param {Variant} vValue dataset�� �ㅼ젙�� 媛�. dataset�� 媛믪쓣 null濡� �ㅼ젙�섎㈃ �대떦 dataset�� ��젣�쒕떎.
	@param {Hash+} oList �섎굹 �댁긽�� dataset怨� 媛믪쓣 媛�吏��� 媛앹껜(Object) �먮뒗 �댁떆 媛앹껜(nv.$H() 媛앹껜).
	@return {this} dataset�� �띿꽦�� �ㅼ젙�� �몄뒪�댁뒪 �먯떊
	@see nv.$Element#attr
	@example
		//Set
		//Before
		<ul id="maillist">
			<li id="folder">Read</li>
		</ul>

		//Do
		$Element("folder").data("count",123);
		$Element("folder").data("info",{
			"some1" : 1,
			"some2" : 2
		});

		//After
		<li id="folder" data-count="123" data-info="{\"some1\":1,\"some2\":2}">Read</li>
	@example
		//Get
		//Before
		<li id="folder" data-count="123" data-info="{\"some1\":1,\"some2\":2}">Read</li>

		//Do
		$Element("folder").data("count"); -> 123//Number
		$Element("folder").data("info"); -> {"some1":1, "some2":2} //Object
	@example
		//Delete
		//Before
		<li id="folder" data-count="123" data-info="{\"some1\":1,\"some2\":2}">Read</li>

		//Do
		$Element("folder").data("count",null);
		$Element("folder").data("info",null);

		//After
		<li id="folder">Read</li>
 */
nv.$Element.prototype.data = function(sKey, vValue) {
    var oType ={
        'g'  : ["sKey:String+"],
        's4var' : ["sKey:String+", "vValue:Variant"],
        's4obj' : ["oObj:Hash+"]
    };
    var nvKey = "_nv";
    function toCamelCase(name){
        return name.replace(/\-(.)/g,function(_,a){
            return a.toUpperCase();
        });
    }
    function toDash(name){
        return name.replace(/[A-Z]/g,function(a){
            return "-"+a.toLowerCase();
        });
    }
    if(document.body.dataset){
        nv.$Element.prototype.data = function(sKey, vValue) {
            var sToStr, oArgs = g_checkVarType(arguments, oType ,"$Element#data");
            var  isNull = nv.$Jindo.isNull;

            switch(oArgs+""){
                case "g":
                    sKey = toCamelCase(sKey);
                    var isMakeFromJindo = this._element.dataset[sKey+nvKey];
                    var sDateSet = this._element.dataset[sKey];
                    if(sDateSet){
                        if(isMakeFromJindo){
                            return window.JSON.parse(sDateSet);
                        }
                        return sDateSet;
                    }
                    return null;
                    // 'break' statement was intentionally omitted.
                case "s4var":
                    var oData;
                    if(isNull(vValue)){
                        sKey = toCamelCase(sKey);
                        delete this._element.dataset[sKey];
                        delete this._element.dataset[sKey+nvKey];
                        return this;
                    }else{
                        oData = {};
                        oData[sKey] = vValue;
                        sKey = oData;
                    }
                    // 'break' statement was intentionally omitted.
                case "s4obj":
                    var sChange;
                    for(var i in sKey){
                        sChange = toCamelCase(i);
                        if(isNull(sKey[i])){
                            delete this._element.dataset[sChange];
                            delete this._element.dataset[sChange+nvKey];
                        }else{
                            sToStr = nv.$Json._oldToString(sKey[i]);
                            if(sToStr!=null){
                                this._element.dataset[sChange] = sToStr;
                                this._element.dataset[sChange+nvKey] = "nv";
                            }
                        }
                    }
                    return this;
            }
        };
    }else{
        nv.$Element.prototype.data = function(sKey, vValue) {
            var sToStr, oArgs = g_checkVarType(arguments, oType ,"$Element#data");
            var  isNull = nv.$Jindo.isNull;
            switch(oArgs+""){
                case "g":
                    sKey = toDash(sKey);
                    var isMakeFromJindo = this._element.getAttribute("data-"+sKey+nvKey);
                    var sVal = this._element.getAttribute("data-"+sKey);

                    if(isMakeFromJindo){
                        return (sVal!=null)? eval("("+sVal+")") : null;
                    }else{
                        return sVal;
                    }
                    // 'break' statement was intentionally omitted.
                case "s4var":
                    var oData;
                    if(isNull(vValue)){
                        sKey = toDash(sKey);
                        this._element.removeAttribute("data-"+sKey);
                        this._element.removeAttribute("data-"+sKey+nvKey);
                        return this;
                    }else{
                        oData = {};
                        oData[sKey] = vValue;
                        sKey = oData;
                    }
                    // 'break' statement was intentionally omitted.
                case "s4obj":
                    var sChange;
                    for(var i in sKey){
                        sChange = toDash(i);
                        if(isNull(sKey[i])){
                            this._element.removeAttribute("data-"+sChange);
                            this._element.removeAttribute("data-"+sChange+nvKey);
                        }else{
                            sToStr = nv.$Json._oldToString(sKey[i]);
                            if(sToStr!=null){
                                this._element.setAttribute("data-"+sChange, sToStr);
                                this._element.setAttribute("data-"+sChange+nvKey, "nv");
                            }
                        }
                    }
                    return this;
            }
        };
    }

    return this.data.apply(this, nv._p_._toArray(arguments));
};
//-!nv.$Element.prototype.data end!-//

/**
 	@fileOverview $Json�� �앹꽦�� 諛� 硫붿꽌�쒕� �뺤쓽�� �뚯씪
	@name json.js
	@author NAVER Ajax Platform
 */

//-!nv.$Json start(nv.$Json._oldMakeJSON)!-//
/**
 	nv.$Json() 媛앹껜�� JSON(JavaScript Object Notation)�� �ㅻ（湲� �꾪븳 �ㅼ뼇�� 湲곕뒫�� �쒓났�쒕떎. �앹꽦�먯뿉 �뚮씪誘명꽣濡� 媛앹껜�� 臾몄옄�댁쓣 �낅젰�쒕떎. XML �뺥깭�� 臾몄옄�대줈 nv.$Json() 媛앹껜瑜� �앹꽦�섎젮硫� fromXML() 硫붿꽌�쒕� �ъ슜�쒕떎.

	@class nv.$Json
	@keyword json, �쒖씠��
 */
/**
 	nv.$Json() 媛앹껜瑜� �앹꽦�쒕떎.

	@constructor
	@param {Varaint} sObject �ㅼ뼇�� ����
	@return {nv.$Json} �몄닔瑜� �몄퐫�⑺븳 nv.$Json() 媛앹껜.
	@see nv.$Json#fromXML
	@see http://www.json.org/json-ko.html json.org
	@example
		var oStr = $Json ('{ zoo: "myFirstZoo", tiger: 3, zebra: 2}');

		var d = {name : 'nhn', location: 'Bundang-gu'}
		var oObj = $Json (d);
 */
nv.$Json = function (sObject) {
	//-@@$Json-@@//
	var cl = arguments.callee;
	if (sObject instanceof cl) return sObject;

	if (!(this instanceof cl)){
		try {
			nv.$Jindo._maxWarn(arguments.length, 1,"$Json");
			return new cl(arguments.length?sObject:{});
		} catch(e) {
			if (e instanceof TypeError) { return null; }
			throw e;
		}
	}

	g_checkVarType(arguments, {
		'4var' : ['oObject:Variant']
	},"$Json");
	this._object = sObject;
};
//-!nv.$Json end!-//

//-!nv.$Json._oldMakeJSON.hidden start!-//
nv.$Json._oldMakeJSON = function(sObject,sType){
	try {
		if(nv.$Jindo.isString(sObject)&&/^(?:\s*)[\{\[]/.test(sObject)){
			sObject = eval("("+sObject+")");
		}else{
			return sObject;
		}
	} catch(e) {
		throw new nv.$Error(nv.$Except.PARSE_ERROR,sType);
	}
	return sObject;
};
//-!nv.$Json._oldMakeJSON.hidden end!-//

//-!nv.$Json.fromXML start!-//
/**
  	fromXML() 硫붿꽌�쒕뒗 XML �뺥깭�� 臾몄옄�댁쓣 nv.$Json() 媛앹껜濡� �몄퐫�⑺븳��. XML �뺤떇�� 臾몄옄�댁뿉 XML �붿냼媛� �띿꽦�� �ы븿�섍퀬 �덉쓣 寃쎌슦 �대떦 �붿냼�� �뺣낫�� �대떦�섎뒗 �댁슜�� �섏쐞 媛앹껜濡� �쒗쁽�쒕떎. �대븣 �붿냼媛� CDATA 媛믪쓣 媛�吏� 寃쎌슦 $cdata �띿꽦�쇰줈 媛믪쓣 ���ν븳��.

	@static
	@method fromXML
	@param {String+} sXML XML �뺥깭�� 臾몄옄��.
	@return {nv.$Json} nv.$Json() 媛앹껜.
	@throws {nv.$Except.PARSE_ERROR} json媛앹껜瑜� �뚯떛�섎떎媛� �먮윭諛쒖깮�� ��.
	@example
		var j1 = $Json.fromXML('<data>only string</data>');

		// 寃곌낵 :
		// {"data":"only string"}

		var j2 = $Json.fromXML('<data><id>Faqh%$</id><str attr="123">string value</str></data>');

		// 寃곌낵 :
		// {"data":{"id":"Faqh%$","str":{"attr":"123","$cdata":"string value"}}}
  */
nv.$Json.fromXML = function(sXML) {
	//-@@$Json.fromXML-@@//
	var cache = nv.$Jindo;
	var oArgs = cache.checkVarType(arguments, {
		'4str' : ['sXML:String+']
	},"<static> $Json#fromXML");
	var o  = {};
	var re = /\s*<(\/?[\w:\-]+)((?:\s+[\w:\-]+\s*=\s*(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'))*)\s*((?:\/>)|(?:><\/\1>|\s*))|\s*<!\[CDATA\[([\w\W]*?)\]\]>\s*|\s*>?([^<]*)/ig;
	var re2= /^[0-9]+(?:\.[0-9]+)?$/;
	var ec = {"&amp;":"&","&nbsp;":" ","&quot;":"\"","&lt;":"<","&gt;":">"};
	var fg = {tags:["/"],stack:[o]};
	var es = function(s){
		if (cache.isUndefined(s)) return "";
		return  s.replace(/&[a-z]+;/g, function(m){ return (cache.isString(ec[m]))?ec[m]:m; });
	};
	var at = function(s,c){s.replace(/([\w\:\-]+)\s*=\s*(?:"((?:\\"|[^"])*)"|'((?:\\'|[^'])*)')/g, function($0,$1,$2,$3){c[$1] = es(($2?$2.replace(/\\"/g,'"'):undefined)||($3?$3.replace(/\\'/g,"'"):undefined));}); };
	var em = function(o){
		for(var x in o){
			if (o.hasOwnProperty(x)) {
				if(Object.prototype[x])
					continue;
					return false;
			}
		}
		return true;
	};
	/*
	  $0 : �꾩껜
$1 : �쒓렇紐�
$2 : �띿꽦臾몄옄��
$3 : �ル뒗�쒓렇
$4 : CDATA諛붾뵒媛�
$5 : 洹몃깷 諛붾뵒媛�
	 */

	var cb = function($0,$1,$2,$3,$4,$5) {
		var cur, cdata = "";
		var idx = fg.stack.length - 1;

		if (cache.isString($1)&& $1) {
			if ($1.substr(0,1) != "/") {
				var has_attr = (typeof $2 == "string" && $2);
				var closed   = (typeof $3 == "string" && $3);
				var newobj   = (!has_attr && closed)?"":{};

				cur = fg.stack[idx];

				if (cache.isUndefined(cur[$1])) {
					cur[$1] = newobj;
					cur = fg.stack[idx+1] = cur[$1];
				} else if (cur[$1] instanceof Array) {
					var len = cur[$1].length;
					cur[$1][len] = newobj;
					cur = fg.stack[idx+1] = cur[$1][len];
				} else {
					cur[$1] = [cur[$1], newobj];
					cur = fg.stack[idx+1] = cur[$1][1];
				}

				if (has_attr) at($2,cur);

				fg.tags[idx+1] = $1;

				if (closed) {
					fg.tags.length--;
					fg.stack.length--;
				}
			} else {
				fg.tags.length--;
				fg.stack.length--;
			}
		} else if (cache.isString($4) && $4) {
			cdata = $4;
		} else if (cache.isString($5) && $5) {
			cdata = es($5);
		}

		if (cdata.replace(/^\s+/g, "").length > 0) {
			var par = fg.stack[idx-1];
			var tag = fg.tags[idx];

			if (re2.test(cdata)) {
				cdata = parseFloat(cdata);
			}else if (cdata == "true"){
				cdata = true;
			}else if(cdata == "false"){
				cdata = false;
			}

			if(cache.isUndefined(par)) return;

			if (par[tag] instanceof Array) {
				var o = par[tag];
				if (cache.isHash(o[o.length-1]) && !em(o[o.length-1])) {
					o[o.length-1].$cdata = cdata;
					o[o.length-1].toString = function(){ return cdata; };
				} else {
					o[o.length-1] = cdata;
				}
			} else {
				if (cache.isHash(par[tag])&& !em(par[tag])) {
					par[tag].$cdata = cdata;
					par[tag].toString = function(){ return cdata; };
				} else {
					par[tag] = cdata;
				}
			}
		}
	};

	sXML = sXML.replace(/<(\?|\!-)[^>]*>/g, "");
	sXML.replace(re, cb);

	return nv.$Json(o);
};
//-!nv.$Json.fromXML end!-//

//-!nv.$Json.prototype.get start!-//
/**
 	get() 硫붿꽌�쒕뒗 �뱀젙 寃쎈줈(path)�� �대떦�섎뒗 nv.$Json() 媛앹껜�� 媛믪쓣 諛섑솚�쒕떎.

	@method get
	@param {String+} sPath 寃쎈줈瑜� 吏��뺥븳 臾몄옄��
	@return {Array} 吏��뺣맂 寃쎈줈�� �대떦�섎뒗 媛믪쓣 �먯냼濡� 媛�吏��� 諛곗뿴.
	@throws {nv.$Except.PARSE_ERROR} json媛앹껜瑜� �뚯떛�섎떎媛� �먮윭諛쒖깮�� ��.
	@example
		var j = $Json.fromXML('<data><id>Faqh%$</id><str attr="123">string value</str></data>');
		var r = j.get ("/data/id");

		// 寃곌낵 :
		// [Faqh%$]
 */
nv.$Json.prototype.get = function(sPath) {
	//-@@$Json.get-@@//
	var cache = nv.$Jindo;
	var oArgs = cache.checkVarType(arguments, {
		'4str' : ['sPath:String+']
	},"$Json#get");
	var o = nv.$Json._oldMakeJSON(this._object,"$Json#get");
	if(!(cache.isHash(o)||cache.isArray(o))){
		throw new nv.$Error(nv.$Except.JSON_MUST_HAVE_ARRAY_HASH,"$Json#get");
	}
	var p = sPath.split("/");
	var re = /^([\w:\-]+)\[([0-9]+)\]$/;
	var stack = [[o]], cur = stack[0];
	var len = p.length, c_len, idx, buf, j, e;

	for(var i=0; i < len; i++) {
		if (p[i] == "." || p[i] == "") continue;
		if (p[i] == "..") {
			stack.length--;
		} else {
			buf = [];
			idx = -1;
			c_len = cur.length;

			if (c_len == 0) return [];
			if (re.test(p[i])) idx = +RegExp.$2;

			for(j=0; j < c_len; j++) {
				e = cur[j][p[i]];
				if (cache.isUndefined(e)) continue;
				if (cache.isArray(e)) {
					if (idx > -1) {
						if (idx < e.length) buf[buf.length] = e[idx];
					} else {
						buf = buf.concat(e);
					}
				} else if (idx == -1) {
					buf[buf.length] = e;
				}
			}

			stack[stack.length] = buf;
		}

		cur = stack[stack.length-1];
	}

	return cur;
};
//-!nv.$Json.prototype.get end!-//

//-!nv.$Json.prototype.toString start(nv.$Json._oldToString)!-//
/**
 	toString() 硫붿꽌�쒕뒗 nv.$Json() 媛앹껜瑜� JSON 臾몄옄�� �뺥깭濡� 諛섑솚�쒕떎.

	@method toString
	@return {String} JSON 臾몄옄��.
	@see nv.$Json#toObject
	@see nv.$Json#toXML
	@see http://www.json.org/json-ko.html json.org
	@example
		var j = $Json({foo:1, bar: 31});
		document.write (j.toString());
		document.write (j);

		// 寃곌낵 :
		// {"bar":31,"foo":1}{"bar":31,"foo":1}
 */
nv.$Json.prototype.toString = function() {
	//-@@$Json.toString-@@//
    return nv.$Json._oldToString(this._object);

};
//-!nv.$Json.prototype.toString end!-//

//-!nv.$Json._oldToString.hidden start(nv.$H.prototype.ksort)!-//
nv.$Json._oldToString = function(oObj){
	var cache = nv.$Jindo;
	var func = {
		$ : function($) {
			if (cache.isNull($)||!cache.isString($)&&$==Infinity) return "null";
			if (cache.isFunction($)) return undefined;
			if (cache.isUndefined($)) return undefined;
			if (cache.isBoolean($)) return $?"true":"false";
			if (cache.isString($)) return this.s($);
			if (cache.isNumeric($)) return $;
			if (cache.isArray($)) return this.a($);
			if (cache.isHash($)) return this.o($);
			if (cache.isDate($)) return $+"";
			if (typeof $ == "object"||cache.isRegExp($)) return "{}";
			if (isNaN($)) return "null";
		},
		s : function(s) {
			var e = {'"':'\\"',"\\":"\\\\","\n":"\\n","\r":"\\r","\t":"\\t"};
            var c = function(m){ return (e[m] !== undefined)?e[m]:m; };
            return '"'+s.replace(/[\\"'\n\r\t]/g, c)+'"';
		},
		a : function(a) {
			var s = "[",c = "",n=a.length;
			for(var i=0; i < n; i++) {
				if (cache.isFunction(a[i])) continue;
				s += c+this.$(a[i]);
				if (!c) c = ",";
			}
			return s+"]";
		},
		o : function(o) {
			o = nv.$H(o).ksort().$value();
			var s = "{",c = "";
			for(var x in o) {
				if (o.hasOwnProperty(x)) {
					if (cache.isUndefined(o[x])||cache.isFunction(o[x])) continue;
					s += c+this.s(x)+":"+this.$(o[x]);
					if (!c) c = ",";
				}
			}
			return s+"}";
		}
	};

	return func.$(oObj);
};
//-!nv.$Json._oldToString.hidden end!-//

//-!nv.$Json.prototype.toXML start!-//
/**
 	toXML() 硫붿꽌�쒕뒗 nv.$Json() 媛앹껜瑜� XML �뺥깭�� 臾몄옄�대줈 諛섑솚�쒕떎.

	@method toXML
	@return {String} XML �뺥깭�� 臾몄옄��.
	@throws {nv.$Except.PARSE_ERROR} json媛앹껜瑜� �뚯떛�섎떎媛� �먮윭諛쒖깮�� ��.
	@see nv.$Json#toObject
	@see nv.$Json#toString
	@example
		var json = $Json({foo:1, bar: 31});
		json.toXML();

		// 寃곌낵 :
		// <foo>1</foo><bar>31</bar>
 */
nv.$Json.prototype.toXML = function() {
	//-@@$Json.toXML-@@//
	var f = function($,tag) {
		var t = function(s,at) { return "<"+tag+(at||"")+">"+s+"</"+tag+">"; };

		switch (typeof $) {
			case 'undefined':
			case "null":
				return t("");
			case "number":
				return t($);
			case "string":
				if ($.indexOf("<") < 0){
					 return t($.replace(/&/g,"&amp;"));
				}else{
					return t("<![CDATA["+$+"]]>");
				}
				// 'break' statement was intentionally omitted.
			case "boolean":
				return t(String($));
			case "object":
				var ret = "";
				if ($ instanceof Array) {
					var len = $.length;
					for(var i=0; i < len; i++) { ret += f($[i],tag); }
				} else {
					var at = "";

					for(var x in $) {
						if ($.hasOwnProperty(x)) {
							if (x == "$cdata" || typeof $[x] == "function") continue;
							ret += f($[x], x);
						}
					}

					if (tag) ret = t(ret, at);
				}
				return ret;
		}
	};

	return f(nv.$Json._oldMakeJSON(this._object,"$Json#toXML"), "");
};
//-!nv.$Json.prototype.toXML end!-//

//-!nv.$Json.prototype.toObject start!-//
/**
 	toObject() 硫붿꽌�쒕뒗 nv.$Json() 媛앹껜瑜� �먮옒�� �곗씠�� 媛앹껜濡� 諛섑솚�쒕떎.

	@method toObject
	@return {Object} �먮낯 �곗씠�� 媛앹껜.
	@throws {nv.$Except.PARSE_ERROR} json媛앹껜瑜� �뚯떛�섎떎媛� �먮윭諛쒖깮�� ��.
	@see nv.$Json#toObject
	@see nv.$Json#toString
	@see nv.$Json#toXML
	@example
		var json = $Json({foo:1, bar: 31});
		json.toObject();

		// 寃곌낵 :
		// {foo: 1, bar: 31}
 */
nv.$Json.prototype.toObject = function() {
	//-@@$Json.toObject-@@//
	//-@@$Json.$value-@@//
	return nv.$Json._oldMakeJSON(this._object,"$Json#toObject");
};
//-!nv.$Json.prototype.toObject end!-//

//-!nv.$Json.prototype.compare start(nv.$Json._oldToString,nv.$Json.prototype.toObject,nv.$Json.prototype.toString)!-//
/**
 	compare() 硫붿꽌�쒕뒗 Json 媛앹껜�쇰━ 媛믪씠 媛숈�吏� 鍮꾧탳�쒕떎.

	@method compare
	@param {Varaint} oData 鍮꾧탳�� Json �щ㎎ 媛앹껜.
	@return {Boolean} 鍮꾧탳 寃곌낵. 媛믪씠 媛숈쑝硫� true, �ㅻⅤ硫� false瑜� 諛섑솚�쒕떎.
	@throws {nv.$Except.PARSE_ERROR} json媛앹껜瑜� �뚯떛�섎떎媛� �먮윭諛쒖깮�� ��.
	@since  1.4.4
	@example
		$Json({foo:1, bar: 31}).compare({foo:1, bar: 31});

		// 寃곌낵 :
		// true

		$Json({foo:1, bar: 31}).compare({foo:1, bar: 1});

		// 寃곌낵 :
		// false
 */
nv.$Json.prototype.compare = function(oObj){
	//-@@$Json.compare-@@//
	var cache = nv.$Jindo;
	var oArgs = cache.checkVarType(arguments, {
		'4obj' : ['oData:Hash+'],
		'4arr' : ['oData:Array+']
	},"$Json#compare");
	function compare(vSrc, vTar) {
		if (cache.isArray(vSrc)) {
			if (vSrc.length !== vTar.length) { return false; }
			for (var i = 0, nLen = vSrc.length; i < nLen; i++) {
				if (!arguments.callee(vSrc[i], vTar[i])) { return false; }
			}
			return true;
		} else if (cache.isRegExp(vSrc) || cache.isFunction(vSrc) || cache.isDate(vSrc)) {  // which compare using toString
			return String(vSrc) === String(vTar);
		} else if (typeof vSrc === "number" && isNaN(vSrc)) {
			return isNaN(vTar);
		} else if (cache.isHash(vSrc)) {
			var nLen = 0;
			for (var k in vSrc) {nLen++; }
			for (var k in vTar) { nLen--; }
			if (nLen !== 0) { return false; }

			for (var k in vSrc) {
				if (k in vTar === false || !arguments.callee(vSrc[k], vTar[k])) { return false; }
			}

			return true;
		}

		// which comare using ===
		return vSrc === vTar;

	}
	try{
		return compare(nv.$Json._oldMakeJSON(this._object,"$Json#compare"), oObj);
	}catch(e){
		return false;
	}
};
//-!nv.$Json.prototype.compare end!-//

//-!nv.$Json.prototype.$value start(nv.$Json.prototype.toObject)!-//
/**
 	$value() 硫붿꽌�쒕뒗 toObject() 硫붿꽌�쒖� 媛숈씠 �먮옒�� �곗씠�� 媛앹껜瑜� 諛섑솚�쒕떎.

	@method $value
	@return {Object} �먮낯 �곗씠�� 媛앹껜.
	@see nv.$Json#toObject
 */
nv.$Json.prototype.$value = nv.$Json.prototype.toObject;
//-!nv.$Json.prototype.$value end!-//

/**
	@fileOverview nv.$Ajax() 媛앹껜�� �앹꽦�� 諛� 硫붿꽌�쒕� �뺤쓽�� �뚯씪
	@name Ajax.js
	@author NAVER Ajax Platform
 */

//-!nv.$Ajax start(nv.$Json.prototype.toString,nv.$Fn.prototype.bind)!-//
/**
	nv.$Ajax() 媛앹껜�� �ㅼ뼇�� 媛쒕컻 �섍꼍�먯꽌 Ajax �붿껌怨� �묐떟�� �쎄쾶 援ы쁽�섍린 �꾪븳 硫붿꽌�쒕� �쒓났�쒕떎.

	@class nv.$Ajax
	@keyword ajax
 */
/**
	nv.$Ajax() 媛앹껜�� �쒕쾭�� 釉뚮씪�곗� �ъ씠�� 鍮꾨룞湲� �듭떊, 利� Ajax �듭떊�� 吏��먰븳��. nv.$Ajax() 媛앹껜�� XHR 媛앹껜(XMLHTTPRequest)瑜� �ъ슜�� 湲곕낯�곸씤 諛⑹떇怨� �④퍡 �ㅻⅨ �꾨찓�� �ъ씠�� �듭떊�� �꾪븳 �щ윭 諛⑹떇�� �쒓났�쒕떎.

	@constructor
	@param {String+} sUrl Ajax �붿껌�� 蹂대궪 �쒕쾭�� URL.
	@param {Hash+} oOption $Ajax()�먯꽌 �ъ슜�섎뒗 肄쒕갚 �⑥닔, �듭떊 諛⑹떇 �깃낵 媛숈� �ㅼ뼇�� �뺣낫瑜� �뺤쓽�쒕떎.
		@param {String} [oOption.type="xhr"] Ajax �붿껌 諛⑹떇.
			@param {String} [oOption.type."xhr"] 釉뚮씪�곗��� �댁옣�� XMLHttpRequest 媛앹껜瑜� �댁슜�섏뿬 Ajax �붿껌�� 泥섎━�쒕떎.
					<ul>
						<li>text, xml, json �뺤떇�� �묐떟 �곗씠�곕� 泥섎━�� �� �덈떎. </li>
						<li>�붿껌 �ㅽ뙣 �� HTTP �묐떟 肄붾뱶瑜� �듯빐 �먯씤 �뚯븙�� 媛��ν븯��.</li>
						<li>2.1.0 踰꾩쟾 �댁긽�먯꽌�� �щ줈�� �꾨찓�몄씠 �꾨땶 xhr�� 寃쎌슦 �ㅻ뜑�� "X-Requested-With" : "XMLHttpRequest"�� �ы븿��. </li>
						<li>��, �щ줈�� �꾨찓��(Cross-Domain) �곹솴�먯꽌 �ъ슜�� �� �녿떎.</li>
						<li>2.1.0 踰꾩쟾 �댁긽�� 紐⑤컮�쇱뿉�� 媛���. 諛섎뱶�� �쒕쾭�ㅼ젙�� �꾩슂. (�먯꽭�� �ъ슜踰뺤� <auidoc:see content="http://devcafe.nhncorp.com/ajaxui/board_5/574863">devcafe</auidoc:see>瑜� 李멸퀬)</li>
					</ul>
			@param {String} oOption.type."iframe" iframe �붿냼瑜� �꾨줉�쒕줈 �ъ슜�섏뿬 Ajax �붿껌�� 泥섎━�쒕떎.
					<ul>
						<li>�щ줈�� �꾨찓�� �곹솴�먯꽌 �ъ슜�� �� �덈떎.</li>
						<li>iframe �붿껌 諛⑹떇�� �ㅼ쓬怨� 媛숈씠 �숈옉�쒕떎.
							<ol class="decimal">
								<li>濡쒖뺄(�붿껌 �섎뒗 履�)怨� �먭꺽(�붿껌 諛쏅뒗 履�)�� 紐⑤몢 �꾨줉�쒖슜 HTML �뚯씪�� 留뚮뱺��.</li>
								<li>濡쒖뺄 �꾨줉�쒖뿉�� �먭꺽 �꾨줉�쒕줈 �곗씠�곕� �붿껌�쒕떎.</li>
								<li>�먭꺽 �꾨줉�쒓� �먭꺽 �꾨찓�몄뿉 XHR 諛⑹떇�쇰줈 �ㅼ떆 Ajax �붿껌�쒕떎.</li>
								<li>�묐떟�� 諛쏆� �먭꺽 �꾨줉�쒖뿉�� 濡쒖뺄 �꾨줉�쒕줈 �곗씠�곕� �꾨떖�쒕떎.</li>
								<li>濡쒖뺄 �꾨줉�쒖뿉�� 理쒖쥌�곸쑝濡� 肄쒕갚 �⑥닔(onload)瑜� �몄텧�섏뿬 泥섎━�쒕떎.</li>
							</ol>
						</li>
						<li>濡쒖뺄 �꾨줉�� �뚯씪怨� �먭꺽 �꾨줉�� �뚯씪�� �ㅼ쓬怨� 媛숈씠 �묒꽦�� �� �덈떎.
							<ul>
								<li>�먭꺽 �꾨줉�� �뚯씪 : ajax_remote_callback.html</li>
								<li>濡쒖뺄 �꾨줉�� �뚯씪 : ajax_local_callback.html</li>
							</ul>
						</li>
						<li>iframe �붿냼瑜� �ъ슜�� 諛⑹떇�� �명꽣�� �듭뒪�뚮줈�ъ뿉�� "�깅뵳"�섎뒗 �섏씠吏� �대룞�뚯씠 諛쒖깮�� �� �덈떎. (�붿껌�� 2��)</li>
					</ul>
			@param {String} oOption.type."jsonp" JSON �뺤떇怨� &lt;script&gt; �쒓렇瑜� �ъ슜�섏뿬 �ъ슜�섏뿬 Ajax �붿껌�� 泥섎━�쒕떎.
					<ul>
						<li>�щ줈�� �꾨찓�� �곹솴�먯꽌 �ъ슜�� �� �덈떎.</li>
						<li>jsonp �붿껌 諛⑹떇�� �ㅼ쓬怨� 媛숈씠 �숈옉�쒕떎.
							<ol class="decimal">
								<li>&lt;script&gt; �쒓렇瑜� �숈쟻�쇰줈 �앹꽦�쒕떎. �대븣 �붿껌�� �먭꺽 �섏씠吏�瑜� src �띿꽦�쇰줈 �낅젰�섏뿬 GET 諛⑹떇�쇰줈 �붿껌�� �꾩넚�쒕떎.</li>
								<li>�붿껌 �쒖뿉 肄쒕갚 �⑥닔瑜� 留ㅺ컻 蹂��섎줈 �섍린硫�, �먭꺽 �섏씠吏��먯꽌 �꾨떖諛쏆� 肄쒕갚 �⑥닔紐낆쑝濡� �꾨옒�� 媛숈씠 �묐떟�� 蹂대궦��.
									<ul>
										<li>function_name(...寃곌낵 媛�...)</li>
									</ul>
								</li>
								<li>�묐떟�� 肄쒕갚 �⑥닔(onload)�먯꽌 泥섎━�쒕떎.</li>
							</ol>
						</li>
						<li>GET 諛⑹떇留� 媛��ν븯誘�濡�, �꾩넚 �곗씠�곗쓽 湲몄씠�� URL�먯꽌 �덉슜�섎뒗 湲몄씠濡� �쒗븳�쒕떎.</li>
					</ul>
			@param {String} oOption.type."flash" �뚮옒�� 媛앹껜瑜� �ъ슜�섏뿬 Ajax �붿껌�� 泥섎━�쒕떎.
					<ul>
						<li>�щ줈�� �꾨찓�� �곹솴�먯꽌 �ъ슜�� �� �덈떎.</li>
						<li>�� 諛⑹떇�� �ъ슜�� �� �먭꺽 �쒕쾭�� �� 猷⑦듃 �붾젆�곕━�� crossdomain.xml �뚯씪�� 議댁옱�댁빞 �섎ŉ �대떦 �뚯씪�� �묎렐 沅뚰븳�� �ㅼ젙�섏뼱 �덉뼱�� �쒕떎.</li>
						<li>紐⑤뱺 �듭떊�� �뚮옒�� 媛앹껜瑜� �듯븯�� 二쇨퀬 諛쏆쑝硫� Ajax �붿껌�� �쒕룄�섍린 �꾩뿉 諛섎뱶�� �뚮옒�� 媛앹껜瑜� 珥덇린�뷀빐�� �쒕떎.</li>
						<li>$Ajax.SWFRequest.write() 硫붿꽌�쒕� �ъ슜�섏뿬 �뚮옒�� 媛앹껜瑜� 珥덇린�뷀븯硫� �대떦 硫붿꽌�쒕뒗 &lt;body&gt; �붿냼 �덉뿉 �묒꽦�쒕떎.</li>
						<li>留뚯빟 https�먯꽌 https 履쎌쑝濡� �몄텧�� 寃쎌슦 &lt;allow-access-from domain="*" secure="true" /&gt; 泥섎읆 secure�� true濡� �ㅼ젙�댁빞 �섎ŉ 洹� �댁쇅�먮뒗 false濡� �ㅼ젙�쒕떎.</li>
					</ul>
		@param {String} [oOption.method="post"] HTTP �붿껌 諛⑹떇�쇰줈 post, get, put, delete 諛⑹떇�� 吏��먰븳��.
			@param {String} [oOption.method."post"] post 諛⑹떇�쇰줈 http �붿껌�� �꾨떖�쒕떎.
			@param {String} oOption.method."get" get 諛⑹떇�쇰줈 http �붿껌�� �꾨떖�쒕떎. type �띿꽦�� "jsonp" 諛⑹떇�쇰줈 吏��뺣릺硫� HTTP �붿껌 諛⑹떇�� "get"�쇰줈 �ㅼ젙�쒕떎.
			@param {String} oOption.method."put" put 諛⑹떇�쇰줈 http �붿껌�� �꾨떖�쒕떎. (1.4.2 踰꾩쟾遺��� 吏���).
			@param {String} oOption.method."delete" delete 諛⑹떇�쇰줈 http �붿껌�� �꾨떖�쒕떎. (1.4.2 踰꾩쟾遺��� 吏���).
		@param {Number} [oOption.timeout=0] �붿껌 ���� �꾩썐 �쒓컙.  (�⑥쐞 珥�)
				<ul>
					<li>鍮꾨룞湲� �몄텧�� 寃쎌슦�먮쭔 �ъ슜 媛��ν븯��.</li>
					<li>���� �꾩썐 �쒓컙 �덉뿉 �붿껌�� �꾨즺�섏� �딆쑝硫� Ajax �붿껌�� 以묒��쒕떎.</li>
					<li>�앸왂�섍굅�� 湲곕낯媛�(0)�� 吏��뺥븳 寃쎌슦 ���� �꾩썐�� �곸슜�섏� �딅뒗��. </li>
				</ul>
		@param {Boolean} [oOption.withCredentials=false] xhr�먯꽌 �щ줈�� �꾨찓�� �ъ슜�� �� 荑좏궎 �ъ슜�щ�. (�⑥쐞 珥�)
				<ul>
					<li>紐⑤컮�쇰쭔 媛��ν븯��.</li>
					<li>true濡� �ㅼ젙�섎㈃ �쒕쾭�먯꽌��  "Access-Control-Allow-Credentials: true" �ㅻ뜑瑜� �ㅼ젙�댁빞 �쒕떎.</li>
				</ul>
		@param {Function} oOption.onload �붿껌�� �꾨즺�섎㈃ �ㅽ뻾�� 肄쒕갚 �⑥닔. 肄쒕갚 �⑥닔�� �뚮씪誘명꽣濡� �묐떟 媛앹껜�� <auidoc:see content="nv.$Ajax.Response"/> 媛앹껜媛� �꾨떖�쒕떎.
		@param {Function} [oOption.onerror="onload �띿꽦�� 吏��뺥븳 肄쒕갚 �⑥닔"] �붿껌�� �ㅽ뙣�섎㈃ �ㅽ뻾�� 肄쒕갚 �⑥닔. �앸왂�섎㈃ �ㅻ쪟媛� 諛쒖깮�대룄 onload �띿꽦�� 吏��뺥븳 肄쒕갚 �⑥닔瑜� �ㅽ뻾�쒕떎.
		@param {Function} [oOption.ontimeout=function(){}] ���� �꾩썐�� �섏뿀�� �� �ㅽ뻾�� 肄쒕갚 �⑥닔. �앸왂�섎㈃ ���� �꾩썐 諛쒖깮�대룄 �꾨Т�� 泥섎━瑜� �섏� �딅뒗��.
		@param {String} oOption.proxy 濡쒖뺄 �꾨줉�� �뚯씪�� 寃쎈줈. type �띿꽦�� "iframe"�� �� �ъ슜.
		@param {String} [oOption.jsonp_charset="utf-8"] �붿껌 �� �ъ슜�� &lt;script&gt; �몄퐫�� 諛⑹떇. type �띿꽦�� "jsonp"�� �� �ъ슜�쒕떎. (0.4.2 踰꾩쟾遺��� 吏���).
		@param {String} [oOption.callbackid="�쒕뜡�� ID"] 肄쒕갚 �⑥닔 �대쫫�� �ъ슜�� ID.
				<ul>
					<li>type �띿꽦�� "jsonp"�� �� �ъ슜�쒕떎. (1.3.0 踰꾩쟾遺��� 吏���)</li>
					<li>jsonp 諛⑹떇�먯꽌 Ajax �붿껌�� �� 肄쒕갚 �⑥닔 �대쫫�� �쒕뜡�� ID 媛믪쓣 �㏓텤�� 留뚮뱺 肄쒕갚 �⑥닔 �대쫫�� �쒕쾭濡� �꾨떖�쒕떎. �대븣 �쒕뜡�� 媛믪쓣 ID濡� �ъ슜�섏뿬 �섍린誘�濡� �붿껌 URL�� 留ㅻ쾲 �덈∼寃� �앹꽦�섏뼱 罹먯떆 �쒕쾭媛� �꾨땶 占쏙옙占쎈쾭濡� 吏곸젒 �곗씠�곕� �붿껌�섍쾶 �쒕떎. �곕씪�� ID 媛믪쓣 吏��뺥븯硫� �쒕뜡�� �꾩씠�� 媛믪쑝濡� 肄쒕갚 �⑥닔 �대쫫�� �앹꽦�섏� �딆쑝誘�濡� 罹먯떆 �쒕쾭瑜� �ъ슜�섏뿬 洹몄뿉 ���� �덊듃�⑥쓣 �믪씠怨좎옄 �� �� ID瑜� 吏��뺥븯�� �ъ슜�� �� �덈떎.</li>
				</ul>
		@param {String} [oOption.callbackname="_callback"] 肄쒕갚 �⑥닔 �대쫫. type �띿꽦�� "jsonp"�� �� �ъ슜�섎ŉ, �쒕쾭�� �붿껌�� 肄쒕갚 �⑥닔�� �대쫫�� 吏��뺥븷 �� �덈떎. (1.3.8 踰꾩쟾遺��� 吏���).
		@param {Boolean} [oOption.sendheader=true] �붿껌 �ㅻ뜑瑜� �꾩넚�좎� �щ�.<br>type �띿꽦�� "flash"�� �� �ъ슜�섎ŉ, �쒕쾭�먯꽌 �묎렐 沅뚰븳�� �ㅼ젙�섎뒗 crossdomain.xml�� allow-header媛� �ㅼ젙�섏뼱 �덉� �딅떎硫� 諛섎뱶�� false 濡� �ㅼ젙�댁빞 �쒕떎. (1.3.4 踰꾩쟾遺��� 吏���).<br>
				<ul>
					<li>�뚮옒�� 9�먯꽌�� allow-header媛� false�� 寃쎌슦 get 諛⑹떇�쇰줈留� ajax �듭떊�� 媛��ν븯��.</li>
					<li>�뚮옒�� 10�먯꽌�� allow-header媛� false�� 寃쎌슦 get,post �섎떎 ajax �듭떊�� �덈맂��.</li>
					<li>allow-header媛� �ㅼ젙�섏뼱 �덉� �딅떎硫� 諛섎뱶�� false濡� �ㅼ젙�댁빞 �쒕떎.</li>
				</ul>
		@param {Boolean} [oOption.async=true] 鍮꾨룞湲� �몄텧 �щ�. type �띿꽦�� "xhr"�� �� �� �띿꽦 媛믪씠 �좏슚�섎떎. (1.3.7 踰꾩쟾遺��� 吏���).
		@param {Boolean} [oOption.decode=true] type �띿꽦�� "flash"�� �� �ъ슜�섎ŉ, �붿껌�� �곗씠�� �덉뿉 utf-8 �� �꾨땶 �ㅻⅨ �몄퐫�⑹씠 �섏뼱 �덉쓣�� false 濡� 吏��뺥븳��. (1.4.0 踰꾩쟾遺��� 吏���).
		@param {Boolean} [oOption.postBody=false] Ajax �붿껌 �� �쒕쾭濡� �꾨떖�� �곗씠�곕� Body �붿냼�� �꾨떖�� 吏��� �щ�.<br>
				type �띿꽦�� "xhr"�닿퀬 method媛� "get"�� �꾨땲�댁빞 �좏슚�섎ŉ REST �섍꼍�먯꽌 �ъ슜�쒕떎. (1.4.2 踰꾩쟾遺��� 吏���).
	@throws {nv.$Except.REQUIRE_AJAX} �ъ슜�섎뒗 ���낆쓽 ajax媛� �녿뒗 寃쎌슦.
	@throws {nv.$Except.CANNOT_USE_OPTION} �ъ슜�섏� 紐삵븯�� �듭뀡�� �ъ슜�� 寃쎌슦.
	@remark nv.$Ajax() 媛앹껜�� 湲곕낯�곸씤 珥덇린�� 諛⑹떇�� �ㅼ쓬怨� 媛숇떎.
<pre class="code "><code class="prettyprint linenums">
	// �몄텧�섎뒗 URL�� �꾩옱 �섏씠吏��� URL怨� �ㅻⅨ 寃쎌슦, CORS 諛⑹떇�쇰줈 �몄텧�쒕떎. XHR2 媛앹껜 �먮뒗 IE8,9�� XDomainRequest瑜� �ъ슜�쒕떎.
	var oAjax = new $Ajax('server.php', {
	    type : 'xhr',
	    method : 'get',     // GET 諛⑹떇�쇰줈 �듭떊
	    onload : function(res){ // �붿껌�� �꾨즺�섎㈃ �ㅽ뻾�� 肄쒕갚 �⑥닔
	      $('list').innerHTML = res.text();
	    },
	    timeout : 3,      // 3珥� �대궡�� �붿껌�� �꾨즺�섏� �딆쑝硫� ontimeout �ㅽ뻾 (�앸왂 �� 0)
	    ontimeout : function(){ // ���� �꾩썐�� 諛쒖깮�섎㈃ �ㅽ뻾�� 肄쒕갚 �⑥닔, �앸왂 �� ���� �꾩썐�� �섎㈃ �꾨Т 泥섎━�� �섏� �딆쓬
	      alert("Timeout!");
	    },
	    async : true      // 鍮꾨룞湲곕줈 �몄텧�섎뒗 寃쎌슦, �앸왂�섎㈃ true
	});
	oAjax.request();
</code></pre><br>
	oOption 媛앹껜�� �꾨줈�쇳떚�� �ъ슜踰뺤뿉 ���� �ㅻ챸�� �ㅼ쓬 �쒖� 媛숇떎.<br>
		<h5>���낆뿉 �곕Ⅸ �듭뀡�� �ъ슜 媛��� �щ�</h5>
		<table class="tbl_board">
			<caption class="hide">���낆뿉 �곕Ⅸ �듭뀡�� �ъ슜 媛��� �щ�</caption>
			<thead>
				<th scope="col">�듭뀡</th>
				<th scope="col">xhr</th>
				<th scope="col">jsonp</th>
				<th scope="col">flash</th>
				<th scope="col">iframe</th>
			</thead>
			<tbody>
				<tr>
					<td class="txt bold">method(get, post, put, delete)</td>
					<td>O</td>
					<td>get</td>
					<td>get, post</td>
					<td>iframe</td>
				</tr>
				<tr>
					<td class="txt bold">onload</td>
					<td>O</td>
					<td>O</td>
					<td>O</td>
					<td>O</td>
				</tr>
				<tr>
					<td class="txt bold">timeout</td>
					<td>O</td>
					<td>O</td>
					<td>O</td>
					<td>X</td>
				</tr>
				<tr>
					<td class="txt bold">ontimeout</td>
					<td>O</td>
					<td>O</td>
					<td>O</td>
					<td>X</td>
				</tr>
				<tr>
					<td class="txt bold">onerror</td>
					<td>O</td>
					<td>O</td>
					<td>O</td>
					<td>X</td>
				</tr>
				<tr>
					<td class="txt bold">async</td>
					<td>O</td>
					<td>X</td>
					<td>X</td>
					<td>X</td>
				</tr>
				<tr>
					<td class="txt bold">postBody</td>
					<td>method媛� post, put, delete留� 媛���</td>
					<td>X</td>
					<td>X</td>
					<td>X</td>
				</tr>
				<tr>
					<td class="txt bold">jsonp_charset</td>
					<td>X</td>
					<td>O</td>
					<td>X</td>
					<td>X</td>
				</tr>
				<tr>
					<td class="txt bold">callbackid</td>
					<td>X</td>
					<td>O</td>
					<td>X</td>
					<td>X</td>
				</tr>
				<tr>
					<td class="txt bold">callbackname</td>
					<td>X</td>
					<td>O</td>
					<td>X</td>
					<td>X</td>
				</tr>
				<tr>
					<td class="txt bold">setheader</td>
					<td>O</td>
					<td>X</td>
					<td>O</td>
					<td>X</td>
				</tr>
				<tr>
					<td class="txt bold">decode</td>
					<td>X</td>
					<td>X</td>
					<td>O</td>
					<td>X</td>
				</tr>
				<tr>
					<td class="txt bold">proxy</td>
					<td>X</td>
					<td>X</td>
					<td>X</td>
					<td>O</td>
				</tr>
			</tbody>
		</table>
		<h5>���낆뿉 �곕Ⅸ 硫붿꽌�쒖쓽 �ъ슜 媛��� �щ�</h5>
		<table class="tbl_board">
			<caption class="hide">���낆뿉 �곕Ⅸ 硫붿꽌�쒖쓽 �ъ슜 媛��� �щ�</caption>
			<thead>
				<th scope="col">硫붿꽌��</th>
				<th scope="col">xhr</th>
				<th scope="col">jsonp</th>
				<th scope="col">flash</th>
				<th scope="col">iframe</th>
			</thead>
			<tbody>
				<tr>
					<td class="txt bold">abort</td>
					<td>O</td>
					<td>O</td>
					<td>O</td>
					<td>O</td>
				</tr>
				<tr>
					<td class="txt bold">isIdle</td>
					<td>O</td>
					<td>O</td>
					<td>O</td>
					<td>O</td>
				</tr>
				<tr>
					<td class="txt bold">option</td>
					<td>O</td>
					<td>O</td>
					<td>O</td>
					<td>O</td>
				</tr>
				<tr>
					<td class="txt bold">request</td>
					<td>O</td>
					<td>O</td>
					<td>O</td>
					<td>O</td>
				</tr>
				<tr>
					<td class="txt bold">header</td>
					<td>O</td>
					<td>X</td>
					<td>O</td>
					<td>O</td>
				</tr>
			</tbody>
		</table>
	@see nv.$Ajax.Response
	@see http://dev.naver.com/projects/nv/wiki/cross%20domain%20ajax Cross Domain Ajax �댄빐
	@example
		// 'Get List' 踰꾪듉 �대┃ ��, �쒕쾭�먯꽌 �곗씠�곕� 諛쏆븘�� 由ъ뒪�몃� 援ъ꽦�섎뒗 �덉젣
		// (1) �쒕쾭 �섏씠吏��� �쒕퉬�� �섏씠吏�媛� 媛숈� �꾨찓�몄뿉 �덈뒗 寃쎌슦 - xhr

		// [client.html]
		<!DOCTYPE html>
		<html>
			<head>
				<title>Ajax Sample</title>
				<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
				<script type="text/javascript" language="javascript" src="lib/nv.all.js"></script>
				<script type="text/javascript" language="javascript">
					function getList() {
						var oAjax = new $Ajax('server.php', {
							type : 'xhr',
							method : 'get',			// GET 諛⑹떇�쇰줈 �듭떊
							onload : function(res){	// �붿껌�� �꾨즺�섎㈃ �ㅽ뻾�� 肄쒕갚 �⑥닔
								$('list').innerHTML = res.text();
							},
							timeout : 3,			// 3珥� �대궡�� �붿껌�� �꾨즺�섏� �딆쑝硫� ontimeout �ㅽ뻾 (�앸왂 �� 0)
							ontimeout : function(){	// ���� �꾩썐�� 諛쒖깮�섎㈃ �ㅽ뻾�� 肄쒕갚 �⑥닔, �앸왂 �� ���� �꾩썐�� �섎㈃ �꾨Т 泥섎━�� �섏� �딆쓬
								alert("Timeout!");
							},
							async : true			// 鍮꾨룞湲곕줈 �몄텧�섎뒗 寃쎌슦, �앸왂�섎㈃ true
						});
						oAjax.request();
					}
				</script>
			</head>
			<body>
				<button onclick="getList(); return false;">Get List</button>

				<ul id="list">

				</ul>
			</body>
		</html>

		// [server.php]
		<?php
			echo "<li>泥ル쾲吏�</li><li>�먮쾲吏�</li><li>�몃쾲吏�</li>";
		?>

	@example
		// 'Get List' 踰꾪듉 �대┃ ��, �쒕쾭�먯꽌 �곗씠�곕� 諛쏆븘�� 由ъ뒪�몃� 援ъ꽦�섎뒗 �덉젣
		// (1-1) �쒕쾭 �섏씠吏��� �쒕퉬�� �섏씠吏�媛� �ㅻⅨ �꾨찓�몄뿉 �덈뒗 寃쎌슦 - xhr

		// [http://nv.com/client.html]
		<!DOCTYPE html>
		<html>
			<head>
				<title>Ajax Sample</title>
				<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
				<script type="text/javascript" language="javascript" src="lib/nv.all.js"></script>
				<script type="text/javascript" language="javascript">
					function getList() {
						var oAjax = new $Ajax('http://server.com/some/server.php', {
							type : 'xhr',
							method : 'get',			// GET 諛⑹떇�쇰줈 �듭떊
							withCredentials : true, // 荑좏궎瑜� �ы븿�섏뿬 �ㅼ젙
							onload : function(res){	// �붿껌�� �꾨즺�섎㈃ �ㅽ뻾�� 肄쒕갚 �⑥닔
								$('list').innerHTML = res.text();
							}
						});
						oAjax.request();
					}
				</script>
			</head>
			<body>
				<button onclick="getList(); return false;">Get List</button>

				<ul id="list">

				</ul>
			</body>
		</html>

		// [server.php]
		 <?
		 	header("Access-Control-Allow-Origin: http://nv.com"); // �щ줈�ㅻ룄硫붿씤�쇰줈 �몄텧�� 媛��ν븳 怨녹쓣 �깅줉.
			header("Access-Control-Allow-Credentials: true"); // 荑좏궎瑜� �덉슜�� 寃쎌슦.

			echo "<li>泥ル쾲吏�</li><li>�먮쾲吏�</li><li>�몃쾲吏�</li>";
		?>

	@example
		// 'Get List' 踰꾪듉 �대┃ ��, �쒕쾭�먯꽌 �곗씠�곕� 諛쏆븘�� 由ъ뒪�몃� 援ъ꽦�섎뒗 �덉젣
		// (2) �쒕쾭 �섏씠吏��� �쒕퉬�� �섏씠吏�媛� 媛숈� �꾨찓�몄뿉 �덈뒗 寃쎌슦 - iframe

		// [http://local.com/some/client.html]
		<!DOCTYPE html>
		<html>
			<head>
				<title>Ajax Sample</title>
				<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
				<script type="text/javascript" language="javascript" src="lib/nv.all.js"></script>
				<script type="text/javascript" language="javascript">
					function getList() {
						var oAjax = new $Ajax('http://server.com/some/some.php', {
							type : 'iframe',
							method : 'get',			// GET 諛⑹떇�쇰줈 �듭떊
													// POST濡� 吏��뺥븯硫� �먭꺽 �꾨줉�� �뚯씪�먯꽌 some.php 濡� �붿껌 �쒖뿉 POST 諛⑹떇�쇰줈 泥섎━
							onload : function(res){	// �붿껌�� �꾨즺�섎㈃ �ㅽ뻾�� 肄쒕갚 �⑥닔
								$('list').innerHTML = res.text();
							},
							// 濡쒖뺄 �꾨줉�� �뚯씪�� 寃쎈줈.
							// 諛섎뱶�� �뺥솗�� 寃쎈줈瑜� 吏��뺥빐�� �섎ŉ, 濡쒖뺄 �꾨찓�몄쓽 寃쎈줈�쇰㈃ �대뵒�� �먯뼱�� �곴� �놁쓬
							// (�� �먭꺽 �꾨줉�� �뚯씪�� 諛섎뱶��  �먭꺽 �꾨찓�� �쒕쾭�� �꾨찓�� 猷⑦듃 �곸뿉 �먯뼱�� ��)
							proxy : 'http://local.naver.com/some/ajax_local_callback.html'
						});
						oAjax.request();
					}

				</script>
			</head>
			<body>
				<button onclick="getList(); return false;">Get List</button>

				<ul id="list">

				</ul>
			</body>
		</html>

		// [http://server.com/some/some.php]
		<?php
			echo "<li>泥ル쾲吏�</li><li>�먮쾲吏�</li><li>�몃쾲吏�</li>";
		?>

	@example
		// 'Get List' 踰꾪듉 �대┃ ��, �쒕쾭�먯꽌 �곗씠�곕� 諛쏆븘�� 由ъ뒪�몃� 援ъ꽦�섎뒗 �덉젣
		// (3) �쒕쾭 �섏씠吏��� �쒕퉬�� �섏씠吏�媛� 媛숈� �꾨찓�몄뿉 �덈뒗 寃쎌슦 - jsonp

		// [http://local.com/some/client.html]
		<!DOCTYPE html>
		<html>
			<head>
				<title>Ajax Sample</title>
				<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
				<script type="text/javascript" language="javascript" src="lib/nv.all.js"></script>
				<script type="text/javascript" language="javascript">
					function getList(){
						var oAjax = new $Ajax('http://server.com/some/some.php', {
							type: 'jsonp',
							method: 'get',			// type �� jsonp �대㈃ get �쇰줈 吏��뺥븯吏� �딆븘�� �먮룞�쇰줈 get �쇰줈 泥섎━�� (�앸왂媛���)
							jsonp_charset: 'utf-8',	// �붿껌 �� �ъ슜�� <script> �몄퐫�� 諛⑹떇 (�앸왂 �� utf-8)
							onload: function(res){	// �붿껌�� �꾨즺�섎㈃ �ㅽ뻾�� 肄쒕갚 �⑥닔
								var response = res.json();
								var welList = $Element('list').empty();

								for (var i = 0, nLen = response.length; i < nLen; i++) {
									welList.append($("<li>" + response[i] + "</li>"));
								}
							},
							callbackid: '12345',				// 肄쒕갚 �⑥닔 �대쫫�� �ъ슜�� �꾩씠�� 媛� (�앸왂媛���)
							callbackname: 'ajax_callback_fn'	// �쒕쾭�먯꽌 �ъ슜�� 肄쒕갚 �⑥닔�대쫫�� 媛�吏��� 留ㅺ컻 蹂��� �대쫫 (�앸왂 �� '_callback')
						});
						oAjax.request();
					}
				</script>
			</head>
			<body>
				<button onclick="getList(); return false;">Get List</button>

				<ul id="list">

				</ul>
			</body>
		</html>

		// [http://server.com/some/some.php]
		<?php
			$callbackName = $_GET['ajax_callback_fn'];
			echo $callbackName."(['泥ル쾲吏�','�먮쾲吏�','�몃쾲吏�'])";
		?>

	@example
		// 'Get List' 踰꾪듉 �대┃ ��, �쒕쾭�먯꽌 �곗씠�곕� 諛쏆븘�� 由ъ뒪�몃� 援ъ꽦�섎뒗 �덉젣
		// (4) �쒕쾭 �섏씠吏��� �쒕퉬�� �섏씠吏�媛� 媛숈� �꾨찓�몄뿉 �덈뒗 寃쎌슦 - flash

		// [http://local.com/some/client.html]
		<!DOCTYPE html>
		<html>
			<head>
				<title>Ajax Sample</title>
				<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
				<script type="text/javascript" language="javascript" src="lib/nv.all.js"></script>
				<script type="text/javascript" language="javascript">
					function getList(){
						var oAjax = new $Ajax('http://server.com/some/some.php', {
							type : 'flash',
							method : 'get',			// GET 諛⑹떇�쇰줈 �듭떊
							sendheader : false,		// �붿껌 �ㅻ뜑瑜� �꾩넚�좎� �щ�. (�앸왂 �� true)
							decode : true,			// �붿껌�� �곗씠�� �덉뿉 utf-8 �� �꾨땶 �ㅻⅨ �몄퐫�⑹씠 �섏뼱 �덉쓣�� false. (�앸왂 �� true)
							onload : function(res){	// �붿껌�� �꾨즺�섎㈃ �ㅽ뻾�� 肄쒕갚 �⑥닔
								$('list').innerHTML = res.text();
							},
						});
						oAjax.request();
					}
				</script>
			</head>
			<body>
				<script type="text/javascript">
					$Ajax.SWFRequest.write("swf/ajax.swf");	// Ajax �몄텧�� �섍린 �꾩뿉 諛섎뱶�� �뚮옒�� 媛앹껜瑜� 珥덇린��
				</script>
				<button onclick="getList(); return false;">Get List</button>

				<ul id="list">

				</ul>
			</body>
		</html>

		// [http://server.com/some/some.php]
		<?php
			echo "<li>泥ル쾲吏�</li><li>�먮쾲吏�</li><li>�몃쾲吏�</li>";
		?>
 */
nv.$Ajax = function (url, option) {
	var cl = arguments.callee;

	if (!(this instanceof cl)){
		try {
			nv.$Jindo._maxWarn(arguments.length, 2,"$Ajax");
			return new cl(url, option||{});
		} catch(e) {
			if (e instanceof TypeError) { return null; }
			throw e;
		}
	}

	var ___ajax = nv.$Ajax, ___error = nv.$Error, ___except = nv.$Except;
	var oArgs = g_checkVarType(arguments, {
		'4str' : [ 'sURL:String+' ],
		'4obj' : [ 'sURL:String+', 'oOption:Hash+' ]
	},"$Ajax");

	if(oArgs+"" == "for_string"){
		oArgs.oOption = {};
	}

	function _getXHR(sUrl) {
        var xhr = window.XMLHttpRequest && new XMLHttpRequest();

        if(this._checkCORSUrl(this._url)) {
            if(xhr && "withCredentials" in xhr) {
                return xhr;

            // for IE8 and 9 CORS call can be used right through 'XDomainRequest' object - http://msdn.microsoft.com/en-us/library/ie/cc288060(v=vs.85).aspx
            // Limitations - http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
            } else if(window.XDomainRequest) {
                this._bXDomainRequest = true;
                return new XDomainRequest();
            }
        } else {
            if(xhr) {
                return xhr;
            } else if(window.ActiveXObject) {
                try {
                    return new ActiveXObject('MSXML2.XMLHTTP');
                }catch(e) {
                    return new ActiveXObject('Microsoft.XMLHTTP');
                }
            }
        }

        return null;
	}

	var loc = location.toString();
	var domain = '';
	try { domain = loc.match(/^https?:\/\/([a-z0-9_\-\.]+)/i)[1]; } catch(e) {}

	this._status = 0;
	this._url = oArgs.sURL;
	this._headers  = {};
	this._options = {
		type   :"xhr",
		method :"post",
		proxy  :"",
		timeout:0,
		onload :function(req){},
		onerror :null,
		ontimeout:function(req){},
		jsonp_charset : "utf-8",
		callbackid : "",
		callbackname : "",
		sendheader : true,
		async : true,
		decode :true,
		postBody :false,
        withCredentials:false
	};

	this._options = ___ajax._setProperties(oArgs.oOption,this);
	___ajax._validationOption(this._options,"$Ajax");

	/*
	 �뚯뒪�몃� �꾪빐 �곗꽑 �곸슜媛��ν븳 �ㅼ젙 媛앹껜媛� 議댁옱�섎㈃ �곸슜
	 */
	if(___ajax.CONFIG){
		this.option(___ajax.CONFIG);
	}

	var _opt = this._options;

	_opt.type   = _opt.type.toLowerCase();
	_opt.method = _opt.method.toLowerCase();

	if (window["__"+nv._p_.nvName+"_callback"] === undefined) {
		window["__"+nv._p_.nvName+"_callback"] = [];
		// JINDOSUS-1412
		window["__"+nv._p_.nvName+"2_callback"] = [];
	}

	var t = this;
	switch (_opt.type) {
		case "put":
		case "delete":
		case "get":
		case "post":
			_opt.method = _opt.type;
            // 'break' statement was intentionally omitted.
		case "xhr":
			//-@@$Ajax.xhr-@@//
			this._request = _getXHR.call(this);
        	this._checkCORS(this._url,_opt.type,"");
			break;
		case "flash":
			//-@@$Ajax.flash-@@//
			if(!___ajax.SWFRequest) throw new ___error(nv._p_.nvName+'.$Ajax.SWFRequest'+___except.REQUIRE_AJAX, "$Ajax");

			this._request = new ___ajax.SWFRequest( function(name,value){return t.option.apply(t, arguments);} );
			break;
		case "jsonp":
			//-@@$Ajax.jsonp-@@//
			if(!___ajax.JSONPRequest) throw new ___error(nv._p_.nvName+'.$Ajax.JSONPRequest'+___except.REQUIRE_AJAX, "$Ajax");
			this._request = new ___ajax.JSONPRequest( function(name,value){return t.option.apply(t, arguments);} );
			break;
		case "iframe":
			//-@@$Ajax.iframe-@@//
			if(!___ajax.FrameRequest) throw new ___error(nv._p_.nvName+'.$Ajax.FrameRequest'+___except.REQUIRE_AJAX, "$Ajax");
			this._request = new ___ajax.FrameRequest( function(name,value){return t.option.apply(t, arguments);} );
	}
};

nv.$Ajax.prototype._checkCORSUrl = function (sUrl) {
    return /^http/.test(sUrl) && !new RegExp("^https?://"+ window.location.host, "i").test(sUrl);
};

nv.$Ajax.prototype._checkCORS = function(sUrl,sType,sMethod){
	this._bCORS = false;

	if(this._checkCORSUrl(sUrl) && sType === "xhr") {
		if(this._request && (this._bXDomainRequest || "withCredentials" in this._request)) {
		    this._bCORS = true;
		} else {
			throw new nv.$Error(nv.$Except.NOT_SUPPORT_CORS, "$Ajax"+sMethod);
		}
	}
};

nv.$Ajax._setProperties = function (option, context){
	option = option||{};
	var type;
	if((option.type=="put"||option.type=="delete"||option.type=="get"||option.type=="post")&&!option.method){
	    option.method = option.type;
	    type = option.type = "xhr";
	}

	type = option.type = (option.type||"xhr");
	option.onload = nv.$Fn(option.onload||function(){},context).bind();
	option.method = option.method ||"post";
	if(type != "iframe"){
		option.timeout = option.timeout||0;
		option.ontimeout = nv.$Fn(option.ontimeout||function(){},context).bind();
		option.onerror = nv.$Fn(option.onerror||function(){},context).bind();
	}
	if(type == "xhr"){
		option.async = option.async === undefined?true:option.async;
		option.postBody = option.postBody === undefined?false:option.postBody;
        option.withCredentials = option.withCredentials === undefined?false:option.withCredentials;
	}else if(type == "jsonp"){
		option.method = "get";
		option.jsonp_charset = option.jsonp_charset ||"utf-8";
		option.callbackid = option.callbackid ||"";
		option.callbackname = option.callbackname ||"";
	}else if(type == "flash"){
		option.sendheader =  option.sendheader === undefined ? true : option.sendheader;
		option.decode =  option.decode === undefined ? true : option.decode;
	}else if(type == "iframe"){
		option.proxy = option.proxy||"";
	}
	return option;
};

nv.$Ajax._validationOption = function(oOption,sMethod){
	var ___except = nv.$Except;
	var sType = oOption.type;
	if(sType === "jsonp"){
		if(oOption["method"] !== "get") nv.$Jindo._warn(___except.CANNOT_USE_OPTION+"\n\t"+sMethod+"-method="+oOption["method"]);
	}else if(sType === "flash"){
		if(!(oOption["method"] === "get" || oOption["method"] === "post")) nv.$Jindo._warn(___except.CANNOT_USE_OPTION+"\n\t"+sMethod+"-method="+oOption["method"]);
	}

	if(oOption["postBody"]){
		if(!(sType === "xhr" && (oOption["method"]!=="get"))){
			nv.$Jindo._warn(___except.CANNOT_USE_OPTION+"\n\t"+oOption["method"]+"-postBody="+oOption["postBody"]);
		}
	}

	var oTypeProperty = {
			"xhr": "onload|timeout|ontimeout|onerror|async|method|postBody|type|withCredentials",
			"jsonp": "onload|timeout|ontimeout|onerror|jsonp_charset|callbackid|callbackname|method|type",
			"flash": "onload|timeout|ontimeout|onerror|sendheader|decode|method|type",
			"iframe": "onload|proxy|method|type"
	}, aName = [], i = 0;

    for(var x in oOption) { aName[i++] = x; }
	var sProperty = oTypeProperty[sType] || "";

	for(var i = 0 ,l = aName.length; i < l ; i++){
		if(sProperty.indexOf(aName[i]) == -1) nv.$Jindo._warn(___except.CANNOT_USE_OPTION+"\n\t"+sType+"-"+aName[i]);
	}
};
/**
 * @ignore
 */
nv.$Ajax.prototype._onload = (function(isIE) {
	var ___ajax = nv.$Ajax;
	var cache = nv.$Jindo;

	if(isIE){
		return function() {
			var status = this._request.status;
			var bSuccess = this._request.readyState == 4 &&  (status == 200||status == 0) || (this._bXDomainRequest && !!this._request.responseText);
			var oResult;
			if (this._request.readyState == 4 || this._bXDomainRequest) {
				try {
						if ((!bSuccess) && cache.isFunction(this._options.onerror)){
							this._options.onerror(new ___ajax.Response(this._request));
						}else{
							if(!this._is_abort){
								oResult = this._options.onload(new ___ajax.Response(this._request));
							}
						}
				}catch(e){
					throw e;
				}finally{
					if(cache.isFunction(this._oncompleted)){
						this._oncompleted(bSuccess, oResult);
					}
					if (this._options.type == "xhr" ){
						this.abort();
						try { delete this._request.onload; } catch(e) { this._request.onload =undefined;}
					}
					this._request.onreadystatechange && delete this._request.onreadystatechange;

				}
			}
		};
	}else{
		return function() {
			var status = this._request.status;
			var bSuccess = this._request.readyState == 4 &&  (status == 200||status == 0);
			var oResult;
			if (this._request.readyState == 4) {
				try {

						if ((!bSuccess) && cache.isFunction(this._options.onerror)){
							this._options.onerror(new ___ajax.Response(this._request));
						}else{
							oResult = this._options.onload(new ___ajax.Response(this._request));
						}
				}catch(e){
					throw e;
				}finally{
					this._status--;
					if(cache.isFunction(this._oncompleted)){
						this._oncompleted(bSuccess, oResult);
					}
				}
			}
		};
	}
})(nv._p_._JINDO_IS_IE);


/**
	request() 硫붿꽌�쒕뒗 Ajax �붿껌�� �쒕쾭�� �꾩넚�쒕떎. �붿껌�� �ъ슜�� �뚮씪誘명꽣�� nv.$Ajax() 媛앹껜 �앹꽦�먯뿉�� �ㅼ젙�섍굅�� option() 硫붿꽌�쒕� �ъ슜�섏뿬 蹂�寃쏀븷 �� �덈떎.
	�붿껌 ����(type)�� "flash"硫� �� 硫붿꽌�쒕� �ㅽ뻾�섍린 �꾩뿉 body �붿냼�먯꽌 <auidoc:see content="nv.$Ajax.SWFRequest#write"/>() 硫붿꽌�쒕� 諛섎뱶�� �ㅽ뻾�댁빞 �쒕떎.

	@method request
	@syntax oData
	@syntax oData2
	@param {String+} [oData] �쒕쾭濡� �꾩넚�� �곗씠��. (postbody媛� true, type�� xhr, method媛� get�� �꾨땶 寃쎌슦留� �ъ슜媛���)
	@param {Hash+} oData2 �쒕쾭濡� �꾩넚�� �곗씠��.
	@return {this} �몄뒪�댁뒪 �먯떊
	@see nv.$Ajax#option
	@see nv.$Ajax.SWFRequest#write
	@example
		var ajax = $Ajax("http://www.remote.com", {
		   onload : function(res) {
		      // onload �몃뱾��
		   }
		});

		ajax.request( {key1:"value1", key2:"value2"} );	// �쒕쾭�� �꾩넚�� �곗씠�곕� 留ㅺ컻蹂��섎줈 �섍릿��.
		ajax.request( );

	@example
		var ajax2 = $Ajax("http://www.remote.com", {
		   type : "xhr",
		   method : "post",
		   postBody : true
		});

		ajax2.request({key1:"value1", key2:"value2"});
		ajax2.request("{key1:\"value1\", key2:\"value2\"}");
 */
nv.$Ajax.prototype.request = function(oData) {
	var cache = nv.$Jindo;
	var oArgs = cache.checkVarType(arguments, {
		'4voi' : [ ],
		'4obj' : [ cache._F('oData:Hash+') ],
		'4str' : [ 'sData:String+' ]
	},"$Ajax#request");

	this._status++;
	var t   = this;
	var req = this._request;
	var opt = this._options;
	var v,a = [], data = "";
	var _timer = null;
	var url = this._url;
	this._is_abort = false;
	var sUpType = opt.type.toUpperCase();
	var sUpMethod = opt.method.toUpperCase();
	if (opt.postBody && sUpType == "XHR" && sUpMethod != "GET") {
		if(oArgs+"" == "4str"){
			data = oArgs.sData;
		}else if(oArgs+"" == "4obj"){
			data = nv.$Json(oArgs.oData).toString();
		}else{
			data = null;
		}
	}else{
		switch(oArgs+""){
			case "4voi" :
				data = null;
				break;
			case "4obj":
				var oData = oArgs.oData;
				for(var k in oData) {
					if(oData.hasOwnProperty(k)){
						v = oData[k];
						if (cache.isFunction(v)) v = v();

						if (cache.isArray(v) || (nv.$A && v instanceof nv.$A)) {
							if(v instanceof nv.$A) v = v._array;

							for(var i=0; i < v.length; i++) {
								a[a.length] = k+"="+encodeURIComponent(v[i]);
							}
						} else {
							a[a.length] = k+"="+encodeURIComponent(v);
						}
					}
				}
				data = a.join("&");
		}
	}

	/*
	 XHR GET 諛⑹떇 �붿껌�� 寃쎌슦 URL�� �뚮씪誘명꽣 異붽�
	 */
	if(data && sUpType=="XHR" && sUpMethod=="GET"){
		if(url.indexOf('?')==-1){
			url += "?";
		} else {
			url += "&";
		}
		url += data;
		data = null;
	}

	if(sUpType=="XHR"){
		req.open(sUpMethod, url, !!opt.async);
	}else{
		req.open(sUpMethod, url);
	}

	if(opt.withCredentials){
		req.withCredentials = true;
	}

	if(sUpType=="XHR"&&sUpMethod=="POST"&&req.setRequestHeader){
		/*
		 xhr�� 寃쎌슦 IE�먯꽌�� GET�쇰줈 蹂대궪 �� 釉뚮씪�곗졇�먯꽌 �먯껜 cache�섏뿬 cache�� �덈릺寃� �섏젙.
		 */
		req.setRequestHeader("If-Modified-Since", "Thu, 1 Jan 1970 00:00:00 GMT");
	}
	if ((sUpType=="XHR"||sUpType=="IFRAME"||(sUpType=="FLASH"&&opt.sendheader)) && req.setRequestHeader) {
		if(!this._headers["Content-Type"]){
			req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
		}
		req.setRequestHeader("charset", "utf-8");
		if(!this._bCORS&&!this._headers["X-Requested-With"]){
			req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		}
		for (var x in this._headers) {
			if(this._headers.hasOwnProperty(x)){
				if (typeof this._headers[x] == "function")
					continue;
				req.setRequestHeader(x, String(this._headers[x]));
			}
		}
	}
	if(req.addEventListener&&!nv._p_._JINDO_IS_OP&&!nv._p_._JINDO_IS_IE){
		/*
		  * opera 10.60�먯꽌 XMLHttpRequest�� addEventListener湲� 異붽��섏뿀吏�留� �뺤긽�곸쑝濡� �숈옉�섏� �딆븘 opera�� 臾댁“嫄� dom1諛⑹떇�쇰줈 吏��먰븿.
 * IE9�먯꽌�� opera�� 媛숈� 臾몄젣媛� �덉쓬.
		 */
		if(this._loadFunc){ req.removeEventListener("load", this._loadFunc, false); }
		this._loadFunc = function(rq){
			clearTimeout(_timer);
			_timer = undefined;
			t._onload(rq);
		};
		req.addEventListener("load", this._loadFunc, false);
	}else{
		if (req.onload !== undefined) {
			req.onload = function(rq){
				if((req.readyState == 4 || t._bXDomainRequest) && !t._is_abort){
					clearTimeout(_timer);
					_timer = undefined;
					t._onload(rq);
				}
			};
		} else {
            /*
             * IE6�먯꽌�� onreadystatechange媛� �숆린�곸쑝濡� �ㅽ뻾�섏뼱 timeout�대깽�멸� 諛쒖깮�덈맖.
 * 洹몃옒�� interval濡� 泥댄겕�섏뿬 timeout�대깽�멸� �뺤긽�곸쑝濡� 諛쒖깮�섎룄濡� �섏젙. 鍮꾨룞湲� 諛⑹떇�쇰븣留�
             */
            var iePattern = nv._p_._j_ag.match(/(?:MSIE) ([0-9.]+)/);
			if(iePattern&&iePattern[1]==6&&opt.async){
				var onreadystatechange = function(rq){
					if(req.readyState == 4 && !t._is_abort){
						if(_timer){
							clearTimeout(_timer);
							_timer = undefined;
						}
						t._onload(rq);
						clearInterval(t._interval);
						t._interval = undefined;
					}
				};
				this._interval = setInterval(onreadystatechange,300);

			}else{
				req.onreadystatechange = function(rq){
					if(req.readyState == 4){
						clearTimeout(_timer);
						_timer = undefined;
						t._onload(rq);
					}
				};
			}
		}
	}

	if (opt.timeout > 0) {
		if(this._timer) clearTimeout(this._timer);

		_timer = setTimeout(function(){
			t._is_abort = true;
			if(t._interval){
				clearInterval(t._interval);
				t._interval = undefined;
			}
			try { req.abort(); } catch(e){}

			opt.ontimeout(req);
			if(cache.isFunction(t._oncompleted)) t._oncompleted(false);
		}, opt.timeout * 1000 );

		this._timer = _timer;
	}
	/*
	 * test�� �섍린 �꾪븳 url
	 */
	this._test_url = url;
	req.send(data);

	return this;
};

/**
	isIdle() 硫붿꽌�쒕뒗 nv.$Ajax() 媛앹껜媛� �꾩옱 �붿껌 ��湲� �곹깭�몄� �뺤씤�쒕떎.

	@method isIdle
	@return {Boolean} �꾩옱 ��湲� 以묒씠硫� true 瑜�, 洹몃젃吏� �딆쑝硫� false瑜� 由ы꽩�쒕떎.
	@since 1.3.5
	@example
		var ajax = $Ajax("http://www.remote.com",{
		     onload : function(res){
		         // onload �몃뱾��
		     }
		});

		if(ajax.isIdle()) ajax.request();
 */
nv.$Ajax.prototype.isIdle = function(){
	return this._status==0;
};

/**
	abort() 硫붿꽌�쒕뒗 �쒕쾭濡� �꾩넚�� Ajax �붿껌�� 痍⑥냼�쒕떎. Ajax �붿껌�� �묐떟 �쒓컙�� 湲멸굅�� 媛뺤젣濡� Ajax �붿껌�� 痍⑥냼�� 寃쎌슦 �ъ슜�쒕떎.

	@method abort
	@remark type�� jsonp�� 寃쎌슦 abort瑜� �대룄 �붿껌�� 硫덉텛吏� �딅뒗��.
	@return {this} �꾩넚�� 痍⑥냼�� �몄뒪�댁뒪 �먯떊
	@example
		var ajax = $Ajax("http://www.remote.com", {
			timeout : 3,
			ontimeout : function() {
				stopRequest();
			}
			onload : function(res) {
				// onload �몃뱾��
			}
		}).request( {key1:"value1", key2:"value2"} );

		function stopRequest() {
		    ajax.abort();
		}
 */
nv.$Ajax.prototype.abort = function() {
	try {
		if(this._interval) clearInterval(this._interval);
		if(this._timer) clearTimeout(this._timer);
		this._interval = undefined;
		this._timer = undefined;
		this._is_abort = true;
		this._request.abort();
	}finally{
		this._status--;
	}

	return this;
};

/**
	url()硫붿꽌�쒕뒗 url�� 諛섑솚�쒕떎.

	@method url
	@return {String} URL�� 媛�.
	@since 2.0.0
 */
/**
	url()硫붿꽌�쒕뒗 url�� 蹂�寃쏀븳��.

	@method url
	@param {String+} url
	@return {this} �몄뒪�댁뒪 �먯떊
	@since 2.0.0
 */
nv.$Ajax.prototype.url = function(sURL){
	var oArgs = g_checkVarType(arguments, {
		'g' : [ ],
		's' : [ 'sURL:String+' ]
	},"$Ajax#url");

	switch(oArgs+"") {
		case 'g':
	    	return this._url;
		case 's':
		    this._checkCORS(oArgs.sURL,this._options.type,"#url");
	    	this._url = oArgs.sURL;
			return this;

	}
};
/**
	option() 硫붿꽌�쒕뒗 nv.$Ajax() 媛앹껜�� �듭뀡 媛앹껜(oOption) �띿꽦�� �뺤쓽�� Ajax �붿껌 �듭뀡�� ���� �뺣낫瑜� 媛��몄삩��.

	@method option
	@param {String+} sName �듭뀡 媛앹껜�� �띿꽦 �대쫫
	@return {Variant} �대떦 �듭뀡�� �대떦�섎뒗 媛�.
	@throws {nv.$Except.CANNOT_USE_OPTION} �대떦 ���낆뿉 �곸젅�� �듭뀡�� �꾨땶 寃쎌슦.
 */
/**
	option() 硫붿꽌�쒕뒗 nv.$Ajax() 媛앹껜�� �듭뀡 媛앹껜(oOption) �띿꽦�� �뺤쓽�� Ajax �붿껌 �듭뀡�� ���� �뺣낫瑜� �ㅼ젙�쒕떎. Ajax �붿껌 �듭뀡�� �ㅼ젙�섎젮硫� �대쫫怨� 媛믪쓣, �뱀� �대쫫怨� 媛믪쓣 �먯냼濡� 媛�吏��� �섎굹�� 媛앹껜瑜� �뚮씪誘명꽣濡� �낅젰�쒕떎. �대쫫怨� 媛믪쓣 �먯냼濡� 媛�吏��� 媛앹껜瑜� �낅젰�섎㈃ �섎굹 �댁긽�� �뺣낫瑜� �� 踰덉뿉 �ㅼ젙�� �� �덈떎.

	@method option
	@syntax sName, vValue
	@syntax oOption
	@param {String+} sName �듭뀡 媛앹껜�� �띿꽦 �대쫫
	@param {Variant} vValue �덈줈 �ㅼ젙�� �듭뀡 �띿꽦�� 媛�.
	@param {Hash+} oOption �띿꽦 媛믪씠 �뺤쓽�� 媛앹껜.
	@return {this} �몄뒪�댁뒪 �먯떊
	@throws {nv.$Except.CANNOT_USE_OPTION} �대떦 ���낆뿉 �곸젅�� �듭뀡�� �꾨땶 寃쎌슦.
	@example
		var ajax = $Ajax("http://www.remote.com", {
			type : "xhr",
			method : "get",
			onload : function(res) {
				// onload �몃뱾��
			}
		});

		var request_type = ajax.option("type");					// type �� xhr �� 由ы꽩�쒕떎.
		ajax.option("method", "post");							// method 瑜� post 濡� �ㅼ젙�쒕떎.
		ajax.option( { timeout : 0, onload : handler_func } );	// timeout �� �쇰줈, onload 瑜� handler_func 濡� �ㅼ젙�쒕떎.
 */
nv.$Ajax.prototype.option = function(name, value) {
	var oArgs = g_checkVarType(arguments, {
		's4var' : [ 'sKey:String+', 'vValue:Variant' ],
		's4obj' : [ 'oOption:Hash+'],
		'g' : [ 'sKey:String+']
	},"$Ajax#option");

	switch(oArgs+"") {
		case "s4var":
			oArgs.oOption = {};
			oArgs.oOption[oArgs.sKey] = oArgs.vValue;
			// 'break' statement was intentionally omitted.
		case "s4obj":
			var oOption = oArgs.oOption;
			try {
				for (var x in oOption) {
					if (oOption.hasOwnProperty(x)){
						if(x==="onload"||x==="ontimeout"||x==="onerror"){
							this._options[x] = nv.$Fn(oOption[x],this).bind();
						}else{
							this._options[x] = oOption[x];
						}
					}
				}
			}catch (e) {}
			break;
		case 'g':
			return this._options[oArgs.sKey];

	}
	this._checkCORS(this._url,this._options.type,"#option");
	nv.$Ajax._validationOption(this._options,"$Ajax#option");

	return this;
};

/**
	header() 硫붿꽌�쒕뒗 Ajax �붿껌�먯꽌 �ъ슜�� HTTP �붿껌 �ㅻ뜑瑜� 媛��몄삩��. �ㅻ뜑�먯꽌 �뱀젙 �띿꽦 媛믪쓣 媛��몄삤�ㅻ㈃ �띿꽦�� �대쫫�� �뚮씪誘명꽣濡� �낅젰�쒕떎.

	@method header
	@param {String+} vName �ㅻ뜑 �대쫫
	@return {String} 臾몄옄�댁쓣 諛섑솚�쒕떎.
	@example
		var customheader = ajax.header("myHeader"); 		// HTTP �붿껌 �ㅻ뜑�먯꽌 myHeader �� 媛�
 */
/**
	header() 硫붿꽌�쒕뒗 Ajax �붿껌�먯꽌 �ъ슜�� HTTP �붿껌 �ㅻ뜑瑜� �ㅼ젙�쒕떎. �ㅻ뜑瑜� �ㅼ젙�섎젮硫� �ㅻ뜑�� �대쫫怨� 媛믪쓣 媛곴컖 �뚮씪誘명꽣濡� �낅젰�섍굅�� �ㅻ뜑�� �대쫫怨� 媛믪쓣 �먯냼濡� 媛�吏��� 媛앹껜瑜� �뚮씪誘명꽣濡� �낅젰�쒕떎. 媛앹껜瑜� �뚮씪誘명꽣濡� �낅젰�섎㈃ �섎굹 �댁긽�� �ㅻ뜑瑜� �� 踰덉뿉 �ㅼ젙�� �� �덈떎.<br>
	(* IE8/9�먯꽌 XDomainRequest 媛앹껜瑜� �ъ슜�� CORS �몄텧�먯꽌�� �ъ슜�� �� �녿떎. XDomainRequest�� �ㅻ뜑瑜� �ㅼ젙�� �� �덈뒗 硫붿꽌�쒓� 議댁옱�섏� �딅뒗��.)

	@method header
	@syntax sName, sValue
	@syntax oHeader
	@param {String+} sName �ㅻ뜑 �대쫫
	@param {String+} sValue �ㅼ젙�� �ㅻ뜑 媛�.
	@param {Hash+} oHeader �섎굹 �댁긽�� �ㅻ뜑 媛믪씠 �뺤쓽�� 媛앹껜
	@return {this} �ㅻ뜑 媛믪쓣 �ㅼ젙�� �몄뒪�댁뒪 �먯떊
	@throws {nv.$Except.CANNOT_USE_OPTION} jsonp ���낆씪 寃쎌슦 header硫붿꽌�쒕� �ъ슜�� �� ��.
	@example
		ajax.header( "myHeader", "someValue" );				// HTTP �붿껌 �ㅻ뜑�� myHeader 瑜� someValue 濡� �ㅼ젙�쒕떎.
		ajax.header( { anotherHeader : "someValue2" } );	// HTTP �붿껌 �ㅻ뜑�� anotherHeader 瑜� someValue2 濡� �ㅼ젙�쒕떎.
 */
nv.$Ajax.prototype.header = function(name, value) {
	if(this._options["type"]==="jsonp" || this._bXDomainRequest){nv.$Jindo._warn(nv.$Except.CANNOT_USE_HEADER);}

	var oArgs = g_checkVarType(arguments, {
		's4str' : [ 'sKey:String+', 'sValue:String+' ],
		's4obj' : [ 'oOption:Hash+' ],
		'g' : [ 'sKey:String+' ]
	},"$Ajax#option");

	switch(oArgs+"") {
		case 's4str':
			this._headers[oArgs.sKey] = oArgs.sValue;
			break;
		case 's4obj':
			var oOption = oArgs.oOption;
			try {
				for (var x in oOption) {
					if (oOption.hasOwnProperty(x))
						this._headers[x] = oOption[x];
				}
			} catch(e) {}
			break;
		case 'g':
			return this._headers[oArgs.sKey];

	}

	return this;
};

/**
	nv.$Ajax.Response() 媛앹껜瑜� �앹꽦�쒕떎. nv.$Ajax.Response() 媛앹껜�� nv.$Ajax() 媛앹껜�먯꽌 request() 硫붿꽌�쒖쓽 �붿껌 泥섎━ �꾨즺�� �� �앹꽦�쒕떎. nv.$Ajax() 媛앹껜瑜� �앹꽦�� �� onload �띿꽦�� �ㅼ젙�� 肄쒕갚 �⑥닔�� �뚮씪誘명꽣濡� nv.$Ajax.Response() 媛앹껜媛� �꾨떖�쒕떎.

	@class nv.$Ajax.Response
	@keyword ajaxresponse, ajax, response
 */
/**
	Ajax �묐떟 媛앹껜瑜� �섑븨�섏뿬 �묐떟 �곗씠�곕� 媛��몄삤嫄곕굹 �쒖슜�섎뒗�� �좎슜�� 湲곕뒫�� �쒓났�쒕떎.

	@constructor
	@param {Hash+} oReq �붿껌 媛앹껜
	@see nv.$Ajax
 */
nv.$Ajax.Response  = function(req) {
	this._response = req;
	this._regSheild = /^for\(;;\);/;
};

/**
{{response_desc}}
 */
/**
/**
	xml() 硫붿꽌�쒕뒗 �묐떟�� XML 媛앹껜濡� 諛섑솚�쒕떎. XHR�� responseXML �띿꽦怨� �좎궗�섎떎.

	@method xml
	@return {Object} �묐떟 XML 媛앹껜.
	@see https://developer.mozilla.org/en/XMLHttpRequest XMLHttpRequest - MDN Docs
	@example
		// some.xml
		<data>
			<li>泥ル쾲吏�</li>
			<li>�먮쾲吏�</li>
			<li>�몃쾲吏�</li>
		</data>

		// client.html
		var oAjax = new $Ajax('some.xml', {
			type : 'xhr',
			method : 'get',
			onload : function(res){
				var elData = cssquery.getSingle('data', res.xml());	// �묐떟�� XML 媛앹껜濡� 由ы꽩�쒕떎
				$('list').innerHTML = elData.firstChild.nodeValue;
			},
		}).request();
 */
nv.$Ajax.Response.prototype.xml = function() {
	return this._response.responseXML;
};

/**
	text() 硫붿꽌�쒕뒗 �묐떟�� 臾몄옄��(String)濡� 諛섑솚�쒕떎. XHR�� responseText �� �좎궗�섎떎.

	@method text
	@return {String} �묐떟 臾몄옄��.
	@see https://developer.mozilla.org/en/XMLHttpRequest XMLHttpRequest - MDN Docs
	@example
		// some.php
		<?php
			echo "<li>泥ル쾲吏�</li><li>�먮쾲吏�</li><li>�몃쾲吏�</li>";
		?>

		// client.html
		var oAjax = new $Ajax('some.xml', {
			type : 'xhr',
			method : 'get',
			onload : function(res){
				$('list').innerHTML = res.text();	// �묐떟�� 臾몄옄�대줈 由ы꽩�쒕떎.
			},
		}).request();
 */
nv.$Ajax.Response.prototype.text = function() {
	return this._response.responseText.replace(this._regSheild, '');
};

/**
	status() 硫붿꽌�쒕뒗 HTTP �묐떟 肄붾뱶瑜� 諛섑솚�쒕떎. HTTP �묐떟 肄붾뱶�쒕� 李멸퀬�쒕떎.

	@method status
	@return {Numeric} �묐떟 肄붾뱶.
	@see http://www.w3.org/Protocols/HTTP/HTRESP.html HTTP Status codes - W3C
	@example
		var oAjax = new $Ajax('some.php', {
			type : 'xhr',
			method : 'get',
			onload : function(res){
				if(res.status() == 200){	// HTTP �묐떟 肄붾뱶瑜� �뺤씤�쒕떎.
					$('list').innerHTML = res.text();
				}
			},
		}).request();
 */
nv.$Ajax.Response.prototype.status = function() {
	var status = this._response.status;
	return status==0?200:status;
};

/**
	readyState() 硫붿꽌�쒕뒗 �묐떟 �곹깭(readyState)瑜� 諛섑솚�쒕떎.

	@method readyState
	@return {Numeric} readyState 媛�.
		@return .0 �붿껌�� 珥덇린�붾릺吏� �딆� �곹깭 (UNINITIALIZED)
		@return .1 �붿껌 �듭뀡�� �ㅼ젙�덉쑝��, �붿껌�섏� �딆� �곹깭 (LOADING)
		@return .2 �붿껌�� 蹂대궡怨� 泥섎━ 以묒씤 �곹깭. �� �곹깭�먯꽌 �묐떟 �ㅻ뜑瑜� �살쓣 �� �덈떎. (LOADED)
		@return .3 �붿껌�� 泥섎━ 以묒씠硫�, 遺�遺꾩쟻�� �묐떟 �곗씠�곕� 諛쏆� �곹깭 (INTERACTIVE)
		@return .4 �묐떟 �곗씠�곕� 紐⑤몢 諛쏆븘 �듭떊�� �꾨즺�� �곹깭 (COMPLETED)
	@example
		var oAjax = new $Ajax('some.php', {
			type : 'xhr',
			method : 'get',
			onload : function(res){
				if(res.readyState() == 4){	// �묐떟�� readyState 瑜� �뺤씤�쒕떎.
					$('list').innerHTML = res.text();
				}
			},
		}).request();
 */
nv.$Ajax.Response.prototype.readyState = function() {
	return this._response.readyState;
};

/**
	json() 硫붿꽌�쒕뒗 �묐떟�� JSON 媛앹껜濡� 諛섑솚�쒕떎. �묐떟 臾몄옄�댁쓣 �먮룞�쇰줈 JSON 媛앹껜濡� 蹂��섑븯�� 諛섑솚�쒕떎. 蹂��� 怨쇱젙�먯꽌 �ㅻ쪟媛� 諛쒖깮�섎㈃ 鍮� 媛앹껜瑜� 諛섑솚�쒕떎.

	@method json
	@return {Object} JSON 媛앹껜.
	@throws {nv.$Except.PARSE_ERROR} json�뚯떛�� �� �먮윭 諛쒖깮�� 寃쎌슦.
	@example
		// some.php
		<?php
			echo "['泥ル쾲吏�', '�먮쾲吏�', '�몃쾲吏�']";
		?>

		// client.html
		var oAjax = new $Ajax('some.php', {
			type : 'xhr',
			method : 'get',
			onload : function(res){
				var welList = $Element('list').empty();
				var jsonData = res.json();	// �묐떟�� JSON 媛앹껜濡� 由ы꽩�쒕떎

				for(var i = 0, nLen = jsonData.length; i < nLen; i++){
					welList.append($("<li>" + jsonData[i] + "</li>"));
				}
			},
		}).request();
 */
nv.$Ajax.Response.prototype.json = function() {
	if (this._response.responseJSON) {
		return this._response.responseJSON;
	} else if (this._response.responseText) {
		try {
			return eval("("+this.text()+")");
		} catch(e) {
			throw new nv.$Error(nv.$Except.PARSE_ERROR,"$Ajax#json");
		}
	}

	return {};
};

/**
	header() 硫붿꽌�쒕뒗 �묐떟 �ㅻ뜑瑜� 媛��몄삩��.

	@method header
	@syntax sName
	@param {String+} [sName] 媛��몄삱 �묐떟 �ㅻ뜑�� �대쫫. �� �듭뀡�� �낅젰�섏� �딆쑝硫� �ㅻ뜑 �꾩껜瑜� 諛섑솚�쒕떎.
	@return {String | Object} �대떦�섎뒗 �ㅻ뜑 媛�(String) �먮뒗 �ㅻ뜑 �꾩껜(Object)

	@example
		var oAjax = new $Ajax('some.php', {
			type : 'xhr',
			method : 'get',
			onload : function(res){
				res.header("Content-Length")	// �묐떟 �ㅻ뜑�먯꽌 "Content-Length" �� 媛믪쓣 由ы꽩�쒕떎.
			},
		}).request();
 */
nv.$Ajax.Response.prototype.header = function(name) {
	var oArgs = g_checkVarType(arguments, {
		'4str' : [ 'name:String+' ],
		'4voi' : [ ]
	},"$Ajax.Response#header");

	switch (oArgs+"") {
	case '4str':
		return this._response.getResponseHeader(name);
	case '4voi':
		return this._response.getAllResponseHeaders();
	}
};
//-!nv.$Ajax end!-//

/**
	@fileOverview $Ajax�� �뺤옣 硫붿꽌�쒕� �뺤쓽�� �뚯씪
	@name Ajax.extend.js
	@author NAVER Ajax Platform
 */

//-!nv.$Ajax.RequestBase start(nv.$Class,nv.$Ajax)!-//
/**
	Ajax �붿껌 媛앹껜�� 湲곕낯 媛앹껜�대떎.

	@class nv.$Ajax.RequestBase
	@ignore
 */
/**
	Ajax �붿껌 ���� 蹂꾨줈 Ajax �붿껌 媛앹껜瑜� �앹꽦�� �� Ajax �붿껌 媛앹껜瑜� �앹꽦�섍린 �꾪븳 �곸쐞 媛앹껜濡� �ъ슜�쒕떎.

	@constructor
	@ignore
	@see nv.$Ajax
 */
var klass = nv.$Class;
nv.$Ajax.RequestBase = klass({
	_respHeaderString : "",
	callbackid:"",
	callbackname:"",
	responseXML  : null,
	responseJSON : null,
	responseText : "",
	status : 404,
	readyState : 0,
	$init  : function(fpOption){},
	onload : function(){},
	abort  : function(){},
	open   : function(){},
	send   : function(){},
	setRequestHeader  : function(sName, sValue) {
		g_checkVarType(arguments, {
			'4str' : [ 'sName:String+', 'sValue:String+' ]
		},"$Ajax.RequestBase#setRequestHeader");
		this._headers[sName] = sValue;
	},
	getResponseHeader : function(sName) {
		g_checkVarType(arguments, {
			'4str' : [ 'sName:String+']
		},"$Ajax.RequestBase#getResponseHeader");
		return this._respHeaders[sName] || "";
	},
	getAllResponseHeaders : function() {
		return this._respHeaderString;
	},
	_getCallbackInfo : function() {
		var id = "";
		if(this.option("callbackid")!="") {
			var idx = 0;
			do {
				id = "_" + this.option("callbackid") + "_"+idx;
				idx++;
			} while (window["__"+nv._p_.nvName+"_callback"][id]);
		}else{
			do {
				id = "_" + Math.floor(Math.random() * 10000);
			} while (window["__"+nv._p_.nvName+"_callback"][id]);
		}

		if(this.option("callbackname") == ""){
			this.option("callbackname","_callback");
		}
		return {callbackname:this.option("callbackname"),id:id,name:"window.__"+nv._p_.nvName+"_callback."+id};
	}
});
//-!nv.$Ajax.RequestBase end!-//

//-!nv.$Ajax.JSONPRequest start(nv.$Class,nv.$Ajax,nv.$Agent.prototype.navigator,nv.$Ajax.RequestBase)!-//
/**
	Ajax �붿껌 ���낆씠 jsonp�� �붿껌 媛앹껜瑜� �앹꽦�섎ŉ, nv.$Ajax() 媛앹껜�먯꽌 Ajax �붿껌 媛앹껜瑜� �앹꽦�� �� �ъ슜�쒕떎.

	@class nv.$Ajax.JSONPRequest
	@extends nv.$Ajax.RequestBase
	@ignore
 */
/**
	nv.$Ajax.JSONPRequest() 媛앹껜瑜� �앹꽦�쒕떎. �대븣, nv.$Ajax.JSONPRequest() 媛앹껜�� nv.$Ajax.RequestBase() 媛앹껜瑜� �곸냽�쒕떎.

	@constructor
	@ignore
	@see nv.$Ajax
	@see nv.$Ajax.RequestBase
 */
nv.$Ajax.JSONPRequest = klass({
	_headers : {},
	_respHeaders : {},
	_script : null,
	_onerror : null,
	$init  : function(fpOption){
		this.option = fpOption;
	},
	/**
	 * @ignore
	 */
	_callback : function(data) {

		if (this._onerror) {
			clearTimeout(this._onerror);
			this._onerror = null;
		}

		var self = this;

		this.responseJSON = data;
		this.onload(this);
		setTimeout(function(){ self.abort(); }, 10);
	},
	abort : function() {
		if (this._script) {
			try {
				this._script.parentNode.removeChild(this._script);
			}catch(e){}
		}
	},
	open  : function(method, url) {
		g_checkVarType(arguments, {
			'4str' : [ 'method:String+','url:String+']
		},"$Ajax.JSONPRequest#open");
		this.responseJSON = null;
		this._url = url;
	},
	send  : function(data) {
		var oArgs = g_checkVarType(arguments, {
			'4voi' : [],
			'4nul' : ["data:Null"],
			'4str' : ["data:String+"]
		},"$Ajax.JSONPRequest#send");
		var t    = this;
		var info = this._getCallbackInfo();
		var head = document.getElementsByTagName("head")[0];
		this._script = document.createElement("script");
		this._script.type    = "text/javascript";
		this._script.charset = this.option("jsonp_charset");

		if (head) {
			head.appendChild(this._script);
		} else if (document.body) {
			document.body.appendChild(this._script);
		}
		window["__"+nv._p_.nvName+"_callback"][info.id] = function(data){
			try {
				t.readyState = 4;
				t.status = 200;
				t._callback(data);
			} finally {
				delete window["__"+nv._p_.nvName+"_callback"][info.id];
				delete window["__"+nv._p_.nvName+"2_callback"][info.id];
			}
		};
		window["__"+nv._p_.nvName+"2_callback"][info.id] = function(data){
		    window["__"+nv._p_.nvName+"_callback"][info.id](data);
		};

		var agent = nv.$Agent(navigator);
		var _loadCallback = function(){
			if (!t.responseJSON) {
				t.readyState = 4;

				// when has no response code
				t.status = 500;
				t._onerror = setTimeout(function(){t._callback(null);}, 200);
			}
		};

        // On IE11 'script.onreadystatechange' and 'script.readyState' was removed and should be replaced to 'script.onload'.
        // http://msdn.microsoft.com/en-us/library/ie/bg182625%28v=vs.85%29.aspx
		if (agent.navigator().ie && this._script.readyState) {
			this._script.onreadystatechange = function(){
				if (this.readyState == 'loaded'){
					_loadCallback();
					this.onreadystatechange = null;
				}
			};
		} else {
			this._script.onload =
			this._script.onerror = function(){
				_loadCallback();
				this.onerror = null;
				this.onload = null;
			};
		}
		var delimiter = "&";
		if(this._url.indexOf('?')==-1){
			delimiter = "?";
		}
		switch(oArgs+""){
			case "4voi":
			case "4nul":
				data = "";
				break;
			case "4str":
				data = "&" + data;


		}
		//test url for spec.
		this._test_url = this._script.src = this._url+delimiter+info.callbackname+"="+info.name+data;

	}
}).extend(nv.$Ajax.RequestBase);
//-!nv.$Ajax.JSONPRequest end!-//

//-!nv.$Ajax.SWFRequest start(nv.$Class,nv.$Ajax,nv.$Agent.prototype.navigator,nv.$Ajax.RequestBase)!-//
/**
 	Ajax �붿껌 ���낆씠 flash�� �붿껌 媛앹껜瑜� �앹꽦�섎ŉ, nv.$Ajax() 媛앹껜�먯꽌 Ajax �붿껌 媛앹껜瑜� �앹꽦�� �� �ъ슜�쒕떎.

	@class nv.$Ajax.SWFRequest
	@extends nv.$Ajax.RequestBase
	@filter desktop
 */
/**
 	nv.$Ajax.SWFRequest() 媛앹껜瑜� �앹꽦�쒕떎. �대븣, nv.$Ajax.SWFRequest() 媛앹껜�� nv.$Ajax.RequestBase() 媛앹껜瑜� �곸냽�쒕떎.

	@constructor
	@filter desktop
	@see nv.$Ajax
	@see nv.$Ajax.RequestBase
 */
nv.$Ajax.SWFRequest = klass({
	$init  : function(fpOption){
		this.option = fpOption;
	},
	_headers : {},
	_respHeaders : {},
	_getFlashObj : function(){
		var _tmpId = nv.$Ajax.SWFRequest._tmpId;
		var navi = nv.$Agent(window.navigator).navigator();
		var obj;
		if (navi.ie&&navi.version==9) {
			obj = _getElementById(document,_tmpId);
		}else{
			obj = window.document[_tmpId];
		}
		return(this._getFlashObj = function(){
			return obj;
		})();

	},
	_callback : function(status, data, headers){
		this.readyState = 4;
        /*
          �섏쐞 �명솚�� �꾪빐 status媛� boolean 媛믪씤 寃쎌슦�� 泥섎━
         */

		if( nv.$Jindo.isNumeric(status)){
			this.status = status;
		}else{
			if(status==true) this.status=200;
		}
		if (this.status==200) {
			if (nv.$Jindo.isString(data)) {
				try {
					this.responseText = this.option("decode")?decodeURIComponent(data):data;
					if(!this.responseText || this.responseText=="") {
						this.responseText = data;
					}
				} catch(e) {
                    /*
                         �곗씠�� �덉뿉 utf-8�� �꾨땶 �ㅻⅨ �몄퐫�⑹씪�� �붿퐫�⑹쓣 �덊븯怨� 諛붾줈 text�� ����.
                     */

					if(e.name == "URIError"){
						this.responseText = data;
						if(!this.responseText || this.responseText=="") {
							this.responseText = data;
						}
					}
				}
			}
            /*
             肄쒕갚肄붾뱶�� �ｌ뿀吏�留�, �꾩쭅 SWF�먯꽌 �묐떟�ㅻ뜑 吏��� �덊븿
             */
			if(nv.$Jindo.isHash(headers)){
				this._respHeaders = headers;
			}
		}

		this.onload(this);
	},
	open : function(method, url) {
		g_checkVarType(arguments, {
			'4str' : [ 'method:String+','url:String+']
		},"$Ajax.SWFRequest#open");
		var re  = /https?:\/\/([a-z0-9_\-\.]+)/i;

		this._url    = url;
		this._method = method;
	},
	send : function(data) {
		var cache = nv.$Jindo;
		var oArgs = cache.checkVarType(arguments, {
			'4voi' : [],
			'4nul' : ["data:Null"],
			'4str' : ["data:String+"]
		},"$Ajax.SWFRequest#send");
		this.responseXML  = false;
		this.responseText = "";

		var t = this;
		var dat = {};
		var info = this._getCallbackInfo();
		var swf = this._getFlashObj();

		function f(arg) {
			switch(typeof arg){
				case "string":
					return '"'+arg.replace(/\"/g, '\\"')+'"';

				case "number":
					return arg;

				case "object":
					var ret = "", arr = [];
					if (cache.isArray(arg)) {
						for(var i=0; i < arg.length; i++) {
							arr[i] = f(arg[i]);
						}
						ret = "["+arr.join(",")+"]";
					} else {
						for(var x in arg) {
							if(arg.hasOwnProperty(x)){
								arr[arr.length] = f(x)+":"+f(arg[x]);
							}
						}
						ret = "{"+arr.join(",")+"}";
					}
					return ret;
				default:
					return '""';
			}
		}
		data = data?data.split("&"):[];

		var oEach, pos, key, val;
		for(var i=0; i < data.length; i++) {
			oEach = data[i];
			pos = oEach.indexOf("=");
			key = oEach.substring(0,pos);
			val = oEach.substring(pos+1);

			dat[key] = decodeURIComponent(val);
		}
		this._current_callback_id = info.id;
		window["__"+nv._p_.nvName+"_callback"][info.id] = function(success, data){
			try {
				t._callback(success, data);
			} finally {
				delete window["__"+nv._p_.nvName+"_callback"][info.id];
			}
		};

		window["__"+nv._p_.nvName+"2_callback"][info.id] = function(data){
            window["__"+nv._p_.nvName+"_callback"][info.id](data);
        };

		var oData = {
			url  : this._url,
			type : this._method,
			data : dat,
			charset  : "UTF-8",
			callback : info.name,
			header_json : this._headers
		};

		swf.requestViaFlash(f(oData));
	},
	abort : function(){
	    var info = this._getCallbackInfo();

		if(this._current_callback_id){
			window["__"+nv._p_.nvName+"_callback"][this._current_callback_id] = function() {
				delete window["__"+nv._p_.nvName+"_callback"][info.id];
				delete window["__"+nv._p_.nvName+"2_callback"][info.id];
			};

			window["__"+nv._p_.nvName+"2_callback"][this._current_callback_id] = function(data){
                window["__"+nv._p_.nvName+"_callback"][this._current_callback_id](data);
            };
		}
	}
}).extend(nv.$Ajax.RequestBase);

/**
	write() 硫붿꽌�쒕뒗 �뚮옒�� 媛앹껜瑜� 珥덇린�뷀븯�� 硫붿꽌�쒕줈�� write() 硫붿꽌�쒕� �몄텧�섎㈃ �듭떊�� �꾪븳 �뚮옒�� 媛앹껜瑜� 臾몄꽌 �댁뿉 異붽��쒕떎. Ajax �붿껌 ���낆씠 flash�대㈃ �뚮옒�� 媛앹껜瑜� �듯빐 �듭떊�쒕떎. �곕씪�� nv.$Ajax() 媛앹껜�� request 硫붿꽌�쒓� �몄텧�섍린 �꾩뿉 write() 硫붿꽌�쒕� 諛섎뱶�� �� 踰� �ㅽ뻾�댁빞 �섎ŉ, <body> �붿냼�� �묒꽦�섏뼱�� �쒕떎. �� 踰� �댁긽 �ㅽ뻾�대룄 臾몄젣媛� 諛쒖깮�쒕떎.

	@method write
	@param {String+} [sSWFPath="./ajax.swf"] Ajax �듭떊�� �ъ슜�� �뚮옒�� �뚯씪.
	@filter desktop
	@see nv.$Ajax#request
	@example
		<body>
		    <script type="text/javascript">
		        $Ajax.SWFRequest.write("/path/swf/ajax.swf");
		    </script>
		</body>
 */
nv.$Ajax.SWFRequest.write = function(swf_path) {
    var oArgs = nv.$Jindo.checkVarType(arguments, {
        '4voi' : [],
        '4str' : ["data:String+"]
    },"<static> $Ajax.SWFRequest#write");
    switch(oArgs+""){
        case "4voi":
            swf_path = "./ajax.swf";

    }
    var ajax = nv.$Ajax;
    ajax.SWFRequest._tmpId = 'tmpSwf'+(new Date()).getMilliseconds()+Math.floor(Math.random()*100000);
    var activeCallback = "nv.$Ajax.SWFRequest.loaded";
    var protocol = (location.protocol == "https:")?"https:":"http:";
    var classid = (nv._p_._JINDO_IS_IE?'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"':'');
    ajax._checkFlashLoad();

    var body = document.body;
    var nodes = body.childNodes;
    var swf = nv.$("<div style='position:absolute;top:-1000px;left:-1000px' tabindex='-1'>/<div>");
    swf.innerHTML = '<object tabindex="-1" id="'+ajax.SWFRequest._tmpId+'" width="1" height="1" '+classid+' codebase="'+protocol+'//download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0"><param name="movie" value="'+swf_path+'"><param name = "FlashVars" value = "activeCallback='+activeCallback+'" /><param name = "allowScriptAccess" value = "always" /><embed tabindex="-1" name="'+ajax.SWFRequest._tmpId+'" src="'+swf_path+'" type="application/x-shockwave-flash" pluginspage="'+protocol+'://www.macromedia.com/go/getflashplayer" width="1" height="1" allowScriptAccess="always" swLiveConnect="true" FlashVars="activeCallback='+activeCallback+'"></embed></object>';

    if (nodes.length > 0) {
        body.insertBefore(swf, nodes[0]);
    } else {
        body.appendChild(swf);
    }
};

/**
 * @ignore
 */
nv.$Ajax._checkFlashLoad = function(){
	nv.$Ajax._checkFlashKey = setTimeout(function(){
		nv.$Ajax.SWFRequest.onerror();
	},5000);
	nv.$Ajax._checkFlashLoad = function(){};
};
/**
	�뚮옒�� 媛앹껜 濡쒕뵫 �щ�瑜� ���ν븳 蹂���. 濡쒕뵫�� 寃쎌슦 true瑜� 諛섑솚�섍퀬 濡쒕뵫�섏� �딆� 寃쎌슦 false瑜� 諛섑솚�쒕떎. �뚮옒�� 媛앹껜媛� 濡쒕뵫�섏뿀�붿� �뺤씤�� �� �ъ슜�� �� �덈떎.

	@method activeFlash
	@filter desktop
	@see nv.$Ajax.SWFRequest#write
 */
nv.$Ajax.SWFRequest.activeFlash = false;

/**
 * 	flash媛� �뺤긽�곸쑝濡� load �꾨즺�� �� �ㅽ뻾�섎뒗 �⑥닔.

	@method onload
	@filter desktop
	@since 2.0.0
	@see nv.$Ajax.SWFRequest#onerror
	@example
		var oSWFAjax = $Ajax("http://naver.com/api/test.json",{
			"type" : "flash"
		});
	    $Ajax.SWFRequest.onload = function(){
			oSWFAjax.request();
		}
 */
nv.$Ajax.SWFRequest.onload = function(){
};

/**
 * 	flash媛� �뺤긽�곸쑝濡� load �꾨즺�섏� �딆쓣�� �ㅽ뻾�섎뒗 �⑥닔.

	@method onerror
	@filter desktop
	@see nv.$Ajax.SWFRequest#onerror
	@since 2.0.0
	@example
		var oSWFAjax = $Ajax("http://naver.com/api/test.json",{
			"type" : "flash"
		});
        $Ajax.SWFRequest.onerror = function(){
			alert("flash濡쒕뱶 �ㅽ뙣.�ㅼ떆 濡쒕뱶�섏꽭��!");
		}
 */
nv.$Ajax.SWFRequest.onerror = function(){
};

/**
	flash�먯꽌 濡쒕뵫 �� �ㅽ뻾 �쒗궎�� �⑥닔.

	@method loaded
	@filter desktop
	@ignore
 */
nv.$Ajax.SWFRequest.loaded = function(){
	clearTimeout(nv.$Ajax._checkFlashKey);
	nv.$Ajax.SWFRequest.activeFlash = true;
	nv.$Ajax.SWFRequest.onload();
};
//-!nv.$Ajax.SWFRequest end!-//

//-!nv.$Ajax.FrameRequest start(nv.$Class,nv.$Ajax,nv.$Ajax.RequestBase)!-//
/**
	nv.$Ajax.FrameRequest() 媛앹껜�� Ajax �붿껌 ���낆씠 iframe�� �붿껌 占쏙옙占쎌껜瑜� �앹꽦�섎ŉ, nv.$Ajax() 媛앹껜�먯꽌 Ajax �붿껌 媛앹껜瑜� �앹꽦�� �� �ъ슜�쒕떎.

	@class nv.$Ajax.FrameRequest
	@extends nv.$Ajax.RequestBase
	@filter desktop
	@ignore
 */
/**
	nv.$Ajax.FrameRequest() 媛앹껜瑜� �앹꽦�쒕떎. �대븣, nv.$Ajax.FrameRequest() 媛앹껜�� nv.$Ajax.RequestBase() 媛앹껜瑜� �곸냽�쒕떎.

	@constructor
	@filter desktop
	@ignore
	@see nv.$Ajax
	@see nv.$Ajax.RequestBase
 */
nv.$Ajax.FrameRequest = klass({
	_headers : {},
	_respHeaders : {},
	_frame  : null,
	_domain : "",
	$init  : function(fpOption){
		this.option = fpOption;
	},
	_callback : function(id, data, header) {
		var self = this;

		this.readyState   = 4;
		this.status = 200;
		this.responseText = data;

		this._respHeaderString = header;
		header.replace(/^([\w\-]+)\s*:\s*(.+)$/m, function($0,$1,$2) {
			self._respHeaders[$1] = $2;
		});

		this.onload(this);

		setTimeout(function(){ self.abort(); }, 10);
	},
	abort : function() {
		if (this._frame) {
			try {
				this._frame.parentNode.removeChild(this._frame);
			} catch(e) {}
		}
	},
	open : function(method, url) {
		g_checkVarType(arguments, {
			'4str' : [ 'method:String+','url:String+']
		},"$Ajax.FrameRequest#open");

		var re  = /https?:\/\/([a-z0-9_\-\.]+)/i;
		var dom = document.location.toString().match(re);

		this._method = method;
		this._url    = url;
		this._remote = String(url).match(/(https?:\/\/[a-z0-9_\-\.]+)(:[0-9]+)?/i)[0];
		this._frame = null;
		this._domain = (dom != null && dom[1] != document.domain)?document.domain:"";
	},
	send : function(data) {
		var oArgs = g_checkVarType(arguments, {
			'4voi' : [],
			'4nul' : ["data:Null"],
			'4str' : ["data:String+"]
		},"$Ajax.FrameRequest#send");

		this.responseXML  = "";
		this.responseText = "";

		var t      = this;
		var re     = /https?:\/\/([a-z0-9_\-\.]+)/i;
		var info   = this._getCallbackInfo();
		var url;
		var _aStr = [];
		_aStr.push(this._remote+"/ajax_remote_callback.html?method="+this._method);
		var header = [];

		window["__"+nv._p_.nvName+"_callback"][info.id] = function(id, data, header){
			try {
				t._callback(id, data, header);
			} finally {
				delete window["__"+nv._p_.nvName+"_callback"][info.id];
				delete window["__"+nv._p_.nvName+"2_callback"][info.id];
			}
		};

		window["__"+nv._p_.nvName+"2_callback"][info.id] = function(id, data, header){
            window["__"+nv._p_.nvName+"_callback"][info.id](id, data, header);
        };

		for(var x in this._headers) {
			if(this._headers.hasOwnProperty(x)){
				header[header.length] = "'"+x+"':'"+this._headers[x]+"'";
			}

		}

		header = "{"+header.join(",")+"}";

		_aStr.push("&id="+info.id);
		_aStr.push("&header="+encodeURIComponent(header));
		_aStr.push("&proxy="+encodeURIComponent(this.option("proxy")));
		_aStr.push("&domain="+this._domain);
		_aStr.push("&url="+encodeURIComponent(this._url.replace(re, "")));
		_aStr.push("#"+encodeURIComponent(data));

		var fr = this._frame = document.createElement("iframe");
		var style = fr.style;
		style.position = "absolute";
		style.visibility = "hidden";
		style.width = "1px";
		style.height = "1px";

		var body = document.body || document.documentElement;
		if (body.firstChild){
			body.insertBefore(fr, body.firstChild);
		}else{
			body.appendChild(fr);
		}
		if(typeof MSApp != "undefined"){
			MSApp.addPublicLocalApplicationUri(this.option("proxy"));
		}

		fr.src = _aStr.join("");
	}
}).extend(nv.$Ajax.RequestBase);
//-!nv.$Ajax.FrameRequest end!-//

//-!nv.$Ajax.Queue start(nv.$Ajax)!-//
/**
	nv.$Ajax.Queue() 媛앹껜�� Ajax �붿껌�� �먯뿉 �댁븘 �먯뿉 �ㅼ뼱�� �쒖꽌��濡� �붿껌�� 泥섎━�쒕떎.

	@class nv.$Ajax.Queue
	@keyword ajaxqueue, queue, ajax, ��
 */
/**
	nv.$Ajax() 媛앹껜瑜� �쒖꽌��濡� �몄텧�� �� �덈룄濡� 湲곕뒫�� �쒓났�쒕떎.

	@constructor
	@param {Hash+} oOption nv.$Ajax.Queue() 媛앹껜媛� �쒕쾭濡� �듭떊�� �붿껌�� �� �ъ슜�섎뒗 �뺣낫瑜� �뺤쓽�쒕떎.
		@param {Boolean} [oOption.async=false] 鍮꾨룞湲�/�숆린 �붿껌 諛⑹떇�� �ㅼ젙�쒕떎. 鍮꾨룞湲� �붿껌 諛⑹떇�대㈃ true, �숆린 �붿껌 諛⑹떇�대㈃ false瑜� �ㅼ젙�쒕떎.
		@param {Boolean} [oOption.useResultAsParam=false] �댁쟾 �붿껌 寃곌낵瑜� �ㅼ쓬 �붿껌�� �뚮씪誘명꽣濡� �꾨떖�좎� 寃곗젙�쒕떎. �댁쟾 �붿껌 寃곌낵瑜� �뚮씪誘명꽣濡� �꾨떖�섎젮硫� true, 洹몃젃寃� �섏� �딆쓣 寃쎌슦 false瑜� �ㅼ젙�쒕떎.
		@param {Boolean} [oOption.stopOnFailure=false] �댁쟾 �붿껌�� �ㅽ뙣�� 寃쎌슦 �ㅼ쓬 �붿껌 以묐떒 �щ�瑜� �ㅼ젙�쒕떎. �ㅼ쓬 �붿껌�� 以묐떒�섎젮硫� true, 怨꾩냽 �ㅽ뻾�섎젮硫� false瑜� �ㅼ젙�쒕떎.
	@since 1.3.7
	@see nv.$Ajax
	@example
		// $Ajax �붿껌 �먮� �앹꽦�쒕떎.
		var oAjaxQueue = new $Ajax.Queue({
			useResultAsParam : true
		});
 */
nv.$Ajax.Queue = function (option) {
	//-@@$Ajax.Queue-@@//
	var cl = arguments.callee;
	if (!(this instanceof cl)){ return new cl(option||{});}

	var oArgs = g_checkVarType(arguments, {
		'4voi' : [],
		'4obj' : ["option:Hash+"]
	},"$Ajax.Queue");
	option = oArgs.option;
	this._options = {
		async : false,
		useResultAsParam : false,
		stopOnFailure : false
	};

	this.option(option);

	this._queue = [];
};

/**
	option() 硫붿꽌�쒕뒗 nv.$Ajax.Queue() 媛앹껜�� �ㅼ젙�� �듭뀡 媛믪쓣 諛섑솚�쒕떎.

	@method option
	@param {String+} vName �듭뀡�� �대쫫
	@return {Variant} �낅젰�� �듭뀡�� 諛섑솚�쒕떎.
	@see nv.$Ajax.Queue
	@example
		oAjaxQueue.option("useResultAsParam");	// useResultAsParam �듭뀡 媛믪씤 true 瑜� 由ы꽩�쒕떎.
 */
/**
	option() 硫붿꽌�쒕뒗 nv.$Ajax.Queue() 媛앹껜�� 吏��뺥븳 �듭뀡 媛믪쓣 �ㅼ� 媛믪쑝濡� �ㅼ젙�쒕떎.

	@method option
	@syntax sName, vValue
	@syntax oOption
	@param {String+} sName �듭뀡�� �대쫫(String)
	@param {Variant} [vValue] �ㅼ젙�� �듭뀡�� 媛�. �ㅼ젙�� �듭뀡�� vName�� 吏��뺥븳 寃쎌슦�먮쭔 �낅젰�쒕떎.
	@param {Hash+} oOption �듭뀡�� �대쫫(String) �먮뒗 �섎굹 �댁긽�� �듭뀡�� �ㅼ젙�� 媛앹껜(Object).
	@return {this} 吏��뺥븳 �듭뀡�� �ㅼ젙�� �몄뒪�댁뒪 �먯떊
	@see nv.$Ajax.Queue
	@example
		var oAjaxQueue = new $Ajax.Queue({
			useResultAsParam : true
		});

		oAjaxQueue.option("async", true);		// async �듭뀡�� true 濡� �ㅼ젙�쒕떎.
 */
nv.$Ajax.Queue.prototype.option = function(name, value) {
	var oArgs = g_checkVarType(arguments, {
		's4str' : [ 'sKey:String+', 'sValue:Variant' ],
		's4obj' : [ 'oOption:Hash+' ],
		'g' : [ 'sKey:String+' ]
	},"$Ajax.Queue#option");

	switch(oArgs+"") {
		case 's4str':
			this._options[oArgs.sKey] = oArgs.sValue;
			break;
		case 's4obj':
			var oOption = oArgs.oOption;
			try {
				for (var x in oOption) {
					if (oOption.hasOwnProperty(x))
						this._options[x] = oOption[x];
				}
			}catch(e) {}
			break;
		case 'g':
			return this._options[oArgs.sKey];
	}

	return this;
};

/**
	add() 硫붿꽌�쒕뒗 $Ajax.Queue�� Ajax �붿껌(nv.$Ajax() 媛앹껜)�� 異붽��쒕떎.

	@method add
	@syntax oAjax, oParam
	@param {nv.$Ajax} oAjax 異붽��� nv.$Ajax() 媛앹껜.
	@param {Hash+} [oParam] Ajax �붿껌 �� �꾩넚�� �뚮씪誘명꽣 媛앹껜.
	@return {this} �몄뒪�댁뒪 �먯떊
	@example
		var oAjax1 = new $Ajax('ajax_test.php',{
			onload :  function(res){
				// onload �몃뱾��
			}
		});
		var oAjax2 = new $Ajax('ajax_test.php',{
			onload :  function(res){
				// onload �몃뱾��
			}
		});
		var oAjax3 = new $Ajax('ajax_test.php',{
			onload :  function(res){
				// onload �몃뱾��
			}

		});

		var oAjaxQueue = new $Ajax.Queue({
			async : true,
			useResultAsParam : true,
			stopOnFailure : false
		});

		// Ajax �붿껌�� �먯뿉 異붽��쒕떎.
		oAjaxQueue.add(oAjax1);

		// Ajax �붿껌�� �먯뿉 異붽��쒕떎.
		oAjaxQueue.add(oAjax1,{seq:1});
		oAjaxQueue.add(oAjax2,{seq:2,foo:99});
		oAjaxQueue.add(oAjax3,{seq:3});

		oAjaxQueue.request();
 */
nv.$Ajax.Queue.prototype.add = function (oAjax, oParam) {
	var oArgs = g_checkVarType(arguments, {
		'4obj' : ['oAjax:Hash+'],
		'4obj2' : ['oAjax:Hash+','oPram:Hash+']
	},"$Ajax.Queue");
	switch(oArgs+""){
		case "4obj2":
			oParam = oArgs.oPram;
	}

	this._queue.push({obj:oAjax, param:oParam});
	return this;
};

/**
	request() 硫붿꽌�쒕뒗 $Ajax.Queue�� �덈뒗 Ajax �붿껌�� �쒕쾭濡� 蹂대궦��.

	@method request
	@return {this} �몄뒪�댁뒪 �먯떊
	@example
		var oAjaxQueue = new $Ajax.Queue({
			useResultAsParam : true
		});
		oAjaxQueue.add(oAjax1,{seq:1});
		oAjaxQueue.add(oAjax2,{seq:2,foo:99});
		oAjaxQueue.add(oAjax3,{seq:3});

		// �쒕쾭�� Ajax �붿껌�� 蹂대궦��.
		oAjaxQueue.request();
 */
nv.$Ajax.Queue.prototype.request = function () {
	this._requestAsync.apply(this,this.option('async')?[]:[0]);
	return this;
};

nv.$Ajax.Queue.prototype._requestSync = function (nIdx, oParam) {
	var t = this;
	var queue = this._queue;
	if (queue.length > nIdx+1) {
		queue[nIdx].obj._oncompleted = function(bSuccess, oResult){
			if(!t.option('stopOnFailure') || bSuccess) t._requestSync(nIdx + 1, oResult);
		};
	}
	var _oParam = queue[nIdx].param||{};
	if(this.option('useResultAsParam') && oParam){
		try { for(var x in oParam) if(_oParam[x] === undefined && oParam.hasOwnProperty(x)) _oParam[x] = oParam[x]; } catch(e) {}
	}
	queue[nIdx].obj.request(_oParam);
};

nv.$Ajax.Queue.prototype._requestAsync = function () {
	for( var i=0; i<this._queue.length; i++)
		this._queue[i].obj.request(this._queue[i].param||{});
};
//-!nv.$Ajax.Queue end!-//


!function() {
    // Add nv._p_.addExtension method to each class.
    var aClass = [ "$Agent","$Ajax","$A","$Cookie","$Date","$Document","$Element","$ElementList","$Event","$Form","$Fn","$H","$Json","$S","$Template","$Window" ],
        sClass, oClass;

    for(var i=0, l=aClass.length; i<l; i++) {
        sClass = aClass[i];
        oClass = nv[sClass];

        if(oClass) {
            oClass.addExtension = (function(sClass) {
                return function(sMethod,fpFunc){
                    nv._p_.addExtension(sClass,sMethod,fpFunc);
                    return this;
                };
            })(sClass);
        }
    }

    // Add hook method to $Element and $Event
    var hooks = ["$Element","$Event"];

    for(var i=0, l=hooks.length; i<l; i++) {
        var _className = hooks[i];
        if(nv[_className]) {
            nv[_className].hook = (function(className) {
                var __hook = {};
                return function(sName, vRevisionKey) {

                    var oArgs = nv.$Jindo.checkVarType(arguments, {
                        'g'  : ["sName:String+"],
                        's4var' : ["sName:String+", "vRevisionKey:Variant"],
                        's4obj' : ["oObj:Hash+"]
                    },"nv."+className+".hook");

                    switch(oArgs+"") {
                        case "g":
                            return __hook[oArgs.sName.toLowerCase()];
                        case "s4var":
                            if(vRevisionKey == null){
                                delete __hook[oArgs.sName.toLowerCase()];
                            } else {
                                __hook[oArgs.sName.toLowerCase()] = vRevisionKey;
                            }

                            return this;
                        case "s4obj":
                            var oObj = oArgs.oObj;
                            for(var i in oObj) {
                                __hook[i.toLowerCase()] = oObj[i];
                            }

                            return this;
                    }
                };
            })(_className);
        }
    }

    //-!nv.$Element.unload.hidden start!-//
    if(!nv.$Jindo.isUndefined(window)&& !(nv._p_._j_ag.indexOf("IEMobile") == -1 && nv._p_._j_ag.indexOf("Mobile") > -1 && nv._p_._JINDO_IS_SP)) {
        (new nv.$Element(window)).attach("unload",function(e) {
            nv.$Element.eventManager.cleanUpAll();
        });
    }
    //-!nv.$Element.unload.hidden end!-//

    // Register as a named AMD module
    if(typeof define === "function" && define.amd) {
        define("nv", [], function() { return nv; });
    }
}();;/**
 * @constructor
 * @description NAVER Login authorize API
 * @author juhee.lee@nhn.com
 * @version 0.0.1
 * @date 14. 11. 21
 * @copyright 2014 Licensed under the MIT license.
 * @param {PropertiesHash} htOption
 * @param {string} htOption.client_id �댄뵆由ъ��댁뀡 �깅줉 �� 遺��� 諛쏆� id
 * @param {string} htOption.client_secret �댄뵆由ъ��댁뀡 �깅줉 �� 遺��� 諛쏆� secret
 * @param {string} htOption.redirect_uri �댄겢由ъ��댁뀡 �깅줉 �� �낅젰�� redirect uri
 * @returns {{api: Function, checkAuthorizeState: Function, getAccessToken: Function, updateAccessToken: Function, logout: Function, login: Function}}
 * @example
 * var naver = NaverAuthorize({
 *   client_id : "�댄뵆由ъ��댁뀡 id",
 *   client_secret : "�댄뵆由ъ��댁뀡 secret",
 *   redirect_uri : "redirect uri"
 * });
 */
NaverAuthorize = function(htOption) {
    var SERVICE_PROVIDER = "NAVER",
        URL = {
            LOGIN : "https://nid.naver.com/oauth2.0/authorize",
            AUTHORIZE : "https://nid.naver.com/oauth2.0/token",
            API : "https://apis.naver.com/nidlogin/nid/getUserProfile.json?response_type=json"
        },
        GRANT_TYPE = {
            "AUTHORIZE" : "authorization_code",
            "REFRESH" : "refresh_token",
            "DELETE" : "delete"
        };

    var client_id = htOption.client_id,
        client_secret = htOption.client_secret,
        redirect_uri = htOption.redirect_uri,
        code, state_token;


    /**
     * ajax �듭떊 媛앹껜 由ы꽩
     * @ignore
     * @param {string} sUrl �몄텧�� �쒕쾭�� URL
     * @param {requestCallback} callback �묐떟�� �� �� �몄텧 �� 肄쒕갚
     * @returns {*}
     * @private
     */
    _ajax = function(sUrl, callback) {
        return nv.$Ajax(sUrl, {
            type : 'jsonp',
            method : 'get',
            callbackname: 'oauth_callback',
            timeout : 3,
            onload : function(data) {
                callback(data);
            },
            ontimeout : function() {
                callback({"error":"timeout"});
            },
            onerror : function() {
                callback({"error" : "fail"});
            }
        });
    };

    /**
     * queryString�쇰줈 �꾨떖 諛쏆� �뚮씪誘명꽣�� 媛� 異붿텧
     * @ignore
     * @param {string} name queryString�� key �대쫫
     * @returns {*}
     * @private
     */
    _getUrlParameter = function(name) {
        var page_url = window.location.search.substring(1),
            key, values  = page_url.split("&"),
            count = values.length, i;

        for(i=0; i<count; i++) {
            key = values[i].split("=");
            if(key[0] == name) {
                return key[1];
            }
        }

        return null;
    };

    /**
     * 濡쒓렇�� �몄쬆 肄붾뱶媛� �덈뒗吏� �뺤씤
     * @ignore
     * @returns {boolean}
     * @private
     */
    _hasAuthorizeCode = function() {
        code = _getUrlParameter("code");
        return (code !== null);
    };

    /**
     * state token �� 留욌뒗吏� �뺤씤
     * @ignore
     * @param {string} token state �좏겙
     * @returns {boolean}
     * @private
     */
    _isStateToken = function(token) {
        state_token = _getUrlParameter("state");
        return (state_token !== null && state_token === token);
    };

    /**
     * �ъ슜�� �뺣낫瑜� �붿껌
     * @ignore
     * @param {string} access_token access �좏겙
     * @param {requestCallback} callback �묐떟�� �� �� �몄텧 �� 肄쒕갚
     * @private
     */
    _getUserInfo = function(access_token, callBack) {
        _ajax(URL.API, callBack).request({
            "Authorization": encodeURIComponent("Bearer " + access_token)
        });
    };

    /**
     * Access Token �앹꽦
     * @ignore
     * @param {requestCallback} callback �묐떟�� �� �� �몄텧 �� 肄쒕갚
     * @private
     */
    _createAccessToken = function(callBack) {
        _ajax(URL.AUTHORIZE, callBack).request({
            "grant_type" : GRANT_TYPE.AUTHORIZE,
            "client_id" : client_id,
            "client_secret" : client_secret,
            "code" : code,
            "state" : state_token
        });
    };

    /**
     * Access Token 媛깆떊
     * @ignore
     * @param {string} refresh_token refresh �좏겙
     * @param {requestCallback} callback �묐떟�� �� �� �몄텧 �� 肄쒕갚
     * @private
     */
    _updateAccessToken = function(refresh_token, callBack) {
        _ajax(URL.AUTHORIZE, callBack).request({
            "grant_type" : GRANT_TYPE.REFRESH,
            "client_id" : client_id,
            "client_secret" : client_secret,
            "refresh_token" : refresh_token
        });
    };

    /**
     * Access Token ��젣
     * @ignore
     * @param {string} access_token access �좏겙
     * @param {requestCallback} callback �묐떟�� �� �� �몄텧 �� 肄쒕갚
     * @private
     */
    _removeAccessToken = function(access_token, callBack) {
        _ajax(URL.AUTHORIZE, callBack).request({
            "grant_type" : GRANT_TYPE.DELETE,
            "client_id" : client_id,
            "client_secret" : client_secret,
            "access_token" : encodeURIComponent(access_token),
            "service_provider" : SERVICE_PROVIDER
        });
    };


    return {
        /**
         * API �몄텧 �⑥닔
         * @param {string} method �몄텧�� API 紐낅졊�� (/me : �ъ슜�� �뺣낫瑜� �붿껌)
         * @param {string} access_token access �좏겙
         * @param {requestCallback} callback �묐떟�� �� �� �몄텧 �� 肄쒕갚
         */
        api : function(method, access_token, callBack) {
            if(method === "/me") {
                _getUserInfo(access_token, callBack);
            } else {
				_ajax(method, callBack).request({
            		"Authorization": "Bearer " + access_token
        		});
			}
        },

        /**
         * 濡쒓렇�� �몄쬆 �곹깭瑜� �뺤씤
         * @param {string} state_token state �좏겙
         * @returns {string} �먮윭 硫붿떆吏�
         */
        checkAuthorizeState : function(state_token) {
            var error = _getUrlParameter("error");

            if(error !== null) {
                return error;
            }

            if(_hasAuthorizeCode() && _isStateToken(state_token)) {
                return "connected";
            }

            return "not_available_state";
        },

        /**
         * Access Token �� �뚮젮以�
         * @param {requestCallback} callback �묐떟�� �� �� �몄텧 �� 肄쒕갚
         */
        getAccessToken : function(callBack) {
            _createAccessToken(callBack);
        },

        /**
         * Access Token �� �낅뜲�댄듃�섏뿬 �뚮젮以�
         * @param {string} refresh_token refresh �좏겙
         * @param {requestCallback} callback �묐떟�� �� �� �몄텧 �� 肄쒕갚
         */
        updateAccessToken : function(refresh_token, callBack) {
            _updateAccessToken(refresh_token, callBack);
        },

        /**
         * 濡쒓렇�꾩썐
         * @param {string} access_token access �좏겙
         * @param {requestCallback} callback �묐떟�� �� �� �몄텧 �� 肄쒕갚
         */
        logout : function(access_token, callBack) {
            _removeAccessToken(access_token, callBack)
        },

        /**
         * 濡쒓렇��
         * @param {string} state_token state �좏겙
         */
        login : function(state_token, date) {
            document.location.href = URL.LOGIN + "?client_id=" + client_id + "&response_type=code&redirect_uri=" + encodeURIComponent(redirect_uri) + "&state=" + state_token ;
        }
    };

}