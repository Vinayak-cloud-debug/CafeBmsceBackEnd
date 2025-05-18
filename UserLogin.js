const express = require('express')
const myDb  = require('./MongoDb')
const router = express.Router()

router.post("/Login",async(req,resp)=>{

    var myData = req.body.Login
    console.log("MyData = ",myData)
    const CustomerCollection =  myDb.collection("Customer")

    const result = await CustomerCollection.find({MobileNumber:myData}).toArray()
    console.log(result)
    resp.send(result)
})

module.exports = router