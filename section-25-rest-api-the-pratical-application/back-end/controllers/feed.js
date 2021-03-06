const { body } = require("express-validator");
const fs = require('fs');
const path = require('path');

const Post = require("../models/post");
const StatusCode = require('../constants/statusCode');
const ValidationHelper = require('../util/validationHelper');
const User = require('../models/user');

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.find()
  .countDocuments()
  .then(count => {
    totalItems = count;
    const skip = (currentPage - 1) * perPage;
    return Post
            .find()
            .skip(skip)
            .limit(perPage);
    
  })
    .then(posts => {
      ValidationHelper.validateDataError(posts, 'Could not find post', StatusCode.NOT_FOUND);
      res.status(StatusCode.OK)
        .json({
          message: 'Fetched posts successfully.',
          posts: posts,
          totalItems: totalItems
        })
    })
    .catch(err => {
      ValidationHelper.internalServerError(err, next);
    });
};

exports.createPost = (req, res, next) => {
  ValidationHelper.validationResult(req, 'Validation failed, entered data is incorrect.');
  ValidationHelper.validateDataError(req.file);

  const { title, content } = req.body;
  const imageUrl = req.file.path;
  let creator;

  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId
  });

  post
    .save()
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then(result => {
      res.status(StatusCode.CREATED).json({ 
        message: "Post created successfully!", 
        post: post,
        creator: { _id: creator._id, name: creator.name }
      });
    })
    .catch(err => {
      ValidationHelper.internalServerError(err, next);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
  .then(post => {
    ValidationHelper.validateDataError(post, 'Could not find post', StatusCode.NOT_FOUND);
    res.status(StatusCode.OK).json({ 
      message: "Post fetched!", 
      post: post 
    });
  })
  .catch(err => {
    ValidationHelper.internalServerError(err, next);
  });
}

exports.updatePost = (req, res, next) => {
  ValidationHelper.validationResult(req, 'Validation failed, entered data is incorrect.');

  const { title, content, image, creator } = req.body;
  const imageUrl = image;
  if (req.file) {
    imageUrl = req.file.path;
  }

  ValidationHelper.validateDataError(imageUrl, 'No image picked', StatusCode.UNPRECESSABLE_ENTITY);

  Post.findById(postId)
  .then(post => {
    ValidationHelper.validateDataError(post, 'Could not find post', StatusCode.NOT_FOUND);

    if (post.creator.toString() !== req.userId.toString()) {
      ValidationHelper.validateDataError(null, 'Not authorized!', StatusCode.FORBIDDEN);
    }

    if (imageUrl != post.imageUrl) {
      clearImage(post.imageUrl);
    }
    post.title = title;
    post.imageUrl = imageUrl;
    post.content = content;
    return post.save();
  })
  .then(result => {
    res.status(StatusCode.OK).json({ 
      message: "Post updated!", 
      post: result 
    });
  })
  .catch(err => {
    ValidationHelper.internalServerError(err, next);
  });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      ValidationHelper.validateDataError(post, 'Could not find post', StatusCode.NOT_FOUND);
      
      if (post.creator.toString() !== req.userId.toString()) {
        ValidationHelper.validateDataError(null, 'Not authorized!', StatusCode.FORBIDDEN);
      }

      clearImage(post.imageUrl);
      return Post.findByIdAndDelete(postId);
    })
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      user.post.pull(postId);
      return user.save();
    })
    .then(result => {
      res.status(StatusCode.OK).json({ 
        message: "Deleted post!"
      });
    })
    .catch(err => {
      ValidationHelper.internalServerError(err, next);
    });
};

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};

exports.PostValidator = () => {
  return [
    body("title", "title invalid")
      .isString()
      .isLength({ min: 5 })
      .trim(),
    body("content", "Content invalid")
      .isString()
      .isLength({ min: 5 })
      .trim()
  ];
};
