import "@babel/polyfill";
import Vue from "vue";
import Vuex from "vuex";
import App from "./App.vue";
import { workerPlugin, proxy, SYNC } from "../../vue";
import { RootState, INCREMENT } from "./reducer";

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
      new Worker("./worker.ts"),
      (state: RootState): CounterSnapshot => {
        return state.counter;
      }
    )
  ]
});

new Vue({
  store,
  el: ".root",
  render(h) {
    return h(App);
  }
});
