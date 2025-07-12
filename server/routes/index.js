const express = require("express")
const router = express.Router()

router.get("/",(req,res)=>{
    res.json({
        message: "Welcome to the API",
        status: "success",
        endpoints: {
            auth: {
                login: "POST /users/login",
                register: "POST /users/register",
                logout: "GET /users/logout",
                dashboard: "GET /users/dashboard"
            },
            posts: {
                getAll: "GET /posts",
                getOne: "GET /posts/:id",
                create: "POST /posts/create",
                upvote: "POST /posts/:id/upvote",
                downvote: "POST /posts/:id/downvote",
                comment: "POST /posts/:id/comment"
            }
        }
    })
})

module.exports = router;