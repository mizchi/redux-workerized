import { createWorkerContext } from "../../../src/react";
import { RootState } from "../store/reducer";

const worker = new Worker("../worker/index.ts");

export const {
  WorkerizedStoreContext,
  useSelector,
  useDispatch,
  ready
} = createWorkerContext<RootState>(worker);
