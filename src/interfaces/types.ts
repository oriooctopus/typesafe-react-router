import { route } from "../route";
import { param } from "../param";

/*
   Copyright Avero, LLC
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
       http://www.apache.org/licenses/LICENSE-2.0
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */

export interface Route<
  Parts extends Array<PathPart<any>>,
  QueryParams extends string[] = []
> {
  template(): string;

  CreationParams: ParamsFromPathArray<Parts>;

  // create(
  //   params: ParamsFromPathArray<Parts> &
  //     Partial<{ query: Partial<Record<QueryParams[number], string>> }>,
  // ): string;
  create(params: ParamsFromPathArray<Parts>): string;

  withQueryParams: <T extends string[]>(
    ...params: T
  ) => Route<Parts, [QueryParams[number] | T[number]]>;

  parse(queryString: string): Partial<Record<QueryParams[number], string>>;
}

export interface PathParam<T extends string> {
  param: T;
  isOptional: boolean;
}

export type PathPart<T extends string> = string | PathParam<T>;

// export type ParamsFromPathArray<T extends Array<PathPart<any>>> = {
//   [K in keyof T]: T[K] extends PathParam<infer ParamName> & { isOptional: true }
//     ? ParamName
//     : never;
// };

type TupleToObject<T extends [any, any]> = {
  [key in T[0]]: Extract<T, [key, any]>[1];
};

/**
 * TODO:
 * So the way to avoid having to put in x: undefined on
 * params you don't want to supply is to basically run
 * this twice. The first one is like the one below (I
 * think, as long as the second one's merge overrides).
 * The second only returns tuples for the nullable
 * properties and therefore we can hardcode ? in there
 */
export type ParamsFromPathArray<T extends Array<PathPart<any>>> = TupleToObject<
  // @ts-expect-error will fix later
  {
    [K in keyof T]: T[K] extends PathParam<infer ParamName>
      ? T[K] extends PathParam<any>
        ? [ParamName, string | undefined]
        : [ParamName, string]
      : [];
  }[number]
>;

// Given the parameters of a route I want an object of { paramName: string }
// e.g. for const Route = route(['logbook', param('logbookId'), param('otherId')]);
// RouteParams<Route> = { logbookId: string, otherId: string }
export type RouteParams<T extends Route<any, any>> = T extends Route<
  infer X,
  any
>
  ? ParamsFromPathArray<X>
  : never;
