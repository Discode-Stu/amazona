import React, { useEffect, useRef, useState } from "react"
import socketIOClient from "socket.io-client"
import Card from "react-bootstrap/Card"
import Row from "react-bootstrap/Row"
import Button from "react-bootstrap/Button"

const ENDPOINT =
  window.location.host.indexOf("localhost") >= 0
    ? "http://127.0.0.1:5555"
    : window.location.host

export default function ChatBox(props) {
  const { userInfo } = props
  const [socket, setSocket] = useState(null)
  const uiMessagesRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [messageBody, setMessageBody] = useState("")
  const [messages, setMessages] = useState([
    { name: "Admin", body: "Hello there, Please ask your question." },
  ])

  useEffect(() => {
    if (uiMessagesRef.current) {
      uiMessagesRef.current.scrollBy({
        top: uiMessagesRef.current.clientHeight,
        left: 0,
        behavior: "smooth",
      })
    }
    if (socket) {
      socket.emit("onLogin", {
        _id: userInfo._id,
        name: userInfo.name,
        isAdmin: userInfo.isAdmin,
      })
      socket.on("message", (data) => {
        setMessages([...messages, { body: data.body, name: data.name }])
      })
    }
  }, [messages, isOpen, socket])

  const supportHandler = () => {
    setIsOpen(true)
    console.log(ENDPOINT)
    const sk = socketIOClient(ENDPOINT)
    setSocket(sk)
  }
  const submitHandler = (e) => {
    e.preventDefault()
    if (!messageBody.trim()) {
      alert("Error. Please type message.")
    } else {
      setMessages([...messages, { body: messageBody, name: userInfo.name }])
      setMessageBody("")
      setTimeout(() => {
        socket.emit("onMessage", {
          body: messageBody,
          name: userInfo.name,
          isAdmin: userInfo.isAdmin,
          _id: userInfo._id,
        })
      }, 1000)
    }
  }
  const closeHandler = () => {
    setIsOpen(false)
  }

  return (
    <div className="chatbox">
      {!isOpen ? (
        <button type="button" onClick={supportHandler}>
          <i className="fa fa-life-ring" />
        </button>
      ) : (
        <div className="card card-body">
          <div className="row">
            <strong className="chatbox-title">Support </strong>
            <button
              type="button"
              className="close-chat-btn"
              onClick={closeHandler}
            >
              <i className="fas fa-window-close" />
            </button>
          </div>
          <div className="chatbox-msg-area">
            <ul ref={uiMessagesRef}>
              {messages.map((msg, index) => (
                <li key={index}>
                  <strong>{`${msg.name}: `}</strong> {msg.body}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <form onSubmit={submitHandler} className="chatbox-msg-form">
              <input
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                type="text"
                placeholder="Type message..."
                className="chatbox-msg-input"
              />
              <Button className="chatbox-msg-btn" type="submit">
                Send
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
