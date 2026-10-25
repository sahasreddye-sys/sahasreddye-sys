// Interactive versions of three figures. Numbers are copied from the notebooks' printed output.
(function () {
  if (!window.Chart) return;
  var css = getComputedStyle(document.documentElement);
  var ink = '#1c2530', muted = '#5b6573', rule = '#e1e5ea', blue = '#2f5fa8', pale = '#a9bfe0', mark = '#e07a2b';
  Chart.defaults.font.family = '"Hanken Grotesk","Helvetica Neue",Arial,sans-serif';
  Chart.defaults.color = muted;

  var configs = {
    'weather-mae': {
      type: 'bar',
      data: {
        labels: ['Linear', 'Ridge', 'Lasso', 'SVR (RBF)', 'Gradient boosting', 'Random forest'],
        datasets: [{ label: 'Test MAE (°F)', data: [3.288, 3.303, 3.468, 3.503, 3.660, 3.802],
          backgroundColor: [blue, pale, pale, pale, pale, pale] }]
      },
      extra: { r2: [0.828, 0.826, 0.802, 0.797, 0.788, 0.764], unit: '°F', axis: 'Test MAE, °F (lower is better)', min: 3 }
    },
    'ipl-accuracy': {
      type: 'bar',
      data: {
        labels: ['Logistic regression', 'Gradient boosting', 'CatBoost', 'Random forest', 'XGBoost', 'LightGBM'],
        datasets: [
          { label: 'Test accuracy', data: [61.5, 53.3, 52.5, 51.6, 50.4, 48.8], backgroundColor: blue },
          { label: '5-fold CV accuracy', data: [57.1, 50.2, 51.2, 51.1, 49.6, 49.4], backgroundColor: pale }
        ]
      },
      extra: { unit: '%', axis: 'Accuracy, % (50 = coin flip)', min: 40, max: 65, line50: true }
    },
    'fraud-prauc': {
      type: 'bar',
      data: {
        labels: ['Baseline LightGBM', 'Tuned LightGBM', 'XGBoost', 'CatBoost', 'Calibrated ensemble', 'Ensemble + Isolation Forest'],
        datasets: [{ label: 'Test PR-AUC', data: [0.695, 0.766, 0.768, 0.771, 0.765, 0.761],
          backgroundColor: [pale, blue, blue, blue, blue, blue] }]
      },
      extra: { unit: '', axis: 'PR-AUC on the held-out last 20% of time', min: 0.6, max: 0.8 }
    }
  };

  document.querySelectorAll('canvas[data-chart]').forEach(function (cv) {
    var c = configs[cv.dataset.chart]; if (!c) return;
    var x = c.extra, wide = window.innerWidth < 560;
    new Chart(cv, {
      type: c.type, data: c.data,
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        animation: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? false : { duration: 500 },
        plugins: {
          legend: { display: c.data.datasets.length > 1, position: 'bottom' },
          tooltip: { callbacks: { label: function (i) {
            var s = i.dataset.label + ': ' + i.formattedValue + x.unit;
            if (x.r2) s += ' (R² ' + x.r2[i.dataIndex] + ')';
            return s; } } }
        },
        scales: {
          x: { min: x.min, max: x.max, grid: { color: rule }, title: { display: !wide, text: x.axis } },
          y: { grid: { display: false }, ticks: { color: ink } }
        }
      }
    });
  });
})();
