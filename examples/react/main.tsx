import "@babel/polyfill";
import React, { useCallback } from "react";
import ReactDOM from "react-dom";
import { createWorkerContext } from "../../react";
import { RootState } from "./reducer";

const worker = new Worker("./worker.ts");
const {
  WorkerizedStoreContext,
  useSelector,
  useDispatch,
  ready
} = createWorkerContext<RootState>(worker);

// Components

import { increment, Increment } from "./reducer";
function CounterApp() {
  const counter = useSelector(state => state.counter);
  const dispatch = useDispatch<Increment>();

  const onClick = useCallback(() => {
    dispatch(increment());
  }, []);

  return <button onClick={onClick}>{counter.value}</button>;
}

export function App() {
  return (
    <WorkerizedStoreContext>
      <CounterApp />
    </WorkerizedStoreContext>
  );
}

ready.then(() => {
  ReactDOM.render(<App />, document.querySelector(".root"));
});
