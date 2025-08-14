// import {
//   extractQuestionsWithAI,
//   generateQuestions,
//   generateQuestionsFromFile,
//   generateQuizTitleDescription,
// } from "@/lib/services/ai-llm.service";
// import type { FileForAI } from "@/lib/services/file-to-ai.service";
// import {
//   extractQuestionsFromContent,
// } from "@/lib/services/quiz-generate.service";
// import type { QuestionData, Language, ParsingMode } from "@/types/quiz";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { toast } from "sonner";

// // Query Keys for better cache management
// export const QUIZ_QUERY_KEYS = {
//   all: ['quiz'] as const,
//   generation: () => [...QUIZ_QUERY_KEYS.all, 'generation'] as const,
//   extraction: () => [...QUIZ_QUERY_KEYS.all, 'extraction'] as const,
//   titleDescription: (params: any) => [...QUIZ_QUERY_KEYS.all, 'title-description', params] as const,
//   generateQuestions: (params: any) => [...QUIZ_QUERY_KEYS.generation(), params] as const,
//   extractQuestions: (params: any) => [...QUIZ_QUERY_KEYS.extraction(), params] as const,
//   extractQuestionsAI: (params: any) => [...QUIZ_QUERY_KEYS.extraction(), 'ai', params] as const,
//   generateFromFile: (params: any) => [...QUIZ_QUERY_KEYS.generation(), 'file', params] as const,
// } as const;

// // Types for query parameters
// interface GenerateQuestionsParams {
//   questionHeader: string;
//   questionDescription: string;
//   apiKey: string;
//   fileContent?: string;
//   modelName?: string;
//   settings?: {
//     visibility?: string;
//     language?: string;
//     questionType?: string;
//     numberOfQuestions?: number;
//     mode?: string;
//     difficulty?: string;
//     task?: string;
//     parsingMode?: string;
//     promptOverride?: string;
//     includeCategories?: boolean;
//   };
// }

// interface ExtractQuestionsParams {
//   fileContent: string;
//   settings?: {
//     language?: Language;
//     parsingMode?: ParsingMode;
//     fileProcessingMode?: "PARSE_THEN_SEND" | "SEND_DIRECT";
//   };
// }

// interface ExtractQuestionsAIParams extends GenerateQuestionsParams {
//   useMultiAgent?: boolean;
//   file?: FileForAI;
// }

// interface GenerateFromFileParams extends GenerateQuestionsParams {
//   useMultiAgent?: boolean;
//   file: FileForAI;
// }

// interface TitleDescriptionParams {
//   content: string;
//   questions: QuestionData[];
//   isExtractMode: boolean;
//   targetLanguage?: string;
//   filename?: string;
//   category?: string;
//   tags?: string[];
//   modelName?: string;
// }

// // Optimized Query Hooks with caching

// /**
//  * Query for generating questions with AI - cached and optimized
//  */
// export function useGenerateQuestionsQuery(
//   params: GenerateQuestionsParams,
//   options?: {
//     enabled?: boolean;
//     staleTime?: number;
//     gcTime?: number;
//   }
// ) {
//   return useQuery({
//     queryKey: QUIZ_QUERY_KEYS.generateQuestions(params),
//     queryFn: async () => {
//       const result = await generateQuestions(params);
//       if (!result.success || !result.questions) {
//         throw new Error(result.error || "Failed to generate questions");
//       }
//       return result.questions;
//     },
//     enabled: options?.enabled ?? false, // Manual trigger by default
//     staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
//     gcTime: options?.gcTime ?? 10 * 60 * 1000, // 10 minutes
//     retry: 2,
//   });
// }

// /**
//  * Query for extracting questions from content (direct parsing)
//  */
// export function useExtractQuestionsQuery(
//   params: ExtractQuestionsParams,
//   options?: {
//     enabled?: boolean;
//     staleTime?: number;
//     gcTime?: number;
//   }
// ) {
//   return useQuery({
//     queryKey: QUIZ_QUERY_KEYS.extractQuestions(params),
//     queryFn: async () => {
//       return await extractQuestionsFromContent(
//         params.fileContent,
//         params.settings
//       );
//     },
//     enabled: options?.enabled ?? false,
//     staleTime: options?.staleTime ?? 10 * 60 * 1000, // 10 minutes (content parsing is deterministic)
//     gcTime: options?.gcTime ?? 30 * 60 * 1000, // 30 minutes
//     retry: 1, // Less retry for parsing errors
//   });
// }

// /**
//  * Query for extracting questions with AI
//  */
// export function useExtractQuestionsAIQuery(
//   params: ExtractQuestionsAIParams,
//   options?: {
//     enabled?: boolean;
//     staleTime?: number;
//     gcTime?: number;
//   }
// ) {
//   return useQuery({
//     queryKey: QUIZ_QUERY_KEYS.extractQuestionsAI(params),
//     queryFn: async () => {
//       const result = await extractQuestionsWithAI(params);
//       if (!result.success || !result.questions) {
//         throw new Error(result.error || "Failed to extract questions with AI");
//       }
//       return result.questions;
//     },
//     enabled: options?.enabled ?? false,
//     staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
//     gcTime: options?.gcTime ?? 15 * 60 * 1000, // 15 minutes
//     retry: 2,
//   });
// }

