/**
 * Copyright 2022 The MediaPipe Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Placeholder for internal dependency on trusted resource URL builder

import {WasmFileset} from './wasm_fileset';

let supportsSimd: boolean|undefined;

/**
 * Simple WASM program to test compatibility with the M91 instruction set.
 * Compiled from
 * https://github.com/GoogleChromeLabs/wasm-feature-detect/blob/main/src/detectors/simd/module.wat
 */
const WASM_SIMD_CHECK = new Uint8Array([
  0, 97, 115, 109, 1,  0, 0, 0, 1,  5, 1,   96, 0,   1,  123, 3,
  2, 1,  0,   10,  10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11
]);

async function isSimdSupported(): Promise<boolean> {
  if (supportsSimd === undefined) {
    try {
      await WebAssembly.instantiate(WASM_SIMD_CHECK);
      supportsSimd = true;
    } catch {
      supportsSimd = false;
    }
  }

  return supportsSimd;
}

async function createFileset(
    taskName: string, basePath: string = '.'): Promise<WasmFileset> {
  if (await isSimdSupported()) {
    return {
      wasmLoaderPath:
          `${basePath}/${taskName}_wasm_internal.js`,
      wasmBinaryPath:
          `${basePath}/${taskName}_wasm_internal.wasm`,
    };
  } else {
    return {
      wasmLoaderPath:
          `${basePath}/${taskName}_wasm_nosimd_internal.js`,
      wasmBinaryPath:
          `${basePath}/${taskName}_wasm_nosimd_internal.wasm`,
    };
  }
}

// tslint:disable:class-as-namespace

/**
 * Resolves the files required for the MediaPipe Task APIs.
 *
 * This class verifies whether SIMD is supported in the current environment and
 * loads the SIMD files only if support is detected. The returned filesets
 * require that the Wasm files are published without renaming. If this is not
 * possible, you can invoke the MediaPipe Tasks APIs using a manually created
 * `WasmFileset`.
 */
export class FilesetResolver {
  /**
   * Returns whether SIMD is supported in the current environment.
   *
   * If your environment requires custom locations for the MediaPipe Wasm files,
   * you can use `isSimdSupported()` to decide whether to load the SIMD-based
   * assets.
   *
   * @return Whether SIMD support was detected in the current environment.
   */
  static isSimdSupported(): Promise<boolean> {
    return isSimdSupported();
  }

  /**
   * Creates a fileset for the MediaPipe Audio tasks.
   *
   * @param basePath An optional base path to specify the directory the Wasm
   *    files should be loaded from. If not specified, the Wasm files are
   *    loaded from the host's root directory.
   * @return A `WasmFileset` that can be used to initialize MediaPipe Audio
   *    tasks.
   */
  static forAudioTasks(basePath?: string): Promise<WasmFileset> {
    return createFileset('audio', basePath);
  }

  /**
   * Creates a fileset for the MediaPipe Text tasks.
   *
   * @param basePath An optional base path to specify the directory the Wasm
   *    files should be loaded from. If not specified, the Wasm files are
   *    loaded from the host's root directory.
   * @return A `WasmFileset` that can be used to initialize MediaPipe Text
   *    tasks.
   */
  static forTextTasks(basePath?: string): Promise<WasmFileset> {
    return createFileset('text', basePath);
  }

  /**
   * Creates a fileset for the MediaPipe Vision tasks.
   *
   * @param basePath An optional base path to specify the directory the Wasm
   *    files should be loaded from. If not specified, the Wasm files are
   *    loaded from the host's root directory.
   * @return A `WasmFileset` that can be used to initialize MediaPipe Vision
   *    tasks.
   */
  static forVisionTasks(basePath?: string): Promise<WasmFileset> {
    return createFileset('vision', basePath);
  }
}


