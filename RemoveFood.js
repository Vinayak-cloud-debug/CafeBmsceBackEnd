
const express = require('express')
const myDb  = require('./MongoDb')
const router = express.Router()



router.post("/QtyDecrement",async(req,resp)=>{

    var myFood = req.body.FoodName
    
    console.log("MyData = ",myFood)
    const FoodCollection =  myDb.collection("Food")

    var Food = await FoodCollection.find({Name:myFood}).toArray()
    const Qty = Food[0].Qty;
    var Category = Food[0].Category
    console.log(Food)

    console.log("DecrementQty = ",Qty)

    if(Qty > 0){
        var result = await FoodCollection.findOneAndUpdate(
            { Name: myFood },
            { $set: { Qty: Qty-1 } },
            { returnDocument: 'after' }
        );
    }
    
    console.log("Current FOod qty  = "+Food[0].Qty)
    var result1 = await FoodCollection.find({Category:Category}).toArray()

    console.log("Decrement CategoryRelated Items:- ",result)
    resp.send(result1)
})

module.exports = router