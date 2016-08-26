package com.t.ncj.core.callback;

/**
 * Created by Taro on 2016/8/26.
 */
public interface NCJEventCallback<T extends Object> {
    void back(T result);
}
