import { db } from "./db";
import { seedJobs } from "./seedData";

export function seedIfEmpty() {
  const { count } = db.prepare("SELECT COUNT(*) as count FROM jobs").get() as { count: number };
  if (count > 0) return { inserted: 0, skipped: true };

  const insert = db.prepare(`
    INSERT INTO jobs (
      title, category, description, tasks, skills, tools, pathway,
      min_salary, avg_salary, max_salary, market_saturation, growth_outlook, remote_rating
    ) VALUES (
      @title, @category, @description, @tasks, @skills, @tools, @pathway,
      @min_salary, @avg_salary, @max_salary, @market_saturation, @growth_outlook, @remote_rating
    )
  `);

  const insertMany = db.transaction((jobs: typeof seedJobs) => {
    for (const job of jobs) {
      insert.run({
        title: job.title,
        category: job.category,
        description: job.description,
        tasks: JSON.stringify(job.tasks),
        skills: JSON.stringify(job.skills),
        tools: JSON.stringify(job.tools),
        pathway: JSON.stringify(job.pathway),
        min_salary: job.min_salary,
        avg_salary: job.avg_salary,
        max_salary: job.max_salary,
        market_saturation: job.market_saturation,
        growth_outlook: job.growth_outlook,
        remote_rating: job.remote_rating,
      });
    }
  });

  insertMany(seedJobs);
  return { inserted: seedJobs.length, skipped: false };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = seedIfEmpty();
  if (result.skipped) {
    console.log("Jobs table already populated — skipping seed.");
  } else {
    console.log(`Seeded ${result.inserted} jobs.`);
  }
}
