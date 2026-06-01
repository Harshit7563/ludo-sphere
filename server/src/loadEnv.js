import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const serverDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(serverDir, '.env') });
