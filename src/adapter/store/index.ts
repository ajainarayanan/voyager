// Imports to satisfy --declarations build requirements
// https://github.com/Microsoft/TypeScript/issues/9944
// tslint:disable-next-line:no-unused-variable
import {Store} from 'redux';

import {applyMiddleware, compose, createStore, Middleware, StoreEnhancer} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {DEFAULT_STATE, State} from '../../models';
import {rootReducer} from '../../reducers';
import {createQueryListener} from '../../store/listener';

// define which middleware to use depending on environment
let composeEnhancers = compose;

const middleware: Middleware[] = [thunkMiddleware];

// when not in production enable redux tools and add logger middleware
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
}

export let actionLogs: any;
let subscriber: Function;
export function configureStore(initialState = DEFAULT_STATE) {

  const store: Store<State> = createStore<State>(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(...middleware)) as StoreEnhancer<any>
    // HACK: cast to any to supress typescript complaint
  );


  if (module.hot) {
    // Enable webpack hot module replacement for reducers
    module.hot.accept(
      '../reducers', () => {
        const nextRootReducer = require('../reducers').rootReducer;
        store.replaceReducer(nextRootReducer);
      }
    );
  }

  subscriber = store.subscribe(createQueryListener(store));
  return store;
}
export function unSubListenerFromStore() {
  if (typeof subscriber === 'function') {
    subscriber();
  }
}
