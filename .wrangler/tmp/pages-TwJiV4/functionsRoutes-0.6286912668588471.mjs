import { onRequest as __api_provider_keys__id__index_ts_onRequest } from "D:\\nas_sync_folder\\椋鸟科技\\token_service\\token-service\\functions\\api\\provider-keys\\[id]\\index.ts"
import { onRequest as __api_providers__id__index_ts_onRequest } from "D:\\nas_sync_folder\\椋鸟科技\\token_service\\token-service\\functions\\api\\providers\\[id]\\index.ts"
import { onRequest as __api_provider_keys_index_ts_onRequest } from "D:\\nas_sync_folder\\椋鸟科技\\token_service\\token-service\\functions\\api\\provider-keys\\index.ts"
import { onRequest as __api_providers_index_ts_onRequest } from "D:\\nas_sync_folder\\椋鸟科技\\token_service\\token-service\\functions\\api\\providers\\index.ts"
import { onRequest as __api_seed_ts_onRequest } from "D:\\nas_sync_folder\\椋鸟科技\\token_service\\token-service\\functions\\api\\seed.ts"
import { onRequest as __api_users_index_ts_onRequest } from "D:\\nas_sync_folder\\椋鸟科技\\token_service\\token-service\\functions\\api\\users\\index.ts"

export const routes = [
    {
      routePath: "/api/provider-keys/:id",
      mountPath: "/api/provider-keys/:id",
      method: "",
      middlewares: [],
      modules: [__api_provider_keys__id__index_ts_onRequest],
    },
  {
      routePath: "/api/providers/:id",
      mountPath: "/api/providers/:id",
      method: "",
      middlewares: [],
      modules: [__api_providers__id__index_ts_onRequest],
    },
  {
      routePath: "/api/provider-keys",
      mountPath: "/api/provider-keys",
      method: "",
      middlewares: [],
      modules: [__api_provider_keys_index_ts_onRequest],
    },
  {
      routePath: "/api/providers",
      mountPath: "/api/providers",
      method: "",
      middlewares: [],
      modules: [__api_providers_index_ts_onRequest],
    },
  {
      routePath: "/api/seed",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_seed_ts_onRequest],
    },
  {
      routePath: "/api/users",
      mountPath: "/api/users",
      method: "",
      middlewares: [],
      modules: [__api_users_index_ts_onRequest],
    },
  ]