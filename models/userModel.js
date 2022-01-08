const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')
const methods = require('methods')

const userschema = mongoose.Schema;

// All Users Database containing Phone Password And User Role
const user = userschema({
    role: {
        type: String,
        required: true,    
        enum : ['Customer' , 'Delivery Person' , 'Admin']
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    status:{
        type : String,
        "default" : "approved"
    }

});



user.methods.generateAuthToken = async function (givenroll) {
    try {

        const token = jwt.sign({ _id: this._id.toString() , role : givenroll }, config.key)
        await this.save();
        console.log("user jwt token is : ", token)
        return token;
    } catch (error) {
        console.log(error)
    }
}


user.pre("save", async function (next) {
    // console.log(`current password is ${this.password}`)
    if (this.isModified("password"))
        this.password = await bcrypt.hash(this.password, 10);
    this.confpassword = undefined
    next()
})

user.methods.hashpass = async function () {
    // console.log(`current password is ${this.password}`)
    hash_password = await bcrypt.hash(this.password, 10);
    return hash_password;

}

module.exports = mongoose.model("user", user);
