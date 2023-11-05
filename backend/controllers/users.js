const User = require('../models/User');
const JWT = require('jsonwebtoken');
const passportConfig = require('../passport');
const { userAttributes } = require('../constants');

const issuer = process.env.ISSUER || "Dogmeet";
const tokenSecret = process.env.TOKENSECRET || "I love cookies big time";
const cookieName = process.env.COOKIENAME || "accessTokenDogMeet";

const signToken = _id => {
    return JWT.sign({
        iss: issuer,
        sub: _id
    }, tokenSecret, { expiresIn: "1 day" });
};

exports.register = async (req, res) => {
    const reqUser = req.body;
    reqUser["role"] && (delete reqUser["role"]);
    User.findOne({userName: reqUser.userName}, (error, user) => {
        if (error) { res.status(500).json({message: { text: "An error occurred", errorOccurred: true }}) }
        if (user) { res.status(400).json({message: { text: "Username already taken", errorOccurred: true }}) }
        else {
            const newUser = new User({ ...reqUser });
            newUser.save((error) => {
                if (error) { res.status(500).json({message: { text: "An error occurred", errorOccurred: true }}) }
                else {
                    res.status(201).json({message: { text: "User successfully created", errorOccurred: false }})
                }
            });
        };
    });
};

exports.login = async (req, res) => {
    if (req.isAuthenticated()) {
        const { _id, userName, role } = req.user;
        const token = signToken(_id);
        res.cookie(cookieName, token, {httpOnly: true, sameSite: true});    // TODO: Check into httpOnly: true
        res.status(200).json({ authenticated: true, user: { userName, role } });
    };
};

exports.logout = async (req, res) => {
    res.clearCookie(cookieName);
    res.json({ authenticated: false, user: {userName: '', role: ''} });
};

exports.isAuthenticated = async (req, res) => {
    const { _id, userName, role } = req.user;
    res.status(200).json({ authenticated: true, user: { userName, role } });
}

exports.getUser = async (req, res) => {
    const { _id, userName, role } = req.user;
    try {
        const user = await User.findOne({userName}).exec();
        let userInfo = {};
        userAttributes.map(attribute => { userInfo[attribute.valueName] = user[attribute.valueName] });
        res.status(200).json(userInfo);
    } catch (error) {
        res.status(500).json({message: { text: "An error occurred", errorOccurred: true }})
    };
};

exports.edit = async (req, res) => {
    const { _id, userName, role } = req.user;
    try {
        let user = await User.findOne({userName}).exec();
        let updatedUser = { ...req.body, password: user.password, _id, userName, role };
        updatedUser = await User.findOneAndUpdate({userName}, updatedUser, {new: true}).exec();
        res.status(200).json({message: { text: "User successfully updated", errorOccurred: false }})
    } catch (error) {
        res.status(500).json({message: { text: "An error occurred", errorOccurred: true, error }})
    };
};

exports.changePassword = async (req, res) => {
    const { userName } = req.user;
    const newPassword = req.body.newPassword;
    try {
        let user = await User.findOne({userName}).exec();
        user["password"] = newPassword;
        await user.save();
        res.status(200).json({message: { text: "Password successfully updated!", errorOccurred: false }})
    } catch (error) {
        res.status(500).json({message: { text: "An error occurred", errorOccurred: true }})
    };
};

exports.checkPassword = async (req, res, next) => {
    try {
        let user = await User.findOne({ userName: req.user.userName }).exec();
        user.comparePwdsForChangingPwd(req.body.password, (error, isMatch) => {
            if (error) { res.status(500).json({message: { text: "An error occurred", errorOccurred: true }}) };
            if (!(isMatch)) { res.status(401).json({message: {text: "Wrong password", errorOccurred: true }}) };
            if (isMatch) { next() };
        });
    } catch (error) {
        res.status(500).json({message: { text: "An error occurred", errorOccurred: true }})
    }
};

exports.getAllAttributes = async (req, res) => {
    res.json(userAttributes);
};