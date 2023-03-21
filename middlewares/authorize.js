const jwt = require("jsonwebtoken")

const roles = {
    User: 'user',
}

const authorize = (roles = []) => {
    // roles param can be a single role string (e.g. Role.User or 'User')
    if (typeof roles === 'string') {
        roles = [roles];
    }
    let callNext = true
    return (req, res, next) => {
        const authHeaders = req.headers["authorization"]
        const token = authHeaders && authHeaders.split(" ")[1]
        if (token == null) return res.sendStatus(401) // Unauthorized
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                callNext = false
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied due to authorization failure'
                })
            }
            req.user = user
        })
        if (roles.length && !roles.includes(req.user.role)) {
            callNext = false
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized role'
            })
        }
        if (callNext) next();
    };
}

module.exports = {
    authorize,
    roles
}