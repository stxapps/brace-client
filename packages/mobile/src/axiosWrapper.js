import axios from 'axios';

import { DOMAIN_NAME } from './types/const';

const post = (url, data) => {
  return axios.post(url, data, { headers: { Referer: DOMAIN_NAME } });
};

const axiosWrapper = { post };

export default axiosWrapper;
