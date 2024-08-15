const express = require("express");
const dataRoutes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;

// Getting all data within accounts
dataRoutes.route("/data").get(async (req, res) => {
    try{
        let db_connect = dbo.getDb();
        const result = await db_connect.collection("Accounts").find({}).toArray();
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Getting account data (excluding ids and passwords)
dataRoutes.route("/accounts").get(async (req, res) => {
    try{
        let db_connect = dbo.getDb();
        const result = await db_connect.collection("Accounts").find({}).project({ _id:0, password:0 }).toArray();
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Getting all data associated with given email (excluding id and password)
dataRoutes.route("/accounts/:email").get(async (req, res) => {
    try{
        let db_connect = dbo.getDb();
        let query = {emailAddress: req.params.email};
        const result = await db_connect.collection("Accounts").find(query).project({ _id:0, password:0 }).toArray();
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Adding a new account to the BankData and confirming now duplicate email addresses
dataRoutes.route("/accounts/add").post(async (req, res) => {
    try{
        let db_connect = dbo.getDb();
        const result = await db_connect.collection("Accounts").find({ emailAddress: req.body.emailAddress }).count();

        if (result > 0) {
            console.log(`Unable to insert account because of duplicate Email Address: ${req.body.emailAddress}`);
            throw err;
        } else {
            let newAccount = {
                firstName: req.body.firstName,
                LastName: req.body.lastName,
                emailAddress: req.body.emailAddress,
                phoneNumber: req.body.phoneNumber,
                role: "",
                savings: 0,
                checking: 0,
                password: req.body.password
            }
            const result = db_connect.collection("Accounts").insertOne(newAccount);
            console.log("Successfully Added Account");
            res.json(result);
        }
    } catch (err) {
        res.status(500).json({});
    }
});

// Update account role associated with the given email address
dataRoutes.route("/update/role/:email").post(async (req, res) => {
    try{
        let db_connect = dbo.getDb();
        let query = {emailAddress: req.params.email};
        let newRole = req.body.role;
        if (newRole != "Customer" && newRole != "Administrator" && newRole != "Manager") {
            console.log(`Cannot give role ${newRole}`);
            throw err;
        } else {
            let updatedRole = {
                $set: {
                    role: req.body.role
                }
            }
            const result = await db_connect.collection("Accounts").updateOne(query, updatedRole);
            console.log(`Successfully Updated role for ${req.params.email}`);
            res.json(result);
        }
    } catch (err) {
        res.status(500).json({});
    }
});

// Deposit amount in Savings or Checking associated with the given email address
dataRoutes.route("/deposit/:email").post(async (req, res) => {
    try{
        let db_connect = dbo.getDb();
        let query = {emailAddress: req.params.email};
        let newDeposit = parseFloat(req.body.deposit) * 100;
        let givenAccount = req.body.accountType;
        
        if (givenAccount != "Savings" && givenAccount != "Checking") {
            console.log(`Cannot deposit money into account ${givenAccount}`);
            throw err;
        } else {
            if (givenAccount == "Savings") {
                let result = await db_connect.collection("Accounts").updateOne(query, {$inc: {savings: newDeposit}});
                console.log(`Successfully updated savings balance for ${req.params.email}`);
                res.json(result);
            } else {
                let result = await db_connect.collection("Accounts").updateOne(query, {$inc: {checking: newDeposit}});
                console.log(`Successfully updated checking balance for ${req.params.email}`);
                res.json(result);
                
            }
        }
    } catch (err) {
        res.status(500).json({});
    }
});

// Withdraw amount in Savings or Checking associated with the given email address
dataRoutes.route("/withdraw/:email").post(async (req, res) => {
    try{
        let db_connect = dbo.getDb();
        let query = {emailAddress: req.params.email};
        let newWithdraw = parseFloat(req.body.withdraw) * 100;
        let givenAccount = req.body.accountType;
        
        if (givenAccount != "Savings" && givenAccount != "Checking") {
            console.log(`Cannot withdraw money from account ${givenAccount}`);
            throw err;
        } else {
            if (givenAccount == "Savings") {
                let currentBalance = await db_connect.collection("Accounts").find(query).project({ savings: 1 }).toArray();
                if (currentBalance[0].savings - newWithdraw < 0) {
                    console.log(`Cannot withdraw from Savings. Current Balance: ${currentBalance[0].savings}`);
                    throw err;
                } else {
                    let newBalance = {
                        $set: {
                            savings: (currentBalance[0].savings - newWithdraw)
                        }
                    }
                    let result = await db_connect.collection("Accounts").updateOne(query, newBalance);
                    console.log(`Successfully updated savings balance for ${req.params.email}`);
                    res.json(result);
                }
            } else {
                let currentBalance = await db_connect.collection("Accounts").find(query).project({ checking: 1 }).toArray();
                if (currentBalance[0].checking - newWithdraw < 0) {
                    console.log(`Cannot withdraw from Checking. Current Balance: ${currentBalance[0].checking}`);
                    throw err;
                } else {
                    let newBalance = {
                        $set: {
                            checking: (currentBalance[0].checking - newWithdraw)
                        }
                    }
                    db_connect.collection("Accounts").updateOne(query, newBalance);
                    let result = await db_connect.collection("Accounts").updateOne(query, {$inc: {checking: newDeposit}});
                    console.log(`Successfully updated savings balance for ${req.params.email}`);
                    res.json(result);
                }
            }
        }
    } catch (err) {
        res.status(500).json({});
    }
});

// Transfer amounts between Checking and Savings Savings or Checking associated with the given email address 
dataRoutes.route("/transfer/:email").post(async (req, res) => {
    try {
        let db_connect = dbo.getDb();
        let query = {emailAddress: req.params.email};
        let newTransfer = parseFloat(req.body.transfer) * 100;
        let accountTaken = req.body.fromAccount;
        
        if (accountTaken != "Savings" && accountTaken != "Checking") {
            console.log(`Cannot transfer money from account ${accountTaken}`);
            throw err;
        } else {
            if (accountTaken == "Savings") {
                let currentBalance = await db_connect.collection("Accounts").find(query).project({ savings: 1 }).toArray();
                if (currentBalance[0].savings - newTransfer < 0) {
                    console.log(`Cannot transfer from Savings. Current Balance: ${currentBalance[0].savings}`);
                    throw err;
                } else {
                    let newBalance = {
                        $set: {
                            savings: (currentBalance[0].savings - newTransfer)
                        }
                    }
                    db_connect.collection("Accounts").updateOne(query, {$inc: {checking: newTransfer}});
                    let result = await db_connect.collection("Accounts").updateOne(query, newBalance);
                    console.log(`Successfully updated checking balance for ${req.params.email}`);
                    res.json(result);
                }
            } else {
                let currentBalance = await db_connect.collection("Accounts").find(query).project({ checking: 1 }).toArray();
                if (currentBalance[0].checking - newTransfer < 0) {
                    console.log(`Cannot transfer from Checking. Current Balance: ${currentBalance[0].checking}`);
                    throw err;
                } else {
                    let newBalance = {
                        $set: {
                            checking: (currentBalance[0].checking - newTransfer)
                        }
                    }
                    db_connect.collection("Accounts").updateOne(query, {$inc: {savings: newTransfer}});
                    let result = await db_connect.collection("Accounts").updateOne(query, newBalance);
                    console.log(`Successfully updated checking balance for ${req.params.email}`);
                    res.json(result);
                }
            }
        }
    } catch (err) {
        res.status(500).json({});
    }
    
});

// Checking Email and Password to check account
dataRoutes.route("/check/:email/:password").get(async (req, res) => {
    try {
        let db_connect = dbo.getDb();
        let query = {emailAddress: req.params.email};
        let emailId = await db_connect.collection("Accounts").find(query).project({ id: 1, password: 1 }).toArray();
        if (emailId[0] && emailId[0].password == req.params.password) {
            console.log(`Account found, Email Address: ${req.params.email}`);
            res.json(true);
        } else {
            console.log(`Account ${req.params.email} not found`);
            res.json(false);
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = dataRoutes;