"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ava_1 = require("ava");
var build_1 = require("../../build");
ava_1.default('Test call method one.', function (t) {
    t.plan(2);
    var s = new build_1.Swop();
    var data = { name: 'test1', count: 1 };
    s.send = function (name, send_data) {
        t.is(name, 'one');
        t.is(send_data.origin_data, JSON.stringify(data));
        s.response(JSON.stringify({
            id: get_ids(s, 'one')[0],
            origin_data: {
                name: 'response'
            }
        }));
    };
    s.call('one', JSON.stringify(data))
        .then(function (_a) {
        var data = _a[0], args = _a[1];
        t.is(data, JSON.stringify({ name: 'response' }));
    });
});
function get_ids(s, name) {
    return s.get_funs(name).map(function (val) { return val.id; });
}
