import { SimpleSchema } from "meteor/aldeed:simple-schema";

export const Transaction = new SimpleSchema({
  amount: {
    type: Number,
    decimal: true,
    label: "Amount"
  },
  transactionType: {
    type: String
  },
  from: {
    type: String
  },
  to: {
    type: String
  },
  orderId: {
    type: String
  },
  date: {
    type: Date
  }

});

export const Wallet = new SimpleSchema({
  userId: {
    type: String,
    label: "Customer"
  },
  transactions: {
    type: [Transaction]

  },
  balance: {
    type: Number,
    decimal: true,
    defaultValue: 0
  }
});
