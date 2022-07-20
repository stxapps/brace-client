import axios from 'axios';

const post = (url, data) => {
  return axios.post(url, data);
};

const axiosWrapper = { post };

export default axiosWrapper;
