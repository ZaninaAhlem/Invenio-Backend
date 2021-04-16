const users = [];

// add user
const addUser = ({ id, username, roomName }) => {
  //Clean the data
  username = username.trim().toLowerCase();
  roomName = roomName.trim().toLowerCase();

  //Validate
  if (!username || !roomName) {
    return {
      error: "username and roomName are required",
    };
  }

  // Check for existing user
  const existingUser = users.find((user) => {
    return user.roomName === roomName && user.username === username;
  });

  //Validate username
  if (existingUser) {
    return {
      error: "Username is in use",
    };
  }

  //Store user
  const user = { id, username, roomName };
  users.push(user);
  return { user };
};

// remove user
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

//get user
const getUser = (id) => users.find((user) => user.id === id);

//get users in roomName
const getUsersInRoom = (roomName) => {
  // roomName = roomName.trim().toLowerCase();
  // return users.filter((user) => user.roomName === roomName);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
