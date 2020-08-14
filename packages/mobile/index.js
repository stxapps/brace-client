import { AppRegistry } from 'react-native';

import Root, { ShareRoot } from './src';
import { name as appName, shareName } from './app.json';

AppRegistry.registerComponent(appName, () => Root);
AppRegistry.registerComponent(shareName, () => ShareRoot);
