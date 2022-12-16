const { response } = require('express');
var express = require('express');
const { UserBindingInstance } = require('twilio/lib/rest/ipMessaging/v2/service/user/userBinding');
const collections = require('../config/collections');
var router = express.Router();
var adminHelper = require('../helpers/admin-helpers');
 
var upload = require('../multer/multer')
var ObjectID = require('mongodb').ObjectId
    
let userName = "brittovincent@gmail.com"
let Pin = "12345"

const adminVerify = (req, res, next) => {

  if (req.session.admin) {  
    next()
  } else {  

    res.redirect('/admin/admin_login')
  }

}
   
/* GET home page. */
router.get('/', adminVerify, async(req, res, next)=> {

   let yearChart = await adminHelper.yearlyChart()
   let paymentGraph = await adminHelper.paymentGraph()
   let userCount = await adminHelper.userStatus()
   let orderCountWeekly = await adminHelper.orderCountWeekly()
   let orderCountDaily = await adminHelper.orderCountDaily()
   let orderAmount = await adminHelper.orderAmountDaily()
   console.log(yearChart)
  res.render('admin/admin-panel', { admin: true , yearChart ,paymentGraph,userCount,orderCountWeekly,orderCountDaily,orderAmount});
});

// Get admin login 
router.get('/admin_login', function (req, res, next) {
  res.render('admin/admin-login', { login: true})
}) 

// Post admin login 

router.post('/admin_login', (req, res) => {
  const { email, password } = req.body;
  console.log(req.body)
  if (userName === email && Pin === password) {
    // req.session.check = true;
    req.session.admin = true;
    res.redirect('/admin')

  }
  else {

    req.session.err = "incorrect username or password"
    res.redirect('admin/admin_login', { alertLogin: 'Incorrect credentials' })
  }
})

// view users

router.get('/view_users', adminVerify, function (req, res) {
  adminHelper.viewUsers().then((data) => {
    // console.log(data)
    res.render('admin/admin-viewusers', { admin: true, data })

  })

  // block users
  router.get('/view_users/:id', adminVerify, function (req, res) {
    let proId = req.params.id
    console.log(proId)
    adminHelper.blockUser(proId).then((data) => {
      res.redirect('/admin/view_users')
    })
  }),

    // unblock users
    router.get('/view_user/:id', adminVerify, function (req, res) {
      let proId = req.params.id
      console.log(proId)
      adminHelper.unblockUser(proId).then((data) => {
        res.redirect('/admin/view_users')
      })
    })

 
})

//get add main category

router.get('/add_category', adminVerify, function (req, res) {
  adminHelper.getCategory().then((data) => {

    console.log(data)
    res.render('admin/admin-category', { admin: true, data,caterr:req.session.catmsg })
    req.session.catmsg =false
  })
})





// Add product

router.get('/add_product', adminVerify, function (req, res) {

  
  adminHelper.getCategory().then((data) => {
    console.log(data);
    res.render('admin/admin-addproduct', { admin: true, data })
  })

})


router.post('/add_product', upload.array('image', 4),  async(req, res)=> {


  console.log(req.files)
  var filename = req.files.map(function (file) {
    return file.filename;


  })

  req.body.image = filename


  await adminHelper.addProduct(req.body).then((data) => {
    console.log(req.body)

    res.redirect('/admin/view_product')
    console.log("sucess");
  })



})



// post add main category

router.post('/add_category', upload.array('image', 4),function (req, res) {


  console.log(req.files)
  var filename = req.files.map(function (file) {
    return file.filename;


  })
  req.body.image = filename

  adminHelper.addCategory(req.body).then((response) => {
    console.log(response);
    if(response.status){

      res.redirect('/admin/add_category')
    }else{
      req.session.catmsg= "Category Already Exist"
      res.redirect('/admin/add_category')
    }
  })
})
// post add sub main category

router.post('/add_subcategory', function (req, res) {
  let newIds = ObjectID(req.body.category)
  req.body.category = newIds
  console.log(req.body)

  adminHelper.addSubCategory(req.body).then((response) => {
    console.log(response);
    res.redirect('/admin/add_category')
  })
})

// view category 


router.get('/view_category', adminVerify, (req, res) => {
  adminHelper.viewCategory().then((data) => {
    res.render('admin/admin-viewcategory', { admin: true, data })
  })
  
})
 
// edit category

router.get('/edit-category/:id',adminVerify, function(req, res) {
  let catId = req.params.id
  // console.log('dd'); 
  // console.log(catId);
 
  adminHelper.viewEditCategory(catId).then((data) => {
    console.log(data, "single category");
    res.render('admin/admin-editcategory', { admin: true,data})
  })
})
 
// post edit caetgory

