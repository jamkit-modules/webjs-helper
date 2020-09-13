WebJSHelper = (function() {
    return {
        _id: "", _bridge: ""
    }
})();

WebJSHelper.initialize = function(id, bridge) {
    this._id = id, this._bridge = bridge;

    return this;
}

WebJSHelper.import = function(path) {
    if (Array.isArray(path)) {
        path.forEach(function(path) {
            this._evaluate(path);
        });
    } else {
        this._evaluate(path);
    }
}

WebJSHelper.call = function(name, params) {
    var self = this;

    return new Promise(function(resolve, reject) {
        var [ resolve_name, reject_name ] = self._promise_callbacks(resolve, reject);

        self._evaluate(name + "(" + 
            (params ? self._unfold_params(params) + "," : "") +
            self._result_callback(resolve_name) + "," +
            self._error_callback(reject_name) + 
        ")")
    });
}

WebJSHelper.blob = function(path, content_type) {
    return new Promise(function(resolve, reject) {
        read("/", path.substring(1)).then(function(bytes) {
            
        })
    });
}

WebJSHelper._promise_callbacks = function(resolve, reject) {
    var unique = (Math.random() * 10000).toFixed(0)
    var self = this;

    this["resolve" + unique] = function(result) { 
        resolve(JSON.parse(result["result"]));

        delete self["resolve" + unique];
        delete self["reject"  + unique];
    }

    this["reject" + unique] = function(error) { 
        reject(JSON.parse(error["error"]));

        delete self["resolve" + unique];
        delete self["reject"  + unique];
    }

    return ["resolve" + unique, "reject" + unique]
}

WebJSHelper._unfold_params = function(params) {
    var string = ""

    params.forEach(function(param) {
        if (string.length > 0) {
            string += ",";
        }
        string += JSON.stringify(param);
    });

    return string;
}

WebJSHelper._result_callback = function(callback_name) {
    return "function(result) {" +
        this._bridge + ".postMessage(JSON.stringify({" +
            "\"script\":\"WebJSHelper." + callback_name + "\"," +
            "\"result\":JSON.stringify(result || \"undefined\")" +
        "}))" +
    "}"
}

WebJSHelper._error_callback = function(callback_name) {
    return "function(error) {" +
        this._bridge + ".postMessage(JSON.stringify({" +
            "\"script\":\"WebJSHelper." + callback_name + "\"," +
            "\"error\":JSON.stringify(error || \"undefined\")" +
        "}))" +
    "}"
}

WebJSHelper._evaluate = function(script) {
    view.object(this._id).action("evaluate", {
        "script":script
    });
}

__MODULE__ = WebJSHelper;
