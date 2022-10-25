async function getCurrentClient() {
  return (await import("../../../../src/environment.js")).default;
}
export {
  getCurrentClient
};
