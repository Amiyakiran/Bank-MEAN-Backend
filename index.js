//import express
const express = require('express')
//import cors
const cors = require('cors')
//import dataService
const dataService = require('./services/dataService')
//import jsonwebtoken
const jwt = require('jsonwebtoken')


//create server app using express
const server = express()
//use cors to tell cors that with which port the serve want to share data
server.use(cors({
    origin:'http://localhost:4200'
}))
// to parse json data
server.use(express.json())



//set up port for server app
server.listen(3000,()=>{
    console.log('server started at 3000');
})

//application specific middleware
const appMiddleware = (req,res,next)=>{
    console.log('inside application specific middleware');
    next()
}
server.use(appMiddleware)

// bankapp front end request resolving

//token verify middleware
const jwtMiddleware =(req,res,next)=>{
    console.log('inside router specific middleware');

    //get token from req headers
    const token = req.headers['access-token']
    console.log(token);
    
        try{    //verify token
                const data= jwt.verify(token,'supersecretkey123')
                console.log(data);
                req.fromAcno = data.acno
                console.log('valid token');
                next()
            }  
        catch{
            console.log('invalid token');
            res.status(401).json({
                message:'Please login'
            })
        }
}

//register api call
server.post('/register',(req,res)=>{
    console.log('inside register Api');
    console.log(req.body);
    //asynchronous
    dataService.register(req.body.uname,req.body.acno,req.body.pswd).then((result)=>{
        res.status(result.statusCode).json(result)//sending data through internet to client
    })
})

//login api call
server.post('/login',(req,res)=>{
    console.log('inside login Api');
    console.log(req.body);
    //asynchronous
    dataService.login(req.body.acno,req.body.pswd).then((result)=>{
        res.status(result.statusCode).json(result)//sending data through internet to client
    })
})

//getBalance api
server.get('/getBalance/:acno',jwtMiddleware,(req,res)=>{
    console.log('inside getBalance Api');
    console.log(req.params.acno);
    //asynchronous
    dataService.getBalance(req.params.acno).then((result)=>{
        res.status(result.statusCode).json(result)//sending data through internet to client
    })
})

//deposit api
server.post('/deposit',jwtMiddleware,(req,res)=>{
    console.log('inside deposit Api');
    console.log(req.body);
    //asynchronous
    dataService.deposit(req.body.acno,req.body.amount).then((result)=>{
        res.status(result.statusCode).json(result)//sending data through internet to client
    })
})



//cashtransfer api
server.post('/cashtransfer',jwtMiddleware,(req,res)=>{
    console.log('inside cashtransfer Api');
    console.log(req.body);
    //asynchronous
    dataService.cashTransfer(req,req.body.toacno,req.body.amt,req.body.pswd).then((result)=>{
        res.status(result.statusCode).json(result)
    })
})

//getAllTransactions
server.get('/all-transactions',jwtMiddleware,(req,res)=>{
    console.log('Inside getAllTransactions');
    dataService.getAllTransactions(req)
    .then((result)=>{
        res.status(result.statusCode).json(result)
    })
})

//delete account
server.delete('/delete-account/:acno',jwtMiddleware,(req,res)=>{
    console.log('inside delete-account Api');
    console.log(req.params.acno);
    //asynchronous
    dataService.deleteMyAccount(req.params.acno).then((result)=>{
        res.status(result.statusCode).json(result)//sending data through internet to client
    })
})


/* for understanfing  
//how to resolve get http api call
server.get('/',(req,res)=>{
    res.send('get method')
})

//how to resolve post http request

server.post('/',(req,res)=>{
    res.send('Post method')
})

//how to resolve put http request

server.put('/',(req,res)=>{
    res.send('put method')
})

//how to resolve put http request

server.delete('/',(req,res)=>{
    res.send('delete method')
}) */