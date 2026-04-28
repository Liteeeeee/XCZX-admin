const http = require('http');
http.get('http://192.168.110.11:48080/v3/api-docs', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const swagger = JSON.parse(data);
    const paths = Object.keys(swagger.paths).filter(p => p.includes('/trade/promoter'));
    console.log("Paths:", paths);
    
    paths.forEach(p => {
        const methods = Object.keys(swagger.paths[p]);
        methods.forEach(m => {
            const op = swagger.paths[p][m];
            console.log(`${m.toUpperCase()} ${p} - ${op.summary}`);
            if (p.includes('performance') || p.includes('export') || p.includes('page')) {
                // console.log(JSON.stringify(op.parameters, null, 2));
            }
        });
    });
  });
});
