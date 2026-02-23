import { execSync } from 'child_process'

try {
  const output = execSync('npx vitest run --reporter=verbose 2>&1', {
    cwd: '/vercel/share/v0-project',
    encoding: 'utf-8',
    timeout: 120000,
  })
  console.log(output)
} catch (error) {
  console.log(error.stdout || '')
  console.log(error.stderr || '')
  console.log('Exit code:', error.status)
}
