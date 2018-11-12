import "@babel/polyfill";
import React, { useCallback } from "react";
import ReactDOM from "react-dom";
import { createWorkerContext } from "../../react";
import { RootState } from "./reducer";

// build worker

const worker = new Worker("./worker.ts");

const { WorkerContext, useSnapshot, useDispatch, ready } = createWorkerContext<
  RootState,
  { value: number }
>(worker, async (state: RootState) => {
  return state.counter;
});

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

ready.then(() => {
  ReactDOM.render(
    <WorkerContext>
      <CounterApp />
    </WorkerContext>,
    document.querySelector(".root")
  );
});
