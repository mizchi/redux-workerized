# redux-workerized

WIP: Not production ready. This is conceptual implementation

- Run reducer and middlewares in worker.
- Type safe API for typescript
- (React) Connect state by react hooks

## How to use

Add dependencies.

```
yarn add redux comlinkjs
```

Use https://github.com/parcel-bundler/parcel or https://github.com/webpack-contrib/worker-loader

Put react-hooks.d.ts to your typescript env https://gist.github.com/mizchi/bfc0986c5fd3c695a38d0d573909efc5

## Example

See full code [examples/simple](examples/simple)

### WorkerThread

```typescript
// worker.ts
import "@babel/polyfill";
import * as Comlink from "comlinkjs";
import { createStore } from "redux";
import reducer from "./reducer";
import { createWorkerizedStore } from "redux-workerized/worker";

const store = createStore(reducer);
const proxy = createWorkerizedStore(store, s => s);

// Merge with your complink api
Comlink.expose({ ...proxy }, self);
```

## MainThread

```tsx
import "@babel/polyfill";
import { WorkerizedStore } from "redux-workerized";
import { createWorkerContext } from "redux-workerized/react";
import * as Comlink from "comlinkjs";

// This is counter example. Use your reducer.
import { RootState, increment, Increment } from "./reducer";

// Use webpack's worker-loader or parcel to build worker instance and cast
const store: WorkerizedStore = Comlink.proxy(new Worker("./worker.ts")) as any;

store.subscribe((newState: RootState) => {
  console.log("changed", newState);
});

(async () => {
  await store.dispatch(increment());
  const currentState = await store.getState();
  console.log("current state", currentState);
})();
```

## MainThread with react

Dependencies

```
yarn add react@16.7.0-alpha.0 react-dom@16.7.0-alpha.0
yarn add -d @types/react @types/react-dom
```

```tsx
import "@babel/polyfill";
import React, { useCallback } from "react";
import ReactDOM from "react-dom";
import { createWorkerContext } from "redux-workerized/react";
import { RootState, increment, Increment } from "./reducer";

const {
  WorkerizedStoreContext,
  useSelector,
  useDispatch,
  ready
} = createWorkerContext<RootState>(new Worker("./worker.ts"));

// Components
function Counter() {
  const counter = useSelector(state => state.counter);
  const dispatch = useDispatch<Increment>();

  const onClick = useCallback(() => {
    dispatch(increment());
  }, []);

  return <button onClick={onClick}>{counter.value}</button>;
}

// wait for worker side initialState
// you can skip this with <WorkerizedStoreContext fallback="Loading...">...
ready.then(() => {
  ReactDOM.render(
    <WorkerizedStoreContext>
      <Counter />
    </WorkerizedStoreContext>,
    document.querySelector(".root")
  );
});
```

## API

```ts
import { Dispatch, AnyAction } from "redux";

// redux-workerized
export type WorkerizedStore<State, A extends AnyAction = AnyAction> = {
  getState(): Promise<State>;
  dispatch(action: A): Promise<void>;
  subscribe(listener: (state: State) => void): Promise<number>;
  unsubscribe(listenerId: number): Promise<void>;
};

// redux-workerized/react
export declare function createWorkerContext<State>(
  worker: Worker
): {
  WorkerizedStoreContext: (
    props: {
      children: any;
      fallback?: any;
    }
  ) => any;
  useSelector: <Selected>(fn: (state: State) => Selected) => Selected;
  useDispatch: <A extends AnyAction>() => Dispatch<A>;
  ready: Promise<void>;
};
```

## Run examples

```
yarn install
yarn parcel examples/react/index.html
# open localhost:1234
```

## TODO

- [x] Basic examples
- [x] with percel
- [ ] Init with Suspense
- [ ] SSR
- [ ] Run in ServiceWorker
- [ ] rollup to umd
- [ ] with webpack
- [ ] WorkerDOM

## LICENSE

MIT
