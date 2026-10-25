---
layout: default
charts: true
title: Weather forecast model
---

[Projects]({{ '/' | relative_url }})
{: .back}

## Weather Intelligence: a regression model trained in the browser

- **Stack:** Python and Plotly for the notebook, scikit-learn for model comparison, vanilla JavaScript for the dashboard.
- **Links:** [repository](https://github.com/sahasreddye-sys/weather-prediction-model) · [live app](https://sahasreddye-sys.github.io/weather-prediction-model/) · notebook `Weather_Analysis_Model.ipynb`
{: .meta}

### What it is

A weather dashboard that shows current conditions and forecasts from Open-Meteo, and also predicts tomorrow's mean temperature with a model it trains itself when the page loads. The prediction is shown next to Open-Meteo's own forecast, and an Accuracy tab compares past predictions to what happened.

![The weather dashboard, Today tab, with the location blurred]({{ '/images/weather-app.png' | relative_url }})
*The Today tab. My regression's prediction for tomorrow sits next to Open-Meteo's own forecast. The location is blurred.*

### Data

Open-Meteo's free historical archive and forecast APIs, with no key. For each city the app downloads about two years of daily history (mean temperature, mean humidity, total precipitation). In the notebook the cleaned modeling table had 724 daily rows covering about two years.

![Autocorrelation and partial autocorrelation of daily mean temperature]({{ '/images/weather-acf.png' | relative_url }})
*Autocorrelation stays high for two weeks, but the partial autocorrelation drops after one or two days. Yesterday and the day before carry most of the information, which is why only two lags are used.*

### Problem setup

Predict the next day's mean temperature from today's and yesterday's weather. Every row uses only values known at the end of the day before the target.

Nine features:

| Feature | Meaning |
|---|---|
| `temp_mean_lag1`, `temp_mean_lag2` | today's and yesterday's mean temperature |
| `humidity_lag1`, `precip_lag1` | today's humidity and precipitation |
| `temp_std_7d` | standard deviation of mean temperature over 7 days (a measure of unsettled weather) |
| `day_sin`, `day_cos` | day of year as a sine/cosine pair, so December 31 is next to January 1 |
| `hdd`, `cdd` | heating and cooling degree days against a 65°F base |

![Correlation of each candidate feature with next-day mean temperature]({{ '/images/weather-correlation.png' | relative_url }})
*Correlation of each candidate feature with the next day's mean temperature. Today's temperature is by far the strongest, which is why a persistence baseline would be hard to beat.*

### Validation

The split is chronological: the first 80% of days train the model and the most recent 20% test it (579 train days, 145 test days in the notebook). A random split would let the model see days next to its test days and overstate accuracy.

### Model comparison

I compared six models in the notebook on the same split.

![Model comparison]({{ '/images/weather-model-comparison.png' | relative_url }})
*Test MAE for six models, with R² in brackets. Values from the notebook's comparison table.*

<figure class="chart">
<div class="chart-box"><canvas data-chart="weather-mae" role="img" aria-label="Test MAE for six regression models"></canvas></div>
<figcaption>Same numbers, interactive: hover a bar for its MAE and R². The axis starts at 3°F, so the gaps look bigger than they are; the whole spread is about half a degree.</figcaption>
</figure>


Plain linear regression was best (MAE 3.29°F, RMSE 4.32°F, R² 0.828). Ridge was nearly the same, and the tree ensembles and SVR were worse. With 579 training rows and strongly seasonal data, the flexible models have little to gain and more to overfit, so I used linear regression in the app.

![Predicted and actual next-day temperature on the test period]({{ '/images/weather-actual-vs-pred.png' | relative_url }})
*Test period only. The black line is actual, the dashed lines are the three best models. They are almost on top of each other, so the choice between them matters less than the features.*

The strongest coefficients in the notebook were `day_cos` (−4.1) and the degree-day terms. The lag temperature terms have small, partly offsetting coefficients because `hdd` and `cdd` are derived from the same temperature, so they are collinear. I would not read the individual signs as physical effects.

![Residuals over the test period]({{ '/images/weather-residuals.png' | relative_url }})
*Residuals (actual minus predicted) over the test period. They are centered on zero. The largest misses cluster in late winter and early spring, when fronts make the next day's temperature harder to guess from today's.*

### Training in the browser

The dashboard trains per city in JavaScript. It solves the normal equations directly, `beta = (XᵀX + λI)⁻¹ Xᵀy`, with λ near zero for the main model (plain least squares) and λ = 3 for a ridge comparison. It then computes MAE, RMSE and R² on the same kind of 80/20 chronological split and shows them next to the prediction.

On a recent check, the in-browser model for one city scored an MAE of about 2.3°F and R² of about 0.64. That is different from the notebook's 3.29°F and 0.83 because the city, the date range and the test window are different. R² in particular depends on how much the temperature varies inside the test window, so it should not be compared across windows.

### Limits

- It only sees the city's own recent weather. There are no pressure maps, fronts or radar, so it is a baseline and not a replacement for a real forecast.
- I did not compare it against a "tomorrow equals today" baseline in the notebook. That is the first thing I would add.
- Accuracy varies by city and season, which is why the numbers are recomputed on every load instead of being hard-coded.
