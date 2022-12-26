const JsonWebToken  = require("jsonwebtoken");

const generateToken = (id) => {
    return JsonWebToken.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"});
}

module.exports = {generateToken};
