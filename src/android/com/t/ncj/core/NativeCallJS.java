package com.t.ncj.core;

import com.t.ncj.core.callback.NCJEventCallback;
import com.t.ncj.core.server.NCJServer;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.java_websocket.WebSocket;
import org.java_websocket.WebSocketImpl;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.net.UnknownHostException;

/**
 * Created by Taro on 2016/8/26.
 */
public class NativeCallJS extends CordovaPlugin {

    private static NCJServer server;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

        JSONObject json = args.getJSONObject(0);
        int port = json.getInt("port");
        //是否开启DEBUG模式
        boolean debug = json.getBoolean("debug");

        //设置 NCJServer 的端口
        if( port == 0 ){
            port = 12345 ;
        }

        //初始化 NCJServer
        if( action.equals("init") ){
            try {
                WebSocketImpl.DEBUG = debug ;
                server = new NCJServer(port);
                server.start();
                callbackContext.success("SUCCESS");
            } catch (UnknownHostException e) {
                e.printStackTrace();
                callbackContext.error(e.getMessage());
            }
            return true ;
        }

        //停止 NCJServer
        if( action.equals("shutdown") ){
            if( server != null ){
                try {
                    server.stop();
                    callbackContext.success("SUCCESS");
                } catch (Exception e) {
                    e.printStackTrace();
                    callbackContext.error(e.getMessage());
                }
            }
            return true;
        }

        return false;
    }

    public static void call(String methodName , NCJEventCallback callback){
        if( server != null){
            server.sendToClient(methodName,callback);
        }
    }
}
