const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const AllProducts = require('../models/allproducts')
const Cart = require('../models/cart')
const Users = require('../models/users')
const {paginate} = require('../middleware/pagination')

// Get All AllProducts route
router.get('/', paginate(AllProducts), async (req, res) => {
  res.json(res.paginatedResult);
})


router.post('/login', async (req, res) => {
  const user = await Users.findOne({email: req.body.email})

  if(!user){
    return res.status(404).send({
      message: "User not found"
    })
  }

  const invalidCredetials = await bcrypt.compare(req.body.password, user.password)
  if(!invalidCredetials){
    return res.status(400).send({
      message: "Invalid Credentials"
    })
  }

  const token = jwt.sign({ _id: user._id }, "secret")

  res.cookie('jwt', token, {
    httpOnly: true,
    // sameSite: 'none',
    //secure: true,
    maxAge: 24 * 60 * 60 * 1000 //1 day validity
  }).json({token})

//  res.send({
//    message: "Success"
//   })
  // res.json(token)
})

router.get('/user', async (req, res) => {
  try {
    const cookie = req.cookies['jwt']

    const claims = jwt.verify(cookie, "secret")

    if(!claims){
      return res.status(401).send({
        message: "Unauthenticated."
      })
    }

    const user = await Users.findOne({_id: claims._id})

    // const {password, ...data} = await user.toJSON();
    const data = await user.toJSON();

    res.send(data)
  } catch (error) {
    return res.status(401).send({
      message: "Unauthenticated."
    })
  }
})

router.post('/logout', async (req, res) => {
  // res.cookie('jwt', '', {maxAge: 0})
  res.clearCookie('jwt')
    res.sendStatus(204)

  // res.send({
  //   message: "success"
  // })
})

router.post('/signup', async (req, res) => {

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(req.body.password, salt)

  const newUser = new Users({
    full_name: req.body.full_name,
    email: req.body.email,
    password: hashedPassword,
    address: req.body.address,
    role: req.body.role
  });

  const addUser = await newUser.save()
  const {password, ...data} = await addUser.toJSON();
  res.send(data)
})

// Add new Product
router.post('/add_product', async (req, res) => {
  
  const newProduct = new AllProducts(
    req.body // What the Vue App is sending
  ); 
  const saveProduct = await newProduct.save() // mongo save method
  res.json(saveProduct) // respond with json to our post endpoint
});

// Add new Product
router.post('/csv_products', async (req, res) => {
  
  const newProduct = await AllProducts.insertMany(req.body)
  // const saveProduct = await newProduct.save() // mongo save method
  res.json(newProduct) // respond with json to our post endpoint
});

// Getter by id
router.get('/product/:id', async (req, res) => {
  const data = await AllProducts.findById({ _id : req.params.id })
  res.json(data)
})

// Delete a Product by id
router.delete('/delete/:id', async (req, res) => {
  const deleteProduct = await AllProducts.findByIdAndDelete({ _id : req.params.id })
  res.json(deleteProduct)
})

router.delete('/deleteAll/', async (req, res) => {
  const deleteAllProducts = await AllProducts.deleteMany()
  res.json(deleteAllProducts)
})

// Update a Product by id
router.put('/update/:id', async (req, res) => {
  const updateProduct = await AllProducts.updateOne(
    { _id: req.params.id }, 
    { $set: req.body }
  )
  res.json(updateProduct)
})





//CART

router.get('get_cart_data', async (req, res) => {
  const cartData = await Cart.findOne({userId: req.id})
  res.send(cartData)
})

router.post('/add_to_cart', async (req, res) => {
  
  const newCart = new Cart(
    req.body // What the Vue App is sending
  ); 
  const saveCart = await newCart.save() // mongo save method
  res.json(saveCart) // respond with json to our post endpoint
});

// Update a Cart Product by id
router.put('/update_cart_item/:id', async (req, res) => {
  const updateCartProduct = await Cart.updateOne(
    { _id: req.params.id }, 
    { $set: req.body }
  )
  res.json(updateCartProduct)
})

// Delete a Product by id
router.delete('/delete_cart_item/:id', async (req, res) => {
  const deleteProductFromCart = await Cart.findByIdAndDelete({ userId : req.params.id })
  res.json(deleteProductFromCart)
})

router.delete('/deleteAll/', async (req, res) => {
  const deleteAllProducts = await Cart.deleteMany()
  res.json(deleteAllProducts)
})





module.exports = router