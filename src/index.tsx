import React, { useState, useEffect, useContext } from "react";
import * as Comlink from "comlinkjs";
import { Dispatch, AnyAction } from "redux";
import isEqual from "lodash/isEqual";

export function createWorkerContext<State>(worker: Worker) {
  const StateContext = React.createContext<State>(null as any);
  const ProxyContext = React.createContext<any>(null as any);
  const proxy: any = Comlink.proxy(worker);

  // build initialState
  let currentState: State | null = null;

  const ready = proxy.getState().then((state: State) => {
    currentState = state;
  });

  function useStore() {
    const [current, setState] = useState<State | null>(currentState);
    currentState = current;

    // subsribe remote state
    useEffect(() => {
      const subscriptionIdPromise = proxy.subscribe(
        Comlink.proxyValue((state: State) => {
          if (!isEqual(state, currentState)) {
            setState(state);
            currentState = state;
          }
        })
      );

      // Set initialState at null
      currentState == null &&
        proxy.getState().then((state: State) => {
          setState(state);
        });
      return async () => {
        const subscriptionId: number = await subscriptionIdPromise;
        proxy.unsubscribe(subscriptionId);
      };
    }, []);
    return [current, proxy];
  }

  function WorkerContext(props: { children: React.ReactNode; fallback?: any }) {
    const [current, proxy] = useStore();
    if (current == null) {
      return props.fallback || <div />;
    }
    return (
      <ProxyContext.Provider value={proxy}>
        <StateContext.Provider value={current}>
          {props.children}
        </StateContext.Provider>
      </ProxyContext.Provider>
    );
  }

  function useSelector<Selected>(fn: (state: State) => Selected): Selected {
    const state = useContext(StateContext);
    return fn(state);
  }

  function useDispatch<A extends AnyAction>(): Dispatch<A> {
    const proxy = useContext(ProxyContext);
    return proxy.dispatch;
  }

  return {
    WorkerContext,
    useSelector,
    useDispatch,
    ready
  };
}
