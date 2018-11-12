# redux-workerized

WIP: Not production ready. This is conceptual implementation

- Run reducer and middlewares in worker.
- Type safe API for typescript
- (React) Connect state by react hooks

## How to use

Working example https://github.com/mizchi/redux-workerized-example

Add dependencies.

```
yarn add redux comlinkjs
```

Use https://github.com/parcel-bundler/parcel or https://github.com/webpack-contrib/worker-loader

Put react-hooks.d.ts to your typescript env https://gist.github.com/mizchi/bfc0986c5fd3c695a38d0d573909efc5

## Example

See full code [examples/react](examples/react)

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
import { WorkerizedStore } from "../..";
import * as Comlink from "comlinkjs";

// This is counter example. Use your reducer.
import { RootState, increment } from "./reducer";

type CounterSnapshot = {
  value: number;
};

// Use webpack's worker-loader or parcel to build worker instance and cast
const store: WorkerizedStore<RootState, CounterSnapshot> = Comlink.proxy(
  new Worker("./worker.ts")
) as any;

(async () => {
  const subscritionId = await store.subscribe(
    Comlink.proxyValue((snapshot: CounterSnapshot) => {
      console.log("changed", snapshot);
    }),
    Comlink.proxyValue(
      (state: RootState): CounterSnapshot => {
        return state.counter;
      }
    )
  );

  await store.dispatch(increment());
  const currentState = await store.getState();
  console.log("current state", currentState);
  document.body.textContent = JSON.stringify(currentState);
  await store.unsubscribe(subscritionId);
})();
```

`NOTE`: `store.subscribe(...)` needs `Complink.proxyValue(...)` to serialize data from worker

## MainThread with React

Dependencies

```
yarn add react@16.7.0-alpha.0 react-dom@16.7.0-alpha.0
yarn add -d @types/react @types/react-dom
```

```tsx
import "@babel/polyfill";
import React, { useCallback } from "react";
import ReactDOM from "react-dom";
import { createWorkerContext } from "../../react";
import { RootState } from "./reducer";

// build worker

const worker = new Worker("./worker.ts");

const { WorkerContext, useSnapshot, useDispatch, ready } = createWorkerContext(
  worker,
  (state: RootState) => state.counter
);

// components

import { increment, Increment } from "./reducer";
function CounterApp() {
  const value = useSnapshot(state => state.value);
  const dispatch = useDispatch<Increment>();

  const onClick = useCallback(() => {
    dispatch(increment());
  }, []);

  return <button onClick={onClick}>{value}</button>;
}

export function App() {
  return (
    <WorkerContext>
      <CounterApp />
    </WorkerContext>
  );
}

ready.then(() => {
  ReactDOM.render(<App />, document.querySelector(".root"));
});
```

## MainThread with Vue

```tsx
import "@babel/polyfill";
import Vue from "vue";
import Vuex from "vuex";
import App from "./App.vue";
import { workerPlugin, proxy, SYNC } from "redux-workerized/vue";
import { RootState, INCREMENT } from "./reducer";

Vue.use(Vuex);

type CounterSnapshot = {
  value: number;
};

export type State = {
  remote: CounterSnapshot;
};

const store = new Vuex.Store<State>({
  state: {
    remote: {
      value: 0
    }
  },
  mutations: {
    [SYNC](state, payload: CounterSnapshot) {
      state.remote = { ...state.remote, ...payload };
    },
    ...proxy([INCREMENT])
  },
  plugins: [
    workerPlugin(
      new Worker("./worker.ts"),
      (state: RootState): CounterSnapshot => {
        return state.counter;
      }
    )
  ]
});

new Vue({
  store,
  el: ".root",
  render(h) {
    return h(App);
  }
});
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
- [x] Publish
- [ ] Suppress update by sharrow equal
- [ ] Init with React.Suspense
- [ ] SSR
- [ ] Run in ServiceWorker
- [ ] rollup to umd
- [ ] with webpack example
- [ ] Monorepo

## LICENSE

MIT
