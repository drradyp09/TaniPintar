# Graph Report - TaniPintar  (2026-07-15)

## Corpus Check
- 69 files · ~19,161,737 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2311 nodes · 5906 edges · 32 communities detected
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 93 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]

## God Nodes (most connected - your core abstractions)
1. `error()` - 137 edges
2. `_update()` - 79 edges
3. `callback()` - 46 edges
4. `draw()` - 43 edges
5. `push()` - 42 edges
6. `completeWork()` - 40 edges
7. `round()` - 34 edges
8. `beginWork()` - 33 edges
9. `captureCommitPhaseError()` - 30 edges
10. `commitRootImpl()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `replaceTraps()` --calls--> `callback()`  [INFERRED]
  frontend/dev-dist/workbox-8d0d8005.js → ds-bundle/_ds_bundle.js
- `test_segmentation()` --calls--> `segment_leaf()`  [INFERRED]
  test_segmentation.py → backend/app/services/processing_service.py
- `executeQuotaErrorCallbacks()` --calls--> `callback()`  [INFERRED]
  frontend/dev-dist/workbox-8d0d8005.js → ds-bundle/_ds_bundle.js
- `executeQuotaErrorCallbacks()` --calls--> `callback()`  [INFERRED]
  frontend/dev-dist/workbox-5a5d9309.js → ds-bundle/_ds_bundle.js
- `Input()` --calls--> `useState()`  [INFERRED]
  frontend/src/components/Input.jsx → ds-bundle/_vendor/react.js

## Communities

### Community 0 - "Community 0"
Cohesion: 0.01
Nodes (516): accumulateEnterLeaveListenersForEvent(), accumulateEnterLeaveTwoPhaseListeners(), accumulateOrCreateContinuousQueuedReplayableEvent(), accumulateSinglePhaseListeners(), accumulateTwoPhaseListeners(), addEventBubbleListener(), addEventBubbleListenerWithPassiveFlag(), addEventCaptureListener() (+508 more)

### Community 1 - "Community 1"
Cohesion: 0.01
Nodes (133): autoSkip(), axisFromPosition(), _bezierInterpolation(), buildLayoutBoxes(), buildStacks(), calculateItemHeight(), calculateItemSize(), calculateItemWidth() (+125 more)

### Community 2 - "Community 2"
Cohesion: 0.02
Nodes (170): resolve(), act(), assertValidProps(), checkAttributeStringCoercion(), checkControlledValueProps(), checkCSSPropertyStringCoercion(), checkDepsAreArrayDev(), checkFormFieldValueStringCoercion() (+162 more)

### Community 3 - "Community 3"
Cohesion: 0.02
Nodes (65): addRoute(), CacheableResponse, CacheableResponsePlugin, cacheDonePromiseForTransaction(), CacheExpiration, CacheFirst, cacheMatchIgnoreParams(), CacheTimestampsModel (+57 more)

### Community 4 - "Community 4"
Cohesion: 0.04
Nodes (112): getDerivedStateFromError(), getDerivedStateFromProps(), init(), mergeIf(), applyDerivedStateFromProps(), bailoutHooks(), bailoutOnAlreadyFinishedWork(), beginWork() (+104 more)

### Community 5 - "Community 5"
Cohesion: 0.03
Nodes (62): create_app(), FertilizerPrice, Dynamic fertilizer pricing model with time-series support.     Supports both man, Sensor, SensorData, User, analyze_disease(), calculate_fertilizer_multi() (+54 more)

### Community 6 - "Community 6"
Cohesion: 0.04
Nodes (42): addRoute(), cacheMatchIgnoreParams(), cacheWillUpdate(), canConstructResponseFromBodyStream(), copyResponse(), createCacheKey(), createHandlerBoundToURL(), Deferred (+34 more)

### Community 7 - "Community 7"
Cohesion: 0.04
Nodes (98): appendChild(), appendChildToContainer(), appendInitialChild(), attachSuspenseRetryListeners(), captureCommitPhaseError(), clearContainer(), clearSuspenseBoundary(), clearSuspenseBoundaryFromContainer() (+90 more)

### Community 8 - "Community 8"
Cohesion: 0.05
Nodes (86): addRoundedRectPath(), adjustHitBoxes(), _alignPixel(), _bezierCurveTo(), calculateLabelRotation(), _calculatePadding(), clipBounds(), clipHorizontal() (+78 more)

### Community 9 - "Community 9"
Cohesion: 0.04
Nodes (65): AddSensorModal(), BottomNav(), MapPicker(), SensorCard(), SensorChart(), compilePath(), createPath(), DataRoutes2() (+57 more)

### Community 10 - "Community 10"
Cohesion: 0.05
Nodes (75): addBox(), _addGrace(), afterBuildTicks(), afterCalculateLabelRotation(), afterDataLimits(), afterDraw(), afterFit(), afterSetDimensions() (+67 more)

### Community 11 - "Community 11"
Cohesion: 0.05
Nodes (70): add(), addScopes(), addScopesFromKey(), applyAnimationsDefaults(), applyLayoutsDefaults(), applyScaleDefaults(), _attachContext(), cachedKeys() (+62 more)

### Community 12 - "Community 12"
Cohesion: 0.06
Nodes (46): afterDatasetsUpdate(), applyStack(), _buildStackLine(), computeBoundary(), computeLinearBoundary(), _createBoundaryLine(), _decodeFill(), decodeTargetIndex() (+38 more)

### Community 13 - "Community 13"
Cohesion: 0.06
Nodes (43): abstract(), addTick(), _arrayUnique(), _boundSegment(), _boundSegments(), buildTicks(), _computeSegments(), determineMajorUnit() (+35 more)

### Community 14 - "Community 14"
Cohesion: 0.07
Nodes (36): addPointsBelow(), alpha(), b2n(), calln(), clone(), color(), darken(), desaturate() (+28 more)

### Community 15 - "Community 15"
Cohesion: 0.1
Nodes (36): advanceTimers(), cancelHostTimeout(), completeWork(), cutOffTailIfNeeded(), flushWork(), getRenderTargetTime(), handleTimeout(), markRef$1() (+28 more)

### Community 16 - "Community 16"
Cohesion: 0.08
Nodes (31): addElements(), buildOrUpdateControllers(), buildOrUpdateElements(), clear(), clearCache(), clearCanvas(), clearStacks(), compare2Level() (+23 more)

### Community 17 - "Community 17"
Cohesion: 0.08
Nodes (31): aspectRatio(), beforeDatasetDraw(), beforeDatasetsDraw(), beforeDraw(), clipArea(), _computeLabelArea(), decorateText(), drawBackdrop() (+23 more)

### Community 18 - "Community 18"
Cohesion: 0.1
Nodes (28): average(), binarySearch(), dataset(), evaluateInteractionItems(), fromNativeEvent(), getAxisItems(), getCanvasPosition(), getCenterPoint() (+20 more)

### Community 19 - "Community 19"
Cohesion: 0.1
Nodes (27): acquireContext(), apply(), chartOptionScopes(), constructor(), createContext5(), createDataContext(), createDatasetContext(), createPointLabelContext() (+19 more)

### Community 20 - "Community 20"
Cohesion: 0.1
Nodes (25): active(), allPlugins(), _animateOptions(), awaitAll(), cancel(), _createAnimations(), _createDescriptors(), createTypedChart() (+17 more)

### Community 21 - "Community 21"
Cohesion: 0.11
Nodes (23): _angleBetween(), buildPointLabelItems(), computeCircularBoundary(), createPointLabelItem(), determineLimits(), drawRadiusLine(), fitWithPointLabels(), getBasePosition() (+15 more)

### Community 22 - "Community 22"
Cohesion: 0.12
Nodes (21): afterAutoSkip(), alignX(), alignY(), buildLookupTable(), getBackgroundPoint(), getBasePixel(), getDecimalForPixel(), getDecimalForValue() (+13 more)

### Community 23 - "Community 23"
Cohesion: 0.14
Nodes (17): addEventListener(), addListener(), bindResponsiveEvents(), createProxyAndListen(), createResizeObserver(), getContainerSize(), getMaximumSize(), _getParentNode() (+9 more)

### Community 24 - "Community 24"
Cohesion: 0.31
Nodes (9): build_datasets(), build_model(), compute_class_weights(), deploy_to_backend(), export_tflite(), main(), Train a plant-disease classifier on `deeplearning/dataset/` using transfer learn, Load train/val datasets. Keras sorts class folder names alphabetically,     so t (+1 more)

### Community 25 - "Community 25"
Cohesion: 0.48
Nodes (6): load_val_ds(), main(), predict_keras(), predict_tflite(), Evaluate the trained plant-disease model on the validation split and report per-, save_confusion_matrix()

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (2): create_test_image(), verify()

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (2): create_dummy_image(), test_disease()

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (2): require(), singleRequire()

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (1): Test script for scientific fertilizer calculation Verifies nutrient balance meth

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (1): Test script for multi-fertilizer optimization Tests scoring, ranking, and compat

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (1): Test script untuk memverifikasi perhitungan rainfall dan net water requirement T

## Knowledge Gaps
- **37 isolated node(s):** `Test script for scientific fertilizer calculation Verifies nutrient balance meth`, `Test script for multi-fertilizer optimization Tests scoring, ranking, and compat`, `Test script untuk memverifikasi perhitungan rainfall dan net water requirement T`, `Evaluate the trained plant-disease model on the validation split and report per-`, `Train a plant-disease classifier on `deeplearning/dataset/` using transfer learn` (+32 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 30`** (3 nodes): `create_test_image()`, `verify()`, `verify_chlorophyll_v2.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (3 nodes): `create_dummy_image()`, `test_disease()`, `verify_integration.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (3 nodes): `require()`, `singleRequire()`, `sw.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (2 nodes): `Test script for scientific fertilizer calculation Verifies nutrient balance meth`, `test_fertilizer_scientific.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (2 nodes): `Test script for multi-fertilizer optimization Tests scoring, ranking, and compat`, `test_multi_fertilizer.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (2 nodes): `Test script untuk memverifikasi perhitungan rainfall dan net water requirement T`, `test_rainfall_calculation.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `callback()` connect `Community 10` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 6`, `Community 15`, `Community 19`, `Community 20`?**
  _High betweenness centrality (0.303) - this node is a cross-community bridge._
- **Why does `init()` connect `Community 4` to `Community 1`, `Community 2`, `Community 19`, `Community 13`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **Why does `round()` connect `Community 5` to `Community 1`, `Community 8`, `Community 12`, `Community 14`, `Community 18`, `Community 21`, `Community 22`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Are the 24 inferred relationships involving `callback()` (e.g. with `replaceTraps()` and `executeQuotaErrorCallbacks()`) actually correct?**
  _`callback()` has 24 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Test script for scientific fertilizer calculation Verifies nutrient balance meth`, `Test script for multi-fertilizer optimization Tests scoring, ranking, and compat`, `Test script untuk memverifikasi perhitungan rainfall dan net water requirement T` to the rest of the system?**
  _37 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.01 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.01 - nodes in this community are weakly interconnected._