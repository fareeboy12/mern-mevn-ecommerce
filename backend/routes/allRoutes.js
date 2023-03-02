const express = require('express');
const router = express.Router();
const AllProducts = require('../models/allproducts')
const { paginate } = require('../middleware/pagination')
const { userLogin, userData, userLogout, userSignup, profileUpdate } = require('../controller/userController');
const { getAllProducts, addProduct, csvImport, getProductById, deleteById, deleteAllProducts, updateById } = require('../controller/productController');
const { getCart, postCart, deleteCart, deleteAll } = require('../controller/cartController');
const { getOrderById, postOrderData } = require('../controller/orderController')
const { getWishlist, addToWishlist, deleteWishlist } = require('../controller/wishlistController')

// User routes
router.route('/user').get(userData).patch(profileUpdate)
router.route('/login').post(userLogin)
router.route('/logout').post(userLogout)
router.route('/signup').post(userSignup)

// All AllProducts routes
router.route('/').get(paginate(AllProducts), getAllProducts)
router.route('/add_product').post(addProduct)
router.route('/csv_products').post(csvImport)
router.route('/product/:id').get(getProductById)
router.route('/delete/:id').delete(deleteById)
router.route('/deleteAll').delete(deleteAllProducts)
router.route('/update/:id').put(updateById)

// Cart Routes
router.route('/cart').get(getCart).post(postCart).put(postCart)
router.route('/delete_cart_item/:userId/:productId').delete(deleteCart)
router.route('/deleteAll').delete(deleteAll)

// Wishlist Routes
router.route('/wishlist').get(getWishlist).post(addToWishlist)
router.route('/delete_wishlist_item/:userId/:productId').delete(deleteWishlist)

//Order Routes
router.route('/order/:id').get(getOrderById)
router.route('/order').post(postOrderData)

module.exports = router