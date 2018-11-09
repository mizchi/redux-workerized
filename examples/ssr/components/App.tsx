import React from "react";
import { WorkerContext } from "./helpers";
import CounterApp from "./CounterApp";

export function App() {
  return (
    <WorkerContext>
      <CounterApp />
    </WorkerContext>
  );
}
