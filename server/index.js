const secp256k1 = require('@noble/secp256k1');
const { keccak256 } = require('ethereum-cryptography/keccak');
const { toHex, hexToBytes, utf8ToBytes } = require('ethereum-cryptography/utils');
const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  '0x80c30dafbf8d8a4e52e1f474bdcf4ef057c4da83': 100, // 024570dac31324f3f5015f341350e8315c9c581735a073825025ca8e45687bbc
  '0x0dd8c537236674318b5a629e77d08f24cd4c94dd': 50, // 9c293a2b23e9e857ba37c81a7b487abf4ed7b6564ff3ce325f069ac036d7f463
  '0xbc1f4cf349153e6bcdac6ac1550137bbed742d99': 75, // a3ef7bc5a9305012ab3404e29b76f487baffff96b9e6818ca4a301b5b176e63b
};

app.get('/balance/:address', (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  const { signature, recipient, recoveryBit, amount } = req.body;
  const sender = getPublicKeyFormSignature(signature, recoveryBit);
  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: 'Not enough funds!' });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function getPublicKeyFormSignature(sigHex, recoveryBit) {
  let signature = hexToBytes(sigHex);
  let emptyHash = keccak256(utf8ToBytes(''));
  let recoverKey = secp256k1.recoverPublicKey(emptyHash, signature, recoveryBit);
  const publicKeyWithoutFirstByte = recoverKey.slice(1, recoverKey.length);
  const keyHash = keccak256(publicKeyWithoutFirstByte);
  const last20Bytes = keyHash.slice(keyHash.length - 20);
  return '0x' + toHex(last20Bytes);
}
