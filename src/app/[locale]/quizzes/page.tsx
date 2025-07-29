// Import the SidebarLayout at the top
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Edit,
  Filter,
  Play,
  Plus,
  Search,
  Target,
  Trash2,
  Users,
} from "lucide-react";

export default function QuizzesPage() {
  const quizzes = [
    {
      title: "Mathematics Quiz - Algebra",
      description: "Test your knowledge of algebraic equations and functions",
      questions: 15,
      duration: "20 min",
      difficulty: "Medium",
      attempts: 234,
      avgScore: 78,
      lastAttempt: "2 days ago",
      tags: ["Mathematics", "Algebra"],
    },
    {
      title: "Biology Basics",
      description: "Fundamental concepts in biology and life sciences",
      questions: 20,
      duration: "25 min",
      difficulty: "Easy",
      attempts: 156,
      avgScore: 85,
      lastAttempt: "1 week ago",
      tags: ["Biology", "Science"],
    },
    {
      title: "World History Quiz",
      description: "Major events and figures in world history",
      questions: 12,
      duration: "15 min",
      difficulty: "Hard",
      attempts: 89,
      avgScore: 65,
      lastAttempt: "3 days ago",
      tags: ["History", "World"],
    },
  ];

  return (
    <SidebarLayout>
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="font-semibold text-xl">Quizzes</h1>
          <Button className="ml-auto" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Quiz
          </Button>
        </header>

        {/* Main Content */}
        <div className="flex-1 space-y-6 p-6">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="max-w-md flex-1">
              <div className="relative">
                <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search quizzes..." className="pl-8" />
              </div>
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-bold text-2xl">12</div>
                    <p className="text-muted-foreground text-sm">
                      Total Quizzes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-bold text-2xl">479</div>
                    <p className="text-muted-foreground text-sm">
                      Total Attempts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-yellow-600" />
                  <div>
                    <div className="font-bold text-2xl">76%</div>
                    <p className="text-muted-foreground text-sm">
                      Average Score
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-bold text-2xl">18</div>
                    <p className="text-muted-foreground text-sm">
                      Avg. Duration (min)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quizzes List */}
          <div>
            <h2 className="mb-4 font-semibold text-xl">Your Quizzes</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz, index) => (
                <Card key={index} className="transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="line-clamp-2 text-lg">
                          {quiz.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {quiz.description}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          quiz.difficulty === "Easy"
                            ? "default"
                            : quiz.difficulty === "Medium"
                              ? "secondary"
                              : "destructive"
                        }
                        className="ml-2"
                      >
                        {quiz.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span>{quiz.questions} questions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{quiz.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{quiz.attempts} attempts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Avg:</span>
                        <span className="font-medium">{quiz.avgScore}%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Average Score</span>
                        <span>{quiz.avgScore}%</span>
                      </div>
                      <Progress value={quiz.avgScore} className="h-2" />
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {quiz.tags.map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          variant="outline"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1" size="sm">
                        <Play className="mr-2 h-4 w-4" />
                        Take Quiz
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-muted-foreground text-xs">
                      Last attempt: {quiz.lastAttempt}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Create Quiz CTA */}
          <Card className="border-2 border-dashed">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Create your first quiz</h3>
                  <p className="text-muted-foreground text-sm">
                    Start building interactive quizzes to test your knowledge
                  </p>
                </div>
                <Button>Create New Quiz</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
