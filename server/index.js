const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const Chatkit = require("@pusher/chatkit-server");

require("dotenv").config();
const app = express();

const INSTANCE_LOCATOR_ID = process.env.CHATKIT_INSTANCE_LOCATOR_ID;

const CHATKIT_SECRET = process.env.CHATKIT_SECRET_KEY;

const chatkit = new Chatkit.default({
  instanceLocator: `v1:us1:${INSTANCE_LOCATOR_ID}`,
  key: CHATKIT_SECRET
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.post("/auth", (req, res) => {
  const { user_id } = req.query;
  const authData = chatkit.authenticate({
    userId: user_id
  });

  res.status(authData.status)
     .send(authData.body);
});


app.post("/user", async (req, res) => {
  const { username } = req.body;
  try {
    const users = await chatkit.getUsers();
    const user = users.find((usr) => usr.name == username);
    res.send({ user });
  } catch (get_user_err) {
    console.log("error getting user: ", get_user_err);
  }
});


app.post("/rooms", async (req, res) => {
  const { user_id } = req.body;
  try {
    const rooms = await chatkit.getUserRooms({
      userId: user_id
    });
    rooms.map((item) => {
      item.joined = true;
      return item;
    });

    res.send({ rooms });
  } catch (get_rooms_err) {
    console.log("error getting rooms: ", get_rooms_err);
  }
});


const PORT = 5000;
app.listen(PORT, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Running on ports ${PORT}`);
  }
});