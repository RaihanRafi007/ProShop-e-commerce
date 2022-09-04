import React, { useState, useEffect } from "react";
import { Button, Row, Col, ListGroup, Image, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import {
  getOrderDetails,
  payOrder,
  deliverOrder,
} from "../actions/orderActions";
import {
  ORDER_PAY_RESET,
  ORDER_DELIVER_RESET,
} from "../constants/orderConstants";

import { useParams } from "react-router-dom";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

function OrderScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();

  // const [sdkReady, setSdkReady] = useState(false);

  const [paidFor, setPaidFor] = useState(false);

  // const [error, setError] = useState(null);

  const orderDetails = useSelector((state) => state.orderDetails);
  const { order, error, loading } = orderDetails;

  const orderPay = useSelector((state) => state.orderPay);
  const { loading: loadingPay, success: successPay } = orderPay;

  const orderDeliver = useSelector((state) => state.orderDeliver);
  const { loading: loadingDeliver, success: successDeliver } = orderDeliver;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  if (!loading && !error) {
    order.itemsPrice = order.orderItems
      .reduce((acc, item) => acc + item.price * item.qty, 0)
      .toFixed(2);
  }

  // ARcWaiyq-Uskk0wO38ZR97iVEz0k7gpSSFjgit2xtjwah4yZra9mKgDcJFI07lIzeUIytm94g5gAuPws

  // const addPayPalScript = () => {
  //   const script = document.createElement("script");
  //   script.type = "text/javascript";
  //   script.src =
  //     "https://www.paypal.com/sdk/js?client-id=ARcWaiyq-Uskk0wO38ZR97iVEz0k7gpSSFjgit2xtjwah4yZra9mKgDcJFI07lIzeUIytm94g5gAuPws";
  //   script.async = true;
  //   script.onload = () => {
  //     setSdkReady(true);
  //   };
  //   document.body.appendChild(script);
  // };

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    }

    if (!order || successPay || order._id !== Number(id) || successDeliver) {
      dispatch({ type: ORDER_PAY_RESET });
      dispatch({ type: ORDER_DELIVER_RESET });
      dispatch(getOrderDetails(id));
    }
  }, [dispatch, navigate, userInfo, order, id, successPay, successDeliver]);

  // const successPaymentHandler = (paymentResult) => {
  //   dispatch(payOrder(id, paymentResult));
  // };

  const handleApprove = (data, id, paymentResult) => {
    // Call backend function to fulfill order

    // if response is success
    setPaidFor(true);
    dispatch(payOrder(id, (paymentResult = data)));
    // Refresh user's account or subscription status

    // if response is error
    // alert("Your payment was processed successfully. However, we are unable to fulfill your purchase. Please contact us at support@designcode.io for assistance.");
  };

  if (paidFor) {
    // Display success message, modal or redirect user to success page

    alert("Thank you for your purchase!");
  }

  if (error) {
    // Display error message, modal or redirect user to error page
    alert(error);
  }

  const deliverHandler = () => {
    dispatch(deliverOrder(order));
  };

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant="danger">{error}</Message>
  ) : (
    <div>
      <h1>Order: {order._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Name: </strong> {order.user.name}
              </p>
              <p>
                <strong>Email: </strong>
                <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
              </p>
              <p>
                <strong>Shipping: </strong>
                {order.shippingAddress.address}, {order.shippingAddress.city}
                {"  "}
                {order.shippingAddress.postalCode},{"  "}
                {order.shippingAddress.country}
              </p>

              {order.isDelivered ? (
                <Message variant="success">
                  Delivered on {order.deliveredAt.substring(0, 10)}
                </Message>
              ) : (
                <Message variant="warning">Not Delivered</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {order.paymentMethod}
              </p>
              {order.isPaid ? (
                <Message variant="success">
                  Paid on {order.paidAt.substring(0, 10)}
                </Message>
              ) : (
                <Message variant="warning">Not Paid</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {order.orderItems.length === 0 ? (
                <Message variant="info">Order is empty</Message>
              ) : (
                <ListGroup variant="flush">
                  {order.orderItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fluid
                            rounded
                          />
                        </Col>

                        <Col>
                          <Link to={`/product/${item.product}`}>
                            {item.name}
                          </Link>
                        </Col>

                        <Col md={4}>
                          {item.qty} X ${item.price} = $
                          {(item.qty * item.price).toFixed(2)}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>

        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Items:</Col>
                  <Col>${order.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Shipping:</Col>
                  <Col>${order.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Tax:</Col>
                  <Col>${order.taxPrice}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Total:</Col>
                  <Col>${order.totalPrice}</Col>
                </Row>
              </ListGroup.Item>

              {!order.isPaid && (
                <ListGroup.Item>
                  {loadingPay ? (
                    <Loader />
                  ) : (
                    <PayPalScriptProvider
                      options={{
                        "client-id":
                          "ARcWaiyq-Uskk0wO38ZR97iVEz0k7gpSSFjgit2xtjwah4yZra9mKgDcJFI07lIzeUIytm94g5gAuPws",
                      }}
                    >
                      <PayPalButtons
                        createOrder={(data, actions) => {
                          return actions.order.create({
                            purchase_units: [
                              {
                                amount: {
                                  value: order.totalPrice,
                                },
                              },
                            ],
                          });
                        }}
                        onApprove={async (data, actions) => {
                          const order = await actions.order.capture();
                          console.log("order", order);

                          handleApprove(data, data.id);
                        }}
                        // onError={(err) => {
                        //   setError(
                        //     "Your payment was processed successfully. However, we are unable to fulfill your purchase. Please contact us at support@designcode.io for assistance."
                        //   );
                        //   console.error("PayPal Checkout onError", err);
                        // }}
                      />
                    </PayPalScriptProvider>
                  )}

                  {/* {!sdkReady ? (
                    <Loader />
                  ) : (
                    <PayPalScriptProvider
                      options={{
                        "client-id":
                          "ARcWaiyq-Uskk0wO38ZR97iVEz0k7gpSSFjgit2xtjwah4yZra9mKgDcJFI07lIzeUIytm94g5gAuPws",
                      }}
                    >
                      <PayPalButtons
                        createOrder={(data, actions) => {
                          return actions.order.create({
                            purchase_units: [
                              {
                                amount: {
                                  value: order.totalPrice,
                                },
                              },
                            ],
                          });
                        }}
                        onApprove={async (data, actions) => {
                          const order = await actions.order.capture();
                          console.log("order", order);

                          handleApprove(data.id);
                        }}
                        // onError={(err) => {
                        //   setError(
                        //     "Your payment was processed successfully. However, we are unable to fulfill your purchase. Please contact us at support@designcode.io for assistance."
                        //   );
                        //   console.error("PayPal Checkout onError", err);
                        // }}
                      />
                    </PayPalScriptProvider>

                    // <PayPalButton
                    //     amount={order.totalPrice}
                    //     onSuccess={successPaymentHandler}
                    // />
                  )} */}
                </ListGroup.Item>
              )}
            </ListGroup>
            {loadingDeliver && <Loader />}
            {userInfo &&
              userInfo.isAdmin &&
              order.isPaid &&
              !order.isDelivered && (
                <ListGroup.Item>
                  <Button
                    type="button"
                    className="w-100"
                    onClick={deliverHandler}
                  >
                    Mark As Delivered
                  </Button>
                </ListGroup.Item>
              )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default OrderScreen;
