export const endpoints = {
  entities: {
    list: () => `/api/entities`,
    byId: (id) => `/api/entities/${encodeURIComponent(id)}`,
    createGolden: () => `/api/entities/create-golden`
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
    relationships: () => `/api/relationships/relationships`,
    graph: () => `/api/relationships/graph`
  }
};
