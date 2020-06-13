const express = require('express');
const router = express.Router();
const mkdirp = require('mkdirp'); //0.5.1
const fs = require('fs-extra');
const resizeImg = require('resize-img');
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

const Product = require('../models/product.model');
const Category = require('../models/category.model')

//GET Admin Products 
router.get('/', isAdmin, async(req, res) => {
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
router.get('/add-product', isAdmin, async(req, res) => {
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

//GET edit product
router.get('/edit-product/:id', isAdmin, async(req, res) => {
    var errors;

    if(req.session.errors) errors = req.session.errors;
    req.session.errors = null;
    
    const product = await Product.findById(req.params.id);
    const categories = await Category.find();

    var  galleryDir = 'public/product_images/' + product._id + '/gallery';
    var galleryImages = null;

    fs.readdir(galleryDir, (err, files) => {
        if(err) {
            console.log(err);
        }else{
            galleryImages = files;

            res.render('admin/edit_product', {
                errors: errors,
                title: product.title,
                desc: product.desc,
                price: product.price,
                categories: categories,
                category: product.category.replace(/\s+/g,'-').toLowerCase(),
                image: product.image,
                galleryImages: galleryImages,
                id: product._id
            });
        }
    });
});

//POST edit product
router.post('/edit-product/:id', async(req, res) => {
    if(!req.files){ imageFile =""; }
    if(req.files){
    var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
    }
    
    // req.checkBody('title', 'Title must a value.').notEmpty();
    // req.checkBody('desc', 'Description must have a value.').notEmpty();
    // req.checkBody('price', 'Price must have a value.').isDecimal();
    // req.checkBody('image', 'You must upload an image').isImage(imageFile);

    // var title = req.body.title;
    // var slug = title.replace(/\s+/g, '-').toLowerCase();
    // var desc = req.body.desc;
    // var price = req.body.price;
    // var category = req.body.category;
    // var pimage = req.body.pimage;
    // var id = req.params.id;

    // var errors = req.validationErrors();

    // if(errors) {
    //     req.session.errors = errors;
    //     res.redirect('/admin/products/edit-product/' + id);
    // }else{
    //     const existProduct  = await Product.findOne({slug: slug, _id: {'$ne': id}});
    //     if(existProduct) {
    //         req.flash('danger', 'Product title exists, choose another.');
    //         res.redirect('/admin/products/edit-product/' + id)
    //     }else{
    //         const product = await Product.findById(id);
            
    //         product.title = title;
    //         product.slug = slug;
    //         product.desc = desc;
    //         product.price = parseFloat(price).toFixed(2);
    //         product.category = category;
    //         if (imageFile != "") {
    //             product.image = imageFile;
    //         }

    //         product.save((err) => {
    //             if(err) {
    //                 console.log(err);
    //             }

    //             if(imageFile != "") {
    //                 console.log('public/product_images' + id + '/' + pimage);
    //                 if(pimage != "") {
    //                     fs.remove('public/product_images' + id + '/' + pimage, (err) => {
    //                         if(err) console.log(err + '1'); 
    //                     });
    //                 } 

    //                 var productImage = req.files.image;
    //                 var path = 'public/product_images/' + id + '/' + imageFile;

    //                 productImage.mv(path, (err) => {
    //                     return console.log(err + '2');
    //                 });
    //             }

    //             req.flash('success', 'Product edited');
    //             res.redirect('/admin/products/edit-product/' + id);
    //         });
    //     }
    // }

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var pimage = req.body.pimage;
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id);
    } else {
        Product.findOne({slug: slug, _id: {'$ne': id}}, function (err, p) {
            if (err)
                console.log(err);

            if (p) {
                req.flash('danger', 'Product title exists, choose another.');
                res.redirect('/admin/products/edit-product/' + id);
            } else {
                Product.findById(id, function (err, p) {
                    if (err)
                        console.log(err);

                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;
                    if (imageFile != "") {
                        p.image = imageFile;
                    }

                    p.save(function (err) {
                        if (err)
                            console.log(err);

                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove('public/product_images/' + id + '/' + pimage, function (err) {
                                    if (err)
                                        console.log(err);
                                });
                            }

                            var productImage = req.files.image;
                            var path = 'public/product_images/' + id + '/' + imageFile;

                            productImage.mv(path, function (err) {
                                return console.log(err);
                            });

                        }

                        req.flash('success', 'Product edited!');
                        res.redirect('/admin/products/edit-product/' + id);
                    });

                });
            }
        });
    }
});

//POST product gallery
router.post('/product-gallery/:id', (req, res) => {
    
    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path, function(err) {
        if(err) console.log(err);

        resizeImg(fs.readFileSync(path), {width: 100, height: 100}).then(function(buf) {
            fs.writeFileSync(thumbsPath, buf);
        });
    });

    res.sendStatus(200);
});

//GET delete image
router.get('/delete-image/:image', isAdmin, (req, res) => {
    
    var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function(err) {
        if(err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, function(err) {
                if(err) {
                    console.log(err);
                } else {
                    req.flash('success', 'Image deleted!');
                    res.redirect('/admin/products/edit-product/' + req.query.id);
                }
            });
        }
    });
});

//Delete product
router.get('/delete-product/:id', isAdmin, function (req, res) {
    var id = req.params.id;
    var path = 'public/product_images/' + id;

    fs.remove(path, function(err) {
        if(err) {
            console.log(err);
        } else {
            Product.findByIdAndRemove(id, function(err) {
                console.log(err);
            });

            req.flash('success', 'Product deleted!');
            res.redirect('/admin/products');
        }
    });
});

module.exports = router;