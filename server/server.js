const express = require("express")
const app = express()
const cors = require("cors")

require("dotenv").config()

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// Parse JSON bodies
app.use(express.json())
app.use(express.urlencoded({extended:false})) 

app.use("/", require("./routes/index"))
app.use("/users",require("./routes/users"))
app.use("/",require("./routes/posts"))

const PORT = process.env.PORT || 3100
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
