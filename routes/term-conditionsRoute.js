const express = require('express');

const { getTermsAndConditions, 
        createTermsAndConditions,
        getTermAndConditionById,
        updateTermAndCondition,
        deleteTermAndCondition } = require('../controllers/term-conditionController');


const router = express.Router();

router.route('/').get(getTermsAndConditions).post(createTermsAndConditions);
router.route('/:id').get(getTermAndConditionById).patch(updateTermAndCondition).delete(deleteTermAndCondition);

module.exports = router;

