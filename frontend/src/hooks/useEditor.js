import {
  useState,
} from "react";

export default function useEditor() {

  // language
  const [language, setLanguage] =
    useState("javascript");

  // editor code
  const [code, setCode] =
    useState(
      `console.log("CodeCollab");`
    );

  // console input
  const [input, setInput] =
    useState("");

  // console output
  const [output, setOutput] =
    useState("");

  // files
  const [files, setFiles] =
    useState([
      {
        name: "main.js",
      },
    ]);

  // active file
  const [activeFile, setActiveFile] =
    useState({
      name: "main.js",
    });

  // create file
  const createFile =
    (fileName) => {

      if (!fileName) return;

      const exists =
        files.find(
          (file) =>
            file.name ===
            fileName
        );

      if (exists) return;

      const newFile = {
        name: fileName,
      };

      setFiles([
        ...files,
        newFile,
      ]);

      setActiveFile(
        newFile
      );
    };

  // delete file
  const deleteFile =
    (fileName) => {

      const updated =
        files.filter(
          (file) =>
            file.name !==
            fileName
        );

      setFiles(updated);

      if (
        activeFile?.name ===
        fileName
      ) {

        setActiveFile(
          updated[0] || null
        );
      }
    };

  return {

    // editor
    language,
    setLanguage,

    code,
    setCode,

    input,
    setInput,

    output,
    setOutput,

    // files
    files,
    setFiles,

    activeFile,
    setActiveFile,

    createFile,
    deleteFile,
  };
}