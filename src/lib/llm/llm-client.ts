// import axios, { type AxiosInstance } from "axios";

// export type Provider = "openai" | "groq" | "openrouter" | "lmstudio" | "ollama" | "custom";

// export const PROVIDER_BASE: Record<Provider, string> = {
//   openai: "https://api.openai.com/v1",
//   groq: "https://api.groq.com/openai/v1",
//   openrouter: "https://openrouter.ai/api/v1",
//   lmstudio: "http://127.0.0.1:1234/v1",
//   ollama: "http://127.0.0.1:11434/v1",
//   custom: "",
// };

// export interface ChatParams {
//   provider: Provider;
//   model: string;
//   apiKey?: string; // not required for local
//   baseURL?: string; // optional override
//   messages: { role: "system" | "user" | "assistant"; content: any }[];
//   temperature?: number;
//   max_tokens?: number;
//   response_format_json?: boolean; // tries to force json if provider supports it
// }

// export interface ChatWithFileParams extends Omit<ChatParams, "messages"> {
//   // Send text + file-like content (vision or doc). If provider unsupported → throw.
//   // For images: pass dataUrl (data:mime;base64,xxx) or http(s) url.
//   prompt: string;
//   attachments: Array<
//     | { kind: "image"; dataUrl: string }
//     | { kind: "doc"; fileName: string; mimeType: string; base64: string }
//   >;
// }

// const clients = new Map<string, AxiosInstance>();

// export function createClient(provider: Provider, apiKey?: string, baseURL?: string): AxiosInstance {
//   const key = `${provider}|${(baseURL || "").slice(0, 32)}|${(apiKey || "").slice(0, 8)}`;
//   if (clients.has(key)) return clients.get(key)!;

//   const url = baseURL || PROVIDER_BASE[provider];
//   const headers: Record<string, string> = { "Content-Type": "application/json" };

//   if (provider === "openai" || provider === "groq" || provider === "openrouter") {
//     if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
//   }
//   if (provider === "openrouter") {
//     headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_APP_URL || "http://localhost";
//     headers["X-Title"] = "QuizGen";
//   }

//   const client = axios.create({ baseURL: url, timeout: 90_000, headers, maxRedirects: 0, validateStatus: s => s < 500 });
//   clients.set(key, client);
//   return client;
// }

// export function supportsVision(provider: Provider, model: string): boolean {
//   // Keep conservative: only OpenAI 4o/4.1 reliably supports mixed content here.
//   if (provider === "openai") return /gpt-4o|gpt-4\.1|o3|omni/i.test(model);
//   // Some OpenRouter routes may proxy OpenAI/Gemini vision, but it's volatile.
//   return false;
// }

// export async function chat(params: ChatParams): Promise<string> {
//   const { provider, model, apiKey, baseURL, messages, temperature = 0, max_tokens = 1800, response_format_json } = params;
//   const client = createClient(provider, apiKey, baseURL);
//   const body: any = { model, messages, temperature, max_tokens };
//   if (response_format_json) body.response_format = { type: "json_object" };

//   const res = await client.post("/chat/completions", body);
//   if (res.status >= 400) {
//     const msg = res.data?.error?.message || res.statusText;
//     throw new Error(`${res.status} ${msg}`);
//   }
//   const text = res.data?.choices?.[0]?.message?.content;
//   if (!text) throw new Error("Empty response from model");
//   return text;
// }

// export async function chatWithFile(params: ChatWithFileParams): Promise<string> {
//   const { provider, model, apiKey, baseURL, prompt, attachments, temperature = 0, max_tokens = 1800, response_format_json } = params;
//   if (!supportsVision(provider, model)) {
//     throw new Error("This provider/model does not support direct file/vision input. Parse to text first.");
//   }
//   const client = createClient(provider, apiKey, baseURL);

//   const content: any[] = [{ type: "text", text: prompt }];
//   for (const att of attachments) {
//     if (att.kind === "image") {
//       content.push({ type: "image_url", image_url: { url: att.dataUrl } });
//     } else {
//       content.push({ type: "text", text: `File: ${att.fileName} (${att.mimeType})\nBase64: data:${att.mimeType};base64,${att.base64}` });
//     }
//   }

//   const body: any = { model, messages: [{ role: "user", content }], temperature, max_tokens };
//   if (response_format_json) body.response_format = { type: "json_object" };

//   const res = await client.post("/chat/completions", body);
//   if (res.status >= 400) {
//     const msg = res.data?.error?.message || res.statusText;
//     throw new Error(`${res.status} ${msg}`);
//   }
//   const text = res.data?.choices?.[0]?.message?.content;
//   if (!text) throw new Error("Empty response from model");
//   return text;
// }

// export const PRESETS = {
//   openai: {
//     cheap: "gpt-4o-mini",
//     vision: "gpt-4o-mini",
//   },
//   groq: {
//     cheap: "llama-3.1-8b-instant",
//   },
//   openrouter: {
//     cheap: "qwen/qwen-2.5-14b-instruct:free", // route may change
//   },
//   lmstudio: {
//     cheap: "qwen2.5-7b-instruct",
//   },
//   ollama: {
//     cheap: "llama3.1:8b-instruct", // ensure model pulled in Ollama
//   },
// } as const;
