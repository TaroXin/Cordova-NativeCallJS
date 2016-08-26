# Cordova-NativeCallJS

NativeCallJS是一个Cordova插件，支持最低版本是Cordova3.0，作用于Android平台，借助WebSocket实现，JavaWebSocket源码支持 : [https://github.com/TooTallNate/Java-WebSocket](https://github.com/TooTallNate/Java-WebSocket)

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

	未完待续...