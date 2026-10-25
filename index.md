## Data Science Projects

---

### [Forsyth MarketMap](https://github.com/sahasreddye-sys/CAC26)

A home budget planner for Forsyth County, GA. You enter income, debts and savings, and it shows which homes fit and how each estimate was reached.

- LightGBM (600 trees, 5-fold cross-validation) trained on log assessed value from the 2025 county tax assessor parcel records
- SHAP values show which features pushed a home's estimate up or down
- It predicts assessed value, not sale price, because the open data has no Forsyth sale prices
- Runs in the browser, and it is not financial advice

[Live site](https://sahasreddye-sys.github.io/CAC26/) · [Code](https://github.com/sahasreddye-sys/CAC26)

---

### [IPL Live Predictor](https://github.com/sahasreddye-sys/ipl-predictor-2026)

A Colab notebook that predicts IPL match outcomes. It rebuilds the points table, batting and bowling stats and venue bias from Cricsheet ball-by-ball data each time it runs.

- Six classifiers (logistic regression, random forest, gradient boosting, XGBoost, CatBoost, LightGBM) combined by weighted vote
- Features include toss, venue bias, head-to-head record, NRR difference and a team strength index
- Monte Carlo simulation (50,000 runs) for playoff and title odds
- Venues with fewer than 8 past matches fall back to a neutral bias

[Code](https://github.com/sahasreddye-sys/ipl-predictor-2026)

---

### [Weather Intelligence](https://github.com/sahasreddye-sys/weather-prediction-model)

A weather dashboard with a regression model that is trained in the browser.

[Live site](https://sahasreddye-sys.github.io/weather-prediction-model/) · [Code](https://github.com/sahasreddye-sys/weather-prediction-model)

---

### [Fraud Detection Case File](https://github.com/sahasreddye-sys/fraud-detector)

A write-up of a credit card fraud detection project, as a single page.

[Live site](https://sahasreddye-sys.github.io/fraud-detector/) · [Code](https://github.com/sahasreddye-sys/fraud-detector)

---

### Tools

Python, pandas, scikit-learn, XGBoost, LightGBM, SHAP, Jupyter and Colab
