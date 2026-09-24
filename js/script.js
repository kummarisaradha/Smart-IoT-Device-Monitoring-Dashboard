const devices = [
  {
    id: 1,
    name: 'Living Room Sensor',
    status: 'online',
    metric: 71.8,
    unit: '°F',
    metricLabel: 'Temperature',
    delta: '+1.4%',
    deltaType: 'up',
    lastUpdated: '2 min ago'
  },
  {
    id: 2,
    name: 'Smart Thermostat',
    status: 'online',
    metric: 68,
    unit: '%',
    metricLabel: 'Humidity',
    delta: '+0.8%',
    deltaType: 'up',
    lastUpdated: '1 min ago'
  },
  {
    id: 3,
    name: 'Security Camera',
    status: 'online',
    metric: 96,
    unit: '%',
    metricLabel: 'Battery',
    delta: 'Stable',
    deltaType: 'flat',
    lastUpdated: 'now'
  },
  {
    id: 4,
    name: 'Water Meter',
    status: 'warning',
    metric: 14.2,
    unit: 'gal',
    metricLabel: 'Flow',
    delta: '-2.1%',
    deltaType: 'down',
    lastUpdated: '6 min ago'
  },
  {
    id: 5,
    name: 'Smart Plug',
    status: 'offline',
    metric: 0,
    unit: 'W',
    metricLabel: 'Power',
    delta: 'Offline',
    deltaType: 'down',
    lastUpdated: '12 min ago'
  }
];

const alerts = [
  {
    id: 1,
    title: 'Battery low on Door Sensor',
    detail: 'Only 11% remaining',
    type: 'danger'
  },
  {
    id: 2,
    title: 'Motion detected',
    detail: 'Front entry at 3:42 PM',
    type: 'info'
  },
  {
    id: 3,
    title: 'Water flow spike',
    detail: 'Detected in guest bath',
    type: 'warning'
  }
];

const temperatureSeries = [68, 69, 71, 70, 72, 73, 74, 72, 74, 76, 75, 78];
const energyUsage = [36, 44, 52, 48, 58, 74, 67, 82, 70, 94];

const deviceGrid = document.getElementById('deviceGrid');
const alertList = document.getElementById('alertList');
const systemStatusText = document.getElementById('systemStatusText');

function renderDevices() {
  deviceGrid.innerHTML = devices
    .map(
      (device) => `
        <article class="device-card" aria-label="${device.name} device card">
          <div class="device-card-header">
            <span class="device-name">${device.name}</span>
            <span class="device-status ${device.status}">${device.status}</span>
          </div>

          <div class="metric-row">
            <div class="metric-value">${device.metric}</div>
            <div class="metric-unit">${device.unit}</div>
          </div>

          <div class="device-meta">
            <span>${device.metricLabel}</span>
            <span class="trend-${device.deltaType}">${device.delta}</span>
          </div>

          <div class="device-meta">
            <span>Updated</span>
            <span>${device.lastUpdated}</span>
          </div>
        </article>
      `
    )
    .join('');
}

function renderAlerts() {
  alertList.innerHTML = alerts
    .map(
      (alert) => `
        <li data-id="${alert.id}">
          <span class="alert-icon ${alert.type}" aria-hidden="true"></span>
          <div class="alert-main">
            <strong>${alert.title}</strong>
            <small>${alert.detail}</small>
          </div>
          <button class="alert-dismiss" type="button" aria-label="Dismiss ${alert.title}">×</button>
        </li>
      `
    )
    .join('');

  document.querySelectorAll('.alert-dismiss').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('li');
      if (!item) return;
      item.remove();
      const id = Number(item.dataset.id);
      const index = alerts.findIndex((alert) => alert.id === id);
      if (index >= 0) {
        alerts.splice(index, 1);
      }
      updateSystemStatus();
    });
  });
}

