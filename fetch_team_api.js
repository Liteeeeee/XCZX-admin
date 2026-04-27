const fs = require('fs');
const http = require('http');

http.get('http://192.168.110.11:48080/v3/api-docs', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const swagger = JSON.parse(data);
    const paths = swagger.paths;
    const schemas = swagger.components.schemas;
    
    const result = [];
    for (const [path, methods] of Object.entries(paths)) {
      if (path.includes('promoter-team') || path.includes('/admin-api/trade/promoter/')) {
        for (const [method, details] of Object.entries(methods)) {
          result.push({ path, method, summary: details.summary, tags: details.tags });
        }
      }
    }
    fs.writeFileSync('team_api_paths.json', JSON.stringify(result, null, 2));
    
    const teamSchemas = {};
    for (const [key, value] of Object.entries(schemas)) {
      if (key.includes('PromoterTeam') || key.includes('Promoter')) {
        teamSchemas[key] = value;
      }
    }
    fs.writeFileSync('team_schemas.json', JSON.stringify(teamSchemas, null, 2));
    console.log("Done");
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});