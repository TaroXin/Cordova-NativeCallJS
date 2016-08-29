package com.t.ncj.core;

import android.util.Log;

import com.ionicframework.testnativecalljsapp987676.JSCallNativeMethods;
import com.ionicframework.testnativecalljsapp987676.MainActivity;

import org.java_websocket.WebSocketImpl;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by Taro on 2016/8/27.
 */
public class JsCallNative {

    private static final String TAG = JsCallNative.class.getSimpleName();
    //本地方法集合
    public static final Map<String,NativeMethod> NATIVE_METHOD_MAP = new HashMap<String, NativeMethod>();
    //public static final JSONArray NATIVE_METHODS = new JSONArray();
    public static final String startsWith = "onJCN";

    public static void registerNative(final Object target){
        new Thread(new Runnable() {
            @Override
            public void run() {
                JsCallNative.doReflect(target);
            }
        }).start();
    }

    public static void unregisterNative(final Object target){
        Class<?> clz = target.getClass();
        Method[] clzMethods = clz.getMethods();
        for( Method m : clzMethods){
            String methodName = m.getName();
            //方法是否NCJ插件的Native方法
            if( methodName.startsWith(JsCallNative.startsWith) ){
                JsCallNative.removeNativeMethod(methodName);
            }
        }
    }

    public synchronized static <T extends Object> T executeNativeMethod(String methodName, Object... args){
          Map<String, NativeMethod> nativeMethodMap = NATIVE_METHOD_MAP;
          synchronized (nativeMethodMap){
              if( nativeMethodMap.keySet().contains(methodName) ){
                  NativeMethod nativeMethod = nativeMethodMap.get(methodName);
                  Log.i(TAG,"寻找到Native方法:"+nativeMethod.m.getName()+",execute it!");
                  try {
                      T result = (T) nativeMethod.m.invoke(nativeMethod.r,args);
                      Log.i(TAG,"执行完毕!");
                      return result;
                  } catch (IllegalAccessException e) {
                      e.printStackTrace();
                      Log.e(TAG,nativeMethod.m.getName()+"方法不是public访问权限!");
                  } catch (InvocationTargetException e) {
                      e.printStackTrace();
                      Log.e(TAG,nativeMethod.m.getName()+"方法参数列表不满足!");
                  }
              }
          }
          return null;
    }

    private static void doReflect(Object target){
      Class<?> clz = target.getClass();
      Method[] clzMethods = clz.getMethods();
        for( Method m : clzMethods){
            String methodName = m.getName();
            //方法是否NCJ插件的Native方法
            if( methodName.startsWith(JsCallNative.startsWith) ){
                JsCallNative.saveNativeMethod(m,target);
            }
        }
    }

    /**
     * [
     *    {
     *        "methodName":{
     *            "clz":clz,
     *            "returnType":returnType,
     *            "method":m,
     *            "args":[
     *                Class,Class,Class
     *            ]
     *        }
     *    }
     * ]
     * 暂不支持方法重载
     * @param m
     * @param r
     */
    private static void saveNativeMethod(Method m ,Object r){

        NativeMethod nativeMethod = new NativeMethod();
        nativeMethod.m = m ;
        nativeMethod.r = r;

        NATIVE_METHOD_MAP.put(m.getName(),nativeMethod);
        if ( WebSocketImpl.DEBUG ){
            Log.i(TAG,"Native method initialization complete,length:" + NATIVE_METHOD_MAP.size());
        }

    }

    private static void removeNativeMethod(String methodName) {

        Map<String, NativeMethod> nativeMethodMap = JsCallNative.NATIVE_METHOD_MAP;
        synchronized (nativeMethodMap){
            if( nativeMethodMap.keySet().contains(methodName) ){
                nativeMethodMap.remove(methodName);
            }
        }
    }

    /**
     *  存储Native方法的类
     */
    private static class NativeMethod {
        public Method m ;
        public Object r ;
    }

}
