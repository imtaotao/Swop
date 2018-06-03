"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function warn(handle_error, error_text, is_warn) {
    if (is_warn === void 0) { is_warn = false; }
    var message = error_text + " --- from Swop.js";
    try {
        throw Error(message);
    }
    catch (err) {
        send_warn(err, handle_error, is_warn);
    }
}
exports.warn = warn;
function send_warn(_a, handle_error, is_warn) {
    var message = _a.message, stack = _a.stack;
    var _stack = get_error_stack(stack);
    var space = '\u0020'.repeat(4);
    var err_str = message + "\n\n";
    for (var _i = 0, _stack_1 = _stack; _i < _stack_1.length; _i++) {
        var _b = _stack_1[_i], method = _b.method, detail = _b.detail;
        err_str += space + "[" + method + "] ---> " + detail + "\n";
    }
    if (handle_error && handle_error(message, _stack, err_str) !== false) {
        return;
    }
    if (!is_warn) {
        throw err_str;
    }
    console.warn(err_str);
}
function get_error_stack(stack_msg) {
    var arr = stack_msg.replace(/↵/g, '\n').split('\n');
    var stack = [];
    for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
        var e = arr_1[_i];
        if (!e || e.slice(0, 5) === 'Error') {
            continue;
        }
        stack.push(get_match(e, ~e.indexOf('at')));
    }
    return stack;
}
function get_match(info, is_chorme) {
    var match = is_chorme
        ? /\s*at\s(([^\s]+)(\s\())?([^\(\)]+)\)?/g.exec(info)
        : /((.+)@)?(.+)\n?/g.exec(info);
    if (!match) {
        return { method: 'native error', detail: info };
    }
    return {
        method: match[2] || 'anonymous',
        detail: match[is_chorme ? 4 : 3],
    };
}
