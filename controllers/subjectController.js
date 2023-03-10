const Subject = require('../models/subjectModal');

exports.createSubject = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide name and image of a subject',
      });
    }
    const newSubject = await Subject.create({
      name: req.body.name,
    });
    res.status(201).json({
      status: 'success',
      message: 'Subject is created successfully',
      data: newSubject,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getSubjects = async (req, res) => {
  try {
    const allSubjects = await Subject.find();

    let other;
    if(allSubjects.findIndex((object => {return object.name === 'Other'})) >= 0)
      other = allSubjects.splice(allSubjects.findIndex((object => {return object.name === 'Other'})), 1);
    allSubjects.sort(function(a, b) {
      if(a.name < b.name) return -1;
      if(b.name < a.name) return 1;  
    })
    if(other)
      allSubjects.push(other[0]);
    res.status(200).json({
      status: 'success',
      length: allSubjects.length,
      data: allSubjects,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getSubjectsBySubCategory = async (req, res) => {
  try {
    if(!req.params.subCategoryId){
      return res.status(400).json({
        status: 'fail',
        message: 'SubcategoryId is required',
      });
    }
    const allSubjects = await Subject.find({subCategoryId: req.params.subCategoryId });

    let other;
    if(allSubjects.findIndex((object => {return object.name === 'Other'})) >= 0)
      other = allSubjects.splice(allSubjects.findIndex((object => {return object.name === 'Other'})), 1);
    allSubjects.sort(function(a, b) {
      if(a.name < b.name) return -1;
      if(b.name < a.name) return 1;  
    })
    if(other)
      allSubjects.push(other[0]);

    return res.status(200).json({
      status: 'success',
      length: allSubjects.length,
      data: allSubjects,
    });
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const subjectId = req.params.subjectId;
    const updates = req.body;
    const options = { new: true };
    const subject = await Subject.findById(req.params.subjectId);
    if (!subject) {
      return res.status(400).json({
        status: 'fail',
        message: 'Subject does not exist',
      });
    }
    const updateSubject = await Subject.findByIdAndUpdate(subjectId, updates, options);
    res.status(200).json({
      status: 'success',
      message: 'Subject is updated successfully',
      data: updateSubject,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const id = req.params.subjectId;
    const subject = await Subject.findById(req.params.subjectId);
    if (!subject) {
      return res.status(400).json({
        status: 'fail',
        message: 'Subject does not exist',
      });
    }
    await Subject.findByIdAndDelete(id);
    res.status(200).json({
      status: 'success',
      message: 'Subject has been deleted successfully',
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};
