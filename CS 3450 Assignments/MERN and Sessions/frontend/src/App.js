import React from "react";
import { Route, Routes } from "react-router-dom";

import Account from "./components/account.js";
import Login from "./components/login.js";
import Register from "./components/registration.js";
import Deposit from "./components/deposit.js";
import Withdraw from "./components/withdraw.js";
import Transfer from "./components/transfer.js";

const App = () => {
    return (
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/account" element={<Account />} />
          <Route path="/register" element={<Register />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/transfer" element={<Transfer />} />
        </Routes>
      </div>
    );
  }
  export default App;