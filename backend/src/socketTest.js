import axios from "axios";
import { io } from "socket.io-client";

// backend url
const API_URL =
  "http://localhost:4000";

// test user
const TEST_USER = {
  username: "Lokesh",
  email: "lokesh@test.com",
  password: "123456",
};

// room id
const ROOM_ID =
  "test-room";

// global token
let token = "";

// global socket
let socket = null;

// start app
start();

// app start
async function start() {

  try {

    // register user
    await registerUser();

    // login user
    const loginSuccess =
      await loginUser();

    // stop if login failed
    if (!loginSuccess) {

      console.log(
        "\nLOGIN FAILED"
      );

      return;
    }

    // connect socket
    connectSocket();

  } catch (error) {

    console.log(
      "START ERROR:"
    );

    console.log(error);
  }
}

// register user
async function registerUser() {

  try {

    console.log(
      "\nRegistering user..."
    );

    const response =
      await axios.post(
        `${API_URL}/api/auth/register`,
        TEST_USER
      );

    console.log(
      "REGISTER SUCCESS"
    );

    console.log(
      response.data.message
    );

    return true;

  } catch (error) {

    // already exists
    if (
      error.response?.data
        ?.message ===
      "User already exists"
    ) {

      console.log(
        "\nUser already exists"
      );

      return true;
    }

    console.log(
      "REGISTER ERROR:"
    );

    console.log(
      error.response?.data ||
      error.message ||
      error
    );

    return false;
  }
}

// login user
async function loginUser() {

  try {

    console.log(
      "\nLogging in..."
    );

    const response =
      await axios.post(
        `${API_URL}/api/auth/login`,
        {
          email:
            TEST_USER.email,

          password:
            TEST_USER.password,
        }
      );

    // save token
    token =
      response.data.token;

    console.log(
      "LOGIN SUCCESS"
    );

    console.log(
      "TOKEN RECEIVED"
    );

    return true;

  } catch (error) {

    console.log(
      "LOGIN ERROR:"
    );

    console.log(
      error.response?.data ||
      error.message ||
      error
    );

    return false;
  }
}

// connect socket
function connectSocket() {

  socket = io(API_URL, {

    transports: [
      "websocket",
    ],

    auth: {
      token,
    },
  });

  // connected
  socket.on(
    "connect",
    () => {

      console.log(
        "\nConnected:"
      );

      console.log(
        socket.id
      );

      runTests();
    }
  );

  // connection error
  socket.on(
    "connect_error",
    (error) => {

      console.log(
        "\nSOCKET CONNECT ERROR:"
      );

      console.log(
        error.message
      );
    }
  );

  // generic socket error
  socket.on(
    "error",
    (err) => {

      console.log(
        "\nSocket Error:"
      );

      console.log(err);
    }
  );

  // disconnect
  socket.on(
    "disconnect",
    () => {

      console.log(
        "\nDisconnected"
      );
    }
  );

  // room users
  socket.on(
    "room:users",
    (users) => {

      console.log(
        "\nRoom Users:"
      );

      console.table(users);
    }
  );

  // activity log
  socket.on(
    "activity:log",
    (data) => {

      console.log(
        "\nActivity:"
      );

      console.log(data);
    }
  );

  // files sync
  socket.on(
    "files:sync",
    (data) => {

      console.log(
        "\nFiles:"
      );

      const files =
        data.files || [];

      files.forEach(
        (file) => {

          console.log(
            file.name
          );
        }
      );
    }
  );

  // file sync
  socket.on(
    "file:sync",
    (data) => {

      console.log(
        "\nFile Updated:"
      );

      console.log(
        data.fileName
      );

      console.log(
        data.content
      );
    }
  );

  // code sync
  socket.on(
    "code:sync",
    (data) => {

      console.log(
        "\nCode Synced:"
      );

      console.log(
        data.code
      );
    }
  );

  // cursor update
  socket.on(
    "cursor:update",
    (data) => {

      console.log(
        "\nCursor:"
      );

      console.log(data);
    }
  );

  // chat messages
  socket.on(
    "chat:message",
    (data) => {

      console.log(
        "\nChat:"
      );

      console.log(data);
    }
  );

  // code output
  socket.on(
    "code:output",
    (data) => {

      console.log(
        "\nCode Output:"
      );

      console.log(
        "Status:",
        data.status
      );

      if (data.output) {

        console.log(
          "\nOutput:"
        );

        console.log(
          data.output
        );
      }

      if (data.error) {

        console.log(
          "\nError:"
        );

        console.log(
          data.error
        );
      }
    }
  );
}

// run all tests
async function runTests() {

  try {

    // create room
    console.log(
      "\nCreating room..."
    );

    socket.emit(
      "room:create",
      {
        roomId: ROOM_ID,
        username:
          TEST_USER.username,
      }
    );

    await wait(1000);

    // join room
    console.log(
      "\nJoining room..."
    );

    socket.emit(
      "room:join",
      {
        roomId: ROOM_ID,
        username:
          TEST_USER.username,
      }
    );

    await wait(1000);

    // create file
    console.log(
      "\nCreating file..."
    );

    socket.emit(
      "file:create",
      {
        roomId: ROOM_ID,
        fileName:
          "app.js",
      }
    );

    await wait(1000);

    // update file
    console.log(
      "\nUpdating file..."
    );

    socket.emit(
      "file:update",
      {
        roomId: ROOM_ID,

        fileName:
          "app.js",

        content: `
console.log("Hello World");
console.log("Socket Working");
        `,
      }
    );

    await wait(1000);

    // sync code
    console.log(
      "\nSyncing code..."
    );

    const code = `
console.log("CodeCollab");
console.log(10 + 20);
    `;

    socket.emit(
      "code:change",
      {
        roomId: ROOM_ID,
        code,
      }
    );

    await wait(1000);

    // move cursor
    console.log(
      "\nMoving cursor..."
    );

    socket.emit(
      "cursor:move",
      {
        roomId: ROOM_ID,
        line: 5,
        column: 10,
      }
    );

    await wait(1000);

    // send message
    console.log(
      "\nSending message..."
    );

    socket.emit(
      "chat:send",
      {
        roomId: ROOM_ID,

        sender:
          TEST_USER.username,

        text:
          "Hello Team",
      }
    );

    await wait(1000);

    // run code
    console.log(
      "\nRunning code..."
    );

    socket.emit(
      "code:run",
      {
        roomId: ROOM_ID,

        code,

        language:
          "javascript",

        input: "",
      }
    );

    await wait(4000);

    // delete file
    console.log(
      "\nDeleting file..."
    );

    socket.emit(
      "file:delete",
      {
        roomId: ROOM_ID,
        fileName:
          "app.js",
      }
    );

    await wait(1000);

    // leave room
    console.log(
      "\nLeaving room..."
    );

    socket.emit(
      "room:leave",
      {
        roomId: ROOM_ID,
      }
    );

    await wait(1000);

    console.log(
      "\nALL TESTS COMPLETED"
    );

  } catch (error) {

    console.log(
      "TEST ERROR:"
    );

    console.log(error);
  }
}

// helper delay
function wait(ms) {

  return new Promise(
    (resolve) => {

      setTimeout(
        resolve,
        ms
      );
    }
  );
}