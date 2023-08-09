const express = require('express')
const router = express.Router()
const cors = require('cors')
const {test, registerUser, loginUser, getProfile, ensureAuth} = require('../controllers/authController')
const Comment = require('../models/comment')




//middleware
router.use(
    cors({
        origin: "https://gamewalkthroughs.onrender.com",
        methods: ["POST", "GET"],
        credentials: true
    }))


router.get('/', test)
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile', getProfile)
router.get('/comments', async (req, res) => {
    try {
        const comments = await Comment.find({}).populate('author', 'name').exec()
        res.json(comments)
    } catch (err) {
        console.error(err)
        res.status(500).send('Server error')
    }})


router.post('/comments', ensureAuth, async (req, res) => {
    try {
        const { text } = req.body
        const userId = req.user.id

        const comment = await Comment.create ({
            text: text,
            author: userId
        })

        await comment.save()
        await Comment.populate(comment, { path: 'author', select: 'name' })

        res.json({message: 'Comment successfully added', comment})
    } catch(err) {
        console.error(err)
        res.status(500).send('Server error')
    }
})


module.exports = router