const core = require('@actions/core')
const exec = require('@actions/exec')
const { context } = require('@actions/github')

function getHeadSha () {
  switch (context.eventName) {
    case 'pull_request':
      return context.payload.pull_request?.base?.sha

    case 'push':
      return context.payload.before

    default:
      core.setFailed('Unable to get head git ref')
  }
}

async function getChangedFile () {
  let gitOutput = ''
  await exec.exec('git', ['diff', '--name-only', getHeadSha(), 'HEAD'], {
    cwd: core.getInput('workspace', { required: true }),
    listeners: {
      stdout (data) {
        gitOutput += data.toString()
      }
    }
  })

  const REGEX = core.getInput('regex', { required: true })
  const files = gitOutput
    .split('\n')
    .map((file) => file.trim())

  core.info('Files changed:')
  files.forEach((file) => core.info(`- ${file}`))

  const matchingFiles = files.filter((file) => file.matches(fileRegex))

  core.info('Matching files:')
  matchingFiles.forEach((file) => core.info(`- ${file}`))

  if (matchingFiles.length > 1) {
    core.setFailed('Multiple matching files found')
  } else if (matchingFiles.length < 1) {
    core.setFailed('No matching files found')
  }

  return matchingFiles[0]
}

async function fileData (path) {

}

async function run () {
  const filePath = await getChangedFile()

  core.setOutput('rdnn', '')
  core.setOutput('tag', '')
  core.setOutput('source', '')
  core.setOutput('commit', '')
}

;(async () => {
  try {
    await run()
  } catch (error) {
    core.error(error)
    core.setFailed(error.message)
  }
})()
