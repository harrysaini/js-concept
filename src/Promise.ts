import { createHmac } from "crypto";

type states = 'PENDING' | 'RESOLVED' | 'REJECTED';

type thenHandlers = (val: any) => any;
type catchHandlers = (err: any) => any;

const defaultRejectFunction = (err: any) => {
    throw err;
}

const defaultResolveFunction = (val: any) => {
    return val;
}

export class MyPromise<T> {
    private state: states;
    private value: T | undefined = undefined;
    private error: any;
    private thenFunctionsCallbacks: thenHandlers[] = [];
    private catchFunctionsCallbacks: catchHandlers[] = [];

    constructor(callback: (resolve: (val: T) => void, reject: (err: any) => void) => void) {
        this.state = 'PENDING';
        callback(this._resolve, this._reject);
    }

    static resolve(val: any) {
        const p = new MyPromise((resolve) => {
            resolve(val);
        });
        return p;
    }

    static reject(val: any) {
        const p = new MyPromise((resolve, reject) => {
            reject(val);
        });
        return p;
    }

    private _resolve = (value: T)  => {
        setImmediate(() => {
            if (this.state !== 'PENDING') {
                return;
            }
            this.value = value;
            this.state = 'RESOLVED';
            this.thenFunctionsCallbacks.forEach((callback) => {
                callback(this.value);
            });
        });
    }

    private _reject = (err: any) => {
        setImmediate(() => {
            if (this.state !== 'PENDING') {
                return;
            }
            this.error = err;
            this.state = 'REJECTED';
            this.catchFunctionsCallbacks.forEach((callback) => {
                callback(this.value);
            });
        });
    }

    private handlerFunctionReturnOperation(returnVal: any, resolve: thenHandlers, reject: catchHandlers) {
        if (returnVal.constructor === MyPromise) {
            returnVal.then(resolve, reject);
        } else {
            resolve(returnVal);
        }
    }

    public then(resolveFunction: thenHandlers = defaultResolveFunction, rejectFunction: catchHandlers = defaultRejectFunction) {
        return new MyPromise((resolve, reject) => {

            const handleResolveFunction = () => {
                try {
                    const returnVal = resolveFunction(this.value);
                    this.handlerFunctionReturnOperation(returnVal, resolve, reject);
                } catch (err) {
                    reject(err);
                }
            }

            const handleRejectFunction = () => {
                try {
                    const returnVal = rejectFunction(this.error);
                    this.handlerFunctionReturnOperation(returnVal, resolve, reject);
                } catch (err) {
                    reject(err);
                }
            }


            if (this.state === 'PENDING') {
                this.thenFunctionsCallbacks.push(handleResolveFunction);
                this.catchFunctionsCallbacks.push(handleRejectFunction);
            } else if (this.state === 'RESOLVED') {
                handleResolveFunction();
            } else if (this.state === 'REJECTED') {
                handleRejectFunction();
            }
        });
    }

    public catch(rejectFunction: (err: any) => any) {
        return this.then(undefined, rejectFunction);
    }
}