const http = require('http');
http.get('http://192.168.110.11:48080/v3/api-docs', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const swagger = JSON.parse(data);
    const schema1 = swagger.components.schemas['PromoterTeamStatisticsRespVO'];
    console.log("Team Stats Schema:", JSON.stringify(schema1, null, 2));
    
    const schema2 = swagger.components.schemas['PromoterPersonalStatisticsRespVO'];
    console.log("Personal Stats Schema:", JSON.stringify(schema2, null, 2));
  });
});
