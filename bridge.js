window.webjs = (function() {
    var _bridge = "";

    function _promise_callbacks(resolve, reject) {
        var unique = (Math.random() * 10000).toFixed(0);
        
        window["webjs__resolve_" + unique] = function(result) { 
            resolve(result);
    
            delete window["webjs__resolve_" + unique];
            delete window["webjs__reject_"  + unique];
        }
    
        window["webjs__reject_" + unique] = function(error) { 
            reject(error);
    
            delete window["webjs__resolve_" + unique];
            delete window["webjs__reject_"  + unique];
        }
    
        return [ "webjs__resolve_" + unique, "webjs__reject_" + unique ];
    }

    return {
        initialize: function(bridge, os) {
            if (os === "iOS") {
                window[bridge] = window.webkit.messageHandlers[bridge];
            }

            _bridge = bridge;
        },

        call: function(name, params) {
            return new Promise(function(resolve, reject) {
                var [ resolve_name, reject_name ] = _promise_callbacks(resolve, reject);

                window[_bridge].postMessage(JSON.stringify({
                    "script": name,
                    "params": JSON.stringify(params),
                    "resolve": resolve_name,
                    "reject": reject_name
                }));
            });
        },
    }
})();
