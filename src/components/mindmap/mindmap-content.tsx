"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import type { FileProps, MindMapType } from "@/lib/api/mindmap";
import { mindmapAPI } from "@/lib/api/mindmap";
import { DEFAULT_ROOT_NODE, useMindmapStore } from "@/stores/mindmap";
import {
  Edit,
  FileText,
  Filter,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ExitConfirmationDialog from "./exit-confirmation-dialog";
import Mindmap from "./mindmap";
import SaveMindmapDialog from "./save-mindmap-dialog";

const MINDMAP_TYPES: { value: MindMapType; label: string; labelVi: string }[] =
  [
    { value: "STUDY_NOTES", label: "Study Notes", labelVi: "Ghi chú học tập" },
    {
      value: "PROJECT_PLANNING",
      label: "Project Planning",
      labelVi: "Lập kế hoạch dự án",
    },
    {
      value: "CONCEPT_MAPPING",
      label: "Concept Mapping",
      labelVi: "Sơ đồ khái niệm",
    },
    {
      value: "BRAINSTORMING",
      label: "Brainstorming",
      labelVi: "Brainstorming",
    },
    {
      value: "LESSON_PLAN",
      label: "Lesson Plan",
      labelVi: "Kế hoạch bài giảng",
    },
    { value: "RESEARCH", label: "Research", labelVi: "Nghiên cứu" },
    { value: "PRESENTATION", label: "Presentation", labelVi: "Thuyết trình" },
    { value: "PERSONAL", label: "Personal", labelVi: "Cá nhân" },
  ];

const MindmapContent = () => {
  const { isAuthenticated } = useAuth();
  const {
    mindmapFiles,
    loadFiles,
    deleteFile,
    loadFile,
    setMindmapCurrentFile,
    createFile,
    updateFile,
    setOnDataChange,
  } = useMindmapStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<MindMapType | "ALL">("ALL");
  const [selectedFile, setSelectedFile] = useState<FileProps | null>(null);
  const [isEditingMindmap, setIsEditingMindmap] = useState(false);
  const [showSaveMindmapDialog, setShowSaveMindmapDialog] = useState(false);
  const [showEditNameDialog, setShowEditNameDialog] = useState(false);
  const [showExitConfirmationDialog, setShowExitConfirmationDialog] =
    useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const t = useTranslations("Mindmap");
  const locale = useLocale();

  // Filter files based on search term and type
  const filteredFiles = mindmapFiles.filter((file) => {
    const matchesSearch = file.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "ALL" || file.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeLabel = (typeValue: MindMapType) => {
    const type = MINDMAP_TYPES.find((t) => t.value === typeValue);
    return type ? (locale === "vi" ? type.labelVi : type.label) : typeValue;
  };

  const getTypeBadgeVariant = (type: MindMapType) => {
    switch (type) {
      case "STUDY_NOTES":
        return "default";
      case "PROJECT_PLANNING":
        return "secondary";
      case "CONCEPT_MAPPING":
        return "outline";
      case "BRAINSTORMING":
        return "destructive";
      case "LESSON_PLAN":
        return "default";
      case "RESEARCH":
        return "secondary";
      case "PRESENTATION":
        return "outline";
      case "PERSONAL":
        return "destructive";
      default:
        return "default";
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      console.log("Loading mindmap files...");

      // Test API connection first
      mindmapAPI
        .testConnection()
        .then((isConnected: boolean) => {
          if (isConnected) {
            loadFiles().catch((error: unknown) => {
              console.error("Error loading files:", error);
              toast.error(
                error instanceof Error ? error.message : t("editor.loadError"),
              );
            });
          } else {
            toast.error(t("editor.connectionError"));
          }
        })
        .catch((error: unknown) => {
          console.error("API connection test failed:", error);
          toast.error(t("editor.apiError"));
        });
    }
  }, [isAuthenticated, loadFiles, t]);

  // Set up data change callback
  useEffect(() => {
    setOnDataChange(() => setHasUnsavedChanges(true));
  }, [setOnDataChange]);

  // Restore mindmap state on page reload
  useEffect(() => {
    if (isAuthenticated && mindmapFiles.length > 0) {
      const savedMindmapState = localStorage.getItem("mindmap-current-file");
      if (savedMindmapState) {
        try {
          const { fileId, fileName } = JSON.parse(savedMindmapState);
          if (fileId && fileName) {
            // Find the file in the loaded files
            const file = mindmapFiles.find((f) => f.id === fileId);
            if (file) {
              handleFileSelect(file);
            } else {
              // File not found, clear saved state
              localStorage.removeItem("mindmap-current-file");
            }
          }
        } catch (error) {
          console.error("Error restoring mindmap state:", error);
          localStorage.removeItem("mindmap-current-file");
        }
      }
    }
  }, [isAuthenticated, mindmapFiles]);

  useEffect(() => {
    const handleNewMindmap = () => {
      console.log("Creating new mindmap...");
      setSelectedFile(null);
      setMindmapCurrentFile(null);
      // Reset mindmap data to default
      const { setMindmapData } = useMindmapStore.getState();
      setMindmapData([DEFAULT_ROOT_NODE], []);
      setIsEditingMindmap(true);

      // Clear saved mindmap state when creating new
      localStorage.removeItem("mindmap-current-file");

      toast.success(t("editor.createSuccess"));
    };

    // Add event listener for new mindmap
    window.addEventListener("new-mindmap", handleNewMindmap);

    return () => {
      window.removeEventListener("new-mindmap", handleNewMindmap);
    };
  }, [setMindmapCurrentFile, t]);

  // Handle beforeunload event
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

  // Removed handleNavigate as it's no longer needed

  const handleExitEditor = () => {
    console.log("Exiting editor...");
    setIsEditingMindmap(false);
    setHasUnsavedChanges(false);
    localStorage.removeItem("mindmap-current-file");
    console.log("Editor exited successfully");
  };

  const handleFileSelect = async (file: FileProps) => {
    try {
      console.log("Loading file:", file.id);
      await loadFile(file.id);
      setSelectedFile(file);
      setMindmapCurrentFile(file);
      setIsEditingMindmap(true);
      setHasUnsavedChanges(false);

      // Save current mindmap state to localStorage
      localStorage.setItem(
        "mindmap-current-file",
        JSON.stringify({
          fileId: file.id,
          fileName: file.name,
        }),
      );

      console.log("File loaded successfully");
    } catch (error) {
      console.error("Error loading file:", error);
      toast.error(
        error instanceof Error ? error.message : t("editor.loadError"),
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFile(id);
      toast.success(t("editor.deleteSuccess"));
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error(
        error instanceof Error ? error.message : t("editor.deleteError"),
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <h2 className="mb-4 font-bold text-2xl">Authentication Required</h2>
          <p className="text-muted-foreground">
            Please log in to access the mindmap feature.
          </p>
        </div>
      </div>
    );
  }

  if (isEditingMindmap) {
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
                  // If file already has a name, save directly
                  try {
                    const data = {
                      nodes: useMindmapStore.getState().mindmapNodes,
                      edges: useMindmapStore.getState().mindmapEdges,
                      viewport: { x: 0, y: 0, zoom: 1 },
                    };
                    await updateFile(selectedFile.id, data);
                    setHasUnsavedChanges(false);
                    // Return to mindmap list after successful save
                    handleExitEditor();
                    // Show success message after exiting
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
                  // If no file name, show dialog to enter name
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

        {/* Save Dialog - Only for new files */}
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

              // Create new file with the provided name and type
              const newFile = await createFile(name, data, type);
              setSelectedFile(newFile);
              setMindmapCurrentFile(newFile);
              setHasUnsavedChanges(false);
              // Return to mindmap list after successful save
              handleExitEditor();
              // Show success message after exiting
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

        {/* Exit Confirmation Dialog */}
        <ExitConfirmationDialog
          isOpen={showExitConfirmationDialog}
          onClose={() => setShowExitConfirmationDialog(false)}
          onSave={async () => {
            try {
              console.log("Exit confirmation - Save clicked");
              if (selectedFile) {
                console.log("Saving existing file:", selectedFile.id);
                const data = {
                  nodes: useMindmapStore.getState().mindmapNodes,
                  edges: useMindmapStore.getState().mindmapEdges,
                  viewport: { x: 0, y: 0, zoom: 1 },
                };
                await updateFile(selectedFile.id, data);
                console.log("File saved successfully");
                setHasUnsavedChanges(false);
                setShowExitConfirmationDialog(false);
                // Return to mindmap list after successful save
                handleExitEditor();
                // Show success message after exiting
                toast.success(t("editor.saveSuccess"));
              } else {
                console.log("No selected file, showing save dialog");
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

        {/* Edit Name Dialog */}
        <SaveMindmapDialog
          isOpen={showEditNameDialog}
          onClose={() => setShowEditNameDialog(false)}
          onSave={async (newName: string, newType: MindMapType) => {
            try {
              if (selectedFile) {
                // Update the file name in the API
                await mindmapAPI.updateFileName(selectedFile.id, {
                  name: newName,
                });

                // Update local state
                const updatedFile = {
                  ...selectedFile,
                  name: newName,
                  type: newType,
                };
                setSelectedFile(updatedFile);
                setMindmapCurrentFile(updatedFile);

                // Update files list
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
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="max-w-md flex-1">
          <div className="relative">
            <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              className="pr-8 pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute top-2.5 right-2 h-4 w-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={selectedType}
            onValueChange={(value: MindMapType | "ALL") =>
              setSelectedType(value)
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t("filter.byType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("filter.allTypes")}</SelectItem>
              {MINDMAP_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {locale === "vi" ? type.labelVi : type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mindmaps List */}
      <div className="grid gap-4">
        {filteredFiles.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{t("createCTA.title")}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t("createCTA.description")}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setSelectedFile(null);
                    setMindmapCurrentFile(null);
                    // Reset mindmap data to default
                    const { setMindmapData } = useMindmapStore.getState();
                    setMindmapData([DEFAULT_ROOT_NODE], []);
                    setIsEditingMindmap(true);

                    // Clear saved mindmap state when creating new
                    localStorage.removeItem("mindmap-current-file");

                    toast.success(t("editor.createSuccess"));
                  }}
                >
                  {t("createCTA.button")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {filteredFiles.map((file) => (
              <Card
                key={file.id}
                className="cursor-pointer border transition-shadow hover:shadow-md dark:border-border"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="flex flex-1 items-center gap-3"
                      onClick={() => handleFileSelect(file)}
                    >
                      <FileText className="h-5 w-5 text-primary" />
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-medium">{file.name}</h3>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge
                            variant={getTypeBadgeVariant(file.type)}
                            className="text-xs"
                          >
                            {getTypeLabel(file.type)}
                          </Badge>
                          <p className="text-muted-foreground text-sm">
                            Updated: {formatDate(file.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleFileSelect(file)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(file.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MindmapContent;
