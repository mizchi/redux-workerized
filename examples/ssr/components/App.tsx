import React from "react";
import { WorkerizedStoreContext } from "./helpers";
import CounterApp from "./CounterApp";

export function App() {
  return (
    <WorkerizedStoreContext>
      <CounterApp />
    </WorkerizedStoreContext>
  );
}
