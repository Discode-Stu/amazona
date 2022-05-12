import { Link } from "react-router-dom"
import Card from "react-bootstrap/Card"
import Button from "react-bootstrap/Button"
import Rating from "./Rating"
import axios from "axios"
import { useContext, useEffect } from "react"
import { Store } from "../Store"
import MessageBox from "./MessageBox"

function Product(props) {
  const { product } = props

  const { state, dispatch: ctxDispatch } = useContext(Store)
  const {
    cart: { cartItems, error: cartError, itemID },
  } = state

  useEffect(() => {
    return () => {
      ctxDispatch({ type: "CART_REMOVE_ERROR" })
    }
  }, [ctxDispatch])

  const addToCartHandler = async (item) => {
    const existItem = cartItems.find((x) => x._id === product._id)
    const quantity = existItem ? existItem.quantity + 1 : 1
    //enter error code here - no multi seller purchase
    const { data } = await axios.get(`/api/products/${item._id}`)
    if (data.countInStock < quantity) {
      window.alert("Sorry. Product is out of stock")
      return
    }

    if (cartItems.length > 0 && data.seller._id !== cartItems[0].seller._id) {
      ctxDispatch({
        type: "CART_ADD_ITEM_FAIL",
        payload: {
          error: `Can't add to cart. Please buy only from ${cartItems[0].seller.seller.name} in this order.`,
          itemID: item._id,
        },
      })
      return
    }

    ctxDispatch({
      type: "CART_ADD_ITEM",
      payload: { ...item, quantity },
    })
  }

  return (
    <Card key={product.slug}>
      <Link to={`/product/${product.slug}`}>
        <img src={product.image} className="card-img-top" alt={product.name} />
      </Link>
      <Card.Body>
        <Link to={`/product/${product.slug}`}>
          <Card.Title>{product.name}</Card.Title>
        </Link>
        <Rating rating={product.rating} numReviews={product.numReviews} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Card.Text>${product.price}</Card.Text>

          {product.seller && (
            <Link
              style={{
                textDecoration: "none",
                fontWeight: "bold",
              }}
              to={`/seller/${product.seller?._id}`}
            >
              {product.seller?.seller?.name}
            </Link>
          )}
        </div>
        {cartError && product._id === itemID && (
          <MessageBox variant="danger">{cartError}</MessageBox>
        )}
        {product.countInStock === 0 ? (
          <Button disabled variant="light">
            Out of stock
          </Button>
        ) : (
          <Button onClick={() => addToCartHandler(product)}>Add to cart</Button>
        )}
      </Card.Body>
    </Card>
  )
}

export default Product
