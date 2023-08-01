const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://amalashraf04:aamssanamm1234@cluster0.sc2qvv5.mongodb.net/chatapp?retryWrites=true&w=majority',{ useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>{
    console.log('successfully connected to MongoDB')
})
.catch((err)=>{
    console.log('Error connecting to MongoDB', err)
})

module.exports = mongoose