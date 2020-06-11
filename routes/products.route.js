const express = require('express');
const router = express.Router();
const fs = require('fs-extra');

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

//Get product details
router.get('/:category/:product', (req, res) => {
    
    var galleryImages = null;

    Product.findOne({slug: req.params.product}, (err, product) => {
        if(err) {
            console.log(err);
        } else {
            var galleryDir = 'public/product_images/' + product._id + '/gallery';

            fs.readdir(galleryDir, (err, files) => {
                if(err) {
                    console.log(err);
                } else {
                    galleryImages = files;

                    res.render('product/product_detail', {
                        title: product.title,
                        p: product,
                        galleryImages: galleryImages
                    });
                }
            })
        }
    });
});

module.exports = router;