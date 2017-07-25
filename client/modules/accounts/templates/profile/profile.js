import * as Collections from "/lib/collections";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { LoginFormSharedHelpers } from "/client/modules/accounts/helpers";

/**
 * onCreated: Account Profile View
 */
Template.accountProfile.onCreated(() => {
  const template = Template.instance();

  template.userHasPassword = ReactiveVar(false);

  Meteor.call("accounts/currentUserHasPassword", (error, result) => {
    template.userHasPassword.set(result);
  });
});

/**
 * Helpers: Account Profile View
 */
Template.accountProfile.helpers({

  /**
   * User has password
   * @return {Boolean} return true if the current user has a password, false otherwise
   */
  userHasPassword() {
    return Template.instance().userHasPassword.get();
  },

  shopDetails() {
    const account = Collections.Accounts.findOne({ userId: Meteor.userId() });
    if (account.profile.vendorDetails) {
      return account.profile.vendorDetails[0];
    }
    return false;
  },

  /**
   * User's order history
   * @return {Array|null} an array of available orders for the user
   */
  userOrders() {
    const orderSub = Meteor.subscribe("AccountOrders", Meteor.userId());
    if (orderSub.ready()) {
      return Collections.Orders.find({
        userId: Meteor.userId()
      }, {
        sort: {
          createdAt: -1
        },
        limit: 25
      });
    }
  },

  /**
   * User's account profile
   * @return {Object} account profile
   */
  account() {
    return Collections.Accounts.findOne();
  },

  /**
   * Returns the address book default view
   * @return {String} "addressBookGrid" || "addressBookAdd"
   */
  addressBookView: function () {
    const account = Collections.Accounts.findOne();
    if (account.profile) {
      return "addressBookGrid";
    }
    return "addressBookAdd";
  }
});

Template.vendorForm.helpers(LoginFormSharedHelpers);

Template.vendorForm.events({
  "click .update-vendor": function (event, template) {
    let vendorDetails = {};
    const errors = {};

    shopPhone = template.$(".shop-phone").val().trim();
    shopAddress = template.$(".shop-address").val().trim();

    const validatedShopPhone = LoginFormValidation.shopPhone(shopPhone);
    const validatedShopAddress = LoginFormValidation.shopAddress(shopAddress);

    if (validatedShopPhone !== true) {
      errors.shopPhone = validatedShopPhone;
    }

    if (validatedShopAddress !== true) {
      errors.shopAddress = validatedShopAddress;
    }

    vendorDetails = {
      vendorDetails: [{
        shopPhone: shopPhone,
        shopAddress: shopAddress
      }]
    };
    Meteor.call("vendor/updateDetails", vendorDetails, function(err) {
      if (err) {
        Alerts.toast(err, "error");
      }
      Alerts.toast("Vendor Updated", "success");
    });
  }


});

Template.upgradeToVendor.events({

  "click .upgrade-vendor": function (event, template) {
    let vendorDetails = {};
    const errors = {};

    shopName = template.$(".shop-name").val().trim();
    shopPhone = template.$(".shop-phone").val().trim();
    shopAddress = template.$(".shop-address").val().trim();

    const validatedShopName = LoginFormValidation.shopName(shopName);
    const validatedShopPhone = LoginFormValidation.shopPhone(shopPhone);
    const validatedShopAddress = LoginFormValidation.shopAddress(shopAddress);

    if (validatedShopName !== true) {
      errors.shopName = validatedShopName;
    }

    if (validatedShopPhone !== true) {
      errors.shopPhone = validatedShopPhone;
    }

    if (validatedShopAddress !== true) {
      errors.shopAddress = validatedShopAddress;
    }

    vendorDetails = {
      vendorDetails: [{
        shopName: shopName,
        shopPhone: shopPhone,
        shopAddress: shopAddress,
        isVendor: true,
        shopActive: false
      }]
    };
    Meteor.call("vendor/upgradeToVendor", vendorDetails, function (err) {
      if (err) {
        Alerts.toast(err, "error");
      } else {
        $("#.upgrade-container").css("display", "none");
        Alerts.toast("Upgrade Successful, You will be activated by the Admin", "success");
      }
    });
  }

});

Template.upgradeToVendor.helpers(LoginFormSharedHelpers);
