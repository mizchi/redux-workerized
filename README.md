# redux-worker-context-poc

This is conceptual implementation for react/redux.

off-thread reducer and middlewares.

- Run store's reducer in WebWorker or ServiceWorker.
- Communicate via Comlink
- Connect state by React Hooks

## Requirements

- @babel/polyfill
- Comlink
- redux

## Example

See full code [examples/simple](examples/simple)

MainThread

```tsx
import "@babel/polyfill";
import React, { useCallback } from "react";
import ReactDOM from "react-dom";
import { createWorkerContext } from "redux-worker-context";

// This is counter example. Use your reducer.
import { RootState, increment, Increment } from "./reducer";

const worker = new Worker("./worker.ts");
const { WorkerContext, useSelector, useDispatch, ready } = createWorkerContext<
  RootState
>(worker);

// Components
function Counter() {
  const counter = useSelector(state => state.counter);
  const dispatch = useDispatch<Increment>();

  const onClick = useCallback(() => {
    dispatch(increment());
  }, []);

  return <button onClick={onClick}>{counter.value}</button>;
}

// wait for worker initialization
// you can skip this with <WorkerContext fallback="Loading...">...
ready.then(() => {
  ReactDOM.render(
    <WorkerContext>
      <Counter />
    </WorkerContext>,
    document.querySelector(".root")
  );
});
```

WorkerThread

```typescript
import "@babel/polyfill";
import * as Comlink from "comlinkjs";
import { createStore } from "redux";
import reducer from "./reducer";
import { createStoreProxy } from "redux-worker-context";

const store = createStore(reducer);
const proxy = createStoreProxy(store, s => s);

Comlink.expose({ ...proxy }, self);
```

## Run examples

```
yarn install
yarn parcel examples/simple/index.html
# open localhost:1234
```

## TODO

- [ ] Init with Suspense
- [x] Basic examples
- [ ] SSR
- [ ] Run in ServiceWorker
- [ ] rollup to publish
- [x] with percel
- [ ] with webpack

## LICENSE

MIT
