// **********************************************************************
//
// Copyright (c) 2003-2016 ZeroC, Inc. All rights reserved.
//
// This copy of Ice is licensed to you under the terms described in the
// ICE_LICENSE file included in this distribution.
//
// **********************************************************************
//
// Ice version 3.6.2
//
// <auto-generated>
//
// Generated from file `ClientDynamicInvoke.ice'
//
// Warning: do not edit this file.
//
// </auto-generated>
//

(function(module, require, exports)
{
    var Ice = require("ice").Ice;
    var __M = Ice.__M;
    var SGTech = require("RouterSession").SGTech;
    var Slice = Ice.Slice;

    SGTech.AtlanticCity = __M.module("SGTech.AtlanticCity");

    SGTech.AtlanticCity.ClientFacade = __M.module("SGTech.AtlanticCity.ClientFacade");

    SGTech.AtlanticCity.ClientFacade.Callbackable = Slice.defineObject(
        undefined,
        Ice.Object, undefined, 1,
        [
            "::Ice::Object",
            "::SGTech::AtlanticCity::ClientFacade::Callbackable"
        ],
        -1, undefined, undefined, false);

    SGTech.AtlanticCity.ClientFacade.CallbackablePrx = Slice.defineProxy(Ice.ObjectPrx, SGTech.AtlanticCity.ClientFacade.Callbackable.ice_staticId, undefined);

    Slice.defineOperations(SGTech.AtlanticCity.ClientFacade.Callbackable, SGTech.AtlanticCity.ClientFacade.CallbackablePrx,
    {
        "Invoke": [, , , , , , [[7], [7]], , , , ]
    });

    SGTech.AtlanticCity.ClientFacade.Invokable = Slice.defineObject(
        undefined,
        Ice.Object, undefined, 1,
        [
            "::Ice::Object",
            "::SGTech::AtlanticCity::ClientFacade::Invokable"
        ],
        -1, undefined, undefined, false);

    SGTech.AtlanticCity.ClientFacade.InvokablePrx = Slice.defineProxy(Ice.ObjectPrx, SGTech.AtlanticCity.ClientFacade.Invokable.ice_staticId, undefined);

    Slice.defineOperations(SGTech.AtlanticCity.ClientFacade.Invokable, SGTech.AtlanticCity.ClientFacade.InvokablePrx,
    {
        "Invoke": [, , , 1, , [7], [[7], [7], ["SGTech.AtlanticCity.MemberCenter.RouterSessionPrx"]], [[7]], , , ],
        "InvokeNoReply": [, , , 1, , , [[7], [7], ["SGTech.AtlanticCity.MemberCenter.RouterSessionPrx"]], [[7]], , , ],
        "AddCallback": [, , , 1, , , [["SGTech.AtlanticCity.ClientFacade.CallbackablePrx"], ["SGTech.AtlanticCity.MemberCenter.RouterSessionPrx"]], [[7]], , , ],
        "RemoveCallback": [, , , 1, , , [["SGTech.AtlanticCity.ClientFacade.CallbackablePrx"], ["SGTech.AtlanticCity.MemberCenter.RouterSessionPrx"]], [[7]], , , ]
    });
    exports.SGTech = SGTech;
}
(typeof(global) !== "undefined" && typeof(global.process) !== "undefined" ? module : undefined,
 typeof(global) !== "undefined" && typeof(global.process) !== "undefined" ? require : this.Ice.__require,
 typeof(global) !== "undefined" && typeof(global.process) !== "undefined" ? exports : this));
