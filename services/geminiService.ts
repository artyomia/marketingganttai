import { GoogleGenAI, Type } from "@google/genai";
import { Task, TaskStatus, DEFAULT_CATEGORIES } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMarketingPlan = async (
  projectDescription: string,
  startDate: string
): Promise<Task[]> => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Create enum string for prompt
    const categoriesStr = DEFAULT_CATEGORIES.join(", ");

    const response = await ai.models.generateContent({
      model,
      contents: `Create a detailed marketing project plan for: "${projectDescription}". 
      The project starts on ${startDate}.
      Generate 5-10 specific tasks that are realistic for a marketing campaign.
      Ensure the dates are sequential and logical (e.g., Planning comes before Execution).
      Classify tasks into categories like: ${categoriesStr}. You can also create new specific categories if needed.
      Assign tasks to 'Tuan' or 'Tu' or both.
      Return the response in strict JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Actionable name of the task" },
              startOffsetDays: { type: Type.INTEGER, description: "Number of days from project start date this task begins" },
              durationDays: { type: Type.INTEGER, description: "Duration of the task in days" },
              category: { type: Type.STRING, description: "Category of the task" },
              assignees: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "List of assignees (Tuan, Tu)" 
              }
            },
            required: ["name", "startOffsetDays", "durationDays", "category", "assignees"]
          }
        }
      }
    });

    const generatedTasks = JSON.parse(response.text || "[]");
    
    const projectStartDateObj = new Date(startDate);

    return generatedTasks.map((t: any, index: number) => {
      const taskStart = new Date(projectStartDateObj);
      taskStart.setDate(projectStartDateObj.getDate() + t.startOffsetDays);
      
      const taskEnd = new Date(taskStart);
      taskEnd.setDate(taskStart.getDate() + t.durationDays);

      return {
        id: `gen-${Date.now()}-${index}`,
        name: t.name,
        startDate: taskStart.toISOString().split('T')[0],
        endDate: taskEnd.toISOString().split('T')[0],
        category: t.category,
        status: TaskStatus.TODO,
        assignees: t.assignees || [],
        progress: 0,
        description: `Auto-generated task for ${t.category}`
      };
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate project plan. Please try again.");
  }
};
