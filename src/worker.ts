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

export function createWorkerizedStore<State>(
  store: Store<State>
): WorkerizedStore<State> {
  const listenerMap = new Map<number, Function>();
  return {
    async subscribe<Snapshot = State>(
      onChangeHandler: Function,
      selector: (state: State) => Snapshot = defaultSelector as any
    ): Promise<number> {
      const getSnapshot: () => Promise<Snapshot> = () =>
        selector(store.getState()) as any;
      const subscriptionId = uniqueId();
      let lastSnapshot = await getSnapshot();
      const unsubscribe = store.subscribe(async () => {
        const newSnapshot = await getSnapshot();
        if (!isEqual(lastSnapshot, newSnapshot)) {
          onChangeHandler(newSnapshot);
          lastSnapshot = newSnapshot;
        }
      });
      listenerMap.set(subscriptionId, unsubscribe);
      return subscriptionId;
    },
    async unsubscribe(subscriptionId: number) {
      const listener = listenerMap.get(subscriptionId);
      listener && listener();
      listenerMap.delete(subscriptionId);
    },
    async getState() {
      return store.getState();
    },
    async dispatch(action: AnyAction) {
      await store.dispatch(action);
    }
  };
}
