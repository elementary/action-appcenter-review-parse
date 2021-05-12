const core = require('@actions/core')
const exec = require('@actions/exec')
const { context, GitHub } = require('@actions/github')

function getShas () {
  switch (context.eventName) {
    case 'pull_request':
      return {
        base: context.payload.pull_request.base.sha,
        head: context.payload.pull_request.head.sha
      }

    case 'push':
      return {
        base: context.payload.before,
        head: context.payload.after
      }

    default:
      core.setFailed('Unable to get head git ref')
  }
}

async function getChangedFile () {
  const client = new GitHub(core.getInput('token', { required: true }))
  const { head, base } = getShas()

  const response = await client.repos.compareCommits({
    base,
    head,
    owner: context.repo.owner,
    repo: context.repo.repo
  })

  if (response.status !== 200) {
    core.setFailed('GitHub API returned non 200 status code')
  }

  if (response.data.status !== 'ahead') {
    core.setFailed('Head commit is not ahead of base commit')
  }

  const files = response.data.files
    .filter((file) => ['added', 'modified', 'renamed'].includes(file.status))
    .map((file) => file.filename)

  core.info('Files changed:')
  files.forEach((file) => core.info(`- ${file}`))

  const REGEX = core.getInput('regex', { required: true })
  const matchingFiles = files.filter((file) => file.match(REGEX))

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
