var express = require('express');
var router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');

const User = require('../models/user.model');

/* GET register */
router.get('/register', (req, res) => {
  res.render('user/register', {
    title: 'Register',
  });
});

//POST register
router.post('/register', (req, res) => {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  req.checkBody('name', 'Name is required!').notEmpty();
  req.checkBody('email', 'Email is required!').isEmail();
  req.checkBody('username', 'Username is required!').notEmpty();
  req.checkBody('password', 'Password is required!').notEmpty();
  req.checkBody('password2', 'Passwords do not match!').equals(password);

  var errors = req.validationErrors();

  if(errors) {
    res.render('user/register', {
      errors: errors,
      title: 'Register'
    });
  } else {
    User.findOne({username: username}, (err, user) => {
      if(err) console.log(err);

      if(user) {
        res.flash('danger', 'Username exists, choose another');
        res.redirect('/users/register');
      } else {
        var user = new User ({
          name: name,
          email: email,
          username: username,
          password: password,
          admin: 0
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(user.password, salt, (err, hash) => {
            if(err) console.log(err);

            user.password = hash;

            user.save( err => {
              if(err) {
                console.log(err);
              } else {
                req.flash('success', 'You are now registered!');
                res.redirect('/users/login');
              }
            })
          });
        });
      }
    });
  }
});

module.exports = router;
