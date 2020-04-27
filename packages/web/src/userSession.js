import { UserSession, AppConfig } from 'blockstack';

import { APP_NAME } from './types/const';

const appConfig = new AppConfig(['store_write'], APP_NAME);
const userSession = new UserSession({ appConfig: appConfig });

export default userSession;
