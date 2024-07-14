const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User');

//auth

exports.auth = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer " ,"");
        console.log("token======",token)
        if (!token) {
          return res.status(401).json({
            success:false,
            message:"Token is missing"
          })
        }

        //verify the token 

        try{
            const decode = await jwt.verify(token , process.env.JWT_SECRET);
            console.log("decode is here",decode);

            req.user = decode ;
        }catch (error) {
            return res.status(401).json({
                success:false,
                message:"token is invalid"
            })
        } 

         next();
    } catch (error) {
        return res.status(401).json({success:false,
         message:"Something went wrong while verifying token"
    })
    } 
}

exports.isStudent = async (req, res ,next) => {
    try{
        const userDetails = await User.findOne({ email: req.user.email });
      if(await req.user.accountType !== "Student" ){
        return res.status(401).json({
            success:false,
            message:"This is valid only Student"
        })
      }
    }
    catch (error){
        return res.status(401).json({
            success:false,
            message:"Problem in verifying account type"
        })
    }
    next();
}

exports.isInstructor = async (req, res ,next) => {
    try{
        const userDetails = await User.findOne({ email: req.user.email });
      if(await req.user.accountType !== "Instructor" ){
        return res.status(401).json({
            success:false,
            message:"This is valid only Instructor"
        })
      }
    }
    catch (error){
        return res.status(401).json({
            success:false,
            message:"Problem in verifying account type"
        })
    }
    next();
}

exports.isAdmin = async (req, res ,next) => {
    try{
      
      if(await req.user.accountType !== "Admin" ){
        return res.status(401).json({
            success:false,
            message:"This is valid only Instructor"
        })
      }
    }
    catch (error){
        return res.status(401).json({
            success:false,
            message:"Problem in verifying account type"
        })
    }
    next();
}