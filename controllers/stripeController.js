const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createNewAccount = async () => {

    const account = await stripe.accounts.create({
        type: 'express',
        business_type: 'individual',
        individual: {
        email: user.email,
        },
        capabilities: {
        card_payments: {requested: true},
        transfers: {requested: true},
    },
    });
    const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: 'https://clothingsapp.herokuapp.com/api/v1/products/all',
        return_url: 'https://clothingsapp.herokuapp.com/api/v1/products/all',
        type: 'account_onboarding',
    });
    console.log({ account: account, link: accountLink });
    return { account: account, link: accountLink };
}

exports.updateAccount = async ( accountId ) => {
    const account = await stripe.accounts.retrieve(accountId);

    if (account.requirements.currently_due.length > 0) {
        const accountLink = await stripestripe.accountLinks.create({
            account: account.id,
            refresh_url: 'https://clothingsapp.herokuapp.com/api/v1/products/all',
            return_url: 'https://clothingsapp.herokuapp.com/api/v1/products/all',
            type: 'account_onboarding',
        });
        return accountLink;
    }
    else return 'Account Onboard complete'
    
}