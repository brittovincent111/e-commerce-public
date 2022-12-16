var db = require('../config/connection')
var collection = require('../config/collections')
var bcrypt = require('bcrypt')
const { USERSCOLLECTION } = require('../config/collections')
const { response } = require('express')
const collections = require('../config/collections')
const { ObjectId } = require('mongodb')
var objectId = require('mongodb').ObjectId  

   
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



module.exports = {




  viewUsers: () => {

    return new Promise(async (resolve, reject) => {
      let data = await db.get().collection(collections.USERSCOLLECTION).find().toArray()
      resolve(data)

    })

  },


  addProduct: (productData) => {
    return new Promise(async (resolve, reject) => {
      productData.category = objectId(productData.category)
      productData.ogAmount = productData.price
      let offper=0   
      productData.offerper = (offper).toString()
      await db.get().collection(collections.PRODUCT).insertOne(productData).then((data) => {
        console.log(data)
        resolve(data)
      })
    })

  },

  addCategory: (categorydata) => {
    return new Promise(async (resolve, reject) => {
      let cat = await db.get().collection(collections.CATEGORY).findOne({ category: categorydata.category })
      if (cat) {
        response.status = false
        resolve(response)

      } else {
        await db.get().collection(collections.CATEGORY).insertOne(categorydata).then((response) => {
          response.status = true
          resolve(response)

        })

      }

    })
  },
  // addSubCategory:(categorydata)=>{
  //   return new Promise(async(resolve,reject)=>{
  //     await db.get().collection(collections.SUBCATEGORY).insertOne(categorydata).then((data)=>{
  //       resolve(data)

  //     })
  //   })
  // },
  getCategory: () => {
    return new Promise(async (resolve, reject) => {
      let data = await db.get().collection(collections.CATEGORY).find().toArray()
      console.log(data)
      resolve(data)
    })

  },

  // view category

  viewCategory: () => {
    return new Promise(async (resolve, reject) => {
      let cat = await db.get().collection(collections.CATEGORY).find().toArray()
      resolve(cat)

    })
  },


  // VIEW edit category

  viewEditCategory: (catId) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collections.CATEGORY).findOne({ _id: objectId(catId) }).then((data) => {
        resolve(data)
      })
    })
  }
  ,

  // post edit category

  editCategory: (catId, catData) => {
    console.log(catId, "catid")
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.CATEGORY).updateOne({ _id: objectId(catId) },
        {
          $set: {
            category: catData.category,
             image:catData.image     
          }
        }).then((response) => {
          resolve(response)
        })
    })
  },
  deleteCat: (catId) => {
    return new Promise(async (resolve, reject) => {

      catCheck = await db.get().collection(collections.PRODUCT).findOne({ category: objectId(catId) })

      if (catCheck) {
        console.log(catCheck, "catcheck")
        response.category = true
        resolve(response)
      } else {


        response.category = false
        resolve(response)
      }
    })

  },

  //  delete checked category

  deleteChecked: (catId) => {

    return new Promise(async (resolve, reject) => {
      let check = await db.get().collection(collections.CATEGORY).deleteOne({ _id: objectId(catId) })
      resolve(check)

    })
  },

  //  category lookup 

  lookup: () => {
    return new Promise(async (resolve, reject) => {
      let data = await db.get().collection(collections.CATEGORY).aggregate([{

        $lookup: {
          from: 'subcategory',
          localField: '_id',
          foreignField: 'category',
          as: 'bookings'
        }
      }]).toArray().then((data) => {

        resolve(data)
      });

      resolve(data)
    })
  },

  // block user

  blockUser: (proId) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collections.USERSCOLLECTION).updateOne({ _id: objectId(proId) }, { $set: { state: false } }).then((data) => {
        console.log(data)
        resolve(data)
      })
    })
  },

  unblockUser: (proId) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collections.USERSCOLLECTION).updateOne({ _id: objectId(proId) }, { $set: { state: true } }).then((data) => {
        console.log(data)
        resolve(data)
      })
    })
  },

  // view products

  viewProducts: () => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collections.PRODUCT).find().toArray().then((data) => {
        resolve(data)
      })
    })
  },

  // view products 
  viewProduct: () => {
    return new Promise(async (resolve, reject) => {
      let categoryName = await db.get().collection(collections.PRODUCT).aggregate([
        {
          $lookup: {
            from: collections.CATEGORY,
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },



        {
          $project: {
            category: { $arrayElemAt: ['$category', 0] },
            productname: 1,
            productid: 1,
            price: 1,
            image: 1,
            descripition: 1




          }
        }

      ]).toArray()
      console.log(categoryName, "gghfgh");
      resolve(categoryName)
    })
  },

  // delete product 

  deleteProduct: (proID) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collections.PRODUCT).deleteOne({ _id: ObjectId(proID) }).then((data) => {
        resolve(data)
      })
    })
  },

  // delete banner 

  deleteBanner: (banId) => {
    console.log(banId.proId);
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collections.ADD_BANNER).deleteOne({ _id: objectId(banId.proId) }).then((response) => {
        resolve(response)
      })
    })
  },
  // get product 

  // getProduct:()=>{
  //   return new Promise(async(resolve,reject)=>{
  //     await db.get().collection(collections.PRODUCT).findOne()
  //   })
  // },


  getUpdateProduct: (proID) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collections.PRODUCT).findOne({ _id: objectId(proID) }).then((data) => {
        resolve(data)
      })
    })
  },

  updateProduct: (proID, productData) => {
    return new Promise(async (resolve, reject) => {

      let img = await db.get().collection(collections.PRODUCT).findOne({_id:objectId(proID)})
      
      console.log(productData , "bbbbbbbbbbbbbbbb")
      console.log(img , " mmmmmmmmmmmm");
      if(productData.image  == ''){
         productData.image = img.image
           

      }else{
   
        productData.image = productData.image
        console.log(productData.image , "qqqqqqqqqqqqqqqq")
      }
      await db.get().collection(collections.PRODUCT).updateOne({ _id: objectId(proID) }, {
        $set: {
          productid: productData.productid,
          productname: productData.productname,
          price: productData.price,
          category: objectId(productData.category),
          image: productData.image,
          descripition: productData.descripition

        }
      }).then((data) => {
        // console.log(productid)
        resolve(data)
      })
    })
  },


  // view banner
  viewBanner: () => {
    return new Promise(async (resolve, reject) => {
      let viewBanner = await db.get().collection(collections.ADD_BANNER).find().toArray()
      resolve(viewBanner)
    })
  },

  addBanner: (bannerData) => {
    return new Promise(async (resolve, reject) => {
      console.log(bannerData)
      let addBanner = await db.get().collection(collections.ADD_BANNER).insertOne(bannerData)
      resolve(addBanner)
    })
  },

  editBanner: (bannerID) => {
    return new Promise(async (resolve, reject) => {
      let editBanner = await db.get().collection(collections.ADD_BANNER).findOne({ _id: objectId(bannerID) })
      resolve(editBanner)
    })
  },
  updateBanner: (banId, banData) => {
    return new Promise(async (resolve, reject) => {
      let updateBan = await db.get().collection(collections.ADD_BANNER).updateOne({
        _id: objectId(banId)
      }, {
        $set: {
        
          bannername: banData.bannername,
          image: banData.image,
          des1: banData.des1,
          des2: banData.des2

        }
      })


      resolve(updateBan)
    })

  },
  findCategory: (catId) => {
    return new Promise(async (resolve, reject) => {
      let find = await db.get().collection(collections.CATEGORY).findOne({ _id: objectId(catId) })

      resolve(find)
    })
  },

  // view order 

  viewOrder: () => {
    return new Promise(async (resolve, reject) => {
      let Allorders = await db.get().collection(collections.ORDER).find().sort({ date: -1 }).toArray()
      resolve(Allorders)
    })
  },

  // change order status 

  changeStatus: (ordId, data) => {
    return new Promise(async (resolve, reject) => {
      let Status = await db.get().collection(collections.ORDER).updateOne({ _id: objectId(ordId) },
        {   
          $set: {  
            status: data.status
  
          }
        })

      resolve(Status)
    })

  },  

  //  get line chart 

  yearlyChart: () => {
    return new Promise(async (resolve, reject) => {

      let yearChart = await db.get().collection(collections.ORDER).aggregate([
        {
          $match: {
            status: "placed",


          }
        }, {

          $project: {

            year: {
              $year: '$date'
            },
            totalAmount: 1
          }
        }, {
          $group: {
            _id: "$year",
            totalAmount: {
              $sum: "$totalAmount"
            }
          }
        }, {

          $sort: {
            _id: 1
          }

        },
        {

          $limit: 10
        }



      ]).toArray()
      console.log(yearChart);
      resolve(yearChart)
    })



  },

  paymentGraph: () => {

    return new Promise(async (resolve, reject) => {
      let order = await db.get().collection(collections.ORDER).aggregate([
        {
          $match: {
            status: 'placed'
          }
        },
        {
          $group: {
            _id: "$paymentMethod",
            totalAmount: {
              $sum: "$totalAmount"
            }
          }
        }

      ]).toArray()
      console.log(order)
      resolve(order)
    })
  },

  //  view total number of users 

  userStatus: () => {

    return new Promise(async (resolve, reject) => {

      let user = await db.get().collection(collections.USERSCOLLECTION).count({state:true})
      console.log(user,"user")

           resolve(user)
    })
  },
  

  // order count dashboard 

  orderCountWeekly: () => {
    
    
    return new Promise(async (resolve, reject) => {

        let date = formatDate(new Date()) 

        console.log(date)
      // let todayDate = newDate()

      await db.get().collection(collections.ORDER).find({

        date:{
          $gte: new Date((new Date().getTime() - (7 * 24 * 60 * 60 * 1000)))
        },
        
          "status": { $nin: ['cancelled', 'pending'] }

        
      }).count()
      .then((orderStatus) => {
        console.log(orderStatus)
        resolve(orderStatus)
      })
    })
  },


  orderCountDaily: () => {
    
    
    return new Promise(async (resolve, reject) => {

        let date = formatDate(new Date()) 

        console.log(date)
      // let todayDate = newDate()

          await db.get().collection(collections.ORDER).find({

        date:{
          $gte: new Date((new Date().getTime() - (1 * 24 * 60 * 60 * 1000)))
        },
        
          "status": { $nin: ['cancelled', 'pending'] }

        
      }).count()
      .then((orderStatus) => {
        console.log(orderStatus)
        resolve(orderStatus)
      })
    })
  },
  orderAmountDaily: () => {
    
    
    return new Promise(async (resolve, reject) => {

        let date = formatDate(new Date()) 

        console.log(date)
      // let todayDate = newDate()

      let orderStatus =   await db.get().collection(collections.ORDER).aggregate([
        {

         $match:{   
          
          date:{
          $gte: new Date((new Date().getTime() - (1 * 24 * 60 * 60 * 1000)))
        },
        
          "status": { $nin: ['cancelled', 'pending'] }
      }
        
      },
    {
         
      $group:
      {
            
        _id:null,

        totalAmount : {
          
          $sum : "$totalAmount"
        }
         
      }

    }
  ]).toArray()
      
   let count = orderStatus.length
  if(count == 0){
    resolve("0")

  }else{
    console.log(orderStatus[0] ,"hiiiiiiiiii")
    resolve(orderStatus[0].totalAmount)
   
  }
        
     
    })
  },

  // add product offer 

  addProdOffer: (offerData) => {

    return new Promise(async (resolve, reject) => {
      db.get().collection(collections.OFFER).insertOne(offerData).then((response) => {

        resolve(response)
      })
    })
  },

  // insert objectid in product 

  insertProd: (productname, insertedId, orgAmount, disAmount , percentage) => {

    return new Promise(async (resolve, reject) => {

      db.get().collection(collections.PRODUCT).updateOne({ productname: productname }, {

        $set: {
          offerid: insertedId,
          ogAmount: orgAmount,
          price: disAmount,
          offper: percentage

        }
      }).then((response) => {
        resolve(response)
      })
    })
  },

  // get product for offer 

  calProd: (data) => {

    return new Promise(async (resolve, reject) => {
      await db.get().collection(collections.PRODUCT).findOne({ productname: data }).then((prodata) => {


        console.log(prodata)
        resolve(prodata)
      })
    })
  },


  viewOffer: () => {
    return new Promise(async (resolve, reject) => {
      let viewOfferData = await db.get().collection(collections.OFFER).aggregate([{

        $lookup: {
          from: collections.PRODUCT,
          localField: '_id',
          foreignField: 'offerid',
          as: 'proDetails'

        }
      },
      {

        $project: {

          productofferid: 1,
          productoffername: 1,
          productofferper: 1,
          offerdesc: 1,
          prodetails: {
            $arrayElemAt: ['$proDetails', 0]
          }




        }

      }

      ]).toArray()

      if (viewOfferData) {
        console.log(viewOfferData)
        resolve(viewOfferData)
      }
      else {

        resolve()
      }

    })


  },
  // get og amount 

  prodDetails: (deleteoff) => {

    return new Promise(async (resolve, reject) => {

      await db.get().collection(collections.PRODUCT).findOne({ offerid: objectId(deleteoff) }).then((data) => {


        resolve(data)
      })
    })
  },





  editProductOff: (deleteoff, ogAmount) => {

    return new Promise(async (resolve, reject) => {

      await db.get().collection(collections.PRODUCT).updateOne({ offerid: objectId(deleteoff) },
        {
          $set:
          {
            price: ogAmount,
            offper:"0",
            
          }
          ,


          $unset: {

            
            offerid: 1

          }
        }
      ).then((response) => {

        resolve(response)

      })
      resolve(response)
    })

  },


  // delete product offer

  deleteProdOffer: (deleteoff) => {


    console.log('delete reaced')
    return new Promise(async (resolve, reject) => {

      let response = await db.get().collection(collections.OFFER).deleteOne({ _id: objectId(deleteoff) })

      resolve(response)
    })


  },


  dailySales: (date) => {

    return new Promise(async (resolve, reject) => {
      let dailySales = await db.get().collection(collections.ORDER).aggregate([

        {
          $match: {
            "status": { $nin: ['cancelled', 'pending'] }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            total: { $sum: '$totalAmount' },
            count: { $sum: 1 },
          }
        }, {

          $sort: { _id: -1 }
        }
        , {

          $match: { _id: date }



        }



      ]).toArray()
      console.log(dailySales)
      resolve(dailySales)
    })
  },

  dailyReport: (dt) => {
    return new Promise(async (resolve, reject) => {
      let sales = await db.get().collection(collection.ORDER).aggregate([
        // {$dateToString:{ format: "%Y", date: "$date" }},
        {
          $match: {
            status: { $nin: ['cancelled'] }
          }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            totalAmount: 1,
            date: 1,
            status: 1,
            _id: 1,
            item: '$products.item',
            quantity: '$products.quantity',

          }
        },
        {
          $lookup: {
            from: collection.PRODUCT,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, totalAmount: 1, paymentMethod: 1, item: 1, product: { $arrayElemAt: ['$product', 0] }, quantity: 1
          }
        },
        {
          $match: { date: dt }
        },
        {
          $group: {
            _id: '$item',
            quantity: { $sum: '$quantity' },
            totalAmount: { $sum: { $multiply: [{ $toInt: '$quantity' }, { $toInt: '$product.price' }] } },
            name: { $first: "$product.productname" },
            date: { $first: "$date" },
            price: { $first: "$product.price" }
          }
        }


      ]).toArray()
      console.log(sales);
      resolve(sales)
    })
  },


  monthlyReport: (dt) => {
    return new Promise(async (resolve, reject) => {
      let sales = await db.get().collection(collection.ORDER).aggregate([
        {

          $match: {
            status: { $nin: ["canacelled"] }
          }
        }, {
          $project: { dates: { $dateToString: { format: "%Y-%m", date: "$date" } }, totalAmount: 1, date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } }
        },
        {
          $match: {
            dates: dt
          }
        },
        {
          $group: {
            _id: '$date',
            totalAmount: { $sum: '$totalAmount' },

            count: { $sum: 1 }
          }
        }

      ]).toArray()
      console.log(sales);
      resolve(sales)
    })
  },

  yearlyReport: (dt) => {
    return new Promise(async (resolve, reject) => {
      let sales = await db.get().collection(collection.ORDER).aggregate([
        {

          $match: {
            status: { $nin: ["canacelled"] }
          }
        }, {
          $project: { dates: { $dateToString: { format: "%Y", date: "$date" } }, totalAmount: 1, date: { $dateToString: { format: "%Y-%m", date: "$date" } } }
        },
        {
          $match: {
            dates: dt
          }
        },
        {
          $group: {
            _id: '$date',
            totalAmount: { $sum: '$totalAmount' },

            count: { $sum: 1 }
          }
        }

      ]).toArray()
      console.log(sales);
      resolve(sales)
    })
  },


  // add coupon 

  addCoupon: (data) => {


    return new Promise(async (resolve, reject) => {

      await db.get().collection(collections.COUPON).insertOne(data).then((response) => {

        resolve(response)
      })
    })
  },

  viewCoupon: () => {

    return new Promise(async (resolve, reject) => {

      await db.get().collection(collections.COUPON).find().toArray().then((data) => {
        resolve(data)
      })
    })
  },

  // delete coupon 

  deleteCoupon : (couponID)=>{


   return new Promise(async(resolve,reject)=>{

    await db.get().collection(collections.COUPON).deleteOne({_id:objectId(couponID)}).then((response)=>{

      resolve(response)
    })
   })
  },

  viewCategory: () => {
    return new Promise(async (resolve, reject) => {


      await db.get().collection(collections.CATEGORY).find().toArray().then((response) => {

        resolve(response)
      })
    })

  },

  categoryOffer: (data) => {

    return new Promise(async (resolve, reject) => {

      await db.get().collection(collections.CATEGORYOFFER).insertOne(data).then((response) => {

        resolve(response)
      })
    })
  },
  viewCategoryOffer: () => {

    return new Promise(async (resolve, reject) => {

      await db.get().collection(collections.CATEGORYOFFER).find().toArray().then((response) => {

        resolve(response)
      })
    })
  },

  catProd: (details,insertedId) => {

    return new Promise(async (resolve, reject) => {

      await db.get().collection(collections.PRODUCT).find({ category: objectId(details.category) }).toArray().then(async (response) => {

  

        for (i = 0; i < response.length; i++) {

          let ogAmount = parseInt(response[i].ogAmount)
          let offerAmount = (1 - details.categoryofferper / 100) * parseInt(response[i].ogAmount)

          offerAmount = offerAmount.toString();

          console.log(offerAmount, "offerAmount")

          await db.get().collection(collections.PRODUCT).updateOne({ _id: response[i]._id }, {

            $set: {
              price: offerAmount,
              ogAmount: ogAmount,
              offper: details.categoryofferper,
              catOfferid : insertedId
            }
          },
            {
              $upsert: true
            }
          )
        }


        resolve(response)

      })
    })


  },
  viewCatOffer :(catOffId)=>{
 

    return new  Promise(async(resolve,reject)=>{
  
      await db.get().collection(collections.CATEGORYOFFER).findOne({_id:objectId(catOffId)}).then((data)=>{

        resolve(data)
      })
    })


  },

  // find product withi cat offer 

  viewcatProduct : (catId)=>{

    return new Promise (async(resolve,reject)=>{

     let response =  await db.get().collection(collections.PRODUCT).find({category:objectId(catId)}).toArray()
        
     console.log(response)

        for(i=0;i<response.length;i++){


          // let priceAmount = response[i].ogAmount

        console.log(response[i].category,"category")
        let product = await db.get().collection(collections.PRODUCT).updateOne({_id: response[i]._id},
        {
         
            
           $set:{  

            price: response[i].ogAmount,
            offper:"0",

           }
           
           
        })
        let products = await db.get().collection(collections.PRODUCT).updateOne({_id: response[i]._id},
        {
             $unset:{

            
             
             catOfferid:""

            }
           }

        )
        console.log(product,"products")

        }

        resolve(response)
      })
     
      
   
  },

  // delete from cat offer collection
  deleteCatOff :(catId)=>{

    return new Promise(async(resolve,reject)=>{

      await db.get().collection(collections.CATEGORYOFFER).deleteOne({_id:objectId(catId)}).then((response)=>{


        resolve(response)
      })
    })
  },

  


  

}


