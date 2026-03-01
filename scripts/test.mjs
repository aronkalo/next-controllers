import { spawn } from 'child_process';

const child = spawn('npm', ['run', 'test'], {
  cwd: '/vercel/share/v0-project',
  stdio: 'inherit',
});

child.on('close', (code) => {
  process.exit(code);
});
