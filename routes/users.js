const express = require('express');
const SignupData = require('../model/signup')
var router = express.Router();
const bcrypt = require('bcryptjs');

//existing username
router.get('/api/username/:value', async(req,res)=>{
    try {
        const name = req.params.value;
        console.log(name);
        let existinguser = await SignupData.findOne({ username:name});
        if(existinguser){
            res.json({message:"username taken"})
        }
  
    } catch (error) {
        console.log(error)
        res.json({message:error}).status(400)
    }
  
  })
  
   
    router.get('/api/uniquelogin/:userid',async(req,res)=>{
        console.log("data reached unique user backend")
      try {
        let id = req.params.userid
      let userlogin = await SignupData.findById(id)
      if (!userlogin) {
        return res.status(404).json({ message: 'User not found' });
      }
      
  
      res.json({data:userlogin});
      } catch (error) {
        res.json({message:error}).status(400)
  
      }
    })
    router.get('/api/chatroom/:userid/:fid',async(req,res)=>{
  
      console.log('reached friend details backend')
      try {
        let userid = req.params.userid; 
        let fid = req.params.fid
        console.log(fid);
        let profileuser = await SignupData.findById(userid);
        
        const chatfriend = profileuser.friends.find(friend => friend._id.toString() === fid);
        console.log(chatfriend.username)
        let friendetails = await SignupData.findOne({username:chatfriend.username})
        res.json({data:friendetails});
      } catch (error) {
        res.json({message:error}).status(400)
  
      }
    })
  
    router.get('/api/active/:username',async(req,res)=>{
      console.log('reached online status backend')
  
      try {
         let friend = req.params.username;
         console.log(friend);
         let name = friend.username
         findinuser = await SignupData.findOne({username:friend});
         console.log(findinuser)
         let activestatus =  findinuser.status
         res.json({data:activestatus});
      } catch (error) {
        console.log(error);
      }
    })
  
  
  
  
    //logout
    router.get('/api/logout/:userid',async(req,res)=>{
      console.log('reached logout backend')
  
      try {
         let userid = req.params.userid;
         updatedstatus = await SignupData.updateOne({ _id : userid },{ $set: { status: "offline" } })
         updateduser = await SignupData.findOne({ _id : userid })
         res.json({data:updateduser.status});
  
  
      } catch (error) {
        console.log(error);
  
      }
    })
  
  router.post('/api/block',async (req,res)=>{
    try {
      let profileuser = req.body.data.sender;
      let blockuser = req.body.data.recipient
      senderblocked = await SignupData.updateOne({username:profileuser},{$addToSet:{blockedUsers:blockuser}});
      
      if(senderblocked.acknowledged == true   ){
         
          res.json({"status":"success"})
  
      }else{
          res.json({"status":"failed"})
      }
    } catch (error) {
      console.log(error);
    }
  })
  router.post('/api/unblock',async (req,res)=>{
    try {
      let profileuser = req.body.data.sender;
      let blockuser = req.body.data.recipient
      senderblocked = await SignupData.updateOne({username:profileuser},{$pull:{blockedUsers:blockuser}});
  
      if(senderblocked.acknowledged == true   ){
          res.json({"status":"success"})
  
      }else{
          res.json({"status":"failed"})
      }
    } catch (error) {
      console.log(error);
    }
  })
  
  // for muting a user
  router.post('/api/mute_users', async(req, res)=>{
    try {
        console.log("from frontend ", req.body);
        let name = req.body.data.sender
        let mutedUser = req.body.data.recipient
        muted = await SignupData.updateOne({username : name},{$push: {mutedUsers : mutedUser}})
        console.log(muted);
        if(muted.acknowledged == true){
            res.json({"status":"success"})
        }else{
            res.json({"status":"failed"})
        }
    } catch (error) {
        console.log(error);  
    }
  })
  
  // for unmuting a user
  router.post('/api/unmute_users', async(req, res)=>{
    try {
        console.log("from frontend ", req.body);
        let name = req.body.data.sender
        let mutedUser = req.body.data.recipient
        unMuted = await SignupData.updateOne({username : name},{$pull : {mutedUsers : mutedUser}})
        console.log(unMuted);
        if(unMuted.acknowledged == true){
            res.json({"status":"success"})
        }else{
            res.json({"status":"failed"})
        }
    } catch (error) {
        console.log(error);
    }
  })
  
  
  
  //upload photo
  
  const multer = require('multer');
  const bodyparser = require('body-parser');
  const fs = require('fs'); // Import the 'fs' module
  
  var path = require('path')
  router.use(bodyparser.urlencoded({extended:true}))
  
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
    }
  });
  
  const upload = multer({ storage: storage }).single('file');
  router.use(express.static('uploads'));
  
  router.post('/api/file/:userid', (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: 'Error uploading file' });
      } else {
        console.log(req.file.path);
        const filename = path.basename(req.file.path);
        console.log(filename);
  
        try {
          const file = filename;
          const userId = req.params.userid;
          console.log('id for upload is ',userId)
          const image = await SignupData.updateOne({ _id: userId }, { $set: { pic: file } });
        } catch (error) {
          console.log(error);
            res.status(500).json({ message: 'Error saving data to database' });
        }
  
      }
    });
  });



  // Endpoint to get the user's profile picture URL
router.get('/api/getProfilePicture/:userid', async (req, res) => {
  try {
    const userId = req.params.userid;
    // Assuming you have a mongoose model named SignupData for users
    // Replace "SignupData" with your actual model name for users.
    const user = await SignupData.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Assuming the user model has a "pic" field that stores the profile picture filename
    // Replace "pic" with the field name you use to store the profile picture filename.
    const profilePictureUrl = `/uploads/${user.pic}`; // Assuming the profile pictures are stored in the 'uploads' directory
    res.status(200).json({ profilePictureUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching profile picture' });
  }
});

  
  module.exports = router