const { response, Router } = require('express');
var express = require('express');
const session = require('express-session');
const { Db } = require('mongodb');
const { TodayInstance } = require('twilio/lib/rest/api/v2010/account/usage/record/today');
const { COUPON } = require('../config/collections');

     
const userHelpers = require('../helpers/user-helpers');
var router = express.Router();
var userHelper = require('../helpers/user-helpers')
var ObjectID = require('mongodb').ObjectId
const client = require('twilio')(process.env.ACCOUNTSID, process.env.AUTHTOKEN);


  
// hi i am brittoooooooo  

// usgihcvagshijgdashdijiiiiiiiijjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
let cartcount
let user
let wallet 
  
let userAuth = (req, res, next) => {
  if (req.session.user) {
    wallet = req.session.user.wallet

    // req.session.user.cartCount =  userHelper.getCartCount(req.session.user._id)
    //  let cartCount =req.session.user.cartCount  

    next()

  } else {

    res.redirect('/user_signin')
  }
}



let cartCount
/* GET users landingpage */
router.get('/', async (req, res, next) => {
  let user = req.session.user
  console.log(typeof (user))
  let bannerImg = await userHelper.viewBanner()

  let category = await userHelper.getCategoryProduct()

  let hotProd = await userHelper.hotProd()
  // let cartCount=0
  if (req.session.user) {

    req.session.user.cartCount = await userHelper.getCartCount(req.session.user._id)
    cartCount = req.session.user.cartCount
  } else {
    cartCount = 0
  }

  //   console.log(cartCount)
  res.render('user/user-dashboard', { user, cartCount, category, bannerImg, userlogin: true, hotProd })



});

// Get loginpage
router.get('/user_signin', function (req, res, next) {
  if (req.session.LoggedIn) {
    res.redirect('/')

  } else {
    cartCount = 0
    res.render('user/user-signin', { loginErr: req.session.loginErr, cartCount, userlogin: false })
    req.session.loginErr = false
  }
})

// Post loginPge

router.post('/user_signin', function (req, res, next) {
  // console.log(req.body)
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.LoggedIn = true;
      req.session.user = response.user
      // req.session.user._id=response.user._id

      res.redirect('/')
    } else {

      req.session.loginErr = true;
      res.redirect('/user_signin')
    }
  })

})
// Get Signup page
router.get('/user_signup', function (req, res, next) {
  if (req.session.LoggedIn) {
    req.session.signErr = false
    res.redirect('/')
  } else {

    sigErr = req.session.sigErr
    signErr = req.session.signErr
    console.log(signErr)
    res.render('user/user-signin', { signErr, sigErr })
    req.session.signErr = false;
    req.session.sigErr = false;

  }

})


// post signup

router.post('/user_signup', function (req, res, next) {
  userHelper.dosignup(req.body).then((response) => {
    if (response.status) {
      req.session.signErr = true;
      res.redirect('/user_signup')
      console.log("sinerr");
    } else if (response.referral) {

      req.session.sigErr = true;
      res.redirect('/user_signup')

    }
    else {



      res.redirect('/user_signin')

    }
  })



})

// get mobile-otp 
router.get('/user-otp-mobile', function (req, res) {
  res.render('user/user-otpmobile')
})
// otp post

let userDatas
router.post('/user_otp', (req, res) => {
  userHelper.otpLogin(req.body).then((data) => {

    userDatas = data
    console.log(data)
    if (data) {

      console.log(data)

      client.verify.v2.services(process.env.SERVICESID)
        .verifications
        .create({ to: `+91${userDatas.phone}`, channel: 'sms' })
        .then((dat) => {

          console.log(dat)
          resolve(dat)
        });

      console.log("hello")
      userData = req.body.phone
      res.redirect('/user-otp')
    }

  })
})

router.get('/user-otp', (req, res) => {

  res.render('user/user-otp')

})

router.post('/confirm-ottp', (req, res) => {
  const otp = req.body.otp;
  let number = req.body.phone
  console.log(number)
  client.verify.v2.services(process.env.SERVICESID)
    .verificationChecks.create({
      to: `+91${userDatas.phone}`,
      channel: "sms",
      code: otp,
    })
    .then((resp) => {
      if (resp.valid == false) {
        // req.session.otp = true;

        console.log(resp)
        res.redirect('/user_signup')
        // let otpvalidation = req.session.otp;
        // res.send("Success")
      } else {
        console.log(resp.valid)
        console.log("sucess")
        console.log(otp)
        req.session.user = true
        req.session.user = userDatas
        res.redirect('/')
      }


    });

})



