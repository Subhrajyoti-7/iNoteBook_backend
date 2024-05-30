const jwt = require('jsonwebtoken');
const JWT_SECRET = "secret";

const fetchuser = async (req, res, next) => {
    //Get the user from the jwt token and add it to the req object
    const token = await req.header('auth-token');
    if (!token) {
        return res.status(401).send("Please enter valid credentials");
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).send("Please enter valid credentials");
    }
}

module.exports = fetchuser;