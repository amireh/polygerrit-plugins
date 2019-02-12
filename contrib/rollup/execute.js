import { spawn } from 'child_process'

// Execute a shell command after completing the build and writing artifacts.
//
//     execute([
//       'notify-send "Build completed!"'
//     ])
//
export default function execute(_commands) {
  return {
    name: 'execute',
    writeBundle() {
      return new Promise((resolve, reject) => {
        const commands = Array.prototype.slice.call(_commands)
        const next = function () {
          const command = commands.shift()

          if (!command) {
            return resolve()
          }

          spawn(command, { shell: true, stdio: 'inherit' }).on('close', code => {
            if (code === 0) {
              next()
            }
            else {
              reject()
            }
          })
        }

        next()
      })
    }
  }
}
