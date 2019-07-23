if (process.env.NODE_ENV == 'production') {
    module.exports = {mongoURI: "mongodb://hugo_blog_app:asdfghjkl@cluster0-dm37c.mongodb.net/test?retryWrites=true&w=majority"}
} else {
    module.exports = {mongoURI: 'mongodb://localhost/blog_appDB'}
}