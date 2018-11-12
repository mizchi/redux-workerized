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
