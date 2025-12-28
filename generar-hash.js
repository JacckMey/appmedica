const bcrypt = require('bcrypt');

const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);

console.log('='.repeat(60));
console.log('HASH GENERADO PARA LA CONTRASEÑA: admin123');
console.log('='.repeat(60));
console.log(hash);
console.log('='.repeat(60));
console.log('\nCopia este hash y úsalo en el SQL para actualizar la contraseña del admin');
console.log('\nEjecuta este comando en tu base de datos:');
console.log(`\nUPDATE usuarios SET password = '${hash}' WHERE dni = '12345678';\n`);






