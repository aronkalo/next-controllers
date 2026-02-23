const path = require('path')
process.chdir('/vercel/share/v0-project')

async function run() {
  try {
    const vitest = await import('vitest/node')
    const result = await vitest.startVitest('test', [], {
      run: true,
    })

    if (!result) {
      console.log('Vitest returned no result')
      return
    }

    const files = result.state.getFiles()
    let passed = 0
    let failed = 0

    function walkTasks(tasks, indent) {
      for (const task of tasks) {
        if (task.type === 'suite') {
          console.log(indent + 'Suite: ' + task.name)
          walkTasks(task.tasks || [], indent + '  ')
        } else {
          const state = task.result ? task.result.state : 'unknown'
          const icon = state === 'pass' ? 'PASS' : state === 'fail' ? 'FAIL' : 'SKIP'
          console.log(indent + '[' + icon + '] ' + task.name)
          if (state === 'pass') passed++
          if (state === 'fail') {
            failed++
            if (task.result && task.result.errors) {
              for (const err of task.result.errors) {
                console.log(indent + '  Error: ' + err.message)
                if (err.diff) console.log(indent + '  Diff: ' + err.diff)
              }
            }
          }
        }
      }
    }

    for (const file of files) {
      const relPath = path.relative('/vercel/share/v0-project', file.filepath)
      const fileState = file.result ? file.result.state : 'unknown'
      console.log('\nFile: ' + relPath + ' - ' + fileState)
      walkTasks(file.tasks || [], '  ')
    }

    console.log('\n--- Summary: ' + passed + ' passed, ' + failed + ' failed, ' + (passed + failed) + ' total ---')

    await result.close()
  } catch (err) {
    console.error('Runner error: ' + err.message)
    console.error(err.stack)
  }
}

run()
