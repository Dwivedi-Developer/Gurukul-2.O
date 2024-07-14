const User = require('../models/User');
const bcrypt = require('bcrypt');
const mailSender = require('../utils/mailSender');
const crypto = require('crypto');
//resetPasswordToken 
exports.resetPasswordToken = async(req,res)=>{
  try{
    //get email for req body
    const email = req.body.email ;
    //check user for this email , email validation
    const user = await User.findOne({ email: email});
    if(!user){
        return res.json({
            success: false,
            message:"Your email is not registered with us"
        })
    }
//generate token
    const token = crypto.randomUUID();
    //update user by adding token and expiration time
    const updateDetails = await User.findOneAndUpdate({ email: email}, {token: token,
    resetPasswordExpires: Date.now() + 3600000}, {new:true});
    //create url
    const url = `http://localhost:3000/update-password/${token}`;
    //send mail containing the url

    await mailSender(email , "Password Reset Link" ,`Password Reset Link- ${url}`)
    //return response

  return res.json({success: true, message:"Email Sent Successfully"});
    
}
catch(err) {
      console.log(err);
      return res.status(500).json({success: false, message:"Something went wrong while reseting password"});
} }



//reset password


exports.resetPassword = async (req, res) => {
try {
        //data fetch 
        const {password , confirmPassword , token } = req.body;
        //validation
        if(password !== confirmPassword){
            return res.json({success: false, message:"Password are not matching"})
        }
        //get userDetails from the db using token
    
        const userDetails = await User.findOne({token});
        //if no entry - invalid token
    
        if(!userDetails){
            return res.json({
                success:false ,
                message:"Token is Invalid"
            })
        }
        //token time
    
        if(userDetails.resetPasswordExpires > Date.now()){
            return res.status(404).json({
                success:false ,
                message :"Link is deactivated , generate new link"
            })
        }
        //hash password
        const hashedPassword = await bcrypt.hash(password,10);
        // update password
        await User.findOneAndUpdate({
            token:token},{password:hashedPassword},{new:true}
        );
        //return response
    
        return res.status(200).json({
            success:true,
            message:"Password reset successfull"
        })
    
} catch (error) {
    console.log(error);
    return res.status(500).json({
        success:false,
        message:"Somethin went wrong while updating password"
    })
}
}