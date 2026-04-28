const http = require('http');
http.get('http://192.168.110.11:48080/v3/api-docs', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const swagger = JSON.parse(data);
    const paths = Object.keys(swagger.paths).filter(p => p.includes('export') && p.includes('promoter'));
    console.log("Export Paths:", paths);
  });
});