//  Get logout

router.get('/logout', (req, res, next) => {
  req.session.user = null
  req.session.LoggedIn = null
  res.redirect('/')
})


// // view products

router.get('/view_products', async (req, res, next) => {
  let user = req.session.user




  let category = await userHelper.getCategoryProduct()


   let count = await  userHelpers.viewProdCount()   
   
   let pageNum = parseInt(count) /6

   console.log(Math.ceil(pageNum))
    
   let p=[]
   for(i=0;i<pageNum;i++){

     p[i]=i+1      
   }   

   console.log(p , 'ppppp')



    userHelpers.getLimitProd(1,6).then((data) => { 
     

    res.render('user/user-viewproduct', { data, user, category, cartCount,p, userlogin: true })
  })

})   
  

// change page
    
router.get('/view-product',async(req,res)=>{
  let user = req.session.user  
 



  let category = await userHelper.getCategoryProduct()


   let count = await  userHelpers.viewProdCount()   
 
   let pageNum = parseInt(count) /6

   console.log(Math.ceil(pageNum))
    
   let p=[]
   for(i=0;i<pageNum;i++){

     p[i]=i+1         
   }   

   console.log(p , 'ppppp')

   console.log('change') 
  console.log(req.query,"query")

  let startIndex = parseInt(req.query.page)
  let Limit = parseInt(req.query.li) 


    await userHelper.getLimitProd(startIndex,Limit).then((data)=>{

    
      res.render('user/user-viewproduct', { data, user, category, cartCount,p, userlogin: true })
    })
})


// modal product 
router.get('/product-modal/:id', (req, res) => {

  let products = userHelper.viewSingleProd(req.params.id)
  res.json(products)


})
   
// view single category products 

router.get('/view-catgory-products/:id', userAuth, async (req, res) => {

  console.log(req.params.id)
  user = req.session.user


  let category = await userHelper.getCategoryProduct()

  await userHelper.viewCategoryProducts(req.params.id).then((data) => {



    res.render('user/user-category', { data, category, user, cartCount, userlogin: true })

  })

})
// // view single product

// router.get('/view_single/:id',userAuth,(req,res)=>{
//   let proID =req.params.id;
//   let user=req.session.user
//    let cartCount=req.session.user.cartCount
//   userHelper.viewSingleProd(proID).then((data)=>{
//     console.log(data)
//     res.render('user/view-single',{data,user,cartCount})
//   })
// })   

// view single products 

router.get('/view_single/:id', userAuth, (req, res) => {
  let proID = req.params.id;
  let user = req.session.user
  //  let cartCount=req.session.user.cartCount
  userHelper.viewSingleProd(proID).then(async (data) => {
    console.log(data.category._id)
    let relatedProd = await userHelper.relatedProd(data.category._id)

    res.render('user/view-single', { data, user, cartCount, relatedProd, userlogin: true })
  })
})

// Add To Cart 


router.get('/add-to-cart/:id', userAuth, (req, res) => {


  console.log("api call");
  userHelper.addToCart(req.params.id, req.session.user._id).then((response) => {
    // res.redirect('/')
    res.json(response)
  })




})


router.get('/user_cart', userAuth, async (req, res) => {
  total = 0
  let subtotal
  let user = req.session.user
  cartCount = await userHelper.getCartCount(req.session.user._id)

  // let cartCount=req.session.user.cartCount
  let products = await userHelper.getCartProduct(req.session.user._id)
  let totalAmount = await userHelper.getAmountTotal(req.session.user._id)
  subtotal = await userHelpers.getAmountArray(req.session.user._id)
  for (var i = 0; i < products.length; i++) {
    products[i].subTotal = subtotal[i].total
    console.log(products[i].subTotal, "SUBTOTAL")
  }


  // console.log(Amount);

  // console.log(totalAmount);
  // console.log(products)
  res.render('user/user-cart', { products, user, totalAmount, cartCount, userlogin: true })
})


