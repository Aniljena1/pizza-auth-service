
import fs from 'fs';
import rsaPemToJwk from 'rsa-pem-to-jwk';

const pravateKey = fs.readFileSync("./certs/private.pem")
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const jwk = rsaPemToJwk(pravateKey, { use: 'sig' }, "public")
console.log(JSON.stringify(jwk))