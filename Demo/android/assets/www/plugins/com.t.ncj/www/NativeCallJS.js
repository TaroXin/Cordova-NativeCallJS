cordova.define("com.t.ncj.NativeCallJS", function(require, exports, module) {
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
		  NCJ.log("received methodName:" + result.data);
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
	executeLocalMethod : function(methodName){
		if( NCJ.isMethodExists(methodName) ){
		  NCJ.log("execute Method : " + methodName);
			var result = cordova.plugins.NCJ.NCJMethods[methodName]();
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
	isMethodExists : function(methodName){
		// window.NCJMethods[methodName] ?
    	NCJ.log("window.NCJMethods:" + window.NCJMethods);
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
});
