import { useState, useRef, useEffect } from "react";

function App() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [isPreview, setIsPreview] = useState(false); // Preview state
  const editorRef = useRef(null);

  const createNewNote = () => {
    const newNote = {
      id: Date.now(),
      title: "Untitled Note",
      content: "",
    };
    setNotes([newNote, ...notes]);
    setActiveNote(newNote.id);
    setIsPreview(false);
  };

  const deleteNote = (id) => {
    const filteredNotes = notes.filter((note) => note.id !== id);
    setNotes(filteredNotes);
    if (activeNote === id) {
      setActiveNote(filteredNotes.length ? filteredNotes[0].id : null);
    }
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === activeNote
          ? {
              ...note,
              content: html,
              title: html.replace(/<[^>]*>?/gm, "").slice(0, 15) || "Untitled Note",
            }
          : note
      )
    );
  };

  useEffect(() => {
    if (activeNote && editorRef.current && !isPreview) {
      const currentNote = notes.find((n) => n.id === activeNote);
      if (currentNote && editorRef.current.innerHTML !== currentNote.content) {
        editorRef.current.innerHTML = currentNote.content;
      }
    }
  }, [activeNote, isPreview]);

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    handleInput();
  };

  const insertImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => formatText("insertImage", reader.result);
    reader.readAsDataURL(file);
  };

  if (notes.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">You have no notes</h1>
        <button
          onClick={createNewNote}
          className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-3 rounded-full text-xl font-semibold shadow-lg"
        >
          Create one now
        </button>
      </div>
    );
  }

  const activeNoteData = notes.find((note) => note.id === activeNote);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 bg-white border-r flex flex-col">
          <div className="flex items-center justify-between p-5 border-b">
            <h1 className="text-2xl font-black italic">NOTES <span className="text-blue-500">●</span></h1>
            <button onClick={createNewNote} className="bg-blue-500 text-white w-8 h-8 rounded-full font-bold">+</button>
          </div>
          <div className="overflow-y-auto flex-1">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => { setActiveNote(note.id); setIsPreview(false); }}
                className={`p-4 cursor-pointer border-b flex justify-between items-center ${activeNote === note.id ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`}
              >
                <div className="truncate pr-2">
                  <h2 className="font-bold text-sm">{note.title}</h2>
                  <p className={`text-xs truncate ${activeNote === note.id ? "text-blue-100" : "text-gray-400"}`}>
                    {note.content.replace(/<[^>]*>?/gm, "") || "Empty..."}
                  </p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} className="text-lg">🗑</button>
              </div>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-white">
          {activeNoteData ? (
            <>
              {/* Toolbar */}
              <div className="border-b p-2 flex gap-2 bg-white items-center px-4 shadow-sm">
                <button 
                  onClick={() => setIsPreview(false)} 
                  className={`px-3 py-1 text-sm font-semibold rounded ${!isPreview ? "bg-blue-100 text-blue-600" : "text-gray-500"}`}
                >
                  Write
                </button>
                <button 
                  onClick={() => setIsPreview(true)} 
                  className={`px-3 py-1 text-sm font-semibold rounded ${isPreview ? "bg-blue-100 text-blue-600" : "text-gray-500"}`}
                >
                  Preview
                </button>
                
                {!isPreview && (
                  <>
                    <div className="h-6 w-[1px] bg-gray-200 mx-1" />
                    <button title="Bold" onClick={() => formatText("bold")} className="p-2 hover:bg-gray-100 font-bold">B</button>
                    <button title="Italic" onClick={() => formatText("italic")} className="p-2 hover:bg-gray-100 italic">I</button>
                    <button title="Bullet List" onClick={() => formatText("insertUnorderedList")} className="p-2 hover:bg-gray-100 font-bold">UL</button>
                    <button title="Numbered List" onClick={() => formatText("insertOrderedList")} className="p-2 hover:bg-gray-100 font-bold">OL</button>
                    <label className="p-2 hover:bg-gray-100 cursor-pointer">
                      📷 <input type="file" hidden accept="image/*" onChange={insertImage} />
                    </label>
                  </>
                )}
              </div>

              {/* Editable or Preview Area */}
              <div className="flex-1 p-8 md:p-12 overflow-auto bg-gray-50">
                {isPreview ? (
                  <div 
                    className="max-w-4xl mx-auto bg-white p-10 shadow-md rounded prose lg:prose-xl custom-list"
                    dangerouslySetInnerHTML={{ __html: activeNoteData.content }}
                  />
                ) : (
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning={true}
                    onInput={handleInput}
                    className="max-w-4xl mx-auto min-h-[500px] outline-none text-lg bg-white p-10 border rounded shadow-sm custom-list"
                  ></div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300">Select a note</div>
          )}
        </div>
      </div>

      {/* List Style Fix (Tailwind lists hide by default) */}
      <style>{`
        .custom-list ul { list-style-type: disc !important; padding-left: 2rem !important; margin: 1rem 0; }
        .custom-list ol { list-style-type: decimal !important; padding-left: 2rem !important; margin: 1rem 0; }
        .custom-list li { display: list-item !important; }
        .custom-list img { max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; }
      `}</style>
    </div>
  );
}

export default App;