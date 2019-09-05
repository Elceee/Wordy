import { createStore } from "redux";

let reducer = (state, action) => {
  if (action.type === "loginSuccess") {
    return { username: action.username };
  }
  if (action.type === "setUsers") {
    return { ...state, users: action.users };
  }
  if (action.type === "logout") {
    return { ...state, username: undefined };
  }
  return state;
};

let store = createStore(
  reducer,
  { username: undefined, users: [], socketID: "" },
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
