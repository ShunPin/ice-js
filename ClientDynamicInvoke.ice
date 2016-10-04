#pragma once

#include <RouterSession.ice>

module SGTech
{
	module AtlanticCity
	{
		module ClientFacade
		{
			interface Callbackable
			{
				void Invoke(string method, string input);
			};

			["amd"]
			interface Invokable
			{
				string Invoke(string method, string input, MemberCenter::RouterSession *session, out string result);

				void InvokeNoReply(string method, string input, MemberCenter::RouterSession *session, out string result);

				void AddCallback(Callbackable *callback, MemberCenter::RouterSession *session, out string result);

				void RemoveCallback(Callbackable *callback, MemberCenter::RouterSession *session, out string result);
			};
		};
		
	};
};