const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Profile = require("../models/profileModel");
const dpProfile = require("../models/delperModel");

const Catalog = require("../models/catalogModel");
const Orders = require("../models/ordersModel");

const auth = require("../middleware/auth");
const path = require("path");


// Add A new Catalog To Database

router.route("/addCatalog").post(auth, (req, res) => {
  if (req.user.role != "Admin") {
    return res.status(404).send({ msg: "Login as Admin" });
  }

  const newCatalog = Catalog({
    ...req.body,
  });
  newCatalog
    .save()
    .then((result) => {
      res.json({ msg: result });
    })
    .catch((err) => {
      console.log(err), res.json({ err: err });
    });
});

// Edit i.e. Add Or Remove New Addresses From Catalog

router.route("/editCatalogAddress").post(auth, (req, res) => {
  if (req.user.role != "Admin") {
    return res.status(404).send({ msg: "Login as Admin" });
  }

  Catalog.findOneAndUpdate(
    { _id: req.body.catalog_id },
    {
      $set: {
        Addresses: req.body.address,
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

// Get All Catalogs

router.route("/allCatalogs").post(auth, (req, res) => {
  if (req.user.role != "Admin") {
    return res.status(404).send({ msg: "Login as Admin" });
  }

  Catalog.find({}, (err, result) => {
    if (err) {
      console.log(err);
    }
    return res.json({ msg: result });
  });
});

// Get All Orders With
// Or Without Filter. If Needed Without Filter i.e. All Orders Then Don'e Pass 'filter' in request data
router.post("/orders", auth, async (req, res) => {
  try {
    if (req.user.role != "Admin") {
      return res.status(404).send({ msg: "Login as Admin" });
    }
    var query = {};
    if (req.body.filter != undefined) {
      query = {
        orderStage: req.body.filter,
      };
    }
    const allorders = await Orders.find(query);
    res.send({ msg: { allorders: allorders } });
  } catch (error) {
    console.log(err), res.json({ err: err });
  }
});

// Get All Delivery Persons

router.post("/deliverypersons", auth, async (req, res) => {
  try {
    if (req.user.role != "Admin") {
      return res.status(404).send({ msg: "Login as Admin" });
    }
    const dp = await User.find({ role: "Delivery Person" });
    res.send({ msg: { Delivery_Persons: dp } });
  } catch (error) {
    console.log(err), res.json({ err: err });
  }
});

// Assign Order To A deleivery person

router.post("/assignOrder", auth, async (req, res) => {
  try {
    if (req.user.role != "Admin") {
      return res.status(404).send({ msg: "Login as Admin" });
    }
    const query = { phone: req.body.phone };

    const update = {
      $addToSet: {
        orders: req.body.order_id,
      },
    };

    const assingedas = await dpProfile.findOneAndUpdate(query, update, {
      new: true,
    });

    const deleiverPersonId = await Orders.findOneAndUpdate(
      { _id: req.body.order_id },
      { deliveryPersonNo: req.body.phone }
    );
    res.send({ msg: "Orders Assingned" });
  } catch (error) {
    console.log(error), res.json({ err: error });
  }
});

module.exports = router;
