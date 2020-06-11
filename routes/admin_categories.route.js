const express = require('express');
const router = express.Router();

const Category = require('../models/category.model');

//GET Admin categories
router.get('/', async(req, res) => {
    const categories = await Category.find();
    res.render('admin/categories', {
        categories: categories
    });
});

//GET add cate
router.get('/add-category', (req, res) => {
    var title = "";

    res.render('admin/add_category', {
        title: title
    });
});

//POST add cate
router.post('/add-category', async (req, res) => {
    req.checkBody('title', 'Title must a value.').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if(errors) {
        console.log(errors);
        res.render('admin/add_category', {
            errors: errors,
            title: title
        });
    }else{
        const cateExist = await Category.findOne({slug: slug});
        if(cateExist){
            req.flash('danger', 'Category slug exists, choose another.');
            res.render('admin/category', {
                title: title
            });
        }else{
            const category = new Category({
                title: title,
                slug: slug
            });

            category.save((err) => {
               if(err) {
                   console.log(err);
               }  

               Category.find((err, categories) => {
                    if(err) {
                        console.log(err);
                    } else {
                        req.app.locals.categories = categories;
                    }
               });
               
                req.flash('success', 'Category added!');
                res.redirect('/admin/categories');
            });       
        }
        
    }    
});

//GET edit cate
router.get('/edit-category/:id', async(req, res) => {
    const category = await Category.findById(req.params.id);
    res.render('admin/edit_category', {
        title: category.title,
        id: category._id
    });
});

//POST edit cate
router.post('/edit-category/:id', async (req, res) => {
    req.checkBody('title', 'Title must a value.').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var id = req.params.id;

    var errors = req.validationErrors();

    if(errors) {
        res.render('admin/edit_category', {
            errors: errors,
            title: title,
            id: id
        });
    }else{
        const cateExist = await Category.findOne({slug: slug, _id: {'$ne':id}});
        if(cateExist){
            req.flash('danger', 'Category title exists, choose another.');
            res.render('admin/edit_category', {
                title: title,
                id: id
            });
        }else{
            const category = await Category.findById(id);
            category.title = title;
            category.slug = slug;
            
            category.save((err) => {
                if(err) return console.log(err);

                Category.find((err, categories) => {
                    if(err) {
                        console.log(err);
                    } else {
                        req.app.locals.categories = categories;
                    }
               });

                req.flash('success', 'Category edited');
                res.redirect('/admin/categories/edit-category/' + id);
            });
        }
        
    }    
});

//GET delete cate
router.get('/delete-category/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id, (err) => {
        if(err) return console.log(err);

        Category.find((err, categories) => {
            if(err) {
                console.log(err);
            } else {
                req.app.locals.categories = categories;
            }
       });

        req.flash('success', 'Category deleted');
        res.redirect('/admin/categories');
    });
});
module.exports = router;