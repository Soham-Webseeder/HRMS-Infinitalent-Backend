const mongoose = require('mongoose')

const policySchema = new mongoose.Schema({
    title:{
        type:String
    },
    document:{
        type:String
    }
});

module.exports = mongoose.model("Policy",policySchema)