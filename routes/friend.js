const express = require('express');
const SignupData = require('../model/signup')
const router = express.Router();


router.post('/friend/:id', async (req, res) => {
  try {
    let data = req.body.name;
    let id = req.params.id;
    let existingUser = await SignupData.findOne({ username: data });
    let profileuser = await SignupData.findOne({_id:id})
    if (existingUser) {
      const existingFriend = profileuser.friends.find(friend => friend.username === existingUser.username);
      if (!existingFriend) {
        profileuser.friends.push({
          username: existingUser.username,
          email: existingUser.email,
          userId: existingUser._id
        });
        existingUser.friends.push({
          username: profileuser.username,
          email: profileuser.email,
          userId: profileuser._id
        })

        await profileuser.save();
        await existingUser.save();
        res.json({ message: "Friend added", data: existingUser,iteration:existingUser._id.toString(), status: 200 });
      } else {
        console.log("Friend already exists");
        res.json({ message: "Friend already exists", status: 300 });
      }
    } else {
      console.log("User does not exist");
      res.json({ message: "User does not exist", status: 500 });
    }
  } catch (error) {
    console.log("Error occurred");
    res.json({ message: "Friend not added", status: 400 });
  }
})




module.exports = router;