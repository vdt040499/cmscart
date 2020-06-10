const express = require('express');
const router = express.Router();

const Page = require('../models/page.model');

router.get('/', async(req, res) => {
    const pages = await Page.find();
    res.render('admin/pages', {
        pages: pages
    });
});

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

module.exports = router;