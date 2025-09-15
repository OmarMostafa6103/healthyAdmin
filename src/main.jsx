// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'
// import { BrowserRouter } from 'react-router-dom'

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <BrowserRouter>
//     <App />
//   </BrowserRouter>,
// )

import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { HashRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store, persistor } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import i18n from './i18n';

const Root = () => {
  useEffect(() => {
    const setDir = (lng) => {
      document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    };
    setDir(i18n.language || 'en');
    i18n.on('languageChanged', setDir);
    return () => i18n.off('languageChanged', setDir);
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <HashRouter>
          <App />
        </HashRouter>
      </PersistGate>
    </Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