// change product quqntity

router.post('/changeProductQuantity', (req, res, next) => {
  userHelpers.changeProdCount(req.body).then(async (response) => {
    console.log(req.body, "body")
    response.total = await userHelpers.getAmountTotal(req.body.user)
    // response.totalSingle = await userHelpers.getAmount(req.body)
    response.subtotal = await userHelpers.getAmount(req.body)
    console.log(response)
    res.json(response)

  })


})

// delete product in cart 

router.post('/delete-cart-product', async (req, res) => {
  cartCount = await userHelper.getCartCount(req.session.user._id)
  await userHelper.deleteCartProduct(req.body, req.session.user._id)
  res.json({ status: true })
  console.log("second delete");

})


// add address 

router.post("/add-address", async (req, res) => {

  let address = await userHelper.addAddress(req.body, req.session.user._id)

  res.redirect('/place-order')

})


// get oreder placed (checkout)  

router.get('/place-order', userAuth, async (req, res) => {

  let cartCheck = await userHelper.cartCheck(req.session.user._id)

  if (cartCheck) {

    res.redirect('/view_products')


  } else {


    let address = await userHelper.viewAddress(req.session.user._id)

    let totalAmount = await userHelpers.getAmountTotal(req.session.user._id)
    let userData = await userHelper.userProfile(req.session.user._id)
    let userId = req.session.user._id
    let user = req.session.user

    // req.session.user.cartCount =  userHelper.getCartCount(req.session.user._id)
    // let cartCount =req.session.user.cartCount
    // let cartCount=req.session.user.cartCount
    res.render('user/user-checkout', { totalAmount, user, userId, cartCount, userData, userlogin: true, address })


  }

})

// post place order 

