const DummyModal = require('../models/dummyModal');

exports.getDummyData = async (req, res) => {
  try {
    const data = await DummyModal.find();
    res.status(200).json({
      status: 'success',
      results: data.length,
      data: { tour: data },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createDummyData = async (req, res) => {
  try {
    const newData = await DummyModal.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newData,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateDummyData = async (req, res) => {
  try {
    const data = await DummyModal.findById(req.params.proId);
    console.log(data);
    if (!data) {
      res.status(400).json({
        status: 'fail',
        message: 'category does not exist',
      });
    }
    const updateData = await DummyModal.findByIdAndUpdate(req.params.proId, req.body, {
      new: true,
    });
    res.status(200).json({
      status: 'success',
      message: 'category is updated successfully',
      data: updateData,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

// export const create = async (event) => {
//   try {
//     const { vehicleId } = event.pathParameters;
//     const requestingUser = JSON.parse(event.requestContext.authorizer.user);
//     const body = JSON.parse(event.body);
//     const stripeSource = body.source;
//     const dbVehicle = await new Vehicle({ id: vehicleId }).fetch();
//     if (!dbVehicle) throw new APIError(HttpStatusCodes.BAD_REQUEST, 'No Vehicle Found');
//     if (dbVehicle.get('review_status') !== 'IN_PROGRESS')
//       throw new APIError(HttpStatusCodes.BAD_REQUEST, 'Already paid :)');
//     await bookshelf.transaction(async (trx) => {
//       if (body.promoCode) {
//         const code = await new PromoCode({ code: body.promoCode }).fetch();
//         if (!code) throw new APIError(HttpStatusCodes.NOT_FOUND, 'Incorrect Promo Code');
//         const pro = await PromoCode.query((qb) => {
//           qb.where('code', '=', body.promoCode);
//         }).fetch();
//         const promocompany = pro.toJSON();
//         console.info('promocode object');
//         console.log(promocompany);
//         const procompanyid = JSON.parse(promocompany.company_id);
//         console.info('promo company Id');
//         console.log(procompanyid);
//         const Companyvehicle = await CompanyVehicle.query((qb) => {
//           qb.where('vehicle_id', '=', vehicleId);
//         }).fetch();
//         const vehcompanyid = Companyvehicle.toJSON();
//         console.info('vehicle object info');
//         console.log(vehcompanyid);
//         const vehiclecompanyId = JSON.parse(vehcompanyid.company_id);
//         console.info('vehicle company id');
//         console.log(vehiclecompanyId);
//         console.info('vehicle match');
//         console.log(procompanyid === vehiclecompanyId);
//         console.info('vehicle not match');
//         console.log(procompanyid !== vehiclecompanyId);
//         if (procompanyid !== vehiclecompanyId)
//           throw new APIError(HttpStatusCodes.UNPROCESSABLE_ENTITY, 'Company_id not match');
//         if (!code)
//           throw new APIError(HttpStatusCodes.UNPROCESSABLE_ENTITY, 'Promo code is not valid');
//         if (code.get('isRedeemed'))
//           throw new APIError(HttpStatusCodes.UNPROCESSABLE_ENTITY, 'Promo code is not valid');
//         await new Vehicle({ id: vehicleId }).save(
//           { review_status: 'READY_FOR_REVIEW' },
//           { patch: true, transacting: trx }
//         );
//         await new PromoCode({ id: code.id }).save(
//           { isRedeemed: true },
//           { patch: true, transacting: trx }
//         );
//         await new Transaction({
//           user_id: requestingUser.id,
//           vehicle_id: vehicleId,
//           amount: 0,
//         }).save(null, { transacting: trx });
//       } else {
//         await new Vehicle({ id: vehicleId }).save(
//           { review_status: 'READY_FOR_REVIEW' },
//           { patch: true, transacting: trx }
//         );
//         const transaction = await new Transaction({
//           user_id: requestingUser.id,
//           vehicle_id: vehicleId,
//           amount: 19,
//         }).save(null, { transacting: trx });
//         const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
//         const charge = await stripe.charges.create({
//           amount: process.env.INSPECTION_FEES * 100,
//           currency: 'usd',
//           source: stripeSource,
//         });
//         await new Transaction({ id: transaction.id }).save(
//           { stripe_transaction_id: charge.id },
//           { patch: true, transacting: trx }
//         );
//       }
//     });
//     return reply({}, 201);
//   } catch (e) {
//     return normalizeAndReplyError(e);
//   }
// };
