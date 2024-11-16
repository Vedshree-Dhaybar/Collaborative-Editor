// src/components/Editor.js
import React, { useEffect, useState, useRef } from "react";
import Navbar from "./Navbar";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase"; // Assuming Firestore is set up for auto-saving
import { doc, getDoc, setDoc, updateDoc, arrayUnion, collection, addDoc } from "firebase/firestore";
import "./Editor.css";

const Editor = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  // const [quill, setQuill] = useState(null);
  const [documentData, setDocumentData] = useState({});
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("view");
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (quillRef.current) return; // Prevent re-initialization of Quill if already initialized

    // Initialize Quill editor only once
    const editor = new Quill(editorRef.current, {
      theme: "snow",
      placeholder: "Start typing your document here...",
      modules: { toolbar: [["bold", "italic", "underline"], ["link", "code-block"]] },
    });
    quillRef.current = editor;

     // Check if creating a new document or loading an existing one
    if (documentId === "new") {
      const newDoc = {
        title: "Untitled Document",
        content: editor.getContents(),
        owner: auth.currentUser?.email,
        lastEdited: new Date(),
        sharedWith: [], // Initial empty shared list
      };

      // Create a new document and navigate to its editor page
      addDoc(collection(db, "documents"), newDoc).then((docRef) => {
        navigate(`/editor/${docRef.id}`);
      });
    } else {
      // Load existing document data
      const docRef = doc(db, "documents", documentId);
      const fetchData = async () => {
        const docSnap = await getDoc(docRef); // Using the correct Firestore v9+ method
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDocumentData(data);
          editor.setContents(data.content);

          // Check permissions for the current user
          const userPermission = data.sharedWith?.find(
            (entry) => entry.email === auth.currentUser?.email
          );
          if (userPermission && userPermission.permission === "view") {
            editor.disable(); // Disable editing for view-only access
          }
        } else {
          console.log("No such document!");
        }
      };

      fetchData();
    }
  }, [documentId, navigate]);

  // Auto-save at 3-second intervals
  useEffect(() => {
    if (!quillRef.current || !documentId) return;

    const interval = setInterval(async () => {
      if (isSaving) return;  // Avoid multiple save requests in quick succession

      setIsSaving(true);  // Start saving process

      try {
        const documentRef = doc(db, "documents", documentId);
        await updateDoc(documentRef, {
          content: JSON.stringify(quillRef.current.getContents()), // Convert Delta to string
          lastEdited: new Date(),
        });
        console.log("Document auto-saved!");
      } catch (error) {
        console.error("Error saving document:", error);
      } finally {
        setIsSaving(false);  // Reset saving state
      }
    }, 3000); // Auto-save every 3 seconds

    return () => clearInterval(interval);
  }, [documentId, isSaving]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const documentRef = doc(db, "documents", documentId);
      await updateDoc(documentRef, {
        content: JSON.stringify(quillRef.current.getContents()),
        lastEdited: new Date(),
      });
      console.log("Document manually saved!");
    } catch (error) {
      console.error("Error saving document:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Share document with permission
  const handleShare = async (email, permission) => {
    const docRef = doc(db, "documents", documentId);
    try {
      await updateDoc(docRef, {
        sharedWith: arrayUnion({ email, permission }),
      });

      // Send email logic (need to use Firebase Functions or another service for actual email sending)
      alert(`Document shared with ${email} with ${permission} access.`);

      // Example: using Firebase functions or SendGrid to send email:
      // You need to implement this functionality separately.

    } catch (error) {
      console.error("Error sharing document:", error);
    }
  };
  return (
    <div className="editor-page">
      <Navbar />
      <div className="editor-container">
        <h2>{documentData.title || "Untitled Document"}</h2>
        <div ref={editorRef} className="quill-editor"></div>

        <div className="share-section">
          <input
            type="email"
            placeholder="Enter email to share with"
            onChange={(e) => setEmail(e.target.value)}
          />
           <select value={permission} onChange={(e) => setPermission(e.target.value)}>
            <option value="view">View (Read-only)</option>
            <option value="edit">Edit</option>
          </select>
          <button onClick={() => handleShare(email, permission)}>Share</button>
        </div>

        <div className="save-section">
          <button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Editor;
