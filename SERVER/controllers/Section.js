const Section = require('../models/Section');
const Course = require('../models/Course');

exports.createSection = async(req , res)=>{
    try {
    //data fetch

    const {sectionName , courseId} = req.body;

    //data validation

    if(!sectionName || !courseId){
        return res.status(400).json({
            success:false ,
            message:"All fields are required"
        })
    }

    //create section

    const newsection = await Section.create({sectionName});
    //update course with section ObjectId

    const updateCourseDetails = await Course.findByIdAndUpdate(courseId,{
    $push:{
         courseContent: newsection._id,
    }},{new:true})
    
    //populat ko use krke section and sub-section both in updated Course

    //return response 

    return res.status(200).json({
        success:true,
        message:"Section created successfully",
        updateCourseDetails
    })

    }catch(e){
        return res.status(500).json({
            success:false,
            message:"Unable to create Section",
            error: e.message
           
        })
    
    }
}


exports.updateSection =async (req,res)=>{
    try {

        //data fetch 
        const {sectionName ,sectionId} = req.body;
        //data validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false ,
                message:"All fields are required"
            })
        }
        const updateSection = await Section.findByIdAndUpdate(sectionId ,{sectionName} , {new:true}) 
        
        return res.status(200).json({
            success:true,
            message:"Section updated successfully",
            updateSection
        })

        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable to create Section",
            error: error.message
           
        })
    }
}

//delete section 

exports.deleteSection = async (req ,res)=>{
    try {const { sectionId, courseId }  = req.body; ;

    if(!sectionId){
        return res.status(400).json({
            success:false ,
            message:"All fields are required",
    
        })
    }
       await Section.findByIdAndDelete(sectionId) ;

       const course = await Course.findByIdAndDelete(courseId,{new:true}).populate({
        path:"courseContent",
        populate: {
            path: "subSection"
        }
    })
    .exec();

        return res.status(200).json({
            success:true,
            message:"Section deleted successfully",
            data:course
          
        })


    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable to delete Section",
            error: error.message
           
        })
    }
}