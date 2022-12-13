// Copyright 2022 The MediaPipe Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.mediapipe.tasks.vision.objectdetector;

import android.graphics.RectF;
import com.google.auto.value.AutoValue;
import com.google.mediapipe.tasks.components.containers.Category;
import com.google.mediapipe.tasks.core.TaskResult;
import com.google.mediapipe.formats.proto.DetectionProto.Detection;
import com.google.mediapipe.formats.proto.LocationDataProto.LocationData.BoundingBox;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/** Represents the detection results generated by {@link ObjectDetector}. */
@AutoValue
public abstract class ObjectDetectionResult implements TaskResult {
  private static final int DEFAULT_CATEGORY_INDEX = -1;

  @Override
  public abstract long timestampMs();

  public abstract List<com.google.mediapipe.tasks.components.containers.Detection> detections();

  /**
   * Creates an {@link ObjectDetectionResult} instance from a list of {@link Detection} protobuf
   * messages.
   *
   * @param detectionList a list of {@link DetectionOuterClass.Detection} protobuf messages.
   * @param timestampMs a timestamp for this result.
   */
  static ObjectDetectionResult create(List<Detection> detectionList, long timestampMs) {
    List<com.google.mediapipe.tasks.components.containers.Detection> detections = new ArrayList<>();
    for (Detection detectionProto : detectionList) {
      List<Category> categories = new ArrayList<>();
      for (int idx = 0; idx < detectionProto.getScoreCount(); ++idx) {
        categories.add(
            Category.create(
                detectionProto.getScore(idx),
                detectionProto.getLabelIdCount() > idx
                    ? detectionProto.getLabelId(idx)
                    : DEFAULT_CATEGORY_INDEX,
                detectionProto.getLabelCount() > idx ? detectionProto.getLabel(idx) : "",
                detectionProto.getDisplayNameCount() > idx
                    ? detectionProto.getDisplayName(idx)
                    : ""));
      }
      RectF boundingBox = new RectF();
      if (detectionProto.getLocationData().hasBoundingBox()) {
        BoundingBox boundingBoxProto = detectionProto.getLocationData().getBoundingBox();
        boundingBox.set(
            /*left=*/ boundingBoxProto.getXmin(),
            /*top=*/ boundingBoxProto.getYmin(),
            /*right=*/ boundingBoxProto.getXmin() + boundingBoxProto.getWidth(),
            /*bottom=*/ boundingBoxProto.getYmin() + boundingBoxProto.getHeight());
      }
      detections.add(
          com.google.mediapipe.tasks.components.containers.Detection.create(
              categories, boundingBox));
    }
    return new AutoValue_ObjectDetectionResult(
        timestampMs, Collections.unmodifiableList(detections));
  }
}
