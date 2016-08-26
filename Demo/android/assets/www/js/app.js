// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        if(window.cordova && window.cordova.plugins.Keyboard) {
          // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
          // for form inputs)
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

          // Don't remove this line unless you know what you are doing. It stops the viewport
          // from snapping when text inputs are focused. Ionic handles this internally for
          // a much nicer keyboard experience.
          cordova.plugins.Keyboard.disableScroll(true);
        }
        if(window.StatusBar) {
          StatusBar.styleDefault();
        }
        if( cordova.plugins.NCJ ){
            cordova.plugins.NCJ.init(
                {
                    debug:true
                },
                function(data){
                    console.log("NCJ初始化成功");
                },
                function(ex){
                    console.log("NCJ初始化失败:"+ex);
                }
            );
        }


        /**
         *  绑定JavaScript事件
         *  此代码可以放在任何一个可以访问到cordova.plugins.NCJ的地方执行
         */
        cordova.plugins.NCJ.NCJMethods.firstNCJFunction = function(){
            alert("This is Native call JavaScript Function !");
            return function(){
                return {
                    type:"object",
                    value:"可以是任何返回值,返回值为Function则自动执行!"
                };
            };
        }
    });
})
