import { WorkerizedStore } from ".";
import { AnyAction, Store } from "redux";

const isEqual = require("lodash.isequal");

let _cnt = 0;

function uniqueId() {
  return ++_cnt;
}

function defaultSelector<State>(state: State) {
  return state;
}

export function createWorkerizedStore<State, Snapshot = State>(
  store: Store<State>,
  selector: (state: State) => Snapshot = defaultSelector as any
): WorkerizedStore<State> {
  let map = new Map<number, Function>();
  let currentSnapshot: Snapshot = selector(store.getState());
  return {
    async subscribe(onChangeHandler: Function): Promise<number> {
      const subscriptionId = uniqueId();
      const unsubscribe = store.subscribe(() => {
        const newState = store.getState();
        const snapshot = selector(newState);
        if (!isEqual(snapshot, currentSnapshot)) {
          onChangeHandler(snapshot);
          currentSnapshot = snapshot;
        }
      });
      map.set(subscriptionId, unsubscribe);
      return subscriptionId;
    },
    async unsubscribe(subscriptionId: number) {
      const unsubscribe = map.get(subscriptionId);
      unsubscribe && unsubscribe();
      map.delete(subscriptionId);
    },
    async getState() {
      return store.getState();
    },
    async dispatch(action: AnyAction) {
      return store.dispatch(action) as any;
    }
  };
}
