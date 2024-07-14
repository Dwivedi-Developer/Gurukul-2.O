const mongoose = require('mongoose');
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");
const OTPSchema = new mongoose.Schema({
email:{
    type:String,
    required:true,
},
otp:{
    type:String,
    required:true,
},
createdAt:{
    type:Date,
    default:Date.now(),
    expires: 10*60*1000 ,

}})

async function sendVerificationEmail(email , otp) {
    try {
        const mailResponse = await mailSender(email , "Verification Email from Gurukul 2.O" , emailTemplate(otp));
        console.log("Email Sent successfully" , mailResponse.response);
    } catch (error) {
        console.log("error in sendVerificationEmail", error);
    }
}

OTPSchema.pre('save', async function (next) {
    await sendVerificationEmail(this.email, this.otp);
    next();
})

module.exports = mongoose.model('OTP' , OTPSchema);
