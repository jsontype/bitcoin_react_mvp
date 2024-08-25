import React, { useEffect, useState } from 'react';
import './App.css';

// CryptoItemコンポーネント
function CryptoItem({ id, name, price, onClick }) {
  return (
    <div onClick={() => onClick(id)} style={{ cursor: 'pointer', margin: '20px 0' }}>
      <h2>{name}: {price ? `${price} USD` : 'Loading...'}</h2>
    </div>
  );
}

// HistoryButtonsコンポーネント
function HistoryButtons({ onFetchHistory }) {
  const periods = [
    { label: '1 Day', value: '1d' },
    { label: '1 Week', value: '1w' },
    { label: '1 Month', value: '1m' },
    { label: '3 Months', value: '3m' },
    { label: '6 Months', value: '6m' },
    { label: '1 Year', value: '1y' },
  ];

  return (
    <div>
      {periods.map(period => (
        <button
          key={period.value}
          onClick={() => onFetchHistory(period.value)}
          style={{ margin: '5px' }}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}

function App() {
  const [prices, setPrices] = useState({ bitcoin: null, ethereum: null });
  const [history, setHistory] = useState(null);
  const [selectedCrypto, setSelectedCrypto] = useState('');

  useEffect(() => {
    const fetchPrices = async () => {
      const apiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd';
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        setPrices({
          bitcoin: data.bitcoin.usd,
          ethereum: data.ethereum.usd,
        });
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };
  
    fetchPrices();

    // ***!
    console.log('prices: ', prices)

    const interval = setInterval(fetchPrices, 300000); // 5分毎にアップデート
    return () => clearInterval(interval);
  }, []);  

  const fetchHistory = async (cryptoId, days) => {
    const apiUrl = `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=usd&days=${days}`;
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('CORS error or request blocked');
      }
      const data = await response.json();

      if (data.prices && data.prices.length > 0) {
        setHistory(data.prices);
        setSelectedCrypto(cryptoId);
      } else {
        alert(`No data available for ${cryptoId} for the selected period.`);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      alert('Please wait. The request is blocked or there is an issue with the server.');
    }
  };

  const handleCryptoClick = (cryptoId) => {
    setSelectedCrypto(cryptoId);
    setHistory(null); // 以前の履歴をクリア
  };

  const handleFetchHistory = (period) => {
    if (!selectedCrypto) {
      alert('Please select a cryptocurrency first.');
      return;
    }

    const daysOptions = {
      '1d': 1,
      '1w': 7,
      '1m': 30,
      '3m': 90,
      '6m': 180,
      '1y': 365,
    };

    fetchHistory(selectedCrypto, daysOptions[period]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Cryptocurrency Prices</h1>
        <CryptoItem
          id="bitcoin"
          name="Bitcoin (BTC)"
          price={prices.bitcoin}
          onClick={handleCryptoClick}
        />
        <CryptoItem
          id="ethereum"
          name="Ethereum (ETH)"
          price={prices.ethereum}
          onClick={handleCryptoClick}
        />

        {selectedCrypto && (
          <div>
            <h2>View {selectedCrypto.toUpperCase()} Price History</h2>
            <HistoryButtons onFetchHistory={handleFetchHistory} />
          </div>
        )}

        {history && (
          <div>
            <h2>{selectedCrypto.toUpperCase()} Price History</h2>
            <ul>
              {history.map(([timestamp, price], index) => (
                <li key={index}>
                  {new Date(timestamp).toLocaleDateString()} - ${price.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
