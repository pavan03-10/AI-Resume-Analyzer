import { useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export default function ResumeUpload({
  resumeFile,
  setResumeFile,
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const validateAndUpload = (file) => {
    if (!file) return;

    const fileName = file.name?.toLowerCase() || "";

    const isPdf =
      file.type === "application/pdf" ||
      fileName.endsWith(".pdf");

    // File type validation
    if (!isPdf) {
      toast.error("Invalid file type", {
        description: "Please upload your resume in PDF format.",
      });
      return;
    }

    // Empty file validation
    if (file.size <= 0) {
      toast.error("Empty file", {
        description: "The selected resume file appears to be empty.",
      });
      return;
    }

    // File size validation
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large", {
        description:
          "Maximum allowed file size is 10 MB.",
      });
      return;
    }

    setResumeFile(file);

    toast.success("Resume uploaded successfully!", {
      description: file.name,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    validateAndUpload(file);

    // Allow selecting the same file again
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];

    validateAndUpload(file);
  };

  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Resume Upload
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Upload your latest resume to begin AI-powered ATS analysis.
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`group flex flex-1 flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 transition-all duration-300 ${
          isDragging
            ? "scale-[1.02] border-violet-500 bg-violet-100/50 shadow-xl dark:bg-violet-900/20"
            : "border-slate-300 bg-gradient-to-br from-slate-50 via-white to-violet-50 hover:border-violet-500 hover:shadow-lg dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-violet-950/30"
        }`}
      >
        {/* Icon */}
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg transition-all duration-300 group-hover:scale-110 dark:bg-slate-800">
          {resumeFile ? (
            <CheckCircle2 className="h-11 w-11 text-green-500" />
          ) : (
            <UploadCloud className="h-11 w-11 text-violet-600 dark:text-violet-400" />
          )}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
          {resumeFile
            ? "Resume Uploaded"
            : "Drag & Drop Resume"}
        </h3>

        {/* Description */}
        <p className="mt-3 max-w-md break-all text-center text-sm leading-6 text-slate-500 dark:text-slate-400">
          {resumeFile
            ? resumeFile.name
            : "Drag your resume here or click the button below to browse your files."}
        </p>

        {/* File Type Badge */}
        <div className="mt-6 flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 dark:border-green-900/40 dark:bg-green-900/20">
          <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />

          <span className="text-xs font-medium text-green-700 dark:text-green-300">
            PDF • Max 10 MB
          </span>
        </div>

        {/* Browse Button */}
        <Button
          type="button"
          onClick={handleBrowse}
          className="mt-8 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-6 text-base font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
        >
          <FileText className="mr-2 h-5 w-5" />

          {resumeFile
            ? "Replace Resume"
            : "Browse Files"}
        </Button>
      </div>
    </div>
  );
}