---
layout: default
title: Home value estimator
---

[Projects]({{ '/' | relative_url }})
{: .back}

## Forsyth MarketMap: estimating home values from county tax records

- **Stack:** Python, pandas, LightGBM, matplotlib. The web app is plain JavaScript and runs in the browser.
- **Links:** [repository](https://github.com/sahasreddye-sys/CAC26) · [live app](https://sahasreddye-sys.github.io/CAC26/) · notebook `housing_model_v2.ipynb`
{: .meta}

### What it is

A budget-first home planner. A family enters take-home pay, debts, regular costs and savings. The app works out a comfortable monthly housing cost and a price range, then lists county homes near that range with a model estimate, an 80% range, and the reasons behind each estimate.

![Budget screen with made-up example numbers]({{ '/images/housing-app-budget.png' | relative_url }})
*The budget step, filled with the app's example family (made-up numbers).*

### Data

- Tax assessor parcel records, tax year 2025. The county file had 85,556 rows and 80,306 remained after keeping parcels with a building, a living area and a positive assessed value, and dropping duplicate parcel IDs.
- For a second county, the parcels file was joined to separate building (structure) records and a supplement file with lot frontage and topography. That county also had a sales file: 77,693 sales, of which 18,494 were normal sales (warranty deed, land and building, at least $100,000).
- Coordinates come with each parcel, which is what the map and the location features use.

The target is the county's assessed value, not a sale price. Forsyth has no open sale records, so a model trained on sale prices was not possible there.

![Map of estimated values]({{ '/images/housing-app-map.png' | relative_url }})
*Parcels shaded by estimate in the app.*

![Distribution of county values and value against building size]({{ '/images/housing-value-distribution.png' | relative_url }})
*Assessed values are right-skewed, so the model works on the log scale. Median is about $619,000. Value rises steadily with building size.*

![County value by location and by construction quality class]({{ '/images/housing-map-quality.png' | relative_url }})
*Where values are high, and how value climbs with the county's construction quality grade. Location and quality are both inputs.*

### Model

LightGBM regression on `log1p(assessed value)`, with the same settings for every experiment: 600 trees, learning rate 0.06, 48 leaves, minimum 15 samples per leaf, 80% row and column subsampling, seed 42.

Predictions in the notebook are out-of-fold: each home is predicted by a model that never saw it, using 5-fold cross-validation. A single model fit on all homes is only used to explain the estimates.

Features for the Forsyth model: building area, residential floor area, home age, floor count, lot size, a flag for whether the lot size is known, construction quality class, structure type, use code, neighborhood code, zoning, class code, and latitude and longitude.

**Land value was removed on purpose.** The county's own land value is a strong input (R² 0.928 with it, 0.906 without), but a person using the app would not have it, so the model has to work without it.

![Feature sets compared]({{ '/images/housing-feature-sets.png' | relative_url }})
*Three input sets for the first county, each scored two ways. Blue: random folds. Light blue: whole neighborhoods held out.*

### Results (Forsyth, 5-fold out-of-fold)

| Metric | Value |
|---|---|
| R² (on dollar value) | 0.912 |
| Mean absolute error | $45,380 |
| Median absolute percentage error | 4.4% |
| Homes within 10% of assessed value | 81.6% |

Feature sets for Forsyth, in order: with land value (R² 0.928), without it (0.906), plus quality class and structure type (0.909), plus coordinates (0.912).

![Accuracy plots]({{ '/images/housing-accuracy.png' | relative_url }})
*Estimate vs assessed value, error distribution with the 80% band, error by price tier, and band coverage by tier.*

### Intervals

The 80% range comes from the 10th and 90th percentiles of the log residuals, giving about −8.5% to +11.0% around each estimate. I checked it by building the band from half of the errors and testing it on the other half: 80.0% coverage overall.

It does not hold evenly. Coverage is about 79–88% for the lower and middle price tiers and falls to about 68% for the top 20%. The app's range is therefore too narrow for expensive homes, and I list that as a limit rather than hiding it.

### What I learned from the validation

- **Random folds flatter the model.** On the first county, median error was 3.9% with random folds and 15.6% when entire neighborhoods were held out, and R² fell from 0.911 to 0.604. Neighbors share values, so a random split lets the model lean on near-duplicates. A new neighborhood is a harder case than the headline number suggests.
- **Matching assessed value is not matching the market.** On the county with sale records, 2025 sales (n = 308) had a median assessed value of 0.786 of the sale price. My estimates were at 0.780, with a similar spread (about 22% COD). The model reproduces the assessor well, but it does not correct the assessor's gap to sale prices.
- **That gap is why the app adds a markup.** The "likely sale price" step applies a factor (+28% in the app) measured on the county that has sales, and applied to Forsyth. That is an assumption, and the app says so.

![Sales check]({{ '/images/housing-sales-ratio.png' | relative_url }})
*Assessed value (gray) and model estimate (blue) divided by actual sale price, by year.*

### Explaining estimates

Each home's estimate is broken into per-feature contributions, so the detail page can say what pushed it up or down. Averaged over homes, building area has the largest effect (about 20% on the estimate), followed by neighborhood code (about 9%).

![Feature effects and error map]({{ '/images/housing-importance-error-map.png' | relative_url }})
*Average effect of each input, and where the model over- or under-shoots (red: too high, blue: too low).*

![How estimates change with size and age]({{ '/images/housing-effects.png' | relative_url }})
*Each point is a home. Estimates rise almost linearly with building size. Age pulls them down gently, with a cluster of brand-new homes near zero years that the model has trouble with.*

### The app

The live app is [here](https://sahasreddye-sys.github.io/CAC26/). I left it out of this page as an embed because its home list shows street addresses from the county records.


![Search filters and county summary in the app]({{ '/images/housing-app-filters.png' | relative_url }})
*Filters, school zones and the county summary. The summary reports the same error and range as the notebook.*

- Estimates for all homes ship as a compressed JSON file, so there is no server and nothing a user types leaves the browser.
- Every number the planner uses that the family does not type in (mortgage rate, loan length, tax and insurance assumptions, the sale-price markup) sits in one `planner-config.json` with a source and an as-of date.
- Budget math has unit tests (`planner-math`, loan payment, monthly cost, sale price) that run in CI.

### Limits

- Estimates follow assessed value, not market price or condition. They are not an appraisal.
- Only one county's homes are listed.
- Brand-new homes may have been valued while still being built, so their estimates can come out too low.