router.post('/place-order', async (req, res) => {

  let couponDis = 0
  console.log(req.body.address, "adresssssssssssssssssssssssssssssss")
  let products = await userHelper.getCartProdList(req.session.user._id)
  let totalPrice = await userHelper.getAmountTotal(req.body.userId)
  let user = await userHelper.getUserWallet(req.session.user._id)
  wallet = user.wallet
   
  let ogAmount = totalPrice

  let couponVerify = await userHelper.couponVerify(req.session.user._id, req.body.couponcode)
  //    


  if (couponVerify.state) {
    userHelper.getOfferId(req.body.couponcode).then((data) => {

      userHelper.AddUserCoupon(data, req.session.user._id)

    })

    if (req.body.walletamount == "now") {
      if (totalPrice > wallet) {
  
        console.log("hellooooooo")



        let substract = await userHelper.substractWallet(req.session.user._id)



        console.log("call reached ")
        totalAmount = ((1 - couponVerify.couponDet.couponper / 100) * totalPrice)
         couponDis = totalPrice - totalAmount
        totalPrice = totalAmount - wallet
        await userHelper.placeOrder(req.body, products, totalAmount,wallet,ogAmount,couponDis).then(async(response) => {
          let orderId = response.insertedId
          console.log(orderId, "orderId")
          if (req.body['payment_method'] == 'cod') {
            let resp = userHelper.cartClear(req.session.user._id)


            response.cod = true
            res.json(response)
          }
          else if (req.body['payment_method'] == 'razorpay') {
            userHelper.generateRazorpay(orderId, totalPrice).then((response) => {
              console.log(response, " response recevied")
              response.razorpay = true
              res.json(response)
            })

          } else if (req.body['payment_method'] == 'paypal') {



            let price = await  userHelper.converter(totalPrice)
                let convertPrice = parseInt(price);

            console.log(orderId, totalPrice, "orderId,totalPrice")

            userHelper.generatePayPal(orderId.toString(), price ).then(async (response) => {
              let statusChange = await userHelpers.changePaymentStatus(orderId)
              response.payPal = true;
              console.log(response, "response")
              res.json(response)



            })
          }

        })
      } else if (totalPrice < wallet) {



        console.log("call reached jbkb ")
        let totalAmount = (1 - couponVerify.couponDet.couponper / 100) * totalPrice

        let walletAmount = wallet - totalAmount
         couponDis = totalPrice - totalAmount

        let walletBalance = await userHelper.walletBalance(walletAmount, req.session.user._id)
        await userHelper.placeOrderWallet(req.body, products, totalAmount,couponDis).then((response) => {
          let removeCart = userHelper.cartClear(req.session.user._id)

          response.wallet = true
          res.json(response)
        })



      }

    }

    else {


      totalAmount = ((1 - couponVerify.couponDet.couponper / 100) * totalPrice)
       couponDis = totalPrice - totalAmount

      await userHelper.placeOrder(req.body, products, totalAmount,wallet,ogAmount,couponDis).then(async(response) => {
        let orderId = response.insertedId
        console.log(orderId, "orderId")
        if (req.body['payment_method'] == 'cod') {
          let resp = userHelper.cartClear(req.session.user._id)


          response.cod = true
          res.json(response)
        }
        else if (req.body['payment_method'] == 'razorpay') {
          let price =  await userHelper.converter(totalPrice)
          userHelper.generateRazorpay(orderId, price).then((response) => {
            console.log(response, " response recevied")
            response.razorpay = true
            res.json(response)
          })

        } else if (req.body['payment_method'] == 'paypal') {





          console.log(orderId, totalPrice, "orderId,totalPrice")

          userHelper.generatePayPal(orderId.toString(), totalPrice).then(async (response) => {
            let statusChange = await userHelpers.changePaymentStatus(orderId)
            response.payPal = true;
            console.log(response, "response")
            res.json(response)



          })
        }

      })   


    }



  }
  else if (statee) {

    if (req.body.walletamount == "now") {

      if (totalPrice > wallet) {


        totalAmount = totalPrice - wallet
        let substract = await userHelper.substractWallet(req.session.user._id)
        await userHelper.placeOrder(req.body, products, totalPrice,wallet,ogAmount,couponDis).then(async(response) => {
          let orderId = response.insertedId
          console.log(orderId, "orderId")
          if (req.body['payment_method'] == 'cod') {
            let resp = userHelper.cartClear(req.session.user._id)


            response.cod = true
            res.json(response)
          }
          else if (req.body['payment_method'] == 'razorpay') {
            userHelper.generateRazorpay(orderId, totalAmount).then((response) => {
              console.log(response, " response recevied")
              response.razorpay = true
              res.json(response)
            })

          } else if (req.body['payment_method'] == 'paypal') {



            let price =  await userHelper.converter(totalPrice)

            console.log(orderId, totalPrice, "orderId,totalPrice")

            userHelper.generatePayPal(orderId.toString(), price).then(async (response) => {
              let statusChange = await userHelpers.changePaymentStatus(orderId)
              response.payPal = true;
              console.log(response, "response")
              res.json(response)






            })
          }

        })
      }
      else if (totalPrice < wallet) {

       couponDis = 0

        let walletAmount = wallet - totalPrice

        let walletBalance = await userHelper.walletBalance(walletAmount, req.session.user._id)
        await userHelper.placeOrderWallet(req.body, products, totalPrice,wallet,ogAmount,couponDis).then((response) => {

          let removeCart = userHelper.cartClear(req.session.user._id)

          response.wallet = true
          res.json(response)
        })

      }
    } else {
      

      wallet =0

      await userHelper.placeOrder(req.body, products, totalPrice,wallet,ogAmount,couponDis).then(async(response) => {
        let orderId = response.insertedId
        console.log(orderId, "orderId")
        if (req.body['payment_method'] == 'cod') {
          let resp = userHelper.cartClear(req.session.user._id)


          response.cod = true
          res.json(response)
        }
        else if (req.body['payment_method'] == 'razorpay') {
          userHelper.generateRazorpay(orderId, totalPrice).then((response) => {
            console.log(response, " response recevied")
            response.razorpay = true
            res.json(response)
          })

        } else if (req.body['payment_method'] == 'paypal') {

       
          let price =  await userHelper.converter(totalPrice)
          // let convertPrice = parseInt(price);
         console.log(typeof(totalPrice))


          console.log(orderId, totalPrice, "orderId,totalPrice")

          userHelper.generatePayPal(orderId.toString(), price).then(async (response) => {
            let statusChange = await userHelpers.changePaymentStatus(orderId)
            let removeCart = userHelper.cartClear(req.session.user._id)
            response.payPal = true;
            console.log(response, "response")
            res.json(response)






          })
        }

      })




    }
  }

})

  

