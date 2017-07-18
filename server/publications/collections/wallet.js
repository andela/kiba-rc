<<<<<<< HEAD
import { Wallet } from "/lib/collections";

Meteor.publish("transactions", (userId) => {
  check(userId, String);
  return Wallet.find({ userId });
=======
import { Wallets } from "/lib/collections";

Meteor.publish("transactionDetails", (userId) => {
  check(userId, String);
  return Wallets.find({ userId });
>>>>>>> b539fecfacd1da9679d2586e4eb02ee1f07b94fb
});
