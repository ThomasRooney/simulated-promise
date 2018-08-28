class SimulatedPromise<T> implements Promise<T> {
  [Symbol.toStringTag]: "Promise";

  onrejected:
    | ((reason: any) => any | PromiseLike<any>)
    | null
    | undefined = undefined;
  onfulfilled?:
    | ((value: T) => any | PromiseLike<any>)
    | null
    | undefined = undefined;

  constructor(
    _?: (
      resolve: (value?: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void
    ) => void
  ) {
    // we ignore the executor ; it's irrelevant to us as we only resolve on demand..
  }

  promise?: Promise<any>;
  promiseResolve?: (value?: any | PromiseLike<any> | undefined) => void;
  promiseReject?: (reason?: any) => void;

  trigger = {
    resolve: async (resolution?: T): Promise<any> => {
      if (this.promiseResolve) {
        this.promiseResolve(resolution);
      }
      await this.promise;
    },
    reject: async (rejection?: any): Promise<any> => {
      if (this.promiseReject) {
        this.promiseReject(rejection);
      }
      await this.promise;
    }
  };

  catch<TResult = never>(
    onrejected?:
      | ((reason: any) => TResult | PromiseLike<TResult>)
      | null
      | undefined
  ): Promise<T | TResult> {
    if (!this.onrejected) {
      this.onrejected = onrejected;
    }
    return this.createOrReturnPromise();
  }

  createOrReturnPromise<TResult>() {
    if (!this.promise) {
      this.promise = new Promise<TResult>((resolve, reject) => {
        this.promiseResolve = resolve;
        this.promiseReject = reject;
      });
    }
    return this.promise;
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled: ((value: T | TResult1) => TResult1 | PromiseLike<TResult1>),
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined
  ): Promise<TResult2> {
    this.onfulfilled = onfulfilled;
    this.onrejected = onrejected;
    this.promise = this.createOrReturnPromise().then(
      this.resolvePromise,
      this.rejectPromise
    );
    return this.promise;
  }
  resolvePromise = (resolveArg: any): any => {
    if (this.onfulfilled) {
      this.onfulfilled(resolveArg);
    }
  };
  rejectPromise = (rejectArg: any): any => {
    if (this.onrejected) {
      this.onrejected(rejectArg);
    }
  };
}

export default SimulatedPromise;
