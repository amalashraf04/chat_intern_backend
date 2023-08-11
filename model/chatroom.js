const mongoose = require('mongoose');


const chatSchema = new mongoose.Schema({

    
        room: {
            type: String
        },
        messages: [{
            msg: String,
            sender: String,
            receiver: String,
            time: String,
            image:{
                data : Buffer,
                contentType : String,
              }
        }]
      
  
    

})

const chatData = mongoose.model('chatdata',chatSchema);
module.exports = chatData;

