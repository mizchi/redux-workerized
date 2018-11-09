import React, { useCallback } from "react";
import { useSelector, useDispatch } from "./helpers";
import { increment, Increment } from "../store/reducer";

export default function CounterApp() {
  const counter = useSelector(state => state.counter);
  const dispatch = useDispatch<Increment>();

  const onClick = useCallback(() => {
    dispatch(increment());
  }, []);

  return <button onClick={onClick}>{counter.value}</button>;
}
