const mongoose = require('mongoose');   
const { model, Schema } = mongoose;

const TradeSchema = new Schema({
    name:{type: String,required:true},
    date:{type: Date,required:true},
    reason:{type: String,required:true},
    pl:{type: Number,required:true},
    userId: { type: String, required: true } 
});

const TradeModel = model('Trade',TradeSchema);

module.exports = TradeModel;