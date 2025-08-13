import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Mock categories data - replace with actual database call
const CATEGORIES = [
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
  "Physics",
  "Chemistry",
  "Biology",
  "Geography",
  "Philosophy",
  "Economics",
  "Law",
  "Architecture",
  "Design",
  "Marketing",
  "Finance",
  "Data Science",
  "Artificial Intelligence",
  "Web Development",
  "Mobile Development",
  "Game Development",
  "Cybersecurity",
  "Network Administration",
  "Database Management",
  "Project Management",
  "Human Resources",
  "Sales",
  "Customer Service",
  "Social Media",
  "Content Creation",
  "Photography",
  "Video Production",
  "Graphic Design",
  "UI/UX Design",
  "Creative Writing",
  "Journalism",
  "Public Speaking",
  "Leadership",
  "Team Management",
  "Time Management",
  "Personal Development",
  "Health & Wellness",
  "Nutrition",
  "Fitness",
  "Mental Health",
  "Environmental Science",
  "Sustainability",
  "Renewable Energy",
  "Climate Change",
  "Agriculture",
  "Food Science",
  "Culinary Arts",
  "Travel & Tourism",
  "Hospitality",
  "Event Planning",
  "Real Estate",
  "Insurance",
  "Banking",
  "Investment",
  "Cryptocurrency",
  "Blockchain",
  "Statistics",
  "Research Methods",
  "Quality Assurance",
  "Testing",
  "DevOps",
  "Cloud Computing",
  "Machine Learning",
  "Deep Learning",
  "Natural Language Processing",
  "Computer Vision",
  "Robotics",
  "Internet of Things",
  "Augmented Reality",
  "Virtual Reality",
  "3D Modeling",
  "Animation",
  "Game Design",
  "Music Theory",
  "Music Production",
  "Film Studies",
  "Theater",
  "Dance",
  "Fashion",
  "Interior Design",
  "Landscape Architecture",
  "Urban Planning",
  "Civil Engineering",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Chemical Engineering",
  "Aerospace Engineering",
  "Biomedical Engineering",
  "Software Engineering",
  "Systems Engineering",
  "Industrial Engineering",
  "Materials Science",
  "Nanotechnology",
  "Biotechnology",
  "Genetics",
  "Microbiology",
  "Pharmacology",
  "Anatomy",
  "Physiology",
  "Pathology",
  "Radiology",
  "Surgery",
  "Nursing",
  "Physical Therapy",
  "Occupational Therapy",
  "Speech Therapy",
  "Dentistry",
  "Veterinary Medicine",
  "Public Health",
  "Epidemiology",
  "Biostatistics",
  "Medical Research",
  "Clinical Trials",
  "Healthcare Administration",
  "Medical Ethics",
  "Telemedicine",
  "Digital Health",
];

export async function GET(_request: NextRequest) {
  try {
    // In a real application, you would fetch from your database
    // Example: const categories = await db.categories.findMany({ orderBy: { name: 'asc' } });

    // For now, return the mock data
    const categories = CATEGORIES.sort();

    return NextResponse.json({
      success: true,
      categories,
      count: categories.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch categories:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
        categories: CATEGORIES.sort(), // Fallback to static list
      },
      { status: 500 },
    );
  }
}

// Optional: POST endpoint to add new categories (admin only)
export async function POST(request: NextRequest) {
  try {
    const { category } = await request.json();

    if (!category || typeof category !== "string") {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 },
      );
    }

    // In a real application, you would save to database
    // Example: await db.categories.create({ data: { name: category.trim() } });

    return NextResponse.json({
      success: true,
      message: "Category added successfully",
      category: category.trim(),
    });
  } catch (error) {
    console.error("Failed to add category:", error);

    return NextResponse.json(
      { success: false, error: "Failed to add category" },
      { status: 500 },
    );
  }
}
