import React, { useState, useEffect, useContext } from "react";
import * as Comlink from "comlinkjs";
import { Dispatch, AnyAction } from "redux";
import { WorkerizedStore } from ".";

export function createWorkerContext<State, Snapshot = State>(
  worker: Worker,
  selector: (root: State) => Promise<Snapshot> | Snapshot = s => s as any
) {
  const StateContext = React.createContext<Snapshot>(null as any);
  const ProxyContext = React.createContext<any>(null as any);
  const storeProxy: WorkerizedStore<State, Snapshot> = Comlink.proxy(
    worker
  ) as any;

  // build initialState
  let currentSnapshot: Snapshot | null = null;

  const ready = storeProxy.getState().then(async (state: State) => {
    currentSnapshot = await selector(state);
  });

  function useStore() {
    const [current, setState] = useState<Snapshot | null>(currentSnapshot);
    currentSnapshot = current;

    // subsribe remote state
    useEffect(() => {
      const subscriptionIdPromise = storeProxy.subscribe(
        Comlink.proxyValue((snapshot: Snapshot) => {
          currentSnapshot = snapshot;
          setState(snapshot);
        }),
        Comlink.proxyValue(selector as any)
      );

      // Set initialState at null
      currentSnapshot == null &&
        storeProxy.getState().then(async (state: State) => {
          currentSnapshot = await selector(state);
          setState(currentSnapshot);
        });
      return async () => {
        const subscriptionId: number = await subscriptionIdPromise;
        storeProxy.unsubscribe(subscriptionId);
      };
    }, []);
    return [current, storeProxy];
  }

  function WorkerContext(props: { children: React.ReactNode; fallback?: any }) {
    const [current, proxy] = useStore();
    if (current == null) {
      return props.fallback || <div />;
    } else {
      return (
        <ProxyContext.Provider value={proxy}>
          <StateContext.Provider value={current as any}>
            {props.children}
          </StateContext.Provider>
        </ProxyContext.Provider>
      );
    }
  }

  // TODO: Supress update by isEqual
  function useSnapshot<Selected>(
    selector: (snapshot: Snapshot) => Selected = (i: Snapshot) => i as any
  ): Selected {
    const snapshot = useContext(StateContext);
    const selected = selector(snapshot);
    return selected;
  }

  function useDispatch<A extends AnyAction>(): Dispatch<A> {
    const proxy = useContext(ProxyContext);
    return proxy.dispatch;
  }

  return {
    WorkerContext,
    useSnapshot,
    useDispatch,
    ready
  };
}
