import dotenv from 'dotenv';
dotenv.config();
console.log('CWD:', process.cwd());
console.log('API KEY:', process.env.OPENAI_API_KEY ? 'Found' : 'Missing');