router.post('/edit-category/:id',upload.array('image', 2),adminVerify, async(req,res)=>{

  console.log(req.files)
  var filename = req.files.map(function (file) {
    return file.filename;
  

  })     

  req.body.image = filename 
  console.log(req.body)
  let catId = req.params.id
  await adminHelper.editCategory(catId,req.body).then((response)=>{
    res.redirect('/admin/view_category')
  })
})

// delete category 

router.get('/delete-category/:id',adminVerify,(req,res)=>{

  let catId =req.params.id

  adminHelper.deleteCat(catId).then((response)=>{
    if(response.category){

      res.json(response)
    }else {
      let check = adminHelper.deleteChecked(catId)
      res.json(response)
    }
  })


})
// view products

router.get('/view_product', adminVerify, (req, res) => {
  adminHelper.viewProduct().then((data) => {

    res.render('admin/admin-viewproduct', { admin: true, data })
  })

})
router.get('/aside', (req, res) => {
  res.render('partials/admin-aside', { admin: true })
})


//  delete product 
router.get('/delete_product/:id',adminVerify, (req, res) => {
  let proID = req.params.id;
  console.log(proID);
  adminHelper.deleteProduct(proID).then((data) => {
    // res.render('admin/admin-viewproduct')
    res.redirect('/admin/view_product')
  })

})


// Get edit product 

router.get('/edit_product/:id', adminVerify, (req, res) => {
  let proID = req.params.id;

  adminHelper.getUpdateProduct(proID).then((product) => {
    
    adminHelper.getCategory().then((data) => {
      adminHelper.findCategory(product.category).then((findOne)=>{
        res.render('admin/admin_update', { admin: true, product, data ,findOne})
      })
     
    })
  })
})

// Update product

router.post('/edit-product/:id', upload.array('image', 4), (req, res) => {
  // let proID =req.params.id;
  // console.log(proID)
  console.log(req.files)
  var filename = req.files.map(function (file) {
    return file.filename;


  }) 
  req.body.image = filename
  console.log(req.body,"body")
  console.log(req.params.id,"bodyss")
 

  adminHelper.updateProduct(req.params.id, req.body).then((data) => {
    console.log("hello")
    res.redirect('/admin/view_product')

  })
})




// add banner

router.get('/add_banner',adminVerify,(req,res)=>{
  res.render('admin/admin-addbanner',{admin:true})
})


// post add banner

router.post('/add_banner',upload.array('image', 4),(req,res)=>{
  console.log(req.files)
  var filename = req.files.map(function (file) {
    return file.filename;


  })
  req.body.image = filename
  console.log(req.body.productname)
  console.log(req.body.productid)


  adminHelper.addBanner(req.body).then((response)=>{
    res.redirect('/admin/add_banner')
  })

})

// view banner 
router.get('/view_banner',adminVerify,(req,res)=>{
   adminHelper.viewBanner().then((data)=>{
    res.render('admin/admin-viewbanner',{admin:true,data})
   })
})


// edit banner

router.get('/edit_banner/:id',adminVerify,(req,res)=>{
  let bannerID = req.params.id;
  
  console.log(bannerID)
  adminHelper.editBanner(bannerID).then((bannerData)=>{
    res.render('admin/admin-editbanner',{admin:true,bannerData})
  })
  

})


// post banner 

router.post('/edit_banner/:id',upload.array('image', 4),(req,res)=>{
  let bannerID = req.params.id;
  var filename = req.files.map(function (file) {
    return file.filename;

 
  })
  req.body.image = filename 

  adminHelper.updateBanner(bannerID,req.body).then((response)=>{
    res.redirect('/admin/view_banner')

  })
})


// delete banner 

router.post('/delete-banner',(req,res)=>{

  console.log('delete banner 2')
  adminHelper.deleteBanner(req.body).then((reponse)=>{
    console.log("delete banner 3")
    res.json({status:true})
  })

})

// view orders 


router.get('/view_orders',adminVerify,function(req,res){
  adminHelper.viewOrder().then((allOrders)=>{
    console.log(allOrders)
    res.render('admin/admin-order',{admin:true,allOrders})
  })
})
    
// status change order   (path err)

router.post('/change_status/:id',async (req,res)=>{
  let changeStatus = req.params.id
  console.log(req.body)
    
     await adminHelper.changeStatus(changeStatus,req.body).then((response)=>{
      res.redirect('/admin/view_orders')
     })
})


// logout  
router.get('/adminlogout', (req, res) => {
  req.session.admin = null;
  res.redirect("/admin/admin_login")
})




// offer products 

// view offer 

router.get('/view-productoffer',adminVerify,async(req,res)=>{

  await adminHelper.viewOffer().then((data)=>{
     
  res.render('admin/admin-productoffer',{admin:true,data})

  })


})


// add offer 
router.get('/add-productoffer',adminVerify,(req,res)=>{

  adminHelper.viewProduct().then((data) => {
    console.log(data)
  res.render('admin/addproduct-offer',{admin:true,data})
  })
})


