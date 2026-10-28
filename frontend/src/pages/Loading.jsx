import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import AnalysisLoader from "@/components/loading/AnalysisLoader";

export default function Loading() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      toast.success("Analysis Completed!", {
        description: "Your ATS report is ready.",
      });

      navigate("/results");
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return <AnalysisLoader />;
}