import "@babel/polyfill";
import React from "react";
import ReactDOMServer from "react-dom/server";

import { App } from "./components/App";
import { ready } from "./components/helpers";

export const render = async () => {
  await ready;
  return ReactDOMServer.renderToString(<App />);
};
