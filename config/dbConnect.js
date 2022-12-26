const { default: mongoose } = require("mongoose")

const dbConnect = () => {
    try{
        const conn = mongoose.connect(process.env.DB_URL)
        console.log('Database connected successfully');
    }catch(error){
        console.log(error)
    }
}

module.exports = dbConnect