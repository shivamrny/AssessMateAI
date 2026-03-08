(async () => {
  try {
    const res = await fetch('http://localhost:4000/api/teacher/exams/7bce91e6-75d3-4d9a-a10c-1e9105c23639');
    console.log('status', res.status);
    console.log('body', await res.text());
  } catch (err) {
    console.error('fetch error', err);
  }
})();