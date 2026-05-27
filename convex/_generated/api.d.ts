/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as channelCanvas from "../channelCanvas.js";
import type * as channelChat from "../channelChat.js";
import type * as channels from "../channels.js";
import type * as email from "../email.js";
import type * as handles from "../handles.js";
import type * as http from "../http.js";
import type * as invites from "../invites.js";
import type * as lib_workspaceAuth from "../lib/workspaceAuth.js";
import type * as upload from "../upload.js";
import type * as users from "../users.js";
import type * as workspaces from "../workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  channelCanvas: typeof channelCanvas;
  channelChat: typeof channelChat;
  channels: typeof channels;
  email: typeof email;
  handles: typeof handles;
  http: typeof http;
  invites: typeof invites;
  "lib/workspaceAuth": typeof lib_workspaceAuth;
  upload: typeof upload;
  users: typeof users;
  workspaces: typeof workspaces;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
