const User = require('../models/User');
const OTP  = require('../models/OTP');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');

require("dotenv").config();
//send otp
exports.sendOTP = async(req , res) =>{
try{
    //fetch email from request ki body

    const {email} = req.body ;
    const checkUserPresent = await User.findOne({email});

    if(checkUserPresent){
       return  res.status(401).json({
             success:false ,
             message:"User already exist"
        })
    }
    //generate otp
    var otp = otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
     });
     console.log(otp);

     //checking uniqueness of the otp

     const result= await OTP.findOne({otp: otp});
      console.log("result of uniqueness is - " , result);
     while(result){
        otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
         });
         result = await OTP.findOne({otp: otp});
     }

     const otpPayload = {email ,otp};

     //create an entry of otp in db

     const otpBody = await OTP.create(otpPayload);
     console.log(otpBody);

     res.status(200).json({
        success:true ,
        data:otpBody,
        message:"OTP sent successfully"
     })

}catch(err){
    console.log(err);
    res.status(500).json({
        success:false ,
        
        message:err.message
     })
}

}

//Signup the user

exports.signUp = async (req,res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        }   = req.body ;
    
        //validate karo
    
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false ,
                message:"All fields arte required"
            })
        }
    
        //password match krlo
    
        if(password !== confirmPassword){
            return res.status(403).json({
                success:false ,
                message:"Passwords are not matched"
            })
        }
    
        //check user already exist
    
        const existingUser = await User.findOne({ email});
    
        if(existingUser){
            return res.status(403).json({
                success:false ,
                message:"User already registered"
            })
        }
    
        //finding most recent otp stored for the user
    
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);
    
        //validateOtp
    
        if(recentOtp.length ==0){
            //Otp not found
            return res.status(403).json({
                success:false ,
                message:" Otp not found"
            }) 
        }
        else if(otp !== recentOtp[0].otp){
            //invalid otp
            return res.status(403).json({
                success:false ,
                message:"Invalid Otp"
            })
        }
    
        //hash password
    
        const hashedPassword = await bcrypt.hash(password,10) ;
        
        //entry created in db
    
        const profileDetails = await Profile.create({
            gender:null ,
            dateOfBirth:null ,
            about : null ,
            contactNumber : null
        })
    
    const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        accountType,
        additionalDetails:profileDetails._id,
        image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,  
    })
    
    console.log(user);

    return res.status(200).json({
        success:true,
        message:"User is registered successfully",
        user
    })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false ,
            message:"User cannot be registered, please try again"
        })
    }
}


//login user

exports.loginUser = async(req, res)=>{
    try {
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All fields are required"
            })
        }
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false ,
                message:"user is not registered"
            })
        }
        if(await bcrypt.compare(password , user.password)){
            const payload = {
                email: user.email,
                id:user._id ,
                accountType:user.accountType

            }
            const token = jwt.sign(payload, process.env.JWT_SECRET,{
                expiresIn :"24h",
            })
            user.token = token ;
            user.password=undefined ;

            //create cookie 

            const options ={
                expires: new Date(Date.now() + 3*24*60*60*100),
                httpOnly:true
            }

            res.cookie("token", token ,options).status(200).json({
                success:true ,
                token,
                user,
                message:"Logged In Successfully"
            })
        }
        else{
            return res.status(401).json({
                success:false,
                message:"password is incorrect"
        })
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false ,
            message:"User cannot be login please registered first-"
        })
    }
}

//change password

exports.changePassword = async (req,res)=>{
    try {
        const {email , password ,newPassword} = req.body ;
    const user = await User.find({email});

    if(await bcrypt.compare(user.password,password)){
        const hashedPassword = await bcrypt.hash(newPassword,10);
          await User.findAndUpdate({email} ,{password:hashedPassword},{new:true});
          return res.status(200).json({
            success:true ,
            message:"Password Changed Successfully",
          })
    }

    else{
         return res.status(401).json({
            success:false ,
            message:'Password not matched !'
         })
    }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success:false ,
            message:"Problem in changing password,please try again"
        })
    }
}