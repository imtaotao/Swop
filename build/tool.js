function sync_promise() {
    let resolve;
    let reject;
    const _promise = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });
    return { promise: _promise, resolve, reject };
}
function convert_json(data, identifier, reject) {
    try {
        return (JSON[identifier])(data);
    }
    catch (error) {
        reject(error);
        return data;
    }
}
function random_str(range = 16) {
    const chart_str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIGKMLNOPQRSTUVWSYZ_!~@#$%^&*()+=-><,.?/';
    const randomNum = () => parseInt(String(Math.random() * chart_str.length));
    let str = '';
    for (let i = 0; i < range; i++) {
        str += chart_str[randomNum()];
    }
    return str + '_:_swopid';
}
export class Tool {
    random_str(range) {
        return random_str();
    }
    ;
    sync_promise() {
        return sync_promise();
    }
    convert_json(data, identifier, reject) {
        return convert_json(data, identifier, reject);
    }
}
export function warn(error_text, is_warn = false) {
    const message = `${error_text} --- from Swop.js.`;
    if (!is_warn) {
        throw Error(message);
    }
    ;
    console.warn(message);
}