// /**
//  * Query for generating questions from file
//  */
// export function useGenerateFromFileQuery(
//   params: GenerateFromFileParams,
//   options?: {
//     enabled?: boolean;
//     staleTime?: number;
//     gcTime?: number;
//   }
// ) {
//   return useQuery({
//     queryKey: QUIZ_QUERY_KEYS.generateFromFile(params),
//     queryFn: async () => {
//       const result = await generateQuestionsFromFile(params);
//       if (!result.success || !result.questions) {
//         throw new Error(result.error || "Failed to generate questions from file");
//       }
//       return result.questions;
//     },
//     enabled: options?.enabled ?? false,
//     staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
//     gcTime: options?.gcTime ?? 15 * 60 * 1000, // 15 minutes
//     retry: 2,
//   });
// }

// /**
//  * Query for generating title and description
//  */
// export function useTitleDescriptionQuery(
//   params: TitleDescriptionParams,
//   options?: {
//     enabled?: boolean;
//     staleTime?: number;
//     gcTime?: number;
//   }
// ) {
//   return useQuery({
//     queryKey: QUIZ_QUERY_KEYS.titleDescription(params),
//     queryFn: async () => {
//       const result = await generateQuizTitleDescription(params);
//       if (!result.success || !result.title || !result.description) {
//         throw new Error(
//           result.error || "Failed to generate title and description"
//         );
//       }
//       return { title: result.title, description: result.description };
//     },
//     enabled: options?.enabled ?? false,
//     staleTime: options?.staleTime ?? 15 * 60 * 1000, // 15 minutes
//     gcTime: options?.gcTime ?? 30 * 60 * 1000, // 30 minutes
//     retry: 1,
//   });
// }

// // Optimized Mutation Hooks for actions

// /**
//  * Mutation for triggering question generation with cache invalidation
//  */
// export function useGenerateQuestionsMutation() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationKey: ["generate-questions-trigger"],
//     mutationFn: async (params: GenerateQuestionsParams) => {
//       // Invalidate existing cache for this query
//       await queryClient.invalidateQueries({
//         queryKey: QUIZ_QUERY_KEYS.generateQuestions(params),
//       });

//       // Fetch fresh data
//       return await queryClient.fetchQuery({
//         queryKey: QUIZ_QUERY_KEYS.generateQuestions(params),
//         queryFn: async () => {
//           const result = await generateQuestions(params);
//           if (!result.success || !result.questions) {
//             throw new Error(result.error || "Failed to generate questions");
//           }
//           return result.questions;
//         },
//         staleTime: 5 * 60 * 1000,
//       });
//     },
//     onSuccess: (data, variables) => {
//       // Update cache with fresh data
//       queryClient.setQueryData(
//         QUIZ_QUERY_KEYS.generateQuestions(variables),
//         data
//       );
//       toast.success(`Generated ${data.length} questions successfully!`);
//     },
//     onError: (error: any) => {
//       toast.error("Generate questions failed:", error.message);
//     },
//   });
// }

// /**
//  * Mutation for triggering question extraction with cache invalidation
//  */
// export function useExtractQuestionsMutation() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationKey: ["extract-questions-trigger"],
//     mutationFn: async (params: ExtractQuestionsParams) => {
//       // Invalidate existing cache
//       await queryClient.invalidateQueries({
//         queryKey: QUIZ_QUERY_KEYS.extractQuestions(params),
//       });

//       // Fetch fresh data
//       return await queryClient.fetchQuery({
//         queryKey: QUIZ_QUERY_KEYS.extractQuestions(params),
//         queryFn: async () => {
//           return await extractQuestionsFromContent(
//             params.fileContent,
//             params.settings as any
//           );
//         },
//         staleTime: 10 * 60 * 1000,
//       });
//     },
//     onSuccess: (data, variables) => {
//       queryClient.setQueryData(
//         QUIZ_QUERY_KEYS.extractQuestions(variables),
//         data
//       );
//       toast.success(`Extracted ${data.length} questions successfully!`);
//     },
//     onError: (error: any) => {
//       toast.error("Extract questions failed:", error.message);
//     },
//   });
// }

// /**
//  * Mutation for triggering AI extraction with cache invalidation
//  */
// export function useExtractQuestionsAIMutation() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationKey: ["extract-questions-ai-trigger"],
//     mutationFn: async (params: ExtractQuestionsAIParams) => {
//       await queryClient.invalidateQueries({
//         queryKey: QUIZ_QUERY_KEYS.extractQuestionsAI(params),
//       });

