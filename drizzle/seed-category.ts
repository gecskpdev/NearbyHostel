import { db, pool } from "../lib/db"; // ✅ updated path
import { categories, categoryOptionValues } from "../lib/schema"; // ✅ schema path

async function main() {
  console.log("🌱 Starting seed...");

  try {
    // Clear existing data
    await db.delete(categoryOptionValues);
    await db.delete(categories);

    const categoriesToSeed = [
        {
            categoryName: "Year of Submission",
            options: ["2025", "2024", "2023", "2022", "2021"]
          },
          {
            categoryName: "Project Type",
            options: [
              "Final Year Project",
              "Mini Project",
              "Research Project",
              "Personal Project",
              "Others"
            ]
          },
          {
            categoryName: "Department",
            options: ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "Other"]
          },
          {
            categoryName: "Domain",
            options: [
              "Other",
              "Web Development",
              "Mobile App Development (Android & iOS)",
              "Artificial Intelligence (AI) & Machine Learning (ML)",
              "Data Science & Big Data Analytics",
              "Cybersecurity & Ethical Hacking",
              "Blockchain & Cryptocurrency",
              "Cloud Computing & DevOps",
              "Game Development & AR/VR",
              "Internet of Things (IoT)",
              "Natural Language Processing (NLP)",
              "Database Management & Data Warehousing",
              "Quantum Computing",
              "Software Testing & Automation",
              "Full Stack Development (MERN, MEAN, etc.)",
              "UI/UX & Human-Computer Interaction",
              "Computer Networks & Network Security",
              "Augmented Reality (AR) & Virtual Reality (VR)",
              "E-commerce & CMS Development",
              "No-Code & Low-Code Development",
              "Cloud Security & Serverless Computing",
              "DevOps & Site Reliability Engineering (SRE)",
              "Edge Computing & Distributed Systems",
              "IT Infrastructure & System Administration",
              "Data Engineering & Business Intelligence",
              "IT Governance & Compliance",
              "Structural Engineering & Earthquake-Resistant Design",
              "Transportation & Highway Engineering",
              "Geotechnical Engineering & Soil Mechanics",
              "Smart Cities & Urban Planning",
              "Sustainable & Green Building Technology",
              "Hydraulics & Water Resource Engineering",
              "Construction Management & Project Planning",
              "Environmental Engineering & Waste Management",
              "Building Information Modeling (BIM)",
              "Disaster Management & Risk Analysis",
              "Bridge & Tunnel Engineering",
              "Surveying & Remote Sensing (GIS & GPS)",
              "VLSI & Chip Design",
              "Embedded Systems & Microcontrollers",
              "Wireless Communication (5G, LTE, Satellite)",
              "Signal & Image Processing",
              "Optical Fiber & Photonics",
              "Digital & Analog Circuit Design",
              "Antenna & RF Engineering",
              "Smart Sensors & Wearable Technology",
              "Audio & Speech Processing",
              "Biomedical Electronics & Bionics",
              "MEMS & Nanoelectronics",
              "Power Systems & Smart Grids",
              "Renewable Energy (Solar, Wind, Hydro)",
              "Control Systems & Automation",
              "Robotics & Mechatronics",
              "Electric Vehicles (EV) & Battery Technologies",
              "High Voltage Engineering",
              "Energy Management & Conservation",
              "Industrial Instrumentation & Process Control",
              "Electrical Machines & Drives",
              "Smart Home & Building Automation",
              "CAD, CAM & 3D Printing",
              "Automotive & Aerospace Engineering",
              "Thermodynamics & Fluid Mechanics",
              "Mechatronics & Smart Manufacturing",
              "HVAC & Refrigeration Systems",
              "Material Science & Composites",
              "Renewable Energy in Mechanical Systems",
              "Computational Fluid Dynamics (CFD)",
              "Finite Element Analysis (FEA)"
            ]
          }
    ];

    for (const category of categoriesToSeed) {
      const [insertedCategory] = await db
        .insert(categories)
        .values({ category: category.categoryName })
        .returning({ categoryId: categories.categoryId });

      const options = category.options.map((optionName) => ({
        optionName,
        categoryId: insertedCategory.categoryId,
      }));

      await db.insert(categoryOptionValues).values(options);
    }

    console.log("✅ Database seeded successfully.");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await pool.end(); // close DB connection
  }
}

main();
