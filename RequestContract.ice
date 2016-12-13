#pragma once

module SGTech
{
	module AtlanticCity
	{
		module RequestContract
		{
			/**
			 * Request Context
			 **/
			const string    Context_DeviceId = "deviceId";			// 裝置識別碼
			const string    Context_Platform = "platform";			// 玩家平台
			const string    Context_Product = "product";			// 產品類型
			const string    Context_Language = "language";			// 語言
			const string    Context_RequestUUID = "requestUuid";	// 請求唯一碼
			const string    Context_WebSessionId = "webSessionId";	// Web Session ID
			const string    Context_MemberId = "memberId";			// 會員 ID

			/**
			 * 統一回傳格式
			 **/
			struct RequestResult
			{
				string resultCode;			// 結果碼	(ResultCode 成功 = "OK"，其他皆為失敗)
				string resultMessage;		// 結果說明
			};

			/**
			 * 通用 ResultCode 定義
			 * 1xx => Exception
			 **/
			const string    ResultCode_Success = "OK";						// 成功.
			const string    ResultCode_UndefineError = "1";					// 未定義的錯誤.
			const string    ResultCode_CallError = "99";					// Call WebGateway發生錯誤.
			const string    ResultCode_ServerInternalException = "101";		// Server內部發生例外狀況
			const string    ResultCode_ArgumentException = "102";			// 參數帶入例外狀況

			/**
			 * 平台定義
			 **/
			const string    Platform_Android = "Android";			// Android 平台
			const string    Platform_iOS = "iOS";					// iOS 平台

            /**
             * 平台列舉
             **/
			// 平台定義的字串內容 要跟 列舉名稱一樣 (因為有用到字串轉列舉)
            enum DevicePlatform
            {
                Android = 1,
                iOS  = 2
            };

			/**
			 * 第三方帳號定易
			 **/
			const string ThirdPartyType_FB = "FB";				// Facebook

			/**
			 * 領獎錯誤代碼
			 **/
			const string ClaimError_CallError = "CallError";			// 呼叫DB失敗
			const string ClaimError_Invaild = "InvaildAwardID";			// 無此領獎編號
			const string ClaimError_AlreadyClaimed = "AlreadyClaimed";	// 已領獎
			const string ClaimError_Expired = "Expired";				// 過期
			const string ClaimError_Disabled = "Disabled";				// 已停用
		};
	};
};
