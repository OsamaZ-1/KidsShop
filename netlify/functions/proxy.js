import fetch from "node-fetch";

export async function handler(event, context) {
  const url = `https://script.google.com/macros/s/AKfycbwXG6E-pYy70J5niCgD9O7vATeLtktX_B8ODDAVLoE_jzmdpAbf-HV3wdSYuBzOdlqoTQ/exec`;

  const params = event.queryStringParameters || {};
  const query = new URLSearchParams(params).toString();
  const fullUrl = query ? `${url}?${query}` : url;

  const response = await fetch(fullUrl);
  const data = await response.text(); // or .json() depending on response

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  };
}
