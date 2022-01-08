const express = require("express");
const router = express.Router();
const Profile = require("../models/delperModel");
const Catalog = require("../models/catalogModel");
const Orders = require("../models/ordersModel");

const auth = require("../middleware/auth");
const path = require("path");

// Get Logged In User Profile
router.get("/", auth, async (req, res) => {
  if (req.user.role != "Delivery Person") {
    return res
      .status(404)
      .send({ msg: "Login As Delivery Person" });
  }
  try {
    const ProfileDetails = await Profile.findOne({
      phone: req.user.phone,
    });
    res.send({ msg: { profile: ProfileDetails } });
  } catch (error) {}
});

// Add Logged In User Profile

router.route("/add").post(auth, (req, res) => {
  if (req.user.role != "Delivery Person") {
    return res
      .status(404)
      .send({ msg: "You can't add profile create a Delivery Person account" });
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
  if (req.user.role != "Delivery Person") {
    return res
      .status(404)
      .send({ err: "You can't add profile create a Delivery Person account" });
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

// View All Assinged Orders To User By Admin With
// Or Without Filter. If Needed Without Filter i.e. All Orders Then Don'e Pass 'filter' in request data

router.post("/assignedorders", auth, async (req, res) => {
  try {
    if (req.user.role != "Delivery Person") {
      return res.status(404).send({ msg: "Login as Delivery Person" });
    }

    const ordersassinged = await Profile.findOne(
      { phone: req.user.phone },
      "orders"
    );
    console.log(ordersassinged)

    var query = { _id: { $in: ordersassinged.orders }};
    if (req.body.filter != undefined) {
      query = {_id: { $in: ordersassinged.orders } ,
        orderStage: req.body.filter,
      };
    }

    const orderDetails = await Orders.find(query);
    res.send({ msg: { orderDetails: orderDetails } });
  } catch (error) {
    console.log(error), res.json({ err: error });
  }
});

// Update status of A Assinged Order Only
router.post("/updateStatus", auth, async (req, res) => {
    try {
      if (req.user.role != "Delivery Person") {
        return res.status(404).send({ msg: "Login as Delivery Person" });
      }
  
      const deliveryPersonDetails = await Orders.findOne(
        { _id: req.body.order_id },
        "deliveryPersonNo"
      );

      if (deliveryPersonDetails && deliveryPersonDetails.deliveryPersonNo == req.user.phone) {
        const updatedStatus = await Orders.findOneAndUpdate(
            { _id: req.body.order_id },
            {orderStage : req.body.orderStage},
            {new : true}
            
          );

          res.json({ msg: {status : 'Status Updated' , details :  updatedStatus} });
      }
      res.send({ msg: 'You Are Not Assingned To This Order' });
    } catch (error) {
      console.log(error), res.json({ err: error });
    }
  });
  

module.exports = router;
