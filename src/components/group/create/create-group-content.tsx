"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  type CreateStudyGroupFormData,
  createStudyGroupSchema,
} from "@/lib/schemas/group";
import type { GroupRequest } from "@/types/group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation"; // ✅ thêm import
import { type SubmitHandler, useForm } from "react-hook-form";
import { groupAPI } from "../../../lib/api/group";

export function CreateGroupContent() {
  const router = useRouter(); // ✅ khởi tạo router

  const form = useForm<CreateStudyGroupFormData>({
    resolver: zodResolver(createStudyGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      memberLimit: 20,
      public: false,
    },
  });

  const onSubmit: SubmitHandler<CreateStudyGroupFormData> = async (values) => {
    try {
      const payload: GroupRequest = {
        name: values.name,
        description: values.description,
        memberLimit: values.memberLimit,
        public: values.public,
      };

      const newGroup = await groupAPI.createGroup(payload);

      toast({
        title: "Group Created!",
        description: `Study group "${newGroup.name}" has been created successfully.`,
      });

      form.reset();
      router.back();
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to create group",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 font-bold text-2xl text-primary tracking-tight">
          Create Study Group
        </h1>
        <p className="text-lg text-muted-foreground">
          Create a new study group to compete and learn with friends.
        </p>
      </div>

      <Card className="mx-auto w-full max-w-4xl rounded-sm border border-border bg-muted/30 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Group Details</CardTitle>
          <CardDescription>
            Set up your study group with a name and description
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Physics Study Squad"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What's your group about?"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="memberLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Members</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="public"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border bg-muted/20 p-4">
                    <div>
                      <FormLabel className="font-medium">
                        Public Group
                      </FormLabel>
                      <p className="text-muted-foreground text-sm">
                        Allow anyone to discover and join your group
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-full px-6">
                  Create Group
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
