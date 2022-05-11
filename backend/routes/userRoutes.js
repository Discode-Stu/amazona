import express from "express"
import bcrypt from "bcryptjs"
import expressAsyncHandler from "express-async-handler"
import User from "../models/userModel.js"
import { generateToken, isAdmin, isAuth } from "../utils.js"

const userRouter = express.Router()

userRouter.get(
  "/top-sellers",
  expressAsyncHandler(async (req, res) => {
    const topSellers = await User.find({ isSeller: true })
      .sort({ "seller.rating": -1 })
      .limit(3)
    res.send(topSellers)
  })
)

userRouter.get(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const users = await User.find({})
    res.send(users)
  })
)

userRouter.get(
  "/public/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
    if (user) {
      res.send({
        email: user.email,
        seller: { ...user.seller },
      })
    } else {
      res.status(404).send({ message: "User not found" })
    }
  })
)

userRouter.get(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
    if (user) {
      res.send(user)
    } else {
      res.status(404).send({ message: "User not found" })
    }
  })
)

userRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
    if (user) {
      user.name = req.body.name || user.name
      user.email = req.body.email || user.email
      user.isAdmin = req.body.isAdmin ? true : false
      user.isSeller = req.body.isSeller ? true : false
      const updatedUser = await user.save()
      res.send({ message: "User Updated", user: updatedUser })
    } else {
      res.status(404).send({ message: "User not found" })
    }
  })
)

userRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
    if (user) {
      if (user.email === "admin@example.com") {
        res.status(400).send({ message: "Cannot delete admin user" })
        return
      }
      await user.remove()
      res.send({ message: "User deleted" })
    } else {
      res.status(404).send({ message: "User not found" })
    }
  })
)

userRouter.post(
  "/signin",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          isSeller: user.isSeller,
          token: generateToken(user),
        })
        return
      }
    }
    res.status(401).send({ message: "Invalid email or password" })
  })
)

userRouter.post(
  "/signup",
  expressAsyncHandler(async (req, res) => {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    })
    const user = await newUser.save()
    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSeller: user.isSeller,
      token: generateToken(user),
    })
  })
)

userRouter.post(
  "/profile",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    console.log("req.body_______", req.body)
    const user = await User.findById(req.user._id)
    console.log("user", user)
    if (user) {
      user.name = req.body.name || user.name
      user.email = req.body.email || user.email
      if (user.isSeller) {
        user.seller.name = req.body.sellerName || user.seller.name
        user.seller.logo = req.body.sellerLogo || user.seller.logo
        user.seller.description = req.body.sellerDesc || user.seller.description
      }
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8)
      }

      const updatedUser = await user.save()
      res.send({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        isSeller: updatedUser.isSeller,
        seller: {
          name: updatedUser.seller.name,
          logo: updatedUser.seller.logo,
          description: updatedUser.seller.description,
        },
        token: generateToken(updatedUser),
      })
    } else {
      res.status(404).send({ message: "User not found" })
    }
  })
)

// userRouter.put(
//   "/profile",
//   isAuth,
//   () => {
//     console.log("hellooo")
//   },
//   expressAsyncHandler(async (req, res) => {
//     console.log("lsjfksdlkfjsdlfjk")
//     const user = await User.findById(req.user._id)
//     if (user) {
//       user.name = req.body.name || user.name
//       user.email = req.body.email || user.email
//       if (user.isSeller) {
//         user.seller.name = req.body.sellerName || user.seller.name
//         user.seller.logo = req.body.sellerLogo || user.seller.logo
//         user.seller.description = req.body.sellerDesc || user.seller.description
//       }
//       if (req.body.password) {
//         user.password = bcrypt.hashSync(req.body.password, 8)
//       }

//       const updatedUser = await user.save()
//       res.send({
//         _id: updatedUser._id,
//         name: updatedUser.name,
//         email: updatedUser.email,
//         isAdmin: updatedUser.isAdmin,
//         isSeller: updatedUser.isSeller,
//         token: generateToken(updatedUser),
//       })
//     } else {
//       res.status(404).send({ message: "User not found" })
//     }
//   })
// )

export default userRouter

// Cast to ObjectId failed for value "profile"
// (type string) at path "_id" for model "User"
