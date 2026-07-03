---
title: struct-api-controllers (Examples)
type: example
tags: structure, api, controllers
---

# Example: API Request Methods (Controllers)

This is an example of how the API method requests must be structured and grouped per API inside the `src/config/controllers/` directory.

## Example: `src/config/controllers/jotam-auto-partes-api.js`

```javascript
import { basePathConfig } from "../apiConnection";
import { JOTAM_AUTOPARTES_API_PATH } from "../environment";

const apiPath = JOTAM_AUTOPARTES_API_PATH || "/api";

export const GET_ARTICLE_LIST = {
  name: "GET_ARTICLE_LIST",
  method: async (params = {}) => {
    const response = await basePathConfig.get(`${apiPath}/article`, { params });
    return response.data;
  },
  response: {
    data: "content.records",
    count: "content.counts",
  },
};

export const ADD_ARTICLE = {
  name: "ADD_ARTICLE",
  method: async (data) => {
    const response = await basePathConfig.post(`${apiPath}/article`, data);
    return response.data;
  },
  response: {
    data: "content",
  },
};

export const FIND_ONE_ARTICLE = {
  name: "FIND_ONE_ARTICLE",
  method: async (id) => {
    const response = await basePathConfig.get(`${apiPath}/article/${id}`);
    return response.data;
  },
  response: {
    data: "content",
  },
};

export const UPDATE_ARTICLE = {
  name: "UPDATE_ARTICLE",
  method: async (id, data) => {
    const response = await basePathConfig.patch(
      `${apiPath}/article/${id}`,
      data,
    );
    return response.data;
  },
  response: {
    data: "content",
  },
};

export const REPLACE_ARTICLE = {
  name: "REPLACE_ARTICLE",
  method: async (id, data) => {
    const response = await basePathConfig.put(`${apiPath}/article/${id}`, data);
    return response.data;
  },
  response: {
    data: "content",
  },
};

export const REMOVE_ARTICLE = {
  name: "REMOVE_ARTICLE",
  method: async (id) => {
    const response = await basePathConfig.delete(`${apiPath}/article/${id}`);
    return response.data;
  },
  response: {
    data: "content",
  },
};

export default {
  GET_ARTICLE_LIST,
  ADD_ARTICLE,
  FIND_ONE_ARTICLE,
  UPDATE_ARTICLE,
  REPLACE_ARTICLE,
  REMOVE_ARTICLE,
};
```
