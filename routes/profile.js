const express = require("express");
const router = express.Router();
const Profile = require("../models/profileModel");
const Catalog = require("../models/catalogModel");
const Orders = require("../models/ordersModel");

const auth = require("../middleware/auth");
const path = require("path");


// Get Logged In User Profile

router.get("/", auth, async (req, res) => {
  try {
    const ProfileDetails = await Profile.findOne({
      phone: req.user.phone,
    });
    res.send({ msg: { profile: ProfileDetails } });
  } catch (error) {}
});

// Add Logged In User Profile

router.route("/add").post(auth, (req, res) => {
  if (req.user.role != "Customer") {
    return res
      .status(404)
      .send({ msg: "You can't add profile create a Customer account" });
  }

  const profiledata = Profile({
    phone: req.user.phone,
    ...req.body,
  });
  profiledata
    .save()
    .then((result) => {
      res.json({ msg: result });
    })
    .catch((err) => {
      console.log(err), res.json({ err: err });
    });
});

// Edit Addresss Of User

router.route("/editAddress").post(auth, (req, res) => {
  if (req.user.role != "Customer") {
    return res
      .status(404)
      .send({ err: "You can't add profile create a Customer account" });
  }

  Profile.findOneAndUpdate(
    { phone: req.user.phone },
    {
      $set: {
        address: req.body.address,
      },
    },
    { new: true },
    (err, result) => {
      if (err) {
        console.log(err);
      }
      return res.json({ msg: result });
    }
  );
});

// Get Address Of User

router.route("/getAddress").get(auth, async (req, res) => {
  try {
    await Profile.find(
      { phone: req.user.phone },
      "address",
      function (err, result) {
        if (err) return res.status(403).send(err);
        return res.json(result);
      }
    );
  } catch (error) {
    console.log(err), res.json({ err: err });
  }
});

// Add Catalog To Cart 
// If a new catalog is passed it will be added to cart with the given count
// if a previously added catalog is passed it will replace the previous count with the new
// count given new count is greater than previous one

// Also Catalog Address Will be selected randomly from given catalog document 

router.route("/AddToCart").post(auth, async (req, res) => {
  if (req.user.role != "Customer") {
    return res
      .status(404)
      .send({ msg: "Login as customer to add products to cart" });
  }

  try {
    const { catalog_id, count } = req.body;
    const Catalog_details = await Catalog.findOne({
      _id: catalog_id,
    });

    const query = { phone: req.user.phone };
    const catalogquery = {
      phone: req.user.phone,
      "cart.catalog_id": catalog_id,
    };

    const update = {
      $addToSet: {
        cart: {
          catalog_id: catalog_id,
          catalog_name: Catalog_details.catalogname,
          catalog_count: count,
          catalog_address:
            Catalog_details.Addresses[
              Math.floor(Math.random() * Catalog_details.Addresses.length)
            ],
        },
      },
    };
    // const options = { upsert: true };
    const userProfile = await Profile.findOne(query);
    const userCatalog = await Profile.findOne(catalogquery);

    if (userProfile === null) {
      const user = await Profile({
        phone: req.user.phone,
        cart: {
          catalog_id: catalog_id,
          catalog_name: Catalog_details.catalogname,
          catalog_count: count,
          catalog_address:
            Catalog_details.Addresses[
              Math.floor(Math.random() * Catalog_details.Addresses.length)
            ],
        },
      }).save();
      return res.json({
        msg: "Product Added to cart previously Empty Profile",
      });
    } else if (!userCatalog) {
      await Profile.updateOne(query, update);
      return res.json({ msg: "Added to cart" });
    } else if (
      userCatalog.cart.filter((c) => c.catalog_id === catalog_id)[0]
        .catalog_count >= count
    ) {
      throw "Adding count is less than current count";
    } else {
      const cartcatalogupdate = {
        $set: {
          "cart.$.catalog_count": count,
        },
      };

      await Profile.updateOne(catalogquery, cartcatalogupdate);
      return res.json({ msg: "Added to cart" });
    }
  } catch (error) {
    console.log(error);
    return res.status(402).send({ error });
  }
});

// Remove Catalog From Cart 
// If a catalog is passed without count it will be removed from cart
// if a catalog is passed with count it will replace the previous count with the new
// count given new count is less than previous one

router.route("/RemoveFromCart").post(auth, async (req, res) => {
  if (req.user.role != "Customer") {
    return res
      .status(404)
      .send({ msg: "Login as customer to remove products from cart" });
  }
  try {
    const { catalog_id, count } = req.body;
    console.log(count, "count");
    const query = {
      phone: req.user.phone,
      "cart.catalog_id": catalog_id,
    };
    var update = {};
    if (count != undefined) {
      update = {
        $set: {
          "cart.$.catalog_count": count,
        },
      };
    } else {
      update = {
        $pull: {
          cart: {
            catalog_id: catalog_id,
          },
        },
      };
    }

    const user = await Profile.findOne(query);

    if (!user) throw "Given Catalog is yet to be added in the cart";
    else if (
      user.cart.filter((c) => c.catalog_id === catalog_id)[0].catalog_count <=
      count
    )
      throw "Removal count is greater than current count";
    await Profile.findOneAndUpdate(query, update);
    return res.json({ msg: "Cart Updated" });
  } catch (error) {
    console.log(error);
    return res.status(402).send({ error });
  }
});

// Get User Cart
router.get("/cart", auth, async (req, res) => {
  try {
    const ProfileDetails = await Profile.findOne(
      {
        phone: req.user.phone,
      },
      "cart"
    );
    res.send({ msg: { profile: ProfileDetails } });
  } catch (error) {
    console.log(err), res.json({ err: err });

  }
});

// Place A Order. Pickup Locations Will be randomly selected from catalog address

router.route("/placeOrder").post(auth, async (req, res) => {
  if (req.user.role != "Customer") {
    return res
      .status(404)
      .send({ msg: "You can't add profile create a Customer account" });
  }
  const CatalogsAddresses = await Catalog.find({}, "Addresses");
  var pickupLocations = [];
//   console.log(CatalogAddress);
  for (let i = 0; i < req.body.Items.length; i++) {
      const element = req.body.Items[i];
      var CatalogAddresses = CatalogsAddresses[
        Math.floor(Math.random() * CatalogsAddresses.length)
      ];

      pickupLocations.push(CatalogAddresses.Addresses[
        Math.floor(Math.random() * CatalogAddresses.Addresses.length)
      ]);
  }


  const Order = await Orders({
    customerID: req.user._id,
    pickupLocations : pickupLocations,
    ...req.body,
  });
  Order.save()
    .then((result) => {
      res.json({ msg: result });
    })
    .catch((err) => {
      console.log(err), res.json({ err: err });
    });
});
module.exports = router;
