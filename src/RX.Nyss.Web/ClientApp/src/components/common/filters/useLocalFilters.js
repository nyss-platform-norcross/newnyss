import { useReducer } from 'react';
import { shallowEqual } from "react-redux";

const useLocalFilters = (filters) => {
  // const [localFilters, setLocalFilters] = useState(filters);

  // const updateLocalFilters = (change) => {
  //   const newValue = {
  //     ...localFilters,
  //     ...change,
  //   };
  //   setLocalFilters((prev) => ({ ...prev, ...change }));
  //   return newValue;
  // };

  // return [localFilters, updateLocalFilters];

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