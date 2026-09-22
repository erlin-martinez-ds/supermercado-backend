const bcrypt = require('bcrypt');

async function main() {
  const password = process.argv[2];

  if (!password) {
    console.error('Uso: node hash-password.js <contraseña>');
    process.exitCode = 1;
    return;
  }

  const hash = await bcrypt.hash(password, 10);

  console.log(hash);
}

main().catch((error) => {
  console.error('No se pudo generar el hash:', error.message);
  process.exitCode = 1;
});
