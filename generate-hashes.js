const bcrypt = require('bcrypt');

const passwords = {
  'admin123': 'admin@school.com',
  'parent123': 'john@parent.com',
  'tutor123': 'smith@school.com',
  'security123': 'security@school.com'
};

async function generateHashes() {
  console.log('Generating bcrypt hashes for test accounts:\n');
  
  for (const [password, email] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}\n`);
  }
}

generateHashes();
