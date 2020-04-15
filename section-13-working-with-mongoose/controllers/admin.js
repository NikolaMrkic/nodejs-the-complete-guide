const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product
    .find()
      .then(products => {
        console.log("getproducts", products)
        res.render('admin/products', {
          prods: products,
          pageTitle: 'Admin Products',
          path: '/admin/products'
        });
      })
      .catch(err => console.log(err));
};

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  //const userId = req.user._id;

  const product = new Product({
    title: title, 
    price: price, 
    description: description, 
    imageUrl: imageUrl 
  });

  product
    .save()
      .then(result => {
        console.log("Created", result)
        res.redirect('/admin/products');
      })
      .catch(err => {
        console.log(err);
      });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  console.log(editMode)
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product
    .findById(prodId)
      .then(product => {
        if (!product) {
          return res.redirect('/');
        }
        res.render('admin/edit-product', {
          pageTitle: 'Edit Product',
          path: '/admin/edit-product',
          editing: editMode,
          product: product
        });
      })
      .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  Product
    .findById(prodId)
    .then(product => {
      product.title = title;
      product.imageUrl = imageUrl;
      product.price = price;
      product.description = description;

      return product.save();
    })
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));  
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  console.log('delete', prodId)
  Product.deleteById(prodId)
    .then((result) => {
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};