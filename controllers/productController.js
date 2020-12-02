const product=require('../models/productModal');
exports.createProduct = async (req, res) => {

    try {
        console.log(req.params.categoryId);
        const { name,price,image,condition,color,design,category, } = req.body;
        const newProduct = await product.create({
            name,
            price,
            image,
            condition,
            color,
            design, 
            category:req.params.categoryId,
          });
        res.status(201).json({
          status: 'success',
          product: newProduct,
        });
      } catch (err) {
        res.status(400).json({
          status: 'fail',
          message: err,
        });
      }
    };
    exports.getAllProduct = async (req, res) => {
        try {
          const allProduct = await product.find();
          res.status(200).json({
            status: 'success',
            length: allProduct.length,
            data: allProduct,
          });
        } catch (err) {
          res.status(400).json({
            status: 'fail',
            message: err,
          });
        }
      };
//update
      exports.updateproducts = async (req, res) => {
    
          try{
            const id=req.params.id;
            const updates=req.body;
            console.log(id,updates);
            const options={new:true};
const result=  await product.findByIdAndUpdate(id,updates,options);
res.send(result);



          }catch(error){
              console.log(error.message);
          }
          }
          //delete
          exports.deleteproducts=('/:id',async(req,res,next)=>{
const id=req.params.id;
console.log(id)
try{
const result=await product.findByIdAndDelete(id);
res.send(result);  
}catch(error){
    console.log(message.error);
}
          });

    