//       return await queryClient.fetchQuery({
//         queryKey: QUIZ_QUERY_KEYS.extractQuestionsAI(params),
//         queryFn: async () => {
//           const result = await extractQuestionsWithAI(params);
//           if (!result.success || !result.questions) {
//             throw new Error(result.error || "Failed to extract questions with AI");
//           }
//           return result.questions;
//         },
//         staleTime: 5 * 60 * 1000,
//       });
//     },
//     onSuccess: (data, variables) => {
//       queryClient.setQueryData(
//         QUIZ_QUERY_KEYS.extractQuestionsAI(variables),
//         data
//       );
//       toast.success(`Extracted ${data.length} questions with AI successfully!`);
//     },
//     onError: (error: any) => {
//       toast.error("Extract questions with AI failed:", error.message);
//     },
//   });
// }

// /**
//  * Mutation for generating questions from file
//  */
// export function useGenerateFromFileMutation() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationKey: ["generate-from-file-trigger"],
//     mutationFn: async (params: GenerateFromFileParams) => {
//       await queryClient.invalidateQueries({
//         queryKey: QUIZ_QUERY_KEYS.generateFromFile(params),
//       });

//       return await queryClient.fetchQuery({
//         queryKey: QUIZ_QUERY_KEYS.generateFromFile(params),
//         queryFn: async () => {
//           const result = await generateQuestionsFromFile(params);
//           if (!result.success || !result.questions) {
//             throw new Error(result.error || "Failed to generate questions from file");
//           }
//           return result.questions;
//         },
//         staleTime: 5 * 60 * 1000,
//       });
//     },
//     onSuccess: (data, variables) => {
//       queryClient.setQueryData(
//         QUIZ_QUERY_KEYS.generateFromFile(variables),
//         data
//       );
//       toast.success(`Generated ${data.length} questions from file successfully!`);
//     },
//     onError: (error: any) => {
//       toast.error("Generate questions from file failed:", error.message);
//     },
//   });
// }

// /**
//  * Mutation for generating title and description
//  */
// export function useTitleDescriptionMutation() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationKey: ["title-description-trigger"],
//     mutationFn: async (params: TitleDescriptionParams) => {
//       await queryClient.invalidateQueries({
//         queryKey: QUIZ_QUERY_KEYS.titleDescription(params),
//       });

//       return await queryClient.fetchQuery({
//         queryKey: QUIZ_QUERY_KEYS.titleDescription(params),
//         queryFn: async () => {
//           const result = await generateQuizTitleDescription(params);
//           if (!result.success || !result.title || !result.description) {
//             throw new Error(
//               result.error || "Failed to generate title and description"
//             );
//           }
//           return { title: result.title, description: result.description };
//         },
//         staleTime: 15 * 60 * 1000,
//       });
//     },
//     onSuccess: (data, variables) => {
//       queryClient.setQueryData(
//         QUIZ_QUERY_KEYS.titleDescription(variables),
//         data
//       );
//       toast.success("Generated title and description successfully!");
//     },
//     onError: (error: any) => {
//       toast.error("Generate title and description failed:", error.message);
//     },
//   });
// }

// // Utility hooks for cache management

// /**
//  * Hook to prefetch quiz generation data
//  */
// export function usePrefetchQuizGeneration() {
//   const queryClient = useQueryClient();

//   return {
//     prefetchGeneration: (params: GenerateQuestionsParams) => {
//       return queryClient.prefetchQuery({
//         queryKey: QUIZ_QUERY_KEYS.generateQuestions(params),
//         queryFn: async () => {
//           const result = await generateQuestions(params);
//           if (!result.success || !result.questions) {
//             throw new Error(result.error || "Failed to generate questions");
//           }
//           return result.questions;
//         },
//         staleTime: 5 * 60 * 1000,
//       });
//     },
//     prefetchExtraction: (params: ExtractQuestionsParams) => {
//       return queryClient.prefetchQuery({
//         queryKey: QUIZ_QUERY_KEYS.extractQuestions(params),
//         queryFn: async () => {
//           return await extractQuestionsFromContent(
//             params.fileContent,
//             params.settings
//           );
//         },
//         staleTime: 10 * 60 * 1000,
//       });
//     },
//   };
// }

// /**
//  * Hook to invalidate all quiz-related caches
//  */
// export function useInvalidateQuizCache() {
//   const queryClient = useQueryClient();

//   return {
//     invalidateAll: () => {
//       return queryClient.invalidateQueries({
//         queryKey: QUIZ_QUERY_KEYS.all,
//       });
//     },
//     invalidateGeneration: () => {
//       return queryClient.invalidateQueries({
//         queryKey: QUIZ_QUERY_KEYS.generation(),
//       });
//     },
//     invalidateExtraction: () => {
//       return queryClient.invalidateQueries({
//         queryKey: QUIZ_QUERY_KEYS.extraction(),
//       });
//     },
//   };
// }
