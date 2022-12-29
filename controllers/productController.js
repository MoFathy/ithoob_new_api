const expressAsyncHandler = require("express-async-handler");
const slugify = require("slugify");
const Product = require("../models/productModel");
const uniqueSlug = require("unique-slug");

const createProduct = expressAsyncHandler(async (req, res) => {
  try {
    if (req.body.title_en) {
      req.body.slug = `${slugify(req.body.title_en)}-${uniqueSlug()}`;
    }
    const product = await Product.create(req.body);
    res.json({ success: true, product });
  } catch (error) {
    throw new Error(error);
  }
});

const getProduct = expressAsyncHandler(async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug });
    res.json({ success: true, product });
  } catch (error) {
    throw new Error(error);
  }
});

const filteredProduct = expressAsyncHandler(async (req, res) => {
  try {
    const { minPrice, maxPrice, color, category, availability, brand } =
      req.params;
    const products = await Product.find({
      price: {
        $gte: minPrice,
        $lte: maxPrice,
      },
      category,
      brand,
      color,
    });
    res.json({
      success: true,
      products,
    });
  } catch (error) {
    res.json(error);
  }
});

const getAllProducts = expressAsyncHandler(async (req, res) => {
  try {
    // pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    const count = await Product.countDocuments();
    const products = await Product.find().skip(skip).limit(limit);
    res.json({ success: true,count ,products });
  } catch (error) {
    throw new Error(error);
  }
});

const updateProduct = expressAsyncHandler(async (req, res) => {
  try {
    const { slug } = req.params;
    if (req.body.title_en) {
      req.body.slug = `${slugify(req.body.title_en)}-${uniqueSlug()}`;
    }
    const product = await Product.findOneAndUpdate(slug, req.body, {
      new: true,
    });
    res.json({ success: true, product });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteProduct = expressAsyncHandler(async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOneAndDelete({ slug: slug });
    product
      ? res.json({ success: true, message: "product deleted successfully" })
      : res.json({ success: false, message: "product not found" });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  filteredProduct,
  deleteProduct,
};
