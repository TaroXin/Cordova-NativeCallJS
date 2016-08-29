
# Cordova-NativeCallJS

NativeCallJS是一个Cordova插件，支持最低版本是Cordova3.0，作用于Android平台，借助WebSocket实现，JavaWebSocket源码支持 : [https://github.com/TooTallNate/Java-WebSocket](https://github.com/TooTallNate/Java-WebSocket)

由于Demo程序太大,笔者又没有VPN,一直卡着上传不上来，笔者将Demo打包放在CSDN,想要的小伙伴直接去下载就OK了

[NativeCallJS Demo 下载地址](http://download.csdn.net/detail/yangjizhao/9614707)

##主要功能

参照NativeCallJS中给出的规定初始化插件和方法，实现JavaScript与Android Native方法之间的相互主动调用

JavaScript调用Native方法则可以向Native方法传递相应的参数，并获得Native方法的返回值

Native方法调用JavaScript方法，则可以向JavaScript方法传递相应的参数，并且获得JavaScript方法的返回值

两者之间调用较为方便

##搭建插件环境

首先你的机器上需要Cordova的环境

- 添加android平台

	

		cordova platform add android
	

- 添加plugin
  
	你可以使用我在github的地址，也可以下载代码到本地
	
	
		
		cordova plugin add https://github.com/15029352778/Cordova-NativeCallJS.git
		
		// or
		
		cordova plugin add 你的本地地址

	
- 添加JavaWebSocket支持
	
	你可以下载我项目中的Java-webscoket-1.3.1.jar并添加到你的项目中即可


##使用方法
	
添加插件环境完成之后，就可以在Cordova的项目中使用了

- 初始化插件
	
		/**
		 * 初始化方法需要三个参数
		 * 第一个为 JSON 形式的 arg
		 * arg中有 port 和 debug 两个属性
		 * port默认值为 12345
		 * debug默认值为false
		 * 第二个参数为 成功 回执函数
		 * 第三个参数为 失败 回执函数
		 * 如果初始化失败,请检查是否端口冲突，并修改端口 
		*/
		cordova.plugins.NCJ.init(
			{
				port:12345,
				debug:true
			},
			function(data){
				//初始化成功函数
			},
			function(ex){
				//初始化失败函数
			}
		);

- 绑定JavaScript方法

	如果需要在 Native 代码中调用 JavaScript的代码，那么就需要将被调用的方法绑定在NCJ插件的全局对象NCJMethods上，绑定方法的代码可以在任何一个可以访问到cordova全局变量的位置进行，但是必须要在 Native 调用之前执行 ，否则会抛出异常

	绑定函数的代码如下 ：
		
		cordova.plugins.NCJ.NCJMethods.testFunction = function(){
	        alert("This is testFunction !");
	        return ["Taro","Andy","Lily"];
	    }

	这样在 Native 代码中就有了一个可以调用的JavaScript方法 testFunction

- Native 调用 JavaScript 已经定义好的方法

	如上如果已经绑定了JavaScript方法，就可以在Native代码中调用以下的代码段，以testFunction函数为例 :
		
		NativeCallJS.call("testFunction", new NCJEventCallback() {
            @Override
            public void back(final String result) {
               	// result 则为 testFunction 函数返回的值
            }
        });

- Native 调用 JavaScript 并且传递需要的参数

	首先需要定义含参数的JavaScript方法
	
		cordova.plugins.NCJ.NCJMethods.firstNCJFunction = function(data,flag,i,f,json){
            alert("This is Native call JavaScript Function !arg:"+data+",flag:"+
                    flag+",int:"+i+",f:"+f+",json.test:"+json.test);
            return function(){
                return {
                    type:"object",
                    value:"可以是任何返回值,返回值为Function则自动执行!"
                };
            };
        }
	
	接着在Native代码中调用已经定义好的 firstNCJFunction 函数 并传递相应的参数
	
		JSONObject testJson = new JSONObject();
        testJson.put("test","This is json type");
        Object[] args = new Object[]{"testXXX!",true,1,1.2,testJson};
        NativeCallJS.call("firstNCJFunction", args, new NCJEventCallback() {
            @Override
            public void back(String result) {
                try {
                    JSONObject json = new JSONObject(result);
                    String type = json.getString("type");
                    String value = json.getString("value");
                } catch (JSONException e) {
                  e.printStackTrace();
                }
            }
        });

- 关于 Native 向 JavaScript 传参时的参数类型

	在Native代码中调用JavaScript方法时，可以向JavaScript代码传递相应的参数，参数分为 String , int , double , float , boolean , Object 六种类型
	
	在传递至JavaScript函数中时，String会被转换为string类型，int会转换为int类型，double与float会被转换为float类型，boolean会被转换为boolean类型，Object会被转换为 JavaScript 对象类型 ， 也就是Json ，前提是Native中传递的Object对象可以被JSONObject或者JSONArray序列化

- 关于JavaScript函数返回值

	在已经定义的 JavaScript 方法中可以返回包括 undefined ，string ，number ，boolean ，object ，function 的任何一种类型
	
	但是在Native代码中这些类型都被转换为了String类型，当然可以通过强制转换来将String类型转换为你所需要的类型，这一步就交给你们来做了。

	undefined类型在返回到Native代码时候会返回 "nr" 字符串 ，代表没有返回值，不予处理即可

	如果你的返回类型为function，那么插件会帮你执行这个function,直到返回的类型不再是function为止

- 绑定Native方法
	
	在Android Native代码中绑定Native方法时，需注意，Native方法可以在任何一个可执行类中声明，<span style = 'color:red'>Native方法的方法名必须以 onJCN 开头，且不支持重载	</span>
	
	首先需定义一个Native方法
		
		public String onJCNTest(String data,boolean flag,int i,float f,JSONArray a) throws JSONException {
	        Log.i(TAG,"This is onJCNTest!");
	        showMessage(data);
	        showMessage(String.valueOf(flag));
	        showMessage(String.valueOf(i));
	        showMessage(String.valueOf(f));
	        showMessage(a.get(0) + "-" + a.get(1));
	        return "This is result";
	    }
	
	接着在定义方法的类的构造方法或者初始化方法中注册Native方法

		NativeCallJS.registerNative(this);
	
	或者在此类结束时反注册Native方法
		
		NativeCallJS.unregisterNative(this);
	
	注册方法接收的参数为Object类型,也就是说你可以在Android的Activity，Fragment等中进行注册Native方法，也可以在Java的普通类中进行注册，但是建议将 unregisterNative 方法放在本类即将结束的位置

- JavaScript调用Native方法
	
	在JavaScript中任何一处可以访问到 cordova.plugins.NCJ 的位置就可以调用Native方法病传递相应的参数
		
		// function 则为调用成功时的回执 data为Native方法的返回值
		cordova.plugins.NCJ.callNative("onJCNTest",["This is Data",true,1,1.2,["jsona","jsonb"]],function(data){
            alert(data);
            alert(typeof data);
        });

- 关于JavaScript调用Native方法时传参的类型
	
	JavaScript调用Native方法时，传参的类型含 string, int, float, boolean , object 六种类型,其中 string会被转换为String，int会被转换为int,float会被转换为float,boolean会被转换为boolean,object会被转换为JSONArray或者JSONObject

- 关于Native方法的返回值

	在调用Native方法时，JavaScript可以获得Native方法的返回值，返回值类型包括 String, int, double , float , boolean , Object 在返回至JavaScript方法时也会被转换为相应的类型，前提是你的Object是属于JSONArray或者JSONObject或者任何一个可以被JSONArray或者JSONObject序列化的对象

##Bug反馈

	如果你在使用途中出现了无法解决或者可以解决的Bug,可以联系我
	
	无法解决的Bug,我会尽力处理，可以解决的Bug可以告诉我，我方便更新插件，万分感激
	
	Email : 15029353778@163.com
	QQ : 870557482 

	


