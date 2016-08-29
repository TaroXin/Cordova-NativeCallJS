var exec = require('cordova/exec');

var NCJ = {
	arg : {
		port : 12345 ,
		debug : false
	},
	client:null,
	jsCallNativeSuccess:void 0,
	init : function(arg,success,error){
		NCJ.arg.port = arg.port || 12345 ;
		NCJ.arg.debug = arg.debug || false ;
		exec(function(data){
		    NCJ.openClient();
		    success(data);
		}, error, "NativeCallJS", "init", [NCJ.arg]);
	},
	shutdown : function(success,error){
		exec(success, error, "NativeCallJS", "shutdown", []);
	},
	callNative : function(nativeMethodName,args,success){
		// String nativeMethodName , Object[] args ;
		var jsCallNativeMessage = "JCNMethod:";
		args = NCJ.handleJsCallNativeMethodArgs(args);
		jsCallNativeMessage += (nativeMethodName + args);
		NCJ.client.send(jsCallNativeMessage);
		jsCallNativeSuccess = success;
	},
	openClient : function(){
		var client = new WebSocket("ws://localhost:" + NCJ.arg.port);

		client.onopen = function(result){
			NCJ.client = client ;
		};

		client.onmessage = function(result){
		  	NCJ.log("received message:" + result.data);
		  	var startWith = "JCNResult:";
		  	if( NCJ.startsWith(result.data,startWith) ){
		  		NCJ.doJsCallNativeResult(result.data.toString().substring(startWith.length));
		  		return;
		  	}
			var ret = NCJ.executeLocalMethod(result.data);
			NCJ.log("执行JavaScript方法成功,返回值为:" + ret);
			client.send(NCJ.judgeMethodReturnType(ret));
		};

		client.onerror = function(result){
			console.log(result.data);
		};

		client.onclose = function(result){
			NCJ.client = null;
		}
	},
	executeLocalMethod : function(message){
		var method = message.split("N?P");
		var methodName = method[0];
		var args = method[1];
		NCJ.log("executeLocalMethod-methodName:" + methodName);
		NCJ.log("executeLocalMethod-args:" + args);
		if( NCJ.isMethodExists(methodName) ){
		  	NCJ.log("execute Method : " + methodName);
			var result = NCJ.doMethod(cordova.plugins.NCJ.NCJMethods[methodName],args);
			NCJ.log("result:" + result);
			if( result !== void 0 ){
				return result ;
			}
			//无返回值
			return "nr";
		}
		//无方法
		return "nm";

	},
	doJsCallNativeResult : function(data){
		NCJ.log("接收到Native方法的返回值:"+data);
		if( jsCallNativeSuccess ){
			NCJ.doMethod(jsCallNativeSuccess,data);
			jsCallNativeSuccess = void 0;
		}
	},
	doMethod : function(method,args){
		NCJ.log("This is NCJ.doMethod!");
		var argsArray = [];
		args = JSON.parse(args);

		for( var i = 0 ; i < args.length ; i++ ){
			var arg = args[i];
			var argObject ;
			if( arg.type === "string" ){
				argObject = arg.value ;
			}else if( arg.type === "int" ){
				argObject = parseInt(arg.value);
			}else if( arg.type === "float" ){
				argObject = parseFloat(arg.value);
			}else if( arg.type === "boolean" ){
				argObject = Boolean(Number(arg.value));
			}else if( arg.type === "object" ){
				argObject = JSON.parse(arg.value);
			}else{
				argObject = void 0 ;
			}
			argsArray.push(argObject);
			NCJ.log("解析参数,type:"+arg.type+",value:"+argObject);
		}

		return method.apply(this,argsArray);
	},
	isMethodExists : function(methodName){
		if( cordova.plugins.NCJ.NCJMethods ){
		  NCJ.log("methodName:" + methodName + " - " + cordova.plugins.NCJ.NCJMethods[methodName]);
			if( cordova.plugins.NCJ.NCJMethods[methodName] ){
				return true;
			}
		}
		return false;
	},
	judgeMethodReturnType : function(ret){
	  	NCJ.log("检测返回值类型,返回值为:"+ret+",typeof:"+(typeof ret));
		if( ret === "nr" || ret === "nm" ){
			return ret;
		}

		if( typeof ret === "string" ){
			return ret;
		}

		if( typeof ret === "number" || typeof ret === "boolean"){
			return ret.toString();
		}

		if( typeof ret === "object" ){
			return JSON.stringify(ret);
		}

		if( typeof ret === "function" ){
			ret = ret();
			NCJ.judgeMethodReturnType(ret);
		}
	},
	handleJsCallNativeMethodArgs : function(args){
		var argString = "J?P";
		var argArray = [];
		for( var i = 0 ; i < args.length ; i++ ){
			var arg = args[i];
			var argJson = {};
			var type = "";
			if( typeof arg === "string" ){
				type = "string";
			}else if( typeof arg === "number" ){
				if( arg.toString().indexOf(".") != -1 ){
					type = "float";
				}else{
					type = "int";
				}
			}else if( typeof arg === "boolean" ){
				type = "boolean";
			}else if( typeof arg === "object" ){
				type = "object";
			}
			argJson.type = type ;
			argJson.value = arg ;
			argArray.push(argJson);
		}
		return argString + JSON.stringify(argArray);
	},
	startsWith : function(e,s){
		var index = e.indexOf(s);
		if( index === 0 ) return true;
		return false;
	},
	log : function(msg){
		if( NCJ.arg.debug ){
		    console.log(msg);
		}
	},
	NCJMethods : {}
};

module.exports = NCJ ;