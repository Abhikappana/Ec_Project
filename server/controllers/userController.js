const userModel = require('../models/usermodel');
const bcrypt = require('bcrypt');
const otpSend = require("../middleware/otp");


const index = async (req, res) => {
    try {
        if (req.session.isUser) {
            res.redirect('/home');
        } else {
            res.render('home', {
                isUser: req.session.isUser
            });
            console.log("index Page");
        }
    } catch (error) {
        console.log("Error rendering index page: " + error);
        res.status(500).send("Internal Server Error");
    }
};

const login = (req, res) => {
    try {
        let message = req.query.error;
        if (req.session.isUser) {
            res.redirect('/home');
        } else {
            res.render('userlogin', {
                isUser: req.session.isUser,
                error:req.query.error
            });
        }
    } catch (error) {
        console.log("Error rendering user login page: " + error);
        res.status(500).send("Internal Server Error");
    }
};

const signupPage = (req, res) => {
    try {
       
        res.render("signup", {
            isUser: req.session.isUser,
            error:req.query.error
        });
        console.log("User signup");
    } catch (error) {
        console.log("Error rendering user signup page: " + error);
        res.status(500).send("Internal Server Error signup");
    }
};

var OTP;
const signUp = async (req, res) => {
    try {
        console.log(req.body);
        const email = req.body.email;
        const username = req.body.username; // Assuming username is in req.body
        const alreadyExist = await userModel.findOne({
            $or: [{ email: email }, { username: username }]
        });

        if (alreadyExist) {
            if (alreadyExist.email === email) {
                return res.redirect('/signup?error=Email Already Exist');
            } else if (alreadyExist.username === username) {
                return res.redirect('/signup?error=Username Already Exist');
            }
        } else {
            req.session.userDetails = req.body;
            console.log("sending otp");
            const otpData = otpSend.sendmail(email);
            console.log(otpData);
            OTP = otpData;
            console.log("OTP received is: " + otpData);
            return res.render("otppage", {
                OTP,
                email,
                error,
                isUser: req.session.isUser,
            });
        }
    } catch (err) {
        console.log("Error in signUp: ", err);
        return res.status(500).send("Internal Server Error");
    }
};


const authOTP = async (req, res) => {
    try {
        const otp = req.body.otp;
        const storedOTP = OTP;
        console.log(otp, "=====1st test=====", storedOTP); // Retrieve the OTP stored in the session
        if (otp === storedOTP) { // Compare the entered OTP with the stored one
            console.log("=====2st test=====");
            // Check if userDetails and password exist in the session
            if (!req.session.userDetails || !req.session.userDetails.password) {
                throw new Error("User details or password not found in session.");
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(req.session.userDetails.password.toString(), 10);
            // Create a new user with hashed password
            const registeredUser = new userModel({
                Username: req.session.userDetails.Username,
                password: hashedPassword,
                email: req.session.userDetails.email,
                status: true,
                isAdmin: 0,
            });
            console.log("=====3st test=====");
            await registeredUser.save(); // Save the user to the database
            console.log("", registeredUser);
            res.redirect("/login");
        } else {
            res.render("otppage", {
                email: req.session.userDetails.email,
                error: "Invalid OTP entered",
                isUser: req.session.isUser
            });
        }
    } catch (err) {
        console.log("Error while authenticating OTP: " + err);
        res.status(500).send("Internal Server Error");
    }
};

  

const resendOTP = (req, res) => {
    try {
        console.log("Session User Detail:", req.session.userDetails);
        const email = req.session.userDetails.email;
        console.log("=====Resending OTP to email:" + email);
        const otpRData = otpSend.sendmail(email);
        console.log("===== otpResendData is ========" + otpRData);
        newOTP = otpRData;
        console.log(
            "OTP received after 60s is: " +   + " and timestamp is:  " + otpRData
        );
        req.session.otpTimestamp = otpRData[1];
        error = req.session.otpError;
        res.redirect("/otp");
        console.log("USER RESEND OTP PAGE");
    } catch (error) {
        console.log("Error while resending OTP :" + error);
    }
};

const otpPage = (req, res) => {
    try {
        let message = 0;
        let email = req.session.email;
        res.render('otppage', {
            isUser: req.session.isUser,
            error: "Invalid OTP entered",
            email
        });
    } catch (error) {
        console.log("Error rendering user otp page: " + error);
        res.status(500).send("Internal Server Error on otp");
    }
};

const checkUserIn = async (req, res) => {
    try {
        console.log("check 1");
        const email = req.body.email;
        const userProfile = await userModel.findOne({
            email: email
        });
        console.log(email, "check 2", userProfile);

        if (!userProfile) {
            console.log("User not found in the database.");
            req.session.error = "Not a registered user. Please register first.";
            return res.redirect('/login');
        }

        console.log(req.body.password);
        console.log(userProfile.password);

        const checkPass = await bcrypt.compare(req.body.password, userProfile.password);

        if (checkPass) {
            console.log("Password checked");
            req.session.isUser = true;
            req.session.Username = userProfile.Username;
            req.session.email = email;
            return res.redirect("/home");
        } else {
            console.log("Incorrect password");
            req.session.error = "Incorrect password. Please try again.";
            return res.redirect("/login");
        }
    } catch (error) {
        console.log("Error validating user:", error);
        req.session.error = "Internal Server Error. Please try again later.";
        return res.status(500).redirect("/login");
    }
};


const redirectUser = async (req, res) => {
    try {
        res.render("home", {
            isUser: req.session.isUser
        });
    } catch (error) {
        console.log("Error redirecting user: " + error);
        res.status(500).send("Internal Server Error");
    }
};

const userDetails = async (req, res) => {
    try {
        const userEmail = req.session.email;
        const userProfile = await userModel.findOne({
            email: userEmail
        });
        if (req.session.isUser) {
            res.render('userDetails', {
                isUser: req.session.isUser,
                Username: userProfile.Username,
                email: userProfile.email
            });
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log("Error redirecting UserPage: " + error);
        res.status(500).send("Internal Server Error");
    }
};

const logout = (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) {
                console.log("Error clearing sessions:", err);
                return res.status(500).send("Internal Server Error");
            }
            res.redirect("/login");
        });
        console.log("User logged out");
    } catch (error) {
        console.log("Error during user signout:", error);
        res.status(500).send("Internal Server Error");
    }
};


const productdetail = (req, res) => {
    res.render('product-detail', {
        isUser: req.session.isUser
    })
}
const product = (req, res) => {
    res.render('product', {
        isUser: req.session.isUser
    })
}

module.exports = {
    index,
    login,
    signupPage,
    authOTP,
    otpPage,
    checkUserIn,
    redirectUser,
    userDetails,
    logout,
    signUp,
    resendOTP,

    productdetail,
    product

};