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
                comment: "POST /posts/:id/comment",
                getByTag: "GET /posts/tag/:tag",
                getAllTags: "GET /tags"
            },
            uploads: {
                avatar: "POST /api/uploads/avatar",
                postImage: "POST /api/uploads/post-image",
                commentImage: "POST /api/uploads/comment-image",
                getUserUploads: "GET /api/uploads/user/:userId",
                deleteUpload: "DELETE /api/uploads/:uploadId"
            },
            communities: {
                getAll: "GET /api/communities",
                getOne: "GET /api/communities/:name",
                create: "POST /api/communities",
                join: "POST /api/communities/:name/join",
                leave: "POST /api/communities/:name/leave",
                getPosts: "GET /api/communities/:name/posts",
                getSubscribed: "GET /api/communities/user/subscribed",
                moderation: {
                    ban: "POST /api/communities/:name/ban",
                    unban: "POST /api/communities/:name/unban",
                    deletePost: "DELETE /api/communities/:name/posts/:postId",
                    deleteComment: "DELETE /api/communities/:name/comments/:commentId",
                    promote: "POST /api/communities/:name/promote",
                    demote: "POST /api/communities/:name/demote",
                    getBans: "GET /api/communities/:name/bans",
                    getModLog: "GET /api/communities/:name/moderation-log"
                }
            },
            search: {
                all: "GET /api/search?q=query&type=all",
                posts: "GET /api/search/posts?q=query&sort=relevance&limit=10&offset=0",
                comments: "GET /api/search/comments?q=query&sort=newest&limit=10&offset=0",
                users: "GET /api/search/users?q=query&sort=relevance&limit=10&offset=0",
                tags: "GET /api/search/tags?q=query&sort=usage&limit=10&offset=0",
                advanced: "GET /api/search/advanced?q=query&type=posts&tags=tag1,tag2&author=username&dateFrom=2024-01-01&dateTo=2024-12-31&hasAnswers=true&isAnswered=true"
            }
        }
    })
})

module.exports = router;