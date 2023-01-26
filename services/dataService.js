//import db.js
const db = require('./db')

//import jsonwebtoken
const jwt = require('jsonwebtoken')


//register
const register = (uname,acno,pswd)=>{
  //check acno is in mongodb
   return db.User.findOne({
    acno
   }).then((result)=>{//promise is used because its a asynchronous function mongodb is using 27017port and server is using 3000
        console.log(result);
        if (result) {
          //acno already exist
          return{
            statusCode:401,
            message:'Account Already exist!'
          }
        }
        else{
          //to add new user in node
          const newUser = new db.User({
            username:uname,
            acno:acno,
            password:pswd,
            balance:0,
            transaction:[]
          })
          // to save new user in mongodb
          newUser.save()
          return{
            statusCode:200,
            message:'Registration Successful'
          }
        }
   })
}

//login
const login = (acno, pswd)=>{
console.log('inside login function body');
//check acno and pswd in mongodb
return db.User.findOne({
  acno,
  password:pswd
}).then((result)=>{
  if (result) {
    //generate token
    const token = jwt.sign({
      acno:acno
    },'supersecretkey123')
    return{
      statusCode:200,
      message:'login Successful',
      username:result.username,
      acno:acno,
      token
    }
  }
  else{
    return{
      statusCode:404,
      message:'Invalid Account Number or Password'
    }
  }
})
}
//getBalance
const getBalance = (acno)=>{
  return db.User.findOne({acno}).then((result)=>{
    if (result) {
      return{
        statusCode:200,
        balance:result.balance
      }
    }
    else{
      return{
        statusCode:404,
        message:'Invalid Account Number'
      }
    }
  })
}
//deposit
const deposit = (acno,amt)=>{
  let amount = Number(amt)
  return db.User.findOne({
    acno
  }).then((result)=>{
    if(result){
      //acno is present in db
      result.balance +=amount
      result.transaction.push({
        type:"CREDIT",
        fromAcno:acno,
        toAcno:acno,
        amount
      })
      result.save()
      return{
        statusCode:200,
        message:`₹ ${amount} Successfully Deposited`
      }
    }
    else{
      return{
        statusCode:404,
        message:'Invalid Account'
      }
    }
  })
}

//cashtransfer
const cashTransfer = (req,toacno,amt,pswd)=>{
   let amount = Number(amt)
   let fromAcno = req.fromAcno
   return db.User.findOne({
        acno:fromAcno,
        password:pswd
   }).then((result)=>{
        console.log(result);
        if(fromAcno==toacno){
          return{
            statusCode:401,
            message: "Self Transfer is denied"
          }
        }
        if(result){
            let fromAcnoBalance = result.balance
            if(fromAcnoBalance>=amount){
              result.balance = fromAcnoBalance-amount
              //credit account details
              return db.User.findOne({
                acno:toacno
              }).then((creditdata)=>{
                if(creditdata){
                  creditdata.balance += amount
                  creditdata.transaction.push({
                    type:"CREDIT",
                    fromAcno,
                    toAcno:toacno,
                    amount
                  })
                  creditdata.save();
                  console.log(creditdata);
                  result.transaction.push({
                    type:"DEBIT",
                    fromAcno,
                    toAcno:toacno,
                    amount
                  })
                  result.save();
                  console.log(result);
                  return{
                    statusCode:200,
                    message: "Amount Transfer Successful"
                  }
                }
                else{
                  return{
                    statusCode:401,
                    message:"Invalid credit Account Number"
                  }
                }
              })
            }
            else{
              return{
                statusCode:401,
                message:'Insufficient Balance'
              }
            }
        }
        else{
          return{
            statusCode:401,
            message:"Invalid Debit Account number/Password"          }
        }
   })
}


//getAllTransactions
//since we want the history of all logined user we need acno which is stored in the token of header hence
//the argument is the req which containes token
const getAllTransactions = (req) =>{
let acno = req.fromAcno
return db.User.findOne({
  acno
}).then((result)=>{
  if(result){
    return{
      statusCode:200,
      transaction:result.transaction
    }
  }
  else{
    return{
      statusCode:401,
      message:"Invalid Account Number"
    }
  }
})
}

//to delete the contact
 const deleteMyAccount = (acno)=>{
    return db.User.deleteOne({
      acno
    }).then((result)=>{
      if(result){
        return{
          statusCode:200,
          message:"Account Deleted Successfully"
        }
      }
      else{
        return{
          statusCode:401,
          message:"Invalid Account"
        }
      }
    })
 }

//export

module.exports={
    register,
    login,
    getBalance,
    deposit,
    cashTransfer,
    getAllTransactions,
    deleteMyAccount
}