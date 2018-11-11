import { AnyAction } from "redux";

export type WorkerizedStore<T, A extends AnyAction = AnyAction> = {
  getState(): Promise<T>;
  dispatch(action: A): Promise<A>;
  subscribe(listener: (state: T) => void): Promise<number>;
  unsubscribe(listenerId: number): Promise<void>;
};
