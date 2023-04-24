import "./components/worker";
import Editor from "./components/editor";
import "./style.css";

const editor = new Editor(document.getElementById("editor")!);

window.addEventListener("resize", () => {
  editor.layout();
})