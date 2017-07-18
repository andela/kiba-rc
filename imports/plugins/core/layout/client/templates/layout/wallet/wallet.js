/* eslint no-undef: 0 */
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import { Accounts, Packages, Wallets } from "/lib/collections";

Template.wallet.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    details: { balance: 0, transactions: [] }
  });
  this.autorun(() => {
    this.subscribe("transactionDetails", Meteor.userId());
    const transactionInfo = Wallets.find().fetch();
    if (transactionInfo.length > 0) {
      this.state.set("details", transactionInfo[0]);
    }
  });
});

const getPaystackSettings = () => {
  const paystack = Packages.findOne({
    name: "paystack",
    shopId: Reaction.getShopId()
  });
  console.log(paystack, "PACKAGE");
  return {
    public: "pk_test_06cbd2f7d3bcba712877438dd0b0de30e233156f",
    secret: "sk_test_52a5c9bf14d92398283076657775008041ab6383"
  };
};

const finalizeDeposit = (paystackMethod) => {
  Meteor.call("wallet/transaction", Meteor.userId(), paystackMethod.transactions, (err, res) => {
    if (res) {
      document.getElementById("depositAmount").value = "";
      Alerts.toast("Your deposit was successful", "success");
    } else {
      Alerts.toast("An error occured, please try again", "error");
    }
  });
};

function handlePayment(result) {
  const type = "deposit";
  const transactionId = result.reference;
  const paystackConfig = getPaystackSettings();
  HTTP.call("GET", `https://api.paystack.co/transaction/verify/${transactionId}`, {
    headers: {
      Authorization: `Bearer ${paystackConfig.secret}`
    }
  }, function (error, response) {
    if (error) {
      Alerts.toast("Unable to verify payment", "error");
    } else if (response.data.data.status !== "success") {
      Alerts.toast("Payment was unsuccessful", "error");
    } else {
      const paystackResponse = response.data.data;
      paystackMethod = {
        processor: "Paystack",
        storedCard: paystackResponse.authorization.last4,
        method: "Paystack",
        transactionId: paystackResponse.reference,
        currency: paystackResponse.currency,
        amount: parseInt(paystackResponse.amount, 10),
        status: paystackResponse.status,
        mode: "authorize",
        createdAt: new Date()
      };
      if (type === "deposit") {
        paystackMethod.transactions = {
          amount: paystackResponse.amount / 100,
          referenceId: paystackResponse.reference,
          date: new Date(),
          transactionType: "Credit"
        };
        console.log(paystackMethod.amount, "Before Transaction amount");
        console.log(paystackMethod.transactions.amount, "Transaction amount");
        finalizeDeposit(paystackMethod);
      }
    }
  });
}

// Paystack payment
const payWithPaystack = (email, amount) => {
  const paystackConfig = getPaystackSettings();
  console.log("Paystack Config", paystackConfig);
  const handler = PaystackPop.setup({
    key: paystackConfig.public,
    email: email,
    amount: amount * 100,
    callback: handlePayment
  });
  handler.openIframe();
};

Template.wallet.events({
  "submit #deposit": (event) => {
    event.preventDefault();
    const accountDetails = Accounts.find(Meteor.userId()).fetch();
    const userMail = accountDetails[0].emails[0].address;
    const amount = parseInt(document.getElementById("depositAmount").value, 10);
    const mailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,63}$/i;
    if (!mailRegex.test(userMail)) {
      Alerts.toast("Invalid email address", "error");
      return false;
    }
    payWithPaystack(userMail, amount);
  }

});

Template.wallet.helpers({
  balance() {
    return Template.instance().state.get("details").balance;
  },

  getTransactions() {
    const transactions = Template.instance().state.get("details").transactions;
    if (transactions.length > 0) {
      return transactions;
    }
    return false;
  },

  formatDate(date) {
    return moment(date).format("dddd, MMMM Do YYYY, h:mm:ssa");
  }
});
