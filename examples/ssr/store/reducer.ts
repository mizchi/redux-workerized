import { combineReducers, AnyAction, Reducer } from "redux";

// Counter

type CounterState = {
  value: number;
  hiddenValue: number; // check shallow equal
};

const INCREMENT = "counter/increment";
const INCREMENT_HIDDEN_VALUE = "counter/increment-hidden-value";

export type Increment = {
  type: typeof INCREMENT;
};

export function increment(): Increment {
  return {
    type: INCREMENT
  };
}

type CounterAction =
  | {
      type: typeof INCREMENT;
    }
  | {
      type: typeof INCREMENT_HIDDEN_VALUE;
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
    case INCREMENT_HIDDEN_VALUE: {
      return { ...state, hiddenValue: state.value + 1 };
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
