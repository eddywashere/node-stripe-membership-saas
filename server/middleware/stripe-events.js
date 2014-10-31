'use strict';

var User = require('../models/user');

var knownEvents = {
  'account.updated': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'account.application.deauthorized': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'application_fee.created': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'application_fee.refunded': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'balance.available': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'charge.succeeded': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'charge.failed': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'charge.refunded': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'charge.captured': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'charge.updated': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'charge.dispute.created': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'charge.dispute.updated': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'charge.dispute.closed': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'customer.created': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'customer.updated': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'customer.deleted': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'customer.card.created': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'customer.card.updated': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'customer.card.deleted': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'customer.subscription.created': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'customer.subscription.updated': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'customer.subscription.deleted': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');

    if(req.stripeEvent.data && req.stripeEvent.data.object && req.stripeEvent.data.object.customer){
      // find user where stripeEvent.data.object.customer
      User.findOne({
        'stripe.customerId': req.stripeEvent.data.object.customer
      }, function (err, user) {
        if (err) return next(err);
        if(!user){
          // user does not exist, no need to process
          return res.status(200).end();
        } else {
          user.stripe.last4 = '';
          user.stripe.plan = 'free';
          user.stripe.subscriptionId = '';
          user.save(function(err) {
            if (err) return next(err);
            console.log('user: ' + user.email + ' subscription was successfully cancelled.');
            return res.status(200).end();
          });
        }
      });
    } else {
      return next(new Error('stripeEvent.data.object.customer is undefined'));
    }
  },
  'customer.subscription.trial_will_end': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'customer.discount.created': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'customer.discount.updated': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'customer.discount.deleted': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'invoice.created': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'invoice.updated': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'invoice.payment_succeeded': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'invoice.payment_failed ': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'invoiceitem.created': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'invoiceitem.updated': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'invoiceitem.deleted': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'plan.created': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'plan.updated': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'plan.deleted': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'coupon.created': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'coupon.deleted': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'recipient.created': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'recipient.updated': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'recipient.deleted': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'transfer.created': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'transfer.updated': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'transfer.paid': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'transfer.failed': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  },
  'ping': function(req, res, next) {
    console.log(req.stripeEvent.type + ': event processed');
    res.status(200).end();
  }
};

module.exports = function(req, res, next) {
  if(req.stripeEvent && req.stripeEvent.type && knownEvents[req.stripeEvent.type]){
    knownEvents[req.stripeEvent.type](req, res, next);
  } else {
    return next(new Error('Stripe Event not found'));
  }
};