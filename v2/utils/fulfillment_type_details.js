const line_fulfillment_type = [
  {
    fulfillment_type: "CORONA",
    description: "CORONA",
    long_description: "CORONA Lockdown",
  },
  {
    fulfillment_type: "DC_SHUT_DOWN",
    description: "DC_SHUT_DOWN",
    long_description: "DC Shut Down",
  },
  {
    fulfillment_type: "PICKUP_IN_STORE",
    description: "Pickup in Store",
    long_description: "Pickup In Store",
  },
  {
    fulfillment_type: "PICKUP_IN_STORE_DC",
    description: "Pickup in Store",
    long_description: "Pickup in Store DC (Force Sourcing)",
  },
  {
    fulfillment_type: "PICKUP_IN_STORE_KIT",
    description: "Pickup in Store",
    long_description: "Pickup In Store Kit",
  },
  {
    fulfillment_type: "PICKUP_IN_STORE_KIT_ONHAND",
    description: "Pickup in Store",
    long_description: "Pickup In Store Kit Onhand",
  },
  {
    fulfillment_type: "PICKUP_IN_STORE_LV",
    description: "Pickup in Store",
    long_description: "Pickup In Store For Low Value",
  },
  {
    fulfillment_type: "PICKUP_IN_STORE_NC",
    description: "Pickup in Store",
    long_description: "Pickup In Store NC",
  },
  {
    fulfillment_type: "PICKUP_IN_STORE_ONHAND",
    description: "Pickup in Store",
    long_description: "Pickup In Store Onhand",
  },
  {
    fulfillment_type: "PICKUP_IN_STORE_SC",
    description: "Pickup in Store",
    long_description: "Pickup In Store For Store Clearance",
  },
  {
    fulfillment_type: "PRODUCT_SOURCING",
    description: "PRODUCT_SOURCING",
    long_description: "Fulfillment Type for Product Sourcing",
  },
  {
    fulfillment_type: "SHIP_2_CUSTOMER",
    description: "Ship to Customer",
    long_description: "Ship 2 Customer",
  },
  {
    fulfillment_type: "SHIP_2_CUSTOMER_DC",
    description: "Ship to Customer",
    long_description: "Ship 2 Customer DC (Force Sourcing)",
  },
  {
    fulfillment_type: "SHIP_2_CUSTOMER_KIT",
    description: "Ship to Customer",
    long_description: "Ship 2 Customer Kit",
  },
  {
    fulfillment_type: "SHIP_2_CUSTOMER_KIT_ONHAND",
    description: "Ship to Customer",
    long_description: "Ship 2 Customer Kit Onhand",
  },
  {
    fulfillment_type: "SHIP_2_CUSTOMER_LV",
    description: "Ship to Customer",
    long_description: "Ship 2 Customer For Low Value",
  },
  {
    fulfillment_type: "SHIP_2_CUSTOMER_NC",
    description: "Ship to Customer",
    long_description: "Ship 2 Customer NC",
  },
  {
    fulfillment_type: "SHIP_2_CUSTOMER_ONHAND",
    description: "Ship to Customer",
    long_description: "Ship 2 Customer Onhand",
  },
  {
    fulfillment_type: "SHIP_2_CUSTOMER_SC",
    description: "Ship to Customer",
    long_description: "Ship 2 Customer For Store Clearance",
  },
  {
    fulfillment_type: "SHIP_2_CUST_PREPAY",
    description: "Ship to Customer",
    long_description: "SHIP_2_CUST_PREPAY",
  },
  {
    fulfillment_type: "SHIP_TO_CUSTOMER",
    description: "Ship to Customer",
    long_description: "Ship To Customer",
  },
  {
    fulfillment_type: "SHIP_TO_STORE",
    description: "Ship to Customer",
    long_description: "Ship To Store",
  },
  {
    fulfillment_type: "STORE_WC_KC",
    description: "STORE_WC_KC",
    long_description: "DC Lockdown Store WC KC",
  },
];

function getFulfillmentDescription(fulfillment_type) {
  for (let i = 0; i < line_fulfillment_type.length; i++) {
    if (line_fulfillment_type[i].fulfillment_type === fulfillment_type) {
      return line_fulfillment_type[i].description;
    }
  }

  return null;
}

const moment = require("moment");

function formatDate(dateString, intervaltime, index) {
  let date = moment(dateString).format("YYYY-MM-DD HH:mm:ss");

  if (+intervaltime === 3600) {
    if (moment(date).hour() === 0 || index === 0) {
      return moment(date).format("MMM-DD");
    } else {
      return moment(date).format("HH:mm");
    }
  } else if (+intervaltime === 86400) {
    if (moment(date).date() === 1 || index === 0) {
      date = moment(dateString).format("MMM-DD");
    } else {
      date = moment(dateString).format("DD");
    }
  } else if (+intervaltime === 172800) {
    if (moment(date).month() === 1 || index === 0) {
      date = moment(dateString).format("YYYY");
    } else {
      date = moment(dateString).format("MMM");
    }
  } else if (+intervaltime === 900) {
    if (moment(date).minute() === 0 || index === 0) {
      date = moment(dateString).format("HH:mm");
    } else {
      date = moment(dateString).format("HH:mm");
    }
  }

  return date;
}

module.exports = {
  getFulfillmentDescription,
  formatDate,
};
