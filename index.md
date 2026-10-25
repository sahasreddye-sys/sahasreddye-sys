## Data Science Projects

Four projects, each with the data, the method, the results, and what did not work.
{: .lede}

<article class="project" markdown="1">
<a class="thumb" href="{{ '/projects/home-value-estimator' | relative_url }}"><img src="{{ '/images/housing-app-budget.png' | relative_url }}" alt="Budget screen of the home planner" loading="lazy"></a>
<div markdown="1">

### [Home value estimator]({{ '/projects/home-value-estimator' | relative_url }})

Estimates the assessed value of about 80,000 homes from county tax records, with an 80% range and per-feature explanations. LightGBM on log value, checked with out-of-fold predictions, held-out neighborhoods, and real sale prices.

**R² 0.912** · median error 4.4%
{: .facts}

</div>
</article>

<article class="project" markdown="1">
<a class="thumb" href="{{ '/projects/ipl-match-predictor' | relative_url }}"><img src="{{ '/images/ipl-monte-carlo.png' | relative_url }}" alt="Title odds from the Monte Carlo simulation" loading="lazy"></a>
<div markdown="1">

### [IPL match predictor]({{ '/projects/ipl-match-predictor' | relative_url }})

Rebuilds standings and player statistics from ball-by-ball data, trains six classifiers on past matches, and simulates the playoffs 50,000 times. The write-up covers why most of the models are at chance level.

**1,241 matches** · 50,000 simulations
{: .facts}

</div>
</article>

<article class="project" markdown="1">
<a class="thumb" href="{{ '/projects/weather-forecast-model' | relative_url }}"><img src="{{ '/images/weather-model-comparison.png' | relative_url }}" alt="Comparison of six regression models" loading="lazy"></a>
<div markdown="1">

### [Weather forecast model]({{ '/projects/weather-forecast-model' | relative_url }})

Predicts tomorrow's mean temperature. Six models compared in a notebook, then a linear regression solved in the browser for any city. Time-ordered validation.

**MAE 3.29°F** · R² 0.83 on held-out days
{: .facts}

</div>
</article>

<article class="project" markdown="1">
<a class="thumb" href="{{ '/projects/fraud-detection' | relative_url }}"><img src="{{ '/images/fraud-roc-pr.png' | relative_url }}" alt="ROC and precision-recall curves" loading="lazy"></a>
<div markdown="1">

### [Credit card fraud detection]({{ '/projects/fraud-detection' | relative_url }})

Fraud is 0.17% of 284,807 transactions. Time-ordered split, tuned gradient boosting, calibration, a cost-based threshold, and SHAP explanations. Includes a cross-validation result I could not yet explain.

**284,807 transactions** · 492 fraud
{: .facts}

</div>
</article>

### Tools

Python, pandas, NumPy, scikit-learn, LightGBM, XGBoost, CatBoost, SHAP, Optuna, matplotlib, Plotly, Jupyter and Colab. JavaScript for the web apps.
