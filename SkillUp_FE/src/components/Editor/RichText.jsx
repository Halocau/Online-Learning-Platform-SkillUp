// src/components/common/RichTextEditor.jsx
import { useRef, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Bold,
  Essentials,
  Italic,
  Paragraph,
  Undo,
  Heading,
  Link,
  List,
  Table,
  TableToolbar,
  Alignment,
  Font,
  Indent,
  IndentBlock,
  BlockQuote,
  Code,
  CodeBlock,
  RemoveFormat,
  SourceEditing,
  Underline,
  Strikethrough,
  SpecialCharacters,
  SpecialCharactersEssentials,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";
import "./RichTextEditor.css";

function RichTextEditor({
  value = "",
  onChange,
  onReady,
  placeholder = "Nhập nội dung...",
  minHeight = 300,
  maxHeight = 600,
  disabled = false,
  className = "",
}) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getData()) {
      editorRef.current.setData(value);
    }
  }, [value]);

  const editorConfig = {
    licenseKey: "GPL",
    toolbar: {
      items: [
        "undo",
        "redo",
        "|",
        "heading",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        "link",
        "insertTable",
        "blockQuote",
        "codeBlock",
        "|",
        "bulletedList",
        "numberedList",
        "outdent",
        "indent",
        "|",
        "alignment",
        "fontSize",
        "fontColor",
        "fontBackgroundColor",
        "|",
        "specialCharacters",
        "|",
        "removeFormat",
        "sourceEditing",
      ],
      shouldNotGroupWhenFull: true,
    },
    plugins: [
      Bold,
      Essentials,
      Italic,
      Paragraph,
      Undo,
      Heading,
      Link,
      List,
      Table,
      TableToolbar,
      Alignment,
      Font,
      Indent,
      IndentBlock,
      BlockQuote,
      Code,
      CodeBlock,
      RemoveFormat,
      SourceEditing,
      Underline,
      Strikethrough,
      SpecialCharacters,
      SpecialCharactersEssentials,
    ],
    heading: {
      options: [
        {
          model: "paragraph",
          title: "Paragraph",
          class: "ck-heading_paragraph",
        },
        {
          model: "heading1",
          view: "h1",
          title: "Heading 1",
          class: "ck-heading_heading1",
        },
        {
          model: "heading2",
          view: "h2",
          title: "Heading 2",
          class: "ck-heading_heading2",
        },
        {
          model: "heading3",
          view: "h3",
          title: "Heading 3",
          class: "ck-heading_heading3",
        },
      ],
    },
    table: {
      contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
    },
    fontSize: {
      options: [10, 12, 14, "default", 18, 20, 24],
    },
    fontColor: {
      colors: [
        { color: "rgb(0, 0, 0)", label: "Black" },
        { color: "rgb(77, 77, 77)", label: "Dark grey" },
        { color: "rgb(153, 153, 153)", label: "Grey" },
        { color: "rgb(255, 0, 0)", label: "Red" },
        { color: "rgb(255, 165, 0)", label: "Orange" },
        { color: "rgb(255, 255, 0)", label: "Yellow" },
        { color: "rgb(0, 128, 0)", label: "Green" },
        { color: "rgb(0, 0, 255)", label: "Blue" },
        { color: "rgb(128, 0, 128)", label: "Purple" },
      ],
    },
    fontBackgroundColor: {
      colors: [
        { color: "rgb(255, 255, 255)", label: "White" },
        { color: "rgb(255, 255, 0)", label: "Yellow" },
        { color: "rgb(255, 165, 0)", label: "Orange" },
        { color: "rgb(144, 238, 144)", label: "Light green" },
        { color: "rgb(173, 216, 230)", label: "Light blue" },
      ],
    },
    placeholder,
  };

  const handleReady = (editor) => {
    editorRef.current = editor;

    // Add custom math symbols
    addCustomMathSymbols(editor);

    if (onReady) {
      onReady(editor);
    }
  };

  const handleChange = (event, editor) => {
    const data = editor.getData();
    if (onChange) {
      onChange(data);
    }
  };

  return (
    <div
      className={`rich-text-editor-wrapper ${className}`}
      style={{
        "--editor-min-height": `${minHeight}px`,
        "--editor-max-height": `${maxHeight}px`,
      }}
    >
      <CKEditor
        editor={ClassicEditor}
        config={editorConfig}
        data={value}
        onReady={handleReady}
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
}


