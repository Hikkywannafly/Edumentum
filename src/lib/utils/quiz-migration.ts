import { useQuizEditorStore } from "@/stores/quiz-editor-store";

/**
 * Migrate quiz data from localStorage to Zustand store
 * This function should be called once when the app starts
 */
export function migrateQuizDataFromLocalStorage() {
  try {
    const legacyData = localStorage.getItem("tempQuizData");
    if (legacyData) {
      const parsed = JSON.parse(legacyData);
      const { setQuizData } = useQuizEditorStore.getState();
      setQuizData(parsed);

      // Clean up legacy data
      localStorage.removeItem("tempQuizData");
      console.log("Migrated quiz data from localStorage to Zustand store");
    }
  } catch (error) {
    console.error("Error migrating quiz data:", error);
  }
}

/**
 * Clear all quiz-related data from localStorage
 */
export function clearLegacyQuizData() {
  try {
    localStorage.removeItem("tempQuizData");
    console.log("Cleared legacy quiz data from localStorage");
  } catch (error) {
    console.error("Error clearing legacy quiz data:", error);
  }
}
