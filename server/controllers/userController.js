const userModel = require('../models/usermodel');
const bcrypt = require('bcrypt');
const otpSend = require("../middleware/otp");
const { isUser } = require('../middleware/usermiddleware');
const productModel = require('../models/productmodel');
const categoryModel = require('../models/categorymodel')

const index = async (req, res) => {
    try {
        const category = await categoryModel.find({})
        let products = await productModel.find({})
        console.log("=====",products)
        if (req.session.isUser) {
            res.redirect('/home');
        } else {
            res.render('home',{
                isUser:req.session.isUser,
                error:req.session.error,
                category,
                products
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
const signUp = async (req, res) => {
    try {
        const email = req.body.email;
        const Username = req.body.Username; // Assuming username is in req.body
        const password = req.body.password;
        const conformPassword = req.body.password;

        const uppercaseRegex = /[A-Z]/;
        const lowercaseRegex = /[a-z]/;
        const numberRegex = /[0-9]/;
        const specialCharRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

        // Check if email or username already exists
        const alreadyExist = await userModel.findOne({
            $or: [{ email: email }, { Username: Username }]
        });

        if (alreadyExist) {
            if (alreadyExist.email === email) {
                return res.redirect('/signup?error=Email Already Exists');
            } else if (alreadyExist.Username === Username) {
                return res.redirect('/signup?error=Username Already Exists');
            }
        } 
        if(conformPassword !== password){
            return res.redirect('/signup?error=Conform your password');
        }
        
        if (password.length < 6 ||
            !uppercaseRegex.test(password) ||
            !lowercaseRegex.test(password) ||
            !numberRegex.test(password) ||
            !specialCharRegex.test(password)) {
            return res.redirect('/signup?error=Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.');
        }
        
        // Set user details in session
        req.session.userDetails = { email, Username, password };

        // Assuming otpSend.sendmail(email) is an asynchronous function
        console.log("Sending OTP to:", email);
        const otpData = await otpSend.sendmail(email);
        console.log("OTP sent:", otpData);
        
        // Store OTP in session
        req.session.OTP = otpData;

        // Redirect to OTP verification page
        return res.render("otppage", {
            OTP: otpData,
            email: email,
            error: req.query.error,
            isUser: req.session.isUser,
        });
      
    } catch (err) {
        console.log("Error in signUp: ", err);
        return res.status(500).send("Internal Server Error");
    }
};

const authOTP = async (req, res) => {
    try {
        const otp = req.body.otp;
        const storedOTP =  req.session.OTP;
        console.log(otp, "=====1st test=====", storedOTP); // Retrieve the OTP stored in the session
        if (otp === storedOTP) { // Compare the entered OTP with the stored one
            console.log("=====2nd test=====");
            // Check if userDetails and password exist in the session
            if (!req.session.userDetails || !req.session.userDetails.password) {
                res.redirect('/signup?error=User details or password not found');
                throw new Error("User details or password not found in session.");
            }

            console.log(req.session.userDetails.password)
            // Hash the password
            const hashedPassword = await bcrypt.hash(req.session.userDetails.password, 10);
            console.log(hashedPassword)
            // Create a new user with hashed password
            const registeredUser = new userModel({
                Username: req.session.userDetails.Username,
                password: hashedPassword,
                email: req.session.userDetails.email,
                status: true,
                isAdmin: 0,
            });
            console.log("=====3rd test=====");
            await registeredUser.save(); // Save the user to the database
            console.log("Registered User:", registeredUser);
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

const resendOTP = async (req, res) => {
    try {
        console.log("Session User Detail:", req.session.userDetails);
        const email = req.session.userDetails.email;
        console.log("=====Resending OTP to email:" + email);
        const otpRData = await otpSend.sendmail(email);
        console.log("===== otpResendData is ========" + otpRData);
        req.session.OTP = otpRData;
        req.session.otpTimestamp = Date.now(); // Update the timestamp
        req.session.otpError = null; // Reset OTP error
        res.redirect("/otp");
        console.log("USER RESEND OTP PAGE");
    } catch (error) {
        console.log("Error while resending OTP :" + error);
        req.session.otpError = "Error resending OTP"; // Set OTP error
        res.redirect("/otp");
    }
};

const otpPage = (req, res) => {
    try {
        const email = req.session.userDetails.email;
        res.render('otppage', {
            isUser: req.session.isUser,
            error: req.session.otpError,
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
        const userProfile = await userModel.findOne({ email: email });
        console.log(email, "check 2", userProfile);

        if (!userProfile) {
            console.log("User not found in the database.");
            req.session.error = "Not a registered user. Please register first.";
            return res.redirect('/login?error=User not found');
        } else if (!userProfile.status) {
            return res.redirect('/login?error=Your account is Blocked');
        }

        console.log(req.body.password);
        console.log(userProfile.password);

        
        const checkPass = await bcrypt.compare(req.body.password, userProfile.password);
        console.log(checkPass)
        if (checkPass) {
            console.log("Password checked");
            req.session.isUser = true;
            req.session.Username = userProfile.Username;
            req.session.email = email;
            return res.redirect("/home");
        } else {
            console.log("Incorrect password");
            req.session.error = "Incorrect password. Please try again.";
            return res.redirect("/login?error=Incorrect password");
        }
    } catch (error) {
        console.log("Error validating user:", error);
        req.session.error = "Internal Server Error. Please try again later.";
        return res.status(500).redirect("/login");
    }
};



const redirectUser = async (req, res) => {
    try {
        const category = await categoryModel.find({})
        let products = await productModel.find({})
        res.render("home", {
            isUser: req.session.isUser,
            products,
            category
        });
    } catch (error) {
        console.log("Error redirecting user: " + error);
        res.status(500).send("Internal Server Error");
    }
};


const changePassword = (req, res) => {
    try {
        res.render('changepassword', {
            isUser: req.session.isUser,
            error:req.query.error
        });
    } catch (error) {
        console.log("Error during user forgot password:", error);
        res.status(500).send("Internal Server Error");
    }
};

const changeVerify = async (req, res) => {
    try {
        const email = req.session.email
        const newPassword = req.body.newPassword;
        const oldPassword = req.body.oldPassword;

        const uppercaseRegex = /[A-Z]/;
        const lowercaseRegex = /[a-z]/;
        const numberRegex = /[0-9]/;
        const specialCharRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
        // Check if email or username already exists
        const userProfile = await userModel.findOne({
           email: email
        });


        if (!userProfile.password === newPassword) {
            return res.redirect('/forgotPassword?error= Please Sign in User not found');
        }
        

        const verifyOldPassword = await bcrypt.compare(oldPassword, userProfile.password);
        const verifyNewPassword = await bcrypt.compare(newPassword, userProfile.password);

        if (!verifyOldPassword) {
            return res.redirect('/changePassword?error= Oldpassword is wrong');
        }
        if (!verifyNewPassword) {
            return res.redirect('/changePassword?error= Old password and new Password  is same ');
        }

        if (newPassword.length < 6 ||
            !uppercaseRegex.test(password) ||
            !lowercaseRegex.test(password) ||
            !numberRegex.test(password) ||
            !specialCharRegex.test(password)) {
            return res.redirect('/changePassword?error=Password must be at least 6 characters,one uppercase letter, one lowercase letter, one number, and one special character.');
        }
        const hashedPassword = await bcrypt.hash(newPassword.toString(), 10);

        await userModel.updateOne({ email: email},{$set:{
            password:hashedPassword,
        }})
        res.redirect('/login?error=Password Changed');
    } catch (error) {
        console.log("Error during user forgot password:", error);
        res.status(500).send("Internal Server Error");
    }
};

const logout = (req, res) => {
    try {

        if(req.session.timeoutTimer){
            clearTimeout(req.session.timeoutTimer)
        }
        req.session.destroy(err => {
            if (err) {
                console.log("Error clearing sessions:", err);
                return res.status(500).send("Internal Server Error");
            }
            res.redirect("/login");
        });
    } catch (error) {
        console.log("Error during user signout:", error);
        res.status(500).send("Internal Server Error");
    }
};



const userDetails = async (req, res) => {
    try {
        const userEmail = req.session.email;
        const userProfile = await userModel.findOne({
            email: userEmail
        });
        console.log("|||||||||||",userProfile)
        if (req.session.isUser) {
            res.render('userDetails', {
                userProfile,
                isUser: req.session.isUser,
                Username: req.session.Username,
            });
            console.log("================99999999",userProfile.image)
        } else {
            res.redirect('/login');
        }


    } catch (error) {
        console.log("Error redirecting UserPage: " + error);
        res.status(500).send("Internal Server Error");
    }
};

const userUpdate = async (req, res) => {
    try {
        const userID = req.params.id;
        const updateData = req.body;

        // Get the filename from uploaded files
        const image = req.files[0].filename;
        console.log(req.files,"file:", image);
        // Update user data in the database
        const dataUpload = await userModel.updateOne({
            _id: userID
        }, {
            $set: {
                Username: updateData.Username,
                email: updateData.email,
                phone: updateData.phone,
                image: image
            }
        });

        // Check the result of the database update
        console.log("Data Upload Result:", dataUpload);
      
        res.redirect("/userdetails");
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send("Internal Server Error");
    }
};

const userImageDelete = async (req, res) => {
    try {
        const userID = req.params.id
        
        const imageDelete = await userModel.updateOne({
            _id: userID
        }, {
            $set: {
                image:""
            }
        })
        console.log(imageDelete)
        res.redirect(`/userdetails`);
    }catch (error) {
            console.error("Error updating user:", error);
            res.status(500).send("Internal Server Error");
        }
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
    userUpdate,
    userImageDelete,

    changePassword,
    changeVerify,
    // changeOtpPage,

    logout,
    signUp,
    resendOTP,


  

};