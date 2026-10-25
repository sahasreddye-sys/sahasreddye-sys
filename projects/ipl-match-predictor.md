---
layout: default
title: IPL match predictor
---

[Back to projects]({{ '/' | relative_url }})

## IPL Live Predictor: match outcomes from ball-by-ball data

**Stack:** Python, pandas, scikit-learn, XGBoost, CatBoost, LightGBM, matplotlib. The dashboard is plain HTML, CSS and JavaScript with Chart.js.
**Code:** [repository](https://github.com/sahasreddye-sys/ipl-predictor-2026) · **Notebook:** `IPL_Final_Predictor_v2.ipynb` (runs in Colab)

### What it is

A notebook that rebuilds everything from public ball-by-ball data each time it runs, trains six classifiers on past IPL matches, and predicts the winner of a match between any two teams. It also simulates the playoffs 50,000 times to get title odds, and exports the results to JSON for a dashboard.

Version 1 used CSVs I had downloaded by hand. Version 2 replaces them with the Cricsheet ball-by-ball archive, so the standings, batting and bowling tables and venue statistics are all recomputed from deliveries.

### Data pipeline

- Cricsheet's IPL archive: 1,241 matches, each as a match-info file plus a ball-by-ball file.
- 1,146 earlier matches are used for training. The 70 matches played so far in the 2026 season feed the live tables (17,053 deliveries loaded for that season).
- Points table: rebuilt from match results. Net run rate is computed from deliveries, counting runs scored and legal balls faced (wides excluded from balls faced).
- Batting and bowling tables: 176 batters and 125 bowlers tracked from deliveries.
- Venue names are normalized (for example, two spellings of the same stadium are merged) before any venue statistics are computed.

![Standings from the live tables]({{ '/images/ipl-app-standings.png' | relative_url }})
*Standings table in the dashboard, built from the rebuilt points table.*

### Features

Each past match becomes one row from the point of view of team 1, with 11 features:

| Feature | How it is built |
|---|---|
| `venue_bat_first_rate` | share of matches won by the team batting first at that ground. Only grounds with at least 8 matches get a value (40 grounds); others use 0.5 |
| `h2h_rate` | team 1's historical win rate against team 2, over all past meetings (90 ordered matchups) |
| `team1_strength`, `team2_strength`, `strength_diff` | a 0–10 index: weighted, min-max normalized mix of win rate (0.35), net run rate (0.20), average strike rate (0.20), average batting average (0.15) and bowling economy |
| `nrr_diff` | difference in net run rate |
| `team1_won_toss`, `toss_chose_bat`, `team1_batted_first` | toss outcome and decision |
| `team1_encoded`, `team2_encoded` | label-encoded team identity |

### Models

Six classifiers on a 972 / 244 train/test split, with 5-fold cross-validation on the training data: logistic regression, random forest, gradient boosting, XGBoost, CatBoost, LightGBM. The prediction for a match is a weighted vote of all six, with weights set by hand (XGBoost and CatBoost 3, random forest, gradient boosting and LightGBM 2, logistic regression 1). The notebook also picks a best single model by cross-validation score.

![Model comparison]({{ '/images/ipl-model-comparison.png' | relative_url }})
*Test accuracy, AUC-ROC and 5-fold CV accuracy for each model. The dotted line is 50%.*

### Results, stated plainly

| Model | Test accuracy | AUC | 5-fold CV |
|---|---|---|---|
| Logistic regression | 0.615 | 0.613 | 0.571 |
| CatBoost | 0.525 | 0.547 | 0.512 |
| Random forest | 0.516 | 0.505 | 0.511 |
| Gradient boosting | 0.533 | 0.539 | 0.502 |
| XGBoost | 0.504 | 0.513 | 0.496 |
| LightGBM | 0.488 | 0.508 | 0.494 |

Cricket match outcomes are noisy and 244 test matches is a small sample, so the numbers move a lot. Only logistic regression is clearly above 50%, at roughly 57% in cross-validation. The tree models sit at chance. That means the title odds below mostly reflect the strength index and head-to-head features rather than a well-validated model, and I treat them as an illustration of the simulation, not a forecast.

![Feature importance]({{ '/images/ipl-feature-importance.png' | relative_url }})
*Random forest importances. Venue bias, head-to-head rate and strength difference lead.*

### Playoff simulation

The top four teams in the live table are taken as the playoff teams. The notebook gets a win probability for each ordered pair, then simulates Qualifier 1, the Eliminator, Qualifier 2 and the final 50,000 times with a fixed seed.

![Monte Carlo results]({{ '/images/ipl-monte-carlo.png' | relative_url }})
*Title share and chance of reaching the final from the simulation at the time of the run.*

### Dashboard

The exported JSON (standings, title odds, and 45 pairwise matchup probabilities) feeds a static dashboard with standings, season analytics, venue statistics, a head-to-head view and a custom match predictor.

![Season analytics]({{ '/images/ipl-app-analytics.png' | relative_url }})
*Season analytics in the dashboard.*

![Custom match predictor]({{ '/images/ipl-app-predictor.png' | relative_url }})
*The custom predictor: pick teams, venue and toss, then see the ensemble result and how each model voted.*

### Limits and what I would fix

- Team strength is computed from current-season statistics and then applied to every historical match when building training rows. The training features are therefore not "as of the match date". A proper version would recompute strength using only matches before each game.
- Early-season predictions rely on very little current data.
- The models are not tuned. With features this weak, tuning would likely just fit noise.
- Ensemble weights are chosen by hand and not fit to validation data.
