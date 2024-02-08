import server from './server';
import { useState } from 'react';
import * as secp256k1 from '@noble/secp256k1';
import { keccak256 } from 'ethereum-cryptography/keccak';
import { utf8ToBytes, toHex, bytesToHex } from 'ethereum-cryptography/utils';

async function sign(privateKey) {
  const hash = keccak256(utf8ToBytes(''));
  let [sig, recoveryBit] = await secp256k1.sign(hash, privateKey, { recovered: true });
  return {
    sig: bytesToHex(sig),
    recoveryBit,
  };
}

function buildAddressFrom(privateKey) {
  try {
    const publicKey = secp256k1.getPublicKey(privateKey);
    const publicKeyWithoutFirstByte = publicKey.slice(1, publicKey.length);
    const keyHash = keccak256(publicKeyWithoutFirstByte);
    const last20Bytes = keyHash.slice(keyHash.length - 20);
    return '0x' + toHex(last20Bytes);
  } catch (e) {
    return 'Invalid private key';
  }
}

function isInvalid(privateKey) {
  return privateKey === 'Invalid private key' || privateKey === '';
}
function Wallet({ signature, setSignature, balance, setBalance }) {
  const [privateKey, setPrivateKey] = useState('');
  const [address, setAddress] = useState('');

  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);
    const publicKey = buildAddressFrom(privateKey);
    setAddress(publicKey);

    if (isInvalid(privateKey)) {
      setBalance(0);
    } else {
      const signature = await sign(privateKey);
      setSignature(signature);
      const {
        data: { balance },
      } = await server.get(`balance/${publicKey}`);
      setBalance(balance);
    }
  }

  return (
    <div className="wallet container">
      <h1>Your Wallet</h1>

      <label>
        Private Key:
        <input placeholder="Type your private key" value={privateKey} onChange={onChange}></input>
      </label>

      <label>Public address: {address}</label>
      <label>Signature: {signature.sig?.substring(0, 15)}...</label>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
