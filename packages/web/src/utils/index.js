


// gen uuid for link id

// encode / decode base64url

export const createPath = (listName) => {
  return `links/${window.btoa(listName)}`;
};
