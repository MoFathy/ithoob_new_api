const JsonWebToken  = require("jsonwebtoken");

const generateRefreshToken = (id) => {
    return JsonWebToken.sign({id}, process.env.JWT_SECRET, {expiresIn: "3d"});
}

module.exports = {generateRefreshToken};
