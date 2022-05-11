import axios from "axios"
import React, { useContext, useEffect, useReducer } from "react"
import { useParams } from "react-router-dom"
import LoadingBox from "../components/LoadingBox"
import MessageBox from "../components/MessageBox"
import Rating from "../components/Rating"
import { Store } from "../Store"
import { getError } from "../utils"
import Card from "react-bootstrap/Card"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Product from "../components/Product"

const reducer = (state, action) => {
  switch (action.type) {
    case "SELLER_REQUEST":
      return { ...state, loading: true }
    case "SELLER_SUCCESS":
      return { ...state, loading: false, user: action.payload }
    case "SELLER_FAILURE":
      return { ...state, loading: false, error: action.payload }
    case "PRODUCTS_REQUEST":
      return { ...state, loadingProducts: true }
    case "PRODUCTS_SUCCESS":
      return { ...state, loadingProducts: false, products: action.payload }
    case "PRODUCTS_FAILURE":
      return { ...state, loadingProducts: false, errorProducts: action.payload }
    default:
      return state
  }
}

export default function SellerScreen() {
  const { id: sellerId } = useParams()

  const { state } = useContext(Store)
  const { userInfo } = state

  const [
    { loading, loadingProducts, user, products, error, errorProducts },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    loadingProducts: true,
    user: {},
    products: [],
    error: null,
    errorProducts: null,
  })

  useEffect(() => {
    //todo fetch seller data
    dispatch({ type: "SELLER_REQUEST" })
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/users/public/${sellerId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        })
        console.log(data)
        dispatch({ type: "SELLER_SUCCESS", payload: data })
      } catch (err) {
        dispatch({ type: "SELLER_FAILURE", payload: getError(err) })
      }
    }
    fetchData()
    //todo fetch seller products
    dispatch({ type: "PRODUCTS_REQUEST" })
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(`/api/products?seller=${sellerId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        })
        dispatch({ type: "PRODUCTS_SUCCESS", payload: data })
      } catch (err) {
        dispatch({ type: "PRODUCTS_FAILURE", payload: getError(err) })
      }
    }
    fetchProducts()
  }, [])

  return (
    <div className="row top">
      <div className="col-1">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <Card>
            <Card.Body>
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <img
                  style={{ width: "4rem" }}
                  src={user.seller.logo}
                  alt={user.seller.name}
                />
                <h4>{user.seller.name}</h4>
              </div>
              <Rating
                rating={user.seller.rating}
                numReviews={user.seller.numReviews}
              />
              <a
                style={{ textDecoration: "none" }}
                href={`mailto:${user.email}`}
              >
                Contact Seller
              </a>
              <p>{user.seller.description}</p>
            </Card.Body>
          </Card>
        )}
      </div>
      <div className="col-3">
        {loadingProducts ? (
          <LoadingBox />
        ) : errorProducts ? (
          <MessageBox variant="danger">{errorProducts}</MessageBox>
        ) : (
          <>
            {products.length === 0 && (
              <MessageBox>No Products Found</MessageBox>
            )}
            <Row>
              {products.map((product) => (
                <Col key={product.slug} sm={12} md={6} lg={4} className="mb-3">
                  <Product product={product}></Product>
                </Col>
              ))}
            </Row>
          </>
        )}
      </div>
    </div>
  )
}