router.post("/check-wallet-amount", async (req, res) => {

  console.log(req.body.amount)
  let data = await userHelper.checkWalletAmount(req.session.user._id)

  if (data.wallet > req.body.amount) {
    response.status = true
    res.json(response)
  }
})


// full order showing page 

// router.get('/user_order',async(req,res)=>{ 

//   let orders= await userHelper.getUserOrder(req.session.user._id)
//   let cartCount=req.session.user.cartCount
//   console.log(orders)
//   res.render('user/user-order',{user,orders,cartCount,userlogin:true})

// }) 

// router.get('/view-singleorder/:id',(req,res)=>{
//   let orderId = req.params.id
//   // let singleOrder =  userHelpers.viewOrder(orderId)
//   res.render('user/user-singleorder')

// }) 

// full order showing main   
router.get('/user-vieworders', async (req, res) => {
  let user = req.session.user
  let orders = await userHelper.fullOrder(req.session.user._id)
  res.render('user/user-vieworder', { orders, userlogin: true, cartCount, user })
})



// cancel order 

router.get('/cancel_order/:id', async (req, res) => {
  let orderId = req.params.id
  let orderList = await userHelper.singlefullOrder(orderId)
  let userData = await userHelper.userProfile(req.session.user._id)
  console.log(typeof (userData.wallet))
   let updateWallet = await userHelper.updateWallet(orderList.totalAmount,orderList.paymentMethod,userData.wallet,req.session.user._id)
  
  userHelper.cancelOrder(orderId).then((response) => {
    res.redirect('/user-profile')

  })
})    

router.get('/return_order/:id', async (req, res) => {
  let orderId = req.params.id
  let orderList = await userHelper.singlefullOrder(orderId)
  let userData = await userHelper.userProfile(req.session.user._id)
  console.log(typeof (userData.wallet))
   let updateWallet = await userHelper.updateWallet(orderList.totalAmount,orderList.paymentMethod,userData.wallet,req.session.user._id)
  
  userHelper.returnOrder(orderId).then((response) => {
    res.redirect('/user-profile')

  })
}) 

  
// verify razorpay 
router.post('/verify-payment', async (req, res) => {
  console.log(req.body, 'reached at verify payment')
  await userHelpers.verifyPayment(req.body).then(() => {
    console.log('verify payment completed'),
      console.log(req.body, 'req.bosy')
    userHelpers.changePaymentStatus(req.body.order.receipt).then(() => {

      let removeCart = userHelper.cartClear(req.session.user._id)



      // let response = {};
      response.status = true
      // response.insertedId = insertedIds
      res.json(response)
    }).catch((err) => {
      console.log(err)
      res.json({ status: false })
    })
  })
})


// user Profile

router.get('/user-profile', userAuth, async (req, res) => {
  let user = req.session.user
  let userId = req.session.user._id
  let orders = await userHelper.getUserOrder(req.session.user._id)
  let couponDetails = await userHelper.couponDet()

  let address = await userHelper.viewAddress(req.session.user._id)
  userHelper.userProfile(userId).then((data) => {

    res.render('user/user-profile', { data, orders,user, couponDetails, address, userlogin: true, passErr: req.session.user.updatepass, cartCount })
    req.session.user.updatepass = false
  })
})

// update profile 

router.post('/update-account', (req, res) => {
  let userId = req.session.user._id
  userHelper.updateUser(userId, req.body).then((data) => {
    res.redirect('/user-profile')
  })
})


router.get('/edit-address/:id', async (req, res) => {
  user = req.session.user

  let Address = await userHelper.getAddress(req.params.id)
  let data = Address
  res.render("user/address-edit", { data, user,cartCount,userlogin: true })

})
 

// address edit
router.post('/edit-address', (req, res) => {
  // let userId= req.session.user._id  
  console.log(req.body) 
  userHelper.editAddress(req.body).then((response) => {
    res.redirect('/user-profile')
  })
})


// delete address 

router.get('/delete-address/:id',(req,res)=>{


  userHelper.deleteAddress(req.params.id).then((response) => {
    res.redirect('/user-profile')

  })



})

