const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
const app = express();


app.use(cors());
app.use(bodyparser.json());
app.use(express.json());
app.use(express.urlencoded({extended:true}))

const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
  cors: {origin : '*'}
});

const mongoose = require('./db')

chatData = require('./model/chatroom');


const signup = require('./routes/auth')
app.use('/',signup);


const users = require('./routes/users')
app.use('/',users);

const SignupData = require('./model/signup')

var room1 = ""
var room2 = ""
var room = ""
var data


// function for creating or finding chat rooms 
async function findRoom(user1, user2){
  console.log(user1, "-----", user2);
  room1 = `${user1}-${user2}`;
  room2 = `${user2}-${user1}`;
  data =await chatData.findOne({ $or: [ {room : room2}, { room: room1 } ] })
  // console.log("db data ",data);
  if(data == null){
    console.log("empty");
    newRoom = new chatData({room : room1, messages:[]});
    savedRoom =await newRoom.save();
    console.log("new  "  ,savedRoom.room);
    room = savedRoom
    data = savedRoom
    // console.log(room);
  }else{
    room = data
    // console.log("not empty" , room);
  }
}

// for storing the incoming messages to DB
async function storeMessage(chatRoom, msg){
  try {
    updatedMsg =await chatData.updateOne({ room : chatRoom },{ $push: { messages : msg } })
  } catch (error) {
    console.log(error);
  }
}


io.on('connection', (socket) => {
  console.log('a user connected',socket.id);
  socket.on('loggedinusers',async(userid)=>{
    // await io.emit('online')
    try {
      updatedstatus = await SignupData.updateOne({ _id : userid },{ $set: { status: "online" } })
      // console.log(SignupData.status)

    } catch (error) {
      console.log(error);
    }
  })
  
  

  socket.on('register',async (userDetails) => {
     
    // Create a unique room name
    console.log(userDetails);
    await findRoom(userDetails.sender, userDetails.recipient)           // function for creating or finding chat rooms

    // Join the room
    socket.join(room.room);
    console.log("room from old msg ",room);
    await io.to(room.room).emit('old_message',data.messages)            // send the old chats to fronend
    // console.log("re sending msg ", data.messages);
}); 
socket.on('send_message',async (msg) => {                               // receiving the messages that coming from frontend
  console.log("incoming message=> ",msg);


  // Emit the message to the specific room
  console.log("send msg ", room.room);
  await io.to(room.room).emit('new_message', msg);                    // returning the messages to frontend
  await storeMessage(room.room, msg)
});

socket.on('send_image',async(msg)=>{

  await io.to(room.room).emit('new_message', msg);                    // returning the messages to frontend
  await storeMessage(room.room, msg)
})

  socket.on('disconnect', () => {
    console.log('a user disconnected!');
  });
});


const invite = require('./routes/friend');
app.use('/',invite);

const path = require('path');
app.use(express.static('./dist/Frontend/'))
app.get('/*', function(req, res) { res.sendFile(path.join(__dirname + '/dist/Frontend/index.html')); });


// Serve the 'uploads' directory as a static directory
app.use('/uploads', express.static('uploads'));

app.listen(3000,()=>{
    console.log("server running at 3000")
})
httpServer.listen(3001, () => console.log(`listening on port 3001`));
