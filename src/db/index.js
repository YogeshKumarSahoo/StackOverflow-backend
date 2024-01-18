const mongoose = require('mongoose')
require('dotenv').config()
const username = process.env.USERR
const password = process.env.PASSWORD
mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.hbh3oen.mongodb.net/Stacks`)

const questionSchema = mongoose.Schema({
    page_no: Number,
    data: { 
        tags: [String],
        owner: {
            account_id: Number,
            reputation: Number,
            user_id: Number,
            user_type: String,
            profile_image: String,
            display_name: String,
            link: String
        },
        is_answered: Boolean,
        view_count: Number,
        answer_count: Number,
        score: Number,
        last_activity_date: Number,
        creation_date: Number,
        question_id: Number,
        content_license: String,
        link: String,
        title: String
    }
})
const Question = mongoose.model('question', questionSchema);
module.exports = {
    Question
}
