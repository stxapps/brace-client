let addNextActionRef = null;
export const bindAddNextActionRef = (ref) => {
  addNextActionRef = ref;
};
export const addNextAction = (action) => {
  if (!addNextActionRef) {
    console.log('Invalid addNextActionRef', addNextActionRef);
    return;
  }
  addNextActionRef(action);
};
