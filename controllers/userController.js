const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const postModelModel = require('../models/postModel');
const nodemailer = require ('nodemailer')
const randomstring = require("randomstring");
const postModel = require('../models/postModel');
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
};
const sendVerifyMail = async(email,name,user_id)=>{
    try{
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'akshat160403@gmail.com',
                pass: 'kpwc lnlg bazz pbyd' // or your Gmail password if less secure apps are enabled
            }
        });
        const mailOption = {
            from:'akshat160403@gmail.com',
            to:email,
            subject: 'for verification',
            html:`<p> Hi ${name}, please click here to <a href="http://localhost:3000/verify?id=${user_id}">verify</a> your email. </p>`

        }
        transporter.sendMail(mailOption, (error, info) => {
            if (error) {
                return console.log('Error: ' + error);
            }
            console.log('Email sent: ' + info.response);

        }); 
    }
    catch (error){
        console.log(error.message)
    }
}
const sendresetMail = async(email,name,token)=>{
    try{
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'akshat160403@gmail.com',
                pass: 'kpwc lnlg bazz pbyd' // or your Gmail password if less secure apps are enabled
            }
        });
        const mailOption = {
            from:'akshat160403@gmail.com',
            to:email,
            subject: 'passwod reset',
            html:`<p> Hi ${name}, please click here to <a href="http://localhost:3000/forget-password?token=${token}">reset</a> your password </p>`

        }
        transporter.sendMail(mailOption, (error, info) => {
            if (error) {
                return console.log('Error: ' + error);
            }
            console.log('Email sent: ' + info.response);

        }); 
    }
    catch (error){
        console.log(error.message)
    }
}
const loadRegister = async (req, res) => {
    try {
        res.render('registration');
    } catch (error) {
        console.log(error.message);
    }
};
const home_page = async (req,res)=>{
    try{
        res.render("home")
    }
    catch (error){
        console.log(error.message)
    }
}
const insertUser = async (req, res) => {
    try {
        // Check if the email already exists
        const existingUser = await userModel.findOne({ email: req.body.email });
        if (existingUser) {
            return res.render('home', { message: 'User already exists with this email' });
        }

        // Check if file upload exists
        if (!req.file || !req.file.filename) {
            return res.render('home', { message: 'Image upload failed. Please try again.' });
        }

        // Hash the user's password
        const password_Hash = await securePassword(req.body.password);  // Await to resolve the promise

        // Create a new user
        let user = await userModel.create({
            name: req.body.name,
            email: req.body.email,
            image: req.file.filename,  // Ensure multer is handling file uploads correctly
            mobile: req.body.contactno,
            password: password_Hash,  // Save the hashed password
            is_admin: 0
        });

        // Check if user is created successfully
        if (user) {
            try {
                // Send verification mail and ensure the function is awaited
                await sendVerifyMail(req.body.email, req.body.name, user._id);

                // Render the login page with a success message
                res.render('login', { message: 'Registration done successfully. Please check your email for verification.' });

                // Log the created user for debugging
                console.log(user);
            } catch (mailError) {
                // Handle any error that might occur while sending the email
                console.error('Error sending verification email:', mailError.message);
                res.render('home', { message: 'Registration successful, but failed to send verification email. Please try again later.' });
            }
        } else {
            // Render the home page with a failure message if user creation failed
            res.render('home', { message: 'Registration failed, try again' });
        }
    } catch (error) {
        // Catch any other unexpected errors
        console.log('Error in user registration:', error.message);
        res.render('home', { message: 'An error occurred, please try again' });
    }
};
const verifyMail = async (req, res) => {
    try {
        // Check if ID exists in the request
        const userId = req.query.id;
        if (!userId) {
            console.error("No ID provided in query");
            return res.status(400).render("error", { message: "Invalid verification link" });
        }

        // Update user verification status
        const updateInfo = await userModel.updateOne(
            { _id: userId },
            { $set: { is_verified: 1 } }
        );

        // Check if any document was modified
        if (updateInfo.modifiedCount === 0) {
            console.error("No document matched the provided ID or already verified");
            return res.status(404).render("error", { message: "User not found or already verified" });
        }

        // Render the email-verified page if successful
        res.render("email-verified");
    } catch (error) {
        // Log error details for debugging
        console.error("Error in verifyMail:", error.message);
        res.status(500).render("error", { message: "An error occurred during verification. Please try again." });
    }
};
const login_user = async (req,res) => {
    try{
        res.render('login')
    }
    catch (error){
        console.log(error)
    }
}
const login = async (req, res) => {
    try {
        // Extract email and password from the request body
        let { email, password } = req.body;

        // Check if both email and password are provided
        if (!email || !password) {
            return res.status(400).send("Email and password are required");
        }

        // Find the user by email
        let user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).render("login", { message: "User does not exist. Please register." });
        }

        // Use bcrypt.compare as a promise
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (isMatch) {
            req.session.user_id = user._id;
            return res.status(200).redirect("/main"); // Return to prevent further execution
        } else {
            return res.status(401).render("login", { message: "Incorrect password. Please try again." });
        }
    } catch (error) {
        // General server error handling
        console.error(error.message);
        return res.status(500).render("login", { message: "An internal server error occurred. Please try again later." });
    }
};
const logout_user = async (req, res) => {
    // Call req.session.destroy() and provide a callback
    req.session.destroy((err) => {
        if (err) {
            console.log("Error destroying session:", err);
            return res.status(500).send("Error logging out");
        }
        // Once the session is destroyed, redirect to the home page
        res.redirect("/");
    });
};
const forgetload = async (req ,res)=>{
    try{
        res.render('forget')
    }
    catch (error){
        console.log(error)
    }
}
const changepassword = async (req,res)=>{
    try {
        const email = req.body.email;

        // Find the user by email
        const user = await userModel.findOne({ email: email });
        
        if (user) {
            // Generate a random string (token) for password reset
            const token = randomstring.generate();

            // Update the user with the token
            await userModel.updateOne(
                { email: email },
                { $set: { token: token } }
            );

            // Send reset email
            await sendresetMail(user.email, user.name, token);

            // Show success message
            res.render('forget', { message: "Please check your mail to reset your password." });
        } else {
            // If the user is not found, show error message
            res.render('forget', { message: "User not found. Incorrect email. Please try again." });
        }

    } catch (error) {
        // Catch any error and render an error message
        console.error("Error in changepassword:", error.message);
        res.render('forget', { message: "An error occurred. Please try again later." });
    }
};
const forget_password = async (req,res)=>{
    try{
        const token = req.query.token
        const tokendata = await userModel.findOne({token:token})
        if(tokendata){
            res.render('forgetpassword',{userid:tokendata._id})

        }
        else{
            console.log("token not match")
        }
    }
    catch(error){
        console.log(error.message)
    }

}
const reset = async(req,res)=>{
    try {
        const newpassword = req.body.password
        const userid = req.body.user_id
        console.log(userid)
        // Hash the new password
        const hashedPassword = await securePassword(newpassword)

        // Update the user's password in the database
        const result = await userModel.findByIdAndUpdate(
            { _id: userid },
            { $set: { password: hashedPassword, token:""} }
        );
        console.log(result)
        res.redirect('/login')

    } catch (error) {
        console.error("Error updating password:", error.message);
        return false;
    }


}
const create_post = async (req, res) => {
    try {
        const user = await userModel.findById(req.session.user_id);
        const { content, title, isLocked, password } = req.body;

        let hashedPassword = null;
        if (isLocked && password) {
            // Hash the password if the post is locked
            const salt = await bcrypt.genSalt(10); // Generate a salt
            hashedPassword = await bcrypt.hash(password, salt); // Hash the password
        }

        // Create a new post with locking details if provided
        const post = await postModel.create({
            user: user._id,
            content,
            title,
            isLocked: Boolean(isLocked), // Ensures `isLocked` is a boolean
            password: hashedPassword // Store hashed password only if post is locked
        });

        // Link the post to the user
        user.posts.push(post._id);
        await user.save();

        res.redirect("/main");
    } catch (error) {
        console.log(error);
        res.status(500).send("An error occurred while creating the post.");
    }
};

