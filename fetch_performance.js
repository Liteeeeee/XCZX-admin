const http = require('http');
http.get('http://192.168.110.11:48080/v3/api-docs', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const swagger = JSON.parse(data);
    const p1 = swagger.paths['/admin-api/trade/promoter/statistics/team-page']['get'];
    const p2 = swagger.paths['/admin-api/trade/promoter/statistics/personal-page']['get'];
    console.log("Team Page Params:", JSON.stringify(p1.parameters, null, 2));
    const ref1 = p1.responses['200'].content['*/*'].schema.$ref;
    console.log("Team Page Res:", ref1);
    
    console.log("Personal Page Params:", JSON.stringify(p2.parameters, null, 2));
    const ref2 = p2.responses['200'].content['*/*'].schema.$ref;
    console.log("Personal Page Res:", ref2);
  });
});
