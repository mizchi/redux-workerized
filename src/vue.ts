import { WorkerizedStore } from ".";

import * as Comlink from "comlinkjs";

export const SYNC = "redux-workerize$sync";

export function workerPlugin<State, Snapshot = State>(
  worker: Worker,
  selector: ((state: State) => Snapshot) = i => i as any
) {
  return (store: any) => {
    const storeProxy: WorkerizedStore<State, Snapshot> = Comlink.proxy(
      worker
    ) as any;
    storeProxy.subscribe(
      Comlink.proxyValue((snapshot: Snapshot) => {
        store.commit(SYNC, snapshot);
      }),
      Comlink.proxyValue(selector as any)
    );
    store.subscribe((mutation: any) => {
      if (mutation.type !== SYNC) {
        storeProxy.dispatch(mutation);
      }
    });
  };
}

export const proxy: any = (actionKeys: string[]) => {
  return actionKeys.reduce((acc, key) => {
    return { ...acc, [key]() {} };
  }, {});
};
