"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clipboard,
  Code,
  Copy,
  Download,
  Eye,
  FileText,
  Plus,
  Trophy,
  Users,
  Wifi,
  Zap,
} from "lucide-react";

export default function GroupDetailContent() {
  const joinCode = "umoEB-bp";

  const handleCopyClick = () => {
    navigator.clipboard.writeText(joinCode);
    // Optionally, add a toast notification here
  };
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-bold text-3xl text-gray-900 dark:text-gray-50">
              Study Challenge for Hours
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Let&apos;s see how much hours in total can you study productively.
            </p>
          </div>
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Join Group
          </Button>
        </header>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 font-medium text-sm">
                <Wifi className="h-4 w-4 text-green-500" /> Live Activity
              </CardTitle>
              <div className="flex items-center gap-2 text-gray-500 text-sm dark:text-gray-400">
                <Users className="h-4 w-4" /> 0 online
                <Badge variant="secondary" className="ml-2">
                  Members only
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex h-48 flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
              <Users className="mb-2 h-12 w-12" />
              <p>No one else is online right now</p>
              <p>Be the first to start studying!</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-medium text-sm">Members</CardTitle>
                <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">2/15</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-medium text-sm">
                  Competition
                </CardTitle>
                <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">WEEKLY</div>
                <p className="text-gray-500 text-xs dark:text-gray-400">
                  Ends 8/10/2025
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-medium text-sm">Join Code</CardTitle>
                <Clipboard className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="px-3 py-1 font-mono text-base"
                >
                  {joinCode}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyClick}
                  aria-label="Copy join code"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <Tabs defaultValue="leaderboard" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="leaderboard"
                  className="flex items-center gap-2"
                >
                  <Trophy className="h-4 w-4" /> Leaderboard
                </TabsTrigger>
                <TabsTrigger
                  value="members"
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" /> Members
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" /> Documents
                </TabsTrigger>
                <TabsTrigger value="code" className="flex items-center gap-2">
                  <Code className="h-4 w-4" /> Code
                </TabsTrigger>
              </TabsList>

              <TabsContent value="leaderboard" className="mt-4">
                <CardTitle className="mb-2 font-semibold text-lg">
                  Leaderboard
                </CardTitle>
                <p className="mb-4 text-gray-600 text-sm dark:text-gray-400">
                  See who&apos;s leading in your study group
                </p>
                <div className="mb-4 flex items-center justify-between">
                  <Tabs defaultValue="current-period" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="current-period">
                        Current Period
                      </TabsTrigger>
                      <TabsTrigger value="all-time">All Time</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src="/placeholder.svg?height=100&width=100"
                          alt="Avatar"
                        />
                        <AvatarFallback>MK</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Md Kaiyum Hossain</p>
                        <p className="text-gray-500 text-sm dark:text-gray-400">
                          10m
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500 text-white hover:bg-blue-600">
                      <Zap className="mr-1 h-3 w-3" /> Top 1
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center font-bold text-gray-500 text-lg dark:text-gray-400">
                        2
                      </span>
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src="/placeholder.svg?height=100&width=100"
                          alt="Avatar"
                        />
                        <AvatarFallback>AL</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">alexionesc</p>
                        <p className="text-gray-500 text-sm dark:text-gray-400">
                          8m
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      <Zap className="mr-1 h-3 w-3" /> Top 2
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center font-bold text-gray-500 text-lg dark:text-gray-400">
                        3
                      </span>
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src="/placeholder.svg?height=100&width=100"
                          alt="Avatar"
                        />
                        <AvatarFallback>JS</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Jane Smith</p>
                        <p className="text-gray-500 text-sm dark:text-gray-400">
                          5m
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      <Zap className="mr-1 h-3 w-3" /> Top 3
                    </Badge>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="members" className="mt-4">
                <CardTitle className="mb-2 font-semibold text-lg">
                  Group Members
                </CardTitle>
                <p className="mb-4 text-gray-600 text-sm dark:text-gray-400">
                  List of all members in this study group.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src="/placeholder.svg?height=100&width=100"
                        alt="Avatar"
                      />
                      <AvatarFallback>MK</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Md Kaiyum Hossain</p>
                      <p className="text-gray-500 text-sm dark:text-gray-400">
                        Online
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      View Profile
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg p-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src="/placeholder.svg?height=100&width=100"
                        alt="Avatar"
                      />
                      <AvatarFallback>AL</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">alexionesc</p>
                      <p className="text-gray-500 text-sm dark:text-gray-400">
                        Offline
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      View Profile
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg p-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src="/placeholder.svg?height=100&width=100"
                        alt="Avatar"
                      />
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Jane Smith</p>
                      <p className="text-gray-500 text-sm dark:text-gray-400">
                        Offline
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      View Profile
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-4">
                <CardTitle className="mb-2 font-semibold text-lg">
                  Shared Documents
                </CardTitle>
                <p className="mb-4 text-gray-600 text-sm dark:text-gray-400">
                  Important notes, study guides, and resources.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <FileText className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="font-medium">
                        Calculus I - Cheat Sheet.pdf
                      </p>
                      <p className="text-gray-500 text-sm dark:text-gray-400">
                        Uploaded by Md Kaiyum Hossain - 2 days ago
                      </p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="View document"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Download document"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg p-3">
                    <FileText className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="font-medium">
                        Physics II - Problem Set 3.docx
                      </p>
                      <p className="text-gray-500 text-sm dark:text-gray-400">
                        Uploaded by alexionesc - 1 week ago
                      </p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="View document"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Download document"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg p-3">
                    <FileText className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="font-medium">
                        Group Project - Brainstorming.txt
                      </p>
                      <p className="text-gray-500 text-sm dark:text-gray-400">
                        Uploaded by Jane Smith - 3 weeks ago
                      </p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="View document"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Download document"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="code" className="mt-4">
                <CardTitle className="mb-2 font-semibold text-lg">
                  Shared Code Snippets
                </CardTitle>
                <p className="mb-4 text-gray-600 text-sm dark:text-gray-400">
                  Code examples, solutions, and project files.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <Code className="h-6 w-6 text-purple-500" />
                    <div>
                      <p className="font-medium">
                        Python - Quick Sort Algorithm.py
                      </p>
                      <p className="text-gray-500 text-sm dark:text-gray-400">
                        Uploaded by Md Kaiyum Hossain - 4 days ago
                      </p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="View code"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Download code"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg p-3">
                    <Code className="h-6 w-6 text-purple-500" />
                    <div>
                      <p className="font-medium">
                        JavaScript - React Component Example.jsx
                      </p>
                      <p className="text-gray-500 text-sm dark:text-gray-400">
                        Uploaded by alexionesc - 1 week ago
                      </p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="View code"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Download code"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg p-3">
                    <Code className="h-6 w-6 text-purple-500" />
                    <div>
                      <p className="font-medium">SQL - Database Schema.sql</p>
                      <p className="text-gray-500 text-sm dark:text-gray-400">
                        Uploaded by Jane Smith - 2 weeks ago
                      </p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="View code"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Download code"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