const posts = async(req,res)=>{
    const user = await userModel.findById(req.session.user_id);
    const post = await postModel.findById(req.params.id);
    if (post.isLocked) {
        // Render view with a password form if the post is locked
        res.render("enter-password", { postId: post._id });
    } else {
        res.render("posts", { post, user});
    }
};
const unlockpost = async (req, res)=>{
    const { postId, password } = req.body;
    const user = await userModel.findById(req.session.user_id);
    const post = await postModel.findById(postId);

    const isPasswordCorrect = await bcrypt.compare(password, post.password);
    if (isPasswordCorrect) {
        res.render("posts", { post, user}); // Show the post if password is correct
    } else {
        res.render("enter-password", { postId, error: "Incorrect password, try again." });
    }
}
const edit = async (req,res)=>{
    try{
        const post=await postModel.findOne({_id:req.params.id})
        res.render("editpost",{post})
    }catch(error){
        console.log(error)
    }
}
const edit_post = async (req ,res)=>{
    try{
        let post=await postModel.findOne({_id:req.params.id})
        if(post.user!=req.session.user_id){
            res.send("Not Autorizzed")
        }
        else{
            post.content=req.body.content
            post.title=req.body.title
            await postModel.findOneAndUpdate({_id:req.params.id},post)
            res.redirect("/main")
        }
    }catch(error){
        console.log(error)

    }
}
const delete_post = async (req, res) => {
    try {
        await postModel.deleteOne({ _id: req.params.id });
        res.redirect("/main");
    } catch (error) {
        console.log(error);
        res.redirect("/main");
    }
};
const main = async(req, res )=>{
    const user = await userModel.findById(req.session.user_id).populate('posts')
    res.render("main",{user})
}
module.exports = {
    loadRegister,
    insertUser,
    verifyMail,
    home_page,
    login_user,
    login,
    main,
    logout_user,
    forgetload,
    forget_password,
    reset,
    changepassword,
    create_post,
    posts,
    unlockpost,
    edit,
    edit_post,delete_post
}