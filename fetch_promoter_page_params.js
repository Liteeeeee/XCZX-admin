const http = require('http');
http.get('http://192.168.110.11:48080/v3/api-docs', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const swagger = JSON.parse(data);
    const p1 = swagger.paths['/admin-api/trade/promoter/page']['get'];
    console.log("Params:", JSON.stringify(p1.parameters, null, 2));
  });
});
