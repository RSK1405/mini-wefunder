// data/userState.js — simple in-memory user state

const state = {
  liked: new Set(),
  passed: new Set(),
  dealRoomCache: {},
};

module.exports = state;