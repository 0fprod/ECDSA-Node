const { keccak256 } = require('ethereum-cryptography/keccak');
const secp256k1 = require('@noble/secp256k1');
const { toHex, utf8ToBytes, bytesToHex, hexToBytes } = require('ethereum-cryptography/utils');

const privateKey1 = toHex(secp256k1.utils.randomPrivateKey());
const privateKey2 = toHex(secp256k1.utils.randomPrivateKey());
const privateKey3 = toHex(secp256k1.utils.randomPrivateKey());

function getAddress(privateKey) {
  const publicKey = secp256k1.getPublicKey(privateKey);
  const publicKeyWithoutFirstByte = publicKey.slice(1, publicKey.length);
  const keyHash = keccak256(publicKeyWithoutFirstByte);
  const last20Bytes = keyHash.slice(keyHash.length - 20);
  return '0x' + toHex(last20Bytes);
}

const address1 = getAddress(privateKey1);
// const address2 = getAddress(privateKey2);
// const address3 = getAddress(privateKey3);

console.log(`Address 1: ${address1}`);
console.log(`Private key: ${privateKey1}`);
console.log('#'.repeat(50));
// console.log(`Address 2: ${address2}`);
// console.log(`Private key: ${privateKey2}`);
// console.log('#'.repeat(50));
// console.log(`Address 3: ${address3}`);
// console.log(`Private key: ${privateKey3}`);

console.log('Signing...');
sign(privateKey1).then((result) => {
  console.log('### ~ result:', result);
  console.log('### ~ publicKey:', getPublicKeyFormSignature(result.sig, result.recoveryBit));
});

function getPublicKeyFormSignature(sigHex, recoveryBit) {
  // let k = secp256k1.Signature.fromHex(sigHex);
  let signature = hexToBytes(sigHex);
  let recoverKey = secp256k1.recoverPublicKey(emptyHash(), signature, recoveryBit);
  const publicKeyWithoutFirstByte = recoverKey.slice(1, recoverKey.length);
  const keyHash = keccak256(publicKeyWithoutFirstByte);
  const last20Bytes = keyHash.slice(keyHash.length - 20);
  return '0x' + toHex(last20Bytes);
}

async function sign(privateKey) {
  let [sig, recoveryBit] = await secp256k1.sign(emptyHash(), privateKey, { recovered: true });
  let foo = {
    sig: bytesToHex(sig),
    recoveryBit,
  };
  return foo;
}

function emptyHash() {
  return keccak256(utf8ToBytes('hi'));
}
