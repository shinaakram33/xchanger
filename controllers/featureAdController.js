const featureAd = require('../models/featureAdModel');

exports.createFeatureAd = async (req,res) =>{
  try{

    const newFeatureAd = await featureAd.create({
        user: req.body.user,
        AddTitle: req.body.AddTitle,
        description: req.body.description,
        price: req.body.price,
        noOfDays: req.body.noOfDays
    })

    res.status(200).json({
        status:'success',
        message:'Feature Ad Created successfully!',
        featureAd: newFeatureAd
    })

  }

  catch(err)
  {
      res.status(400).json({
          status:'fail',
          message:"error!",
          error:err
      })
      
  }

}

exports.getAllFeatureAds = async (req,res)=>{
  
    try{
        const allFeaturesAds = await featureAd.find({});
     
        res.status(200).json({
            message:"success",
            length: allFeaturesAds.length,
            featureAds:  allFeaturesAds

        })

    }
    catch(err)
    {
        res.status(200).json({
            status:'fail',
            message:"error",
            error:err
        })

    }
}


exports.getSepcificFeatureAd = async (req, res)=>{
 try{

    const specificFeatureAd = await featureAd.findById(req.params.featureAdId);
    res.status(200).json({
        message:"success",
  
        featureAds:  specificFeatureAd

    })

 }
 catch(err)
 {
    res.status(200).json({
        status:'fail',
        message:"error",
        error:err
    })

 }
 
}


exports.deleteSpecificFeatureAd = async (req,res) =>{
    try{
        const deleteSpecificFeatureAd = await featureAd.findByIdAndDelete(req.params.featureAdId);
        res.status(200).json({
            status:"success",
            message:"Feature Ad Removed successfully!"

        })
    }
    catch(err)
    {
        res.status(200).json({
            status:"fail",
            error:err

        })

    }
    

}