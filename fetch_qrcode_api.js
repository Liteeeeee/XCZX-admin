const http = require('http');
http.get('http://192.168.110.11:48080/v3/api-docs', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const swagger = JSON.parse(data);
    const endpoint = swagger.paths['/admin-api/system/social-client/wxa-qrcode'];
    if (endpoint) {
      console.log(JSON.stringify(endpoint, null, 2));
    } else {
      console.log("Endpoint not found");
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
