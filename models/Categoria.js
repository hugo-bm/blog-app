const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorias = new Schema({
   nome: {
    type: String,
    required: true
   },
   slug: {
    type: String,
    required: true
   },
   Date: {
       type: Date,
       default: Date.now()
   }
});
mongoose.model('categorias',categorias);