const { spawn } = require('child_process');

const processes = [
  spawn('npm', ['run', 'dev', '--workspace', 'backend'], { stdio: 'inherit', shell: true }),
  spawn('npm', ['run', 'dev', '--workspace', 'frontend'], { stdio: 'inherit', shell: true }),
];

const terminate = () => {
  processes.forEach((proc) => proc.kill());
  process.exit();
};

process.on('SIGINT', terminate);
process.on('SIGTERM', terminate);

processes.forEach((proc) => {
  proc.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Process exited with code ${code}`);
      terminate();
    }
  });
});
