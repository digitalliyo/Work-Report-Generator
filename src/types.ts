import { Type } from "@google/genai";

export interface CompanyInfo {
  name: string;
  logo?: string;
  address?: string;
  website?: string;
  brandColor: string;
}

export interface EmployeeInfo {
  name: string;
  email?: string;
  role?: string;
  department?: string;
  date: string;
  workingHours?: string;
  project?: string;
}

export interface RecipientInfo {
  name: string;
  role?: string;
  email?: string;
}

export interface Task {
  task: string;
  status: "Done" | "In Progress" | "Pending" | "Cancelled";
  time_spent?: string;
  output?: string;
}

export interface ReportData {
  report_title: string;
  company: {
    name: string;
    address?: string;
    website?: string;
  };
  employee: {
    name: string;
    role?: string;
    department?: string;
  };
  date: string;
  working_hours?: string;
  project?: string;
  summary_bullets: string[];
  tasks: Task[];
  challenges: string[];
  tomorrow_plan: string[];
  help_needed: string[];
  raw_extracted_notes?: string;
}

export const REPORT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    report_title: { type: Type.STRING },
    company: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        address: { type: Type.STRING },
        website: { type: Type.STRING },
      },
      required: ["name"],
    },
    employee: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        role: { type: Type.STRING },
        department: { type: Type.STRING },
      },
      required: ["name"],
    },
    date: { type: Type.STRING, description: "YYYY-MM-DD format" },
    working_hours: { type: Type.STRING },
    project: { type: Type.STRING },
    summary_bullets: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          task: { type: Type.STRING },
          status: { type: Type.STRING, enum: ["Done", "In Progress", "Pending", "Cancelled"] },
          time_spent: { type: Type.STRING },
          output: { type: Type.STRING },
        },
        required: ["task", "status"],
      },
    },
    challenges: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    tomorrow_plan: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    help_needed: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    raw_extracted_notes: { type: Type.STRING },
  },
  required: [
    "report_title",
    "company",
    "employee",
    "date",
    "summary_bullets",
    "tasks",
    "challenges",
    "tomorrow_plan",
    "help_needed",
  ],
};
