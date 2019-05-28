# RNChatkitRoles
A sample React Native chat app built with Chatkit which implements roles and permissions.

Full tutorial is available at: 

- [Chatkit roles and permissions in a React Native chat app - Part 1: Setting permissions in the server](https://pusher.com/tutorials/chatkit-react-native-permissions-part-1)
- [Chatkit roles and permissions in a React Native chat app - Part 2: Setting permissions in the client](https://pusher.com/tutorials/chatkit-react-native-permissions-part-2)

The app has the following features:

- Public and private rooms.
- Sending a message.
- Attaching image files.
- Loading older messages.
- Typing indicators.
- User presence indicator (whether the users in the room are offline or online).
- Joining public rooms.
- Adding users to a room.
- Removing users from a room.
- Limiting what the user can do based on their assigned role - new room members cannot attach files to a message, only room leaders can add or remove users from a room.

Each branch contains the code on each part of the tutorial:

- `starter` - the starting point when following the tutorial. This contains the code for the pre-built chat app (without the roles & permissions) and the server (for handling the requests in the chat app).
- `chatkit-roles-web` - contains the final output for part 1 of the tutorial series. This has the code for the web UI for creating users, rooms, roles in the server.
- `chatkit-roles-mobile` - contains the final output for the whole series. This has the code for implementing the roles & permissions in the chat app.

### Prerequisites

-   React Native development environment
-   [Node.js](https://nodejs.org/en/)
-   [Yarn](https://yarnpkg.com/en/)
-   [Chatkit app instance](https://pusher.com/chatkit)
-   [ngrok account](https://ngrok.com/)

## Getting Started

1.  Clone the repo:

```
git clone https://github.com/anchetaWern/RNChatkitRoles.git
cd RNChatkitRoles
```

2.  Install the app dependencies:

```
yarn
```

3.  Eject the project (re-creates the `ios` and `android` folders):

```
react-native eject
```

4.  Link the packages:

```
react-native link react-native-gesture-handler
react-native link react-native-permissions
react-native link react-native-document-picker
react-native link react-native-fs
react-native link react-native-config
react-native link react-native-vector-icons
react-native link rn-fetch-blob
```

5.  Update `android/app/build.gradle` file:

```
apply from: "../../node_modules/react-native/react.gradle"

// add these:
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
apply from: project(':react-native-config').projectDir.getPath() + "/dotenv.gradle"
```

6. Update `android/app/src/main/AndroidManifest.xml` to add permission to read from external storage:

```
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
  package="com.rnchatkitroles">
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
  ...
</manifest>
```

7.  Update `.env` file with your Chatkit credentials.

8.  Set up the server:

```
cd server
yarn
```

9.  Update the `server/.env` file with your Chatkit credentials.

10.  Run the server:

```
yarn start
```

11. Access `http://localhost:5000/users-console` on your browser and set up users, rooms, roles, and assign permissions to users.

12. Run ngrok:

```
./ngrok http 5000
```

13. Update the `src/screens/Login.js`, `src/screens/Rooms.js`, and `src/screens/Chat.js` file with your ngrok https URL.

14. Run the app:

```
react-native run-android
react-native run-ios
```

15. Log in to the app on two separate devices (or emulator).

## Built With

-   [React Native](http://facebook.github.io/react-native/)
-   [Chatkit](https://pusher.com/chatkit)

## Donation

If this project helped you reduce time to develop, please consider buying me a cup of coffee :)

<a href="https://www.buymeacoffee.com/wernancheta" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
