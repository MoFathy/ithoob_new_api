const mongoose = require('mongoose'); 

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    title_ar:{
        type:String,
        required:true,
        trim:true,
    },
    title_en:{
        type:String,
        required:true,
        trim:true,
    },
    slug: {
        type: String,
        required: true,
        unique:true,
    },
    description_ar:{
        type:String,
        required:true,
    },
    description_en:{
        type:String,
        required:true,
    },
    price: {
        type: Number,
        required: true,
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    quantity: {type:Number,required:true},
    images: {
        type: Array,
    },
    color: [{ type: mongoose.Schema.Types.ObjectId, ref: "Color" }],
    ratings: [{ start: Number ,postedBy: {type: mongoose.Schema.Types.ObjectId, ref: "User"} }],
    brand: {
        type: String,
        enum: ["ithoob","adidas"]
    },
    sold: {
        type: Number,
        default: 0
    },
    order: {type: Number, default: 99999},
    latest: {type:Boolean,default:false},
    recommended: {type:Boolean,default:false},
    new: {type:Boolean,default:false},
    preOrder: {type:Boolean,default:false},
},{timestamps:true});

//Export the model
module.exports = mongoose.model('Product', productSchema);