const fs = require('fs');
const http = require('http');

http.get('http://192.168.110.11:48080/v3/api-docs', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const swagger = JSON.parse(data);
    const paths = swagger.paths;
    const schemas = swagger.components.schemas;
    
    const targetPaths = [
      '/admin-api/member-invite/config/page',
      '/admin-api/member-invite/config/get',
      '/admin-api/member-invite/config/create',
      '/admin-api/member-invite/config/update',
      '/admin-api/member-invite/config/delete'
    ];
    
    const result = {};
    for (const path of targetPaths) {
      if (paths[path]) result[path] = paths[path];
    }
    
    // Naively extract referenced schemas
    const refs = new Set();
    JSON.stringify(result, (key, value) => {
      if (key === '$ref') refs.add(value.split('/').pop());
      return value;
    });
    
    const resultSchemas = {};
    refs.forEach(ref => {
      if (schemas[ref]) resultSchemas[ref] = schemas[ref];
    });
    
    // Naively extract schemas referenced by resultSchemas
    JSON.stringify(resultSchemas, (key, value) => {
      if (key === '$ref') refs.add(value.split('/').pop());
      return value;
    });
    
    refs.forEach(ref => {
      if (schemas[ref]) resultSchemas[ref] = schemas[ref];
    });

    fs.writeFileSync('invite_config_api.json', JSON.stringify({paths: result, schemas: resultSchemas}, null, 2));
    console.log("Written to invite_config_api.json");
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});