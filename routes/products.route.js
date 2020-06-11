const express = require('express');
const router = express.Router();

const Product = require('../models/product.model');

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

module.exports = router;