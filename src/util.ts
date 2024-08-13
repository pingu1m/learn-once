// import { InvokeArgs, invoke } from "@tauri-apps/api/tauri";

import {invoke, InvokeArgs} from "@tauri-apps/api/core";

export const apiCall = async <T>(
  name: string,
  parameters?: InvokeArgs
): Promise<T> =>
  new Promise((resolve, reject) =>
    invoke(name, parameters)
      .then(resolve as (value: unknown) => PromiseLike<T>)
      .catch(reject)
  );

export const onlyUnique = <T>(value: T, index: number, array: T[]) =>
  array.indexOf(value) === index;
