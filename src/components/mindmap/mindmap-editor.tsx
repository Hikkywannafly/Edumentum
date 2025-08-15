"use client";
import { Button } from "@/components/ui/button";
import type { FileProps, MindMapType } from "@/lib/api/mindmap";
import { useMindmapStore } from "@/stores/mindmap";
import { Edit, Save, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ExitConfirmationDialog from "./exit-confirmation-dialog";
import Mindmap from "./mindmap";
import SaveMindmapDialog from "./save-mindmap-dialog";

type MindmapEditorProps = {
  initialFile?: FileProps | null;
  mindmapId?: string;
  onClose?: () => void;
};

const MindmapEditor = ({
  initialFile,
  mindmapId,
  onClose,
}: MindmapEditorProps) => {
  const t = useTranslations("Mindmap");
  const router = useRouter();
  const pathname = usePathname();
  const {
    createFile,
    updateFile,
    setMindmapCurrentFile,
    setOnDataChange,
    loadFile,
    mindmapCurrentFile,
  } = useMindmapStore();

  const [selectedFile, setSelectedFile] = useState<FileProps | null>(
    () => initialFile || null,
  );
  const [showSaveMindmapDialog, setShowSaveMindmapDialog] = useState(false);
  const [showEditNameDialog, setShowEditNameDialog] = useState(false);
  const [showExitConfirmationDialog, setShowExitConfirmationDialog] =
    useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load mindmap by ID if provided
  useEffect(() => {
    const loadMindmapById = async () => {
      if (mindmapId && !initialFile) {
        try {
          await loadFile(mindmapId);
          // The loadFile function will set mindmapCurrentFile in the store
        } catch (error) {
          console.error("Error loading mindmap:", error);
          toast.error(t("editor.loadError"));
        }
      }
    };

    loadMindmapById();
  }, [mindmapId, initialFile, loadFile, t]);

  // Get current file from store and update selectedFile
  useEffect(() => {
    if (mindmapCurrentFile && mindmapId && !initialFile) {
      setSelectedFile(mindmapCurrentFile);
    }
  }, [mindmapCurrentFile, mindmapId, initialFile]);

  useEffect(() => {
    setOnDataChange(() => setHasUnsavedChanges(true));
  }, [setOnDataChange]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleExitEditor = () => {
    setHasUnsavedChanges(false);
    localStorage.removeItem("mindmap-current-file");

    // If we have an onClose callback, use it (for inline editor)
    // Otherwise, navigate back to mindmap list with proper locale (for page-based editor)
    if (onClose) {
      onClose();
    } else {
      // Extract locale from current pathname and navigate back to mindmap list
      const locale = pathname.split("/")[1]; // Get locale from path like /vi/mindmap/...
      const mindmapPath = locale ? `/${locale}/mindmap` : "/mindmap";
      router.push(mindmapPath);
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center justify-between border-b bg-background p-4 dark:border-border">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              if (hasUnsavedChanges) {
                setShowExitConfirmationDialog(true);
              } else {
                handleExitEditor();
              }
            }}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            {t("editor.backToList")}
          </Button>
          <h2 className="font-semibold text-lg">
            {selectedFile ? selectedFile.name : t("editor.newMindmap")}
          </h2>
          {selectedFile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEditNameDialog(true)}
              className="h-8 w-8 p-0"
              title={t("editor.editName")}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">{t("editor.editName")}</span>
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={async () => {
              if (selectedFile) {
                try {
                  const data = {
                    nodes: useMindmapStore.getState().mindmapNodes,
                    edges: useMindmapStore.getState().mindmapEdges,
                    viewport: { x: 0, y: 0, zoom: 1 },
                  };
                  await updateFile(selectedFile.id, {
                    ...data,
                    name: selectedFile.name,
                  } as any);
                  setHasUnsavedChanges(false);
                  toast.success(t("editor.saveSuccess"));
                } catch (error) {
                  console.error("Error saving mindmap:", error);
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : t("editor.saveError"),
                  );
                }
              } else {
                setShowSaveMindmapDialog(true);
              }
            }}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {t("editor.save")}
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <Mindmap />
      </div>

      <SaveMindmapDialog
        isOpen={showSaveMindmapDialog}
        onClose={() => setShowSaveMindmapDialog(false)}
        onSave={async (name: string, type: MindMapType) => {
          try {
            const data = {
              nodes: useMindmapStore.getState().mindmapNodes,
              edges: useMindmapStore.getState().mindmapEdges,
              viewport: { x: 0, y: 0, zoom: 1 },
            };

            const newFile = await createFile(name, data, type);
            setSelectedFile(newFile);
            setMindmapCurrentFile(newFile);
            setHasUnsavedChanges(false);
            toast.success(t("editor.saveSuccess"));
          } catch (error) {
            console.error("Error saving mindmap:", error);
            toast.error(
              error instanceof Error ? error.message : t("editor.saveError"),
            );
          }
        }}
        currentName=""
        currentType="STUDY_NOTES"
        isEditing={false}
      />

      <ExitConfirmationDialog
        isOpen={showExitConfirmationDialog}
        onClose={() => setShowExitConfirmationDialog(false)}
        onSave={async () => {
          try {
            if (selectedFile) {
              const data = {
                nodes: useMindmapStore.getState().mindmapNodes,
                edges: useMindmapStore.getState().mindmapEdges,
                viewport: { x: 0, y: 0, zoom: 1 },
              };
              await updateFile(selectedFile.id, data);
              setHasUnsavedChanges(false);
              setShowExitConfirmationDialog(false);
              handleExitEditor();
              toast.success(t("editor.saveSuccess"));
            } else {
              setShowSaveMindmapDialog(true);
              setShowExitConfirmationDialog(false);
            }
          } catch (error) {
            console.error("Error saving mindmap:", error);
            toast.error(
              error instanceof Error ? error.message : t("editor.saveError"),
            );
          }
        }}
        onDiscard={() => {
          handleExitEditor();
          setShowExitConfirmationDialog(false);
        }}
      />

      <SaveMindmapDialog
        isOpen={showEditNameDialog}
        onClose={() => setShowEditNameDialog(false)}
        onSave={async (newName: string, newType: MindMapType) => {
          try {
            if (selectedFile) {
              // Use updateFile to update both name and type
              const data = {
                nodes: useMindmapStore.getState().mindmapNodes,
                edges: useMindmapStore.getState().mindmapEdges,
                viewport: { x: 0, y: 0, zoom: 1 },
              };

              await updateFile(selectedFile.id, {
                name: newName,
                data: JSON.stringify(data),
                type: newType,
              });

              const updatedFile = {
                ...selectedFile,
                name: newName,
                type: newType,
              };
              setSelectedFile(updatedFile);
              setMindmapCurrentFile(updatedFile);

              // Update the file in the store
              const { mindmapFiles } = useMindmapStore.getState();
              const updatedFiles = mindmapFiles.map((file) =>
                file.id === selectedFile.id ? updatedFile : file,
              );
              useMindmapStore.setState({ mindmapFiles: updatedFiles });

              toast.success(t("editor.nameUpdateSuccess"));
            }
          } catch (error) {
            console.error("Error updating name:", error);
            toast.error(
              error instanceof Error
                ? error.message
                : t("editor.nameUpdateError"),
            );
          }
        }}
        currentName={selectedFile?.name || ""}
        currentType={selectedFile?.type || "STUDY_NOTES"}
        isEditing={true}
      />
    </div>
  );
};

export default MindmapEditor;