// update password  
router.post('/update-password', (req, res) => {
  console.log(req.body)
  userHelper.updatePassword(req.body, req.session.user._id).then((response) => {
    if (response.updatepass) {
      res.redirect('/user-profile')
    } else {
      req.session.user.updatepass = true
      res.redirect('/user-profile')

    }
  })
})


// view products from oreder  

router.get('/view-single-order/:id', async (req, res) => {
  orderId = req.params.id
  let user = req.session.user
  let orders = await userHelper.viewSingleOders(orderId)
  let orderList = await userHelper.singlefullOrder(orderId)
  console.log(orderList);
  res.render('user/user-vieworder', { orders, orderList, user, cartCount, userlogin: true })
})


// order success page   


router.get('/order-success',userAuth, (req, res) => {
  // await userHelpers.changePaymentStatus(req.body.order.receipt).then((response)=>{
    cartCount = 0
    let user = req.session.user
  let resp = userHelper.cartClear(req.session.user._id)


  res.render('user/user-success',{cartCount,user})
  // })   

})

router.get('/order-failed',userAuth, (req, res) => {
  // await userHelpers.changePaymentStatus(req.body.order.receipt).then((response)=>{
    console.log(wallet , "walletttt")

     let fixWallet = userHelper.fixWallet(wallet,req.session.user._id)

  res.render('user/failure',{cartCount})
  // }) 

})
  

router.get('/clear-cart', (req, res) => {

  let resp = userHelper.cartClear(req.session.user._id)

  res.redirect('/user_cart')

})


// view coupons 

// router.get('/view-coupons',(req,res)=>{
// res.render('user/view-coupons')

// })


// apply COUPON 

router.post('/apply-coupon', userAuth, async (req, res) => {
  console.log(req.body.coupon)

  let user = req.session.user._id
  await userHelper.applyCoupons(req.body, user).then(async (response) => {


    let totalPrice = await userHelper.getAmountTotal(user)





    if (response.state) {
      if (response.cartClear.couponDet.Lprice < totalPrice) {
        response.totalAmount = (1 - response.cartClear.couponDet.couponper / 100) * totalPrice
        response.discountAmount = totalPrice - response.totalAmount
        console.log(response, " response")
        response.states = true
        response.unstates = false
        res.json(response)
      } else {


        console.log("hiiii")
        response.states = false
        response.unstates = true
        res.json(response)
      }
    } else {




      res.json(response)


    }


    // }
    // else {
    //   console.log('your coupon amount is not valid')
    // }
  })

})


// remove coupon 

router.post('/remove-coupon', async (req, res) => {


  let user = req.session.user._id
  await userHelpers.removeCoupon(req.session.user._id).then(async (response) => {
    response.totalAmount = await userHelpers.getAmountTotal(user)

    res.json(response)
  })
})

// view product wishlist 
router.get('/add-to-wishlist/:id', userAuth, async (req, res) => {


  prodId = req.params.id
  console.log(prodId)

  await userHelpers.addToWishlist(prodId, req.session.user._id).then((response) => {

    res.json(response)
  })
})


//  view product remove from wishlist 
router.get('/delete-to-wishlist/:id', userAuth, async (req, res) => {


  prodId = req.params.id
  console.log(prodId)

  await userHelpers.deleteToWishlist(prodId, req.session.user._id).then((response) => {

    res.json(response)
  })
})







// view wishlist page

router.get('/view-wishlist', userAuth, async (req, res) => {

  let products = await userHelpers.getWishProduct(req.session.user._id)
  user = req.session.user
  

  res.render('user/user-wishlist', { products, cartCount, user })
})


// wishlist to cart 
router.post('/add-wish-product', async (req, res) => {

  console.log(req.body)

  await userHelper.addWishCart(req.session.user._id, req.body.product).then((response) => {


    res.json(response)
  })
})

//  delete wishlist 
router.post('/delete-wishlist-product', userAuth, async (req, res) => {


  await userHelper.deleteWishlist(req.body.product, req.session.user._id).then((response) => {

    res.json(response)
  })
})



// CONTACUS 

router.get("/contact-us", (req, res) => {
  let user = req.session.user

  res.render('user/contact-us', { user, cartCount })
})

// view single category 

module.exports = router;
