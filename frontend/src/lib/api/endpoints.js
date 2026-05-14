export const endpoints = {
  auth: {
    login: () => `/api/auth/login`
  },
  entities: {
    list: () => `/api/entities`,
    byId: (id) => `/api/entities/${encodeURIComponent(id)}`,
    createGolden: () => `/api/entities/create-golden`,
    search: () => `/api/entities/search`
  },
  ingest: {
    ingest: () => `/api/ingest`,
    ingestUpload: () => `/api/ingest/upload`,
    ingestUrl: () => `/api/ingest/url`
  },
  match: {
    match: () => `/api/match`,
    merge: () => `/api/merge`
  },
  relationships: {
    list: () => `/api/relationships`,
    graph: () => `/api/graph`
  }
};
