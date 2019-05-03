const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const Chatkit = require("@pusher/chatkit-server");
const mustacheExpress = require("mustache-express");
const randomId = require("random-id");

require("dotenv").config();
const INSTANCE_LOCATOR_ID = process.env.CHATKIT_INSTANCE_LOCATOR_ID;
const CHATKIT_SECRET = process.env.CHATKIT_SECRET_KEY;

const chatkit = new Chatkit.default({
  instanceLocator: `v1:us1:${INSTANCE_LOCATOR_ID}`,
  key: CHATKIT_SECRET
});

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

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

    const joinable_rooms = await chatkit.getUserJoinableRooms({
      userId: user_id
    });
    joinable_rooms.map((item) => {
      item.joined = false;
      return item;
    });

    const all_rooms = rooms.concat(joinable_rooms);

    res.send({ rooms: all_rooms });
  } catch (get_rooms_err) {
    console.log("error getting rooms: ", get_rooms_err);
  }
});


app.get("/users-console", async (req, res) => {
  try {
    const chatkit_rooms = await chatkit.getRooms({ includePrivate: true });
    res.render('users-console', { title: "Users Console", rooms: chatkit_rooms });
  } catch (get_rooms_err) {
    console.log("error getting rooms: ", get_rooms_err);
  }
});


app.post("/create-room", async (req, res) => {
  const { room_name, is_private } = req.body;

  const is_private_room = (is_private === 'true') ? true : false;

  try {
    await chatkit.createRoom({
      creatorId: 'root',
      name: room_name,
      isPrivate: is_private_room
    });

    const chatkit_rooms = await chatkit.getRooms({ includePrivate: true });

    res.send(chatkit_rooms);

  } catch (create_room_err) {
    console.log("error creating room: ", create_room_err);
  }
});


app.post("/create-user", async (req, res) => {
  const { user_name } = req.body;
  const user_id = randomId(15);

  try {
    await chatkit.createUser({
      id: user_id,
      name: user_name,
      avatarURL: `https://ui-avatars.com/api/?background=d88413&color=FFF&name=${user_name}`
    });

    res.send('ok');
  } catch (create_user_err) {
    console.log("error creating user: ", create_user_err);
  }
});


app.get("/get-users", async (req, res) => {
  try {
    const users = await chatkit.getUsers();
    res.send({ users });
  } catch (get_users_err) {
    console.log("error getting users: ", get_users_err);
  }
});


app.post("/room/add-user", async (req, res) => {
  const { room_id, user_id } = req.body;

  try {
    await chatkit.addUsersToRoom({
      roomId: room_id,
      userIds: [user_id]
    });

    const room = await chatkit.getRoom({
      roomId: room_id,
    });

    const room_users = await chatkit.getUsersById({
      userIds: room.member_user_ids,
    });

    res.send(room_users);
  } catch (add_user_to_room_err) {
    console.log("error adding user to room: ", add_user_to_room_err);
  }
});


app.get("/room/:room_id/users", async (req, res) => {
  const { room_id } = req.params;
  try {
    const room = await chatkit.getRoom({
      roomId: room_id,
    });

    const room_users = await chatkit.getUsersById({
      userIds: room.member_user_ids,
    });

    res.send(room_users);
  } catch (get_room_err) {
    console.log("error getting room:", get_room_err);
  }
});


app.post("/create-role", async (req, res) => {
  const { role_name, permissions } = req.body;

  try {
    await chatkit.createRoomRole({
      name: role_name,
      permissions: permissions
    });

    res.send('ok');
  } catch(create_role_err) {
    console.log("error creating role: ", create_role_err);
  }
});


app.get("/roles", async (req, res) => {
  try {
    const roles = await chatkit.getRoles();
    res.send(roles);
  } catch (get_roles_err) {
    console.log("error getting roles: ", get_roles_err);
  }
});


app.post("/user/:user_id/assign-role", async (req, res) => {
  const { user_id } = req.params;
  const { room_id, role_name } = req.body;

  try {
    const roles = await chatkit.getUserRoles({ userId: user_id });

    const roles_to_remove = roles.filter((item) => {
      return item.room_id == room_id;
    });

    roles_to_remove.forEach((role) => {
      chatkit.removeRoomRoleForUser({
        userId: user_id,
        name: role.role_name,
        roomId: room_id
      }).then(() => {
        console.log('removed role: ', role);
      });
    });

    await chatkit.assignRoomRoleToUser({
      userId: user_id,
      name: role_name,
      roomId: room_id
    });

    res.send('ok');

  } catch (assign_role_err) {
    console.log("error assigning role to user: ", assign_role_err);
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