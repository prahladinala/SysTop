const path = require("path");
const { ipcRenderer } = require("electron");
const osu = require("node-os-utils");
const cpu = osu.cpu;
const mem = osu.mem;
const os = osu.os;
const drive = osu.drive;
const netstat = osu.netstat;

let cpuOverload;
let alertFrequency;

// Get setting and Value
ipcRenderer.on("settings:get", (e, settings) => {
  cpuOverload = +settings.cpuOverload;
  alertFrequency = +settings.alertFrequency;
});
//Run Every 2 Seconds
setInterval(() => {
  //CPU Usage
  cpu.usage().then((info) => {
    document.getElementById("cpu-usage").innerText = info + "%";
    document.getElementById("cpu-progress").style.width = info + "%";
    //Make progress bar red if overload
    if (info >= cpuOverload) {
      document.getElementById("cpu-progress").style.background = "red";
    } else {
      document.getElementById("cpu-progress").style.background = "#30c88b";
    }
    //Check Overload
    if (info >= cpuOverload && runNotify(alertFrequency)) {
      notifyUser({
        title: "CPU Overloaded",
        body: `CPU is over ${cpuOverload}`,
        icon: path.join(__dirname, "img", "icon.png"),
      });
      localStorage.setItem("lastNotify", +new Date());
    }
  });
  //CPU Free
  cpu.free().then((info) => {
    document.getElementById("cpu-free").innerText = info + "%";
  });
  //System Uptime
  document.getElementById("sys-uptime").innerText = secondsToDhms(os.uptime());
}, 2000);
//Set Model
document.getElementById("cpu-model").innerText = cpu.model();
//Computer Name
document.getElementById("comp-name").innerText = os.hostname();
//OS
document.getElementById("os").innerText = `${os.type()} ${os.arch()}`;

// Total Mem
// mem.info().then((info) => {
//   document.getElementById("mem-total").innerText = info.totalMemMb;
// });
// si.cpu().then((data) => console.log(data));
document.getElementById("mem-total").innerText = mem.totalMem();
document.getElementById("ip-adder").innerText = os.ip();
document.getElementById("cores").innerText = cpu.count();
// Convert total memory to kb, mb and gb
var total_memory = mem.totalMem();
var total_mem_in_kb = total_memory / 1024;
var total_mem_in_mb = total_mem_in_kb / 1024;
var total_mem_in_gb = total_mem_in_mb / 1024;

total_mem_in_mb = Math.floor(total_mem_in_mb);
total_mem_in_gb = Math.floor(total_mem_in_gb);

total_mem_in_mb = total_mem_in_mb % 1024;
total_memory = total_memory % 1024;
document.getElementById(
  "mem-total"
).innerText = `${total_mem_in_gb} GB ${total_mem_in_mb} MB`;

// Show days, hours, mins, sec
function secondsToDhms(seconds) {
  seconds = +seconds;
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d, ${h}h, ${m}m, ${s}s`;
}
// Send Notification
function notifyUser(options) {
  new Notification(options.title, options);
}
//Check how much time has passed
function runNotify(frequency) {
  //Check Local Storage
  if (localStorage.getItem("lastNotify") === null) {
    //Store timestamp
    localStorage.setItem("lastNotify", +new Date());
    return true;
  }
  const notifyTime = new Date(parseInt(localStorage.getItem("lastNotify")));
  const now = new Date();
  const diffTime = Math.abs(now - notifyTime);
  const minutesPassed = Math.ceil(diffTime / (1000 * 60));

  if (minutesPassed > frequency) {
    return true;
  } else {
    return false;
  }
}
