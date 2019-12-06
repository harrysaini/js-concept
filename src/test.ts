import { MyPromise } from "./Promise";



const timer = (time: number, doReject?: boolean) => {
    const prom = new MyPromise((resolve, reject) => {
        if(doReject) {
            reject(`Failed ${time}`);
            return;
        }
        setTimeout(() => {
            resolve(`Passed ${time}`)
        }, time);
    });
    return prom;
}

const a = timer(10000);

a.then((val) => {
    console.log(val);
})

a.then((val) => {
    console.log(val + '1');
});

a.then((val) => {
    console.log(val + '2');
});

a.then((val) => {
    console.log(val + '3');
    return timer(5000);
}).then((val) => {
    console.log(val + 'nested');
}).then((val) => {
    console.log(val);
});


console.log(a.then(() => {}));

let rej = MyPromise.reject('a');
console.log(rej);
rej.then(() => {}, () => {
    console.log('a');
});


let newP = MyPromise.resolve('abc');

newP.then((val) => {
    console.log(`resolved 1 ${val}`)
});

newP.then((val) => {
    console.log(`resolved 2 ${val}`)
});

console.log('Should be printed first');