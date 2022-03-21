const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createNewAccount = async (req, res) => {
    try{
        const account = await stripe.accounts.create({
            type: 'express',
            business_type: 'individual',
            capabilities: {
            card_payments: {requested: true},
            transfers: {requested: true},
        },
        });
        console.log(account);
        console.log('-------------------------------------------------------------------');
        const accountLink = await this.createAccountLink(account.id);
        console.log(accountLink);
        return res.send({ 
            account: account.id, 
            link: accountLink 
        });
    } catch (err) {
        return res.send({ 
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
                link: accountLink, 
            });
        }
        else {
            return res.send({
                message: 'Account updated'
            });
        }
    } catch (err) {
        return res.send({ 
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