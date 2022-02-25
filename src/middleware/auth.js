const jwt = require('jsonwebtoken')
require('dotenv/config');

function authMiddleware(authorization) {
     if (!authorization) {
          return { error: "no token provided" }
     }
     authorization = authorization.replace("%20", " ")
     if (!authorization) {
          return { error: "no token provided" }
     }
     const parts = authorization.split(' ')

     if (!parts.length === 2) {
          return { error: "token with wrong format" }
     }

     const [scheme, token] = parts
     if (!/^Bearer$/i.test(scheme)) {
          return { error: "token with wrong format" }
     }

     const isVerified = jwt.verify(token, process.env.SECRET, (err, decoded) => {
          if (err) {
               return { error: "invalid token" }
          }
          let auth = {}
          auth.userId = decoded.id
          auth.userType = decoded.userType
          return auth
     })
     return isVerified
}

function checkAdminPrivilege(req, res, next) {

     const auth = req.headers.authorization
     let response = authMiddleware(auth)
     if (response.error)
          return res.status("401").send(response)

     if (response.userType != "Administrator" && response.userType != "Admin") {
          return res.status("401").send({ error: "user Unauthorized" })

     }
     next()

}



module.exports = { authMiddleware, checkAdminPrivilege }