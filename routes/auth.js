const express = require('express');
const SignupData = require('../model/signup')
var router = express.Router();
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');


router.post('/api/signup',async(req,res)=>{
    // console.log("data reached backend")
    try {
        let { confirmpassword, ...user } = req.body;
        let checkuser = user.username;
        let existingname = await SignupData.findOne({ username: checkuser});
        let existinguser = await SignupData.findOne({email:user.email})
        router.post('/signup',async(req,res)=>{
    // console.log("data reached backend")
    try {
        let { confirmpassword, ...user } = req.body;
        let checkuser = user.username;
        let existingname = await SignupData.findOne({ username: checkuser});
        let existinguser = await SignupData.findOne({email:user.email})
        if(existinguser){
            res.json({message:"user already exists"})
        }
        if(existingname){
            res.json({message:"username already exists"})
        }
        else{
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const newuser = new SignupData({
            name:user. name,
            username: user.username,
            email: user.email,
            password: hashedPassword
          });
        await newuser.save();
        console.log('new user added')
        res.json({newuser,message:"success"}).status(200)
        }
     
    } 
    catch (error) {
        console.log('signup failed');
    }
})
        if(existinguser){
            res.json({message:"user already exists"})
        }
        if(existingname){
            res.json({message:"username already exists"})
        }
        else{
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const newuser = new SignupData({
            name:user. name,
            username: user.username,
            email: user.email,
            password: hashedPassword
          });
        await newuser.save();
        console.log('new user added')
        res.json({newuser,message:"success"}).status(200)
        }
     
    } 
    catch (error) {
        console.log('signup failed');
    }
})


function verifyToken(req,res,next){
  try {
      console.log(req.headers.authorisation)
      if(!req.headers.authorisation) throw('unauthorized auth')
      let token=req.headers.authorisation.split(' ')[1] 
      if(!token) throw('unauthorized jwt')
      let payload=jwt.verify(token,'ilikeapples')
      if(!payload) throw('unauthorized payload') 
     // res.status(200).send(payload) 
      next()    
  } catch (error) {
      console.log(error)
      res.status(401).send(error)
  }

}


router.post('/api/login',    async (req, res) => {
    try {
      const { email, password } = req.body;
        console.log(email)
      let loginuser = await SignupData.findOne({ email: email });  
      if (loginuser) {
        const passwordMatches = await bcrypt.compare(password, loginuser.password);
        if (passwordMatches) {
          console.log("password matches");
          var userdata = {
            username : loginuser.username,
            userid :loginuser._id
          }
          let payload = {email:email,password:password};
          let token = jwt.sign(payload,'ilikeapples')
          console.log(token);
          res.json({ message: "login success", data:userdata,status: 200 ,token:token});
        } else {
          console.log("password does not match");
          res.json({ message: "password does not match", status: 500 });
        }
      } else {
        console.log("user does not exist");
        res.json({ message: "user does not exist", status: 404 });
      }
    } catch (error) {
      console.log("error occurred");
      res.json({ message: "error", status: 400 });
    }
  });
  


module.exports = router