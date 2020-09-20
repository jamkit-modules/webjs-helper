var module = (function() {
    var _id = "", _bridge = "";

    function _promise_callbacks(resolve, reject) {
        var unique = (Math.random() * 10000).toFixed(0)
        
        global["__resolve_" + unique] = function(result) { 
            resolve(JSON.parse(result["result"]));
    
            delete global["__resolve_" + unique];
            delete global["__reject_"  + unique];
        }
    
        global["__reject_" + unique] = function(error) { 
            reject(JSON.parse(error["error"]));
    
            delete global["__resolve_" + unique];
            delete global["__reject_"  + unique];
        }
    
        return [ "__resolve_" + unique, "__reject_" + unique ]
    }
    
    function _unfold_params(params) {
        var string = ""
    
        params.forEach(function(param) {
            if (string.length > 0) {
                string += ",";
            }
            string += JSON.stringify(param);
        });
    
        return string;
    }
    
    function _result_callback(callback_name) {
        return "function(result) {" +
            _bridge + ".postMessage(JSON.stringify({" +
                "\"script\":\"" + callback_name + "\"," +
                "\"result\":JSON.stringify(result || \"undefined\")" +
            "}))" +
        "}"
    }
    
    function _error_callback(callback_name) {
        return "function(error) {" +
            _bridge + ".postMessage(JSON.stringify({" +
                "\"script\":\"" + callback_name + "\"," +
                "\"error\":JSON.stringify(error || \"undefined\")" +
            "}))" +
        "}"
    }
    
    function _evaluate(script) {
        view.object(_id).action("evaluate", {
            "script":script
        });
    }
    
    return {
        initialize: function(id, bridge) {
            _id = id, _bridge = bridge;
        
            return this;
        },
        
        import: function(path) {
            if (Array.isArray(path)) {
                path.forEach(function(path) {
                    _evaluate(path);
                });
            } else {
                _evaluate(path);
            }
        },
        
        call: function(name, params) {
            return new Promise(function(resolve, reject) {
                var [ resolve_name, reject_name ] = _promise_callbacks(resolve, reject);
        
                _evaluate(name + "(" + 
                    (params ? _unfold_params(params) + "," : "") +
                    _result_callback(resolve_name) + "," +
                    _error_callback(reject_name) + 
                ")")
            });
        },
        
        blob: function(path, content_type) {
            return new Promise(function(resolve, reject) {
                read("/", path.substring(1)).then(function(bytes) {
                    
                })
            });
        },
    }
})();

__MODULE__ = module;
