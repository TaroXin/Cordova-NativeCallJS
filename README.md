
# Cordova-NativeCallJS

NativeCallJS是一个Cordova插件，支持最低版本是Cordova3.0，作用于Android平台，借助WebSocket实现，JavaWebSocket源码支持 : [https://github.com/TooTallNate/Java-WebSocket](https://github.com/TooTallNate/Java-WebSocket)

由于Demo程序太大,笔者又没有VPN,一直卡着上传不上来，笔者将Demo打包放在CSDN,想要的小伙伴直接去下载就OK了

[NativeCallJS Demo 下载地址](http://download.csdn.net/detail/yangjizhao/9614307)

##主要功能

按照NativeCallJS的规定初始化插件和方法，就可以在Android原生代码中直接调用JavaScript的代码并获得返回值

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

- 关于返回值

	在已经定义的 JavaScript 方法中可以返回包括 undefined ，string ，number ，boolean ，object ，function 的任何一种类型
	
	但是在Native代码中这些类型都被转换为了String类型，当然可以通过强制转换来将String类型转换为你所需要的类型，这一步就交给你们来做了。

	undefined类型在返回到Native代码时候会返回 "nr" 字符串 ，代表没有返回值，不予处理即可

	如果你的返回类型为function，那么插件会帮你执行这个function,直到返回的类型不再是function为止	

##Bug反馈

	如果你在使用途中出现了无法解决或者可以解决的Bug,可以联系我
	
	无法解决的Bug,我会尽力处理，可以解决的Bug可以告诉我，我方便更新插件，万分感激
	
	Email : 15029353778@163.com
	QQ : 870557482 

	


