import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
        title: {type: String, required: true},
        description: {type: String, required: true},
        price: {type: Number, required: true},
        thumbnail: {type: String},
        code: {type: String, required: true, unique: true},
        stock: {type: Number, required: true},
        category: {type: String, required: true}
})

productSchema.plugin(mongoosePaginate);

const productModel = mongoose.model('products', productSchema)

export default productModel
