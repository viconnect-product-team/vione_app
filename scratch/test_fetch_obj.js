async function test() {
  try {
    await fetch('http://127.0.0.1:3000/test', {
      method: 'POST',
      body: { peerCode: '123', text: 'hello' }
    });
  } catch (e) {
    console.log('Fetch error when passing plain object to body:', e.message);
  }
}
test();
