import "@babel/polyfill";
import * as Comlink from "comlinkjs";
import { createStore } from "redux";
import reducer from "./reducer";
import { createStoreProxy } from "../../src/worker";

const store = createStore(reducer);
const proxy = createStoreProxy(store, s => s);

Comlink.expose({ ...proxy }, self);