function addCustomMathSymbols(editor) {
  const specialCharsPlugin = editor.plugins.get("SpecialCharacters");


  specialCharsPlugin.addItems("Mathematical", [

    { title: "Squared (²)", character: "²" },
    { title: "Cubed (³)", character: "³" },
    { title: "Superscript 4", character: "⁴" },
    { title: "Superscript 5", character: "⁵" },
    { title: "Superscript 6", character: "⁶" },
    { title: "Superscript 7", character: "⁷" },
    { title: "Superscript 8", character: "⁸" },
    { title: "Superscript 9", character: "⁹" },


    { title: "Subscript 0", character: "₀" },
    { title: "Subscript 1", character: "₁" },
    { title: "Subscript 2", character: "₂" },
    { title: "Subscript 3", character: "₃" },
    { title: "Subscript 4", character: "₄" },
    { title: "Subscript 5", character: "₅" },
    { title: "Subscript 6", character: "₆" },
    { title: "Subscript 7", character: "₇" },
    { title: "Subscript 8", character: "₈" },
    { title: "Subscript 9", character: "₉" },


    { title: "Multiplication (×)", character: "×" },
    { title: "Division (÷)", character: "÷" },
    { title: "Plus-minus (±)", character: "±" },
    { title: "Not equal (≠)", character: "≠" },
    { title: "Less than or equal (≤)", character: "≤" },
    { title: "Greater than or equal (≥)", character: "≥" },
    { title: "Approximately equal (≈)", character: "≈" },
    { title: "Square root (√)", character: "√" },
    { title: "Cube root (∛)", character: "∛" },
    { title: "Infinity (∞)", character: "∞" },


    { title: "One half (½)", character: "½" },
    { title: "One third (⅓)", character: "⅓" },
    { title: "Two thirds (⅔)", character: "⅔" },
    { title: "One quarter (¼)", character: "¼" },
    { title: "Three quarters (¾)", character: "¾" },
  ]);


  specialCharsPlugin.addItems("Greek Letters", [
    { title: "Alpha (α)", character: "α" },
    { title: "Beta (β)", character: "β" },
    { title: "Gamma (γ)", character: "γ" },
    { title: "Delta (δ)", character: "δ" },
    { title: "Epsilon (ε)", character: "ε" },
    { title: "Theta (θ)", character: "θ" },
    { title: "Lambda (λ)", character: "λ" },
    { title: "Mu (μ)", character: "μ" },
    { title: "Pi (π)", character: "π" },
    { title: "Sigma (σ)", character: "σ" },
    { title: "Tau (τ)", character: "τ" },
    { title: "Phi (φ)", character: "φ" },
    { title: "Omega (ω)", character: "ω" },
    { title: "Delta capital (Δ)", character: "Δ" },
    { title: "Sigma capital (Σ)", character: "Σ" },
    { title: "Omega capital (Ω)", character: "Ω" },
  ]);


  specialCharsPlugin.addItems("Arrows", [
    { title: "Right arrow (→)", character: "→" },
    { title: "Left arrow (←)", character: "←" },
    { title: "Up arrow (↑)", character: "↑" },
    { title: "Down arrow (↓)", character: "↓" },
    { title: "Left-right arrow (↔)", character: "↔" },
    { title: "Double right arrow (⇒)", character: "⇒" },
    { title: "Double left-right (⇔)", character: "⇔" },
    { title: "Equilibrium (⇌)", character: "⇌" },
  ]);


  specialCharsPlugin.addItems("Geometry", [
    { title: "Degree (°)", character: "°" },
    { title: "Angle (∠)", character: "∠" },
    { title: "Perpendicular (⊥)", character: "⊥" },
    { title: "Parallel (∥)", character: "∥" },
    { title: "Triangle (△)", character: "△" },
  ]);
}

export default RichTextEditor;
