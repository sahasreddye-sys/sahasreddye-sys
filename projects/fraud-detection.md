---
layout: default
title: Credit card fraud detection
---

[Projects]({{ '/' | relative_url }})
{: .back}

## Credit card fraud detection: rare-event classification

- **Stack:** Python, pandas, LightGBM, XGBoost, CatBoost, scikit-learn, SHAP, Optuna.
- **Links:** [repository](https://github.com/sahasreddye-sys/fraud-detector) · notebook `fraud_detection.ipynb` (runs in Colab)
{: .meta}

### What it is

A fraud classifier on the public Kaggle credit card fraud dataset (European cardholders, two days of transactions). The project is about the parts that make rare-event modeling different from ordinary classification: imbalance, time-ordered evaluation, calibration, choosing a threshold from costs, and explaining individual flags.

### Data

284,807 transactions, 492 of them fraud (0.173%). Features are `Time`, `Amount`, and 28 anonymized components `V1`–`V28` (the result of a PCA, so their meaning is not known). I added `Amount_log` and `Hour` (hour of day from `Time`).

<div class="pair" markdown="1">
![Class imbalance]({{ '/images/fraud-class-imbalance.png' | relative_url }})
*Fraud is a tiny share of transactions (log scale).*

![Transaction amount by class]({{ '/images/fraud-amount.png' | relative_url }})
*Amounts are mostly small for both classes, so amount alone does not separate them.*
</div>

![Volume and fraud rate by hour of day]({{ '/images/fraud-hour.png' | relative_url }})
*Volume drops overnight while the fraud rate rises, which is why hour of day is a feature.*

Because of this imbalance, accuracy says nothing: predicting "legit" every time is 99.8% accurate. I use precision-recall AUC (average precision) as the main metric, with ROC-AUC, precision and recall alongside.

### Evaluation setup

- **Time-ordered split.** Transactions are sorted by time. The first 80% train and the last 20% test (56,962 transactions, only 75 fraud cases). A random split would let the model learn from transactions that happen after the ones it is tested on.
- A validation slice is cut from the end of the training period (15% of it) for early stopping and calibration. The test set is only used for reporting, with one exception noted under the threshold section.
- Imbalance is handled with `scale_pos_weight` (about 507) instead of oversampling, so the test set stays realistic.

### Baseline

LightGBM with 3,000 possible trees, learning rate 0.03, 31 leaves, early stopping on validation PR-AUC. It stopped at 395 trees.

| Metric (test, threshold 0.5) | Value |
|---|---|
| ROC-AUC | 0.839 |
| PR-AUC | 0.695 |
| Precision on fraud | 0.617 |
| Recall on fraud | 0.667 |

![ROC and precision-recall curves]({{ '/images/fraud-roc-pr.png' | relative_url }})
*ROC and precision-recall curves for the baseline.*

<div class="pair" markdown="1">
![Confusion matrix at threshold 0.5]({{ '/images/fraud-confusion.png' | relative_url }})
*Baseline confusion matrix at the default 0.5 cutoff.*

![Optuna optimization history]({{ '/images/fraud-optuna.png' | relative_url }})
*Validation PR-AUC over 30 tuning trials; the red line is the best so far.*
</div>

The SHAP summary below shows which features move individual predictions. `V4` and `V14` stand out, and `Hour` also matters. Since the V features are anonymized, the explanation can say which component mattered but not what it means in real terms.

![SHAP summary]({{ '/images/fraud-shap.png' | relative_url }})
*SHAP values for 1,000 test transactions (baseline model).*

### Improvements I tried

| Change | Test PR-AUC |
|---|---|
| Baseline LightGBM | 0.695 |
| Added rolling features (amount z-score against the last 50 transactions, time since previous transaction, transactions in the trailing hour) + Optuna tuning (30 trials, TPE) + a monotonic constraint on `Amount_log` and amount-based sample weights | 0.766 |
| XGBoost | 0.768 |
| CatBoost | 0.771 |
| Average of the three, each isotonic-calibrated | 0.765 |
| Ensemble plus 10% Isolation Forest score | 0.761 |

Two results were not what I expected. The Isolation Forest alone scored 0.038, nearly nothing, and adding it to the ensemble made it slightly worse. And averaging three models did not beat the individual models on this test set. With 75 fraud cases, differences of a few thousandths are within noise, so I would not claim one model is better than another.

Isotonic calibration of the baseline also lowered PR-AUC (0.695 to 0.584), since there are only a few hundred positive examples to fit the calibration map. The calibrated probabilities are more usable as probabilities, but the ranking got worse.

A note on the "transactions in the last hour" feature: the dataset has no card or account ID, so this counts all transactions in the file, not one customer's. It captures overall volume, not an individual's velocity.

### Picking a threshold from costs

A fixed 0.5 cutoff is arbitrary. I assumed a missed fraud costs $500 and a false alarm costs $5 to investigate (assumed numbers, to be replaced with real ones), computed the total cost across thresholds, and took the minimum. I did this on the test set itself, so the threshold and its cost are slightly optimistic. The clean way is to choose the threshold on the validation slice and only then score the test set.

![Precision, recall and F1 across thresholds]({{ '/images/fraud-threshold.png' | relative_url }})
*Final ensemble: precision, recall and F1 by threshold. The dashed line is the cost-optimal 0.09.*

At that threshold the final ensemble has precision 0.687 and recall 0.76 on the test set, with an estimated cost of $9,130 under those assumed costs. For a single flagged transaction, the notebook also prints the top three SHAP contributors as "reason codes".

### A result that bothers me

I ran a rolling-window cross-validation (5 expanding folds, each tested on the next time block) to check stability over time. The mean PR-AUC was 0.052 ± 0.029, far below the 0.77 on the single split.

![Rolling-window cross-validation]({{ '/images/fraud-time-cv.png' | relative_url }})
*PR-AUC on five later time blocks. The red line is the mean.*

Some of that is expected. These folds are untuned, use only 300 trees, and early blocks have very few fraud cases to learn from or test on. But a gap this large means the single-split number should be read as optimistic until I can explain it. Next steps: stratify blocks so each has enough fraud, report the number of fraud cases per fold, and rerun with the tuned parameters.

### Limits

- The data covers two days, so it cannot tell me how the model behaves across seasons or after fraud patterns change.
- Only 75 fraud cases in the test set, so all test metrics are noisy.
- Anonymized features limit how useful explanations can be.
