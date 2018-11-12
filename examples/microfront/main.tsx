import "@babel/polyfill";
import { RootState, increment, Increment, INCREMENT } from "./reducer";

const worker = new Worker("./worker.ts");

// Vue
import Vue from "vue";
import Vuex from "vuex";
import App from "./App.vue";
import { workerPlugin, proxy, SYNC } from "../../vue";

Vue.use(Vuex);

type CounterSnapshot = {
  value: number;
};

export type State = {
  remote: CounterSnapshot;
};

const store = new Vuex.Store<State>({
  state: {
    remote: {
      value: 0
    }
  },
  mutations: {
    [SYNC](state, payload: CounterSnapshot) {
      state.remote = { ...state.remote, ...payload };
    },
    ...proxy([INCREMENT])
  },
  plugins: [
    workerPlugin(
      worker,
      (state: RootState): CounterSnapshot => {
        return state.counter;
      }
    )
  ]
});

new Vue({
  store,
  el: ".vue-root",
  render(h) {
    return h(App);
  }
});

// React

import React, { useCallback } from "react";
import ReactDOM from "react-dom";
import { createWorkerContext } from "../../src/react";

const { WorkerContext, useSnapshot, useDispatch, ready } = createWorkerContext<
  RootState,
  { value: number }
>(worker, async (state: RootState) => {
  return state.counter;
});

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
    document.querySelector(".react-root")
  );
});
