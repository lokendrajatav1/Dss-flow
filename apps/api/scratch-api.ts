async function test() {
  try {
    const loginRes = await fetch('http://localhost:4000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'monupandey2649@gmail.com', password: 'password' })
    });
    
    const loginData = await loginRes.json();
    const token = loginData.data.token;
    console.log("Token received");

    const leadsRes = await fetch('http://localhost:4000/api/v1/leads', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const leadsData = await leadsRes.json();
    console.log("Leads array length:", leadsData.length);
    if (!Array.isArray(leadsData)) {
      console.log("Response data is not an array. It is:", Object.keys(leadsData));
    } else {
      console.log(leadsData.slice(0, 2));
    }
  } catch (err: any) {
    console.error(err.message);
  }
}

test();
