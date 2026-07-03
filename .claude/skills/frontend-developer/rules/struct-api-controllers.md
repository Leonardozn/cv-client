---
title: struct-api-controllers
impact: CRITICAL
impactDescription: Ensures components remain agnostic of the origin of data and promotes flexibility for API requests.
tags: structure, api, controllers
---

# API Controllers Structure

This rule defines how API requests should be structured and where they should be documented in the framework. This approach ensures components remain agnostic of the origin of data and promotes flexibility, especially when components like auto-generated Forms rely on declarative configurations to map data.

## 1. Directory Location

All grouping of API requests (endpoints/services) must be located in `src/config/controllers/`. Each API server/provider must have its own dedicated file. E.g. `jotam-auto-partes-api.js`, `google-maps-api.js`, etc.

## 2. Default Configuration Import

Every controller file should import the main project API connection configurator. For instance `basePathConfig` and environment variables.

## 3. Standard Object Structure (Name & Method)

Every API request or endpoint operation must be exported as an object that contains:

1. `name`: A strictly uppercase string indicating the name of the operation (e.g., `'GET_ARTICLE_LIST'`).
2. `method`: An async function that resolves the request data (typically using axios, fetch, or basePathConfig). It must return the actual payload/data (e.g. `response.data`).
3. `response`: An optional configuration object defining the internal paths to key data in the response payload. Use dot-notation strings.
   - `data`: The path to the main data (e.g., `"content.records"` for lists, or `"content"` for single objects).
   - `count`: (Optional) The path to the total numeric count of records (e.g., `"content.counts"`).

## 4. Export Pattern

You must use both **named exports** (for specific, individual usage) and a **default export** containing the dictionary of all these objects.

The `default export` is crucial because it allows dynamic components (like the `<Form />`) to consume the method simply by referencing the `name` string from a configuration file.

## 5. Send Params in GET requests

When sending parameters for a `GET` method in Axios (typically used for "list" requests), we must wrap them inside a `params` object containing special keys understood downstream by the backend such as `query`, `virtuals`, `relations`, `size`, `page` and `sort`.

**Reference Example:** Review `--/examples/list-method-params.js` to see a detailed breakdown of how to construct exact filters, advanced operators, pagination, and sorting for list requests in the frontend.

## ❌ Incorrect Example

```javascript
// This is bad because it's hardcoded without uniform return or structure,
// makes it hard to use dynamically and doesn't export a dictionary.

import axios from "axios";

export const getArticles = async () => {
  const res = await axios.get("/api/article");
  return res;
};

export const addArticle = async (data) => {
  const res = await axios.post("/api/article", data);
  return res;
};
```

## ✅ Correct Example

See the example file: `../examples/struct-api-controllers.md`

```javascript
import { basePathConfig } from "../apiConnection";
import { MY_API_PATH } from "../environment";

const apiPath = MY_API_PATH || "/api";

export const GET_ARTICLE_LIST = {
  name: "GET_ARTICLE_LIST",
  method: async (params = {}) => {
    const response = await basePathConfig.get(`${apiPath}/article`, { params });
    return response.data;
  },
};

export default {
  GET_ARTICLE_LIST,
};
```
