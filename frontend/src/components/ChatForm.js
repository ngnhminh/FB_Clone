import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

/**
 * Component hiển thị form chat với Gemini AI
 */
function ChatForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  /**
   * Bật/tắt cửa sổ chat
   */
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  /**
   * Cuộn xuống cuối cùng của cửa sổ chat
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Cuộn xuống cuối cùng khi tin nhắn thay đổi
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Xử lý khi gửi tin nhắn
   * @param {Event} e - Sự kiện submit form
   */
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Thêm tin nhắn của người dùng vào danh sách
    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);
    setInput("");

    try {
      // Gửi tin nhắn đến API
      const response = await axios.post("/api/chat", {
        message: input,
      }, {
        withCredentials: true
      });

      // Thêm phản hồi từ Gemini vào danh sách tin nhắn
      const geminiMessage = { role: "assistant", content: response.data.reply };
      setMessages((prev) => [...prev, geminiMessage]);
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      // Hiển thị thông báo lỗi
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Lỗi: Không thể kết nối đến server." },
      ]);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[1000]">
      {/* Nút mở cửa sổ chat */}
      {!isOpen && (
        <button
          className="border-none rounded-full flex justify-center shadow-md cursor-pointer p-0"
          onClick={toggleChat}
          aria-label="Mở cửa sổ chat với Gemini"
        >
          <img
            src="/img/icons/messenger.png"
            alt="Biểu tượng chat"
            style={{ width: "48px", height: "48px" }}
          />
        </button>
      )}

      {/* Cửa sổ chat */}
      {isOpen && (
        <div className="w-[300px] h-[400px] bg-white rounded-[10px] shadow-lg flex flex-col">
          {/* Phần tiêu đề chat */}
          <div className="bg-[#007bff] text-white p-2.5 rounded-t-[10px] flex justify-between items-center">
            <h5>Chat với Gemini</h5>
            <button
              className="bg-none border-none text-white text-[20px] cursor-pointer"
              onClick={toggleChat}
              aria-label="Đóng cửa sổ chat"
            >
              ×
            </button>
          </div>

          {/* Phần nội dung chat */}
          <div className="flex-1 p-2.5 overflow-y-auto bg-[#f8f9fa]">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`px-3 py-0.5 rounded-[10px] max-w-[80%] ${msg.role === "user" ? "bg-[#007bff] text-white ml-auto" : "bg-[#e9ecef] text-black mr-auto"}`}
              >
                {msg.content}
              </div>
            ))}
            {/* Tham chiếu để cuộn xuống cuối cùng */}
            <div ref={messagesEndRef} />
          </div>

          {/* Phần nhập tin nhắn */}
          <div className="p-2.5 border-t border-[#dee2e6] flex gap-2.5">
            <form onSubmit={handleSend}>
              <input
                type="text"
                className="flex-1"
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                aria-label="Nhập tin nhắn"
              />
              <button
                type="submit"
                className="px-5"
                aria-label="Gửi tin nhắn"
              >
                Gửi
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatForm;