import 'react-redux';

import reducers from './src/reducers';

export type AppState = ReturnType<typeof reducers>;

declare module 'react-redux' {
  interface DefaultRootState extends AppState { }
}
