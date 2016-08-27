package com.t.ncj.core;

import android.util.Log;

import com.t.ncj.core.callback.NCJEventCallback;
import com.t.ncj.core.server.NCJServer;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.java_websocket.WebSocketImpl;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by Taro on 2016/8/26.
 */
public class NativeCallJS extends CordovaPlugin {

    private static final String TAG = NativeCallJS.class.getSimpleName();
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
            } catch (Exception e) {
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
        NativeCallJS.call(methodName,null,callback);
    }

    public static void call(String methodName , Object[] args , NCJEventCallback callback){
        String argsString = null ;
        //无参数
        if( args == null || args.length == 0 ){
            argsString = null ;
        }else{
            argsString = NativeCallJS.convertArgs(args);
        }
        if( server != null){
            server.sendToClient(methodName,argsString,callback);
        }else{
            Log.e(TAG,"NativeCallJS 插件未初始化,请检查是否调用NCJ.init函数!");
        }
    }

    private static String convertArgs(Object[] args){
        JSONArray argsRoot = new JSONArray();
        if( WebSocketImpl.DEBUG ) Log.i(TAG,"Args length:"+args.length);
        for( Object o : args ){
            JSONObject argsItem = new JSONObject();
            String type = "";
            Object value = o;

            if( o instanceof String){
                type = "string";
            }else if( o instanceof Integer ){
                type = "int";
            }else if( o instanceof Double || o instanceof Float ){
                type = "float";
            }else if( o instanceof Boolean ){
                type = "boolean";
            }else if( o instanceof JSONArray || o instanceof JSONObject ){
                type = "object";
            }else{
                type = "unknown";
            }

            try {
                argsItem.put("type",type);
                argsItem.put("value",value);
            } catch (JSONException e) {
                e.printStackTrace();
                Log.e(TAG,"convert args exception :" + e.getMessage());
            }
            argsRoot.put(argsItem);
        }

        return argsRoot.toString();
    }
}
