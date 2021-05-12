const core = require('@actions/core')

async function getChangedFiles () {
  return []
}

async function fileData (path) {

}

async function run () {
  const FILE_REGEX = core.getInput('file-regex', { required: true })
  const fileRegex = new Regex(FILE_REGEX)

  const files = await getChangedFiles()

  core.info('Files changed:')
  files.forEach((file) => core.info(`- ${file.filename}`))

  const matchingFiles = files.filter((file) => file.matches(fileRegex))

  core.info('Matching files:')
  matchingFiles.forEach((file) => core.info(`- ${file}`))

  if (matchingFiles.length > 1) {
    core.setFailed('Multiple matching files found')
  } else if (matchingFiles.length < 1) {
    core.setFailed('No matching files found')
  }

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
