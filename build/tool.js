function sync_promise() {
    let resolve;
    let reject;
    const _promise = new Promise((re, rj) => {
        resolve = re;
        reject = rj;
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
    return str;
}
export class Tool {
    constructor() { }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL2xpYi90b29sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWdCQTtJQUNFLElBQUksT0FBTyxDQUFBO0lBQ1gsSUFBSSxNQUFNLENBQUE7SUFFVixNQUFNLFFBQVEsR0FBa0IsSUFBSSxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7UUFDckQsT0FBTyxHQUFHLEVBQUUsQ0FBQTtRQUNaLE1BQU0sR0FBRyxFQUFFLENBQUE7SUFDYixDQUFDLENBQUMsQ0FBQTtJQUVGLE1BQU0sQ0FBQyxFQUFFLE9BQU8sRUFBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFBO0FBQzlDLENBQUM7QUFHRCxzQkFBdUIsSUFBYSxFQUFFLFVBQXlCLEVBQUUsTUFBYTtJQUM1RSxJQUFJLENBQUM7UUFDSCxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQVMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNmLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNkLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0FBQ0gsQ0FBQztBQUlELG9CQUFxQixLQUFLLEdBQUcsRUFBRTtJQUM3QixNQUFNLFNBQVMsR0FBVSxxRkFBcUYsQ0FBQztJQUMvRyxNQUFNLFNBQVMsR0FBa0IsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDMUYsSUFBSSxHQUFHLEdBQVUsRUFBRSxDQUFDO0lBRXBCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDL0IsR0FBRyxJQUFJLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxNQUFNLENBQUMsR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQVFELE1BQU07SUFDSixnQkFBZ0IsQ0FBQztJQUVWLFVBQVUsQ0FBRSxLQUFhO1FBQzlCLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQTtJQUNyQixDQUFDO0lBQUEsQ0FBQztJQUVLLFlBQVk7UUFDakIsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFFTSxZQUFZLENBQUUsSUFBUSxFQUFFLFVBQXlCLEVBQUUsTUFBYTtRQUNyRSxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDaEQsQ0FBQztDQUNGIn0=