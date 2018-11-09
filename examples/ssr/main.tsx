import "@babel/polyfill";
import React from "react";
import ReactDOM from "react-dom";
import { App } from "./components/App";
import { ready } from "./components/helpers";

// ensure initialState from remote worker
ready.then(() => {
  ReactDOM.render(<App />, document.querySelector(".root"));
});
