var exec = require('cordova/exec');

var NCJ = {
	arg : {
		port : 12345 ,
		debug : false 
	},
	init : function(arg,success,error){
		NCJ.arg.port = arg.port || 12345 ;
		NCJ.arg.debug = arg.debug || false ; 
		exec(success, error, "NativeCallJS", "init", [arg]);
	},
	shutdown : function(success,error){
		exec(success, error, "NativeCallJS", "shutdown", []);	
	},
	openClient : function(){
		var client = new WebSocket("ws://localhost:" + NCJ.arg.port);

		client.onopen = function(result){

		};

		client.onmessage = function(result){
			var ret = NCJ.executeLocalMethod(result.data);
			NCJ.judgeMethodReturnType(client.ret);
		};

		client.onerror = function(result){
			console.log(result.data);
		};

		client.onclose = function(result){

		}
	},
	executeLocalMethod : function(methodName){
		if( NCJ.isMethodExists(methodName) ){
			var result = window.NCJMethods[methodName];
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
		if( window.NCJMethods ){
			if( window.NCJMethods[methodName] ){
				return true;
			}
		}
		return false;
	},
	judgeMethodReturnType : function(client,ret){
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
	}
};

module.exports = NCJ ;
