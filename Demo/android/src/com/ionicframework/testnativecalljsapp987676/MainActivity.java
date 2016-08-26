/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
 */

package com.ionicframework.testnativecalljsapp987676;

import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import com.t.ncj.core.NativeCallJS;
import com.t.ncj.core.callback.NCJEventCallback;

import org.apache.cordova.*;
import org.json.JSONException;
import org.json.JSONObject;

public class MainActivity extends CordovaActivity
{
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        // Set by <content src="index.html" /> in config.xml
        loadUrl(launchUrl);

        /**
         *  暂停十秒后调用JavaScript方法,并解析返回值
         *  只是为了演示效果,其实代码可以在任何地方执行
         */

        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Thread.sleep(10000);
                  Log.i("Test","2");
                    NativeCallJS.call("firstNCJFunction", new NCJEventCallback() {
                        @Override
                        public void back(String result) {
                            try {
                                JSONObject json = new JSONObject(result);
                                String type = json.getString("type");
                                showMessage("type:"+type);
                                String value = json.getString("value");
                                showMessage("value:"+value);
                            } catch (JSONException e) {
                              e.printStackTrace();
                            }
                        }
                    });
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }

    private void showMessage(final String message){
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Toast.makeText(MainActivity.this,message,Toast.LENGTH_SHORT).show();
            }
        });
    }
}
