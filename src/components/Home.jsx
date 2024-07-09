// frontend/src/components/Home.js
import './Home.css';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';


function Home() {

  const location = useLocation();
  const { uid ,accessToken, uname} = location.state || {};

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [pl, setPl] = useState('');
  const [reason, setReason] = useState('');
  const [trades, setTrades] = useState([]);
  const [totalpl, setTotalpl] = useState(0);
  //const user = JSON.parse(localStorage.getItem('user'));

  /*useEffect(() => {
    getTrades().then(setTrades);
    const total = trades.reduce((sum, trade) => sum + parseFloat(trade.pl), 0);
    setTotalpl(total);
  }, [trades]);*/

  //console.log(uid);
  //onsole.log(accessToken);
  /*useEffect(() => {
    if (uid) {
      getTrades(uid).then(setTrades);
      const total = trades.reduce((sum, trade) => sum + parseFloat(trade.pl), 0);
      setTotalpl(total);
    }
  }, [trades]);


  async function getTrades(uid,accessToken) {
    //const url = `${process.env.REACT_APP_API_URL}/api/routes/trades`;
    const url = `${process.env.REACT_APP_API_URL}/api/trades`;
    //console.log('Fetching trades with token:', accessToken);  
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      } 
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }

    return await response.json();
  }

  function addnewTrade(e ) {
    e.preventDefault();
    //const url = `${process.env.REACT_APP_API_URL}/api/models/trade`;
    const url = `${process.env.REACT_APP_API_URL}/api/trade`;
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ name, date, reason, pl, userId: uid }),
    }).then(response => {
      response.json().then(json => {
        setName('');
        setDate('');
        setPl('');
        setReason('');
        console.log('result', json);
      });
    });
  }*/
    useEffect(() => {
      if (uid) {
        fetchTrades(uid, accessToken);
      }
    }, [uid, accessToken]);
  
    const fetchTrades = async (uid, accessToken) => {
      try {
        const url = `${process.env.REACT_APP_API_URL}/api/trades`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
  
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage);
        }
  
        const tradesData = await response.json();
        setTrades(tradesData);
        calculateTotalPL(tradesData);
      } catch (error) {
        console.error('Error fetching trades:', error);
        // Handle error, e.g., show error message to the user
      }
    };
  
    const calculateTotalPL = (tradesData) => {
      const total = tradesData.reduce((sum, trade) => sum + parseFloat(trade.pl), 0);
      setTotalpl(total);
    };
  
    const addnewTrade = async (e) => {
      e.preventDefault();
      const url = `${process.env.REACT_APP_API_URL}/api/trade`;
  
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name, date, reason, pl, userId: uid }),
      };
  
      try {
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
          throw new Error('Failed to add trade');
        }
        const newTrade = await response.json();
        console.log('New trade added:', newTrade);
        setName('');
        setDate('');
        setPl('');
        setReason('');
        // Fetch trades again after adding a new one
        fetchTrades(uid, accessToken);
      } catch (error) {
        console.error('Error adding trade:', error.message);
        // Handle error, e.g., show error message to the user
      }
    };

  let balance = 0;
  for (const trade of trades) {
    balance = balance + trade.pl;
  }
  balance = balance.toFixed(2);
  const cents = balance.split('.')[1];
  balance = balance.split('.')[0];

  return (
    <main>
      
      <p className='intro'><span>Trades by:</span>  {uname}</p>
      <h1 className={`${totalpl >= 0 ? 'green' : 'red'}`}>{totalpl.toFixed(0)}<span className={`${totalpl >= 0 ? 'green' : 'red'}`}>.{cents}</span></h1>
      <form onSubmit={addnewTrade}>
        <div className='basics-1'>
          <label></label>
          <input type='text' value={name} onChange={e => setName(e.target.value)} placeholder='Tata' />
          <label></label>
          <input value={date} onChange={e => setDate(e.target.value)} type='date' />
        </div>
        <div className='basics-2'>
          <label></label>
          <input type='text' value={pl} onChange={e => setPl(e.target.value)} placeholder='Profit / Loss' />
          <label></label>
          <input type='text' value={reason} onChange={e => setReason(e.target.value)} placeholder='Reason' />
        </div>
        <button type="submit">Add a Trade</button>
      </form>
      <div className='trades'>
        {trades.length > 0 && trades.map(trade => (
          <div className='trade' key={trade._id}>
            <div className='left'>
              <div className='trade-name'>{trade.name}</div>
              <div className='trade-reason'>{trade.reason}</div>
            </div>
            <div className='right'>
              <div className={`trade-pl ${trade.pl >= 0 ? 'green' : 'red'}`}>{trade.pl}</div>
              <div className='trade-date'>{trade.date}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Home;
