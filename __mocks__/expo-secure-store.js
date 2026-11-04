// In-memory SecureStore for unit tests. The real module is native code and
// cannot load under jest; the refresh suite also expects a `__clear()`
// helper to reset state between cases (fresh per `jest.resetModules`, but
// the helper keeps single-registry runs hermetic too).
const store = new Map();

const getItemAsync = jest.fn(async (key) => {
  return store.has(key) ? store.get(key) : null;
});

const setItemAsync = jest.fn(async (key, value) => {
  store.set(key, value);
});

const deleteItemAsync = jest.fn(async (key) => {
  store.delete(key);
});

const __clear = () => {
  store.clear();
};

module.exports = {
  getItemAsync,
  setItemAsync,
  deleteItemAsync,
  __clear,
  WHEN_UNLOCKED: 0,
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 1,
  AFTER_FIRST_UNLOCK: 2,
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 3,
};
