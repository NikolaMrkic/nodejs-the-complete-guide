const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProductById);

router.get('/cart', isAuth, shopController.getCart);

router.get('/orders', isAuth, shopController.getOrders);

router.post('/cart-delete-item', isAuth, shopController.postDeleteCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/create-order', isAuth, shopController.postOrder);

//router.get('/checkout', shopController.getCheckout);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

module.exports = router;
