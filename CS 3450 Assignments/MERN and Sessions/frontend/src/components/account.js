import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const Account = () => {
    const [accounts, setAccounts] = useState({
        email: "",
        savings: 0,
        checking: 0,
        investment: 0
    });
    const params = useParams();
    useEffect(() => {
        const fetchAccounts = async () => {
            console.log("fetch ran");
            try {
                const sessionResponse = await fetch(`http://localhost:4000/session_get`, {
                    method: 'GET',
                    credentials: 'include'
                });
                const username = await sessionResponse.json();
                const response = await fetch(`http://localhost:4000/accounts/${username}`);
                if (!response.ok) {
                    console.log("error threw");
                    throw new Error('Failed to fetch account data');
                }
                const data = await response.json();
                console.log(data[0]);
                if (data.length > 0) {
                    const accountData = data[0];
                    setAccounts({
                        username: accountData.emailAddress,
                        savings: accountData.savings * 0.01,
                        checking: accountData.checking  * 0.01,
                        investment: accountData.investment  * 0.01,
                    });
                }
            } catch (error) {
                console.error('Error fetching account data:', error);
            }
        };
    
        fetchAccounts();
    }, [params.email]);

    return(
        <div className="container mt-5">
            <h1 className="text-center">Banking App</h1>
            <h2 className="text-center">Hello, {accounts.username}!</h2>
            <div className="row mt-4">
                <div className="col text-center">
                    <h3>Savings</h3>
                    <div className="border rounded p-5">
                        <h2>${accounts.savings}</h2>
                    </div>
                </div>
                <div className="col text-center">
                    <h3>Checking</h3>
                    <div className="border rounded p-5">
                        <h2>${accounts.checking}</h2>
                    </div>
                </div>
                <div className="col text-center">
                    <h3>Investment</h3>
                    <div className="border rounded p-5">
                        <h2>${accounts.investment}</h2>
                    </div>
                </div>
            </div>
            <div className="row mt-5">
                <div className="col text-center">
                    <Link to="/deposit" className="btn btn-primary">Deposit</Link>
                </div>
                <div className="col text-center">
                    <Link to="/transfer" className="btn btn-primary">Transfer</Link>
                </div>
                <div className="col text-center">
                    <Link to="/withdraw" className="btn btn-primary">Withdraw</Link>
                </div>
            </div>
        </div>
        
    );
};

export default Account;