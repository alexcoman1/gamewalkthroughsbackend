const express = require('express')
const router = express.Router()
const cors = require('cors')
const {test, registerUser, loginUser, getProfile, ensureAuth} = require('../controllers/authController')
const Comment = require('../models/comment')




//middleware
router.use(
    cors({
        origin: "https://gamewalkthroughs.onrender.com",
        methods: ["POST", "GET", "DELETE"],
        credentials: true
    }))


router.get('/', test)
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile', getProfile)
router.get('/comments', async (req, res) => {
    try {
        const page = req.query.page
        const comments = await Comment.find({ page: page }).populate('author', 'name').exec()
        res.json(comments)
    } catch (err) {
        console.error(err)
        res.status(500).send('Server error')
    }})


router.post('/comments', ensureAuth, async (req, res) => {
    try {
        const { text, page } = req.body
        const userId = req.user.id

        const comment = await Comment.create ({
            text: text,
            author: userId,
            page: page
        })

        await comment.save()
        await Comment.populate(comment, { path: 'author', select: 'name' })

        res.json({message: 'Comment successfully added', comment})
    } catch(err) {
        console.error(err)
        res.status(500).send('Server error')
    }
})

router.delete('/comments/:commentId', ensureAuth, async (req, res) => {
    try {
        const commentId = req.params.commentId
        const userId = req.user.id

        const comment = await Comment.findById(commentId)

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' })
        }

        if (comment.author.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this comment'})
        }

        await Comment.findByIdAndDelete(commentId)

        res.json({ message: 'Comment successfully deleted' })
    } catch (err) {
        console.error(err)
        res.status(500).send('Server error')
    }
})

router.get('/logout', (req, res) => {
    res.clearCookie('token', {sameSite: 'none', secure:true })
    res.json({message: 'Logged out successfully' })
})


module.exports = router