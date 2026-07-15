# Graph Report - TaniPintar  (2026-07-15)

## Corpus Check
- 69 files · ~19,162,195 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2312 nodes · 5908 edges · 40 communities detected
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
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]

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
Cohesion: 0.02
Nodes (109): addEventListener(), addListener(), afterDraw(), alignX(), alignY(), axisFromPosition(), _bezierInterpolation(), bindResponsiveEvents() (+101 more)

### Community 1 - "Community 1"
Cohesion: 0.02
Nodes (159): resolve(), act(), assertValidProps(), checkAttributeStringCoercion(), checkClassInstance(), checkControlledValueProps(), checkCSSPropertyStringCoercion(), checkDepsAreArrayDev() (+151 more)

### Community 2 - "Community 2"
Cohesion: 0.02
Nodes (65): addRoute(), CacheableResponse, CacheableResponsePlugin, cacheDonePromiseForTransaction(), CacheExpiration, CacheFirst, cacheMatchIgnoreParams(), CacheTimestampsModel (+57 more)

### Community 3 - "Community 3"
Cohesion: 0.02
Nodes (70): addEventBubbleListener(), addEventBubbleListenerWithPassiveFlag(), addEventCaptureListener(), addEventCaptureListenerWithPassiveFlag(), addTrappedEventListener(), callCallback(), canHydrateInstance(), canHydrateSuspenseInstance() (+62 more)

### Community 4 - "Community 4"
Cohesion: 0.03
Nodes (103): AddSensorModal(), BottomNav(), MapPicker(), SensorCard(), SensorChart(), compilePath(), createKey(), createLocation() (+95 more)

### Community 5 - "Community 5"
Cohesion: 0.04
Nodes (118): getDerivedStateFromError(), getDerivedStateFromProps(), init(), applyDerivedStateFromProps(), attemptEarlyBailoutIfNoScheduledUpdate(), bailoutHooks(), bailoutOnAlreadyFinishedWork(), beginWork() (+110 more)

### Community 6 - "Community 6"
Cohesion: 0.04
Nodes (42): addRoute(), cacheMatchIgnoreParams(), cacheWillUpdate(), canConstructResponseFromBodyStream(), copyResponse(), createCacheKey(), createHandlerBoundToURL(), Deferred (+34 more)

### Community 7 - "Community 7"
Cohesion: 0.03
Nodes (54): create_app(), FertilizerPrice, Dynamic fertilizer pricing model with time-series support.     Supports both man, Sensor, SensorData, User, analyze_disease(), calculate_fertilizer_multi() (+46 more)

### Community 8 - "Community 8"
Cohesion: 0.04
Nodes (102): appendChild(), appendChildToContainer(), appendInitialChild(), captureCommitPhaseError(), clearContainer(), clearSuspenseBoundary(), clearSuspenseBoundaryFromContainer(), commitAttachRef() (+94 more)

### Community 9 - "Community 9"
Cohesion: 0.05
Nodes (79): addRoundedRectPath(), adjustHitBoxes(), aspectRatio(), _bezierCurveTo(), clipArea(), clipBounds(), clipHorizontal(), clipVertical() (+71 more)

### Community 10 - "Community 10"
Cohesion: 0.04
Nodes (78): abstract(), addTick(), _alignPixel(), allPlugins(), buildTicks(), calculateLabelRotation(), _calculatePadding(), clone2() (+70 more)

### Community 11 - "Community 11"
Cohesion: 0.05
Nodes (72): addBox(), _addGrace(), afterBuildTicks(), afterCalculateLabelRotation(), afterDataLimits(), afterFit(), afterSetDimensions(), afterTickToLabelConversion() (+64 more)

### Community 12 - "Community 12"
Cohesion: 0.05
Nodes (68): active(), add(), addScopes(), addScopesFromKey(), _animateOptions(), applyAnimationsDefaults(), applyLayoutsDefaults(), applyScaleDefaults() (+60 more)

### Community 13 - "Community 13"
Cohesion: 0.05
Nodes (62): attachRetryListener(), attemptContinuousHydration$1(), attemptHydrationAtCurrentPriority$1(), attemptSynchronousHydration$1(), captureCommitPhaseErrorOnRoot(), checkForNestedUpdates(), checkIfSnapshotChanged(), claimNextRetryLane() (+54 more)

