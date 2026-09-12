import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CareerExplorer from "./components/CareerExplorer";
import JobModal from "./components/JobModal";
import Quiz from "./components/Quiz";
import SuccessStories from "./components/SuccessStories";
import MarketInsights from "./components/MarketInsights";
import Footer from "./components/Footer";
import { fetchJobs } from "./lib/api";
import type { Job } from "./types";

export default function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    fetchJobs()
      .then(setJobs)
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!window.location.hash) return;
    const id = window.location.hash.slice(1);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <Hero searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <CareerExplorer
        jobs={jobs}
        loading={loading}
        searchTerm={searchTerm}
        onSelectJob={setSelectedJob}
      />
      <Quiz />
      <SuccessStories />
      <MarketInsights />
      <Footer />
      <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
