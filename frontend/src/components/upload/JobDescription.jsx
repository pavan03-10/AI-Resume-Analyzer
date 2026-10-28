import {
  ClipboardList,
  ClipboardPaste,
  Trash2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function JobDescription({
  jobDescription,
  setJobDescription,
}) {
  const handleClear = () => {
    setJobDescription("");
    toast.success("Job description cleared.");
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJobDescription(text);

      toast.success("Job description pasted successfully.");
    } catch (error) {
      console.error(error);

      toast.error("Clipboard access denied.", {
        description:
          "Please allow clipboard permissions in your browser.",
      });
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Job Description
          </h2>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Paste the job description to compare it with your resume.
          </p>
        </div>

        <div className="flex gap-3">

          {/* Paste */}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePaste}
            className="
              rounded-xl
              border-violet-300
              bg-violet-50
              text-violet-700
              hover:bg-violet-100
              hover:text-violet-800
              transition-all
              dark:border-violet-700
              dark:bg-violet-900/30
              dark:text-violet-300
              dark:hover:bg-violet-900/50
              dark:hover:text-violet-200
            "
          >
            <ClipboardPaste className="mr-2 h-4 w-4" />
            Paste
          </Button>

          {/* Clear */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="
              rounded-xl
              border-red-300
              bg-red-50
              text-red-600
              hover:bg-red-100
              hover:text-red-700
              transition-all
              dark:border-red-800
              dark:bg-red-900/20
              dark:text-red-300
              dark:hover:bg-red-900/40
            "
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>

        </div>

      </div>

      {/* Textarea */}
      <div className="relative">

        <ClipboardList className="absolute left-5 top-5 h-5 w-5 text-slate-400" />

        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          maxLength={5000}
          placeholder={`Paste the complete job description...

Example:
• Responsibilities
• Required Skills
• Qualifications
• Experience
• Technologies
• Certifications
• Preferred Skills`}
          className="
            min-h-[300px]
            w-full
            resize-none
            rounded-2xl
            border
            border-slate-300
            bg-slate-50
            py-5
            pl-14
            pr-5
            text-sm
            leading-6
            text-slate-700
            placeholder:text-slate-400
            outline-none
            transition-all
            duration-300

            focus:border-violet-500
            focus:bg-white
            focus:ring-4
            focus:ring-violet-100

            dark:border-slate-700
            dark:bg-slate-800
            dark:text-slate-200
            dark:placeholder:text-slate-500
            dark:focus:bg-slate-800
            dark:focus:ring-violet-900/30
          "
        />

      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between">

        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Info className="h-4 w-4" />

          <span>
            Include responsibilities, skills, qualifications and technologies.
          </span>
        </div>

        <span
          className={`text-sm font-semibold ${
            jobDescription.length >= 4500
              ? "text-red-500"
              : jobDescription.length >= 3500
              ? "text-amber-500"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {jobDescription.length} / 5000
        </span>

      </div>

    </div>
  );
}