### Community 14 - "Community 14"
Cohesion: 0.05
Nodes (60): addFiberToLanesMap(), attachSuspenseRetryListeners(), cancelCallback$1(), computeExpirationTime(), ensureRootIsScheduled(), errorHydratingContainer(), finishConcurrentRender(), finishQueueingConcurrentUpdates() (+52 more)

### Community 15 - "Community 15"
Cohesion: 0.05
Nodes (53): afterAutoSkip(), almostEquals(), almostWhole(), alpha(), autoSkip(), b2n(), buildLookupTable(), calln() (+45 more)

### Community 16 - "Community 16"
Cohesion: 0.05
Nodes (54): accumulateOrCreateContinuousQueuedReplayableEvent(), adoptClassInstance(), assertIsMounted(), attachPingListener(), attemptExplicitHydrationTarget(), attemptReplayContinuousQueuedEvent(), attemptReplayContinuousQueuedEventInMap(), attemptSynchronousHydration() (+46 more)

### Community 17 - "Community 17"
Cohesion: 0.06
Nodes (53): accumulateEnterLeaveListenersForEvent(), accumulateEnterLeaveTwoPhaseListeners(), accumulateSinglePhaseListeners(), accumulateTwoPhaseListeners(), compare(), constructSelectEvent(), createAndAccumulateChangeEvent(), createDispatchListener() (+45 more)

### Community 18 - "Community 18"
Cohesion: 0.05
Nodes (48): average(), beforeDatasetDraw(), beforeDatasetsDraw(), beforeDraw(), binarySearch(), capBezierPoints(), capControlPoint(), dataset() (+40 more)

### Community 19 - "Community 19"
Cohesion: 0.07
Nodes (48): bubbleProperties(), checkForUnmatchedText(), commitUpdate(), completeDehydratedSuspenseBoundary(), completeWork(), createInstance(), createTextInstance(), createTextNode() (+40 more)

### Community 20 - "Community 20"
Cohesion: 0.07
Nodes (41): areHookInputsEqual(), createFunctionComponentUpdateQueue(), getWorkInProgressRoot(), includesBlockingLane(), includesOnlyNonUrgentLanes(), markWorkInProgressReceivedUpdate(), mountCallback(), mountDeferredValue() (+33 more)

### Community 21 - "Community 21"
Cohesion: 0.08
Nodes (39): applyStack(), _arrayUnique(), _boundSegment(), _boundSegments(), _computeSegments(), determineDataLimits(), findOrAddLabel(), findStartAndEnd() (+31 more)

### Community 22 - "Community 22"
Cohesion: 0.07
Nodes (39): addSubtreeSuspenseContext(), createCapturedValue(), createFiberFromFragment(), createFiberFromOffscreen(), findFirstSuspended(), findLastContentRow(), getRemainingWorkInPrimaryTree(), getSuspendedCache() (+31 more)

### Community 23 - "Community 23"
Cohesion: 0.07
Nodes (37): addPointsBelow(), _angleBetween(), buildPointLabelItems(), _buildStackLine(), computeBoundary(), computeCircularBoundary(), _computeLabelSizes(), computeLinearBoundary() (+29 more)

### Community 24 - "Community 24"
Cohesion: 0.09
Nodes (35): batchedUpdates$1(), commitDoubleInvokeEffectsInDEV(), commitRoot(), commitRootImpl(), discreteUpdates(), dispatchContinuousEvent(), dispatchDiscreteEvent(), dispatchEvent() (+27 more)

### Community 25 - "Community 25"
Cohesion: 0.08
Nodes (32): addElements(), buildOrUpdateControllers(), buildOrUpdateElements(), clear(), clearCache(), clearCanvas(), clearStacks(), compare2Level() (+24 more)

### Community 26 - "Community 26"
Cohesion: 0.09
Nodes (29): acquireContext(), apply(), chartOptionScopes(), constructor(), createContext5(), createDataContext(), createDatasetContext(), _createItems() (+21 more)

### Community 27 - "Community 27"
Cohesion: 0.11
Nodes (29): createFiberFromHostInstanceForDeletion(), deleteHydratableInstance(), didNotFindHydratableInstance(), didNotFindHydratableInstanceWithinContainer(), didNotFindHydratableInstanceWithinSuspenseInstance(), didNotFindHydratableTextInstance(), didNotFindHydratableTextInstanceWithinContainer(), didNotFindHydratableTextInstanceWithinSuspenseInstance() (+21 more)

