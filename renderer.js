const { ipcRenderer } = require('electron')

const task = document.getElementById("task");
const button = document.getElementById("button-17");

button.addEventListener("click", () => {
  const tasks = task.value;
  ipcRenderer.send("task", tasks);
  task.value = ""
});

document.addEventListener('keyup', function (event) {
    if (event.keyCode === 13){
        const tasks = task.value;
        ipcRenderer.send("task", tasks);
        task.value = ""
    }
})