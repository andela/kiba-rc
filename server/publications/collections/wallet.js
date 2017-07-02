import { Wallet } from "/lib/collections";

Meteor.publish("transactions", (userId) => {
  check(userId, String);
  return Wallet.find({ userId });
});
