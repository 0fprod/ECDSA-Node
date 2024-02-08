import Wallet from './Wallet';
import Transfer from './Transfer';
import './App.scss';
import { useState } from 'react';

function App() {
  const [signature, setSignature] = useState({
    sig: '',
    recoveryBit: 0,
  });
  const [balance, setBalance] = useState(0);

  return (
    <div className="app">
      <Wallet balance={balance} setBalance={setBalance} signature={signature} setSignature={setSignature} />
      <Transfer setBalance={setBalance} signature={signature} />
    </div>
  );
}

export default App;
