export type JsonValue = string | number | boolean | null | JsonArray | JsonObject
export type JsonObject = { [key: string]: JsonValue }
export type JsonArray = JsonValue[]
export type Json = JsonArray | JsonObject
