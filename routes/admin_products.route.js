const express = require('express');
const router = express.Router();
const mkdirp = require('mkdirp'); //0.5.1
const fs = require('fs-extra');
const resizeImg = require('resize-img');

const Product = require('../models/product.model');
const Category = require('../models/category.model')
//GET Admin Products 
router.get('/', async(req, res) => {
    var count;
    Product.count((e, c) => {
        console.log(c);
        count = c;
    });
    const products = await Product.find();

    res.render('admin/products', {
        products: products,
        count: count
    });
});

//GET add product
router.get('/add-product', async(req, res) => {
    var title = "";
    var desc = "";
    var price = "";

    const categories = await Category.find();

    res.render('admin/add_product', {
        title: title,
        desc: desc,
        categories: categories,
        price: price
    });
});

//POST add product
router.post('/add-product', async(req, res) => {
    
    if(!req.files){ imageFile =""; }
    if(req.files){
    var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
    }
    
    req.checkBody('title', 'Title must a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;

    var errors = req.validationErrors();

    if(errors) {
        const categories = await Category.find();
        res.render('admin/add_product', {
            errors: errors,
            title: title,
            desc: desc,
            price: price,
            categories: categories
        });
    }else{
        const productExist = await Product.findOne({slug: slug});
        const categories = await Category.find();
        if(productExist){
            req.flash('danger', 'Product title exists, choose another.');
            res.render('admin/add_product', {
                title: title,
                desc: desc,
                price: price,
                categories: categories
            });
        }else{
            var price2 = parseFloat(price).toFixed(2);

            const product = new Product({
                title: title,
                slug: slug,
                desc: desc,
                price: price2,
                category: category,
                image: imageFile
            });

            product.save(function (err) {
                if (err)
                    return console.log(err);

                mkdirp('public/product_images/' + product._id, function (err) {
                    return console.log(err);
                });

                mkdirp('public/product_images/' + product._id + '/gallery', function (err) {
                    return console.log(err);
                });

                mkdirp('public/product_images/' + product._id + '/gallery/thumbs', function (err) {
                    return console.log(err);
                });

                if (imageFile != "") {
                    var productImage = req.files.image;
                    var path = 'public/product_images/' + product._id + '/' + imageFile;

                    productImage.mv(path, function (err) {
                        return console.log(err);
                    });
                }

                req.flash('success', 'Product added!');
                res.redirect('/admin/products');
            });

            
        }
        
    }    
});

//POST reorder pages
router.post('/reorder-pages', (req, res) => {
    var ids = req.body['id[]'];

    var count  = 0;

    for(let i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;

        (function(count){
            Page.findById(id, (err, page) => {
                page.sorting = count;
                page.save((err) => {
                    if(err)
                        return console.log(err);
                });
            });
        })(count);
    }
});

//GET edit page
router.get('/edit-page/:id', async(req, res) => {
    const page = await Page.findById(req.params.id);
    res.render('admin/edit_page', {
        title: page.title,
        slug: page.slug,
        content: page.content,
        id: page._id
    });
})

//POST add page
router.post('/edit-page/:id', async (req, res) => {
    req.checkBody('title', 'Title must a value.').notEmpty();
    req.checkBody('content', 'Content must have a value.').notEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(slug == '') slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;
    var id = req.params.id;

    var errors = req.validationErrors();

    if(errors) {
        console.log(errors);
        res.render('admin/edit_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
        });
    }else{
        const pageExist = await Page.findOne({slug: slug, _id: {'$ne':id}});
        if(pageExist){
            req.flash('danger', 'Page slug exists, choose another.');
            res.render('admin/edit_page', {
                title: title,
                slug: slug,
                content: content,
                id: id
            });
        }else{
            const page = await Page.findById(id);
            page.title = title;
            page.slug = slug;
            page.content = content;
            
            page.save((err) => {
                if(err) return console.log(err);

                req.flash('success', 'Page edited');
                res.redirect('/admin/pages/edit-page/' + id);
            });
        }
        
    }    
});

//GET delete page
router.get('/delete-page/:id', (req, res) => {
    Page.findByIdAndRemove(req.params.id, (err) => {
        if(err) return console.log(err);

        req.flash('success', 'Page deleted');
        res.redirect('/admin/pages');
    });
});
module.exports = router;