### Community 28 - "Community 28"
Cohesion: 0.11
Nodes (25): findChildHostInstancesForFiberShallowly(), findHostInstancesForFiberShallowly(), findHostInstancesForMatchingFibersRecursively(), getIsUpdatingOpaqueValueInRenderPhaseInDEV(), getPublicRootInstance(), getReactRootElementInContainer(), has(), hydrate() (+17 more)

### Community 29 - "Community 29"
Cohesion: 0.11
Nodes (22): commitBeforeMutationEffects(), containsNode(), getActiveElementDeep(), getLeafNode(), getModernOffsetsFromPoints(), getNodeForCharacterOffset(), getOffsets(), getSelection() (+14 more)

### Community 30 - "Community 30"
Cohesion: 0.14
Nodes (20): afterDatasetsUpdate(), datasetElementScopeKeys(), getDatasetMeta(), getLineByIndex(), getMaxOverflow(), getStyle(), handleClick(), hide() (+12 more)

### Community 31 - "Community 31"
Cohesion: 0.21
Nodes (14): advanceTimers(), cancelHostTimeout(), flushWork(), handleTimeout(), markTaskErrored(), peek(), requestHostCallback(), requestHostTimeout() (+6 more)

### Community 32 - "Community 32"
Cohesion: 0.31
Nodes (9): build_datasets(), build_model(), compute_class_weights(), deploy_to_backend(), export_tflite(), main(), Train a plant-disease classifier on `deeplearning/dataset/` using transfer learn, Load train/val datasets. Keras sorts class folder names alphabetically,     so t (+1 more)

### Community 33 - "Community 33"
Cohesion: 0.48
Nodes (6): load_val_ds(), main(), predict_keras(), predict_tflite(), Evaluate the trained plant-disease model on the validation split and report per-, save_confusion_matrix()

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (2): create_test_image(), verify()

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (2): create_dummy_image(), test_disease()

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (2): require(), singleRequire()

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (1): Test script for scientific fertilizer calculation Verifies nutrient balance meth

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (1): Test script for multi-fertilizer optimization Tests scoring, ranking, and compat

### Community 47 - "Community 47"
Cohesion: 1.0
Nodes (1): Test script untuk memverifikasi perhitungan rainfall dan net water requirement T

## Knowledge Gaps
- **37 isolated node(s):** `Test script for scientific fertilizer calculation Verifies nutrient balance meth`, `Test script for multi-fertilizer optimization Tests scoring, ranking, and compat`, `Test script untuk memverifikasi perhitungan rainfall dan net water requirement T`, `Evaluate the trained plant-disease model on the validation split and report per-`, `Train a plant-disease classifier on `deeplearning/dataset/` using transfer learn` (+32 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 38`** (3 nodes): `create_test_image()`, `verify()`, `verify_chlorophyll_v2.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (3 nodes): `create_dummy_image()`, `test_disease()`, `verify_integration.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (3 nodes): `require()`, `singleRequire()`, `sw.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (2 nodes): `Test script for scientific fertilizer calculation Verifies nutrient balance meth`, `test_fertilizer_scientific.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (2 nodes): `Test script for multi-fertilizer optimization Tests scoring, ranking, and compat`, `test_multi_fertilizer.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (2 nodes): `Test script untuk memverifikasi perhitungan rainfall dan net water requirement T`, `test_rainfall_calculation.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `callback()` connect `Community 11` to `Community 0`, `Community 1`, `Community 2`, `Community 6`, `Community 12`, `Community 24`, `Community 26`, `Community 31`?**
  _High betweenness centrality (0.306) - this node is a cross-community bridge._
- **Why does `init()` connect `Community 5` to `Community 0`, `Community 1`, `Community 10`, `Community 20`, `Community 21`, `Community 26`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **Why does `round()` connect `Community 15` to `Community 0`, `Community 7`, `Community 10`, `Community 18`, `Community 23`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Are the 24 inferred relationships involving `callback()` (e.g. with `replaceTraps()` and `executeQuotaErrorCallbacks()`) actually correct?**
  _`callback()` has 24 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Test script for scientific fertilizer calculation Verifies nutrient balance meth`, `Test script for multi-fertilizer optimization Tests scoring, ranking, and compat`, `Test script untuk memverifikasi perhitungan rainfall dan net water requirement T` to the rest of the system?**
  _37 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.02 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.02 - nodes in this community are weakly interconnected._