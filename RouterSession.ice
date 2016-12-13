#pragma once

#include <Glacier2/Session.ice>
#include <Ice/BuiltinSequences.ice>

module SGTech
{
	module AtlanticCity
	{
		module MemberCenter
		{
			struct DynamicObserverInfo
			{
				Object* observer;
				string operationName;
				int operationMode;
				Ice::ByteSeq callbackParam;
			};

			interface RouterSession extends Glacier2::Session
			{
				idempotent int GetMemberId();

				idempotent string GetWebSessionId();

				idempotent string GetDeviceId();

				idempotent string GetPlatform();

				idempotent void GetSessionInfomation(out int memberId, out long presenceSessionId, out string webSessionId);

				idempotent void AddDynamicObserver(string observerId, DynamicObserverInfo observerInfo);

				idempotent void RemoveDynamicObserver(string observerId);
			};
		};
	};
};