// post offer 

router.post('/add-productoffer',async (req,res)=>{

  
  let productname = req.body.productname
  let percentage = parseInt(req.body.productofferper)
  let product = req.body.productname
  console.log(product)

  let productData = await  adminHelper.calProd(product)
  console.log(productData.price)
  let orgAmount = parseInt(productData.ogAmount)

   let disAmount = (1-percentage/100)*orgAmount
  //  console.log(totalAmount)

  
     
   let response =await  adminHelper.addProdOffer(req.body)
    console.log(response.insertedId)
    let insertedId = response.insertedId

   await adminHelper.insertProd(productname,insertedId,orgAmount,disAmount,percentage).then((response)=>{

      
    res.redirect('/admin/view-productoffer')

   })   
  
})





// delete offer 
 
router.get('/delete-product-offer/:id',async(req,res)=>{
  
  let deleteoff = req.params.id

  console.log(deleteoff)

  let prodDetails = await adminHelper.prodDetails(deleteoff)

  console.log(prodDetails) 
  let ogAmount = prodDetails.ogAmount

  let editProduct = await adminHelper.editProductOff(deleteoff,ogAmount)

  
  let response = await adminHelper.deleteProdOffer(deleteoff)

    response.status=true

    res.json(response)
  })   


  // sales report 

  router.get('/sales-report',(req,res)=>{
    
    
      

    res.render('admin/admin-sales',{admin:true})
  })

  

  router.post('/daily-sales',async(req,res)=>{
    let sales
    let total
    let datedata
    let monthdata
    let date = req.body.date
    let month =req.body.month
    let year =req.body.year
    let monthYear = year+"-"+month
    console.log(year)
    if(date){
      datedata = false
    console.log(req.body,"date")
    
      sales = await adminHelper.dailyReport(date)
    //  console.log(dailySales,"dailysales")
     total = 0
     for (i=0;i<sales.length;i++){
      total=total+sales[i].totalAmount
      console.log(total)
      datedata= true
     }  
    }
    else if(month ){

       monthdata =false
      sales= await adminHelper.monthlyReport(monthYear)
      console.log(sales,"sales")
       total = 0
      for (i=0;i<sales.length;i++){
       total=total+sales[i].totalAmount
       console.log(total)
       monthdata =true
     } 
    }
     else{


      monthdata =false
            
      sales= await adminHelper.yearlyReport(year)
      console.log(sales,"sale")
      total = 0
      for (i=0;i<sales.length;i++){
       total=total+sales[i].totalAmount
       console.log(total)
       monthdata =true

     }
    }
    res.render('admin/admin-dailysales',{sales,total,datedata})
     
  })


  // get add coupon 

  router.get('/add-coupon',adminVerify,(req,res)=>{

    res.render('admin/add-coupon',{admin:true})
  })


  // post coupon 
  router.post('/add-coupon', async(req,res)=>{
     
   await  adminHelper.addCoupon(req.body)
    res.redirect('/admin/add-coupon')
  })


  // view coupon 

  router.get('/view-coupon',adminVerify,async(req,res)=>{
    let data = await adminHelper.viewCoupon()
    res.render('admin/view-coupon',{admin:true,data})
  })  


  // delete coupon 

  router.get('/delete-coupon/:id',async(req,res)=>{


    await adminHelper.deleteCoupon(req.params.id).then((resposne)=>{


      res.json(response)
    })
  })

  // add category offer 

  router.get('/add-categoryoffer',adminVerify, async(req,res)=>{
    

    let data = await adminHelper.viewCategory()
      console.log(data)
      res.render('admin/add-categoryoffer',{admin:true,data}) 
    
  })

  // add category off 
  router.post('/add-categoryoffer',async(req,res)=>{
      
    console.log(req.body,"category details")  

      let catOff = await adminHelper.categoryOffer(req.body)
 
     console.log(catOff.insertedId)
      let prodData = await adminHelper.catProd(req.body,catOff.insertedId)
      
      console.log(prodData,"proddata")
      console.log(catOff,"catoff")
       
     
        res.redirect('/admin/view-categoryoffer')
   
      
  })


  // view category offer 

  router.get('/view-categoryoffer',adminVerify,async(req,res)=>{


    adminHelper.viewCategoryOffer().then((data)=>{

      res.render('admin/view-categoryoffer',{admin:true,data})
    })
  })

  // delete category offer

  router.get('/delete-category-offer/:id',async(req,res)=>{
  
  
    catOffId = req.params.id 
    let catOffData = await adminHelper.viewCatOffer(catOffId)
    console.log(catOffData.category,"cat id")

    adminHelper.viewcatProduct(catOffData.category).then(async(response)=>{

      let deleteCat = await adminHelper.deleteCatOff(catOffId)
      

      res.json(response)
    })
     
      
  })

  
 
module.exports = router;
       