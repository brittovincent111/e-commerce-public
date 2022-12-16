const mongoClient=require('mongodb').MongoClient
const state={
    db:null
} 

module.exports.connect=function(done){
    const url = 'mongodb+srv://brittovincent111:br2287476@dressup.y5evuyx.mongodb.net/?retryWrites=true&w=majority'
    const dbname = 'Dressup'

    mongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    })
      
      
}    
   
module.exports.get=function(){ 
    return state.db
} 