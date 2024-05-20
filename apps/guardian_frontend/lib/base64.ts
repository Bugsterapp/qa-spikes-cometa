function encrypt<T>(data: T) {
  const buffer = Buffer.from(JSON.stringify(data));
  return buffer.toString('base64');
}

function decrypt(hash: string) {
  const buffer = Buffer.from(hash, 'base64');
  return buffer.toString('ascii');
}

export { encrypt, decrypt };
