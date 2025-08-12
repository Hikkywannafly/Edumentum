"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Tag, X } from "lucide-react";
import { useState } from "react";

interface QuizTagsCategoriesEditorProps {
  category?: string;
  onCategoryChange: (category: string) => void;
  tags?: string[];
  onTagsChange: (tags: string[]) => void;
}

export function QuizTagsCategoriesEditor({
  category = "",
  onCategoryChange,
  tags = [],
  onTagsChange,
}: QuizTagsCategoriesEditorProps) {
  const [newTag, setNewTag] = useState("");

  // Predefined categories
  const categories = [
    "Mathematics",
    "Science",
    "History",
    "Literature",
    "Technology",
    "Business",
    "Art",
    "Music",
    "Sports",
    "General Knowledge",
    "Language Learning",
    "Programming",
    "Medicine",
    "Engineering",
    "Psychology",
  ];

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      onTagsChange(updatedTags);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    onTagsChange(updatedTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Quiz Tags & Category
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Selection */}
        <div className="space-y-2">
          <Label className="font-medium text-sm">Category</Label>
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category for this quiz" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tags Management */}
        <div className="space-y-2">
          <Label className="font-medium text-sm">Tags</Label>
          <p className="text-muted-foreground text-xs">
            Add tags to help organize and categorize this quiz
          </p>

          {/* Display existing tags */}
          {tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-500"
                    type="button"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Add new tag */}
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a tag..."
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddTag}
              disabled={!newTag.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Common tags suggestions */}
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs">
            Suggested tags:
          </Label>
          <div className="flex flex-wrap gap-1">
            {[
              "beginner",
              "intermediate",
              "advanced",
              "exam-prep",
              "practice",
              "review",
            ].map((suggestedTag) => (
              <Button
                key={suggestedTag}
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => {
                  if (!tags.includes(suggestedTag)) {
                    onTagsChange([...tags, suggestedTag]);
                  }
                }}
                disabled={tags.includes(suggestedTag)}
              >
                {suggestedTag}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
