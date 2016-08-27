var exec = require('cordova/exec');

var NCJ = {
	arg : {
		port : 12345 ,
		debug : false
	},
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
	openClient : function(){
		var client = new WebSocket("ws://localhost:" + NCJ.arg.port);

		client.onopen = function(result){

		};

		client.onmessage = function(result){
		  	NCJ.log("received message:" + result.data);
			var ret = NCJ.executeLocalMethod(result.data);
			NCJ.log("执行JavaScript方法成功,返回值为:" + ret);
			NCJ.judgeMethodReturnType(client,ret);
		};

		client.onerror = function(result){
			console.log(result.data);
		};

		client.onclose = function(result){

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
			NCJ.log("解析参数,type:"+type+",value:"+argObject);
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
	judgeMethodReturnType : function(client,ret){
	  	NCJ.log("检测返回值类型,返回值为:"+ret+",Client:"+client+",typeof:"+(typeof ret));
		if( ret === "nr" ){
			client.send("nr");
			return;
		}
		if( ret === "nm" ){
			client.send("nm");
			return;
		}

		if( typeof ret === "string" ){
			client.send(ret);
			return;
		}

		if( typeof ret === "number" || typeof ret === "boolean"){
			client.send(ret.toString());
			return;
		}

		if( typeof ret === "object" ){
			client.send(JSON.stringify(ret));
			return;
		}

		if( typeof ret === "function" ){
			ret = ret();
			NCJ.judgeMethodReturnType(client,ret);
		}
	},
	log : function(msg){
		if( NCJ.arg.debug ){
		    console.log(msg);
		}
	},
	NCJMethods : {}
};

module.exports = NCJ ;