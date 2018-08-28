# Simulated Promise

Provides a simple API to mock a promise, intended for use in testing asynchronous code.

Created to test a complex axios adapter.

# Installation

```
npm install --save simulated-promise
```

# Usage

```
// MyFunc.js
export const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

export const myFunc = async (adapter) => {
    let result = await adapter();
    while (result === "PROCESSING") {
        await delay(1000);
        result = await adapter();
    }
    if (result == "TIMEOUT") {
        throw result;
    }
    return result;
}

// MyFunc.test.js
import {delay, myFunc} from './MyFunc'

it("when adapter is PROCESSING it waits one second between responses", () => {
    let delayPromise = new SimulatedPromise();
    let adapterPromise = new SimulatedPromise();
    const delay = jest.fn(() => {delayPromise = new SimulatedPromise(); return delayPromise;});
    const adapter = jest.fn(() => {adapterPromise = new SimulatedPromise(); return delayPromise;);

    // myFunc will now be waiting at line 18
    const myFuncPromise = myFunc(adapter);
    expect(adapter).toBeCalled();
    adapterPromise.trigger.resolve("PROCESSING");
    // Now we're waiting on line 20
    expect(delay).toBeCalled();
    delayPromise.trigger.resolve();
    // Now we're waiting on line 21
    await adapterPromise.trigger.resolve("Good")
    // Now we're complete.
    expect(adapter).toBeCalledAgain();
    expect(myFuncPromise).toBeResolved();
})
```
