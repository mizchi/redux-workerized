import { createWorkerContext } from "../../../src";
import { RootState } from "../store/reducer";

const worker = new Worker("../worker/index.ts");

export const {
  WorkerContext,
  useSelector,
  useDispatch,
  ready
} = createWorkerContext<RootState>(worker);
