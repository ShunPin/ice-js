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
			const string    ResultCode_ServerInternalException = "101";		// Server內部發生例外狀況
		};

	};
};