function updateSystemStatus() {
  const hasWarnings = devices.some((device) => device.status === 'warning');
  const hasOffline = devices.some((device) => device.status === 'offline');
  const hasAlerts = alerts.length > 0;

  const statusLabel = hasOffline || hasWarnings ? 'Attention Required' : hasAlerts ? 'Monitoring Active' : 'All Systems Online';
  const statusClass = hasOffline || hasWarnings ? 'warning' : 'online';

  const indicator = document.querySelector('.status-indicator');
  if (indicator) {
    indicator.classList.remove('online', 'warning', 'offline');
    indicator.classList.add(statusClass);
  }

  systemStatusText.textContent = statusLabel;
}

function updateDeviceMetrics() {
  devices.forEach((device) => {
    if (device.status === 'offline') {
      return;
    }

    const randomShift = (Math.random() - 0.5) * 4;
    const base = device.metric + randomShift;

    if (device.name === 'Living Room Sensor') {
      device.metric = Number(Math.max(68, Math.min(80, base)).toFixed(1));
    }

    if (device.name === 'Smart Thermostat') {
      device.metric = Number(Math.max(58, Math.min(78, base)).toFixed(0));
    }

    if (device.name === 'Security Camera') {
      device.metric = Number(Math.max(90, Math.min(100, base)).toFixed(0));
    }

    if (device.name === 'Water Meter') {
      device.metric = Number(Math.max(8, Math.min(22, base)).toFixed(1));
    }

    if (device.name === 'Smart Plug') {
      device.metric = Number(Math.max(0, Math.min(150, base)).toFixed(0));
    }
  });

  const randomStatusIndex = Math.floor(Math.random() * devices.length);
  const randomDevice = devices[randomStatusIndex];
  const statusRoll = Math.random();

  if (statusRoll > 0.86 && randomDevice.status !== 'offline') {
    randomDevice.status = 'warning';
  } else if (statusRoll > 0.92) {
    randomDevice.status = 'offline';
  } else {
    randomDevice.status = 'online';
  }

  temperatureSeries.push(Number((68 + Math.random() * 12).toFixed(1)));
  temperatureSeries.shift();

  energyUsage.push(Math.round(30 + Math.random() * 70));
  energyUsage.shift();

  renderDevices();
  drawLineChart();
  drawBarChart();
  updateSystemStatus();
}

function drawLineChart() {
  const canvas = document.getElementById('temperatureChart');
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const padding = 28;

  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
  ctx.lineWidth = 1;

  for (let i = 0; i < 5; i += 1) {
    const y = padding + (i * (height - padding * 2)) / 4;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  const min = Math.min(...temperatureSeries) - 4;
  const max = Math.max(...temperatureSeries) + 4;
  const range = max - min || 1;

  ctx.beginPath();
  temperatureSeries.forEach((value, index) => {
    const x = padding + (index * (width - padding * 2)) / (temperatureSeries.length - 1);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.strokeStyle = '#6ee7f9';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.lineTo(width - padding, height - padding);
  ctx.lineTo(padding, height - padding);
  ctx.closePath();
  ctx.fillStyle = 'rgba(110, 231, 249, 0.12)';
  ctx.fill();

  ctx.beginPath();
  temperatureSeries.forEach((value, index) => {
    const x = padding + (index * (width - padding * 2)) / (temperatureSeries.length - 1);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawBarChart() {
  const canvas = document.getElementById('energyChart');
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const padding = 24;
  const barWidth = 38;
  const gap = 18;

  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
  ctx.lineWidth = 1;

  for (let i = 0; i < 5; i += 1) {
    const y = padding + (i * (height - padding * 2)) / 4;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  energyUsage.forEach((value, index) => {
    const x = padding + index * (barWidth + gap) + 10;
    const barHeight = ((value - 10) / 90) * (height - padding * 2);
    const y = height - padding - barHeight;

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#6ee7f9');
    gradient.addColorStop(1, '#38bdf8');

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth, barHeight);
  });
}

function initializeDashboard() {
  renderDevices();
  renderAlerts();
  updateSystemStatus();
  drawLineChart();
  drawBarChart();

  setInterval(updateDeviceMetrics, 4000);
}

initializeDashboard();
