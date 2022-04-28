import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import seedRouter from "./routes/seedRoutes.js"
import productRouter from "./routes/productRoutes.js"

dotenv.config()

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB")
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err.message)
  })

const app = express()

app.use("/api/seed", seedRouter)

app.use("/api/products", productRouter)

const port = process.env.PORT || 5555
app.listen(port, () => {
  console.log(`serve at http://localhost:${port}`)
})
