const mongoose = require('mongoose');
const postSchema = mongoose.Schema({
    user:
        {type: mongoose.Schema.Types.ObjectId, ref: "user"
        },
        date: { 
            type: Date,
            default: Date.now
        },
        content: String,
        title:String,
        likes:[
            {type: mongoose.Schema.Types.ObjectId, ref: "user"}
        ],
        isLocked: { type: Boolean, default: false },
        password: { type: String, default: null }
   
});

module.exports = mongoose.model("post", postSchema);