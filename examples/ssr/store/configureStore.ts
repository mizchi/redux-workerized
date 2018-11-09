import { createStore, Store } from "redux";
import rootReducer, { RootState } from "./reducer";

export default function configureStore(): Store<RootState> {
  return createStore(rootReducer);
}
