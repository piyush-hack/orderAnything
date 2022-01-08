const express = require("express");
const USER = require("../models/userModel");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth.js");
const { check, validationResult } = require("express-validator");
const CryptoJS = require("crypto-js");
const router = express.Router();


// Get looged in user Phone
router.get("/", auth, async (req, res) => {
  try {
    res.send({ msg: {phone : req.user.phone } });
  } catch (error) {
    res.status(403).send(error);
    console.log(error);
  }
});

// Login User

router.route("/login").post(
  [
    check("phone", "Phone number should contains 10 digits").isLength({
      min: 10,
      max: 10,
    }),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const phone = req.body.phone;
      const password = req.body.password;

      const userfind = await USER.findOne({ phone: phone });
      if (userfind) {
        let ismatch = await bcrypt.compare(password, userfind.password);
        if (ismatch) {
          let token = await userfind.generateAuthToken(userfind["role"]);
          console.log(token);
          res
            .status(200)
            .send({ msg: "User succesfully loggedin", token: token });
        } else {
          res.json({ err: "password incorrect" });
        }
      } else {
        res.send({ err: "no user found" });
      }
    } catch (error) {
      console.log(error);
      res.status(401).send({ err: error });
    }
  }
);

// Register User With Its Role i.e. 'Customer' , 'Admin' and 'Delivery Person'

router.route("/register").post(
  [
    check("role", "Role is required").notEmpty(),
    check("phone", "Phone number should contains 10 digits").isLength({
      min: 10
    }),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
    check(
      "confpassword",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: errors.array() });
    }
    try {
      // return res.status(200).send({ msg: "user succesfully login", token })

      const password = req.body.password;
      const cpassword = req.body.confpassword;
      var givenrole = "basic";
      if (req.body.role != undefined) {
        givenrole = req.body.role;
      }
      if (password === cpassword) {
        const userdata = new USER({
          role: givenrole,
          phone: req.body.phone,
          password: req.body.password,
        });
        let token = await userdata.generateAuthToken(givenrole);
        await userdata
          .save()
          .then(async () => {
            res.status(200).send({
              msg: "user succesfully registered.",
              token: token,
            });
          })
          .catch((err) => {
            res.status(403).json({ err: err });
          });
      } else {
        res.send({ err: "password doesn't match!!" });
      }
    } catch (error) {
      console.log(error);
      res.status(401).send({ err: error });
    }
  }
);

module.exports = router;
