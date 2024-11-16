// src/components/DocumentList.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";  // Import Navbar
import { auth, db } from "../firebase"; 
import { saveDocument } from "./firestore";
import { collection, query, where, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import "./DocumentList.css"; // Import the CSS file

const DocumentList = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [docId, setDocId] = useState(""); // New: Store unique document ID
  const [content, setContent] = useState(""); // New: Store document content
  const [loading, setLoading] = useState(true); 
  // const [sharedWith, setSharedWith] = useState([
  //   { email: "example@domain.com", permission: "view" },
  //   { email: "another@domain.com", permission: "edit" }
  // ]);

  // const navigate = useNavigate();
  // const [documents, setDocuments] = useState([]); 

  const createNewDocument = () => {
    const newDocId = `doc-${Date.now()}`; // Generate a new ID for each document
    setDocId(newDocId);
    setContent("<Quill formatted content>"); // Default content
    navigate(`/editor/${newDocId}`);
  };

   // Function to edit an existing document
   const editDocument = (id) => {
    navigate(`/editor/${id}`);
  };

  // useEffect(() => {
  //   const fetchDocuments = async () => {
  //     const user = auth.currentUser;
  //     if (user) {
  //       // Create a query to filter documents shared with the user
  //       const q = query(
  //         collection(db, "documents"), // Reference to "documents" collection
  //         where("sharedWith.email", "==", user.email) // Query condition
  //       );
        
  //       // Execute the query and get the documents
  //       const querySnapshot = await getDocs(q);
  //       const docs = querySnapshot.docs.map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       }));
  //       setDocuments(docs); // Update the state with documents
  //     }
  //   };

  //   fetchDocuments();
  // }, []);
  
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const docQuery = query(
        collection(db, "documents"),
        where("owner", "==", user.email)
      );

      const unsubscribe = onSnapshot(docQuery, (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDocuments(docs);
        setLoading(false);

      });

      return () => unsubscribe();
    }
  }, []);

  const deleteDocument = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this document?");
    if (confirmed) {
      await deleteDoc(doc(db, "documents", id));
      setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== id));
    }
  };

  // Function to handle saving the document
  // const handleSaveDocument = async () => {
  //     if (!docId) {
  //       alert("Please specify a document ID");
  //       return;
  //     }
  //     await saveDocument(docId, content, sharedWith);
  //     alert("Document saved with sharedWith permissions!");
  //   };

   // Auto-save with debounce
  //  useEffect(() => {
  //   if (docId !== "new") {
  //     db.collection("documents").doc(docId).get().then((doc) => {
  //       if (doc.exists) {
  //         const data = doc.data();
  //         setDocumentData(data);
  
  //         // If content was stored as a string (from JSON.stringify())
  //         const content = JSON.parse(data.content); // Convert back to Delta
  
  //         // Set content in Quill editor
  //         quill.setContents(content);
  //       }
  //     });
  //   }
  // }, [docId, quill]);

  // Auto-save document content in Firestore
  const saveDocument = async () => {
    const user = auth.currentUser;
    if (user && docId) {
      const docRef = doc(db, "documents", docId);
      await setDoc(docRef, {
        content: content,
        lastEdited: serverTimestamp(), // Add a timestamp for when the document was last edited
        owner: user.email,
      });
      alert("Document saved successfully!");
    }
  };

  const handleContentChange = (newContent) => {
    setContent(newContent); // Update content state, triggering the auto-save
  };

  return (
    <div className="document-list-page">
     <Navbar />
      {/* Main Content */}
      <div className="content">
        <h2>Your Documents</h2>
        <button className="create-button" onClick={createNewDocument}>
          + Create New Document
        </button>
{/*         
        <div className="document-input">
          <input
            type="text"
            placeholder="Document ID"
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter document content"
          />
          <button onClick={handleSaveDocument}>Save Document</button>
        </div> */}
         
         {loading ? (
          <p>Loading documents...</p>
        ) : documents.length === 0 ? (
          <p className="no-documents-message">No documents created yet.</p>
        ) : (
          <ul className="document-list">
            {documents.map((doc) => (
              <li key={doc.id} className="document-item">
                <span className="document-name" onClick={() => editDocument(doc.id)}>
                  {doc.name}
                </span>
                <span className="document-date">
                  Last Edited: {new Date(doc.lastEdited.seconds * 1000).toLocaleString()}
                </span>
                <button className="edit-button" onClick={() => editDocument(doc.id)}>
                  Edit
                </button>
                <button className="delete-button" onClick={() => deleteDocument(doc.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}

          {/* Editor with auto-save functionality
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start typing..."
        /> */}
      </div>
    </div>
  );
};

export default DocumentList;
