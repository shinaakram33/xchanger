const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/userModal");

exports.createNewAccount = async (req, res) => {
    try{
        const user = await User.findById(req.user.id);
        console.log(user);
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
        console.log(account);
        console.log('-------------------------------------------------------------------');
        user.connAccount.id = account.id;
        await user.save();
        const accountLink = await this.createAccountLink(account.id);
        console.log(accountLink);
        return res.send({ 
            status: 'Success',
            account: account.id, 
            link: accountLink.url,
        });
    } catch (err) {
        return res.send({ 
            status: 'Fail',
            message: 'Something went wrong', 
            error: err 
        });
    }
}

exports.updateAccount = async (req, res) => {
    try{
        let accountLink;
        const accountId = req.params.accountId;
        console.log(req.params.accountId, typeof(req.params.accountId));

        let account = await this.retrieveAccount(accountId);
        if (account.requirements.currently_due.length > 0) {
            accountLink = await this.createAccountLink(accountId);
            return res.send({
                status: 'Success',
                link: accountLink, 
            });
        }
        else {
            return res.send({
                status: 'Success',
                message: 'Account updated'
            });
        }
    } catch (err) {
        return res.send({ 
            status: 'Fail',
            message: 'Something went wrong', 
            error: err 
        });
    }
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