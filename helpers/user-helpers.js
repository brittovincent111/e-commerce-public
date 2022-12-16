var db = require('../config/connection')
var collection = require('../config/collections')
var bcrypt = require('bcrypt')
const { USERSCOLLECTION } = require('../config/collections')
const { response } = require('express')
const collections = require('../config/collections')
const { ObjectId } = require('mongodb')
var objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay')
const { AddressConfigurationContext } = require('twilio/lib/rest/conversations/v1/addressConfiguration')
const { resolve } = require('path')
const { viewOrder } = require('./admin-helpers')
const CC = require("currency-converter-lt");


// paypal money converter



function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}

function formatDate(date) {
    return [

        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),

    ].join('-');
}


// razorPay

const paypal = require('paypal-rest-sdk')
const { Console } = require('console')

var instance = new Razorpay({
    key_id: process.env.KEYID,
    key_secret: process.env.KEYSECRET,
});


// paypal 

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.CLIENTID,
    'client_secret': process.env.CLIENTSECRET
});

module.exports = {
    dosignup: (userData) => {

        let response = {}
        return new Promise(async (resolve, reject) => {
            let email = await db.get().collection(collection.USERSCOLLECTION).findOne({ email: userData.email })
            let phone = await db.get().collection(collections.USERSCOLLECTION).findOne({ phone: userData.phone })

            if (email && phone) {
                response.status = true;

                resolve(response)

            }


            else {



                userData.wallet = 0

                userData.password = await bcrypt.hash(userData.password, 10)
                userData.state = true;

                if (userData.referralcode === "") {
                    let userdata = {

                        name: userData.name,
                        phone: userData.phone,
                        email: userData.email,
                        password: userData.password,
                        wallet: userData.wallet,
                        state: userData.state,
                        referral: '' + (Math.floor(Math.random() * 90000) + 10000)

                    }

                    await db.get().collection(collection.USERSCOLLECTION).insertOne(userdata).then(async (data) => {

                        resolve(data.insertedId)


                    })

                } else {

                    console.log(userData.referralcode, "referral coede")

                    let referralCheck = await db.get().collection(collections.USERSCOLLECTION).findOne({ referral: userData.referralcode })
                    console.log(referralCheck, "referral check")
                    if (referralCheck) {
                        console.log("refferal")
                        let userdata = {

                            name: userData.name,
                            phone: userData.phone,
                            email: userData.email,
                            password: userData.password,
                            wallet: 100,
                            state: userData.state,
                            referral: "" + (Math.floor(Math.random() * 90000) + 10000)

                        }
                        await db.get().collection(collection.USERSCOLLECTION).insertOne(userdata).then(async (data) => {


                            let refer = await db.get().collection(collections.USERSCOLLECTION).updateOne({ referral: userData.referralcode },
                                {
                                    $set: {
                                        wallet: referralCheck.wallet + 100
                                    }
                                })


                            resolve(data.insertedId)


                        })
                        response.status = false
                        resolve(response)

                    } else {


                        console.log("hiiiiiii")
                        response.referral = true
                        resolve(response)
                    }

                }




            }
        })



    },

    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            userData.state = true
            let user = await db.get().collection(collections.USERSCOLLECTION).findOne({ $and: [{ email: userData.email, state: userData.state }] })




            if (user) {

                console.log(user);
                bcrypt.compare(userData.Password, user.password).then((status) => {
                    console.log(status);
                    if (status) {
                        console.log("login sucess")
                        response.user = user;
                        response.user.status = true
                        response.status = true;
                        resolve(response)
                    }
                    else {
                        console.log("password wrong")
                        resolve({ status: false });
                    }
                })
            } else {
                console.log("user not found")
                resolve({ status: false })
            }
        })
    },

    // pagination to find page count 
    viewProdCount: () => {
        return new Promise(async (resolve, reject) => {
        let count  =    await db.get().collection(collections.PRODUCT).find().count()
           
        console.log(count , " counttttt")
        resolve(count)
        })
    },

    // view paginated products 

    getLimitProd :(startIndex,Limit)=>{
       

        console.log(startIndex , Limit , (startIndex-1)*Limit ," i am here ");
       
        return new Promise (async(resolve,reject)=>{




           let products = await db.get().collection(collections.PRODUCT).find().skip((startIndex-1)*Limit).limit(Limit).toArray()
        

           console.log(products , "aaaaaaaaaaaaaaaaaaaaaaaaa")
           resolve(products)   
        })
    },


    // view Products 

    viewProd: () => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collections.PRODUCT).find().toArray().then((data) => {
                resolve(data)
                // console.log(data)
            })

        })
    },
    // hot products 

    hotProd: () => {
        return new Promise(async (resolve, reject) => {

       let hotProd =  await db.get().collection(collections.PRODUCT).find().limit(8).toArray()
       resolve(hotProd)

        })

    },
    // get category name and id 

    getCategoryProduct: () => {


        return new Promise(async (resolve, reject) => {


            let category = await db.get().collection(collections.CATEGORY).find().toArray()
            console.log(category.category)

            resolve(category)
        })

    },
    // get products from category 
    viewCategoryProducts: (catId) => {

        return new Promise(async (resolve, reject) => {

            let products = await db.get().collection(collections.PRODUCT).find({ category: objectId(catId) }).toArray()


            console.log(products)
            resolve(products)
        })

    },
    viewSingleProd: (proID) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collections.PRODUCT).findOne({ _id: objectId(proID) }).then((data) => {
                resolve(data)
            })
        })
    },

    otpLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let phone = await db.get().collection(collections.USERSCOLLECTION).findOne({ phone: userData.phone })
            if (phone) {
                // client.verify.v2.services('VA72f1bdd7670f50b851c5a2f6ff269beb')
                //     .verificationChecks.create({
                //         to: `+91${phone}`,
                //         channel: "sms",
                //         code: otp,
                //     })
                //     .then((resp) => {
                //         resolve(resp)

                //     })
                resolve(phone)

            }
        })
    },

    //   banner view

    viewBanner: () => {
        return new Promise(async (resolve, reject) => {
            let banImg = await db.get().collection(collections.ADD_BANNER).find().toArray()
            resolve(banImg)
        })

    },
    addToCart: (ProId, userId) => {
        let prodObj = {
            item: objectId(ProId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {

            let userCart = await db.get().collection(collections.USERCART).findOne({ user: ObjectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(products => products.item == ProId)
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collections.USERCART).updateOne({
                        'products.item': objectId(ProId)
                    },
                        {

                            $inc: { 'products.$.quantity': 1 }
                        }
                    ).then(() => {
                        resolve({ status: false })
                    })
                }
                else {

                    db.get().collection(collections.USERCART).updateOne({ user: ObjectId(userId) },
                        {
                            $push:

                                { products: prodObj }


                        }

                    ).then(() => {

                        resolve({ status: true })
                    })

                }

            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [prodObj]


                }
                db.get().collection(collections.USERCART).insertOne(cartObj).then((response) => {
                    console.log(response)
                    resolve({ status: true })
                })

            }

        })

    },



    // cart 
    getCartProduct: (userId) => {
        return new Promise(async (resolve, reject) => {

            let cartItems = await db.get().collection(collections.USERCART).aggregate([
                {
                    $match: {
                        user: objectId(userId)
                    }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: {
                            $arrayElemAt: ['$product', 0]
                        }


                    }
                }

            ]).toArray()
            console.log(cartItems)
            resolve(cartItems)
        })
    },
    getCartCount: (userId) => {

        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collections.USERCART).findOne({ user: ObjectId(userId) })
            console.log(cart)
            if (cart) {
                // let proExist = userCart.products.findIndex(products => products.cart == ProId)
                count = cart.products.length
                console.log(count, " count  ")
                resolve(count)
            }
            else {
                resolve(count)
            }
        })

    },
    // getCartCount: (userId) => {

    //     return new Promise(async (resolve, reject) => {
    //         let count = 0
    //         let cart = await db.get().collection(collections.USERCART).aggregate([{
    //             $match:{ user: ObjectId(userId) }
    //         },{
    //             $unwind:"$products"
    //         },
    //         {
    //             $group:{
    //                 _id:'$products._id',
    //                 count:{
    //                     $sum:1
    //                 }

    //             }
    //         }
    //         // ,{
    //         //     $project:{
    //         //         count:1,
    //         //         _id:0
    //         //     }
    //         // }

    //         ])

    //         if (cart) {
    //             console.log(cart[0].count)
    //             // let proExist = userCart.products.findIndex(products => products.cart == ProId)
    //             // count = cart.products.length
    //             resolve(cart[0].count)
    //         }
    //         else {
    //             resolve(count)
    //         }
    //     })

    // },

    // change product quantity


    changeProdCount: (details) => {
        count = parseInt(details.count)
        products = parseInt(details.quantity)
        console.log(details, "details")
        return new Promise(async (resolve, reject) => {

            db.get().collection(collections.USERCART).updateOne({
                _id: objectId(details.cart),
                'products.item': objectId(details.product)
            },
                {

                    $inc: { 'products.$.quantity': count }
                }
            ).then((response) => {
                resolve({ status: true })
            })




        })

    },

    // final total  

    getAmountTotal: (userId) => {
        return new Promise(async (resolve, reject) => {

            let total = await db.get().collection(collections.USERCART).aggregate([
                {
                    $match: {
                        user: objectId(userId)
                    }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: {
                            $arrayElemAt: ['$product', 0]
                        }


                    }
                },

                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: {
                                $multiply: [

                                    {
                                        $toInt: '$quantity'
                                    }, {
                                        $toInt: '$product.price'
                                    }

                                ]
                            }
                        }
                    }
                }


            ]).toArray()
            // console.log(total[0].total,"total")
            if (total.length != 0) {
                resolve(total[0].total)
            } else {
                resolve()
            }

        })

    },

    // increment in sub total 
    getAmount: (details) => {

        console.log(details, "details xyz")
        return new Promise(async (resolve, reject) => {

            let subTotal = await db.get().collection(collections.USERCART).aggregate([
                {
                    $match: {
                        user: objectId(details.user)
                    }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                }, {
                    $match: {
                        item: objectId(details.product)
                    }

                },
                {
                    $lookup: {
                        from: collections.PRODUCT,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        _id: 0,
                        quantity: 1,
                        product: {
                            $arrayElemAt: ['$product', 0]
                        }


                    }
                },

                {
                    $project: {

                        total: {

                            $multiply: [


                                {
                                    $toInt: '$quantity'
                                },
                                {
                                    $toInt: '$product.price'
                                }



                            ]
                        }

                    }
                }


            ]).toArray()
            if (subTotal.length != 0) {
                console.log(subTotal, "total single")
                resolve(subTotal[0].total)
            } else {
                resolve()
            }


        })    

    },

    cartCheck: (userId) => {

       return new Promise(async (resolve, reject) => {

            let cartCheck = await db.get().collection(collections.USERCART).findOne({ user: objectId(userId) })
            console.log(cartCheck)
            if(cartCheck.products == ""){
                let cartProd = true
                console.log(cartProd , "kbkhkhvkhbddddddddddddddddddd")
                resolve(cartProd)

            }else {
                

                let cartProduct = (cartCheck.products).length
                

                let cartProd = false
                console.log(cartProd , "kbkhkhvkhb")
    
                resolve(cartProd)

                
            }
           

        })
    },


    // get amount array  
    getAmountArray: (userId) => {
        return new Promise(async (resolve, reject) => {

            let subTotal = await db.get().collection(collections.USERCART).aggregate([
                {
                    $match: {
                        user: objectId(userId)
                    }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        _id: 0,
                        quantity: 1,
                        product: {
                            $arrayElemAt: ['$product', 0]
                        }


                    }
                },  

                {
                    $project: {

                        total: {

                            $multiply: [


                                {
                                    $toInt: '$quantity'
                                }, {
                                    $toInt: '$product.price'
                                }



                            ]
                        }

                    }
                }


            ]).toArray()
            console.log(subTotal, "total single")
            resolve(subTotal)
        })

    },

    getCartProdList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let carts = await db.get().collection(collections.USERCART).findOne({ user: objectId(userId) })
            console.log(carts.products);
            resolve(carts.products)
        })

    },

    viewSingleProd: (ProdId) => {
        return new Promise(async (resolve, reject) => {
            let productName = await db.get().collection(collections.PRODUCT).aggregate([
                {
                    $lookup: {
                        from: collections.CATEGORY,
                        localField: 'category',
                        foreignField: '_id',
                        as: 'category'
                    }
                }, {


                    $match: { _id: objectId(ProdId) }
                },



                {
                    $project: {
                        category: { $arrayElemAt: ['$category', 0] },
                        productname: 1,
                        productid: 1,
                        price: 1,
                        image: 1,
                        descripition: 1,
                        ogAmount: 1




                    }
                }

            ]).toArray()
            console.log(productName, "gghfgh");
            resolve(productName[0])
        })
    },

    // related Products 
    relatedProd: (cat) => {
        return new Promise(async (resolve, reject) => {

            let prod = await db.get().collection(collections.PRODUCT).find({ category: cat }).limit(5).toArray()

            resolve(prod)
        })

    },


    //   delete cart product 

    deleteCartProduct: (prodId, userId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collections.USERCART).updateOne({ user: objectId(userId) },
                {
                    $pull: {
                        products:
                        {
                            item: objectId(prodId.product)
                        }
                    }
                }).then((responce) => {
                    resolve(responce)
                })
        })

    },
    //  add address 


    addAddress: (address, user) => {

        return new Promise(async (resolve, reject) => {


            await db.get().collection(collections.ADDRESS).insertOne({
                user: objectId(user),

                address: address
            })


            resolve(response)
        })

    },


    viewAddress: (user) => {



        return new Promise(async (resolve, reject) => {


            await db.get().collection(collections.ADDRESS).find({ user: objectId(user) }).toArray().then((response) => {

                console.log(response)
                resolve(response)
            })
        })
    },



    //   place Order 

    placeOrder: (order, products, price,wallet,ogAmount,couponDis) => {

        return new Promise(async (resolve, reject) => {

            let status = order.payment_method === 'cod' ? 'placed' : 'pending'
            let orders = await db.get().collection(collections.ADDRESS).findOne({ _id: objectId(order.address) })
            let orderObj = {
                deliveryDetails: {

                    firstname: orders.address.firstname,
                    lastname: orders.address.lastname,
                    add1: orders.address.add1,
                    add2: orders.address.add2,
                    country: orders.address.country,   
                    states: orders.address.states,
                    pincode: orders.address.pincode  
                },
                userId: objectId(order.userId),
                paymentMethod: order.payment_method,
                products: products,
                totalAmount: price,
                wallet : wallet,
                status: status,
                ogAmount : ogAmount,
                couponDis : couponDis,
                date: new Date()
            }

            await db.get().collection(collections.ORDER).insertOne(orderObj).then(async (response) => {
                //   await db.get().collection(collections.USERCART).deleteOne({user:objectId(order.userId)}).then((response)=>{
                console.log(response)
                resolve(response)
                //    })

            })

        })


    },

    getUserOrder: (userId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collections.ORDER).find({ userId: objectId(userId) }).sort({ date: -1 }).toArray()
                .then((data) => {
                    resolve(data)
                })
        })
      
    },

    // update wallet when cancel
    updateWallet: (amount,paymentMethod, userDataAmount, userId) => {
        return new Promise(async (resolve, reject) => {

            if(paymentMethod == 'razorpay' || paymentMethod == 'paypal' || paymentMethod == 'wallet'){
                
          
            await db.get().collection(collections.USERSCOLLECTION).updateOne({ _id: objectId(userId) }, {

                $set: {

                    wallet: amount + userDataAmount
                }
            })

            resolve(response)
        }else{


            resolve()
        }

        })


    },
    cancelOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collections.ORDER).updateOne({ _id: objectId(orderId) },
                {
                    $set: {
                        status: "cancelled"
                    }
                }).then((response) => {
                    resolve(response)
                })
        })

    },


    // return order 
    returnOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collections.ORDER).updateOne({ _id: objectId(orderId) },
                {
                    $set: {
                        status: "returned"
                    }
                }).then((response) => {
                    resolve(response)
                })
        })

    },




    generateRazorpay: (orderId, total) => {

        return new Promise((resolve, reject) => {
            var options = {
                amount: 100 * total, // amount in the smallest currency unit
                currency: "INR",
                receipt: "" + orderId
            };
            instance.orders.create(options, function (err, order) {
                console.log(order, "order at userhelpers")
                resolve(order)
            })

        })



    },

    userProfile: (userId) => {
        return new Promise(async (resolve, reject) => {

            await db.get().collection(collections.USERSCOLLECTION).findOne({ _id: objectId(userId) }).then((data) => {
                resolve(data)
            })
        })
    },

    //    view Address
    getAddress: (addId) => {

        return new Promise(async (resolve, reject) => {


            await db.get().collection(collections.ADDRESS).findOne({ _id: objectId(addId) }).then((response) => {


                resolve(response)
            })
        })
    },

    // edit Address

    editAddress: (data) => {
        return new Promise(async (resolve, reject) => {
            let address = {

                firstname: data.firstname,
                lastname: data.lastname,
                add1: data.add1,
                add2: data.add2,
                country: data.country,
                states: data.states,
                city: data.city,

                pincode: data.pincode
            }


            await db.get().collection(collections.ADDRESS).updateOne({ _id: objectId(data.id) }, {

                $set: {
                    address: address
                }

            }).then((response) => {
                console.log(response)
                resolve(response)
            })
        })

    },

    deleteAddress :(addId)=>{



    return new Promise(async(resolve,reject)=>{



        await db.get().collection(collections.ADDRESS).deleteOne({_id:objectId(addId)}).then((response)=>{


            resolve(response)
        })
    })
    },

    updatePassword: (Password, userData) => {
        let response = {};
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collections.USERSCOLLECTION).findOne({ _id: objectId(userData) })
            await bcrypt.compare(Password.oldPassword, user.password).then(async (status) => {
                if (status) {
                    let hashedpassword = await bcrypt.hash(Password.password, 10);
                    await db.get().collection(collections.USERSCOLLECTION).updateOne({
                        email: user.email
                    }, {
                        $set: {
                            password: hashedpassword
                        }
                    }).then((response) => {
                        response.updatepass = true;
                        resolve(response);
                    });
                } else {
                    response.updatepass = false;
                    resolve(response);
                }
            });
        });
    },
    //    update user details

    updateUser: (userId, userData) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collections.USERSCOLLECTION).update({ _id: objectId(userId) }, {
                $set: {
                    name: userData.name,
                    phone: userData.phone,
                    email: userData.email
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },



    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require("crypto");
            let hmac = crypto.createHmac('sha256', 'UJGlxLKYm3FfRRVcZSP3bIDf')

            hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id)
            hmac = hmac.digest('hex')

            console.log(hmac)

            if (hmac == details.payment.razorpay_signature) {
                resolve()

            } else {
                reject()

            }
        })
    },

    changePaymentStatus: (orderId) => {
        console.log(orderId)

        return new Promise(async (resolve, reject) => {
            db.get().collection(collections.ORDER).updateOne({ _id: ObjectId(orderId) },
                {
                    $set: {
                        status: 'placed'
                    }
                }).then((response) => {
                    response.placed = true
                    resolve(response)
                })
        })
    },


    cartClear: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orderDelete = await db.get().collection(collections.USERCART).deleteOne({ user: objectId(userId) })
            resolve(orderDelete)
        })



    },



    // orderview new single products ( to get order product details )

    fullOrder: (userId) => {

        return new Promise(async (resolve, reject) => {
            let allProduct = await db.get().collection(collections.ORDER).aggregate([
                {
                    $match: { userId: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $lookup: {
                        from: collection.PRODUCT,
                        localField: 'products.item',
                        foreignField: '_id',
                        as: 'products'
                    }
                }, {

                    $project: {
                        deliveryDetails: 1,
                        userId: 1,
                        paymentMethod: 1,
                        totalAmount: 1,
                        status: 1,
                        date: 1,
                        product: { $arrayElemAt: ['$products', 0] }
                    }

                }

            ]
            ).toArray()
            console.log(allProduct)
            resolve(allProduct)
        })

    },

    // full order view ( to get order details)
    singlefullOrder: (orderId) => {

        return new Promise(async (resolve, reject) => {
            let allProduct = await db.get().collection(collections.ORDER).findOne({ _id: objectId(orderId) })
            console.log(allProduct.totalAmount)
            resolve(allProduct)
        })

    },


    // single Order
    viewOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let viewSingleOrder = await db.get().collection(collections.ORDER).findOne({ _id: objectId(orderId) })
            resolve(viewSingleOrder)
            console.log(viewSingleOrder)
        })

    },



    // view single order main
    viewSingleOders: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let viewProd = await db.get().collection(collections.ORDER).aggregate([
                {
                    $match: {
                        _id: objectId(orderId)
                    }
                },
                {
                    $unwind: '$products'
                }, {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'

                    }
                }, {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            resolve(viewProd)
            console.log(viewProd)

        })
    },


    // PAYPAL MONEY 

    converter: (price) => {
        return new Promise((resolve, reject) => {
          let currencyConverter = new CC({
            from: "INR",
            to: "USD",
            amount: price,
            isDecimalComma: false,
          });
          currencyConverter.convert().then((response) => {
            resolve(response);
          });
        });
      },

    // paypal 


    generatePayPal: (orderId, totalPrice) => {

        console.log(orderId, totalPrice)
        return new Promise((resolve, reject) => {
            const create_payment_json = {
                intent: "sale",
                payer: {
                    payment_method: "paypal",
                },
                redirect_urls: {
                    return_url: "http://helgray.ml/order-success",
                    cancel_url: "http://helgray.ml/order-failed",
                },
                transactions: [
                    {
                        item_list: {
                            items: [
                                {
                                    name: "Red Sox Hat",
                                    sku: "001",
                                    price: totalPrice,
                                    currency: "USD",
                                    quantity: 1,
                                },
                            ],
                        },
                        amount: {
                            currency: "USD",
                            total: totalPrice,
                        },
                        description: "Hat for the best team ever",
                    },
                ],
            };

            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;
                } else {

                    resolve(payment);
                    console.log(payment)
                }
            });
        });
    },

    // apply coupon 

    //     applyCoupon: (data, user) => {


    //         let date = new Date()


    //         let couponId = data.coupon
    //         console.log(couponId)
    //         //   let date = formatDate(new Date()) 
    //         return new Promise(async (resolve, reject) => {

    //             let checkCoupon = await db.get().collection(collections.COUPON).findOne({ couponid: couponId })
    //             console.log(checkCoupon)

    //             let expdate = new Date(checkCoupon.enddate)
    //             console.log(expdate)
    //             if (checkCoupon) {

    //                 let checkUsed = await db.get().collection(collections.USERSCOLLECTION).findOne({ coupon: objectId(checkCoupon._id) })
    //                 console.log(checkUsed)
    //                 if (checkUsed) {
    //                     console.log("coupon used")
    //                     response.checkUsed = true
    //                     response.couponUpdate = false
    //                     response.checkCoupon = false
    //                     resolve(response)
    //                 } else {

    //                     if (date <= expdate) {
    //                         // let couponUpdate =  await db.get().collection(collections.USERSCOLLECTION).updateOne({_id:objectId(user)},
    //                         // {

    //                         //     $push:{

    //                         //          coupon:objectId(checkCoupon._id)
    //                         //     }
    //                         // })
    // // response.couponDate= false
    //                         response.couponUpdate = false
    //                     response.checkCoupon = false
    //                         response.state = true
    //                         resolve(response)
    //                         console.log(response , " ,,,,,,,,,,,,,,,,,,,,,,,,,,")


    //                     } else {

    //                         response.state = false
    //                         response.checkUsed = false
    //                         response.couponUpdate = false
    //                         response.checkCoupon = true

    //                         resolve(response)
    //                     }
    //                 }

    //             } else {
    //                 response.checkUsed = false
    //                 response.couponUpdate = false
    //                 response.checkCoupon = true
    //                 resolve(response)
    //             }

    //         })


    //     },

    couponFinal: (data) => {

        return new Promise(async (resolve, reject) => {

            await db.get().collection(collections.COUPON).findOne({ couponid: data.coupon }).then((response) => {

                resolve(response)
            })



        })
    },




    applyCoupons: (data, user) => {


        let date = new Date()
        let couponId = data.coupon
        console.log(couponId)

        return new Promise(async (resolve, reject) => {


            let checkCoupon = await db.get().collection(collections.COUPON).findOne({ couponid: couponId })



            //  coupon check 
            if (checkCoupon) {
                let couponDetails = {
                    couponid: checkCoupon.couponid,
                    couponname: checkCoupon.couponname,
                    couponper: checkCoupon.couponper,
                    Lprice: checkCoupon.Lprice,
                    Hprice: checkCoupon.Hprice,
                    enddate: checkCoupon.enddate,
                    coupondesc: checkCoupon.coupondesc

                }
                let expdate = new Date(checkCoupon.enddate)
                let checkUsed = await db.get().collection(collections.USERSCOLLECTION).findOne({ _id: objectId(user), "coupon": objectId(checkCoupon._id) })
                if (checkUsed) {
                    response.state = false
                    response.checkCoupon = false
                    response.couponDate = false
                    response.couponUsed = true
                    resolve(response)
                } else {
                    if (date <= expdate) {
                        let cartInsert = await db.get().collection(collections.USERCART).updateOne({ user: objectId(user) },
                            {
                                $set: { couponDet: couponDetails }

                            })
                        let cartDetails = await db.get().collection(collections.USERCART).findOne({ user: objectId(user) })


                        console.log(cartDetails)
                        response.cartClear = cartDetails

                        response.checkCoupon = false
                        response.couponDate = false
                        response.couponUsed = false
                        response.state = true
                        resolve(response)
                    } else {

                        response.checkCoupon = false
                        response.state = false
                        response.couponUsed = false
                        response.couponDate = true
                        resolve(response)
                    }


                }

            } else {
                response.state = false
                response.couponDate = false
                response.couponUsed = false
                response.checkCoupon = true
                resolve(response)

            }






        })



    },


    getUserWallet: (userId) => {


        return new Promise(async (resolve, reject) => {

            await db.get().collection(collections.USERSCOLLECTION).findOne({ _id: objectId(userId) }).then((data) => {

                resolve(data)
            })
        })
    },
    //    check amount greater than wallet 
    checkWalletAmount: (userId) => {

        return new Promise(async (resolve, reject) => {

            await db.get().collection(collections.USERSCOLLECTION).findOne({ _id: objectId(userId) }).then((response) => {

                resolve(response)
            })
        })
    },

    substractWallet: (userId) => {


        return new Promise(async (resolve, reject) => {

            let sub = await db.get().collection(collections.USERSCOLLECTION).updateOne({ _id: objectId(userId) },

                {
                    $set: {

                        wallet: 0
                    }
                })
            resolve(sub)
        })



    },
    //    check wallet balance for  gerater wallet 
    walletBalance: (wallet, userId) => {


        return new Promise(async (resolve, reject) => {

            await db.get().collection(collections.USERSCOLLECTION).updateOne({ _id: objectId(userId) },
                {
                    $set: {

                        wallet: wallet
                    }
                }).then((response) => {

                    resolve(response)
                })
        })
    },

    placeOrderWallet: (order, products, price,wallet,ogAmount,couponDis) => {

        return new Promise(async (resolve, reject) => {
            console.log(order, products, price);

            let orders = await db.get().collection(collections.ADDRESS).findOne({ _id: objectId(order.address) })
            let orderObj = {
                deliveryDetails: {

                    firstname: orders.address.firstname,
                    lastname: orders.address.lastname,
                    add1: orders.address.add1,
                    add2: orders.address.add2,
                    country: orders.address.country,
                    states: orders.address.states,
                    pincode: orders.address.pincode
                },
                userId: objectId(order.userId),
                paymentMethod: "wallet",
                products: products,
                wallet : wallet,
                totalAmount: price,
                status: "placed",
                ogAmount : ogAmount,
                couponDis : couponDis,
                date: new Date()
            }

            await db.get().collection(collections.ORDER).insertOne(orderObj).then(async (response) => {
                //   await db.get().collection(collections.USERCART).deleteOne({user:objectId(order.userId)}).then((response)=>{
                console.log(response)
                resolve(response)
                //    })

            })

        })
    },


    // add to wallet back paypal 

    fixWallet : (wallet,userId) => {


        return new Promise(async(resolve,reject)=>{

            let order = await db.get().collection(collections.ORDER).find({userId:objectId(userId)}).sort( {date :-1}).limit(1).toArray()
             let update =   await db.get().collection(collections.ORDER).updateOne({_id:objectId(order[0]._id)},
            {

                $set:{
                    
                    status : "pending"
                }
            })
            console.log(order,"orederss")

            let wallets = await db.get().collection(collections.USERSCOLLECTION).findOne({_id:objectId(userId)})

            console.log(wallets,"walletsssssssssss")

            await db.get().collection(collections.USERSCOLLECTION).updateOne({_id:objectId(userId)},
            {

                $set:{
                    wallet : wallets.wallet + order[0].totalAmount 
                }
            })
         resolve()  

        })
    },  



    couponVerify: (user, couponid) => {

        return new Promise(async (resolve, reject) => {

            let response = await db.get().collection(collections.USERCART).findOne({ user: objectId(user), "couponDet.couponid": couponid })

            if (response) {
                response.state = true

                resolve(response)

            } else {


                statee = true
                resolve(statee)
            }


        })
    },


    removeCoupon: (user) => {

        return new Promise(async (resolve, reject) => {

            await db.get().collection(collections.USERCART).updateOne({ user: objectId(user) }, {


                $unset: {

                    couponDet: ""
                }
            }).then((response) => {

                resolve(response)
            })
        })
    },

    // add cupon id to user

    AddUserCoupon: (data, user) => {

        return new Promise(async (resolve, reject) => {


            await db.get().collection(collections.USERSCOLLECTION).updateOne({ _id: objectId(user) }, {


                $push: {
                    coupon: objectId(data._id)

                }
            })
        })


    },

    //    get coupon id before adding to user 
    getOfferId: (offer) => {

        return new Promise(async (resolve, reject) => {

            await db.get().collection(collections.COUPON).findOne({ couponid: offer }).then((response) => {

                resolve(response)
            })
        })


    },


    addToWishlist: (ProId, userId) => {
        let prodObj = {
            item: objectId(ProId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {

            let userWish = await db.get().collection(collections.WISHLIST).findOne({ user: ObjectId(userId) })
            console.log(userWish, "userWish");

            if (userWish) {


                let proExist = userWish.products.findIndex(products => products.item == ProId)

                if (proExist != -1) {


                    response.inserted = false
                    response.wishAdded = true
                    response.wish = false
                    resolve(response)

                } else {

                    await db.get().collection(collections.WISHLIST).updateOne({ user: ObjectId(userId) },
                        {
                            $push:

                                { products: prodObj }


                        }


                    ).then((response) => {

                        response.wishAdded = false
                        response.wish = true
                        response.inserted = false
                        resolve(response)
                    })

                }
            }
            else {
                let cartObj = {
                    user: objectId(userId),
                    products: [prodObj]


                }
                db.get().collection(collections.WISHLIST).insertOne(cartObj).then((response) => {
                    console.log(response)
                    resolve(response)
                })

                response.wishAdded = false
                response.wish = false
                response.inserted = true
                resolve(response)



            }
        })
    },


    // delete from wishlist 
    deleteToWishlist: (proId, userId) => {

        return new Promise(async (resolve, reject) => {

            await db.get().collection(collections.WISHLIST).updateOne({ user: objectId(userId) },
                {

                    $pull: {
                        products:
                        {
                            item: objectId(proId)
                        }
                    }
                }).then((response) => {

                    resolve(response)
                })

        })


    },

    // view wishlist

    getWishProduct: (userId) => {
        return new Promise(async (resolve, reject) => {

            let cartItems = await db.get().collection(collections.WISHLIST).aggregate([
                {
                    $match: {
                        user: objectId(userId)
                    }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: {
                            $arrayElemAt: ['$product', 0]
                        }


                    }
                }

            ]).toArray()
            console.log(cartItems)
            resolve(cartItems)
        })
    },


    addWishCart: (userId, ProId) => {
        let prodObj = {
            item: objectId(ProId),
            quantity: 1
        }


        return new Promise(async (resolve, reject) => {

            let check = await db.get().collection(collections.USERCART).findOne({ user: objectId(userId) })

            if (check) {
                let items = await db.get().collection(collections.USERCART).findOne({ user: objectId(userId), 'products.item': objectId(ProId) })

                if (items) {


                    console.log("hiii")

                    response.inserted = false
                    response.check = true
                    resolve(response)


                } else {

                    await db.get().collection(collections.USERCART).updateOne({ user: ObjectId(userId) },
                        {
                            $push:

                                { products: prodObj }


                        }).then((response) => {


                            console.log(response, "hello")
                            response.check = false
                            response.inserted = true
                            resolve(response)
                        })


                }

            } else {


                let cartObj = {
                    user: objectId(userId),
                    products: [prodObj]


                }
                db.get().collection(collections.USERCART).insertOne(cartObj).then((response) => {



                    response.check = false
                    response.inserted = true
                    console.log(response)
                    resolve(response)
                })
            }
        })
    },


    deleteWishlist: (proId, userId) => {

        return new Promise(async (resolve, reject) => {


            await db.get().collection(collections.WISHLIST).updateOne({ user: objectId(userId) },
                {

                    $pull: {
                        products:
                        {
                            item: objectId(proId)
                        }
                    }
                }).then((response) => {

                    resolve(response)
                })
        })
    },

    couponDet: () => {


        return new Promise(async (resolve, reject) => {

            await db.get().collection(collections.COUPON).find().toArray().then((response) => {

                resolve(response)
            })
        })
    }



}