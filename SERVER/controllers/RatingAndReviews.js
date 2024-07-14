const RatingAndReview = require('../models/RatingAndReview');
const Course = require('../models/Course');

//createReview

exports.createRating = async(req,res)=>{
    try {
        //get user id 

        const userId = req.user.id ;
        //fetch data from req body
        const {rating , review ,courseId} =req.body;
        //check if user is enrolled or not 

        const courseDetails = await Course.findOne({_id:courseId,
        studentsEnrolled:{$elemMatch:{$eq: userId}}}) ;

        if(!courseDetails){
            return res.status(404).json({
                success:false ,
                message:"Student is not enrolled in this course"
            })
        }
        //check if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
            user:userId ,
            course:courseId,
        });

        if(alreadyReviewed){
            return res.status(403).json({
                success:false ,
                message:"User already reviewed this course"
            })
        }
        //create rating and review 

        const ratingReview = await RatingAndReview.create({
            rating , review ,course:courseId,
            user:userId
        })
        //update course and this rating/review

       const updatedCourseDetails= await Course.findByIdAndUpdate(courseId ,{
            $push:{
                ratingAndReviews:ratingReview._id
            }
        },{new:true})

        console.log(updatedCourseDetails)
        //retur response

        return res.status(200).json({
            success:true ,
            message:"rating and review created  successfully ",
            ratingReview
        })
    } catch (error) {
        return res.status(200).json({
            success:true ,
            message:"Unable to create rating and review. ",
            
        })
    }
}

exports.getAverageRating = async (req,res)=>{
    try {
        //get course Id

        const courseId = req.body.courseId ;

        //calculate average rating
        const result = await RatingAndReview.aggregate([{
            $match:{
                course: new mongooose.Types.ObjectId(courseId),
            }
        },
        {
            $group:{
                _id:null,
                averageRating:{$avg:"$rating"},
            }
        }
    ])
    if(result.length>0){
        return res.status(200).json({
            success:true,
            aveargeRating:result[0].averageRating,
        })
    }
    else{
        return res.status(200).json({
            success:true,
            message:"Average Rating is 0",
            aveargeRating:0
        })
    }
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success:false ,
            message:error.message,            
        })
    }
}

//get All rating and Review

exports.getAllRating = async (req , res)=>{
   try{ 
    const allRating = await RatingAndReview.find({}).sort({rating:"desc"}).populate({
        path:"user",
        select:"firstName lastName email , image"
    })
    .populate({
        path:"course",
        select:"courseName"
    }).exec()

    return res.status(200).json({
        success:true,
        message:"All Rating and Review are fetched successfully",
        data:allRating
    })
   }catch(error){ 
    console.error(error)
    return res.status(500).json({
        success:false ,
        message:error.message,            
    })

   }
}