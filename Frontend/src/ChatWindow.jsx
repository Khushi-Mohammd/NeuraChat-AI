import "./ChatWindow.css";
import Chat from "./Chat";
import { MyContext } from "./MyContext";
import { useContext, useState, useEffect, useRef } from "react";
import { BeatLoader, ScaleLoader, SyncLoader } from "react-spinners";

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    prevChats,
    setPrevChats,
    setNewChat,
  } = useContext(MyContext);

  const [loading, setLoading] = useState(false);

  const chatContainerRef = useRef(null);
  const chatEndRef = useRef(null);

  const getReply = async () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

    setLoading(true);
    setNewChat(false);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: prompt,
        threadId: currThreadId,
      }),
    };

    try {
      console.log(prompt, currThreadId);
      const response = await fetch("/api/chat", options);
      const res = await response.json();
      console.log(res.reply);
      setReply(res.reply);
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (prompt && reply) {
      setPrevChats((prevChats) => [
        ...prevChats,
        {
          role: "user",
          content: prompt,
        },
        {
          role: "assistant",
          content: reply,
        },
      ]);
    }

    setPrompt("");
  }, [reply]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      getReply();
    }
  };

  return (
    <div className="chatWindow">
      <div className="navbar">
        <div className="name">
          NeuraChat AI
          <span>
            <i className="fa-solid fa-angle-down"></i>
          </span>
        </div>

        <div>
          <span className="userIcon">
            <i className="fa-solid fa-user"></i>
          </span>
        </div>
      </div>

      <Chat chatContainerRef={chatContainerRef} chatEndRef={chatEndRef}></Chat>

      <div className="beatLoader">
        <BeatLoader color="#fff" loading={loading}></BeatLoader>
      </div>

      <div className="bottom">
        <div className="chatInput">
          <div className="inputBox">
            <textarea
              placeholder="Ask anything"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
            ></textarea>

            <div id="submit" onClick={getReply}>
              <i
                className="fa-solid fa-arrow-up fa-lg"
                style={{ color: "#000000" }}
              ></i>
            </div>
          </div>
        </div>

        <div className="info">
          ChatGPT can make mistakes. Check important info. See Cookie
          Preferences.
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
