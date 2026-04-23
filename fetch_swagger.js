const fs = require('fs');
const http = require('http');

http.get('http://192.168.110.44:48080/v3/api-docs', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const swagger = JSON.parse(data);
    const paths = swagger.paths;
    const result = [];
    for (const [path, methods] of Object.entries(paths)) {
      for (const [method, details] of Object.entries(methods)) {
        if (details.summary && details.summary.includes('邀请')) {
          result.push({ path, method, summary: details.summary, tags: details.tags });
        } else if (details.tags && details.tags.some(t => t.includes('邀请'))) {
           result.push({ path, method, summary: details.summary, tags: details.tags });
        }
      }
    }
    console.log(JSON.stringify(result, null, 2));
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
