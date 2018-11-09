import { AnyAction, Store } from "redux";
import isEqual from "lodash/isequal";

let _cnt = 0;

function uniqueId() {
  return ++_cnt;
}

function defaultSelector<State>(s: State) {
  return s;
}

export function createStoreProxy<State, Snapshot = State>(
  store: Store<State>,
  selector: (state: State) => Snapshot = defaultSelector as any
) {
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
    unsubscribe(subscrptionId: number) {
      const unsubscribe = map.get(subscrptionId);
      unsubscribe && unsubscribe();
      map.delete(subscrptionId);
    },
    getState() {
      return store.getState();
    },
    dispatch(action: AnyAction) {
      return store.dispatch(action);
    }
  };
}
