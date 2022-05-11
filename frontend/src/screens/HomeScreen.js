import { useEffect, useReducer } from "react"
import "react-responsive-carousel/lib/styles/carousel.min.css"
import { Carousel } from "react-responsive-carousel"
import axios from "axios"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Product from "../components/Product"
import { Helmet } from "react-helmet-async"
import LoadingBox from "../components/LoadingBox"
import MessageBox from "../components/MessageBox"
import { Link } from "react-router-dom"
// import data from '../data';

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true }
    case "FETCH_SUCCESS":
      return { ...state, products: action.payload, loading: false }
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload }
    case "TOP_SELLERS_REQUEST":
      return { ...state, loadingTopSellers: true }
    case "TOP_SELLERS_SUCCESS":
      return { ...state, topSellers: action.payload, loadingTopSellers: false }
    case "TOP_SELLERS_FAIL":
      return {
        ...state,
        loadingTopSellers: false,
        errorTopSellers: action.payload,
      }
    default:
      return state
  }
}

function HomeScreen() {
  const [
    {
      loading,
      error,
      products,
      topSellers,
      loadingTopSellers,
      errorTopSellers,
    },
    dispatch,
  ] = useReducer(reducer, {
    products: [],
    topSellers: [],
    loading: true,
    loadingTopSellers: true,
    errorTopSellers: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "TOP_SELLERS_REQUEST" })
      try {
        const { data } = await axios.get("/api/users/top-sellers")
        console.log("data TS__:::", data)
        dispatch({ type: "TOP_SELLERS_SUCCESS", payload: data })
      } catch (err) {
        dispatch({ type: "TOP_SELLERS_FAIL", payload: err.message })
      }
    }
    fetchData()
  }, [])
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" })
      try {
        const { data } = await axios.get("/api/products")
        dispatch({ type: "FETCH_SUCCESS", payload: data })
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: err.message })
      }
    }
    fetchData()
  }, [])

  const arrowStyles = {
    position: "absolute",
    zIndex: "2",
    top: "calc(50% - 15px)",
    cursor: "pointer",
  }

  return (
    <div>
      <Helmet>
        <title>Amazona</title>
      </Helmet>

      <h1>Top Sellers</h1>
      <div className="products">
        {loadingTopSellers ? (
          <LoadingBox />
        ) : errorTopSellers ? (
          <MessageBox variant="danger">{errorTopSellers}</MessageBox>
        ) : (
          <>
            {topSellers.length === 0 && <MessageBox>No top sellers</MessageBox>}
            <Carousel
              showArrows={true}
              autoPlay
              interval={3000}
              infiniteLoop
              emulateTouch
              showThumbs={true}
              renderArrowNext={(onClick) => (
                <i
                  onClick={onClick}
                  style={{ ...arrowStyles, right: "15px" }}
                  className="fas fa-chevron-right"
                ></i>
              )}
              renderArrowPrev={(onClick) => (
                <i
                  onClick={onClick}
                  style={{ ...arrowStyles, left: "15px" }}
                  className="fas fa-chevron-left"
                ></i>
              )}
            >
              {topSellers.map((seller) => (
                <div key={seller._id}>
                  <Link to={`/seller/${seller._id}`}>
                    <img src={seller.seller.logo} alt={seller.seller.name} />
                    <p className="legend">{seller.seller.name}</p>
                  </Link>
                </div>
              ))}
            </Carousel>
          </>
        )}
      </div>

      <h1>Featured Products</h1>
      <div className="products">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <Row>
            {products.length === 0 && <MessageBox>No products</MessageBox>}
            {products.map((product) => (
              <Col key={product.slug} sm={6} md={4} lg={3} className="mb-3">
                <Product product={product}></Product>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  )
}
export default HomeScreen
