const featureAd = require('../models/featureAdModel');
const User = require('../models/userModal');

exports.createFeatureAd = async (req,res) =>{
  try{

    const newFeatureAd = await featureAd.create({
        user: req.body.user,
        // AddTitle: req.body.AddTitle,
        // description: req.body.description,
        price: req.body.price,
        noOfDays: req.body.noOfDays
    })

    return res.status(200).json({
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

exports.getUserAds = async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if(!user){
        return res.status(400).json({
          status: 'fail',
          message: 'User does not exist',
        });
      }
      const userAds = await featureAd.find({ user: req.params.userId });
      if (userAds.length <= 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'No ad exists',
        });
      }
      res.status(200).json({
        status: 'success',
        length: userAds.length,
        data: userAds,
      });
    } catch (err) {
      return res.status(400).json({
        status: 'fail',
        message: err,
      });
    }
  };
  
  exports.getFeatureAdPakages = async (req, res) => {
    try {
      const pakages = [
        {
          id: 1,
          title: 'Feature Ad for 30 days',
          footer: 'Reach upto 6 times more buyers',
          price: 23.13,
          days: 30
        },
        {
          id: 2,
          title: 'Feature Ad for 14 days',
          footer: 'Reach upto 6 times more buyers',
          price: 13.88,
          days: 14
        },
        {
          id: 3,
          title: 'Feature Ad for 10 days',
          footer: 'Reach upto 6 times more buyers',
          price: 9.25,
          days: 10
        },
        {
          id: 4,
          title: 'Feature Ad for 5 days',
          footer: 'Reach upto 6 times more buyers',
          price: 7.40,
          days: 5
        },
        {
          id: 5,
          title: 'Feature Ad for 3 days',
          footer: 'Reach upto 6 times more buyers',
          price: 4.63,
          days: 3
        },
      ];
      res.status(200).json({
        status: 'success',
        length: pakages.length,
        data: pakages,
      });
    } catch (err) {
      return res.status(400).json({
        status: 'fail',
        message: err,
      });
    }
  };