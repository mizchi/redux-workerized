import { combineReducers, AnyAction, Reducer } from "redux";

// Counter

type CounterState = {
  value: number;
};

const INCREMENT = "counter/increment";

export type Increment = {
  type: typeof INCREMENT;
};

export function increment(): Increment {
  return {
    type: INCREMENT
  };
}

type CounterAction = {
  type: typeof INCREMENT;
};

const initialCounterState = {
  value: 0,
  hiddenValue: 0
};

function counter(
  state: CounterState = initialCounterState,
  action: CounterAction | AnyAction
): CounterState {
  switch (action.type) {
    case INCREMENT: {
      return { ...state, value: state.value + 1 };
    }
    default: {
      return state;
    }
  }
}

// Root State

export type RootState = {
  counter: CounterState;
};

const rootReducer: Reducer<RootState, AnyAction> = combineReducers({
  counter
});

export default rootReducer;
