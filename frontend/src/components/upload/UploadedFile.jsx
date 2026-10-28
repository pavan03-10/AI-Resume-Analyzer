import { FileText, CheckCircle2 } from "lucide-react";

export default function UploadedFile({ resumeFile }) {
  if (!resumeFile) return null;

  const fileSize = (resumeFile.size / (1024 * 1024)).toFixed(2);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100">
            <FileText className="h-7 w-7 text-violet-600" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {resumeFile.name}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {fileSize} MB • Uploaded successfully
            </p>
          </div>

        </div>

        <div className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />

          <span className="text-sm font-medium text-green-700">
            Ready
          </span>
        </div>

      </div>
    </div>
  );
}