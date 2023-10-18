import { useReducer } from 'react';
import { shallowEqual } from "react-redux";

const useLocalFilters = (filters) => {
  return useReducer((state, action) => {
    const newState = { ...state.value, ...action };
    if (!shallowEqual(newState, state.value)) {
      return { ...state, changed: true, value: newState }
    } else {
      return state
    }
  }, { value: filters, changed: false });
};



export default useLocalFilters;