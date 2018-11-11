import React, { useState, useEffect, useContext } from "react";
import * as Comlink from "comlinkjs";
import { Dispatch, AnyAction } from "redux";
import { WorkerizedStore } from ".";

const isEqual = require("lodash.isequal");

export function createWorkerContext<State>(worker: Worker) {
  const StateContext = React.createContext<State>(null as any);
  const ProxyContext = React.createContext<any>(null as any);
  const storePoxy: WorkerizedStore<State> = Comlink.proxy(worker) as any;

  // build initialState
  let currentState: State | null = null;

  const ready = storePoxy.getState().then((state: State) => {
    currentState = state;
  });

  function useStore() {
    const [current, setState] = useState<State | null>(currentState);
    currentState = current;

    // subsribe remote state
    useEffect(() => {
      const subscriptionIdPromise = storePoxy.subscribe(
        Comlink.proxyValue((state: State) => {
          if (!isEqual(state, currentState)) {
            setState(state);
            currentState = state;
          }
        })
      );

      // Set initialState at null
      currentState == null &&
        storePoxy.getState().then((state: State) => {
          setState(state);
        });
      return async () => {
        const subscriptionId: number = await subscriptionIdPromise;
        storePoxy.unsubscribe(subscriptionId);
      };
    }, []);
    return [current, storePoxy];
  }

  function WorkerizedStoreContext(props: {
    children: React.ReactNode;
    fallback?: any;
  }) {
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

  function useSelector<Selected>(fn: (state: State) => Selected): Selected {
    const state = useContext(StateContext);
    return fn(state);
  }

  function useDispatch<A extends AnyAction>(): Dispatch<A> {
    const proxy = useContext(ProxyContext);
    return proxy.dispatch;
  }

  return {
    WorkerizedStoreContext,
    useSelector,
    useDispatch,
    ready
  };
}
