// NetInfo stub: tests run "online" unless a case overrides the mock.
// httpClient only reads `isConnected` via `fetch()`.
module.exports = {
  fetch: jest.fn(async () => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  })),
  addEventListener: jest.fn(() => jest.fn()),
};
