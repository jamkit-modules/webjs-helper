WebJSHelper = (function() {
    return {
        __id: "", __bridge: ""
    }
})();

WebJSHelper.initialize = function(id, bridge) {
    WebJSHelper.__id = id;
    WebJSHelper.__bridge = bridge;

    return WebJSHelper;
}

WebJSHelper.import = function(path) {
    if (Array.isArray(path)) {
        path.forEach(function(path) {
            WebJSHelper.__evaluate(path);
        });
    } else {
        WebJSHelper.__evaluate(path);
    }
}

WebJSHelper.call = function(name, params) {
    return new Promise(function(resolve, reject) {
        var [ resolve_name, reject_name ] = WebJSHelper.__promise_callbacks(resolve, reject);

        WebJSHelper.__evaluate(name + "(" + 
            (params ? WebJSHelper.__unfold_params(params) + "," : "") +
            WebJSHelper.__result_callback(resolve_name) + "," +
            WebJSHelper.__error_callback(reject_name) + 
        ")")
    });
}

WebJSHelper.__promise_callbacks = function(resolve, reject) {
    var unique = (Math.random() * 10000).toFixed(0)

    WebJSHelper["resolve" + unique] = function(result) { 
        resolve(JSON.parse(result["result"]));

        delete WebJSHelper["resolve" + unique];
        delete WebJSHelper["reject"  + unique];
    }

    WebJSHelper["reject" + unique] = function(error) { 
        reject(JSON.parse(error["error"]));

        delete WebJSHelper["resolve" + unique];
        delete WebJSHelper["reject"  + unique];
    }

    return ["resolve" + unique, "reject" + unique]
}

WebJSHelper.__unfold_params = function(params) {
    var string = ""

    params.forEach(function(param) {
        if (string.length > 0) {
            string += ",";
        }
        string += JSON.stringify(param);
    });

    return string;
}

WebJSHelper.__result_callback = function(callback_name) {
    return "function(result) {" +
        WebJSHelper.__bridge + ".postMessage(JSON.stringify({" +
            "\"script\":\"WebJSHelper." + callback_name + "\"," +
            "\"result\":JSON.stringify(result || \"undefined\")" +
        "}))" +
    "}"
}

WebJSHelper.__error_callback = function(callback_name) {
    return "function(error) {" +
        WebJSHelper.__bridge + ".postMessage(JSON.stringify({" +
            "\"script\":\"WebJSHelper." + callback_name + "\"," +
            "\"error\":JSON.stringify(error || \"undefined\")" +
        "}))" +
    "}"
}

WebJSHelper.__evaluate = function(script) {
    view.object(WebJSHelper.__id).action("evaluate", {
        "script":script
    });
}

__MODULE__ = WebJSHelper;