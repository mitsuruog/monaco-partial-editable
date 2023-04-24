import * as monaco from "monaco-editor";

const value = `function main(lines: string[]) {
  /**
   * このコードは標準入力と標準出力を用いたサンプルコードです。
   * このコードは好きなように編集・削除してもらって構いません。
   *
   * This is a sample code to use stdin and stdout.
   * You can edit and even remove this code as you like.
  */
  lines.forEach((v, i) => console.log(\`lines[\${i}]: \${v}\`));
}

function readFromStdin(): Promise<string[]> {
  return new Promise(resolve => {
    let data: string = "";
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", d => {
      data += d;
    });
    process.stdin.on("end", () => {
      resolve(data.split("\\n"));
    });
  })
}

readFromStdin().then(main)`;

const ReadOnlyLines = [
  { startLine: 1, endLine: 1 },
  { startLine: 10, endLine: 27 },
];

class Editor {
  private editor: monaco.editor.IStandaloneCodeEditor;
  private model: monaco.editor.ITextModel;
  private lineCount: number;

  constructor(el: HTMLElement) {
    const uri = monaco.Uri.parse("file:///main.ts");
    this.model = monaco.editor.createModel(value, "typescript", uri);

    this.lineCount = this.model.getLineCount();

    this.editor = monaco.editor.create(el, {
      theme: "vs-dark",
      language: "typescript",
      glyphMargin: true,
      model: this.model,
    });

    const decorations = this.editor.createDecorationsCollection();

    decorations.set(
      ReadOnlyLines.map(({ startLine, endLine }) => {
        return {
          range: new monaco.Range(startLine, 1, endLine, 1),
          options: {
            isWholeLine: true,
            className: "bg-gray-900",
            glyphMarginClassName: "bg-yellow-500 rounded-full"
          },
        };
      })
    );

    this.editor.onDidChangeCursorSelection(({ selection }) => {
      const readOnly = ReadOnlyLines.some(({ startLine, endLine }) => {
        const range = new monaco.Range(
          startLine,
          1,
          endLine,
          this.model.getLineMaxColumn(endLine)
        );

        return range.containsRange(selection);
      });
      this.editor.updateOptions({ readOnly });
    });

    this.editor.onDidChangeModelContent(() => {
      // adjust line count to update readonly range
      const lineCount = this.model.getLineCount();
      if (this.lineCount !== lineCount) {
        const diff = this.lineCount - lineCount;
        const [, rest] = ReadOnlyLines;
        ReadOnlyLines[1] = {
          startLine: rest.startLine - diff,
          endLine: rest.endLine - diff,
        };
        this.lineCount = lineCount;
      }
    });
  }

  layout = () => {
    this.editor.layout();
  };
}

export default Editor;
