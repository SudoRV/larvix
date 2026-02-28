import { useState } from "react";
import Editor from "@monaco-editor/react";

export default function CodeBlock({ language = "javascript", code }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(code);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
  };

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900 shadow-lg">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b border-zinc-700">
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
          {language}
        </span>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="text-xs px-3 py-1 rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition"
          >
            Copy
          </button>

          <button
            onClick={() => setEditing(!editing)}
            className="text-xs px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition"
          >
            {editing ? "Lock" : "Edit"}
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <Editor
        height={editing ? "300px" : "200px"}
        defaultLanguage={language}
        value={value}
        theme="vs-dark"
        onChange={(val) => editing && setValue(val)}
        options={{
          readOnly: !editing,
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          wordWrap: "on",
        }}
      />

      {editing && (
        <div className="flex justify-end p-3 bg-zinc-950 border-t border-zinc-800">
          <button
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}