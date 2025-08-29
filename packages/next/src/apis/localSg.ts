const getItem = async (key) => {
  const item = getItemSync(key);
  return item;
};

const setItem = async (key, item) => {
  setItemSync(key, item);
};

const removeItem = async (key) => {
  removeItemSync(key);
};

const getItemSync = (key) => {
  const item = localStorage.getItem(key);
  return item;
};

const setItemSync = (key, item) => {
  localStorage.setItem(key, item);
};

const removeItemSync = (key) => {
  localStorage.removeItem(key);
};

const localSg = {
  getItem, setItem, removeItem, getItemSync, setItemSync, removeItemSync,
};

export default localSg;
