import React, { useContext, useReducer, useState } from "react"
import { Helmet } from "react-helmet-async"
import { Store } from "../Store"
import Form from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import { toast } from "react-toastify"
import { getError } from "../utils"
import axios from "axios"

const reducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_REQUEST":
      return { ...state, loadingUpdate: true }
    case "UPDATE_SUCCESS":
      return { ...state, loadingUpdate: false }
    case "UPDATE_FAIL":
      return { ...state, loadingUpdate: false }
    default:
      return state
  }
}

export default function ProfileScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store)
  const { userInfo } = state
  const [name, setName] = useState(userInfo.name)
  const [email, setEmail] = useState(userInfo.email)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [sellerName, setSellerName] = useState(
    userInfo.isSeller ? userInfo.seller?.name : ""
  )
  const [sellerLogo, setSellerLogo] = useState(
    userInfo.isSeller ? userInfo.seller?.logo : ""
  )
  const [sellerDesc, setSellerDesc] = useState(
    userInfo.isSeller ? userInfo.seller?.description : ""
  )

  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  })

  const submitHandler = async (e) => {
    e.preventDefault()
    // if (password !== confirmPassword) {
    //   toast.error("Passwords do not match")
    //   return
    // }
    try {
      dispatch({ type: "UPDATE_REQUEST" })
      const { data } = await axios.post(
        `/api/users/profile`,
        {
          name,
          email,
          password,
          sellerName,
          sellerLogo,
          sellerDesc,
        },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      )
      dispatch({
        type: "UPDATE_SUCCESS",
      })
      console.log("data__:::", data)
      ctxDispatch({ type: "USER_SIGNIN", payload: data })
      localStorage.setItem("userInfo", JSON.stringify(data))
      toast.success("User updated successfully")
    } catch (err) {
      console.log("err", err)
      dispatch({
        type: "FETCH_FAIL",
      })
      toast.error(getError(err))
    }
  }

  return (
    <div className="container small-container">
      <Helmet>
        <title>User Profile</title>
      </Helmet>
      <h1 className="my-3">User Profile</h1>
      <form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="confirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Group>
        {userInfo.isSeller && (
          <>
            <h2 className="my-3">Seller</h2>
            <Form.Group className="mb-3" controlId="sellerName">
              <Form.Label>Seller Name</Form.Label>
              <Form.Control
                type="text"
                value={sellerName}
                placeholder="Enter seller name"
                onChange={(e) => setSellerName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="sellerLogo">
              <Form.Label>Seller Logo</Form.Label>
              <Form.Control
                type="text"
                value={sellerLogo}
                placeholder="Enter seller logo"
                onChange={(e) => setSellerLogo(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="sellerDesc">
              <Form.Label>Seller Description</Form.Label>
              <Form.Control
                type="text"
                value={sellerDesc}
                placeholder="Enter seller description"
                onChange={(e) => setSellerDesc(e.target.value)}
              />
            </Form.Group>
          </>
        )}
        <div className="mb-3">
          <Button type="submit">Update</Button>
        </div>
      </form>
    </div>
  )
}
