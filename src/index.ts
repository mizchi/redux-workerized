import { AnyAction } from "redux";

export type WorkerizedStore<
  State,
  Snapshot = State,
  A extends AnyAction = AnyAction
> = {
  getState(): Promise<State>;
  dispatch(action: A): Promise<void>;
  subscribe(
    listener: (state: Snapshot) => void,
    selector?: (root: State) => Promise<Snapshot> | Snapshot
  ): Promise<number>;
  unsubscribe(listenerId: number): Promise<void>;
};
