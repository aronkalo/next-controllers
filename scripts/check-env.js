const { execSync } = require('child_process')

console.log('Node version:', process.version)
console.log('CWD:', process.cwd())

try {
  const ls = execSync('ls node_modules/.bin/vitest 2>&1 || echo "vitest not found"', {
    cwd: '/vercel/share/v0-project',
    encoding: 'utf-8',
  })
  console.log('vitest bin:', ls.trim())
} catch (e) {
  console.log('vitest check error:', e.message)
}

try {
  const pkg = require('/vercel/share/v0-project/package.json')
  console.log('devDeps vitest:', pkg.devDependencies?.vitest || 'not found')
} catch (e) {
  console.log('pkg error:', e.message)
}

try {
  const result = execSync('npx vitest --version 2>&1', {
    cwd: '/vercel/share/v0-project',
    encoding: 'utf-8',
    timeout: 30000,
  })
  console.log('vitest version:', result.trim())
} catch (e) {
  console.log('vitest version error:', e.stdout || e.stderr || e.message)
}
