const Category = require('../models/Category');

//create tag ka handler function 
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
  }
exports.createCategory = async( req,res)=>{
    try {
        const {name, description} = req.body ;

        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        //create entry in db

        const categoryDetails = await Category.create({name, description});

       
        //return res
       return res.status(200).json({success:true, message:"Category created successfully"})

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


exports.showAllCategory = async( req, res)=>{
    try {
        const allCategory = await Category.find({},{name:true , description:true}) ;
        console.log(allCategory);
        res.status(200).json({success:true, message:"All category found successfully",
        data:allCategory});

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
    }

exports.categoryPageDetails = async( req, res)=>{
    try {
        const {categoryId} = req.body;

        //Get courses for the specified category
        const selectedCategory = await Category.findById(categoryId).populate({
            path: "courses",
            match: { status: "Published" },
            populate: "ratingAndReviews",
          })
          .exec() ;

        console.log(selectedCategory);

        //Handle the case when the category is not found 
        if(!selectedCategory){
            console.log("No category found");
            return res.status(404).json({
                success:false,
                message:"No category found"
            })
        }
        //Handle the case when there are no courses

        if(selectedCategory.courses.lenght===0){
            console.log("No Courses found for the selected Category");
            return res.status(404).json({
                success:false,
                message:"No Courses found for the selected category"
            })
        }

    const selectedCourse = selectedCategory.courses;

    //get course for the other category

    const categoriesExceptSelected = await Category.find({
        _id:{$ne :categoryId},
    }).populate("courses");

    let differentCategory = await Category.findOne(
        categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
          ._id
      )
        .populate({
          path: "courses",
          match: { status: "Published" },
        })
        .exec()

    //Get top-selling courses all categories

    const allCategories = await Category.find().populate({
        path: "courses",
        match: { status: "Published" },
        populate: {
          path: "instructor",
      },
      }).exec();
    const allCourses = allCategories.flatMap((category)=>category.courses);
    const mostSellingCourses = allCourses.sort((a,b)=>b.sold- a.sold).slice(0, 10);

    return res.status(200).json({
        success: true,
        data: {
          selectedCategory,
          differentCategory,
          mostSellingCourses,
        },
      })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false ,
            message:error.message
        })
    }
}
