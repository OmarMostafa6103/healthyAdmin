import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { backendUrl } from "../config";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const Contact = ({ token }) => {
  const [messages, setMessages] = useState([]);
  const { t } = useTranslation();
  const [showPopup, setShowPopup] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [fullMessage, setFullMessage] = useState("");

  const fetchMessages = useCallback(async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/contact/all`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.status === 200) {
        setMessages(response.data.data);
      } else {
        toast.error(t("contact.fetchError"));
      }
    } catch (error) {
      toast.error(
        t("contact.fetchErrorWithMessage", { message: error.message })
      );
    }
  }, [token, t]);

  const sendResponse = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/contact/response`,
        {
          message_id: selectedMessage.message_id,
          header: "hello ali",
          body: responseText,
          footer: "than mohamed",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.status === 200) {
        toast.success(t("contact.replySent"));
        setShowPopup(false);
        setResponseText("");
      } else {
        toast.error(t("contact.replyFailed"));
      }
    } catch (error) {
      toast.error(t("contact.replyFailedWithMessage", { msg: error.message }));
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{t("contact.pageTitle")}</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">
                {t("contact.table.name")}
              </th>
              <th className="py-2 px-4 border-b text-left">
                {t("contact.table.email")}
              </th>
              <th className="py-2 px-4 border-b text-left">
                {t("contact.table.message")}
              </th>
              <th className="py-2 px-4 border-b text-left">
                {t("contact.table.action")}
              </th>
            </tr>
          </thead>
          <tbody>
            {messages.length > 0 ? (
              messages.map((msg) => (
                <tr key={msg.message_id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{msg.name}</td>
                  <td className="py-2 px-4 border-b">{msg.email}</td>
                  <td className="py-2 px-4 border-b">
                    {msg.message.length > 50 ? (
                      <>
                        {msg.message.substring(0, 50)}...{" "}
                        <button
                          onClick={() => {
                            setFullMessage(msg.message);
                            setShowMessagePopup(true);
                          }}
                          className="text-blue-500 hover:underline font-semibold"
                        >
                          {t("contact.viewMore")}
                        </button>
                      </>
                    ) : (
                      msg.message
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => {
                        setSelectedMessage(msg);
                        setShowPopup(true);
                      }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {t("contact.replyButton")}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-2 px-4 text-center">
                  {t("contact.noMessages")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* نافذة الرد */}
      {showPopup && selectedMessage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-lg w-1/3">
            <h2 className="text-lg font-semibold mb-2">
              {t("contact.replyTitle")}
            </h2>
            <p>
              {t("contact.replyName")} {selectedMessage.name}
            </p>
            <p>
              {t("contact.replyEmail")} {selectedMessage.email}
            </p>
            <textarea
              className="w-full p-2 border rounded mb-2"
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder={t("contact.replyPlaceholder")}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                {t("app.cancel")}
              </button>
              <button
                onClick={sendResponse}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                {t("contact.send")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة عرض الرسالة الكاملة */}
      {showMessagePopup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {t("contact.fullMessageTitle")}
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">{fullMessage}</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowMessagePopup(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {t("contact.close")}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Contact;

import PropTypes from "prop-types";
Contact.propTypes = {
  token: PropTypes.string,
};
