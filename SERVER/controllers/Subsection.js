// khud likho
const SubSection = require('../models/SubSection');
const Section = require('../models/Section');
const {uploadImageToCloudinary} = require('../utils/imageUploader');
require('dotenv').config();

// create SubSection

exports.createSubSection = async (req,res)=>{
    try {
        //fetch data from Req body
        const {sectionId , title , timeDuration , description} = req.body ;
        const video = req.files.videoFile ;
        //validation
        if(!sectionId || !title || !timeDuration || !description){
            return res.status(400).jso({
                success:false,
                message:"All fields are required"
            })
        }

        // upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
        const subSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url,
        })

        const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},{
            $push:{
                subSection:subSectionDetails._id,
            }
        },{new:true})
        // homework to populate the data

        return res.status(200).json({
            success:true,
            message:"Sub Section created successfully",
            updatedSection
        })
    } catch (error) {
        return res.status(500).json({
            success:false ,
            message:"Internal Server Error",
           error:error.message
        })
    }
}

//update sub section and delete sub section dono karo


exports.updateSubSection =async (req,res)=>{
    try {

        //data fetch 
        const {title ,timeDuration, description,subSectionId} = req.body;
        //data validation
        if(!title||!timeDuration || !description || !subSectionId){
            return res.status(400).json({
                success:false ,
                message:"All fields are required"
            })
        }
        const updateSubSection = await SubSection.findByIdAndUpdate(subSectionId ,{title:title , timeDuration:timeDuration ,description:description,}
        , {new:true}) 
        
        return res.status(200).json({
            success:true,
            message:"Section updated successfully",
            updateSubSection
        })

        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable to update SubSection",
            error: error.message
           
        })
    }
}

//delete SubSection 

exports.deleteSubSection = async (req ,res)=>{
    try {const {subSectionId} = req.params ;

    if(!subSectionId){
        return res.status(400).json({
            success:false ,
            message:"All fields are required"
        })
    }
       await SubSection.findByIdAndDelete(subSectionId) ;
        return res.status(200).json({
            success:true,
            message:"SubSection deleted successfully",
          
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable to delete SubSection",
            error: error.message
           
        })
    }
}