import { Meteor } from "meteor/meteor";
import { Wallet, Accounts } from "/lib/collections";
import * as Schemas from '/lib/collections/schemas/';
import { check } from "meteor/check";

Meteor.methods({
  "wallet": (userId, transactions) => {
    check(userId, String);
    check(transactions, Schemas.Transaction);
    let newBalance;
    if (transactions.transactionType === "Credit") {
      newBalance = { balance: transactions.amount };
    }
    if (transactions.transactionType === "Debit") {
      if (transactions.to) {
        const receiver = Accounts.findOne({ "emails.address": transactions.to });
        const sender = Accounts.findOne(userId);
        if (receiver) {
          Meteor.call("wallet", receiver._id, {
            amount,
            from: sender.emails[0].address,
            date: new Date(),
            transactionType: "Credit"
          });
        }
      }
      newBalance = { balance: -transactions.amount };
    }

    Wallet.update({ userId }, { $push: { transactions: transactions }, $inc: newBalance }, { upsert: true });
  }
});
