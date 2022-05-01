const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/userModal");

exports.createNewAccount = async (req, res) => {
    try{
        const user = await User.findById(req.user.id);
        console.log(user);
        if(user.connAccount.id){
            if(user.connAccount.flag === false) {
                console.log('In if');
                const accountLink = await this.createAccountLink(user.connAccount.id);
                console.log(accountLink);
                return res.send({
                    status: 'fail',
                    message: 'User already contains an account. Use the link below to complete information',
                    link: accountLink.url,
                })
            } else if (user.connAccount.flag === true) {
                console.log('In else');
                return res.send({
                    status: 'Success',
                    message: 'User account is complete',
                })
            }
        }
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
            error: err.message,
        });
    }
}

exports.getAccountLink = async (req, res) => {
    try{
        let accountLink;
        let user = await User.findById(req.user.id);

        let account = await this.retrieveAccount(user.connAccount.id);
        if (account.requirements.currently_due.length > 0 || user.connAccount.flag === false) {
            accountLink = await this.createAccountLink(user.connAccount.id);
            return res.send({
                status: 'Success',
                link: accountLink, 
            });
        }
        else {
            return res.send({
                status: 'Success',
                message: 'Your account is complete'
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
        return_url: `https://x-changer.herokuapp.com/api/v1/stripe/return/${accountId}`,
        type: 'account_onboarding',
    });
    return accountLink;
}
       
exports.completeAccount = async (req, res) => {
    try{
        let account = await this.retrieveAccount(req.params.accountId);
        if(account.requirements.currently_due.length > 0) {
            let link = await this.createAccountLink(req.params.accountId);
            return res.send({
                message: 'Your account is not completed. You must complete your account to post ad. Use the link below to complete your account.',
                link: link.url,
            });
        }
        const user = await User.findOne({'connAccount.id': req.params.accountId});
        user.connAccount.flag = true;
        await user.save();
        console.log(user);
        return res.send({
            message: 'Your account has been created successfully. You may go back to app to post ad.'
        });
    } catch (err) {
        console.log(req);
        return res.send({ 
            status: 'Fail',
            message: 'Something went wrong', 
            err: err.message,
        });
    }

};