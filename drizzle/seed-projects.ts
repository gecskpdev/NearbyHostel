import { db, pool } from "../lib/db"; // ✅ updated path
import { projects, teamMembers, projectOptions, categories, categoryOptionValues } from "../lib/schema"; // ✅ schema path
import { eq, and } from "drizzle-orm";

const projectSeedData = [
  {
    projectName: "Repeto ",
    projectDescription: "A platform where you can prevoious hackathon internship that repeat all year from top companys",
    yearOfSubmission: "2024",
    projectType: "Personal Project",
    department: "CSE",
    domain: "Web Development",
    customDomain: "",
    projectLink: "https://github.com/example/chatbot",
    createdAt: "2025-01-15",
    members: [
      {
        name: "SHADIL A M",
        linkedin: "https://www.linkedin.com/in/shadilam/"
      },
      {
        name: "Sooraj Krishna",
        linkedin: "https://www.linkedin.com/in/sooraj-krishna-k-p/"
      },
      {
        name: "Abhijith S",
        linkedin: "https://www.linkedin.com/in/abhijiths-s/"
      },
      {
        name: "Abhiram Ps",
        linkedin: "https://www.linkedin.com/in/abhiram-ps-9b744924b/"
      }
    ]
  },
  {
    projectName: "Nemini Electric website",
    projectDescription: "Made a website for my friend fathers bussincess",
    yearOfSubmission: "2024",
    projectType: "Personal Project",
    department: "CSE",
    domain: "Web Development",
    customDomain: "",
    projectLink: "https://github.com/shadil-rayyan/nenmini-electric_website",
    createdAt: "2024-06-10",
    members: [
      {
        name: "SHADIL A M",
        linkedin: "https://www.linkedin.com/in/shadilam/"
      }
    ]
  },
  {
    projectName: "Laptop Price Prediction",
    projectDescription: "Implemented a machine learning model to predict laptop prices based on specifications, following a YouTube tutorial to enhance my ML skills.",
    yearOfSubmission: "2023",
    projectType: "Personal Project",
    department: "CSE",
    domain: "Web Development",
    customDomain: "",
    projectLink: "https://github.com/shadil-rayyan/My_Projects/tree/main/MachineLearning/LaptopPricePredicator%20-clone",
    createdAt: "2023-09-22",
    members: [
      {
        name: "SHADIL A M",
        linkedin: "https://www.linkedin.com/in/shadilam/"
      }
    ]
  },
  {
    projectName: "Kerala Tourist Spot",
    projectDescription: "Developed a Telegram bot to guide users to authentic dishes and restaurants in Kozhikode city, enhancing culinary exploration for locals and tourists alike.\n",
    yearOfSubmission: "2023",
    projectType: "Personal Project",
    department: "",
    domain: "Other",
    customDomain: "",
    projectLink: "https://github.com/shadil-rayyan/kerala_tourist_spot-bot.git",
    members: [
      {
        name: "SHADIL A M",
        linkedin: "https://www.linkedin.com/in/shadilam/"
      }
    ],
    createdAt: "2025-03-27T20:34:40.196Z"
  }
];

async function main() {
  console.log("🌱 Starting project seed...");

  try {
    // Clear existing project-related data
    await db.delete(projectOptions);
    await db.delete(teamMembers);
    await db.delete(projects);

    for (const projectData of projectSeedData) {
      const [newProject] = await db.insert(projects).values({
        projectName: projectData.projectName,
        projectDescription: projectData.projectDescription,
        projectLink: projectData.projectLink,
        createdAt: new Date(projectData.createdAt),
      }).returning({ projectId: projects.projectId });

      if (!newProject || !newProject.projectId) {
        console.error(`Failed to insert project: ${projectData.projectName}`);
        continue;
      }

      // Insert team members
      if (projectData.members && projectData.members.length > 0) {
        const membersToInsert = projectData.members.map(member => ({
          projectId: newProject.projectId,
          name: member.name,
          linkedin: member.linkedin,
        }));
        await db.insert(teamMembers).values(membersToInsert);
      }

      // Link project to categories and options
      const categoryMappings = [
        { categoryName: 'Project Type', value: projectData.projectType },
        { categoryName: 'Department', value: projectData.department },
        { categoryName: 'Domain', value: projectData.domain },
        { categoryName: 'Year of Submission', value: projectData.yearOfSubmission },
      ];

      for (const mapping of categoryMappings) {
        if (mapping.value) { // Only process if a value is provided for the category
          const category = await db.select({ categoryId: categories.categoryId }).from(categories).where(eq(categories.category, mapping.categoryName));
          
          if (category.length > 0 && category[0].categoryId) {
            const option = await db.select({ optionId: categoryOptionValues.optionId }).from(categoryOptionValues)
                                   .where(and(
                                       eq(categoryOptionValues.optionName, mapping.value),
                                       eq(categoryOptionValues.categoryId, category[0].categoryId)
                                   ));
            if (option.length > 0 && option[0].optionId) {
              await db.insert(projectOptions).values({
                projectId: newProject.projectId,
                categoryId: category[0].categoryId,
                optionId: option[0].optionId,
              });
            }
          }
        }
      }
    }

    console.log("✅ Project data seeded successfully.");
  } catch (error) {
    console.error("❌ Error seeding project data:", error);
    process.exit(1);
  } finally {
    await pool.end(); // close DB connection
  }
}

main();
