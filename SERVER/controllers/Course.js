const Course = require('../models/Course');
const Category = require('../models/Category');
const SubSection = require("../models/SubSection");
const Section = require("../models/Section")
const User = require('../models/User');
const {uploadImageToCloudinary} = require('../utils/imageUploader');
require("dotenv").config();

//createCourse handler function

exports.createCourse = async (req , res)=>{
    try {
        
        //fetch data
        const {courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            tag: _tag,
            category,
            status,
            instructions: _instructions} = req.body ;

        //get thumbnail

        const thumbnail = req.files.thumbnailImage ;

        // Convert the tag and instructions from stringified Array to Array
   
        const tag = JSON.parse(_tag)
        const instructions = JSON.parse(_instructions)
    
        console.log("tag", tag)
        console.log("instructions", instructions)

        //validation of fetch data
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail || !tag.length || !instructions.length ){
            return res.status(400).json({
                success: false ,
                message:"All fields are required"
            })
        }
        if (!status || status === undefined) {
            status = "Draft"
          }
       
        //check for instructor
        const userId = req.user.id;
        
       const instructorDetails = await User.findById(userId, {
        accountType: "Instructor",
      }); 
       console.log("instructor details are -",instructorDetails);
        //TODO: verify that userId and instructorDetails._id are same or diffrent
       if(!instructorDetails){
        return res.status(404).json({
            success: false ,
            message:"Instructor details are invalid"
        })
       }
       console.log("sab shi h");
       //check given tag is valid or not
       const categoryDetails = await Category.findById(category)
       if(!categoryDetails){
        return res.status(404).json({
            success: false ,
            message:"Category details are invalid"
        })
       }
       console.log(categoryDetails);
       //upload thumbnail image to cloudinary
       const thumbnailImage = await uploadImageToCloudinary(thumbnail , process.env.Folder_Name);
       console.log("thumbnailImage-",thumbnailImage);
      //create an entry for new course

      const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      tag,
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
      status: status,
      instructions,
      })
      console.log(newCourse)
       // user update
       await User.findByIdAndUpdate({_id:instructorDetails._id},{
        $push:{
            courses: newCourse._id
        }
       },{new:true})

       const categoryDetails2 = await Category.findByIdAndUpdate(
        { _id: category },
        {
          $push: {
            courses: newCourse._id,
          },
        },
        { new: true }
      )
     
       //update the tag schema khud karo

       return res.status(200).json({
        success:true ,
        message:"Course created successfully",
        data: newCourse
       })
    } catch (error) {
        return res.status(500).json({
            success: false ,
            message:"Error in creating course"
        })
    }
}

//get All courses

exports.showAllCourses = async (req,res)=>{
    try {
        const allCourses = await Course.find({}, {
            courseName:true , price:true , thumbnail:true , instructor:true , ratingAndReviews:true , studentsEnrolled:true
        }).populate('instructor').exec();

        return res.status(200).json({
            success:true ,
            message:"Data for all courses fetched successfully",
            data:allCourses
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Cannot fetch course data",
            error:error.message
        })
    }
}

//get course details
exports.getCourseDetails = async (req,res)=>{
    try {
        //get isd
        const{courseId} = req.body;
        //find course details

        const courseDetails= await Course.find({_id:courseId}).populate({
            path:"instructor",
            populate:{
                path:'additionalDetails',
            }
        }).populate("category")
          .populate("ratingAndReviews")
          .populate({
            path:"courseContent",
            populate:{
                path:"subSection"
            },
        }).exec()
        //validation
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`Could not find the course with ${courseId}`
            })
        }

        return res.status(200).json({
            success:true,
            message:"Course details fetched successfully",
            data:{courseDetails}
        })
    } catch (error) {
        return res.status(200).json({
            success:false,
            message:error.message,
            
        })
    }
}


exports.getInstructorCourses = async (req, res) => {
    try {
      // Get the instructor ID from the authenticated user or request body
      const instructorId = req.user.id
  
      // Find all courses belonging to the instructor
      const instructorCourses = await Course.find({
        instructor: instructorId,
      }).sort({ createdAt: -1 })
  
      // Return the instructor's courses
      res.status(200).json({
        success: true,
        data: instructorCourses,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Failed to retrieve instructor courses",
        error: error.message,
      })
    }
  }