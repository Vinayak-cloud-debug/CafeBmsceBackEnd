const express = require('express')
const myDb  = require('./MongoDb')
const router = express.Router()

router.post("/QtyIncrement",async(req,resp)=>{

    var myFood = req.body.FoodName
    
    console.log("MyData = ",myFood)
    const FoodCollection =  myDb.collection("Food")
    

    var Food = await FoodCollection.find({Name:myFood}).toArray()
    const Qty = Food[0].Qty;
    var Category = Food[0].Category

    console.log("Category = "+Category)
    
    console.log("Food ",Food)

    var result = await FoodCollection.findOneAndUpdate(
        { Name: myFood },
        { $set: { Qty: Qty+1 } },
        { returnDocument: 'after' }
    );
    
    var result1 = await FoodCollection.find({Category:Category}).toArray()
    

    console.log("Increment CategoryRelated Items:- ",result)
    resp.send(result1)
})


router.post("/AddOnce",async(req,resp)=>{

    var myFood = req.body.FoodName
    
    console.log("MyData = ",myFood)
    const FoodCollection =  myDb.collection("Food")
    

    var Food = await FoodCollection.find({Name:myFood}).toArray()
    const Qty = Food[0].Qty;
    var Category = Food[0].Category

    console.log("Category = "+Category)
    
    console.log("Food ",Food)

    var result = await FoodCollection.findOneAndUpdate(
        { Name: myFood },
        { $set: { Qty: Qty+1 } },
        { returnDocument: 'after' }
    );
    
    var result1 = await FoodCollection.find({Category:Category}).toArray()
    

    console.log("Adding Once CategoryRelated Items:- ",result)
    resp.send(result1)
})



module.exports = router