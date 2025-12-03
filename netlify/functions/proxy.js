export async function handler(event, context) {
  const url = `https://script.google.com/macros/s/AKfycbwXG6E-pYy70J5niCgD9O7vATeLtktX_B8ODDAVLoE_jzmdpAbf-HV3wdSYuBzOdlqoTQ/exec`;

  // Determine fetch options
  const options = {
    method: event.httpMethod, // 'GET', 'POST', etc.
    headers: { "Content-Type": "application/json" },
  };

  // Forward POST body
  if (event.httpMethod === "POST") {
    options.body = event.body; // forward JSON string from frontend
  }

  // Forward GET query parameters
  let fetchUrl = url;
  if (event.httpMethod === "GET" && event.queryStringParameters) {
    const query = new URLSearchParams(event.queryStringParameters).toString();
    fetchUrl = query ? `${url}?${query}` : url;
  }

  try {
    const response = await fetch(fetchUrl, options);
    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // allow requests from your frontend
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
}


// export async function handler(event, context) {
//   const url = `https://script.google.com/macros/s/AKfycbwXG6E-pYy70J5niCgD9O7vATeLtktX_B8ODDAVLoE_jzmdpAbf-HV3wdSYuBzOdlqoTQ/exec`;

//   const params = event.queryStringParameters || {};
//   const query = new URLSearchParams(params).toString();
//   const fullUrl = query ? `${url}?${query}` : url;

//   const response = await fetch(fullUrl);
//   const data = await response.json(); // or .json() depending on response

//   return {
//     statusCode: 200,
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data),
//   };
// }
