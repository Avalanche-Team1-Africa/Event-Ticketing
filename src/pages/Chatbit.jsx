import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import neuralImage from "../assets/botImage.png";
import PropTypes from 'prop-types';

// Separate animation variants
const buttonVariants = {
  hover: {
    scale: 1.2,
    rotate: 10,
    boxShadow: "0px 0px 15px rgba(0, 123, 255, 0.6)",
  },
};

const chatboxVariants = {
  initial: { opacity: 0, scale: 0.9, y: 50 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 50 },
};

const messageVariants = {
  initial: (sender) => ({ opacity: 0, x: sender === "user" ? 100 : -100 }),
  animate: { opacity: 1, x: 0 },
};

// Separate component for chat messages
const ChatMessage = ({ message, index }) => (
  <motion.div
    key={index}
    variants={messageVariants}
    initial="initial"
    animate="animate"
    custom={message.sender}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    className={`my-2 ${
      message.sender === "user" 
        ? "text-right text-blue-600" 
        : "text-left text-purple-600"
    }`}
  >
    <p
      className={`inline-block px-3 py-2 rounded-lg shadow-md ${
        message.sender === "user" ? "bg-blue-100" : "bg-purple-100"
      }`}
    >
      {message.text}
    </p>
  </motion.div>
);

ChatMessage.propTypes = {
  message: PropTypes.shape({
    sender: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
};


ChatInput.propTypes = {
  input: PropTypes.string.isRequired,
  setInput: PropTypes.func.isRequired,
  handleSendMessage: PropTypes.func.isRequired,
};

// Separate component for chat input
const ChatInput = ({ input, setInput, handleSendMessage }) => (
  <div className="mt-3 flex">
    <input
      type="text"
      className="flex-1 border border-blue-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black bg-white overflow-visible"
      placeholder="Type your question..."
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
    />
    <button
      className="bg-gradient-to-r from-blue-500 to-purple-500 text-black px-4 py-2 rounded-r-lg shadow-md hover:scale-105 active:scale-95 transition"
      onClick={handleSendMessage}
    >
      Send
    </button>
  </div>
);

const FloatingButton = () => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Memoized AI response generator
  const generateAIResponse = useCallback((userMessage) => {
    const responses = [
      `That's a fantastic question! Here's what I think about "${userMessage}": AI can help with almost anything!`,
      `Hmm... Let me think about "${userMessage}"... Okay, here we go!`,
      `Oh, "${userMessage}"? I've got the perfect answer for that!`,
      `Wow, what an interesting topic! Here's my take on "${userMessage}".`,
      `You're really keeping me on my toes! Let's dive into "${userMessage}".`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }, []);

  const handleSendMessage = useCallback(() => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const aiResponse = {
        sender: "ai",
        text: generateAIResponse(input),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);

    setInput("");
  }, [input, generateAIResponse]);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <motion.div
        className="group w-16 h-16 bg-white border-2 border-blue-500 rounded-full shadow-2xl flex items-center justify-center cursor-pointer relative overflow-hidden"
        variants={buttonVariants}
        whileHover="hover"
        transition={{ type: "spring", stiffness: 300 }}
        onClick={() => setIsPopupVisible(true)}
        title="Chat with AI"
      >
        <img
          src={neuralImage}
          alt="AI Icon"
          className="w-12 h-12 object-contain group-hover:scale-110"
        />
      </motion.div>

      <AnimatePresence>
        {isPopupVisible && (
          <motion.div
            variants={chatboxVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", stiffness: 120 }}
            className="fixed bottom-20 right-8 bg-gradient-to-b from-white to-blue-50 p-6 shadow-2xl rounded-lg w-80 z-50 border border-blue-300"
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-blue-600 flex items-center">
                <span className="mr-2">🤖</span> EventVerse Assistant
              </h3>
              <button
                className="text-red-500 font-bold hover:text-red-700 transition"
                onClick={() => setIsPopupVisible(false)}
              >
                ✖
              </button>
            </div>

            <div
              className="mt-4 h-48 overflow-y-auto bg-white rounded-lg p-3 shadow-inner"
              style={{ maxHeight: "200px" }}
            >
              {messages.length === 0 ? (
                <p className="text-gray-400 text-center">
                  I&apos;m ready to help! Ask me anything!
                </p>
              ) : (
                messages.map((message, index) => (
                  <ChatMessage key={index} message={message} index={index} />
                ))
              )}
            </div>

            <ChatInput
              input={input}
              setInput={setInput}
              handleSendMessage={handleSendMessage}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingButton;
