import { Router } from "express";
import { db } from "./db";
import { analyzeQuiz } from "./gemini";
import type { Job } from "../src/types";

type JobRow = {
  id: number;
  title: string;
  category: string;
  description: string;
  tasks: string;
  skills: string;
  tools: string;
  pathway: string;
  min_salary: number;
  avg_salary: number;
  max_salary: number;
  market_saturation: string;
  growth_outlook: string;
  remote_rating: string;
};

function toJob(row: JobRow): Job {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    tasks: JSON.parse(row.tasks),
    skills: JSON.parse(row.skills),
    tools: JSON.parse(row.tools),
    pathway: JSON.parse(row.pathway),
    min_salary: row.min_salary,
    avg_salary: row.avg_salary,
    max_salary: row.max_salary,
    market_saturation: row.market_saturation as Job["market_saturation"],
    growth_outlook: row.growth_outlook,
    remote_rating: row.remote_rating as Job["remote_rating"],
  };
}

export const apiRouter = Router();

apiRouter.get("/jobs", (_req, res) => {
  const rows = db.prepare("SELECT * FROM jobs ORDER BY id ASC").all() as JobRow[];
  res.json(rows.map(toJob));
});

apiRouter.get("/jobs/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid job id" });
  }
  const row = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id) as JobRow | undefined;
  if (!row) return res.status(404).json({ error: "Job not found" });
  res.json(toJob(row));
});

apiRouter.post("/jobs/batch", (req, res) => {
  const jobs = req.body?.jobs;
  if (!Array.isArray(jobs) || jobs.length === 0) {
    return res.status(400).json({ error: "Request body must include a non-empty jobs[] array" });
  }

  const insert = db.prepare(`
    INSERT INTO jobs (
      title, category, description, tasks, skills, tools, pathway,
      min_salary, avg_salary, max_salary, market_saturation, growth_outlook, remote_rating
    ) VALUES (
      @title, @category, @description, @tasks, @skills, @tools, @pathway,
      @min_salary, @avg_salary, @max_salary, @market_saturation, @growth_outlook, @remote_rating
    )
  `);

  try {
    const insertMany = db.transaction((records: typeof jobs) => {
      for (const job of records) {
        insert.run({
          title: String(job.title ?? ""),
          category: String(job.category ?? ""),
          description: String(job.description ?? ""),
          tasks: JSON.stringify(job.tasks ?? []),
          skills: JSON.stringify(job.skills ?? []),
          tools: JSON.stringify(job.tools ?? []),
          pathway: JSON.stringify(job.pathway ?? []),
          min_salary: Number(job.min_salary ?? 0),
          avg_salary: Number(job.avg_salary ?? 0),
          max_salary: Number(job.max_salary ?? 0),
          market_saturation: String(job.market_saturation ?? "Balanced"),
          growth_outlook: String(job.growth_outlook ?? ""),
          remote_rating: String(job.remote_rating ?? "On-site"),
        });
      }
    });
    insertMany(jobs);
    res.status(201).json({ inserted: jobs.length });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Bulk insert failed" });
  }
});

apiRouter.post("/quiz/analyze", async (req, res) => {
  const answers = req.body?.answers;
  if (typeof answers !== "object" || answers === null) {
    return res.status(400).json({ error: "Request body must include an answers object" });
  }

  try {
    const result = await analyzeQuiz(answers);
    res.json(result);
  } catch (err) {
    res.status(502).json({
      error: err instanceof Error ? err.message : "Failed to analyze quiz results",
    });
  }
});
