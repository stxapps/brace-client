import { AppRegistry } from 'react-native';

import Root, { Share } from './src';
import { name as appName, shareName } from './app.json';

AppRegistry.registerComponent(appName, () => Root);
AppRegistry.registerComponent(shareName, () => Share);
