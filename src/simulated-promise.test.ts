import SimulatedPromise from "./simulated-promise";

it("Looks like a promise", () => {
  const simulatedPromise = new SimulatedPromise();
  const normalPromise = new Promise(() => ({}));

  expect(typeof simulatedPromise).toBe(typeof normalPromise);
});
it("Resolves like a promise", () =>
  new Promise((resolve, reject) => {
    let resolved = false;
    let rejected = false;
    const myArg = {};
    const myPromise = new SimulatedPromise();

    setTimeout(() => {
      myPromise.then<void, void>(
        arg => {
          expect(arg).toBe(myArg);
          resolved = true;
        },
        () => {
          rejected = true;
        }
      );
      expect(resolved).toBe(false);
      expect(rejected).toBe(false);
      myPromise.trigger.resolve(myArg);
      setTimeout(() => {
        expect(resolved).toBe(true);
        expect(rejected).toBe(false);
        resolve();
      }, 0);
    }, 0);
  }));

it("Rejects like a promise", () =>
  new Promise((resolve, reject) => {
    let resolved = false;
    let rejected = false;
    const myArg = {};
    const myPromise = new SimulatedPromise();

    setTimeout(() => {
      myPromise.then<void, void>(
        ({}) => {
          resolved = true;
        },
        arg => {
          expect(arg).toBe(myArg);
          rejected = true;
        }
      );
      expect(resolved).toBe(false);
      expect(rejected).toBe(false);
      myPromise.trigger.reject(myArg);
      setTimeout(() => {
        expect(resolved).toBe(false);
        expect(rejected).toBe(true);
        resolve();
      }, 0);
    }, 0);
  }));

it("resolves can be awaited", async () => {
  let resolved = false;
  let rejected = false;
  const myArg = {};
  const myPromise = new SimulatedPromise();

  myPromise.then<void, void>(
    arg => {
      expect(arg).toBe(myArg);
      resolved = true;
    },
    arg => {
      rejected = true;
    }
  );
  expect(resolved).toBe(false);
  expect(rejected).toBe(false);
  await myPromise.trigger.resolve(myArg);
  expect(resolved).toBe(true);
  expect(rejected).toBe(false);
});

it("rejects can be awaited", async () => {
  let resolved = false;
  let rejected = false;
  const myArg = {};
  const myPromise = new SimulatedPromise();

  myPromise.then<void, void>(
    ({}) => {
      resolved = true;
    },
    arg => {
      expect(arg).toBe(myArg);
      rejected = true;
    }
  );
  expect(resolved).toBe(false);
  expect(rejected).toBe(false);
  await myPromise.trigger.reject(myArg);
  expect(resolved).toBe(false);
  expect(rejected).toBe(true);
});

it("chaining works in promise", async () => {
  const scenario = async myPromise => {
    let resolved = false;
    let rejected = false;

    const createdPromise = myPromise
      .then(() => true, () => false)
      .then(() => true, () => false)
      .then(
        () => {
          resolved = true;
        },
        () => {
          rejected = true;
        }
      );
    expect(resolved).toBe(false);
    expect(rejected).toBe(false);
    await createdPromise;
    expect(rejected).toBe(false);
    expect(resolved).toBe(true);
  };
  // await scenario(Promise.resolve());
  const simPromise = new SimulatedPromise();
  const myScenario = scenario(simPromise);
  await simPromise.trigger.resolve();
  await myScenario;
});
