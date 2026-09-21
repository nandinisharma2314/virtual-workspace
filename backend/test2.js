fetch('http://localhost:3000/files/upload-url?filename=test.png&contentType=image/png').then(res => res.json()).then(console.log).catch(console.error);
