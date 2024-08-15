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

// Deposit amount in account associated with the given email address
dataRoutes.route("/deposit/:email").post(async (req, res) => {
    try{
        let db_connect = dbo.getDb();
        let query = {emailAddress: req.params.email};
        let amount = parseFloat(req.body.deposit) * 100;
        // Be careful when passing account name
        let toAccount = req.body.accountType;

        // Deposit into Savings
        if (toAccount == "Savings") {
            let result = await db_connect.collection("Accounts").updateOne(query, {$inc: {savings: amount}});
            console.log(`Successfully deposited Savings for ${req.params.email}`);
            res.json(result);
        // Deposit into Checking
        } else if (toAccount == "Checking") {
            let result = await db_connect.collection("Accounts").updateOne(query, {$inc: {checking: amount}});
            console.log(`Successfully deposited Checking for ${req.params.email}`);
            res.json(result);
        // Account type not found
        } else {
            console.log(`Cannot deposit money into account ${toAccount}`);
            throw err;
        }
        
    } catch (err) {
        res.status(500).json("Error within deposit route");
    }
});

// Withdraw amount in Savings or Checking associated with the given email address
dataRoutes.route("/withdraw/:email").post(async (req, res) => {
    try{
        let db_connect = dbo.getDb();
        let query = {emailAddress: req.params.email};
        let newWithdraw = parseFloat(req.body.withdraw) * 100;
         // Be careful when passing account name
        let fromAccount = req.body.accountType;
        
        if (fromAccount != "Savings" && fromAccount != "Checking") {
            console.log(`Cannot withdraw money from account ${fromAccount}`);
            throw err;
        } else {
            if (fromAccount == "Savings") {
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
                    console.log(`Successfully withdrew from savings for ${req.params.email}`);
                    res.json(result);
                }
            } else if (fromAccount == "Checking") {
                let currentBalance = await db_connect.collection("Accounts").find(query).project({ checking: 1 }).toArray();
                if (currentBalance[0].checking - newWithdraw < 0) {
                    console.log(`Cannot withdraw from Checking. Current Balance: ${currentBalance[0].checking}`);
                    throw err;
                } else {
                    let newBalance = {
                        $set: {
                            checking: (currentBalance[0].savings - newWithdraw)
                        }
                    }
                    db_connect.collection("Accounts").updateOne(query, newBalance);
                    let result = await db_connect.collection("Accounts").updateOne(query, {$inc: {checking: newDeposit}});
                    console.log(`Successfully withdrew from checking for ${req.params.email}`);
                    res.json(result);
                }
            }
        }
    } catch (err) {
        res.status(500).json({});
    }
});

// Transfer amounts between acounts of different users 
dataRoutes.route("/transfer/:email").post(async (req, res) => {
    try {
        let db_connect = dbo.getDb();
        let query = {emailAddress: req.params.email};
        let amount = parseFloat(req.body.transfer) * 100;
        
        // Be careful when passing account name
        let fromAccount = req.body.fromAccount;
        let toAccount = req.body.toAccount;
        
        // Transfer from Savings
        if (fromAccount == "Savings") {
            let currentBalance = await db_connect.collection("Accounts").find(query).project({ savings: 1 }).toArray();

            // Checking Balances and showing amounts
            console.log("From account is Savings");
            console.log("Current balance of Savings:", currentBalance);
            console.log("Amount being Transfered: ", amount);

            if (currentBalance[0].savings > amount) {
                console.log("If Current balance is Greater than Amount being transfered");
                let newBalance = {
                    $set: {
                        savings: (currentBalance[0].savings - amount)
                    }
                }
                console.log("Updated Savings Account");

                // Transfer into Checking
                if (toAccount == "Checking") {
                    console.log("Transfering to Checking...")
                    db_connect.collection("Accounts").updateOne(query, {$inc: {checking: amount}});
                // Account not found
                } else {
                    console.log(`Cannot transfer into account ${toAccount.charAt(0).toUpperCase() + toAccount.slice(1)}`);
                    throw err;
                }

                let result = await db_connect.collection("Accounts").updateOne(query, newBalance);
                console.log(`Successfully transfered funds from Savings to ${toAccount} for ${req.params.email}`);
                res.json(result);

            } else {
                console.log(`Cannot transfer from Savings. Current Balance: ${currentBalance[0].savings}`);
                throw err;
            }
        // Transfer from Checking
        } else if (fromAccount == "Checking") {
            let currentBalance = await db_connect.collection("Accounts").find(query).project({ checking: 1 }).toArray();

            // Checking Balances and showing amounts
            console.log("From account is Checking");
            console.log("Current balance of Checking:", currentBalance);
            console.log("Amount being Transfered: ", amount);

            if (currentBalance[0].checking > amount) {
                let newBalance = {
                    $set: {
                        checking: (currentBalance[0].checking - amount)
                    }
                }
                console.log("Updated Checking Account");

                // Transfer into Savings
                if (toAccount == "Savings") {
                    console.log("Transfering to Savings")
                    db_connect.collection("Accounts").updateOne(query, {$inc: {savings: amount}});
                // Account not found
                } else {
                    console.log(`Cannot transfer into account ${toAccount}`);
                    throw err;
                }

                let result = await db_connect.collection("Accounts").updateOne(query, newBalance);
                console.log(`Successfully transfered funds from Checking to ${toAccount} for ${req.params.email}`);
                res.json(result);

            } else {
                console.log(`Cannot transfer from Checking. Current Balance: ${currentBalance[0].checking}`);
                throw err;   
            }
        } else {
            console.log(`Cannot transfer money with account ${fromAccount}`);
            throw err;
        }
        
    } catch (err) {
        res.status(500).json("Error within the tranfer/email route");
    }
});


// Checking Email and Password to check account
dataRoutes.route("/check").post(async (req, res) => {
    try {
        let db_connect = dbo.getDb();
        let query = {emailAddress: req.body.email};
        let emailPass = await db_connect.collection("Accounts").find(query).project({password: 1 }).toArray();
        // Check if Email associated Password matches given Password
        if (emailPass[0] && emailPass[0].password == req.body.password) {
            console.log(`Account found, Email Address: ${req.body.email}`);
            res.json(true);
        } else {
            console.log(`Account ${req.body.email} not found`);
            res.json(false);
        }
    } catch (err) {
        res.status(500).json("Error within the check route");
    }
});

module.exports = dataRoutes;