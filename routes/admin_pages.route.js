const express = require('express');
const router = express.Router();

const Page = require('../models/page.model');

//GET Admin pages
router.get('/', async(req, res) => {
    const pages = await Page.find().sort({sorting: 1});
    res.render('admin/pages', {
        pages: pages
    });
});

//GET add page
router.get('/add-page', (req, res) => {
    var title = "";
    var slug = "";
    var content = "";

    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content
    });
});

//POST add page
router.post('/add-page', async (req, res) => {
    req.checkBody('title', 'Title must a value.').notEmpty();
    req.checkBody('content', 'Content must have a value.').notEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(slug == '') slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;

    var errors = req.validationErrors();

    if(errors) {
        console.log(errors);
        res.render('admin/add_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        });
    }else{
        const pageExist = await Page.findOne({slug: slug});
        console.log(pageExist);
        if(pageExist){
            req.flash('danger', 'Page slug exists, choose another.');
            res.render('admin/add_page', {
                title: title,
                slug: slug,
                content: content
            });
        }else{
            const page = new Page({
                title: title,
                slug: slug,
                content: content,
                sorting: 100
            });

            await page.save((err) => {
               if(err) {
                   console.log(err);
               }     
            });

            req.flash('success', 'Page added!');
            res.redirect('/admin/pages');
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