var jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        var decoded = jwt.verify(req.headers.authorization, "secret_key");
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            Error : "Napaka pri avtentikaciji"
        });
    }
}