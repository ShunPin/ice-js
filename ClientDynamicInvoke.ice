

收到 callback::Invoke
public void Invoke(String method, String input, Current __current)
		{
			LogHelper.d(TAG, "receive: [" + method + ", " + input + "]");

			mService.receive(mProxyName, method, input);
		}

synchronized public void receive(String proxy_name, String method, String input)
	{
		sendToCocos(proxy_name, method, ResultHelper.getString(ResultCode_Success.value), input);
	}


Invoke 成功
public void response(String response, String result)
		{
			LogHelper.d(TAG, "receive: [" + proxy_name + ", " + method + ", " + response + "], result: " + result);

			mService.response(proxy_name, method, result, response);
		}

synchronized public void response(String proxy_name, String method, String result, String input)
	{
		sendToCocos(proxy_name, method, result, input);
	}


"TypeError: element.toSource is not a function
    at http://localhost:3000/AtlanticCity/src/framework/utils/flag_ctrl.js:77:42
    at Array.forEach (native)
    at Class.<anonymous> (http://localhost:3000/AtlanticCity/src/framework/utils/flag_ctrl.js:55:13)
    at Class._successEvent (http://localhost:3000/AtlanticCity/src/platform/ice/ice_command_with_wait_circle.js:51:14)
    at Class.listener (http://localhost:3000/AtlanticCity/frameworks/cocos2d-html5/cocos2d/core/event-manager/CCEventListener.js:285:29)
    at _onListenerCallback (http://localhost:3000/AtlanticCity/frameworks/cocos2d-html5/cocos2d/core/event-manager/CCEventManager.js:983:18)
    at Object._dispatchEventToListeners (http://localhost:3000/AtlanticCity/frameworks/cocos2d-html5/cocos2d/core/event-manager/CCEventManager.js:601:107)
    at Object.dispatchEvent (http://localhost:3000/AtlanticCity/frameworks/cocos2d-html5/cocos2d/core/event-manager/CCEventManager.js:975:18)
    at Object.dispatchCustomEvent (http://localhost:3000/AtlanticCity/frameworks/cocos2d-html5/cocos2d/core/event-manager/CCEventManager.js:995:14)
    at Object.sgt.platform.ice._onResponse (http://localhost:3000/AtlanticCity/src/platform/ice/proxy.js:151:25)"
	