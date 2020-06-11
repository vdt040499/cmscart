const express = require('express');
const router = express.Router();

const Product = require('../models/product.model');
const Category = require('../models/category.model');

//Get all products
router.get('/', function(req, res) {
    Product.find((err, products) => {
        if(err) {
            console.log(err);
        } else {
            res.render('product/all_products', {
                title: 'All products',
                products: products
            })
        }
    })
});

//Get products by category
router.get('/:category', (req, res) => {

    var categorySlug = req.params.category;

    Category.findOne({slug: categorySlug}, (err, cat) => {
        Product.find({category: categorySlug}, (err, products) => {
            if(err) console.log(err);

            res.render('product/cat_products', {
                title: cat.title,
                products: products
            });
        });
    });
});

module.exports = router;