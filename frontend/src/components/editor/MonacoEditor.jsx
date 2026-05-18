import Editor from "@monaco-editor/react";

export default function MonacoEditor({
  language,
  code,
  setCode,
}) {

  return (
    <Editor
      height="100%"
      language={language}
      value={code}
      theme="vs-dark"
      onChange={(value) =>
        setCode(value)
      }
    />
  );
}