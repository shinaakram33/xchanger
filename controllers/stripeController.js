const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createNewAccount = async (user) => {
    const account = await stripe.accounts.create({
        type: 'express',
        business_type: 'individual',
        // individual: {
        // email: user.email,
        // },
        capabilities: {
        card_payments: {requested: true},
        transfers: {requested: true},
    },
    });
    console.log(account);
    console.log('-------------------------------------------------------------------');
    const accountLink = await this.createAccountLink(account.id);
    console.log(accountLink);
    return { account: account, link: accountLink };
}

exports.retrieveAccount = async ( accountId ) => {
    const account = await stripe.accounts.retrieve(accountId);
    return account;
}

exports.createAccountLink = async ( accountId ) => {
    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: 'https://x-changer.herokuapp.com/api/v1/stripe/refresh',
        return_url: 'https://x-changer.herokuapp.com/api/v1/stripe/return',
        type: 'account_onboarding',
    });
    return accountLink;
}